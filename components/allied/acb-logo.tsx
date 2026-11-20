import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

/**
 * Website header/footer logo. The artwork in public/alliedbank-logo-2.png is
 * dark, so on the dark footer it sits on a white chip to stay legible.
 */
export function AcbLogo({ light = false, large = false }: { light?: boolean; large?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Allied Capital Bank home"
      className={cn("inline-flex items-center", light && "rounded bg-white px-2 py-1.5")}
    >
      <Image
        src="/alliedbank-logo-2.png"
        alt="Allied Capital Bank"
        width={216}
        height={60}
        priority
        className={cn("w-auto", large ? "h-[44px]" : "h-[38px]")}
      />
    </Link>
  )
}
