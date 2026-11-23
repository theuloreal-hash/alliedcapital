"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { KeyRound, ShieldCheck } from "lucide-react"
import { AsyncButton } from "@/components/bank/async-button"
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
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  function clearTimers() {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    await run(async () => {
      setError("")
      setRedemption(null)
      setProgress(0)
      setComplete(false)
      clearTimers()

      const result = await redeemDemoCot(code)
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
    <Card className="mt-5 overflow-hidden">
      <div className="border-b border-border px-4 py-3.5">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-[#35414a]">
          <KeyRound className="size-4 text-primary" />
          Enter COT CODE FOR TRANSFER
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          Enter a one-time code supplied to preview a transfer status.
        </p>
      </div>
      <div className="space-y-4 p-4">
        {!redemption ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              aria-label="Enter code"
              autoComplete="off"
              maxLength={10}
              placeholder="Enter 10-character  code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              required
            />
            <FormError>{error}</FormError>
            <AsyncButton
              type="submit"
              pending={pending}
              pendingText="Checking code…"
              className="h-9 px-3 text-[12px] font-semibold"
            >
          Verify code
            </AsyncButton>
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
            <h3 className="mt-4 text-[18px] font-bold text-emerald-950">Demo complete</h3>
            <p className="mt-1 text-[12px] font-semibold text-emerald-800">
              This simulation did not send money or change your account balance.
            </p>
            <div className="mt-4 rounded-lg border border-emerald-200 bg-white/80 px-3 py-2.5 text-left">
              <p className="text-[10px] font-bold tracking-wide text-emerald-700 uppercase">Administrator’s demo message</p>
              <p className="mt-1 text-[13px] font-bold leading-relaxed text-emerald-950">{redemption.description}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setRedemption(null)
                setProgress(0)
                setComplete(false)
              }}
              className="mt-4 text-[11px] font-semibold text-emerald-800 underline"
            >
              Enter another demo code
            </button>
          </div>
        ) : (
          <div className="space-y-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
            <div className="flex items-center justify-between text-[12px] text-[#44534b]">
              <span className="font-semibold">Transferring...</span>
              <span className="font-bold tabular-nums text-emerald-700">{progress}%</span>
            </div>
            <div
              className="h-7 w-full overflow-hidden rounded-full bg-emerald-100 shadow-inner"
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
            <div className="rounded-lg border border-emerald-200 bg-white/80 px-3 py-2.5">
              <p className="text-[10px] font-bold tracking-wide text-emerald-700 uppercase">Administrator’s demo message</p>
              <p className="mt-1 text-[13px] font-bold leading-relaxed text-emerald-950">{redemption.description}</p>
            </div>
            {redemption.percent < 100 && (
              <p className="text-[11px] font-medium leading-relaxed text-emerald-900">
                This is a school demo only. Follow the instruction shown for the test. Never email passwords, account
                details, or authentication codes.
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
