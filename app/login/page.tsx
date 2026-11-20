"use client"

import { useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DEMO_ADMIN, DEMO_CUSTOMER } from "@/lib/bank"
import { useBank } from "@/lib/bank-store"

export default function LoginPage() {
  const { login, ready, currentUser, users } = useBank()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!ready || !currentUser) return
    router.replace(currentUser.role === "admin" ? "/admin" : "/dashboard")
  }, [ready, currentUser, router])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError("")
    setSubmitting(true)
    const user = login(email, password)
    setSubmitting(false)
    if (!user) {
      const existing = users.find((row) => row.email.toLowerCase() === email.trim().toLowerCase())
      setError(
        existing && existing.password === password
          ? "This account is not active. Please contact the bank."
          : "Email or password is incorrect.",
      )
      return
    }
    router.replace(user.role === "admin" ? "/admin" : "/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f8f6] px-4">
      <div className="w-full max-w-[380px] rounded-xl border border-[#d7d7d7] bg-white p-6">
        <div className="mb-5 text-center">
          <h1 className="text-[20px] font-semibold text-[#333333]">Sign in</h1>
          <p className="mt-1 text-[11.5px] text-[#777777]">Capital Bank online banking</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11.5px] font-medium text-[#555555]">Username / Email</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="h-9 border border-[#d7d7d7] px-3 text-[12px] text-[#333333] focus:border-[#ddaa3f] focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[11.5px] font-medium text-[#555555]">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="h-9 border border-[#d7d7d7] px-3 text-[12px] text-[#333333] focus:border-[#ddaa3f] focus:outline-none"
            />
          </label>

          {error && <p className="text-[11px] text-[#b05b4f]">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="h-9 w-full bg-[#ddaa3f] text-[12px] font-medium text-white hover:bg-[#c99735] disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-center text-[10px] text-[#9a9a9a]">
          Demo customer: {DEMO_CUSTOMER.email} / {DEMO_CUSTOMER.password}
          <br />
          Demo admin: {DEMO_ADMIN.email} / {DEMO_ADMIN.password}
        </p>

        <div className="mt-4 text-center">
          <Link href="/" className="text-[10.5px] text-[#777777] hover:text-[#333333]">
            Back to website
          </Link>
        </div>
      </div>
    </div>
  )
}
