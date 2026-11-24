import type { NextRequest } from "next/server"
import { fail, ok } from "@/lib/api"
import { login } from "@/lib/bank-service"
import { notifyCustomerAction } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string; password?: string }
    const result = await login(body.email ?? "", body.password ?? "")
    if (result.ok && result.user.role === "user") {
      await notifyCustomerAction({
        action: "Customer signed in",
        customer: { name: result.user.name, email: result.user.email },
      })
    }
    return ok(result)
  } catch (error) {
    return fail(error)
  }
}
