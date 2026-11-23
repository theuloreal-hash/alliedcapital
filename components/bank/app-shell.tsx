"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ArrowLeftRight,
  ArrowUpRight,
  ChevronRight,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  ShieldCheck,
  User,
  Users,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useBank } from "@/lib/bank-store"
import { Brand } from "@/components/bank/brand"
import { Avatar } from "@/components/bank/ui"
import { usePendingAction } from "@/components/bank/use-pending-action"

const NAV = {
  user: [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Transfer", href: "/transfer", icon: ArrowUpRight },
    { label: "Profile", href: "/profile", icon: User },
  ],
  admin: [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Customers", href: "/admin/users", icon: Users },
    { label: "Transactions", href: "/admin/transactions", icon: ArrowLeftRight },
  ],
} as const

export function AppShell({ role, children }: { role: "user" | "admin"; children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { currentUser, customers, logout, impersonatorId, stopImpersonation } = useBank()
  const { pending, run } = usePendingAction()
  const [open, setOpen] = useState(false)

  const nav = NAV[role]
  const active = [...nav].sort((a, b) => b.href.length - a.href.length).find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))

  async function handleLogout() {
    await logout()
    router.replace("/login")
  }

  async function handleStopImpersonation() {
    await stopImpersonation()
    router.replace("/admin/users")
  }

  return (
    <div className="min-h-screen bg-background">
      {open && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-30 bg-[#17202a]/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[272px] flex-col border-r border-border bg-card px-4 pt-5 pb-4 transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-2">
          <Brand />
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            className="grid size-8 place-items-center rounded-lg text-[#7d868c] hover:bg-muted lg:hidden"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-6 flex items-center gap-2 rounded-lg border border-[#f0e5d1] bg-[#fcf8ef] px-3 py-2 text-[11px] font-semibold text-[#7f6a46]">
          <span className="size-1.5 rounded-full bg-[#c58a27]" />
          {role === "admin" ? "Admin console" : "Personal banking"}
        </div>

        <div className="mt-6 mb-2 px-3 text-[9px] font-bold tracking-[0.14em] text-[#a0a5a8] uppercase">
          {role === "admin" ? "Operations" : "Workspace"}
        </div>
        <nav className="flex flex-col gap-1" aria-label={role === "admin" ? "Admin navigation" : "Customer navigation"}>
          {nav.map(({ label, href, icon: Icon }) => {
            const isActive = active?.href === href
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex min-h-10 items-center gap-3 rounded-lg px-3 text-[12.5px] font-semibold transition-colors",
                  isActive
                    ? "bg-[#fbf6eb] text-[#96651a]"
                    : "text-[#69727b] hover:bg-[#f7f6f3] hover:text-[#374452]",
                )}
              >
                <Icon className={cn("size-[17px]", isActive ? "text-[#b17c29]" : "text-[#8d959a]")} strokeWidth={1.8} />
                <span>{label}</span>
                {role === "admin" && href === "/admin/users" && (
                  <span className="ml-auto rounded-full bg-[#f0eee8] px-2 py-0.5 text-[10px] font-semibold text-[#777a7b]">
                    {customers.length}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="flex-1" />

        <div className="mb-3 rounded-xl border border-border bg-[#fafaf8] p-3">
          <div className="mb-2 grid size-7 place-items-center rounded-md bg-[#f3ecdb] text-[#b17d26]">
            <ShieldCheck className="size-4" />
          </div>
          <div className="text-[11px] font-bold text-[#4d5860]">Need help?</div>
          <p className="mt-1 text-[10.5px] leading-relaxed text-[#8a9196]">
            Call 0700 225 4255 or email service@alliedcapitalbank.com for account support.
          </p>
          <Link href="/" className="mt-2 inline-flex items-center gap-1 text-[10.5px] font-bold text-[#a17426] hover:underline">
            Back to website <ChevronRight className="size-3" />
          </Link>
        </div>

        <div className="flex items-center gap-2.5 border-t border-border pt-3">
          <Avatar name={currentUser?.name ?? "Guest"} src={currentUser?.avatarUrl} className="size-9 bg-[#e9edf0] text-[#526370]" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[11.5px] font-bold text-[#36404a]">{currentUser?.name}</div>
            <div className="truncate text-[10px] text-[#90969a]">{currentUser?.email}</div>
          </div>
          <button
            type="button"
            onClick={() => run(handleLogout)}
            aria-label="Sign out"
            title={pending ? "Signing out…" : "Sign out"}
            disabled={pending}
            aria-busy={pending}
            className="grid size-8 place-items-center rounded-lg text-[#8a9196] transition hover:bg-muted hover:text-[#b05b4f] disabled:cursor-wait disabled:opacity-60"
          >
            {pending ? <LoaderCircle className="size-4 animate-spin" /> : <LogOut className="size-4" />}
          </button>
        </div>
      </aside>

      <div className="lg:pl-[272px]">
        {impersonatorId && (
          <div className="flex items-center justify-between gap-3 bg-[#fbf4e7] px-4 py-2 text-[11.5px] text-[#7a6030] sm:px-6 lg:px-8">
            <span>Viewing the customer portal as {currentUser?.name}. Actions affect this account.</span>
            <button type="button" onClick={() => run(handleStopImpersonation)} disabled={pending} aria-busy={pending} className="inline-flex items-center gap-1 font-semibold underline disabled:cursor-wait disabled:opacity-60">
              {pending && <LoaderCircle className="size-3 animate-spin" />}
              {pending ? "Returning…" : "Return to admin"}
            </button>
          </div>
        )}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-card/90 px-4 backdrop-blur sm:px-6 lg:px-8">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setOpen(true)}
            className="grid size-9 place-items-center rounded-lg text-[#69727a] hover:bg-muted lg:hidden"
          >
            <Menu className="size-5" />
          </button>

          <div className="flex min-w-0 items-center gap-2 text-[11.5px] text-[#a0a4a5]">
            <Link href="/" className="hidden hover:text-[#54606a] sm:inline">
              Capital Bank
            </Link>
            <ChevronRight className="hidden size-3.5 sm:inline" />
            <span className="truncate font-semibold text-[#54606a]">{active?.label ?? "Overview"}</span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden items-center gap-1.5 text-[10.5px] text-[#7a8583] sm:flex">
              <ShieldCheck className="size-3.5 text-[#72967f]" />
              Secure session
            </div>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Avatar name={currentUser?.name ?? "Guest"} src={currentUser?.avatarUrl} className="size-8" />
              <div className="hidden leading-tight md:block">
                <div className="text-[11px] font-bold text-[#36404a]">{currentUser?.name}</div>
                <div className="text-[9.5px] text-[#90969a]">{role === "admin" ? "Administrator" : "Customer"}</div>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1180px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
          <footer className="mt-10 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 text-[10px] text-[#a0a5a6]">
            <span>© 2026 Allied Capital Bank · Internet banking</span>
            <span>All rights reserved</span>
          </footer>
        </main>
      </div>
    </div>
  )
}
