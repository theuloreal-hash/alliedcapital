import Link from "next/link"
import { Landmark } from "lucide-react"
import { cn } from "@/lib/utils"

export function Brand({
  href = "/",
  subtitle = "Online banking",
  className,
  markClassName,
  compact = false,
}: {
  href?: string
  subtitle?: string
  className?: string
  markClassName?: string
  compact?: boolean
}) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#dca53e] to-[#b4771a] text-white shadow-sm",
          markClassName,
        )}
      >
        <Landmark className="size-[18px]" strokeWidth={2.2} />
      </span>
      {!compact && (
        <span className="flex flex-col">
          <span className="text-[17px] leading-tight font-extrabold tracking-tight text-[#222d38]">Capital Bank</span>
          <span className="mt-0.5 text-[8px] leading-none font-bold tracking-[0.18em] text-[#a67827] uppercase">
            {subtitle}
          </span>
        </span>
      )}
    </Link>
  )
}
