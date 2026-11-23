"use client"
import { useMemo, useState } from "react"
import { ArrowUpRight } from "lucide-react"
import { useBank } from "@/lib/bank-store"
import { TransferModal } from "@/components/bank/transfer-modal"
import { Card, PageHeader } from "@/components/bank/ui"
import { TransactionTable } from "@/components/bank/transaction-table"
import { DemoCotPanel } from "@/components/bank/demo-cot-panel"
import { currency, sumAmounts, type Transaction } from "@/lib/bank"

export default function TransferPage() {
  const { currentUser, userTransactions } = useBank()
  const [open, setOpen] = useState(false)
  const [resumeTx, setResumeTx] = useState<Transaction | null>(null)

  const rows = useMemo(() => {
    if (!currentUser) return []
    return userTransactions(currentUser.id).filter((row) => row.type === "transfer")
  }, [currentUser, userTransactions])

  if (!currentUser) return null

  const sent = sumAmounts(rows, "out")
  const pending = rows.filter((row) => row.status === "Pending").length

  function startTransfer(tx: Transaction | null = null) {
    setResumeTx(tx)
    setOpen(true)
  }

  return (
    <>
      <PageHeader
        eyebrow="Payments"
        title="Transfer money"
        description="Send funds to a beneficiary abroad or at home, and follow every transfer here."
        // actions={
        //   <button
        //     type="button"
        //     onClick={() => startTransfer()}
        //     className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#ddaa3f] px-3 text-[11.5px] font-semibold text-white transition hover:bg-[#c99735]"
        //   >
        //     <ArrowUpRight className="size-3.5" /> New transfer
        //   </button>
        // }
      />

      <div className="mx-auto w-full max-w-[720px] space-y-4">
        <div className="border border-[#d7d7d7] bg-white px-4 py-4">
          <h2 className="text-[12px] font-medium text-[#555555]">Available to transfer</h2>
          <div className="mt-1 text-[24px] font-semibold text-[#333333]">{currency(currentUser.balance)}</div>
          <p className="mt-2 max-w-[480px] text-[11.5px] leading-relaxed text-[#777777]">
            Transfers are reviewed by the bank before release. If a transfer needs a Certificate of Transfer (COT) the
            bank will show the requirement, the percentage and the reason in the transfer window.
          </p>
          <button
            type="button"
            onClick={() => startTransfer()}
            className="mt-3 h-9 bg-[#ddaa3f] px-4 text-[12px] font-medium text-white hover:bg-[#c99735]"
          >
            Transfer Money
          </button>
        </div>
          <DemoCotPanel />

        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="px-4 py-3.5">
            <div className="text-[11px] font-medium text-[#8a9196]">Transfers sent</div>
            <div className="mt-1.5 text-[19px] font-semibold tracking-tight text-[#424d56]">{currency(sent)}</div>
          </Card>
          <Card className="px-4 py-3.5">
            <div className="text-[11px] font-medium text-[#8a9196]">Total transfers</div>
            <div className="mt-1.5 text-[19px] font-semibold tracking-tight text-[#424d56]">{rows.length}</div>
          </Card>
          <Card className="px-4 py-3.5">
            <div className="text-[11px] font-medium text-[#8a9196]">Awaiting release</div>
            <div className="mt-1.5 text-[19px] font-semibold tracking-tight text-[#a57a32]">{pending}</div>
          </Card>
        </div>

        <Card>
          <div className="px-4 py-3.5">
            <h2 className="text-[13px] font-semibold text-[#424d56]">Your transfers</h2>
            <p className="mt-1 text-[11px] text-[#8a9196]">
              {rows.length} transfer{rows.length === 1 ? "" : "s"} on this account
            </p>
          </div>
          <div className="border-t border-border">
            <TransactionTable
              rows={rows}
              empty="No transfers yet. Use Transfer Money to send your first payment."
              onResumeTransfer={(tx) => startTransfer(tx)}
            />
          </div>
          </Card>


        </div>

      <TransferModal
        open={open}
        resume={resumeTx}
        onClose={() => {
          setOpen(false)
          setResumeTx(null)
        }}
      />
    </>
  )
}