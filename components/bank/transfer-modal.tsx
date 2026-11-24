"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { ArrowLeftRight, Landmark, ShieldCheck } from "lucide-react"
import { Modal } from "@/components/bank/modal"
import { AsyncButton } from "@/components/bank/async-button"
import { usePendingAction } from "@/components/bank/use-pending-action"
import { Field, FieldHint, FormError, Input } from "@/components/bank/form"
import { Button } from "@/components/ui/button"
import { DEFAULT_BENEFICIARY, currency, type Beneficiary, type Transaction } from "@/lib/bank"
import { useBank } from "@/lib/bank-store"

function updateBeneficiary(current: Beneficiary, field: keyof Beneficiary, value: string) {
  return { ...current, [field]: value }
}

export function TransferModal({
  open,
  onClose,
  resume,
}: {
  open: boolean
  onClose: () => void
  resume?: Transaction | null
}) {
  const { currentUser, initiateTransfer, submitCot } = useBank()
  const { pending, run } = usePendingAction()

  const [beneficiary, setBeneficiary] = useState<Beneficiary>({ ...DEFAULT_BENEFICIARY })
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [error, setError] = useState("")
  const [txId, setTxId] = useState<string | null>(null)
  const [cotInput, setCotInput] = useState("")
  const [cotError, setCotError] = useState("")
  const [cotSubmitted, setCotSubmitted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [cotReason, setCotReason] = useState("")
  const progressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (open) {
      if (resume) {
        setBeneficiary(resume.beneficiary ?? { ...DEFAULT_BENEFICIARY })
        setAmount(String(resume.amount))
        setNote(resume.description)
        setTxId(resume.id)
      } else {
        setBeneficiary({ ...DEFAULT_BENEFICIARY })
        setAmount("")
        setNote("")
        setTxId(null)
      }
      setCotSubmitted(false)
      setProgress(0)
      setCotReason("")
      setError("")
      setCotInput("")
      setCotError("")
    }
    return () => {
      if (progressTimer.current) clearTimeout(progressTimer.current)
    }
  }, [open, resume])

  if (!open || !currentUser) return null

  const value = Number(amount)

  async function handleTransfer(event: FormEvent) {
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
    await run(async () => {
      const result = await initiateTransfer(currentUser!.id, { amount: value, beneficiary, note })
      if (!result.ok) {
        setError(result.error)
        return
      }
      setTxId(result.transactionId)
    })
  }

  async function handleCot(event: FormEvent) {
    event.preventDefault()
    if (!txId) return
    setCotError("")
    await run(async () => {
      const result = await submitCot(txId, cotInput)
      if (!result.ok) {
        setCotError(result.error)
        return
      }
      setCotReason(result.reason)
      setProgress(0)
      setCotSubmitted(true)
      setCotInput("")
      progressTimer.current = setTimeout(() => setProgress(result.percent), 50)
    })
  }

  const stage = txId ? "cot" : "form"

  return (
    <Modal
      title={stage === "form" ? "Transfer money" : cotSubmitted ? "Transfer progress" : "COT code required"}
      description={
        stage === "form"
          ? "Send a transfer to your saved beneficiary."
          : cotSubmitted
            ? "The administrator-configured progress and update for this transfer."
            : "Enter the COT code provided by the bank to continue."
      }
      onClose={onClose}
      footer={
        stage === "form" ? (
          <>
            <Button variant="outline" className="h-9 px-3 text-[12px]" onClick={onClose}>
              Cancel
            </Button>
            <AsyncButton type="submit" form="transfer-modal-form" pending={pending} pendingText="Processing…" className="h-9 px-3 text-[12px] font-semibold">
              Transfer
            </AsyncButton>
          </>
        ) : cotSubmitted ? (
          <Button className="h-9 px-3 text-[12px] font-semibold" onClick={onClose}>
            Close
          </Button>
        ) : (
          <>
            <Button variant="outline" className="h-9 px-3 text-[12px]" onClick={onClose}>
              Close
            </Button>
            <AsyncButton type="submit" form="cot-modal-form" pending={pending} pendingText="Verifying…" className="h-9 px-3 text-[12px] font-semibold">
              Submit code
            </AsyncButton>
          </>
        )
      }
    >
      {stage === "form" ? (
        <form id="transfer-modal-form" onSubmit={handleTransfer} className="space-y-4">
          <section>
            <h3 className="mb-2 flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] text-[#a0a5a8] uppercase">
              <Landmark className="size-3.5" /> Beneficiary
            </h3>
            <div className="grid gap-3">
              <Field label="Beneficiary name" htmlFor="tm-name">
                <Input id="tm-name" placeholder="Enter beneficiary name" value={beneficiary.name} onChange={(event) => setBeneficiary(updateBeneficiary(beneficiary, "name", event.target.value))} />
              </Field>
              <Field label="Bank" htmlFor="tm-bank">
                <Input id="tm-bank" placeholder="Enter bank name" value={beneficiary.bank} onChange={(event) => setBeneficiary(updateBeneficiary(beneficiary, "bank", event.target.value))} />
              </Field>
              <Field label="IBAN" htmlFor="tm-iban">
                <Input id="tm-iban" placeholder="Enter beneficiary IBAN" value={beneficiary.iban} onChange={(event) => setBeneficiary(updateBeneficiary(beneficiary, "iban", event.target.value.toUpperCase()))} className="font-mono text-[12px]" />
              </Field>
              <Field label="BIC / SWIFT" htmlFor="tm-bic">
                <Input id="tm-bic" placeholder="Enter BIC / SWIFT code" value={beneficiary.bic} onChange={(event) => setBeneficiary(updateBeneficiary(beneficiary, "bic", event.target.value.toUpperCase()))} className="font-mono text-[12px]" />
              </Field>
            </div>
          </section>
          <section className="border-t border-[#d7d7d7] pt-4">
            <h3 className="mb-2 flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] text-[#a0a5a8] uppercase">
              <ArrowLeftRight className="size-3.5" /> Amount
            </h3>
            <div className="grid gap-3">
              <Field label="Amount" htmlFor="tm-amount" hintRight={<FieldHint>USD</FieldHint>}>
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[13px] font-semibold text-[#8a9196]">$</span>
                  <Input id="tm-amount" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} className="pl-7 text-[15px] font-semibold" />
                </div>
              </Field>
              <Field label="Reference" htmlFor="tm-note">
                <Input id="tm-note" value={note} onChange={(event) => setNote(event.target.value)} />
              </Field>
            </div>
          </section>
          <FormError>{error}</FormError>
          <div className="flex items-start gap-2 rounded-lg border border-[#e8eee8] bg-[#f6f8f5] px-3 py-2.5 text-[10.5px] leading-relaxed text-[#78827a]">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-[#709078]" />
            You will be asked for a COT code after the transfer is initiated.
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg bg-[#fbf9f4] px-4 py-3 text-center">
            <div className="text-[10px] font-bold tracking-[0.14em] text-[#a0a5a8] uppercase">Transfer amount</div>
            <div className="mt-1 text-[22px] font-semibold tracking-tight text-[#2f3b45]">{currency(value)}</div>
            <div className="mt-0.5 text-[11px] text-[#8a9196]">to {beneficiary.name}</div>
          </div>

          {cotSubmitted ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[12px] text-[#44534b]">
                <span className="font-semibold">Transfer progress</span>
                <span className="font-bold tabular-nums text-emerald-700">{progress}%</span>
              </div>
              <div
                className="h-8 w-full overflow-hidden rounded-full bg-emerald-100 shadow-inner"
                role="progressbar"
                aria-label="Configured transfer progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
              >
                <div
                  className="cot-progress-fill relative h-full rounded-full bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.35)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3.5">
                <p className="text-[10px] font-bold tracking-wide text-red-700 uppercase">Transfer update</p>
                <p className="mt-1.5 text-[14px] font-bold leading-relaxed text-red-800">
                  {cotReason || "No additional update was provided by the administrator."}
                </p>
              </div>
              <p className="rounded-lg bg-[#f7f7f4] px-3 py-2.5 text-[11px] font-medium leading-relaxed text-[#5d6266]">
                Please contact Customerservice@alliedcapitalbank.com if you have questions about this transfer.
              </p>
            </div>
          ) : (
            <>
              <form id="cot-modal-form" onSubmit={handleCot} className="space-y-3">
                <Field label="COT code" htmlFor="tm-cot">
                  <Input id="tm-cot" value={cotInput} onChange={(event) => setCotInput(event.target.value)} placeholder="Enter COT code" />
                </Field>
                <FormError>{cotError}</FormError>
                <p className="text-[10.5px] leading-relaxed text-[#858d92]">
                  The COT code is generated by the bank for this transaction.
                </p>
              </form>
            </>
          )}
        </div>
      )}
    </Modal>
  )
}
