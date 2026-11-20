import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { initials } from "@/lib/bank"

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-xl border border-border bg-card shadow-[0_1px_2px_rgba(35,44,55,0.04)]", className)}>{children}</div>
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <div className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase">{eyebrow}</div>}
        <h1 className="mt-1.5 text-[26px] leading-tight font-bold tracking-tight text-[#283440] sm:text-[28px]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-[13px] text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

const TONES = {
  amber: "bg-[#f8f0e2] text-[#a8761f]",
  green: "bg-[#edf5f0] text-[#5f8c6d]",
  rose: "bg-[#f8ece9] text-[#b26254]",
  slate: "bg-[#edf1f3] text-[#5f7b88]",
  violet: "bg-[#f0eef6] text-[#7b70a0]",
} as const

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "amber",
}: {
  label: string
  value: string
  hint?: string
  icon?: ReactNode
  tone?: keyof typeof TONES
}) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[12px] font-medium text-[#747d84]">{label}</span>
        {icon && <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg [&_svg]:size-4", TONES[tone])}>{icon}</span>}
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight text-[#35414a]">{value}</div>
      {hint && <div className="mt-1 text-[11px] text-[#9aa0a2]">{hint}</div>}
    </Card>
  )
}

const PILL_TONES: Record<string, string> = {
  success: "bg-[#edf5ef] text-[#5a8669]",
  warning: "bg-[#fbf4e7] text-[#a57a32]",
  danger: "bg-[#f9ecea] text-[#b05b4f]",
  neutral: "bg-[#f1f1ee] text-[#7f8586]",
  brand: "bg-[#fbf4e7] text-[#a27529]",
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: keyof typeof PILL_TONES }) {
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold", PILL_TONES[tone])}>{children}</span>
}

export function StatusPill({ status }: { status: string }) {
  const tone =
    status === "Active" || status === "Completed"
      ? "success"
      : status === "Pending" || status === "Review"
        ? "warning"
        : "danger"
  return <Pill tone={tone}>{status}</Pill>
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full bg-[#eee8dc] text-[11px] font-bold text-[#80622c]",
        className,
      )}
    >
      {initials(name)}
    </span>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="px-4 py-12 text-center text-[12px] text-muted-foreground">{children}</div>
}

export function PanelHeading({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3.5 sm:px-5">
      <div>
        <h2 className="text-[14px] font-bold tracking-tight text-[#33404b]">{title}</h2>
        {description && <p className="mt-0.5 text-[11px] text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}
