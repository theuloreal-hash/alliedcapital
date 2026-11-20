"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  buildSeed,
  currency,
  makeAccountNumber,
  makeId,
  sortTransactions,
  type AccountStatus,
  type BankData,
  type BankUser,
  type Beneficiary,
  type Transaction,
} from "@/lib/bank"

const DATA_KEY = "capital-bank:data:v1"
const SESSION_KEY = "capital-bank:session:v1"
const IMPERSONATOR_KEY = "capital-bank:impersonator:v1"

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

type Result = { ok: true; transactionId?: string } | { ok: false; error: string }

type CotResult =
  | { ok: true; percent: number; reason: string; completed: boolean }
  | { ok: false; error: string }

type BankContextValue = {
  ready: boolean
  users: BankUser[]
  transactions: Transaction[]
  currentUser: BankUser | null
  customers: BankUser[]
  impersonatorId: string | null
  userTransactions: (userId: string) => Transaction[]
  login: (email: string, password: string) => BankUser | null
  logout: () => void
  createCustomer: (input: NewCustomer) => Result
  updateCustomer: (userId: string, updates: Partial<Pick<BankUser, "name" | "email" | "password" | "phone" | "dob" | "accountNumber">>) => Result
  setCustomerStatus: (userId: string, status: AccountStatus) => void
  deleteCustomer: (userId: string) => void
  restoreCustomer: (userId: string) => void
  adjustBalance: (userId: string, amount: number, direction: "in" | "out", note: string) => Result
  deposit: (userId: string, amount: number, source: string, note?: string) => Result
  initiateTransfer: (userId: string, input: TransferInput) => Result
  submitCot: (transactionId: string, code: string) => CotResult
  generateCot: (transactionId: string, code: string, percent: number, reason: string) => Result
  impersonateCustomer: (userId: string) => void
  stopImpersonation: () => void
  resetDemo: () => void
}

const BankContext = createContext<BankContextValue | null>(null)

export function BankProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<BankData>(() => buildSeed())
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [impersonatorId, setImpersonatorId] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DATA_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as BankData
        if (Array.isArray(parsed.users) && Array.isArray(parsed.transactions) && parsed.users.length > 0) {
          setData(parsed)
        }
      }
      setSessionId(localStorage.getItem(SESSION_KEY))
      setImpersonatorId(localStorage.getItem(IMPERSONATOR_KEY))
    } catch {
      // Corrupt storage falls back to the seeded demo data.
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(DATA_KEY, JSON.stringify(data))
    } catch {
      // Storage can be unavailable in private mode; the app keeps working in memory.
    }
  }, [data, ready])

  useEffect(() => {
    if (!ready) return
    try {
      if (sessionId) localStorage.setItem(SESSION_KEY, sessionId)
      else localStorage.removeItem(SESSION_KEY)
      if (impersonatorId) localStorage.setItem(IMPERSONATOR_KEY, impersonatorId)
      else localStorage.removeItem(IMPERSONATOR_KEY)
    } catch {
      // Ignore storage failures.
    }
  }, [sessionId, impersonatorId, ready])

  const currentUser = useMemo(
    () => data.users.find((user) => user.id === sessionId) ?? null,
    [data.users, sessionId],
  )

  const customers = useMemo(() => data.users.filter((user) => user.role === "user" && user.status !== "Deleted"), [data.users])

  const login = useCallback(
    (email: string, password: string) => {
      const match = data.users.find(
        (user) => user.email.toLowerCase() === email.trim().toLowerCase() && user.password === password,
      )
      if (!match) return null
      setSessionId(match.id)
      setImpersonatorId(null)
      return match
    },
    [data.users],
  )

  const logout = useCallback(() => {
    setSessionId(null)
    setImpersonatorId(null)
  }, [])

  const userTransactions = useCallback(
    (userId: string) => sortTransactions(data.transactions.filter((row) => row.userId === userId)),
    [data.transactions],
  )

  const addTransaction = useCallback((transaction: Transaction) => {
    setData((current) => ({ ...current, transactions: [transaction, ...current.transactions] }))
  }, [])

  const createCustomer = useCallback<BankContextValue["createCustomer"]>(
    ({ name, email, password, openingBalance, phone, dob }) => {
      const cleanName = name.trim()
      const cleanEmail = email.trim().toLowerCase()
      if (cleanName.length < 2) return { ok: false, error: "Enter the customer's full name." }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return { ok: false, error: "Enter a valid email address." }
      if (data.users.some((user) => user.email.toLowerCase() === cleanEmail)) {
        return { ok: false, error: "A customer with that email already exists." }
      }
      if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." }
      if (!Number.isFinite(openingBalance) || openingBalance < 0) {
        return { ok: false, error: "Opening balance must be zero or more." }
      }

      const user: BankUser = {
        id: makeId("usr"),
        name: cleanName,
        email: cleanEmail,
        password,
        role: "user",
        accountNumber: makeAccountNumber(),
        balance: openingBalance,
        status: "Active",
        createdAt: new Date().toISOString(),
        phone,
        dob,
      }

      const opening =
        openingBalance > 0
          ? {
              id: makeId("tx"),
              userId: user.id,
              type: "deposit" as const,
              direction: "in" as const,
              description: "Opening deposit",
              amount: openingBalance,
              status: "Completed" as const,
              date: new Date().toISOString(),
              reference: `DEP-${Math.floor(100000 + Math.random() * 900000)}`,
              source: "Set up by administrator",
            }
          : null

      setData((current) => ({
        users: [...current.users, user],
        transactions: opening ? [opening, ...current.transactions] : current.transactions,
      }))
      return { ok: true }
    },
    [data.users],
  )

  const updateCustomer = useCallback<BankContextValue["updateCustomer"]>(
    (userId, updates) => {
      const user = data.users.find((row) => row.id === userId)
      if (!user) return { ok: false, error: "Customer not found." }
      if (updates.email) {
        const cleanEmail = updates.email.trim().toLowerCase()
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
          return { ok: false, error: "Enter a valid email address." }
        }
        if (data.users.some((row) => row.id !== userId && row.email.toLowerCase() === cleanEmail)) {
          return { ok: false, error: "A customer with that email already exists." }
        }
        updates = { ...updates, email: cleanEmail }
      }
      setData((current) => ({
        ...current,
        users: current.users.map((row) => (row.id === userId ? { ...row, ...updates } : row)),
      }))
      return { ok: true }
    },
    [data.users],
  )

  const setCustomerStatus = useCallback((userId: string, status: AccountStatus) => {
    setData((current) => ({
      ...current,
      users: current.users.map((user) => (user.id === userId ? { ...user, status, deletedAt: status === "Deleted" ? new Date().toISOString() : user.deletedAt } : user)),
    }))
  }, [])

  const deleteCustomer = useCallback((userId: string) => {
    setCustomerStatus(userId, "Deleted")
  }, [setCustomerStatus])

  const restoreCustomer = useCallback((userId: string) => {
    setCustomerStatus(userId, "Active")
  }, [setCustomerStatus])

  const adjustBalance = useCallback<BankContextValue["adjustBalance"]>(
    (userId, amount, direction, note) => {
      if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: "Enter an amount greater than $0.00." }
      const user = data.users.find((row) => row.id === userId)
      if (!user) return { ok: false, error: "Customer not found." }
      if (direction === "out" && amount > user.balance) {
        return { ok: false, error: `Insufficient balance. Available: ${currency(user.balance)}.` }
      }

      const signed = direction === "in" ? amount : -amount
      setData((current) => ({
        ...current,
        users: current.users.map((row) => (row.id === userId ? { ...row, balance: row.balance + signed } : row)),
        transactions: [
          {
            id: makeId("tx"),
            userId,
            type: direction === "in" ? "credit" : "debit",
            direction,
            description: note.trim() || (direction === "in" ? "Account credit" : "Account debit"),
            amount,
            status: "Completed",
            date: new Date().toISOString(),
            reference: `${direction === "in" ? "CRE" : "DEB"}-${Math.floor(100000 + Math.random() * 900000)}`,
            source: "Administrator adjustment",
          },
          ...current.transactions,
        ],
      }))
      return { ok: true }
    },
    [data.users],
  )

  const deposit = useCallback<BankContextValue["deposit"]>(
    (userId, amount, source, note) => {
      if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: "Enter a valid amount greater than $0.00." }
      const user = data.users.find((row) => row.id === userId)
      if (!user) return { ok: false, error: "Account not found." }
      if (user.status !== "Active") return { ok: false, error: "This account is suspended. Contact the bank." }

      setData((current) => ({
        ...current,
        users: current.users.map((row) => (row.id === userId ? { ...row, balance: row.balance + amount } : row)),
        transactions: [
          {
            id: makeId("tx"),
            userId,
            type: "deposit",
            direction: "in",
            description: note?.trim() || `Deposit from ${source}`,
            amount,
            status: "Completed",
            date: new Date().toISOString(),
            reference: `DEP-${Math.floor(100000 + Math.random() * 900000)}`,
            source,
          },
          ...current.transactions,
        ],
      }))
      return { ok: true }
    },
    [data.users],
  )

  const initiateTransfer = useCallback<BankContextValue["initiateTransfer"]>(
    (userId, { amount, beneficiary, note }) => {
      if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: "Enter a valid amount greater than $0.00." }
      const user = data.users.find((row) => row.id === userId)
      if (!user) return { ok: false, error: "Account not found." }
      if (user.status !== "Active") return { ok: false, error: "This account is suspended. Contact the bank." }
      if (amount > user.balance) {
        return { ok: false, error: `Insufficient funds. Available balance: ${currency(user.balance)}.` }
      }
      if (!beneficiary.name.trim() || !beneficiary.iban.trim()) {
        return { ok: false, error: "Beneficiary name and IBAN are required." }
      }

      const txId = makeId("tx")
      setData((current) => ({
        ...current,
        users: current.users.map((row) => (row.id === userId ? { ...row, balance: row.balance - amount } : row)),
        transactions: [
          {
            id: txId,
            userId,
            type: "transfer",
            direction: "out",
            description: note?.trim() || `${beneficiary.name} · international transfer`,
            amount,
            status: "Pending",
            date: new Date().toISOString(),
            reference: `TRF-${Math.floor(100000 + Math.random() * 900000)}`,
            beneficiary,
          },
          ...current.transactions,
        ],
      }))
      return { ok: true, transactionId: txId }
    },
    [data.users],
  )

  const submitCot = useCallback<BankContextValue["submitCot"]>(
    (transactionId, code) => {
      const tx = data.transactions.find((row) => row.id === transactionId)
      if (!tx) return { ok: false, error: "Transaction not found." }
      if (!tx.cotCode) return { ok: false, error: "No COT code has been generated for this transaction yet." }
      if (code.trim() !== tx.cotCode) return { ok: false, error: "Invalid COT code." }

      const percent = tx.cotPercent ?? 0
      const completed = percent >= 100
      const reason = tx.cotReason ?? ""

      setData((current) => ({
        ...current,
        transactions: current.transactions.map((row) =>
          row.id === transactionId
            ? {
                ...row,
                cotSubmittedAt: new Date().toISOString(),
                status: completed ? "Completed" : "Pending",
              }
            : row,
        ),
      }))

      return { ok: true, percent, reason, completed }
    },
    [data.transactions],
  )

  const generateCot = useCallback<BankContextValue["generateCot"]>(
    (transactionId, code, percent, reason) => {
      const tx = data.transactions.find((row) => row.id === transactionId)
      if (!tx) return { ok: false, error: "Transaction not found." }
      if (!code.trim()) return { ok: false, error: "Enter a COT code." }

      setData((current) => ({
        ...current,
        transactions: current.transactions.map((row) =>
          row.id === transactionId
            ? {
                ...row,
                cotCode: code.trim(),
                cotPercent: percent,
                cotReason: reason.trim(),
              }
            : row,
        ),
      }))
      return { ok: true }
    },
    [data.transactions],
  )

  const impersonateCustomer = useCallback((userId: string) => {
    const user = data.users.find((row) => row.id === userId)
    if (!user || user.role !== "user") return
    setImpersonatorId(sessionId)
    setSessionId(userId)
  }, [data.users, sessionId])

  const stopImpersonation = useCallback(() => {
    if (impersonatorId) {
      setSessionId(impersonatorId)
      setImpersonatorId(null)
    } else {
      setSessionId(null)
    }
  }, [impersonatorId])

  const resetDemo = useCallback(() => {
    setData(buildSeed())
    setSessionId(null)
    setImpersonatorId(null)
  }, [])

  const value: BankContextValue = {
    ready,
    users: data.users,
    transactions: sortTransactions(data.transactions),
    currentUser,
    customers,
    impersonatorId,
    userTransactions,
    login,
    logout,
    createCustomer,
    updateCustomer,
    setCustomerStatus,
    deleteCustomer,
    restoreCustomer,
    adjustBalance,
    deposit,
    initiateTransfer,
    submitCot,
    generateCot,
    impersonateCustomer,
    stopImpersonation,
    resetDemo,
  }

  return <BankContext.Provider value={value}>{children}</BankContext.Provider>
}

export function useBank() {
  const context = useContext(BankContext)
  if (!context) throw new Error("useBank must be used inside BankProvider")
  return context
}
