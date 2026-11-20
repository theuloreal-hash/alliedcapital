import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/dashboard", "/login", "/profile", "/transactions", "/transfer"],
    },
    sitemap: "https://www.alliedcapitalbank.com/sitemap.xml",
  }
}
