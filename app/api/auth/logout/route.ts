import { fail, ok } from "@/lib/api"
import { clearSession, getSession } from "@/lib/auth"
import { notifyCustomerAction } from "@/lib/email"

export async function POST() {
  try {
    const session = await getSession()
    await clearSession()
    if (session?.user.role === "user" && !session.impersonatorId) {
      await notifyCustomerAction({
        action: "Customer signed out",
        customer: { name: session.user.name, email: session.user.email },
      })
    }
    return ok({ ok: true })
  } catch (error) {
    return fail(error)
  }
}
