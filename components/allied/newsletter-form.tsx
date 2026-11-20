"use client"

import { useState, type FormEvent } from "react"

type Status = "idle" | "loading" | "success" | "error"

export function NewsletterForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [message, setMessage] = useState("")

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setMessage("")

    if (name.trim().length < 2) {
      setStatus("error")
      setMessage("Please enter your name.")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus("error")
      setMessage("Please enter a valid email address.")
      return
    }

    setStatus("loading")
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      })
      const payload = (await response.json()) as { error?: string }
      if (!response.ok) throw new Error(payload.error || "Unable to subscribe right now.")
      setStatus("success")
      setMessage("Thank you — your subscription has been received.")
      setName("")
      setEmail("")
    } catch (error) {
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "Unable to subscribe right now. Please try again.")
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h3 className="text-[11px] leading-[1.5] font-bold text-white">
        Subscribe To Allied Capital Bank&apos;s Newsletter
      </h3>

      <div className="mt-4 flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-[10px] text-[#d0d0d0]">Name</span>
          <input
            type="text"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-8 w-full border border-[#777777] bg-white px-2 text-[11px] text-[#333333]"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[10px] text-[#d0d0d0]">Email</span>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-8 w-full border border-[#777777] bg-white px-2 text-[11px] text-[#333333]"
          />
        </label>

        <button
          type="submit"
          disabled={status === "loading"}
          className="mt-1 h-8 w-full border border-[#9a9a9a] bg-transparent text-[10.5px] font-medium text-white transition-colors hover:bg-[#444444] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === "loading" ? "Subscribing…" : "Subscribe"}
        </button>
      </div>

      {message && (
        <p
          role="status"
          aria-live="polite"
          className={`mt-3 text-[10px] leading-[1.5] ${status === "success" ? "text-[#A9D6B3]" : "text-[#F0B7AE]"}`}
        >
          {message}
        </p>
      )}
    </form>
  )
}
