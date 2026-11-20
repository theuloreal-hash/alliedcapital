"use client"

import { useEffect, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useBank } from "@/lib/bank-store"
import { Brand } from "@/components/bank/brand"

export function AuthGuard({ role, children }: { role: "user" | "admin"; children: ReactNode }) {
  const { ready, currentUser } = useBank()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!ready) return
    if (!currentUser) {
      router.replace("/login")
      return
    }
    if (currentUser.role !== role) {
      router.replace(currentUser.role === "admin" ? "/admin" : "/dashboard")
    }
  }, [ready, currentUser, role, router, pathname])

  if (!ready || !currentUser || currentUser.role !== role) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Brand />
          <div className="size-5 animate-spin rounded-full border-2 border-[#e6e2d8] border-t-[#c78924]" />
          <span className="text-[11px] font-medium text-muted-foreground">Checking your session…</span>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
