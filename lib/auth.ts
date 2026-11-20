import { randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"
import { cookies } from "next/headers"
import { db } from "@/lib/db"
import type { BankUser, Role } from "@/lib/bank"

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: string,
  keylen: number,
) => Promise<Buffer>

const KEY_LENGTH = 64
const SESSION_COOKIE = "cb_session"
const SESSION_DAYS = 7

/** Stored format: scrypt$<salt hex>$<key hex> */
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex")
  const key = await scrypt(password, salt, KEY_LENGTH)
  return `scrypt$${salt}$${key.toString("hex")}`
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, salt, key] = stored.split("$")
  if (scheme !== "scrypt" || !salt || !key) return false
  const expected = Buffer.from(key, "hex")
  const actual = await scrypt(password, salt, expected.length)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

export type Session = {
  id: string
  user: BankUser
  impersonatorId: string | null
}

type UserRow = {
  id: string
  name: string
  email: string
  username: string | null
  password_hash: string
  role: Role
  account_number: string
  balance_cents: number
  status: BankUser["status"]
  phone: string | null
  dob: string | null
  created_at: string
  deleted_at: string | null
}

export function mapUser(row: UserRow): BankUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    username: row.username ?? undefined,
    role: row.role,
    accountNumber: row.account_number,
    balance: row.balance_cents / 100,
    status: row.status,
    createdAt: row.created_at,
    phone: row.phone ?? undefined,
    dob: row.dob ?? undefined,
    deletedAt: row.deleted_at ?? undefined,
  }
}

export async function findUserByEmail(email: string) {
  const result = await db.execute({
    sql: "SELECT * FROM users WHERE lower(email) = ? LIMIT 1",
    args: [email.trim().toLowerCase()],
  })
  return (result.rows[0] as unknown as UserRow | undefined) ?? null
}

/** Sign-in accepts either the email address or the WordPress username. */
export async function findUserByIdentifier(identifier: string) {
  const value = identifier.trim().toLowerCase()
  if (!value) return null
  const byEmail = await findUserByEmail(value)
  if (byEmail) return byEmail
  const result = await db.execute({
    sql: "SELECT * FROM users WHERE lower(username) = ? LIMIT 1",
    args: [value],
  })
  return (result.rows[0] as unknown as UserRow | undefined) ?? null
}

export async function createSession(userId: string, impersonatorId: string | null = null) {
  const now = new Date()
  const expires = new Date(now.getTime() + SESSION_DAYS * 86_400_000)
  const id = randomUUID()

  await db.execute({
    sql: "INSERT INTO sessions (id, user_id, impersonator_id, created_at, expires_at) VALUES (?, ?, ?, ?, ?)",
    args: [id, userId, impersonatorId, now.toISOString(), expires.toISOString()],
  })

  const store = await cookies()
  store.set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  })

  return id
}

export async function clearSession() {
  const store = await cookies()
  const id = store.get(SESSION_COOKIE)?.value
  if (id) {
    await db.execute({ sql: "DELETE FROM sessions WHERE id = ?", args: [id] })
  }
  store.delete(SESSION_COOKIE)
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies()
  const id = store.get(SESSION_COOKIE)?.value
  if (!id) return null

  const result = await db.execute({
    sql: `SELECT s.id AS session_id, s.impersonator_id, s.expires_at, u.*
          FROM sessions s JOIN users u ON u.id = s.user_id
          WHERE s.id = ? LIMIT 1`,
    args: [id],
  })

  const row = result.rows[0] as unknown as (UserRow & {
    session_id: string
    impersonator_id: string | null
    expires_at: string
  }) | undefined

  if (!row) return null
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await db.execute({ sql: "DELETE FROM sessions WHERE id = ?", args: [id] })
    return null
  }

  return { id: row.session_id, user: mapUser(row), impersonatorId: row.impersonator_id ?? null }
}

export async function requireSession() {
  const session = await getSession()
  if (!session) throw new HttpError(401, "You are signed out. Please sign in again.")
  return session
}

export async function requireAdmin() {
  const session = await requireSession()
  if (session.user.role !== "admin") throw new HttpError(403, "Administrator access required.")
  return session
}

export class HttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}
