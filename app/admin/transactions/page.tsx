"use client"

import { useMemo, useState, type FormEvent } from "react"
import Link from "next/link"
import { Search, Users } from "lucide-react"
import { Card, PageHeader, PanelHeading } from "@/components/bank/ui"
import { Modal } from "@/components/bank/modal"
import { Button } from "@/components/ui/button"
import { Field, FormError, Input, Select } from "@/components/bank/form"
import { TransactionTable } from "@/components/bank/transaction-table"
import { TX_TYPE_LABELS, currency, sumAmounts, type Transaction, type TxType } from "@/lib/bank"
import { useBank } from "@/lib/bank-store"

export default function AdminTransactionsPage() {
  const { transactions, users: allUsers, generateCot } = useBank()
  const customers = allUsers.filter((user) => user.role === "user")
  const [query, setQuery] = useState("")
  const [type, setType] = useState<"all" | TxType>("all")
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
  const [cotCode, setCotCode] = useState("")
  const [cotPercent, setCotPercent] = useState("100")
  const [cotReason, setCotReason] = useState("")
  const [cotError, setCotError] = useState("")

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return transactions.filter((row) => {
      const owner = customers.find((customer) => customer.id === row.userId)
      const matchesType = type === "all" || row.type === type
      const matchesQuery =
        !needle ||
        `${row.description} ${row.reference} ${owner?.name ?? ""} ${owner?.email ?? ""}`.toLowerCase().includes(needle)
      return matchesType && matchesQuery
    })
  }, [transactions, customers, query, type])

  return (
    <>
      <PageHeader
        eyebrow="Ledger"
        title="All transactions"
        description="Every deposit, payment, transfer and manual adjustment across customer accounts."
        actions={
          <Link
            href="/admin/users"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-white px-3 text-[11.5px] font-semibold text-[#515d65] transition hover:bg-muted"
          >
            <Users className="size-3.5" /> Manage customers
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="px-4 py-3.5">
          <div className="text-[11px] font-medium text-[#8a9196]">Transactions</div>
          <div className="mt-1.5 text-[19px] font-semibold tracking-tight text-[#35414a]">{filtered.length}</div>
          <div className="mt-0.5 text-[10px] text-[#a0a5a6]">Matching current filters</div>
        </Card>
        <Card className="px-4 py-3.5">
          <div className="text-[11px] font-medium text-[#8a9196]">Money in</div>
          <div className="mt-1.5 text-[19px] font-semibold tracking-tight text-[#59866b]">{currency(sumAmounts(transactions, "in"))}</div>
          <div className="mt-0.5 text-[10px] text-[#a0a5a6]">Across all accounts</div>
        </Card>
        <Card className="px-4 py-3.5">
          <div className="text-[11px] font-medium text-[#8a9196]">Money out</div>
          <div className="mt-1.5 text-[19px] font-semibold tracking-tight text-[#424d56]">{currency(sumAmounts(transactions, "out"))}</div>
          <div className="mt-0.5 text-[10px] text-[#a0a5a6]">Across all accounts</div>
        </Card>
      </div>

      <Card className="mt-4">
        <PanelHeading title="Transaction ledger" description={`${filtered.length} of ${transactions.length} records`} />
        <div className="flex flex-col gap-2.5 px-4 py-3.5 sm:flex-row sm:items-center sm:px-5">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-[#9da2a3]" />
            <Input
              aria-label="Search transactions"
              placeholder="Search customer, description or reference…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-9 pl-9 text-[12px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select
              aria-label="Filter by type"
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
            users={customers}
            empty={transactions.length === 0 ? "No transactions recorded yet." : "No transactions match your filters."}
            onManageCot={(tx) => {
              setSelectedTx(tx)
              setCotCode(tx.cotCode ?? "")
              setCotPercent(String(tx.cotPercent ?? 100))
              setCotReason(tx.cotReason ?? "")
              setCotError("")
            }}
          />
        </div>
      </Card>
      {selectedTx && (
        <Modal
          title="COT control"
          description={`${selectedTx.reference} · ${selectedTx.description}`}
          onClose={() => setSelectedTx(null)}
          footer={
            <>
              <Button variant="outline" className="h-9 px-3 text-[12px]" onClick={() => setSelectedTx(null)}>
                Cancel
              </Button>
              <Button type="submit" form="cot-control-form" className="h-9 px-3 text-[12px] font-semibold">
                Save COT
              </Button>
            </>
          }
        >
          <form
            id="cot-control-form"
            onSubmit={(event: FormEvent) => {
              event.preventDefault()
              const percent = Number(cotPercent)
              if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
                setCotError("Enter a percentage between 0 and 100.")
                return
              }
              const result = generateCot(selectedTx.id, cotCode, percent, cotReason)
              if (!result.ok) {
                setCotError(result.error)
                return
              }
              setSelectedTx(null)
            }}
            className="space-y-3.5"
          >
            <Field label="COT code" htmlFor="cot-code">
              <Input id="cot-code" value={cotCode} onChange={(event) => setCotCode(event.target.value)} placeholder="e.g. COT-1234" />
            </Field>
            <Field label="Progress percentage" htmlFor="cot-percent" hint="100 = complete">
              <select
                id="cot-percent"
                value={cotPercent}
                onChange={(event) => setCotPercent(event.target.value)}
                className="h-9 w-full border border-[#d7d7d7] bg-white px-3 text-[12px]"
              >
                {[1, 2, 10, 20, 30, 50, 100].map((value) => (
                  <option key={value} value={value}>
                    {value}%{value === 100 ? " (complete)" : ""}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Reason / requirement" htmlFor="cot-reason" hint="Optional">
              <Input id="cot-reason" value={cotReason} onChange={(event) => setCotReason(event.target.value)} placeholder="What is needed to complete" />
            </Field>
            <FormError>{cotError}</FormError>
          </form>
        </Modal>
      )}

    </>
  )
}
