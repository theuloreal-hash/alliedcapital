import type { NextRequest } from "next/server"
import { fail, ok } from "@/lib/api"
import { getSession, requireSession } from "@/lib/auth"
import {
  adjustBalance,
  createCustomer,
  deposit,
  generateCot,
  initiateTransfer,
  loadState,
  setCustomerStatus,
  submitCot,
  updateCustomer,
} from "@/lib/bank-service"

type Body = {
  action: string
  payload?: Record<string, unknown>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

async function freshState() {
  const session = await getSession()
  return loadState(session?.user ?? null, session?.impersonatorId ?? null)
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Body
    const payload = body.payload ?? body
    const session = await requireSession()

    let result: { ok: boolean; error?: string; [key: string]: unknown }

    switch (body.action) {
      case "createCustomer":
        result = await createCustomer(session, {
          name: String(payload.name ?? ""),
          email: String(payload.email ?? ""),
          password: String(payload.password ?? ""),
          openingBalance: Number(payload.openingBalance ?? 0),
          phone: payload.phone ? String(payload.phone) : undefined,
          dob: payload.dob ? String(payload.dob) : undefined,
        })
        break

      case "updateCustomer":
        result = await updateCustomer(session, String(payload.userId), payload.updates ?? {})
        break

      case "setCustomerStatus":
        result = await setCustomerStatus(
          session,
          String(payload.userId),
          payload.status === "Suspended" || payload.status === "Deleted" ? payload.status : "Active",
        )
        break

      case "deleteCustomer":
        result = await setCustomerStatus(session, String(payload.userId), "Deleted")
        break

      case "restoreCustomer":
        result = await setCustomerStatus(session, String(payload.userId), "Active")
        break

      case "adjustBalance":
        result = await adjustBalance(
          session,
          String(payload.userId),
          Number(payload.amount),
          payload.direction === "out" ? "out" : "in",
          String(payload.note ?? ""),
        )
        break

      case "deposit":
        result = await deposit(
          session,
          String(payload.userId),
          Number(payload.amount),
          String(payload.source ?? "External account"),
          payload.note ? String(payload.note) : undefined,
        )
        break

      case "initiateTransfer":
        result = await initiateTransfer(session, String(payload.userId), {
          amount: Number(payload.amount),
          beneficiary: payload.beneficiary,
          note: payload.note ? String(payload.note) : undefined,
        })
        break

      case "submitCot":
        result = await submitCot(session, String(payload.transactionId), String(payload.code ?? ""))
        break

      case "generateCot":
        result = await generateCot(
          session,
          String(payload.transactionId),
          String(payload.code ?? ""),
          Number(payload.percent),
          String(payload.reason ?? ""),
        )
        break

      default:
        return ok({ ok: false, error: `Unknown action: ${body.action}` })
    }

    return ok({ ...result, state: await freshState() })
  } catch (error) {
    return fail(error)
  }
}
