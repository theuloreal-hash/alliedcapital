"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { CheckCircle2, X, XCircle } from "lucide-react"

export function useToast() {
  const [message, setMessage] = useState<string | null>(null)
  const [tone, setTone] = useState<"success" | "error">("success")
  const timer = useRef<number | undefined>(undefined)

  const notify = useCallback((next: string, nextTone: "success" | "error" = "success") => {
    setTone(nextTone)
    setMessage(next)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setMessage(null), 3600)
  }, [])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  return { message, tone, notify }
}

export function Toast({ message, tone = "success" }: { message: string | null; tone?: "success" | "error" }) {
  if (!message) return null
  return (
    <div
      role="status"
      className="fixed right-4 bottom-4 z-[80] flex max-w-[calc(100vw-32px)] items-start gap-2.5 rounded-lg border border-border bg-card px-4 py-3 text-[12px] text-[#4f5b63] shadow-lg sm:right-6 sm:bottom-6"
    >
      {tone === "success" ? (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#63916d]" />
      ) : (
        <XCircle className="mt-0.5 size-4 shrink-0 text-[#b05b4f]" />
      )}
      <span className="pr-1">{message}</span>
      <X className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
    </div>
  )
}
