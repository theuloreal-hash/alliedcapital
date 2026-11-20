import type { NextRequest } from "next/server"
import { fail, ok } from "@/lib/api"
import { requireAdmin, requireSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { startImpersonation, stopImpersonation } from "@/lib/bank-service"

export async function POST(request: NextRequest) {
  try {
    const { customerId } = (await request.json()) as { customerId?: string }
    const session = await requireAdmin()
    if (!customerId) return ok({ ok: false, error: "Choose a customer to view as." })

    const result = await startImpersonation(session, customerId)
    if (!result.ok) return ok(result)

    // The admin's own session is no longer needed now the cookie points at the customer.
    await db.execute({ sql: "DELETE FROM sessions WHERE id = ?", args: [session.id] })

    return ok(result)
  } catch (error) {
    return fail(error)
  }
}

export async function DELETE() {
  try {
    const session = await requireSession()
    return ok(await stopImpersonation(session))
  } catch (error) {
    return fail(error)
  }
}
