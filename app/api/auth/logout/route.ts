import { fail, ok } from "@/lib/api"
import { clearSession } from "@/lib/auth"

export async function POST() {
  try {
    await clearSession()
    return ok({ ok: true })
  } catch (error) {
    return fail(error)
  }
}
