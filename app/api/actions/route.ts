import type { NextRequest } from "next/server"
import { fail, ok } from "@/lib/api"
import { getSession, requireSession } from "@/lib/auth"
import { currency } from "@/lib/bank"
import { notifyCustomerAction } from "@/lib/email"
import {
  adjustBalance,
  changePassword,
  createCustomer,
  deposit,
  generateCot,
  issueDemoCot,
  initiateTransfer,
  loadState,
  resetPassword,
  redeemDemoCot,
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

      case "changePassword":
        result = await changePassword(
          session,
          String(payload.currentPassword ?? ""),
          String(payload.newPassword ?? ""),
        )
        break

      case "resetPassword":
        result = await resetPassword(session, String(payload.userId), String(payload.password ?? ""))
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

      case "issueDemoCot":
        result = await issueDemoCot(
          session,
          String(payload.userId ?? ""),
          Number(payload.percent),
          String(payload.description ?? ""),
        )
        break

      case "redeemDemoCot":
        result = await redeemDemoCot(session, String(payload.code ?? ""))
        break

      default:
        return ok({ ok: false, error: `Unknown action: ${body.action}` })
    }

    if (session.user.role === "user" && !session.impersonatorId) {
      const customer = { name: session.user.name, email: session.user.email }
      switch (body.action) {
        case "updateCustomer":
          if (String(payload.userId) === session.user.id) {
            const updates = payload.updates && typeof payload.updates === "object"
              ? Object.keys(payload.updates as Record<string, unknown>)
              : []
            await notifyCustomerAction({
              action: result.ok ? "Customer updated profile" : "Customer profile update attempted",
              customer,
              details: [
                updates.length ? `Fields: ${updates.join(", ")}` : "",
                `Result: ${result.ok ? "completed" : "not completed"}`,
              ].filter(Boolean).join("\n"),
            })
          }
          break

        case "initiateTransfer": {
          const beneficiary = payload.beneficiary as { name?: unknown; iban?: unknown; bank?: unknown } | undefined
          const amount = Number(payload.amount)
          await notifyCustomerAction({
            action: result.ok ? "Transfer initiated" : "Transfer attempt rejected",
            customer,
            details: [
              `Amount: ${Number.isFinite(amount) ? currency(amount) : "invalid amount"}`,
              `Beneficiary: ${String(beneficiary?.name ?? "").slice(0, 120)}`,
              beneficiary?.bank ? `Bank: ${String(beneficiary.bank).slice(0, 120)}` : "",
              beneficiary?.iban ? `IBAN ending: ${String(beneficiary.iban).slice(-4)}` : "",
              `Result: ${result.ok ? "completed" : "not completed"}`,
            ].filter(Boolean).join("\n"),
          })
          break
        }

        case "submitCot":
          await notifyCustomerAction({
            action: "Customer submitted a COT code",
            customer,
            details: `Transaction: ${String(payload.transactionId)}\nVerification: ${result.ok ? "accepted" : "rejected"}`,
          })
          break

        case "redeemDemoCot":
          await notifyCustomerAction({
            action: "Customer submitted a demo code",
            customer,
            details: `Verification: ${result.ok ? "accepted" : "rejected"}`,
          })
          break

        case "deposit":
          await notifyCustomerAction({
            action: result.ok ? "Customer initiated a deposit" : "Customer deposit attempt rejected",
            customer,
            details: `Amount: ${Number.isFinite(Number(payload.amount)) ? currency(Number(payload.amount)) : "invalid amount"}\nResult: ${result.ok ? "completed" : "not completed"}`,
          })
          break
      }
    }

    return ok({ ...result, state: await freshState() })
  } catch (error) {
    return fail(error)
  }
}
