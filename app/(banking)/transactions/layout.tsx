import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Transaction History",
  description: "Review your Allied Capital Bank deposits, payments and transfers.",
}

export default function TransactionsRouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
