import { randomUUID } from "node:crypto"
import { db } from "@/lib/db"
import {
  HttpError,
  createSession,
  findUserByEmail,
  findUserByIdentifier,
  hashPassword,
  mapUser,
  verifyPassword,
  type Session,
} from "@/lib/auth"
import { mapTransaction, type TransactionRow } from "@/lib/transaction-mapper"
import { currency, type AccountStatus, type BankUser, type Beneficiary } from "@/lib/bank"
import { notifyAdmin, sendCredentialsEmail, transferNotification } from "@/lib/email"

type UserRow = {
  id: string
  name: string
  email: string
  username: string | null
  password_hash: string
  role: "user" | "admin"
  account_number: string
  balance_cents: number
  status: AccountStatus
  phone: string | null
  dob: string | null
  created_at: string
  deleted_at: string | null
}

export type Result<T = void> = (T extends void ? { ok: true } : { ok: true } & T) | { ok: false; error: string }

export type StatePayload = {
  currentUser: BankUser | null
  impersonatorId: string | null
  users: BankUser[]
  transactions: ReturnType<typeof mapTransaction>[]
}

const id = (prefix: string) => `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 12)}`
const toCents = (amount: number) => Math.round(amount * 100)
const reference = (prefix: string) => `${prefix}-${randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`

export async function loadState(user: BankUser | null, impersonatorId: string | null): Promise<StatePayload> {
  if (!user) return { currentUser: null, impersonatorId: null, users: [], transactions: [] }

  const isAdmin = user.role === "admin"

  const userResult = await db.execute({
    sql: isAdmin
      ? "SELECT * FROM users ORDER BY created_at DESC"
      : "SELECT * FROM users WHERE id = ?",
    args: isAdmin ? [] : [user.id],
  })

  const txResult = await db.execute({
    sql: isAdmin
      ? "SELECT * FROM transactions ORDER BY booked_at DESC"
      : "SELECT * FROM transactions WHERE user_id = ? ORDER BY booked_at DESC",
    args: isAdmin ? [] : [user.id],
  })

  return {
    currentUser: user,
    impersonatorId,
    users: (userResult.rows as unknown as UserRow[]).map(mapUser),
    transactions: (txResult.rows as unknown as TransactionRow[]).map(mapTransaction),
  }
}

async function getUserRow(userId: string) {
  const result = await db.execute({ sql: "SELECT * FROM users WHERE id = ? LIMIT 1", args: [userId] })
  return (result.rows[0] as unknown as UserRow | undefined) ?? null
}

/* ------------------------------------------------------------------ auth */

export async function login(identifier: string, password: string) {
  const row = await findUserByIdentifier(identifier)
  const invalid = { ok: false as const, error: "Username, email or password is incorrect." }
  if (!row) return invalid
  if (!(await verifyPassword(password, row.password_hash))) return invalid
  if (row.status !== "Active") {
    return { ok: false as const, error: "This account is not active. Please contact the bank." }
  }

  await createSession(row.id)
  const user = mapUser(row)
  return { ok: true as const, user, state: await loadState(user, null) }
}

export async function startImpersonation(session: Session, customerId: string) {
  if (session.user.role !== "admin") throw new HttpError(403, "Administrator access required.")
  const customer = await getUserRow(customerId)
  if (!customer || customer.role !== "user") return { ok: false as const, error: "Customer not found." }

  await createSession(customerId, session.user.id)
  const user = mapUser(customer)
  return { ok: true as const, user, state: await loadState(user, session.user.id) }
}

export async function stopImpersonation(session: Session) {
  if (!session.impersonatorId) return { ok: false as const, error: "Not viewing as another user." }
  const admin = await getUserRow(session.impersonatorId)
  if (!admin || admin.role !== "admin") {
    throw new HttpError(403, "The administrator session is no longer valid.")
  }

  await db.execute({
    sql: "UPDATE sessions SET user_id = ?, impersonator_id = NULL WHERE id = ?",
    args: [admin.id, session.id],
  })

  const user = mapUser(admin)
  return { ok: true as const, user, state: await loadState(user, null) }
}

/* ------------------------------------------------------------- customers */

export async function createCustomer(
  session: Session,
  input: {
    name: string
    email: string
    password: string
    openingBalance: number
    phone?: string
    dob?: string
  },
): Promise<Result> {
  if (session.user.role !== "admin") throw new HttpError(403, "Administrator access required.")

  const name = input.name.trim()
  const email = input.email.trim().toLowerCase()

  if (name.length < 2) return { ok: false, error: "Enter the customer's full name." }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Enter a valid email address." }
  if (await findUserByEmail(email)) return { ok: false, error: "A customer with that email already exists." }
  if (input.password.length < 6) return { ok: false, error: "Password must be at least 6 characters." }
  if (!Number.isFinite(input.openingBalance) || input.openingBalance < 0) {
    return { ok: false, error: "Opening balance must be zero or more." }
  }

  const userId = id("usr")
  const cents = toCents(input.openingBalance)
  const now = new Date().toISOString()
  const username = await makeUsername(email)
  const tx = await db.transaction("write")

  try {
    await tx.execute({
      sql: `INSERT INTO users (id, name, email, username, password_hash, role, account_number, balance_cents, status, phone, dob, created_at)
            VALUES (?, ?, ?, ?, ?, 'user', ?, ?, 'Active', ?, ?, ?)`,
      args: [
        userId,
        name,
        email,
        username,
        await hashPassword(input.password),
        makeAccountNumber(),
        cents,
        input.phone?.trim() || null,
        input.dob?.trim() || null,
        now,
      ],
    })

    if (cents > 0) {
      await tx.execute({
        sql: `INSERT INTO transactions (id, user_id, type, direction, description, amount_cents, status, booked_at, reference, source)
              VALUES (?, ?, 'deposit', 'in', 'Opening deposit', ?, 'Completed', ?, ?, 'Set up by administrator')`,
        args: [id("tx"), userId, cents, now, reference("DEP")],
      })
    }

    await tx.commit()
  } catch (error) {
    await tx.rollback()
    throw error
  } finally {
    tx.close()
  }

  await sendCredentialsEmail({ to: email, name, password: input.password, temporary: true })
  await notifyAdmin({
    action: "Customer account created",
    actor: session.user.name,
    details: `${name} (${email}) · opening balance ${currency(input.openingBalance)}`,
  })

  return { ok: true }
}

export async function updateCustomer(
  session: Session,
  userId: string,
  updates: Partial<Pick<BankUser, "name" | "email" | "phone" | "dob" | "accountNumber">> & { password?: string },
): Promise<Result> {
  const isAdmin = session.user.role === "admin"
  if (!isAdmin && session.user.id !== userId) throw new HttpError(403, "You can only edit your own profile.")

  const target = await getUserRow(userId)
  if (!target) return { ok: false, error: "Customer not found." }

  const fields: string[] = []
  const args: (string | null)[] = []

  if (updates.name !== undefined) {
    const name = updates.name.trim()
    if (name.length < 2) return { ok: false, error: "Enter the customer's full name." }
    fields.push("name = ?")
    args.push(name)
  }

  if (updates.email !== undefined) {
    const email = updates.email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Enter a valid email address." }
    const existing = await findUserByEmail(email)
    if (existing && existing.id !== userId) return { ok: false, error: "A customer with that email already exists." }
    fields.push("email = ?")
    args.push(email)
  }

  if (updates.phone !== undefined) {
    fields.push("phone = ?")
    args.push(updates.phone?.trim() || null)
  }

  if (updates.dob !== undefined) {
    fields.push("dob = ?")
    args.push(updates.dob?.trim() || null)
  }

  if (updates.accountNumber !== undefined && isAdmin) {
    fields.push("account_number = ?")
    args.push(updates.accountNumber.trim())
  }

  if (updates.password) {
    if (updates.password.length < 6) return { ok: false, error: "Password must be at least 6 characters." }
    fields.push("password_hash = ?")
    args.push(await hashPassword(updates.password))
  }

  if (fields.length === 0) return { ok: true }

  await db.execute({ sql: `UPDATE users SET ${fields.join(", ")} WHERE id = ?`, args: [...args, userId] })

  const actor = target.role === "admin" ? session.user.name : target.name
  const self = session.user.id === userId

  if (updates.password) {
    await sendCredentialsEmail({
      to: (updates.email ?? target.email).trim().toLowerCase(),
      name: updates.name ?? target.name,
      password: updates.password,
      temporary: false,
    })
    await notifyAdmin({
      action: "Password changed by administrator",
      actor,
      details: `${target.name} (${target.email})`,
    })
  }

  if (self && !updates.password) {
    await notifyAdmin({
      action: "Customer updated profile",
      actor,
      details: `${target.name} (${target.email})`,
    })
  }

  return { ok: true }
}

export async function changePassword(
  session: Session,
  currentPassword: string,
  newPassword: string,
): Promise<Result> {
  const target = await getUserRow(session.user.id)
  if (!target) return { ok: false, error: "Account not found." }
  if (!(await verifyPassword(currentPassword, target.password_hash))) {
    return { ok: false, error: "Your current password is incorrect." }
  }
  if (newPassword.length < 6) return { ok: false, error: "Password must be at least 6 characters." }
  if (newPassword === currentPassword) {
    return { ok: false, error: "Choose a password you have not used before." }
  }

  await db.execute({
    sql: "UPDATE users SET password_hash = ? WHERE id = ?",
    args: [await hashPassword(newPassword), target.id],
  })

  await notifyAdmin({
    action: "Customer changed password",
    actor: target.name,
    details: `${target.name} (${target.email}) changed their online banking password.`,
  })

  return { ok: true }
}

export async function resetPassword(
  session: Session,
  userId: string,
  password: string,
): Promise<Result<{ password: string }>> {
  if (session.user.role !== "admin") throw new HttpError(403, "Administrator access required.")
  if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." }

  const target = await getUserRow(userId)
  if (!target) return { ok: false, error: "Customer not found." }

  await db.execute({
    sql: "UPDATE users SET password_hash = ? WHERE id = ?",
    args: [await hashPassword(password), userId],
  })

  await sendCredentialsEmail({ to: target.email, name: target.name, password, temporary: false })
  await notifyAdmin({
    action: "Password reset from admin panel",
    actor: session.user.name,
    details: `${target.name} (${target.email})`,
  })

  return { ok: true, password }
}

export async function setCustomerStatus(session: Session, userId: string, status: AccountStatus): Promise<Result> {
  if (session.user.role !== "admin") throw new HttpError(403, "Administrator access required.")
  const target = await getUserRow(userId)
  if (!target) return { ok: false, error: "Customer not found." }

  await db.execute({
    sql: "UPDATE users SET status = ?, deleted_at = ? WHERE id = ?",
    args: [status, status === "Deleted" ? new Date().toISOString() : null, userId],
  })

  if (status !== "Active") {
    await db.execute({ sql: "DELETE FROM sessions WHERE user_id = ?", args: [userId] })
  }

  return { ok: true }
}

export async function adjustBalance(
  session: Session,
  userId: string,
  amount: number,
  direction: "in" | "out",
  note: string,
): Promise<Result> {
  if (session.user.role !== "admin") throw new HttpError(403, "Administrator access required.")
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: "Enter an amount greater than $0.00." }

  const target = await getUserRow(userId)
  if (!target) return { ok: false, error: "Customer not found." }
  if (direction === "out" && toCents(amount) > target.balance_cents) {
    return { ok: false, error: `Insufficient balance. Available: ${currency(target.balance_cents / 100)}.` }
  }

  const cents = toCents(amount)
  const tx = await db.transaction("write")

  try {
    if (direction === "out") {
      const updated = await tx.execute({
        sql: "UPDATE users SET balance_cents = balance_cents - ? WHERE id = ? AND balance_cents >= ?",
        args: [cents, userId, cents],
      })
      if (updated.rowsAffected === 0) {
        await tx.rollback()
        return { ok: false, error: "Insufficient balance for this debit." }
      }
    } else {
      await tx.execute({
        sql: "UPDATE users SET balance_cents = balance_cents + ? WHERE id = ?",
        args: [cents, userId],
      })
    }

    await tx.execute({
      sql: `INSERT INTO transactions (id, user_id, type, direction, description, amount_cents, status, booked_at, reference, source)
            VALUES (?, ?, ?, ?, ?, ?, 'Completed', ?, ?, 'Administrator adjustment')`,
      args: [
        id("tx"),
        userId,
        direction === "in" ? "credit" : "debit",
        direction,
        note.trim() || (direction === "in" ? "Account credit" : "Account debit"),
        cents,
        new Date().toISOString(),
        reference(direction === "in" ? "CRE" : "DEB"),
      ],
    })

    await tx.commit()
  } catch (error) {
    await tx.rollback()
    throw error
  } finally {
    tx.close()
  }

  return { ok: true }
}

/* -------------------------------------------------------------- payments */

export async function deposit(
  session: Session,
  userId: string,
  amount: number,
  source: string,
  note?: string,
): Promise<Result> {
  if (session.user.role !== "admin" && session.user.id !== userId) {
    throw new HttpError(403, "You can only deposit into your own account.")
  }
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: "Enter a valid amount greater than $0.00." }

  const target = await getUserRow(userId)
  if (!target) return { ok: false, error: "Account not found." }
  if (target.status !== "Active") return { ok: false, error: "This account is suspended. Contact the bank." }

  const cents = toCents(amount)
  const tx = await db.transaction("write")

  try {
    await tx.execute({ sql: "UPDATE users SET balance_cents = balance_cents + ? WHERE id = ?", args: [cents, userId] })
    await tx.execute({
      sql: `INSERT INTO transactions (id, user_id, type, direction, description, amount_cents, status, booked_at, reference, source)
            VALUES (?, ?, 'deposit', 'in', ?, ?, 'Completed', ?, ?, ?)`,
      args: [
        id("tx"),
        userId,
        note?.trim() || `Deposit from ${source}`,
        cents,
        new Date().toISOString(),
        reference("DEP"),
        source,
      ],
    })
    await tx.commit()
  } catch (error) {
    await tx.rollback()
    throw error
  } finally {
    tx.close()
  }

  return { ok: true }
}

export async function initiateTransfer(
  session: Session,
  userId: string,
  input: { amount: number; beneficiary: Beneficiary; note?: string },
): Promise<Result<{ transactionId: string }>> {
  if (session.user.role !== "admin" && session.user.id !== userId) {
    throw new HttpError(403, "You can only transfer from your own account.")
  }

  const { amount, beneficiary, note } = input
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: "Enter a valid amount greater than $0.00." }

  const target = await getUserRow(userId)
  if (!target) return { ok: false, error: "Account not found." }
  if (target.status !== "Active") return { ok: false, error: "This account is suspended. Contact the bank." }
  if (!beneficiary?.name?.trim() || !beneficiary?.iban?.trim()) {
    return { ok: false, error: "Beneficiary name and IBAN are required." }
  }

  const cents = toCents(amount)
  const transactionId = id("tx")
  const tx = await db.transaction("write")

  try {
    const updated = await tx.execute({
      sql: "UPDATE users SET balance_cents = balance_cents - ? WHERE id = ? AND balance_cents >= ?",
      args: [cents, userId, cents],
    })

    if (updated.rowsAffected === 0) {
      await tx.rollback()
      return {
        ok: false,
        error: `Insufficient funds. Available balance: ${currency(target.balance_cents / 100)}.`,
      }
    }

    await tx.execute({
      sql: `INSERT INTO transactions
              (id, user_id, type, direction, description, amount_cents, status, booked_at, reference,
               beneficiary_name, beneficiary_bank, beneficiary_iban, beneficiary_bic)
            VALUES (?, ?, 'transfer', 'out', ?, ?, 'Pending', ?, ?, ?, ?, ?, ?)`,
      args: [
        transactionId,
        userId,
        note?.trim() || `${beneficiary.name.trim()} · international transfer`,
        cents,
        new Date().toISOString(),
        reference("TRF"),
        beneficiary.name.trim(),
        beneficiary.bank?.trim() || null,
        beneficiary.iban.trim(),
        beneficiary.bic?.trim() || null,
      ],
    })

    await tx.commit()
  } catch (error) {
    await tx.rollback()
    throw error
  } finally {
    tx.close()
  }

  await transferNotification({
    actor: target.name,
    amount,
    beneficiary: beneficiary.name.trim(),
    iban: beneficiary.iban.trim(),
  })

  return { ok: true, transactionId }
}

/* ------------------------------------------------------------------- COT */

export async function submitCot(
  session: Session,
  transactionId: string,
  code: string,
): Promise<Result<{ percent: number; reason: string; completed: boolean }>> {
  const result = await db.execute({
    sql: "SELECT * FROM transactions WHERE id = ? LIMIT 1",
    args: [transactionId],
  })
  const tx = result.rows[0] as unknown as TransactionRow | undefined

  if (!tx) return { ok: false, error: "Transaction not found." }
  if (session.user.role !== "admin" && tx.user_id !== session.user.id) {
    throw new HttpError(403, "That transaction does not belong to your account.")
  }
  if (!tx.cot_code) return { ok: false, error: "No COT code has been generated for this transaction yet." }
  if ((code ?? "").trim() !== tx.cot_code) return { ok: false, error: "Invalid COT code." }

  const percent = tx.cot_percent ?? 0
  const completed = percent >= 100

  await db.execute({
    sql: "UPDATE transactions SET cot_submitted_at = ?, status = ? WHERE id = ?",
    args: [new Date().toISOString(), completed ? "Completed" : "Pending", transactionId],
  })

  return { ok: true, percent, reason: tx.cot_reason ?? "", completed }
}

export async function generateCot(
  session: Session,
  transactionId: string,
  code: string,
  percent: number,
  reason: string,
): Promise<Result> {
  if (session.user.role !== "admin") throw new HttpError(403, "Administrator access required.")
  if (!code.trim()) return { ok: false, error: "Enter a COT code." }
  if (!Number.isInteger(percent) || percent < 0 || percent > 100) {
    return { ok: false, error: "Enter a percentage between 0 and 100." }
  }

  const updated = await db.execute({
    sql: "UPDATE transactions SET cot_code = ?, cot_percent = ?, cot_reason = ? WHERE id = ? AND type = 'transfer'",
    args: [code.trim(), percent, reason.trim(), transactionId],
  })

  if (updated.rowsAffected === 0) return { ok: false, error: "Transfer not found." }
  return { ok: true }
}

/* ----------------------------------------------------------------- utils */

async function makeUsername(email: string) {
  const base = email.split("@")[0].toLowerCase().replace(/[^a-z0-9._-]/g, "").slice(0, 24) || "customer"
  let candidate = base
  let suffix = 0
  while (suffix < 50) {
    const existing = await db.execute({
      sql: "SELECT 1 AS hit FROM users WHERE lower(username) = ? LIMIT 1",
      args: [candidate],
    })
    if (existing.rows.length === 0) return candidate
    suffix += 1
    candidate = `${base}${suffix}`
  }
  return `${base}${Date.now().toString().slice(-4)}`
}

export function makeAccountNumber() {
  const block = () => String(Math.floor(1000 + Math.random() * 9000))
  return `4${block()} ${block()} ${block()} ${block()}`
}
