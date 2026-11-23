#!/usr/bin/env node
/**
 * Brings an existing database up to the current schema without dropping data.
 *   pnpm db:migrate
 */
import { readFileSync, existsSync } from "node:fs"
import { createClient } from "@libsql/client"

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

async function columns(table) {
  const result = await client.execute(`PRAGMA table_info(${table})`)
  return result.rows.map((row) => String(row.name))
}

async function main() {
  const userColumns = await columns("users")
  if (!userColumns.includes("username")) {
    await client.execute("ALTER TABLE users ADD COLUMN username TEXT")
    console.log("Added users.username.")
  }

  if (!userColumns.includes("avatar_url")) {
    await client.execute("ALTER TABLE users ADD COLUMN avatar_url TEXT")
    console.log("Added users.avatar_url.")
  }

  await client.execute(`CREATE TABLE IF NOT EXISTS demo_cot_codes (
    code_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    percent INTEGER NOT NULL CHECK (percent >= 0 AND percent <= 100),
    description TEXT NOT NULL,
    created_by TEXT NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    used_at TEXT
  )`)
  await client.execute("CREATE INDEX IF NOT EXISTS idx_demo_cot_user ON demo_cot_codes(user_id, created_at DESC)")

  await client.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(lower(username))")
  console.log("Ensured the username index.")

  const schema = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8")
  for (const statement of schema.split(";").map((s) => s.trim()).filter(Boolean)) {
    if (/^CREATE TABLE IF NOT EXISTS/i.test(statement)) continue
    if (/^CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username/i.test(statement)) continue
    await client.execute(statement)
  }
  console.log("Indexes up to date.")
  client.close()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
