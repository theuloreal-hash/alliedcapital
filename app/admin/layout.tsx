import type { ReactNode } from "react"
import { AppShell } from "@/components/bank/app-shell"
import { AuthGuard } from "@/components/bank/auth-guard"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard role="admin">
      <AppShell role="admin">{children}</AppShell>
    </AuthGuard>
  )
}
