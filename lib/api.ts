import { NextResponse } from "next/server"
import { HttpError } from "@/lib/auth"

export function ok(data: Record<string, unknown> = {}) {
  return NextResponse.json(data, { status: 200, headers: { "cache-control": "no-store" } })
}

export function fail(error: unknown) {
  if (error instanceof HttpError) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: error.status, headers: { "cache-control": "no-store" } },
    )
  }
  console.error("[api]", error)
  return NextResponse.json(
    { ok: false, error: "Something went wrong. Please try again." },
    { status: 500, headers: { "cache-control": "no-store" } },
  )
}
