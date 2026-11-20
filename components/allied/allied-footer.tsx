import Link from "next/link"
import { AcbLogo } from "@/components/allied/acb-logo"
import { NewsletterForm } from "@/components/allied/newsletter-form"

const BANK_LINKS = [
  { label: "Corporate Banking", href: "/corporate-banking" },
  { label: "Business Banking", href: "/business-banking" },
  { label: "Personal Banking", href: "/personal-banking" },
  { label: "Private Banking", href: "/private-banking" },
]

export function AlliedFooter() {
  return (
    <footer className="bg-[#333333] text-[#d0d0d0]">
      <div className="allied-container grid gap-9 py-10 sm:grid-cols-2 lg:grid-cols-[1.15fr_0.8fr_0.75fr_1.1fr] lg:gap-10">
        <div>
          <AcbLogo light large />
          <p className="mt-5 max-w-[260px] text-[11px] leading-[1.7] text-[#c7c7c7]">
            Our mission is to deliver world class service characterized by the delivery of timely, relevant and
            superior products and services to meet the needs of our clients.
          </p>
        </div>

        <div>
          <h3 className="text-[11px] font-bold text-white">Allied Capital Bank</h3>
          <ul className="mt-5 space-y-[18px]">
            {BANK_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-[10.5px] text-[#d0d0d0] transition-colors hover:text-[#F4A128]">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[10px] text-[#808080]">Add Widget Column 3</p>
        </div>

        <div>
          <NewsletterForm />
        </div>
      </div>

      <div className="bg-[#242424]">
        <div className="allied-container flex flex-wrap items-center gap-x-1 py-3 text-[9.5px] text-[#9a9a9a]">
          <span>©2015 Allied Capital Bank -</span>
          <Link href="/privacy-legal" className="transition-colors hover:text-[#F4A128]">
            Privacy &amp; Legal
          </Link>
        </div>
      </div>
    </footer>
  )
}
