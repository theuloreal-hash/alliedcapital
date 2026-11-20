#!/usr/bin/env node
/**
 * Creates the schema and the administrator account in an empty database.
 *
 *   pnpm db:seed     create schema + administrator
 *   pnpm db:reset    drop the tables first, then create them again
 *
 * Reads TURSO_DATABASE_URL / TURSO_AUTH_TOKEN from .env.local (or the
 * environment) and falls back to the local file local.db.
 *
 * Customer accounts come from WordPress (pnpm db:import), not from here.
 */
import { readFileSync, existsSync } from "node:fs"
import { randomBytes, scrypt as scryptCallback } from "node:crypto"
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

const ADMIN = {
  id: "usr_admin",
  name: "Bank Administrator",
  email: "admin@capitalbank.demo",
  password: "admin123",
  account: "0000 0000 0001",
}

async function main() {
  const reset = process.argv.includes("--reset")
  const schema = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8")

  if (reset) {
    await client.batch(
      ["DROP TABLE IF EXISTS sessions", "DROP TABLE IF EXISTS transactions", "DROP TABLE IF EXISTS users"],
      "write",
    )
    console.log("Dropped existing tables.")
  }

  for (const statement of schema.split(";").map((s) => s.trim()).filter(Boolean)) {
    await client.execute(statement)
  }
  console.log("Schema ready.")

  await client.execute({
    sql: `INSERT INTO users (id, name, email, username, password_hash, role, account_number, balance_cents, status, created_at)
          VALUES (?, ?, ?, 'admin', ?, 'admin', ?, 0, 'Active', ?)
          ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            email = excluded.email,
            username = excluded.username,
            password_hash = excluded.password_hash,
            account_number = excluded.account_number,
            role = 'admin',
            status = 'Active'`,
    args: [ADMIN.id, ADMIN.name, ADMIN.email, await hashPassword(ADMIN.password), ADMIN.account, new Date().toISOString()],
  })

  const counts = await client.execute(
    "SELECT (SELECT count(*) FROM users) AS users, (SELECT count(*) FROM transactions) AS transactions",
  )
  console.log(
    `Administrator ready (${ADMIN.email} / ${ADMIN.password}). Database holds ${counts.rows[0].users} users and ${counts.rows[0].transactions} transactions.`,
  )
  client.close()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
