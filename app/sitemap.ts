import type { MetadataRoute } from "next"

const siteUrl = "https://www.alliedcapitalbank.com"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, priority: 1 },
    { url: `${siteUrl}/about`, priority: 0.7 },
    { url: `${siteUrl}/contact`, priority: 0.7 },
    { url: `${siteUrl}/personal-banking`, priority: 0.8 },
    { url: `${siteUrl}/business-banking`, priority: 0.8 },
    { url: `${siteUrl}/corporate-banking`, priority: 0.8 },
    { url: `${siteUrl}/private-banking`, priority: 0.8 },
    { url: `${siteUrl}/internet-banking`, priority: 0.7 },
    { url: `${siteUrl}/privacy-legal`, priority: 0.4 },
  ]
}
