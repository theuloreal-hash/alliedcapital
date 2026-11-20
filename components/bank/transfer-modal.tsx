"use client"

import { useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { ArrowLeftRight, Landmark, LockKeyhole, ShieldCheck } from "lucide-react"
import { Modal } from "@/components/bank/modal"
import { useToast } from "@/components/bank/toast"
import { Field, FieldHint, FormError, Input } from "@/components/bank/form"
import { Button } from "@/components/ui/button"
import { DEFAULT_BENEFICIARY, currency, type Beneficiary } from "@/lib/bank"
import { useBank } from "@/lib/bank-store"

function updateBeneficiary(current: Beneficiary, field: keyof Beneficiary, value: string) {
  return { ...current, [field]: value }
}

export function TransferModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { currentUser, initiateTransfer, submitCot } = useBank()
  const { notify } = useToast()

  const [beneficiary, setBeneficiary] = useState<Beneficiary>({ ...DEFAULT_BENEFICIARY })
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [error, setError] = useState("")
  const [txId, setTxId] = useState<string | null>(null)
  const [cotInput, setCotInput] = useState("")
  const [cotError, setCotError] = useState("")
  const [progress, setProgress] = useState(0)
  const [reason, setReason] = useState("")
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    if (!open) return
    setBeneficiary({ ...DEFAULT_BENEFICIARY })
    setAmount("")
    setNote("")
    setError("")
    setTxId(null)
    setCotInput("")
    setCotError("")
    setProgress(0)
    setReason("")
    setCompleted(false)
  }, [open])

  if (!open || !currentUser) return null

  const value = Number(amount)

  function handleTransfer(event: FormEvent) {
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
    const result = initiateTransfer(currentUser!.id, { amount: value, beneficiary, note })
    if (!result.ok) {
      setError(result.error)
      return
    }
    setTxId(result.transactionId ?? null)
  }

  function handleCot(event: FormEvent) {
    event.preventDefault()
    if (!txId) return
    setCotError("")
    const result = submitCot(txId, cotInput)
    if (!result.ok) {
      setCotError(result.error)
      return
    }
    setProgress(result.percent)
    setReason(result.reason)
    setCompleted(result.completed)
    setCotInput("")
    if (result.completed) {
      notify(`${currency(value)} sent to ${beneficiary.name}. Transfer complete.`)
    }
  }

  const stage = txId ? "cot" : "form"

  return (
    <Modal
      title={stage === "form" ? "Transfer money" : completed ? "Transfer complete" : "Transfer in progress"}
      description={
        stage === "form"
          ? "Send a transfer to your saved beneficiary."
          : completed
            ? "Your transfer has been completed successfully."
            : "Enter the COT code provided by the bank to continue."
      }
      onClose={onClose}
      footer={
        stage === "form" ? (
          <>
            <Button variant="outline" className="h-9 px-3 text-[12px]" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" form="transfer-modal-form" className="h-9 px-3 text-[12px] font-semibold">
              Transfer
            </Button>
          </>
        ) : completed ? (
          <Button className="h-9 px-3 text-[12px] font-semibold" onClick={onClose}>
            Close
          </Button>
        ) : (
          <>
            <Button variant="outline" className="h-9 px-3 text-[12px]" onClick={onClose}>
              Close
            </Button>
            <Button type="submit" form="cot-modal-form" className="h-9 px-3 text-[12px] font-semibold">
              Submit code
            </Button>
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
                <Input id="tm-name" value={beneficiary.name} onChange={(event) => setBeneficiary(updateBeneficiary(beneficiary, "name", event.target.value))} />
              </Field>
              <Field label="Bank" htmlFor="tm-bank">
                <Input id="tm-bank" value={beneficiary.bank} onChange={(event) => setBeneficiary(updateBeneficiary(beneficiary, "bank", event.target.value))} />
              </Field>
              <Field label="IBAN" htmlFor="tm-iban">
                <Input id="tm-iban" value={beneficiary.iban} onChange={(event) => setBeneficiary(updateBeneficiary(beneficiary, "iban", event.target.value.toUpperCase()))} className="font-mono text-[12px]" />
              </Field>
              <Field label="BIC / SWIFT" htmlFor="tm-bic">
                <Input id="tm-bic" value={beneficiary.bic} onChange={(event) => setBeneficiary(updateBeneficiary(beneficiary, "bic", event.target.value.toUpperCase()))} className="font-mono text-[12px]" />
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

          {progress > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11.5px] text-[#555555]">
                <span>Transfer progress</span>
                <span className="font-semibold">{progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#f2f2f2]">
                <div className="h-full bg-[#ddaa3f] transition-all" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
              </div>
              {reason && <p className="text-[11px] leading-relaxed text-[#777777]">{reason}</p>}
            </div>
          )}

          {completed ? (
            <div className="rounded-lg border border-[#e4ece5] bg-[#f4f8f4] px-3 py-2.5 text-[11.5px] text-[#5f7b6a]">
              Transfer completed. A confirmation email has been sent.
            </div>
          ) : (
            <form id="cot-modal-form" onSubmit={handleCot} className="space-y-3">
              <Field label="COT code" htmlFor="tm-cot">
                <Input id="tm-cot" value={cotInput} onChange={(event) => setCotInput(event.target.value)} placeholder="Enter COT code" />
              </Field>
              <FormError>{cotError}</FormError>
              <p className="text-[10.5px] leading-relaxed text-[#858d92]">
                The COT code is generated by the bank administrator for this transaction.
              </p>
            </form>
          )}
        </div>
      )}
    </Modal>
  )
}
