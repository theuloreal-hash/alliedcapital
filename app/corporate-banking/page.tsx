import type { Metadata } from "next"
import Link from "next/link"
import { AlliedShell } from "@/components/allied/allied-shell"
import { PageBanner } from "@/components/allied/page-banner"

export const metadata: Metadata = {
  title: "Corporate Banking",
  description:
    "Relationship-led corporate banking for medium sized businesses, large conglomerates, multinationals and institutions.",
  openGraph: {
    title: "Corporate Banking",
    description:
      "Relationship-led corporate banking for medium sized businesses, large conglomerates, multinationals and institutions.",
    url: "/corporate-banking",
  },
  twitter: {
    title: "Corporate Banking",
    description:
      "Relationship-led corporate banking for medium sized businesses, large conglomerates, multinationals and institutions.",
  },
  alternates: {
    canonical: "/corporate-banking",
  },
}

const services = [
  "Investment Solutions",
  "Project Financing",
  "Leading for Business Growth",
  "Working Capital Financing",
  "Equipment Leasing",
  "Commercial Real Estate Services",
  "Trade Financing",
  "Payroll Services",
  "Structured Trade",
  "Commodity Finance",
  "Corporate Finance and Advisory Services.",
]

export default function CorporateBankingPage() {
  return (
    <AlliedShell>
      <PageBanner
        title="Corporate Banking"
        image="/images/allied-banner-corporate.svg"
        imageAlt="Corporate office buildings"
      />

      <section className="bg-white">
        <div className="allied-container">
          <div className="mx-auto max-w-[825px] py-12">
            <p className="text-[12px] leading-[1.75] text-[#555555]">
              The Corporate Banking division of Allied Capital Bank serves a diverse range of customers in all sectors
              of the economy both local and international ranging from medium sized businesses to large conglomerates.
              It is a rich resource with a team of highly skilled staff with diverse skills and substantial expertise
              who provide excellent relationship management service to our customers.
            </p>

            <h2 className="mt-7 text-[13.5px] font-bold text-[#333333]">Vision</h2>
            <p className="mt-1.5 text-[12px] leading-[1.75] text-[#555555]">
              To reposition Allied Capital Bank’s Corporate Banking as the top indigenous brand in the industry with
              well trained and highly motivated staff providing cutting edge service to our customers.
            </p>

            <h2 className="mt-6 text-[13.5px] font-bold text-[#333333]">Mission</h2>
            <p className="mt-1.5 text-[12px] leading-[1.75] text-[#555555]">
              To build strong bonds with corporate customers and offer them solution based corporate banking services
              through dedicated relationship management.
            </p>

            <h2 className="mt-6 text-[13.5px] font-bold text-[#333333]">Segment</h2>
            <p className="mt-1.5 text-[12px] leading-[1.75] text-[#555555]">
              The Corporate Banking division is divided into segments, namely, Local Corporates, Multinationals,
              Government Business &amp; Parastatals, Not for Profit Organisations and Financial Institutions.
            </p>

            <hr className="my-8 border-0 border-t border-[#dcdcdc]" />

            <h2 className="text-[13.5px] font-bold tracking-[0.04em] text-[#333333] uppercase">WHAT WE DO...</h2>
            <p className="mt-2 text-[12px] leading-[1.75] text-[#555555]">
              The hallmark of Allied Capital Bank’s Corporate Banking division is building and managing relationships.
              Our work spans a full range of services, which include, but are not limited to the following:
            </p>

            <ul className="mt-3 list-disc space-y-1 pl-5 text-[12px] leading-[1.7] text-[#555555]">
              {services.map((service) => (
                <li key={service}>{service}</li>
              ))}
            </ul>

            <p className="mt-7 text-[12px] leading-[1.75] text-[#555555]">
              We invite you to experience our world class service.{" "}
              <Link href="/contact" className="text-[#F4A128] underline underline-offset-2 hover:text-[#d98a12]">
                Click here
              </Link>{" "}
              to contact a Relationship Manager.
            </p>
          </div>
        </div>
      </section>
    </AlliedShell>
  )
}
