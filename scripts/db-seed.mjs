#!/usr/bin/env node
/**
 * Creates the schema and loads demo data into the database.
 *
 *   pnpm db:seed     add/replace demo rows
 *   pnpm db:reset    drop the tables first, then reseed
 *
 * Reads TURSO_DATABASE_URL / TURSO_AUTH_TOKEN from .env.local (or the
 * environment) and falls back to the local file local.db.
 *
 * All identities below are fictional. Do not load production customer data
 * into this demo: password hashes from other systems cannot authenticate here.
 */
import { readFileSync, existsSync } from "node:fs"
import { randomBytes, randomUUID, scrypt as scryptCallback } from "node:crypto"
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

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex")
  const key = await scrypt(password, salt, 64)
  return `scrypt$${salt}$${key.toString("hex")}`
}

const id = (prefix) => `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 12)}`
const cents = (value) => Math.round(value * 100)
const ref = (prefix, n) => `${prefix}-${String(84210 + n * 37)}`
const iso = (daysAgo, hour = 9, minute = 0) => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}
const monthsAgo = (months) => {
  const date = new Date()
  date.setMonth(date.getMonth() - months)
  return date.toISOString()
}

const USERS = [
  { key: "usr_admin", name: "Adaeze Nwosu", email: "admin@capitalbank.demo", password: "admin123", role: "admin", account: "0000 0000 0001", balance: 0, status: "Active", months: 30 },
  { key: "usr_jordan", name: "Jordan Lee", email: "jordan.lee@capitalbank.demo", password: "demo1234", role: "user", account: "4821 9034 7712 4812", balance: 24850.75, status: "Active", months: 26, phone: "078943578224", dob: "18/04/1990" },
  { key: "usr_morgan", name: "Morgan Patel", email: "morgan.patel@capitalbank.demo", password: "demo1234", role: "user", account: "9027 4410 6638 9027", balance: 18740.2, status: "Active", months: 18, phone: "079445120883", dob: "02/11/1987" },
  { key: "usr_taylor", name: "Taylor Brooks", email: "taylor.brooks@capitalbank.demo", password: "demo1234", role: "user", account: "1635 8820 4491 1635", balance: 9230, status: "Suspended", months: 12, phone: "070112349870", dob: "27/06/1995" },
  { key: "usr_casey", name: "Casey Rivera", email: "casey.rivera@capitalbank.demo", password: "demo1234", role: "user", account: "7110 3345 2287 7110", balance: 5120.48, status: "Active", months: 7, phone: "08133009472", dob: "09/09/1992" },
  { key: "usr_amara", name: "Amara Okafor", email: "amara.okafor@capitalbank.demo", password: "demo1234", role: "user", account: "2384 5590 1176 2384", balance: 3210.9, status: "Active", months: 3, phone: "09077451263", dob: "14/01/1998" },
  { key: "usr_daniel", name: "Daniel Osei", email: "daniel.osei@capitalbank.demo", password: "demo1234", role: "user", account: "5518 2247 9031 5518", balance: 14002.15, status: "Active", months: 22, phone: "08033447129", dob: "22/03/1985" },
  { key: "usr_priya", name: "Priya Raman", email: "priya.raman@capitalbank.demo", password: "demo1234", role: "user", account: "3390 7714 2268 3390", balance: 7640.6, status: "Active", months: 15, phone: "07099120458", dob: "05/12/1991" },
  { key: "usr_noah", name: "Noah Bennett", email: "noah.bennett@capitalbank.demo", password: "demo1234", role: "user", account: "8842 1165 4497 8842", balance: 2210.35, status: "Active", months: 9, phone: "08122640017", dob: "30/07/1996" },
  { key: "usr_sofia", name: "Sofia Marchetti", email: "sofia.marchetti@capitalbank.demo", password: "demo1234", role: "user", account: "6673 9981 3320 6673", balance: 31980.4, status: "Active", months: 34, phone: "07955001284", dob: "19/05/1983" },
  { key: "usr_grace", name: "Grace Adeyemi", email: "grace.adeyemi@capitalbank.demo", password: "demo1234", role: "user", account: "1908 4472 6615 1908", balance: 8930.12, status: "Active", months: 5, phone: "08066509231", dob: "11/10/1999" },
  { key: "usr_marcus", name: "Marcus Webb", email: "marcus.webb@capitalbank.demo", password: "demo1234", role: "user", account: "7724 3390 1186 7724", balance: 640.5, status: "Deleted", months: 11, phone: "07044812093", dob: "07/02/1994" },
]

const TRANSACTIONS = [
  ["usr_jordan", "payment", "out", "Willow Market · card •••• 4812", 84.32, 0, 10, 42],
  ["usr_jordan", "deposit", "in", "Studio North · monthly salary", 4250, 0, 8, 15, { source: "External account •••• 1038" }],
  ["usr_jordan", "transfer", "out", "Alex Morgan · rent contribution", 320, 1, 16, 5, { status: "Completed", beneficiary: { name: "Alex Morgan", bank: "Chase Bank", iban: "US64 CHAS 7100 0000 1137 4472", bic: "CHASUS33" } }],
  ["usr_jordan", "payment", "out", "Metro Transit · transit top-up", 12.5, 1, 9, 12],
  ["usr_jordan", "payment", "out", "Olive & Rye · dining", 38.9, 4, 20, 8],
  ["usr_jordan", "debit", "out", "Evergreen Utilities · direct debit", 96.24, 6, 7, 30, { status: "Pending" }],
  ["usr_jordan", "deposit", "in", "Aurora Travel · booking refund", 1200, 11, 14, 25, { source: "External account •••• 1038" }],
  ["usr_jordan", "transfer", "out", "Studio North · equipment reimbursement", 145.75, 13, 11, 40],
  ["usr_jordan", "transfer", "out", "Imfidon Helen · tuition payment", 2500, 2, 15, 20, {
    status: "Pending",
    beneficiary: { name: "IMAFIDON HELEN", bank: "Credit Agricole Bank, France", iban: "FR76 1390 6000 8000 2047 7390 496", bic: "AGRIFRPP839" },
    cot: { code: "COT-4821", percent: 50, reason: "School fees require a transfer permit before release." },
  }],
  ["usr_morgan", "deposit", "in", "Northwind Studio · salary", 3800, 0, 7, 55, { source: "External account •••• 5521" }],
  ["usr_morgan", "payment", "out", "Harbour Rentals · November rent", 1450, 2, 12, 15],
  ["usr_morgan", "transfer", "out", "Jamie Chen · shared utilities", 128.4, 5, 18, 20],
  ["usr_taylor", "payment", "out", "Brightside Pharmacy · purchase", 42.18, 3, 13, 5],
  ["usr_taylor", "deposit", "in", "Freelance invoice #204", 610, 8, 10, 50],
  ["usr_casey", "deposit", "in", "Lumen Labs · salary", 2960, 0, 9, 25, { source: "External account •••• 7782" }],
  ["usr_casey", "transfer", "out", "Priya Shah · dinner split", 56.3, 2, 21, 10],
  ["usr_amara", "debit", "out", "Acorn Insurance · monthly premium", 88.5, 1, 6, 45],
  ["usr_amara", "deposit", "in", "Opening deposit", 3300, 16, 9, 0, { source: "Branch deposit" }],
  ["usr_daniel", "deposit", "in", "Ridgeway Logistics · salary", 5400, 0, 6, 30, { source: "External account •••• 4410" }],
  ["usr_daniel", "payment", "out", "Ridgeway Motors · service", 620, 9, 14, 10],
  ["usr_priya", "deposit", "in", "Kestrel Design · invoice 118", 2400, 1, 11, 5, { source: "External account •••• 8830" }],
  ["usr_priya", "transfer", "out", "Ravi Raman · family support", 700, 4, 17, 45],
  ["usr_noah", "payment", "out", "Peak Outfitters · equipment", 189.99, 2, 12, 0],
  ["usr_noah", "deposit", "in", "Freelance design work", 950, 6, 15, 20],
  ["usr_sofia", "deposit", "in", "Marchetti Holdings · dividend", 7200, 0, 10, 0, { source: "External account •••• 2215" }],
  ["usr_sofia", "payment", "out", "Villa Serena · maintenance", 1180, 7, 9, 30],
  ["usr_grace", "deposit", "in", "Lagos Tech Hub · stipend", 1600, 0, 8, 45, { source: "External account •••• 9901" }],
  ["usr_grace", "payment", "out", "Campus Books · semester books", 240.75, 3, 16, 15],
  ["usr_marcus", "payment", "out", "Iron Gym · membership", 45, 20, 7, 0],
  ["usr_marcus", "deposit", "in", "Opening deposit", 900, 40, 9, 0, { source: "Branch deposit" }],
]

async function main() {
  const reset = process.argv.includes("--reset")
  const schema = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8")

  if (reset) {
    await client.batch(
      [
        "DROP TABLE IF EXISTS sessions",
        "DROP TABLE IF EXISTS transactions",
        "DROP TABLE IF EXISTS users",
      ],
      "write",
    )
    console.log("Dropped existing tables.")
  }

  for (const statement of schema.split(";").map((s) => s.trim()).filter(Boolean)) {
    await client.execute(statement)
  }
  console.log("Schema ready.")

  const users = await Promise.all(
    USERS.map(async (user) => ({
      ...user,
      hash: await hashPassword(user.password),
    })),
  )

  await client.batch(
    users.map((user) => ({
      sql: `INSERT INTO users (id, name, email, password_hash, role, account_number, balance_cents, status, phone, dob, created_at, deleted_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              name = excluded.name,
              email = excluded.email,
              password_hash = excluded.password_hash,
              role = excluded.role,
              account_number = excluded.account_number,
              balance_cents = excluded.balance_cents,
              status = excluded.status,
              phone = excluded.phone,
              dob = excluded.dob`,
      args: [
        user.key,
        user.name,
        user.email,
        user.hash,
        user.role,
        user.account,
        cents(user.balance),
        user.status,
        user.phone ?? null,
        user.dob ?? null,
        monthsAgo(user.months),
        user.status === "Deleted" ? iso(2) : null,
      ],
    })),
    "write",
  )

  let n = 0
  await client.batch(
    TRANSACTIONS.map(([userId, type, direction, description, amount, days, hour, minute, extra = {}]) => {
      n += 1
      const prefix = type === "transfer" ? "TRF" : type === "deposit" ? "DEP" : type === "debit" ? "DEB" : "PMT"
      return {
        sql: `INSERT INTO transactions
                (id, user_id, type, direction, description, amount_cents, status, booked_at, reference,
                 beneficiary_name, beneficiary_bank, beneficiary_iban, beneficiary_bic, source,
                 cot_code, cot_percent, cot_reason)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO NOTHING`,
        args: [
          `seed_tx_${n}`,
          userId,
          type,
          direction,
          description,
          cents(amount),
          extra.status ?? "Completed",
          iso(days, hour, minute),
          ref(prefix, n),
          extra.beneficiary?.name ?? null,
          extra.beneficiary?.bank ?? null,
          extra.beneficiary?.iban ?? null,
          extra.beneficiary?.bic ?? null,
          extra.source ?? null,
          extra.cot?.code ?? null,
          extra.cot?.percent ?? null,
          extra.cot?.reason ?? null,
        ],
      }
    }),
    "write",
  )

  const counts = await client.execute("SELECT (SELECT count(*) FROM users) AS users, (SELECT count(*) FROM transactions) AS transactions")
  console.log(`Seeded ${counts.rows[0].users} users and ${counts.rows[0].transactions} transactions into ${url}.`)
  client.close()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
