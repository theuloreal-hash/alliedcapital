import type { ReactNode } from "react"
import type { Metadata } from "next"
import { AppShell } from "@/components/bank/app-shell"
import { AuthGuard } from "@/components/bank/auth-guard"

export const metadata: Metadata = {
  title: {
    default: "Online Banking",
    template: "%s | Allied Capital Bank",
  },
  description: "Secure Allied Capital Bank online banking.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function BankingLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard role="user">
      <AppShell role="user">{children}</AppShell>
    </AuthGuard>
  )
}
