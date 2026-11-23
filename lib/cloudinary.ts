import { createHmac } from "node:crypto"

export type CloudinaryConfig = {
  cloudName: string
  apiKey: string
  apiSecret: string
}

export function getCloudinaryConfig(): CloudinaryConfig | null {
  const value = process.env.CLOUDINARY_URL
  if (!value) return null

  try {
    const url = new URL(value)
    if (url.protocol !== "cloudinary:" || !url.hostname || !url.username || !url.password) return null

    return {
      cloudName: url.hostname,
      apiKey: decodeURIComponent(url.username),
      apiSecret: decodeURIComponent(url.password),
    }
  } catch {
    return null
  }
}

export function signCloudinaryParams(params: Record<string, string>, apiSecret: string) {
  const payload = Object.entries(params)
    .filter(([, value]) => value !== "")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&")

  return createHmac("sha1", apiSecret).update(payload).digest("hex")
}

export function isCloudinaryImageUrl(value: string, cloudName: string) {
  try {
    const url = new URL(value)
    return (
      url.protocol === "https:" &&
      url.hostname === "res.cloudinary.com" &&
      url.pathname.startsWith(`/${cloudName}/image/upload/`)
    )
  } catch {
    return false
  }
}
