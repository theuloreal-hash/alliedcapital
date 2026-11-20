#!/usr/bin/env node
/**
 * Imports the department's WordPress exports into the bank database.
 *
 *   pnpm db:import
 *
 * Users:  every row from wpho_users becomes a customer account. The WordPress
 *         password hash is deliberately discarded — each account gets the
 *         default password (DEFAULT_CUSTOMER_PASSWORD) which an administrator
 *         can reset from the admin panel and the customer can change in their
 *         profile.
 * Orders: every row from wpho_EWD_OTP_Orders becomes a transaction on the
 *         site's own account (order archive), with the order percentage kept
 *         as the COT percentage and the public note kept as the COT reason.
 */
import { readFileSync, existsSync } from "node:fs"
import { createHash, randomBytes, scrypt as scryptCallback } from "node:crypto"
import { promisify } from "node:util"
import { createClient } from "@libsql/client"

const scrypt = promisify(scryptCallback)

function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    if (!existsSync(file)) continue
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].replace(/^["']|["']$/g, "")
      }
    }
  }
}

loadEnv()

const url = process.env.TURSO_DATABASE_URL ?? "file:local.db"
const authToken = process.env.TURSO_AUTH_TOKEN
const client = createClient(authToken ? { url, authToken } : { url })

const DEFAULT_PASSWORD = process.env.DEFAULT_CUSTOMER_PASSWORD ?? "Allied2025!"

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex")
  const key = await scrypt(password, salt, 64)
  return `scrypt$${salt}$${key.toString("hex")}`
}

/** Deterministic 16-digit account number derived from the WordPress row id. */
function accountNumber(wpId) {
  const digits = createHash("sha256").update(`wp-account-${wpId}`).digest("hex").replace(/[a-f]/g, (c) => String(c.charCodeAt(0) % 10))
  const body = digits.slice(0, 12)
  const block = String(wpId).padStart(4, "0").slice(-4)
  return `${body.slice(0, 4)} ${body.slice(4, 8)} ${body.slice(8, 12)} ${block}`
}

const users = JSON.parse(readFileSync(new URL("../db/import/wordpress-users.json", import.meta.url), "utf8"))
const orders = JSON.parse(readFileSync(new URL("../db/import/wordpress-orders.json", import.meta.url), "utf8"))

async function main() {
  const existing = await client.execute("SELECT id, email FROM users")
  // email -> owning user id, so a re-run does not rename a row it already owns.
  const takenEmails = new Map(existing.rows.map((row) => [String(row.email).toLowerCase(), String(row.id)]))
  const takenAccounts = new Set(
    (await client.execute("SELECT account_number FROM users")).rows.map((row) => String(row.account_number)),
  )

  const hash = await hashPassword(DEFAULT_PASSWORD)
  let imported = 0
  let suspended = 0
  const userStatements = []

  for (const [wpId, login, rawEmail, displayName, registered, status] of users) {
    let email = String(rawEmail).trim().toLowerCase()
    const owner = takenEmails.get(email)
    if (owner && owner !== `wp_${wpId}`) {
      const [local, domain] = email.split("@")
      email = `${local}+wp${wpId}@${domain}`
    }
    takenEmails.set(email, `wp_${wpId}`)

    let account = accountNumber(wpId)
    while (takenAccounts.has(account)) account = accountNumber(`${wpId}${Math.random()}`)
    takenAccounts.add(account)

    const accountStatus = status === 0 ? "Active" : "Suspended"
    if (accountStatus === "Suspended") suspended += 1

    userStatements.push({
      sql: `INSERT INTO users (id, name, email, username, password_hash, role, account_number, balance_cents, status, phone, dob, created_at, deleted_at)
            VALUES (?, ?, ?, ?, ?, 'user', ?, 0, ?, NULL, NULL, ?, NULL)
            ON CONFLICT(id) DO UPDATE SET
              name = excluded.name,
              email = excluded.email,
              username = excluded.username,
              account_number = excluded.account_number,
              status = excluded.status,
              created_at = excluded.created_at`,
      args: [
        `wp_${wpId}`,
        String(displayName || login).trim(),
        email,
        String(login).trim(),
        hash,
        account,
        accountStatus,
        `${String(registered).replace(" ", "T")}Z`,
      ],
    })
    imported += 1
  }

  for (let i = 0; i < userStatements.length; i += 40) {
    await client.batch(userStatements.slice(i, i + 40), "write")
  }

  const archiveOwner = "wp_1"
  let orderRows = 0
  const orderStatements = []

  for (const order of orders) {
    const completed = Number(order.percent) >= 100
    orderStatements.push({
      sql: `INSERT INTO transactions
              (id, user_id, type, direction, description, amount_cents, status, booked_at, reference,
               beneficiary_name, beneficiary_bank, beneficiary_iban, beneficiary_bic, source,
               cot_code, cot_percent, cot_reason, cot_submitted_at)
            VALUES (?, ?, 'transfer', 'out', ?, 0, ?, ?, ?, NULL, NULL, NULL, NULL, ?, NULL, ?, ?, NULL)
            ON CONFLICT(id) DO NOTHING`,
      args: [
        `wp_order_${order.id}`,
        archiveOwner,
        `${order.name} · Order ${order.number}`,
        completed ? "Completed" : "Pending",
        `${String(order.updated).replace(" ", "T")}Z`,
        `WPO-${order.id}`,
        "Imported from WordPress order archive",
        Number(order.percent),
        order.notes || null,
      ],
    })
    orderRows += 1
  }

  if (orderStatements.length) await client.batch(orderStatements, "write")

  const counts = await client.execute(
    "SELECT (SELECT count(*) FROM users) AS users, (SELECT count(*) FROM transactions) AS transactions",
  )
  console.log(`Imported ${imported} WordPress users (${suspended} suspended) and ${orderRows} orders.`)
  console.log(`Default password for every imported account: ${DEFAULT_PASSWORD}`)
  console.log(`Database now holds ${counts.rows[0].users} users and ${counts.rows[0].transactions} transactions.`)
  client.close()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
