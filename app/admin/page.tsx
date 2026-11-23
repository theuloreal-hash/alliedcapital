"use client"

import Link from "next/link"
import { useMemo } from "react"
import { Activity, ArrowLeftRight, ArrowRight, ShieldAlert, Users, Wallet } from "lucide-react"
import { Avatar, Card, PageHeader, PanelHeading, StatCard, StatusPill } from "@/components/bank/ui"
import { TransactionTable } from "@/components/bank/transaction-table"
import { currency, formatDate, isThisMonth } from "@/lib/bank"
import { useBank } from "@/lib/bank-store"

export default function AdminOverviewPage() {
  const { customers, transactions, userTransactions } = useBank()

  const metrics = useMemo(() => {
    const active = customers.filter((user) => user.status === "Active").length
    const held = customers.reduce((total, user) => total + user.balance, 0)
    const monthTx = transactions.filter((row) => isThisMonth(row.date))
    return { active, held, monthTx }
  }, [customers, transactions])

  const suspended = customers.filter((user) => user.status === "Suspended")

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Admin overview"
        description="A live view of customers, balances and activity across Capital Bank."
        actions={
          <Link
            href="/admin/users"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-[11.5px] font-semibold text-primary-foreground transition hover:bg-[#b87b1e]"
          >
            <Users className="size-3.5" /> Manage customers
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total customers"
          value={String(customers.length)}
          hint="Profiles created by admins"
          icon={<Users />}
          tone="amber"
        />
        <StatCard
          label="Active accounts"
          value={String(metrics.active)}
          hint={`${customers.length - metrics.active} suspended`}
          icon={<Activity />}
          tone="green"
        />
        <StatCard
          label="Customer balances"
          value={currency(metrics.held)}
          hint="Total held across accounts"
          icon={<Wallet />}
          tone="violet"
        />
        <StatCard
          label="Transactions this month"
          value={String(metrics.monthTx.length)}
          hint={`${transactions.length} all time`}
          icon={<ArrowLeftRight />}
          tone="slate"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <PanelHeading
            title="Customers"
            description={`${customers.length} profiles — newest first`}
            action={
              <Link href="/admin/users" className="inline-flex items-center gap-1 text-[11px] font-bold text-[#9b6b1c] hover:underline">
                View all <ArrowRight className="size-3.5" />
              </Link>
            }
          />
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-[#fbfbf9]">
                  <th className="px-4 py-2.5 text-[10px] font-semibold tracking-wide text-[#a0a4a5] uppercase sm:px-5">Customer</th>
                  <th className="px-4 py-2.5 text-[10px] font-semibold tracking-wide text-[#a0a4a5] uppercase">Balance</th>
                  <th className="px-4 py-2.5 text-[10px] font-semibold tracking-wide text-[#a0a4a5] uppercase">Status</th>
                  <th className="px-4 py-2.5 text-[10px] font-semibold tracking-wide text-[#a0a4a5] uppercase sm:px-5">Transactions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-[#f0f0ed] last:border-0 hover:bg-[#fbfbf8]">
                    <td className="px-4 py-3 sm:px-5">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={customer.name} src={customer.avatarUrl} className="size-8" />
                        <div className="min-w-0">
                          <div className="truncate text-[12px] font-semibold text-[#46515a]">{customer.name}</div>
                          <div className="truncate text-[10px] text-[#a0a5a5]">{customer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[12px] font-semibold whitespace-nowrap text-[#45515a]">{currency(customer.balance)}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={customer.status} />
                    </td>
                    <td className="px-4 py-3 text-[11.5px] text-[#969c9e] sm:px-5">{userTransactions(customer.id).length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <PanelHeading title="Recent activity" description="Latest across all accounts" />
            <ul className="divide-y divide-[#f0f0ed]">
              {transactions.slice(0, 5).map((row) => {
                const owner = customers.find((customer) => customer.id === row.userId)
                return (
                  <li key={row.id} className="flex items-center gap-3 px-4 py-2.5 sm:px-5">
                    <Avatar name={owner?.name ?? "Bank"} src={owner?.avatarUrl} className="size-7 text-[9px]" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[11.5px] font-semibold text-[#46515a]">{row.description}</div>
                      <div className="text-[10px] text-[#a0a5a5]">
                        {owner?.name ?? "Unknown"} · {formatDate(row.date)}
                      </div>
                    </div>
                    <span className={row.direction === "in" ? "text-[11px] font-bold text-[#59866b]" : "text-[11px] font-bold text-[#424d56]"}>
                      {row.direction === "in" ? "+" : "−"}
                      {currency(row.amount)}
                    </span>
                  </li>
                )
              })}
            </ul>
            <div className="border-t border-border px-4 py-2.5 sm:px-5">
              <Link href="/admin/transactions" className="inline-flex items-center gap-1 text-[11px] font-bold text-[#9b6b1c] hover:underline">
                View all transactions <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </Card>

          {suspended.length > 0 ? (
            <Card className="p-4">
              <div className="flex items-start gap-2.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#f9ecea] text-[#b05b4f]">
                  <ShieldAlert className="size-4" />
                </span>
                <div>
                  <div className="text-[12px] font-bold text-[#3d4953]">
                    {suspended.length} suspended account{suspended.length === 1 ? "" : "s"}
                  </div>
                  <p className="mt-0.5 text-[10.5px] leading-relaxed text-[#858d92]">
                    {suspended.map((user) => user.name).join(", ")} cannot sign in or move money until reactivated.
                  </p>
                  <Link href="/admin/users" className="mt-2 inline-flex items-center gap-1 text-[10.5px] font-bold text-[#a17426] hover:underline">
                    Review customers <ArrowRight className="size-3" />
                  </Link>
                </div>
              </div>
            </Card>
          ) : (
            <div className="rounded-xl border border-[#e4ece5] bg-[#f4f8f4] px-4 py-3 text-[10.5px] leading-relaxed text-[#718075]">
              All customer accounts are active. Suspended accounts will appear here for review.
            </div>
          )}
        </div>
      </div>

      <Card className="mt-4">
        <PanelHeading
          title="Latest transactions"
          description="Every customer transaction, newest first"
          action={
            <Link href="/admin/transactions" className="inline-flex items-center gap-1 text-[11px] font-bold text-[#9b6b1c] hover:underline">
              Full ledger <ArrowRight className="size-3.5" />
            </Link>
          }
        />
        <div className="border-t border-border">
          <TransactionTable rows={transactions.slice(0, 6)} users={customers} empty="No transactions recorded yet." />
        </div>
      </Card>
    </>
  )
}
