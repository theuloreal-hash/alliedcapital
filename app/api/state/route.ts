import { fail, ok } from "@/lib/api"
import { getSession } from "@/lib/auth"
import { loadState } from "@/lib/bank-service"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getSession()
    const state = await loadState(session?.user ?? null, session?.impersonatorId ?? null)
    return ok(state)
  } catch (error) {
    return fail(error)
  }
}
