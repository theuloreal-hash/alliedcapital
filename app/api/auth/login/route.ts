import type { NextRequest } from "next/server"
import { fail, ok } from "@/lib/api"
import { login } from "@/lib/bank-service"

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string; password?: string }
    return ok(await login(body.email ?? "", body.password ?? ""))
  } catch (error) {
    return fail(error)
  }
}
