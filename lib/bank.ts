export type Role = "user" | "admin"
export type AccountStatus = "Active" | "Suspended" | "Deleted"
export type TxType = "deposit" | "transfer" | "payment" | "credit" | "debit"
export type TxStatus = "Completed" | "Pending" | "Failed"
export type Direction = "in" | "out"

export type Beneficiary = {
  name: string
  bank: string
  iban: string
  bic: string
}

export type Transaction = {
  id: string
  userId: string
  type: TxType
  direction: Direction
  description: string
  amount: number
  status: TxStatus
  date: string
  reference: string
  beneficiary?: Beneficiary
  source?: string
  cotCode?: string
  cotPercent?: number
  cotReason?: string
  cotSubmittedAt?: string
}

export type BankUser = {
  id: string
  name: string
  email: string
  username?: string
  role: Role
  accountNumber: string
  balance: number
  status: AccountStatus
  createdAt: string
  phone?: string
  dob?: string
  deletedAt?: string
}

export const DEFAULT_BENEFICIARY: Beneficiary = {
  name: "",
  bank: "",
  iban: "",
  bic: "",
}

export function generateCotCode() {
  const groups = ["ABCDEFGHJKLMNPQRSTUVWXYZ", "abcdefghijkmnopqrstuvwxyz", "23456789", "!@#$%&*+-=?"]
  const allCharacters = groups.join("")
  const randomIndex = (limit: number) => {
    const range = 0x1_0000_0000
    const ceiling = Math.floor(range / limit) * limit
    const value = new Uint32Array(1)
    do {
      globalThis.crypto.getRandomValues(value)
    } while (value[0] >= ceiling)
    return value[0] % limit
  }

  const characters = groups.map((group) => group[randomIndex(group.length)])
  while (characters.length < 10) characters.push(allCharacters[randomIndex(allCharacters.length)])

  for (let index = characters.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1)
    ;[characters[index], characters[swapIndex]] = [characters[swapIndex], characters[index]]
  }

  return characters.join("")
}

export const TX_TYPE_LABELS: Record<TxType, string> = {
  deposit: "Deposit",
  transfer: "Transfer",
  payment: "Card payment",
  credit: "Admin credit",
  debit: "Admin debit",
}

export const currency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })

export const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")

export const maskedAccount = (accountNumber: string) => `•••• •••• •••• ${accountNumber.slice(-4)}`

export const sortTransactions = (rows: Transaction[]) =>
  [...rows].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

export const isThisMonth = (iso: string) => {
  const date = new Date(iso)
  const now = new Date()
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
}

export const sumAmounts = (rows: Transaction[], direction?: Direction) =>
  rows.filter((row) => (direction ? row.direction === direction : true)).reduce((total, row) => total + row.amount, 0)
