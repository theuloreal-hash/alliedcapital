import type { ReactNode } from "react"
import { AppShell } from "@/components/bank/app-shell"
import { AuthGuard } from "@/components/bank/auth-guard"

export default function BankingLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard role="user">
      <AppShell role="user">{children}</AppShell>
    </AuthGuard>
  )
}
