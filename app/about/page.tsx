import type { Metadata } from "next"
import { AlliedShell } from "@/components/allied/allied-shell"
import { PageBanner } from "@/components/allied/page-banner"

export const metadata: Metadata = {
  title: "About Us — Allied Capital Bank",
  description: "About Allied Capital Bank.",
}

export default function AboutPage() {
  return (
    <AlliedShell>
      <PageBanner
        title="About Us"
        image="/images/allied-banner-corporate.svg"
        imageAlt="Allied Capital Bank corporate offices"
      />

      <section className="bg-white">
        <div className="allied-container">
          <div className="mx-auto max-w-[825px] py-12">
            <p className="text-[12px] leading-[1.75] text-[#555555]">
              Allied Capital Bank (Allied Capital Bank) opened its door to the public on 15th March as the premier
              merchant bank in the United Kingdom, built on a culture of customer-focused service that is friendly,
              relevant, interesting, rewarding, intuitive and fun.
            </p>
          </div>
        </div>
      </section>
    </AlliedShell>
  )
}
