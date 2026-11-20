import type { ReactNode } from "react"
import type { Metadata } from "next"
import { AppShell } from "@/components/bank/app-shell"
import { AuthGuard } from "@/components/bank/auth-guard"

export const metadata: Metadata = {
  title: "Administration",
  description: "Allied Capital Bank administration.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard role="admin">
      <AppShell role="admin">{children}</AppShell>
    </AuthGuard>
  )
}
