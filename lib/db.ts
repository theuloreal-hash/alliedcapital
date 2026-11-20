import { createClient, type Client } from "@libsql/client"

/**
 * One libSQL client per server process.
 *
 * TURSO_DATABASE_URL / TURSO_AUTH_TOKEN point at the hosted database.
 * Without them the app falls back to a local SQLite file so the project can be
 * run and marked without cloud credentials (useful for demos and CI).
 */
declare global {
  // eslint-disable-next-line no-var
  var __bankDb: Client | undefined
}

function create(): Client {
  const url = process.env.TURSO_DATABASE_URL ?? "file:local.db"
  const authToken = process.env.TURSO_AUTH_TOKEN

  return createClient(authToken ? { url, authToken } : { url })
}

export const db: Client = globalThis.__bankDb ?? create()

if (process.env.NODE_ENV !== "production") globalThis.__bankDb = db

export const usingTurso = Boolean(process.env.TURSO_DATABASE_URL)
