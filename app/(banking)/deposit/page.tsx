"use client"

import { useMemo, useState, type FormEvent } from "react"
import { ArrowUpRight, BadgeCheck, Info, Wallet } from "lucide-react"
import { Card, PageHeader, PanelHeading } from "@/components/bank/ui"
import { Field, FormError, Input, Select } from "@/components/bank/form"
import { Toast, useToast } from "@/components/bank/toast"
import { TransferModal } from "@/components/bank/transfer-modal"
import { TransactionTable } from "@/components/bank/transaction-table"
import { Button } from "@/components/ui/button"
import { currency, isThisMonth } from "@/lib/bank"
import { useBank } from "@/lib/bank-store"

const SOURCES = [
  "External account · •••• 1038",
  "Debit card · •••• 4417",
  "Branch deposit",
  "Payroll deposit",
]

export default function DepositPage() {
  const { currentUser, userTransactions, deposit } = useBank()
  const { message, tone, notify } = useToast()
  const [amount, setAmount] = useState("")
  const [source, setSource] = useState(SOURCES[0])
  const [reference, setReference] = useState("")
  const [error, setError] = useState("")
  const [transferOpen, setTransferOpen] = useState(false)

  const rows = useMemo(() => (currentUser ? userTransactions(currentUser.id) : []), [currentUser, userTransactions])
  const deposits = rows.filter((row) => row.type === "deposit")
  const monthDeposits = deposits.filter((row) => isThisMonth(row.date))
  const monthTotal = monthDeposits.reduce((total, row) => total + row.amount, 0)

  if (!currentUser) return null

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError("")
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) {
      setError("Enter a valid amount greater than $0.00.")
      return
    }
    const result = await deposit(currentUser!.id, value, source, reference)
    if (!result.ok) {
      setError(result.error)
      return
    }
    notify(`${currency(value)} deposited to your account.`)
    setAmount("")
    setReference("")
  }

  return (
    <>
      <PageHeader
        eyebrow="Add funds"
        title="Deposit funds"
        description="Move money into your Capital Bank account from an external source."
        actions={
          <button
            type="button"
            onClick={() => setTransferOpen(true)}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-white px-3 text-[11.5px] font-semibold text-[#515d65] transition hover:bg-muted"
          >
            <ArrowUpRight className="size-3.5" /> Transfer money
          </button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <PanelHeading title="New deposit" description="Enter the amount and where the funds are coming from" />
          <form onSubmit={handleSubmit} className="space-y-4 px-4 py-4 sm:px-5">
            <Field label="Amount" htmlFor="deposit-amount" hint="Funds are added to your available balance immediately in this demo.">
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[13px] font-semibold text-[#8a9196]">
                  $
                </span>
                <Input
                  id="deposit-amount"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="0.00"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="pl-7 text-[15px] font-semibold"
                />
              </div>
            </Field>

            <Field label="Deposit source" htmlFor="deposit-source">
              <Select id="deposit-source" value={source} onChange={(event) => setSource(event.target.value)}>
                {SOURCES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Reference" htmlFor="deposit-reference" hint="Optional — shown in your transaction history.">
              <Input
                id="deposit-reference"
                placeholder="e.g. Salary, savings top-up"
                value={reference}
                onChange={(event) => setReference(event.target.value)}
              />
            </Field>

            <FormError>{error}</FormError>

            <div className="flex items-start gap-2.5 rounded-lg border border-[#e8eee8] bg-[#f6f8f5] px-3 py-2.5 text-[10.5px] leading-relaxed text-[#78827a]">
              <Info className="mt-0.5 size-3.5 shrink-0 text-[#709078]" />
              This is a simulated deposit. No external bank connection is made and no real funds move.
            </div>

            <Button type="submit" className="h-10 w-full text-[12.5px] font-semibold">
              <Wallet className="size-4" /> Deposit funds
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          <Card className="relative overflow-hidden bg-gradient-to-br from-[#fffdf8] to-[#faf5ea] p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-[0.16em] text-[#a67b30] uppercase">Deposit summary</span>
              <span className="grid size-8 place-items-center rounded-lg bg-[#f4ead4] text-[#a77927]">
                <Wallet className="size-4" />
              </span>
            </div>
            <dl className="mt-4 space-y-3 text-[11.5px]">
              <div className="flex items-center justify-between gap-3 border-b border-[#efe9db] pb-3">
                <dt className="text-[#8a9196]">Available balance</dt>
                <dd className="text-[15px] font-semibold text-[#35414a]">{currency(currentUser.balance)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-[#efe9db] pb-3">
                <dt className="text-[#8a9196]">Deposited this month</dt>
                <dd className="font-semibold text-[#35414a]">{currency(monthTotal)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[#8a9196]">Deposits this month</dt>
                <dd className="font-semibold text-[#35414a]">{monthDeposits.length}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <PanelHeading title="How deposits work" />
            <ul className="space-y-3 px-4 py-4 sm:px-5">
              {[
                "Choose the external source you are depositing from.",
                "Confirm the amount — your balance updates immediately.",
                "Every deposit appears in your transaction history with a reference.",
              ].map((item, index) => (
                <li key={item} className="flex items-start gap-2.5 text-[11.5px] leading-relaxed text-[#5b656d]">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#f4f1e9] text-[10px] font-bold text-[#a1762a]">
                    {index + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2 border-t border-border px-4 py-3 text-[10.5px] text-[#7f8a80] sm:px-5">
              <BadgeCheck className="size-3.5 text-[#6f9177]" />
              Deposits are available to spend instantly in this demo.
            </div>
          </Card>
        </div>
      </div>

      <Card className="mt-4">
        <PanelHeading title="Deposit history" description={`${deposits.length} deposit${deposits.length === 1 ? "" : "s"} on this account`} />
        <div className="border-t border-border">
          <TransactionTable rows={deposits} empty="No deposits yet. Use the form above to add funds." />
        </div>
      </Card>

      <TransferModal open={transferOpen} onClose={() => setTransferOpen(false)} />
      <Toast message={message} tone={tone} />
    </>
  )
}
