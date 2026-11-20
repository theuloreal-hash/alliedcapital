import { NextResponse } from "next/server"

export async function POST(request: Request) {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Unable to read your request." }, { status: 400 })
  }

  const body = (payload ?? {}) as { name?: unknown; email?: unknown }
  const name = typeof body.name === "string" ? body.name.trim() : ""
  const email = typeof body.email === "string" ? body.email.trim() : ""

  if (name.length < 2) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
