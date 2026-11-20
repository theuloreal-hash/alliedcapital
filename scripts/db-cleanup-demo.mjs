#!/usr/bin/env node
/**
 * Removes the demo customers and demo transactions that shipped with the app,
 * leaving the administrator account and all real (imported) bank data intact.
 *
 *   pnpm db:cleanup-demo
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

async function main() {
  const demoCustomers = await client.execute(
    "SELECT id, email FROM users WHERE role = 'user' AND (id LIKE 'usr_%' OR email LIKE '%@capitalbank.demo')",
  )
  const ids = demoCustomers.rows.map((row) => String(row.id))

  if (ids.length > 0) {
    const placeholders = ids.map(() => "?").join(", ")
    const removedTx = await client.execute({
      sql: `DELETE FROM transactions WHERE user_id IN (${placeholders})`,
      args: ids,
    })
    const removedUsers = await client.execute({
      sql: `DELETE FROM users WHERE id IN (${placeholders})`,
      args: ids,
    })
    console.log(`Removed ${removedUsers.rowsAffected} demo customers and ${removedTx.rowsAffected} of their transactions.`)
  } else {
    console.log("No demo customers found.")
  }

  // Transactions created by the old seed script for accounts that no longer exist.
  const orphans = await client.execute("DELETE FROM transactions WHERE id LIKE 'seed_tx_%'")
  if (orphans.rowsAffected > 0) console.log(`Removed ${orphans.rowsAffected} leftover seed transactions.`)

  const counts = await client.execute(
    "SELECT (SELECT count(*) FROM users) AS users, (SELECT count(*) FROM transactions) AS transactions",
  )
  console.log(`Database now holds ${counts.rows[0].users} users and ${counts.rows[0].transactions} transactions.`)
  client.close()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
