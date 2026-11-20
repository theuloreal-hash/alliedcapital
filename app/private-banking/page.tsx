import type { Metadata } from "next"
import Link from "next/link"
import { AlliedShell } from "@/components/allied/allied-shell"
import { PageBanner } from "@/components/allied/page-banner"

export const metadata: Metadata = {
  title: "Private Banking — Allied Capital Bank",
  description: "Dedicated relationship management and wealth solutions for private banking clients.",
}

export default function PrivateBankingPage() {
  return (
    <AlliedShell>
      <PageBanner
        title="Private Banking"
        image="/images/allied-banner-corporate.svg"
        imageAlt="Private banking office buildings"
      />

      <section className="bg-white">
        <div className="allied-container">
          <div className="mx-auto max-w-[825px] py-12">
            <p className="text-[12px] leading-[1.75] text-[#555555]">
              Private Banking provides dedicated relationship management and wealth solutions for clients with
              complex financial needs. Our approach is personal, discreet and built around long-term objectives rather
              than short-term products.
            </p>

            <h2 className="mt-7 text-[13.5px] font-bold text-[#333333]">Dedicated relationship management</h2>
            <p className="mt-1.5 text-[12px] leading-[1.75] text-[#555555]">
              Each private banking client works with a named relationship manager supported by specialists in lending,
              investments and wealth planning.
            </p>

            <h2 className="mt-6 text-[13.5px] font-bold text-[#333333]">Investment advisory</h2>
            <p className="mt-1.5 text-[12px] leading-[1.75] text-[#555555]">
              Discretionary and advisory portfolio services designed around your objectives, time horizon and appetite
              for risk.
            </p>

            <h2 className="mt-6 text-[13.5px] font-bold text-[#333333]">Wealth structuring and succession</h2>
            <p className="mt-1.5 text-[12px] leading-[1.75] text-[#555555]">
              Support with the structures that protect and transfer wealth across generations, coordinated with your
              professional advisers.
            </p>

            <hr className="my-8 border-0 border-t border-[#dcdcdc]" />

            <h2 className="text-[13.5px] font-bold tracking-[0.04em] text-[#333333] uppercase">ACCESS</h2>
            <p className="mt-2 text-[12px] leading-[1.75] text-[#555555]">
              Private banking clients receive the same secure{" "}
              <Link href="/internet-banking" className="text-[#F4A128] underline underline-offset-2 hover:text-[#d98a12]">
                internet banking
              </Link>{" "}
              service, together with direct access to their relationship manager.
            </p>

            <p className="mt-7 text-[12px] leading-[1.75] text-[#555555]">
              For a confidential discussion,{" "}
              <Link href="/contact" className="text-[#F4A128] underline underline-offset-2 hover:text-[#d98a12]">
                contact a Relationship Manager
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </AlliedShell>
  )
}
