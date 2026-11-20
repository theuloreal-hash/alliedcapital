import type { Metadata } from "next"
import { AlliedShell } from "@/components/allied/allied-shell"
import { PageBanner } from "@/components/allied/page-banner"
import { ContactForm } from "@/components/allied/contact-form"

export const metadata: Metadata = {
  title: "Contact a Relationship Manager — Allied Capital Bank",
  description: "Send an enquiry to an Allied Capital Bank relationship manager.",
}

export default function ContactPage() {
  return (
    <AlliedShell>
      <PageBanner
        title="Contact Us"
        image="/images/allied-banner-corporate.svg"
        imageAlt="Allied Capital Bank offices"
      />

      <section className="bg-white">
        <div className="allied-container">
          <div className="mx-auto max-w-[825px] py-12">
            <p className="text-[12px] leading-[1.75] text-[#555555]">
              Our relationship managers are available to discuss corporate, business, personal and private banking
              requirements. Complete the form below and the appropriate team will respond.
            </p>

            <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_260px] lg:gap-12">
              <ContactForm />

              <div>
                <h2 className="text-[13.5px] font-bold text-[#333333]">Relationship Management</h2>
                <p className="mt-2 text-[11.5px] leading-[1.75] text-[#555555]">
                  Allied Capital Bank
                  <br />
                  100 Harbour Street, Suite 1200
                  <br />
                  New York, NY 10013
                </p>

                <dl className="mt-5 space-y-3 text-[11.5px] leading-[1.65] text-[#555555]">
                  <div>
                    <dt className="text-[10px] text-[#888888]">Telephone</dt>
                    <dd>
                      <a href="tel:+18002274825" className="hover:text-[#F4A128]">
                        1-800-227-4825
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] text-[#888888]">Email</dt>
                    <dd>
                      <a href="mailto:service@alliedcapitalbank.com" className="hover:text-[#F4A128]">
                        service@alliedcapitalbank.com
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] text-[#888888]">Internet Banking</dt>
                    <dd>
                      <a href="/internet-banking" className="hover:text-[#F4A128]">
                        Online banking information
                      </a>
                    </dd>
                  </div>
                </dl>

                <p className="mt-6 border-t border-[#dcdcdc] pt-4 text-[10px] leading-[1.65] text-[#888888]">
                  Please do not send sensitive account information by email. Never share your password or one-time
                  codes with anyone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AlliedShell>
  )
}
