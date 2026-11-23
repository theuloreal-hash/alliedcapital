import { NextResponse, type NextRequest } from "next/server"
import { fail } from "@/lib/api"
import { HttpError, requireSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { getCloudinaryConfig, signCloudinaryParams } from "@/lib/cloudinary"

export async function POST(_request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const session = await requireSession()
    if (session.user.role !== "admin") throw new HttpError(403, "Administrator access required.")

    const { userId } = await params
    const customer = await db.execute({
      sql: "SELECT id FROM users WHERE id = ? AND role = 'user' LIMIT 1",
      args: [userId],
    })
    if (!customer.rows.length) throw new HttpError(404, "Customer not found.")

    const cloudinary = getCloudinaryConfig()
    if (!cloudinary) {
      return NextResponse.json(
        { error: "Profile image upload is not configured. Set a valid CLOUDINARY_URL on the server." },
        { status: 503 },
      )
    }

    const timestamp = String(Math.floor(Date.now() / 1000))
    const uploadParams = {
      allowed_formats: "jpg,png,webp",
      folder: "alliedcapital/customer-avatars",
      overwrite: "true",
      public_id: `customer_${userId}_profile`,
      timestamp,
    }

    return NextResponse.json({
      cloudName: cloudinary.cloudName,
      apiKey: cloudinary.apiKey,
      signature: signCloudinaryParams(uploadParams, cloudinary.apiSecret),
      ...uploadParams,
    })
  } catch (error) {
    return fail(error)
  }
}
