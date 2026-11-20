import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Transfer Money",
  description: "Send funds to a beneficiary and track transfers in your Allied Capital Bank account.",
}

export default function TransferRouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
