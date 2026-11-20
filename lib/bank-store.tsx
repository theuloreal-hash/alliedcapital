"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { type ReactNode } from "react"

// Provider uses localStorage for the session token (keeps useBank() hook working
// everywhere AppShell/AuthGuard currently import it). State is fetched from /api/state
// after mount; all mutations go through the API routes (POST /api/actions).
type Value = {
  currentUser: import("@/lib/bank").BankUser | null
  impersonatorId: string | null
  users: import("@/lib/bank").BankUser[]
  transactions: import("@/lib/bank").Transaction[]
}

const BankContext = createContext<Value | null>(null)

export function BankProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Value>({
    currentUser: null,
    impersonatorId: null,
    users: [],
    transactions: [],
  })

  useEffect(() => {
    async function bootstrap() {
      try {
        const raw = localStorage.getItem("capital-bank:session:v1")
        const sessionId = raw ?? crypto.randomUUID()
        if (!raw) localStorage.setItem("capital-bank:session:v1", sessionId)

        const resp = await fetch("/api/state", {
          method: "GET",
          headers: { "x-session-id": sessionId },
          cache: "no-store",
        })
        const data = await resp.json()
        if (!resp.ok) throw new Error(data.error ?? "Failed to load state")

        setState({
          currentUser: data.currentUser ?? null,
          impersonatorId: data.impersonatorId ?? null,
          users: data.users ?? [],
          transactions: data.transactions ?? [],
        })
      } catch (e: any) {
        console.error("[BankProvider] bootstrap error:", e)
        setState({
          currentUser: null,
          impersonatorId: null,
          users: [],
          transactions: [],
        })
      }
    }
    bootstrap()
  }, [])

  return <BankContext.Provider value={state}>{children}</BankContext.Provider>
}

export function useBank() {
  const context = useContext(BankContext)
  if (!context) throw new Error("useBank must be used inside BankProvider")
  return context
}