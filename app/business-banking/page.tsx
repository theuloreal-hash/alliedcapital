import type { Metadata } from "next"
import Link from "next/link"
import { AlliedShell } from "@/components/allied/allied-shell"
import { PageBanner } from "@/components/allied/page-banner"

export const metadata: Metadata = {
  title: "Business Banking — Allied Capital Bank",
  description: "Business accounts, payments, lending and trade services for small and medium sized enterprises.",
}

export default function BusinessBankingPage() {
  return (
    <AlliedShell>
      <PageBanner
        title="Business Banking"
        image="/images/allied-banner-corporate.svg"
        imageAlt="Business district buildings"
      />

      <section className="bg-white">
        <div className="allied-container">
          <div className="mx-auto max-w-[825px] py-12">
            <p className="text-[12px] leading-[1.75] text-[#555555]">
              The Business Banking division of Allied Capital Bank supports small and medium sized enterprises at every
              stage of growth. From the first business account to working capital, payments and trade services, our
              team works alongside business owners to keep operations moving.
            </p>

            <h2 className="mt-7 text-[13.5px] font-bold text-[#333333]">Who we serve</h2>
            <p className="mt-1.5 text-[12px] leading-[1.75] text-[#555555]">
              We work with growing companies, established trading businesses, professional practices and family-owned
              enterprises operating locally and internationally.
            </p>

            <hr className="my-8 border-0 border-t border-[#dcdcdc]" />

            <h2 className="text-[13.5px] font-bold tracking-[0.04em] text-[#333333] uppercase">OUR SERVICES</h2>
            <p className="mt-2 text-[12px] leading-[1.75] text-[#555555]">
              Our business banking services include, but are not limited to, the following:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-[12px] leading-[1.7] text-[#555555]">
              <li>Business current accounts</li>
              <li>Domestic and international payments</li>
              <li>Working capital and term lending</li>
              <li>Equipment and asset finance</li>
              <li>Trade services and letters of credit</li>
              <li>Payroll and cash management</li>
              <li>Merchant services</li>
            </ul>

            <h2 className="mt-7 text-[13.5px] font-bold text-[#333333]">How we work</h2>
            <p className="mt-1.5 text-[12px] leading-[1.75] text-[#555555]">
              Every business customer is supported by a relationship manager who understands the sector and can bring in
              specialists from across the bank when needed. Our aim is straightforward, practical support delivered
              with a clear understanding of your business.
            </p>

            <p className="mt-7 text-[12px] leading-[1.75] text-[#555555]">
              To speak with a business banking advisor,{" "}
              <Link href="/contact" className="text-[#F4A128] underline underline-offset-2 hover:text-[#d98a12]">
                contact your Relationship Manager
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </AlliedShell>
  )
}
