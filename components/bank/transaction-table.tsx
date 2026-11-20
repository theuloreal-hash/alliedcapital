import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Minus,
  Plus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  TX_TYPE_LABELS,
  currency,
  formatDate,
  type BankUser,
  type Transaction,
} from "@/lib/bank"
import { EmptyState, StatusPill } from "@/components/bank/ui"

function TxIcon({ row }: { row: Transaction }) {
  if (row.direction === "in" && row.type === "deposit") {
    return (
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#edf5ef] text-[#56836b]">
        <ArrowDownLeft className="size-4" />
      </span>
    )
  }
  if (row.direction === "in") {
    return (
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#edf5ef] text-[#56836b]">
        <Plus className="size-4" />
      </span>
    )
  }
  if (row.type === "payment") {
    return (
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#f4f1ea] text-[#8b7a64]">
        <CreditCard className="size-4" />
      </span>
    )
  }
  if (row.type === "debit") {
    return (
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#f8ece9] text-[#b26254]">
        <Minus className="size-4" />
      </span>
    )
  }
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#f8f0e2] text-[#a8761f]">
      <ArrowUpRight className="size-4" />
    </span>
  )
}

export function TransactionTable({
  rows,
  users,
  empty = "No transactions to show yet.",
  onManageCot,
}: {
  rows: Transaction[]
  users?: BankUser[]
  empty?: string
  onManageCot?: (transaction: Transaction) => void
}) {
  if (rows.length === 0) return <EmptyState>{empty}</EmptyState>

  const nameFor = (userId: string) => users?.find((user) => user.id === userId)?.name ?? "—"

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr className="border-b border-border bg-[#fbfbf9]">
            {users && <th className="px-4 py-2.5 text-[10px] font-semibold tracking-wide text-[#a0a4a5] uppercase sm:px-5">Customer</th>}
            <th className="px-4 py-2.5 text-[10px] font-semibold tracking-wide text-[#a0a4a5] uppercase sm:px-5">Transaction</th>
            <th className="px-4 py-2.5 text-[10px] font-semibold tracking-wide text-[#a0a4a5] uppercase">Date</th>
            <th className="px-4 py-2.5 text-[10px] font-semibold tracking-wide text-[#a0a4a5] uppercase">Status</th>
            <th className="px-4 py-2.5 text-right text-[10px] font-semibold tracking-wide text-[#a0a4a5] uppercase sm:px-5">Amount</th>
            {onManageCot && <th className="px-4 py-2.5 text-right text-[10px] font-semibold tracking-wide text-[#a0a4a5] uppercase sm:px-5">COT</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-[#f0f0ed] transition-colors last:border-0 hover:bg-[#fbfbf8]">
              {users && (
                <td className="px-4 py-3 text-[12px] font-medium whitespace-nowrap text-[#4c5660] sm:px-5">{nameFor(row.userId)}</td>
              )}
              <td className="px-4 py-3 sm:px-5">
                <div className="flex items-center gap-3">
                  <TxIcon row={row} />
                  <div className="min-w-0">
                    <div className="truncate text-[12.5px] font-semibold text-[#46515a]">{row.description}</div>
                    <div className="mt-0.5 text-[10.5px] text-[#a0a5a5]">
                      {TX_TYPE_LABELS[row.type]} · {row.reference}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-[11.5px] whitespace-nowrap text-[#969c9e]">{formatDate(row.date)}</td>
              <td className="px-4 py-3">
                <StatusPill status={row.status} />
              </td>
              <td
                className={cn(
                  "px-4 py-3 text-right text-[12.5px] font-bold whitespace-nowrap sm:px-5",
                  row.direction === "in" ? "text-[#59866b]" : "text-[#424d56]",
                )}
              >
                {row.direction === "in" ? "+" : "−"}
                {currency(row.amount)}
              </td>
              {onManageCot && (
                <td className="px-4 py-3 text-right sm:px-5">
                  <button
                    type="button"
                    onClick={() => onManageCot(row)}
                    className="h-7 border border-[#d7d7d7] bg-white px-2 text-[10px] text-[#555555]"
                  >
                    {row.cotCode ? "Edit COT" : "Generate COT"}
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
