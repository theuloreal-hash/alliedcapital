"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { KeyRound, ShieldCheck } from "lucide-react"
import { AsyncButton } from "@/components/bank/async-button"
import { Modal } from "@/components/bank/modal"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/bank/ui"
import { FormError, Input } from "@/components/bank/form"
import { usePendingAction } from "@/components/bank/use-pending-action"
import { useBank } from "@/lib/bank-store"

type DemoRedemption = {
  percent: number
  description: string
}

export function DemoCotPanel() {
  const { redeemDemoCot } = useBank()
  const { pending, run } = usePendingAction()
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [redemption, setRedemption] = useState<DemoRedemption | null>(null)
  const [progress, setProgress] = useState(0)
  const [complete, setComplete] = useState(false)
  const [open, setOpen] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const requestGeneration = useRef(0)

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  function clearTimers() {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  function closeModal() {
    requestGeneration.current += 1
    clearTimers()
    setOpen(false)
    setCode("")
    setError("")
    setRedemption(null)
    setProgress(0)
    setComplete(false)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const generation = ++requestGeneration.current
    await run(async () => {
      setError("")
      setRedemption(null)
      setProgress(0)
      setComplete(false)
      clearTimers()

      const result = await redeemDemoCot(code)
      if (generation !== requestGeneration.current) return
      if (!result.ok) {
        setError(result.error)
        return
      }

      setRedemption({ percent: result.percent, description: result.description })
      setCode("")
      timers.current.push(setTimeout(() => setProgress(result.percent), 50))
      if (result.percent === 100) {
        timers.current.push(setTimeout(() => setComplete(true), 1900))
      }
    })
  }

  return (
    <>
      <Card className="mt-5 overflow-hidden">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[13px] font-semibold text-[#35414a]">
              <KeyRound className="size-4 text-primary" />
              Enter COT CODE FOR TRANSFER
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Enter a one-time code supplied to preview a transfer status.
            </p>
          </div>
          <Button
            type="button"
            className="h-9 shrink-0 px-3 text-[12px] font-semibold"
            onClick={() => setOpen(true)}
          >
            Enter COT code
          </Button>
        </div>
      </Card>

      {open && (
        <Modal
          title={complete ? "Transfer complete" : redemption ? "Transfer status" : "Enter COT code"}
          description=""
          onClose={closeModal}
          footer={
            !redemption ? (
              <>
                <Button type="button" variant="outline" className="h-9 px-3 text-[12px]" onClick={closeModal}>
                  Cancel
                </Button>
                <AsyncButton
                  type="submit"
                  form="demo-cot-form"
                  pending={pending}
                  pendingText="Checking code…"
                  className="h-9 px-3 text-[12px] font-semibold"
                >
                  Continue
                </AsyncButton>
              </>
            ) : (
              <Button type="button" className="h-9 px-3 text-[12px] font-semibold" onClick={closeModal}>
                {complete ? "Close" : "Done"}
              </Button>
            )
          }
        >
          {!redemption ? (
            <form id="demo-cot-form" onSubmit={handleSubmit} className="space-y-3">
              <Input
                aria-label="Enter code"
                autoComplete="off"
                maxLength={10}
                placeholder="Enter 10-character code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                required
              />
              <FormError>{error}</FormError>
            </form>
          ) : complete ? (
            <div className="relative overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-7 text-center">
              <div className="pointer-events-none absolute inset-x-8 top-0 h-20" aria-hidden="true">
                {Array.from({ length: 14 }, (_, index) => (
                  <span
                    key={index}
                    className="cot-confetti absolute top-0 size-2 rounded-sm"
                    style={{
                      left: `${(index * 37 + 9) % 100}%`,
                      backgroundColor: ["#16a34a", "#f59e0b", "#0ea5e9", "#ec4899"][index % 4],
                      animationDelay: `${(index % 7) * 90}ms`,
                    }}
                  />
                ))}
              </div>
              <div className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                <ShieldCheck className="size-8" />
              </div>
              <h3 className="mt-4 text-[18px] font-bold text-emerald-950">Transfer complete</h3>
              <p className="mt-1 text-[12px] font-semibold text-emerald-800">
                Your transfer has been completed successfully.
              </p>
              <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2.5 text-left">
                <p className="text-[10px] font-bold tracking-wide text-red-700 uppercase">Administrator’s message</p>
                <p className="mt-1 text-[13px] font-bold leading-relaxed text-red-800">{redemption.description}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[12px] text-[#44534b]">
                <span className="font-semibold">Transferring...</span>
                <span className="font-bold tabular-nums text-emerald-700">{progress}%</span>
              </div>
              <div
                className="h-8 w-full overflow-hidden rounded-full bg-emerald-100 shadow-inner"
                role="progressbar"
                aria-label="Demo transfer progress"
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
                <p className="text-[10px] font-bold tracking-wide text-red-700 uppercase">Transfer information</p>
                <p className="mt-1.5 text-[14px] font-bold leading-relaxed text-red-800">{redemption.description}</p>
              </div>
              {redemption.percent < 100 && (
                <p className="rounded-lg bg-[#f7f7f4] px-3 py-2.5 text-[11px] font-medium leading-relaxed text-[#5d6266]">
                   Please contact Customerservice@alliedcapitalbank.com if you have questions about this transfer.
                </p>
              )}
            </div>
          )}
        </Modal>
      )}
    </>
  )
}
