import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

/**
 * Allied Capital Bank wordmark from public/alliedbank-logo-2.png (216 × 60).
 * Rendered from the single source asset so the website, login screen and
 * dashboard always show the same logo.
 */
export function Brand({
  href = "/",
  subtitle,
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
    <Link href={href} className={cn("flex items-center gap-2.5", className)} aria-label="Allied Capital Bank home">
      <Image
        src="/alliedbank-logo-2.png"
        alt="Allied Capital Bank"
        width={216}
        height={60}
        priority
        className={cn("h-10 w-auto", compact && "h-8", markClassName)}
      />
      {subtitle && (
        <span className="mt-0.5 text-[8px] leading-none font-bold tracking-[0.18em] text-[#a67827] uppercase">
          {subtitle}
        </span>
      )}
    </Link>
  )
}
