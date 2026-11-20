import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "View your Allied Capital Bank account overview and balance.",
}

export default function DashboardRouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
