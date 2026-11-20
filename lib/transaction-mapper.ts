import type { Transaction } from "@/lib/bank"

export type TransactionRow = {
  id: string
  user_id: string
  type: Transaction["type"]
  direction: Transaction["direction"]
  description: string
  amount_cents: number
  status: Transaction["status"]
  booked_at: string
  reference: string
  beneficiary_name: string | null
  beneficiary_bank: string | null
  beneficiary_iban: string | null
  beneficiary_bic: string | null
  source: string | null
  cot_code: string | null
  cot_percent: number | null
  cot_reason: string | null
  cot_submitted_at: string | null
}

export function mapTransaction(row: TransactionRow): Transaction {
  const beneficiary =
    row.beneficiary_name || row.beneficiary_iban
      ? {
          name: row.beneficiary_name ?? "",
          bank: row.beneficiary_bank ?? "",
          iban: row.beneficiary_iban ?? "",
          bic: row.beneficiary_bic ?? "",
        }
      : undefined

  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    direction: row.direction,
    description: row.description,
    amount: row.amount_cents / 100,
    status: row.status,
    date: row.booked_at,
    reference: row.reference,
    beneficiary,
    source: row.source ?? undefined,
    cotCode: row.cot_code ?? undefined,
    cotPercent: row.cot_percent ?? undefined,
    cotReason: row.cot_reason ?? undefined,
    cotSubmittedAt: row.cot_submitted_at ?? undefined,
  }
}
