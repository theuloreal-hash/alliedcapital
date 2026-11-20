import { createClient, type Client } from "@libsql/client"

/**
 * One libSQL client per server process.
 *
 * TURSO_DATABASE_URL / TURSO_AUTH_TOKEN point at the hosted database.
 * Local development falls back to a SQLite file. Vercel requires both hosted
 * database settings; client creation is deferred until a request uses the DB.
 */
declare global {
  // eslint-disable-next-line no-var
  var __bankDb: Client | undefined
}

function create(): Client {
  const configuredUrl = process.env.TURSO_DATABASE_URL?.trim()
  const isVercel = process.env.VERCEL === "1"
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim()

  if (!configuredUrl && isVercel) {
    throw new Error(
      "TURSO_DATABASE_URL is required on Vercel. Configure TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in the Vercel project environment variables.",
    )
  }

  if (isVercel && !authToken) {
    throw new Error("TURSO_AUTH_TOKEN is required on Vercel. Configure it in the Vercel project environment variables.")
  }

  const url = configuredUrl || "file:local.db"

  if (isVercel && url.startsWith("file:")) {
    throw new Error("Vercel must use a hosted Turso database URL, not a local SQLite file.")
  }

  return createClient(authToken ? { url, authToken } : { url })
}

let client: Client | undefined = globalThis.__bankDb

function getClient(): Client {
  if (client) return client

  client = create()
  if (process.env.NODE_ENV !== "production") globalThis.__bankDb = client
  return client
}

export const db: Client = new Proxy({} as Client, {
  get(_target, property) {
    const target = getClient()
    const value = Reflect.get(target, property, target)
    return typeof value === "function" ? value.bind(target) : value
  },
})

export const usingTurso = Boolean(process.env.TURSO_DATABASE_URL?.trim())
