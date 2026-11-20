"use client"

import { useMemo, useState } from "react"
import { TransferModal } from "@/components/bank/transfer-modal"
import Link from "next/link"
import { ArrowUpRight, Search } from "lucide-react"
import { Card, PageHeader, PanelHeading } from "@/components/bank/ui"
import { Select, Input } from "@/components/bank/form"
import { TransactionTable } from "@/components/bank/transaction-table"
import { TX_TYPE_LABELS, currency, sumAmounts, type TxType } from "@/lib/bank"
import { useBank } from "@/lib/bank-store"

const linkButton =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-[11.5px] font-semibold text-primary-foreground transition hover:bg-[#b87b1e]"

export default function TransactionsPage() {
  const { currentUser, userTransactions } = useBank()
  const [query, setQuery] = useState("")
  const [type, setType] = useState<"all" | TxType>("all")
  const [transferOpen, setTransferOpen] = useState(false)

  const rows = useMemo(() => (currentUser ? userTransactions(currentUser.id) : []), [currentUser, userTransactions])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return rows.filter((row) => {
      const matchesType = type === "all" || row.type === type
      const matchesQuery =
        !needle ||
        `${row.description} ${row.reference} ${row.source ?? ""} ${row.beneficiary?.name ?? ""}`
          .toLowerCase()
          .includes(needle)
      return matchesType && matchesQuery
    })
  }, [rows, query, type])

  if (!currentUser) return null

  const totalIn = sumAmounts(rows, "in")
  const totalOut = sumAmounts(rows, "out")
  const pending = rows.filter((row) => row.status === "Pending").length

  return (
    <>
      <PageHeader
        eyebrow="Activity"
        title="Transaction history"
        description="Every deposit, payment and transfer on your account, newest first."
        actions={
          <button type="button" onClick={() => setTransferOpen(true)} className={linkButton}>
            <ArrowUpRight className="size-3.5" /> Transfer money
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="px-4 py-3.5">
          <div className="text-[11px] font-medium text-[#8a9196]">Total received</div>
          <div className="mt-1.5 text-[19px] font-semibold tracking-tight text-[#59866b]">{currency(totalIn)}</div>
        </Card>
        <Card className="px-4 py-3.5">
          <div className="text-[11px] font-medium text-[#8a9196]">Total sent</div>
          <div className="mt-1.5 text-[19px] font-semibold tracking-tight text-[#424d56]">{currency(totalOut)}</div>
        </Card>
        <Card className="px-4 py-3.5">
          <div className="text-[11px] font-medium text-[#8a9196]">Pending</div>
          <div className="mt-1.5 text-[19px] font-semibold tracking-tight text-[#a57a32]">
            {pending} transaction{pending === 1 ? "" : "s"}
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <PanelHeading title="All transactions" description={`${filtered.length} of ${rows.length} transactions`} />
        <div className="flex flex-col gap-2.5 px-4 py-3.5 sm:flex-row sm:items-center sm:px-5">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-[#9da2a3]" />
            <Input
              aria-label="Search transactions"
              placeholder="Search description, reference or beneficiary…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-9 pl-9 text-[12px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select
              aria-label="Filter by transaction type"
              value={type}
              onChange={(event) => setType(event.target.value as "all" | TxType)}
              className="h-9 w-[170px] text-[12px]"
            >
              <option value="all">All types</option>
              {(Object.keys(TX_TYPE_LABELS) as TxType[]).map((key) => (
                <option key={key} value={key}>
                  {TX_TYPE_LABELS[key]}
                </option>
              ))}
            </Select>
            {(query || type !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setQuery("")
                  setType("all")
                }}
                className="h-9 shrink-0 rounded-lg border border-border bg-white px-3 text-[11.5px] font-semibold text-[#737b80] transition hover:bg-muted"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        <div className="border-t border-border">
          <TransactionTable
            rows={filtered}
            empty={rows.length === 0 ? "No transactions yet. Make a deposit to get started." : "No transactions match your filters."}
          />
        </div>
      </Card>

      <TransferModal open={transferOpen} onClose={() => setTransferOpen(false)} />
    </>
  )
}
