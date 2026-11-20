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
  password: string
  role: Role
  accountNumber: string
  balance: number
  status: AccountStatus
  createdAt: string
  phone?: string
  dob?: string
  deletedAt?: string
}

export type BankData = {
  users: BankUser[]
  transactions: Transaction[]
}

export const DEFAULT_BENEFICIARY: Beneficiary = {
  name: "IMAFIDON HELEN",
  bank: "Credit Agricole Bank, France",
  iban: "FR76 1390 6000 8000 2047 7390 496",
  bic: "AGRIFRPP839",
}

export const DEMO_ADMIN = { email: "admin@capitalbank.demo", password: "admin123" }
export const DEMO_CUSTOMER = { email: "jordan.lee@capitalbank.demo", password: "demo1234" }

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

export function makeId(prefix: string) {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10)
  return `${prefix}_${random}`
}

export function makeAccountNumber() {
  const block = () => String(Math.floor(1000 + Math.random() * 9000))
  return `4${block()} ${block()} ${block()} ${block()}`
}

export function buildSeed(): BankData {
  const now = Date.now()
  const day = 86_400_000
  const monthsAgo = (months: number) => {
    const date = new Date(now)
    date.setMonth(date.getMonth() - months)
    return date.toISOString()
  }
  const at = (days: number, hour: number, minute = 0) => {
    const date = new Date(now - days * day)
    date.setHours(hour, minute, 0, 0)
    return date.toISOString()
  }

  const users: BankUser[] = [
    {
      id: "usr_admin",
      name: "Adaeze Nwosu",
      email: DEMO_ADMIN.email,
      password: DEMO_ADMIN.password,
      role: "admin",
      accountNumber: "0000 0000 0001",
      balance: 0,
      status: "Active",
      createdAt: monthsAgo(30),
    },
    {
      id: "usr_jordan",
      name: "Jordan Lee",
      email: DEMO_CUSTOMER.email,
      password: DEMO_CUSTOMER.password,
      role: "user",
      accountNumber: "4821 9034 7712 4812",
      balance: 24850.75,
      status: "Active",
      createdAt: monthsAgo(26),
    },
    {
      id: "usr_morgan",
      name: "Morgan Patel",
      email: "morgan.patel@capitalbank.demo",
      password: "demo1234",
      role: "user",
      accountNumber: "9027 4410 6638 9027",
      balance: 18740.2,
      status: "Active",
      createdAt: monthsAgo(18),
    },
    {
      id: "usr_taylor",
      name: "Taylor Brooks",
      email: "taylor.brooks@capitalbank.demo",
      password: "demo1234",
      role: "user",
      accountNumber: "1635 8820 4491 1635",
      balance: 9230,
      status: "Suspended",
      createdAt: monthsAgo(12),
    },
    {
      id: "usr_casey",
      name: "Casey Rivera",
      email: "casey.rivera@capitalbank.demo",
      password: "demo1234",
      role: "user",
      accountNumber: "7110 3345 2287 7110",
      balance: 5120.48,
      status: "Active",
      createdAt: monthsAgo(7),
    },
    {
      id: "usr_amara",
      name: "Amara Okafor",
      email: "amara.okafor@capitalbank.demo",
      password: "demo1234",
      role: "user",
      accountNumber: "2384 5590 1176 2384",
      balance: 3210.9,
      status: "Active",
      createdAt: monthsAgo(3),
    },
  ]

  let seq = 0
  const tx = (
    userId: string,
    type: TxType,
    direction: Direction,
    description: string,
    amount: number,
    date: string,
    status: TxStatus = "Completed",
    extra: Partial<Transaction> = {},
  ): Transaction => ({
    id: `seed_tx_${++seq}`,
    userId,
    type,
    direction,
    description,
    amount,
    date,
    status,
    reference: `${type.slice(0, 3).toUpperCase()}-${String(84210 + seq * 37)}`,
    ...extra,
  })

  const transactions: Transaction[] = [
    tx("usr_jordan", "payment", "out", "Willow Market · card •••• 4812", 84.32, at(0, 10, 42)),
    tx("usr_jordan", "deposit", "in", "Studio North · monthly salary", 4250, at(0, 8, 15), "Completed", {
      source: "External account •••• 1038",
    }),
    tx("usr_jordan", "transfer", "out", "Alex Morgan · rent contribution", 320, at(1, 16, 5), "Completed", {
      beneficiary: { name: "Alex Morgan", bank: "Chase Bank", iban: "US64 CHAS 7100 0000 1137 4472", bic: "CHASUS33" },
    }),
    tx("usr_jordan", "payment", "out", "Metro Transit · transit top-up", 12.5, at(1, 9, 12)),
    tx("usr_jordan", "payment", "out", "Olive & Rye · dining", 38.9, at(4, 20, 8)),
    tx("usr_jordan", "debit", "out", "Evergreen Utilities · direct debit", 96.24, at(6, 7, 30), "Pending"),
    tx("usr_jordan", "deposit", "in", "Aurora Travel · booking refund", 1200, at(11, 14, 25), "Completed", {
      source: "External account •••• 1038",
    }),
    tx("usr_jordan", "transfer", "out", "Studio North · equipment reimbursement", 145.75, at(13, 11, 40)),
    tx("usr_morgan", "deposit", "in", "Northwind Studio · salary", 3800, at(0, 7, 55), "Completed", {
      source: "External account •••• 5521",
    }),
    tx("usr_morgan", "payment", "out", "Harbour Rentals · November rent", 1450, at(2, 12, 15)),
    tx("usr_morgan", "transfer", "out", "Jamie Chen · shared utilities", 128.4, at(5, 18, 20)),
    tx("usr_taylor", "payment", "out", "Brightside Pharmacy · purchase", 42.18, at(3, 13, 5)),
    tx("usr_taylor", "deposit", "in", "Freelance invoice #204", 610, at(8, 10, 50)),
    tx("usr_casey", "deposit", "in", "Lumen Labs · salary", 2960, at(0, 9, 25), "Completed", {
      source: "External account •••• 7782",
    }),
    tx("usr_casey", "transfer", "out", "Priya Shah · dinner split", 56.3, at(2, 21, 10)),
    tx("usr_amara", "debit", "out", "Acorn Insurance · monthly premium", 88.5, at(1, 6, 45)),
    tx("usr_amara", "deposit", "in", "Opening deposit", 3300, at(16, 9, 0), "Completed", {
      source: "Branch deposit",
    }),
  ]

  return { users, transactions }
}
