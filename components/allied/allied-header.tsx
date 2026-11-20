"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { AcbLogo } from "@/components/allied/acb-logo"

const NAV_LINKS = [
  { label: "Corporate Banking", href: "/corporate-banking" },
  { label: "Business Banking", href: "/business-banking" },
  { label: "Personal Banking", href: "/personal-banking" },
  { label: "Private Banking", href: "/private-banking" },
]

const SEARCH_INDEX = [
  { title: "Home", href: "/", description: "Customer-focused banking services from Allied Capital Bank." },
  {
    title: "About Us",
    href: "/about",
    description: "Learn about Allied Capital Bank.",
  },
  {
    title: "Corporate Banking",
    href: "/corporate-banking",
    description: "Relationship banking for corporates, multinationals and institutions.",
  },
  {
    title: "Business Banking",
    href: "/business-banking",
    description: "Accounts, payments, lending and trade services for businesses.",
  },
  {
    title: "Personal Banking",
    href: "/personal-banking",
    description: "Everyday accounts, savings, cards and borrowing.",
  },
  {
    title: "Private Banking",
    href: "/private-banking",
    description: "Dedicated relationship management and wealth solutions.",
  },
  {
    title: "Internet Banking",
    href: "/internet-banking",
    description: "Log on to internet banking, download forms and view live forex rates.",
  },
  {
    title: "Contact a Relationship Manager",
    href: "/contact",
    description: "Send a message and a relationship manager will respond.",
  },
  {
    title: "Privacy & Legal",
    href: "/privacy-legal",
    description: "How Allied Capital Bank handles personal information.",
  },
]

export function AlliedHeader() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
    setQuery("")
  }, [pathname])

  useEffect(() => {
    if (!searchOpen) return
    inputRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSearchOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [searchOpen])

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return []
    return SEARCH_INDEX.filter((item) =>
      `${item.title} ${item.description}`.toLowerCase().includes(needle),
    )
  }, [query])

  const isActive = (href: string) => pathname === href

  return (
    <header className="relative z-40 border-b border-[#dcdcdc] bg-white">
      <div className="allied-container flex h-[72px] items-center justify-between gap-5 lg:h-[96px]">
        <AcbLogo />

        <nav className="hidden items-center gap-[26px] lg:flex" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-[11.5px] whitespace-nowrap transition-colors hover:text-[#F4A128]",
                isActive(link.href) ? "text-[#F4A128]" : "text-[#555555]",
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            className={cn(
              "flex h-[38px] w-[118px] items-center justify-center bg-[#F4A128] text-[11px] font-medium text-white transition-colors hover:bg-[#dd8b16] hover:text-white",
              isActive("/internet-banking") && "bg-[#dd8b16]",
            )}
          >
            Internet Banking
          </Link>
          <button
            type="button"
            aria-label="Search"
            onClick={() => setSearchOpen((open) => !open)}
            className="grid size-8 place-items-center text-[#555555] transition-colors hover:text-[#F4A128]"
          >
            <Search className="size-[16px]" strokeWidth={1.8} />
          </button>
        </nav>

        <div className="flex items-center gap-1 lg:hidden">
          <button
            type="button"
            aria-label="Search"
            onClick={() => setSearchOpen((open) => !open)}
            className="grid size-9 place-items-center text-[#555555]"
          >
            <Search className="size-[18px]" strokeWidth={1.8} />
          </button>
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="grid size-9 place-items-center text-[#555555]"
          >
            {menuOpen ? <X className="size-[20px]" strokeWidth={1.8} /> : <Menu className="size-[20px]" strokeWidth={1.8} />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="absolute inset-x-0 top-full border-y border-[#dcdcdc] bg-white">
          <div className="allied-container py-5">
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search the Allied Capital Bank website"
              aria-label="Search the website"
              className="h-10 w-full border border-[#dcdcdc] px-3 text-[12px] text-[#333333] placeholder:text-[#999999]"
            />
            {query.trim() && (
              <ul className="mt-3 divide-y divide-[#eeeeee] border border-[#dcdcdc]">
                {results.length > 0 ? (
                  results.map((result) => (
                    <li key={result.href}>
                      <Link href={result.href} className="block px-3 py-2.5 hover:bg-[#fafafa] hover:text-[#333333]">
                        <span className="block text-[12px] font-medium text-[#333333]">{result.title}</span>
                        <span className="mt-0.5 block text-[10.5px] text-[#777777]">{result.description}</span>
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="px-3 py-3 text-[11px] text-[#777777]">No pages match “{query}”.</li>
                )}
              </ul>
            )}
          </div>
        </div>
      )}

      {menuOpen && (
        <div className="border-t border-[#dcdcdc] bg-white lg:hidden">
          <nav className="allied-container py-2" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "block border-b border-[#f0f0f0] py-2.5 text-[12px]",
                  isActive(link.href) ? "text-[#F4A128]" : "text-[#555555]",
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="mt-3 mb-3 flex h-[38px] w-[150px] items-center justify-center bg-[#F4A128] text-[11px] font-medium text-white"
            >
              Internet Banking
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
