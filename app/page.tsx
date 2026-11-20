import type { Metadata } from "next"
import Link from "next/link"
import { FileText, Monitor, User } from "lucide-react"
import { AlliedShell } from "@/components/allied/allied-shell"

export const metadata: Metadata = {
  title: "Allied Capital Bank",
  description:
    "Allied Capital Bank delivers customer-focused banking services that are friendly, relevant, interesting, rewarding, intuitive and fun.",
}

const features = [
  {
    icon: User,
    heading: "ABOUT US",
    description:
      "Allied Capital Bank (Allied Capital Bank) opened its door to the public on 15th March as the premier merchant bank in the United Kingdom...",
    href: "/about",
  },
  {
    icon: Monitor,
    heading: "INTERNET BANKING",
    description:
      "Enjoy our secure and world class internet banking services with full confidence. Login to get started...",
    href: "/internet-banking",
  },
  {
    icon: FileText,
    heading: "SWITCH TO Allied Capital Bank",
    description:
      "Opening an account or applying for a product or service with Allied Capital Bank is fast, easy and secure. Lets get you started...",
  },
]

export default function HomePage() {
  return (
    <AlliedShell>
      <section className="border-b border-transparent bg-white">
        <div className="allied-container">
          <p className="mx-auto max-w-[850px] pt-[70px] pb-[55px] text-center text-[20px] leading-[1.55] font-light text-[#333333] sm:text-[21px]">
            Allied Capital Bank delivers customer-focused banking services that are friendly, relevant, interesting,
            rewarding, intuitive and fun.
          </p>
        </div>
      </section>

      <section className="bg-white pb-[80px]">
        <div className="allied-container grid gap-14 md:grid-cols-3 md:gap-10">
          {features.map(({ icon: Icon, heading, description, href }) => {
            const content = (
              <>
                <Icon
                  aria-hidden="true"
                  className="mx-auto text-[#F4A128]"
                  size={54}
                  strokeWidth={1.1}
                />
                <h2 className="mt-6 text-[10.5px] font-medium tracking-[0.06em] text-[#F4A128]">{heading}</h2>
                <p className="mx-auto mt-6 max-w-[310px] text-[11.5px] leading-[1.75] text-[#777777]">{description}</p>
              </>
            )
            return href ? (
              <Link key={heading} href={href} className="block text-center transition-opacity hover:opacity-80">
                {content}
              </Link>
            ) : (
              <div key={heading} className="text-center">
                {content}
              </div>
            )
          })}
        </div>
      </section>
    </AlliedShell>
  )
}
