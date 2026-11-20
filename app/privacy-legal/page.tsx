import type { Metadata } from "next"
import { AlliedShell } from "@/components/allied/allied-shell"
import { PageBanner } from "@/components/allied/page-banner"

export const metadata: Metadata = {
  title: "Privacy & Legal",
  description: "Privacy, website terms and legal information for Allied Capital Bank customers.",
  openGraph: {
    title: "Privacy & Legal",
    description: "Privacy, website terms and legal information for Allied Capital Bank customers.",
    url: "/privacy-legal",
  },
  twitter: {
    title: "Privacy & Legal",
    description: "Privacy, website terms and legal information for Allied Capital Bank customers.",
  },
  alternates: {
    canonical: "/privacy-legal",
  },
}

export default function PrivacyLegalPage() {
  return (
    <AlliedShell>
      <PageBanner
        title="Privacy & Legal"
        image="/images/allied-banner-internet.svg"
        imageAlt="Secure internet banking"
      />

      <section className="bg-white">
        <div className="allied-container">
          <div className="mx-auto max-w-[825px] py-12">
            <h2 className="text-[13.5px] font-bold text-[#333333]">Privacy statement</h2>
            <p className="mt-2 text-[12px] leading-[1.75] text-[#555555]">
              At Allied Capital Bank, protection of your privacy whether online at www.alliedcapitalbank.com or offline
              at our various outlets, is part of our culture of maintaining the highest ethical standards. We recognize
              our responsibility to treat the information provided by you with the strictest confidentiality at all
              times.
            </p>
            <p className="mt-4 text-[12px] leading-[1.75] text-[#555555]">
              During your visit to our website, we make sure that the information provided by you is treated with the
              highest degree of confidentiality and courtesy, equivalent to what would happen through our other
              channels of interaction with you.
            </p>
            <p className="mt-4 text-[12px] leading-[1.75] text-[#555555]">
              Allied Capital Bank guarantees that your personal information will not be disclosed to third parties
              except in circumstances previously advised to you at the point of applying for a product or service.
            </p>

            <h2 className="mt-8 text-[13.5px] font-bold text-[#333333]">Website terms of use</h2>
            <p className="mt-2 text-[12px] leading-[1.75] text-[#555555]">
              The information on this website is provided for general information only and does not constitute financial
              or professional advice. Product terms, availability and eligibility are confirmed at the point of
              application. Allied Capital Bank accepts no liability for reliance placed on general website content.
            </p>

            <h2 className="mt-8 text-[13.5px] font-bold text-[#333333]">Security</h2>
            <p className="mt-2 text-[12px] leading-[1.75] text-[#555555]">
              Allied Capital Bank will never ask you for your internet banking password or a one-time passcode by email,
              telephone or SMS. If you believe your details have been compromised, contact us immediately.
            </p>

            <h2 className="mt-8 text-[13.5px] font-bold text-[#333333]">Copyright</h2>
            <p className="mt-2 text-[12px] leading-[1.75] text-[#555555]">
              ©2015 Allied Capital Bank. All rights reserved. No part of this website may be reproduced without prior
              written permission.
            </p>
          </div>
        </div>
      </section>
    </AlliedShell>
  )
}
