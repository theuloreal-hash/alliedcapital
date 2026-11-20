import Link from "next/link"
import { cn } from "@/lib/utils"

export function AcbLogo({ light = false, large = false }: { light?: boolean; large?: boolean }) {
  const markSize = large ? 42 : 36

  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Allied Capital Bank home">
      <svg
        width={markSize}
        height={markSize}
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect x="2" y="2" width="15" height="15" rx="1.5" stroke="#F4A128" strokeWidth="3" />
        <rect x="23" y="2" width="15" height="15" rx="1.5" stroke={light ? "#C9C9C9" : "#8C8C8C"} strokeWidth="3" />
        <rect x="2" y="23" width="15" height="15" rx="1.5" stroke={light ? "#C9C9C9" : "#8C8C8C"} strokeWidth="3" />
        <rect x="23" y="23" width="15" height="15" rx="1.5" stroke="#F4A128" strokeWidth="3" />
      </svg>
      <span className="flex flex-col">
        <span
          className={cn(
            "leading-none font-medium tracking-[0.03em]",
            large ? "text-[31px]" : "text-[27px]",
            light ? "text-white" : "text-[#333333]",
          )}
        >
          ACB
        </span>
        <span
          className={cn(
            "mt-[3px] text-[6.5px] leading-none tracking-[0.14em]",
            light ? "text-[#BDBDBD]" : "text-[#777777]",
            large && "text-[7.5px]",
          )}
        >
          ALLIED CAPITAL BANK
        </span>
      </span>
    </Link>
  )
}
