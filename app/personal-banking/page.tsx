import type { Metadata } from "next"
import Link from "next/link"
import { AlliedShell } from "@/components/allied/allied-shell"
import { PageBanner } from "@/components/allied/page-banner"

export const metadata: Metadata = {
  title: "Personal Banking",
  description: "Everyday accounts, savings, cards and borrowing for personal banking customers.",
  openGraph: {
    title: "Personal Banking",
    description: "Everyday accounts, savings, cards and borrowing for personal banking customers.",
    url: "/personal-banking",
  },
  twitter: {
    title: "Personal Banking",
    description: "Everyday accounts, savings, cards and borrowing for personal banking customers.",
  },
  alternates: {
    canonical: "/personal-banking",
  },
}

export default function PersonalBankingPage() {
  return (
    <AlliedShell>
      <PageBanner
        title="Personal Banking"
        image="/images/allied-banner-internet.svg"
        imageAlt="A customer using internet banking"
      />

      <section className="bg-white">
        <div className="allied-container">
          <div className="mx-auto max-w-[825px] py-12">
            <p className="text-[12px] leading-[1.75] text-[#555555]">
              Personal Banking at Allied Capital Bank covers the accounts, cards and borrowing you use every day.
              Straightforward products, clear information and access to your money whenever you need it.
            </p>

            <h2 className="mt-7 text-[13.5px] font-bold text-[#333333]">Everyday banking</h2>
            <p className="mt-1.5 text-[12px] leading-[1.75] text-[#555555]">
              Current accounts for salaries, bills and daily spending, savings accounts for money you want to set aside,
              and a debit card accepted wherever you shop.
            </p>

            <h2 className="mt-6 text-[13.5px] font-bold text-[#333333]">Borrowing</h2>
            <p className="mt-1.5 text-[12px] leading-[1.75] text-[#555555]">
              Personal loans, mortgages and credit cards with terms explained clearly before you apply. Our lending
              specialists will help you choose the right option for your circumstances.
            </p>

            <hr className="my-8 border-0 border-t border-[#dcdcdc]" />

            <h2 className="text-[13.5px] font-bold tracking-[0.04em] text-[#333333] uppercase">ONLINE SERVICES</h2>
            <p className="mt-2 text-[12px] leading-[1.75] text-[#555555]">
              Manage your accounts from wherever you are with{" "}
              <Link href="/internet-banking" className="text-[#F4A128] underline underline-offset-2 hover:text-[#d98a12]">
                internet banking
              </Link>
              . View balances, review transactions, make transfers and keep your details up to date.
            </p>

            <p className="mt-7 text-[12px] leading-[1.75] text-[#555555]">
              To open an account or discuss a product,{" "}
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
