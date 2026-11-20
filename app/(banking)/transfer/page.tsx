"use client"

import { useMemo, useState, type FormEvent } from "react"
import Link from "next/link"
import { ArrowLeftRight, ArrowDownToLine, Info, Landmark, LockKeyhole, ShieldCheck } from "lucide-react"
import { Card, PageHeader, PanelHeading, Pill } from "@/components/bank/ui"
import { Field, FieldHint, FormError, Input } from "@/components/bank/form"
import { Modal } from "@/components/bank/modal"
import { Toast, useToast } from "@/components/bank/toast"
import { TransactionTable } from "@/components/bank/transaction-table"
import { Button } from "@/components/ui/button"
import { DEFAULT_BENEFICIARY, currency, type Beneficiary } from "@/lib/bank"
import { useBank } from "@/lib/bank-store"

export default function TransferPage() {
  const { currentUser, userTransactions, initiateTransfer } = useBank()
  const { message, tone, notify } = useToast()
  const [beneficiary, setBeneficiary] = useState<Beneficiary>({ ...DEFAULT_BENEFICIARY })
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [error, setError] = useState("")
  const [reviewing, setReviewing] = useState(false)

  const rows = useMemo(() => (currentUser ? userTransactions(currentUser.id) : []), [currentUser, userTransactions])
  const transfers = rows.filter((row) => row.type === "transfer")
  const value = Number(amount)

  if (!currentUser) return null

  function update(field: keyof Beneficiary, next: string) {
    setBeneficiary((current) => ({ ...current, [field]: next }))
  }

  function handleReview(event: FormEvent) {
    event.preventDefault()
    setError("")
    if (!Number.isFinite(value) || value <= 0) {
      setError("Enter a valid transfer amount greater than $0.00.")
      return
    }
    if (value > currentUser!.balance) {
      setError(`Insufficient funds. Your available balance is ${currency(currentUser!.balance)}.`)
      return
    }
    if (!beneficiary.name.trim() || !beneficiary.iban.trim() || !beneficiary.bic.trim()) {
      setError("Beneficiary name, IBAN and BIC are required.")
      return
    }
    setReviewing(true)
  }

  function confirmTransfer() {
    const result = initiateTransfer(currentUser!.id, { amount: value, beneficiary, note })
    setReviewing(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    notify(`${currency(value)} sent to ${beneficiary.name}.`)
    setAmount("")
    setNote("")
  }

  return (
    <>
      <PageHeader
        eyebrow="Payments"
        title="Transfer money"
        description="Send a transfer to your saved beneficiary. All details are editable before you send."
        actions={
          <Link
            href="/deposit"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-white px-3 text-[11.5px] font-semibold text-[#515d65] transition hover:bg-muted"
          >
            <ArrowDownToLine className="size-3.5" /> Deposit funds
          </Link>
        }
      />

      <div className="grid items-start gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <PanelHeading
            title="Transfer details"
            description="Beneficiary is pre-filled — change any field if needed"
            action={<Pill tone="brand">Saved beneficiary</Pill>}
          />
          <form onSubmit={handleReview} className="space-y-5 px-4 py-4 sm:px-5">
            <section>
              <h3 className="mb-3 flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] text-[#a0a5a8] uppercase">
                <Landmark className="size-3.5" /> Beneficiary
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Beneficiary name" htmlFor="beneficiary-name">
                  <Input
                    id="beneficiary-name"
                    value={beneficiary.name}
                    onChange={(event) => update("name", event.target.value)}
                    autoComplete="off"
                  />
                </Field>
                <Field label="Bank" htmlFor="beneficiary-bank">
                  <Input
                    id="beneficiary-bank"
                    value={beneficiary.bank}
                    onChange={(event) => update("bank", event.target.value)}
                    autoComplete="off"
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="IBAN" htmlFor="beneficiary-iban" hint="International bank account number">
                    <Input
                      id="beneficiary-iban"
                      value={beneficiary.iban}
                      onChange={(event) => update("iban", event.target.value.toUpperCase())}
                      autoComplete="off"
                      spellCheck={false}
                      className="font-mono text-[12px] tracking-wide"
                    />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="BIC / SWIFT" htmlFor="beneficiary-bic" hint="International bank identifier">
                    <Input
                      id="beneficiary-bic"
                      value={beneficiary.bic}
                      onChange={(event) => update("bic", event.target.value.toUpperCase())}
                      autoComplete="off"
                      spellCheck={false}
                      className="font-mono text-[12px] tracking-wide"
                    />
                  </Field>
                </div>
              </div>
            </section>

            <section className="border-t border-border pt-4">
              <h3 className="mb-3 flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] text-[#a0a5a8] uppercase">
                <ArrowLeftRight className="size-3.5" /> Amount
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Amount" htmlFor="transfer-amount" hintRight={<FieldHint>USD</FieldHint>}>
                  <div className="relative">
                    <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[13px] font-semibold text-[#8a9196]">
                      $
                    </span>
                    <Input
                      id="transfer-amount"
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder="0.00"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      className="pl-7 text-[15px] font-semibold"
                    />
                  </div>
                </Field>
                <Field label="Reference" htmlFor="transfer-note" hint="Shown in your history">
                  <Input
                    id="transfer-note"
                    placeholder="What is this transfer for?"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                  />
                </Field>
              </div>
            </section>

            <FormError>{error}</FormError>

            <div className="flex items-start gap-2.5 rounded-lg border border-[#e8eee8] bg-[#f6f8f5] px-3 py-2.5 text-[10.5px] leading-relaxed text-[#78827a]">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-[#709078]" />
              You will review the full transfer before it is sent. This demo does not move real money.
            </div>

            <Button type="submit" className="h-10 w-full text-[12.5px] font-semibold">
              <LockKeyhole className="size-4" /> Review transfer
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          <Card className="relative overflow-hidden bg-gradient-to-br from-[#fffdf8] to-[#faf5ea] p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-[0.16em] text-[#a67b30] uppercase">Transfer summary</span>
              <span className="grid size-8 place-items-center rounded-lg bg-[#f4ead4] text-[#a77927]">
                <ArrowLeftRight className="size-4" />
              </span>
            </div>
            <div className="mt-4 rounded-lg border border-[#eee7d8] bg-white/70 px-3 py-2.5">
              <div className="text-[11.5px] font-bold text-[#3d4953]">{beneficiary.name || "Beneficiary name"}</div>
              <div className="mt-0.5 text-[10.5px] text-[#8a9196]">{beneficiary.bank || "Bank"}</div>
              <div className="mt-1.5 font-mono text-[10px] break-all text-[#6d777f]">{beneficiary.iban || "IBAN"}</div>
            </div>
            <dl className="mt-4 space-y-2.5 text-[11.5px]">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[#8a9196]">Available balance</dt>
                <dd className="font-medium text-[#4f5b63]">{currency(currentUser.balance)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[#8a9196]">Transfer amount</dt>
                <dd className="font-medium text-[#4f5b63]">{Number.isFinite(value) && value > 0 ? currency(value) : "$0.00"}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[#8a9196]">Transfer fee</dt>
                <dd className="font-medium text-[#59866b]">$0.00</dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-[#efe9db] pt-2.5">
                <dt className="font-semibold text-[#4f5b63]">Total debit</dt>
                <dd className="text-[14px] font-semibold text-[#35414a]">
                  {Number.isFinite(value) && value > 0 ? currency(value) : "$0.00"}
                </dd>
              </div>
            </dl>
          </Card>

          <div className="flex items-start gap-2.5 rounded-xl border border-[#e4ece5] bg-[#f4f8f4] px-4 py-3">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#6f9177]" />
            <div className="text-[10.5px] leading-relaxed text-[#718075]">
              <p className="font-semibold text-[#5f7b6a]">Before you send</p>
              <p className="mt-0.5">Check the beneficiary name and IBAN carefully. Transfers sent to the wrong account cannot be recalled.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-border bg-white px-4 py-3">
            <Info className="mt-0.5 size-4 shrink-0 text-[#a0a5a6]" />
            <p className="text-[10.5px] leading-relaxed text-[#858d92]">
              International transfers to this beneficiary are simulated and complete instantly in the demo.
            </p>
          </div>
        </div>
      </div>

      <Card className="mt-4">
        <PanelHeading title="Transfer history" description={`${transfers.length} transfer${transfers.length === 1 ? "" : "s"} from this account`} />
        <div className="border-t border-border">
          <TransactionTable rows={transfers} empty="No transfers yet. Send your first transfer above." />
        </div>
      </Card>

      {reviewing && (
        <Modal
          title="Confirm transfer"
          description="Review the details below, then confirm to send."
          onClose={() => setReviewing(false)}
          footer={
            <>
              <Button variant="outline" className="h-9 px-3 text-[12px]" onClick={() => setReviewing(false)}>
                Cancel
              </Button>
              <Button className="h-9 px-3 text-[12px] font-semibold" onClick={confirmTransfer}>
                Confirm transfer
              </Button>
            </>
          }
        >
          <div className="rounded-lg bg-[#fbf9f4] px-4 py-3 text-center">
            <div className="text-[10px] font-bold tracking-[0.14em] text-[#a0a5a8] uppercase">You are sending</div>
            <div className="mt-1 text-[26px] font-semibold tracking-tight text-[#2f3b45]">{currency(value)}</div>
            <div className="mt-0.5 text-[11px] text-[#8a9196]">to {beneficiary.name}</div>
          </div>
          <dl className="mt-4 space-y-2.5 text-[11.5px]">
            {[
              ["Beneficiary", beneficiary.name],
              ["Bank", beneficiary.bank],
              ["IBAN", beneficiary.iban],
              ["BIC / SWIFT", beneficiary.bic],
              ["From account", currentUser.accountNumber],
              ["Reference", note || "—"],
            ].map(([label, content]) => (
              <div key={label} className="flex items-start justify-between gap-4 border-b border-[#f1f0ec] pb-2.5 last:border-0 last:pb-0">
                <dt className="shrink-0 text-[#8a9196]">{label}</dt>
                <dd className="text-right font-medium break-all text-[#4f5b63]">{content}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-[#eee3ce] bg-[#fbf7ef] px-3 py-2.5 text-[10.5px] leading-relaxed text-[#796744]">
            <Info className="mt-0.5 size-3.5 shrink-0 text-[#b78025]" />
            Simulated transfer — no funds will leave this demo account.
          </div>
        </Modal>
      )}

      <Toast message={message} tone={tone} />
    </>
  )
}
