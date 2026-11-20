import type { Metadata } from "next"
import Link from "next/link"
import { AlliedShell } from "@/components/allied/allied-shell"
import { ForexWidget } from "@/components/allied/forex-widget"

export const metadata: Metadata = {
  title: "Internet Banking — Allied Capital Bank",
  description: "Log on to internet banking, download application documents and view live forex rates.",
}

const documents = [
  {
    label: "Application Form and Agreement",
    href: "/documents/internet-banking-application-form.pdf",
  },
  {
    label: "Internet Banking Terms & Conditions",
    href: "/documents/internet-banking-terms.pdf",
  },
  {
    label: "Internet Banking User Guide",
    href: "/documents/internet-banking-user-guide.pdf",
  },
]

export default function InternetBankingPage() {
  return (
    <AlliedShell>
      <section className="bg-white">
        <div className="mx-auto max-w-[860px] px-4 py-10 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_200px] lg:gap-10">
            <div>
              <h2 className="text-[13.5px] font-normal text-[#333333]">Already registered?</h2>
              <p className="mt-1.5 text-[12px] leading-[1.7] text-[#666666]">
                Please select the appropriate link below to log on to Internet Banking.
              </p>
              <ul className="mt-2 list-disc pl-5 text-[12px] leading-[1.8] text-[#666666]">
                <li>
                  <Link
                    href="/login"
                    className="text-[#3157A4] underline underline-offset-2 hover:text-[#25408a]"
                  >
                    Internet Banking Login
                  </Link>
                </li>
              </ul>

              <h2 className="mt-8 text-[13.5px] font-normal text-[#333333]">Applying for Internet Banking?</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-[12px] leading-[1.7] text-[#666666]">
                <li>
                  Download and print out the{" "}
                  <a
                    href={documents[0].href}
                    download
                    className="text-[#3157A4] underline underline-offset-2 hover:text-[#25408a]"
                  >
                    {documents[0].label}
                  </a>
                </li>
                <li>
                  Download the{" "}
                  <a
                    href={documents[1].href}
                    download
                    className="text-[#3157A4] underline underline-offset-2 hover:text-[#25408a]"
                  >
                    {documents[1].label}
                  </a>
                </li>
                <li>
                  Download the{" "}
                  <a
                    href={documents[2].href}
                    download
                    className="text-[#3157A4] underline underline-offset-2 hover:text-[#25408a]"
                  >
                    {documents[2].label}
                  </a>
                </li>
                <li>Fill out the Application Form and Agreement clearly and sign</li>
                <li>
                  Submit the completed Application Form and Agreement via email at{" "}
                  <a
                    href="mailto:service@alliedcapitalbank.com"
                    className="text-[#3157A4] underline underline-offset-2 hover:text-[#25408a]"
                  >
                    service@alliedcapitalbank.com
                  </a>{" "}
                  or deliver to a branch nearest to you.
                </li>
              </ul>

              <hr className="my-8 border-0 border-t border-[#dcdcdc]" />

              <h2 className="text-[13.5px] font-normal text-[#333333]">Internet Banking Terms</h2>
              <p className="mt-2 text-[12px] leading-[1.7] text-[#666666]">
                At Allied Capital Bank, protection of your privacy whether online at www.alliedcapitalbank.com or
                offline at our various outlets, is part of our culture of maintaining the highest ethical standards. We
                recognize our responsibility to treat the information provided by you with the strictest
                confidentiality at all times.
              </p>
              <p className="mt-4 text-[12px] leading-[1.7] text-[#666666]">
                During your visit to our website, we make sure that the information provided by you is treated with the
                highest degree of confidentiality and courtesy, equivalent to what would happen through our other
                channels of interaction with you.
              </p>
              <p className="mt-4 text-[12px] leading-[1.7] text-[#666666]">
                Allied Capital Bank guarantees that your personal information will not be disclosed to third parties
                except in circumstances previously advised to you at the point of applying for a product or service.
              </p>
            </div>

            <ForexWidget />
          </div>
        </div>
      </section>
    </AlliedShell>
  )
}
