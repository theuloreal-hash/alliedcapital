"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { sortTransactions, type AccountStatus, type BankUser, type Beneficiary, type Transaction } from "@/lib/bank"

type NewCustomer = {
  name: string
  email: string
  password: string
  openingBalance: number
  phone?: string
  dob?: string
}

type TransferInput = {
  amount: number
  beneficiary: Beneficiary
  note?: string
}

type Result = { ok: true } | { ok: false; error: string }
type TxResult = { ok: true; transactionId: string } | { ok: false; error: string }
type CotResult =
  | { ok: true; percent: number; reason: string; completed: boolean }
  | { ok: false; error: string }
type LoginResult = { ok: true; user: BankUser } | { ok: false; error: string }
type CreateResult = { ok: true; email: string; password: string } | { ok: false; error: string }
type ResetResult = { ok: true; password: string } | { ok: false; error: string }
type DemoCotIssueResult = { ok: true; code: string } | { ok: false; error: string }
type DemoCotRedemptionResult =
  | { ok: true; percent: number; description: string; demoOnly: true }
  | { ok: false; error: string }

type StatePayload = {
  currentUser: BankUser | null
  impersonatorId: string | null
  users: BankUser[]
  transactions: Transaction[]
}

type BankContextValue = {
  ready: boolean
  users: BankUser[]
  transactions: Transaction[]
  currentUser: BankUser | null
  customers: BankUser[]
  impersonatorId: string | null
  userTransactions: (userId: string) => Transaction[]
  login: (email: string, password: string) => Promise<LoginResult>
  logout: () => Promise<void>
  createCustomer: (input: NewCustomer) => Promise<CreateResult>
  updateCustomer: (
    userId: string,
    updates: Partial<Pick<BankUser, "name" | "email" | "phone" | "dob" | "accountNumber">> & {
      password?: string
      avatarUrl?: string | null
    },
  ) => Promise<Result>
  setCustomerStatus: (userId: string, status: AccountStatus) => Promise<void>
  deleteCustomer: (userId: string) => Promise<void>
  restoreCustomer: (userId: string) => Promise<void>
  adjustBalance: (userId: string, amount: number, direction: "in" | "out", note: string) => Promise<Result>
  deposit: (userId: string, amount: number, source: string, note?: string) => Promise<Result>
  initiateTransfer: (userId: string, input: TransferInput) => Promise<TxResult>
  submitCot: (transactionId: string, code: string) => Promise<CotResult>
  generateCot: (transactionId: string, code: string, percent: number, reason: string) => Promise<Result>
  issueDemoCot: (userId: string, percent: number, description: string) => Promise<DemoCotIssueResult>
  redeemDemoCot: (code: string) => Promise<DemoCotRedemptionResult>
  changePassword: (currentPassword: string, newPassword: string) => Promise<Result>
  resetPassword: (userId: string, password: string) => Promise<ResetResult>
  impersonateCustomer: (userId: string) => Promise<void>
  stopImpersonation: () => Promise<void>
}

const EMPTY: StatePayload = { currentUser: null, impersonatorId: null, users: [], transactions: [] }

const BankContext = createContext<BankContextValue | null>(null)

export function BankProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StatePayload>(EMPTY)
  const [ready, setReady] = useState(false)

  const apply = useCallback((payload: Partial<StatePayload> | undefined) => {
    if (!payload) return
    setState({
      currentUser: payload.currentUser ?? null,
      impersonatorId: payload.impersonatorId ?? null,
      users: payload.users ?? [],
      transactions: payload.transactions ?? [],
    })
  }, [])

  const refresh = useCallback(async () => {
    const response = await fetch("/api/state", { cache: "no-store" })
    const data = await response.json()
    if (response.ok) apply(data)
    return data
  }, [apply])

  useEffect(() => {
    refresh()
      .catch(() => setState(EMPTY))
      .finally(() => setReady(true))
  }, [refresh])

  const action = useCallback(
    async (name: string, payload: Record<string, unknown>) => {
      const response = await fetch("/api/actions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: name, payload }),
      })
      const data = await response.json().catch(() => ({ ok: false, error: "Unexpected server response." }))
      if (data?.state) apply(data.state)
      return data
    },
    [apply],
  )

  const login = useCallback(
    async (email: string, password: string): Promise<LoginResult> => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json().catch(() => ({ ok: false, error: "Unexpected server response." }))
      if (data?.ok) apply(data.state)
      return data
    },
    [apply],
  )

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null)
    setState(EMPTY)
  }, [])

  const impersonateCustomer = useCallback(
    async (userId: string) => {
      const response = await fetch("/api/auth/impersonate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ customerId: userId }),
      })
      const data = await response.json().catch(() => null)
      if (data?.ok) apply(data.state)
    },
    [apply],
  )

  const stopImpersonation = useCallback(async () => {
    const response = await fetch("/api/auth/impersonate", { method: "DELETE" })
    const data = await response.json().catch(() => null)
    if (data?.ok) apply(data.state)
  }, [apply])

  const currentUser = state.currentUser
  const customers = useMemo(
    () => state.users.filter((user) => user.role === "user" && user.status !== "Deleted"),
    [state.users],
  )

  const userTransactions = useCallback(
    (userId: string) => sortTransactions(state.transactions.filter((row) => row.userId === userId)),
    [state.transactions],
  )

  const value: BankContextValue = {
    ready,
    users: state.users,
    transactions: sortTransactions(state.transactions),
    currentUser,
    customers,
    impersonatorId: state.impersonatorId,
    userTransactions,
    login,
    logout,
    createCustomer: async (input) => {
      const data = await action("createCustomer", { ...input })
      if (!data?.ok) return { ok: false, error: data?.error ?? "Could not create the customer." }
      return { ok: true, email: input.email.trim().toLowerCase(), password: input.password }
    },
    updateCustomer: async (userId, updates) => {
      const data = await action("updateCustomer", { userId, updates })
      return data?.ok ? { ok: true } : { ok: false, error: data?.error ?? "Could not update the customer." }
    },
    setCustomerStatus: async (userId, status) => {
      await action("setCustomerStatus", { userId, status })
    },
    deleteCustomer: async (userId) => {
      await action("deleteCustomer", { userId })
    },
    restoreCustomer: async (userId) => {
      await action("restoreCustomer", { userId })
    },
    adjustBalance: async (userId, amount, direction, note) => {
      const data = await action("adjustBalance", { userId, amount, direction, note })
      return data?.ok ? { ok: true } : { ok: false, error: data?.error ?? "Could not adjust the balance." }
    },
    deposit: async (userId, amount, source, note) => {
      const data = await action("deposit", { userId, amount, source, note })
      return data?.ok ? { ok: true } : { ok: false, error: data?.error ?? "Could not complete the deposit." }
    },
    initiateTransfer: async (userId, input) => {
      const data = await action("initiateTransfer", { userId, ...input })
      return data?.ok
        ? { ok: true, transactionId: String(data.transactionId) }
        : { ok: false, error: data?.error ?? "Could not start the transfer." }
    },
    submitCot: async (transactionId, code) => {
      const data = await action("submitCot", { transactionId, code })
      return data?.ok
        ? { ok: true, percent: Number(data.percent), reason: String(data.reason ?? ""), completed: Boolean(data.completed) }
        : { ok: false, error: data?.error ?? "Could not verify the COT code." }
    },
    generateCot: async (transactionId, code, percent, reason) => {
      const data = await action("generateCot", { transactionId, code, percent, reason })
      return data?.ok ? { ok: true } : { ok: false, error: data?.error ?? "Could not generate the COT code." }
    },
    issueDemoCot: async (userId, percent, description) => {
      const data = await action("issueDemoCot", { userId, percent, description })
      return data?.ok && typeof data.code === "string"
        ? { ok: true, code: data.code }
        : { ok: false, error: data?.error ?? "Could not issue the demo code." }
    },
    redeemDemoCot: async (code) => {
      const data = await action("redeemDemoCot", { code })
      return data?.ok
        ? {
            ok: true,
            percent: Number(data.percent),
            description: String(data.description ?? ""),
            demoOnly: true,
          }
        : { ok: false, error: data?.error ?? "Could not redeem the demo code." }
    },
    changePassword: async (currentPassword, newPassword) => {
      const data = await action("changePassword", { currentPassword, newPassword })
      return data?.ok ? { ok: true } : { ok: false, error: data?.error ?? "Could not change the password." }
    },
    resetPassword: async (userId, password) => {
      const data = await action("resetPassword", { userId, password })
      return data?.ok
        ? { ok: true, password: String(data.password ?? password) }
        : { ok: false, error: data?.error ?? "Could not reset the password." }
    },
    impersonateCustomer,
    stopImpersonation,
  }

  return <BankContext.Provider value={value}>{children}</BankContext.Provider>
}

export function useBank() {
  const context = useContext(BankContext)
  if (!context) throw new Error("useBank must be used inside BankProvider")
  return context
}
