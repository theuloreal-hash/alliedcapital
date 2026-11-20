import type { ReactNode } from "react"
import { AlliedHeader } from "@/components/allied/allied-header"
import { AlliedFooter } from "@/components/allied/allied-footer"
import { SupportChat } from "@/components/allied/support-chat"

export function AlliedShell({ children }: { children: ReactNode }) {
  return (
    <div className="allied-site min-h-screen bg-white">
      <AlliedHeader />
      <main>{children}</main>
      <AlliedFooter />
      <SupportChat />
    </div>
  )
}
