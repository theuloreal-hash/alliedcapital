import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Profile",
  description: "View and update your Allied Capital Bank profile and account details.",
}

export default function ProfileRouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
