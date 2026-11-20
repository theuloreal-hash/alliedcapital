"use client"

import { useState, type FormEvent } from "react"

type Status = "idle" | "loading" | "success" | "error"

const inputClass =
  "h-9 w-full border border-[#cfcfcf] bg-white px-2.5 text-[11.5px] text-[#333333] placeholder:text-[#aaaaaa]"

export function ContactForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [feedback, setFeedback] = useState("")

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFeedback("")

    if (name.trim().length < 2) {
      setStatus("error")
      setFeedback("Please enter your name.")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus("error")
      setFeedback("Please enter a valid email address.")
      return
    }
    if (message.trim().length < 10) {
      setStatus("error")
      setFeedback("Please tell us a little more about your enquiry.")
      return
    }

    setStatus("loading")
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), company: company.trim(), message: message.trim() }),
      })
      const payload = (await response.json()) as { error?: string }
      if (!response.ok) throw new Error(payload.error || "Your message could not be sent.")
      setStatus("success")
      setFeedback("Thank you. A relationship manager will contact you shortly.")
      setName("")
      setEmail("")
      setCompany("")
      setMessage("")
    } catch (error) {
      setStatus("error")
      setFeedback(error instanceof Error ? error.message : "Your message could not be sent. Please try again.")
    }
  }

  if (status === "success") {
    return (
      <div className="border border-[#dcdcdc] bg-[#fafafa] px-5 py-8">
        <h2 className="text-[13.5px] font-bold text-[#333333]">Thank you</h2>
        <p className="mt-2 text-[12px] leading-[1.75] text-[#555555]">{feedback}</p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle")
            setFeedback("")
          }}
          className="mt-5 h-9 bg-[#F4A128] px-5 text-[11px] font-medium text-white transition-colors hover:bg-[#dd8b16]"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="border border-[#dcdcdc] p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] text-[#555555]">Name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClass}
            autoComplete="name"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] text-[#555555]">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClass}
            autoComplete="email"
          />
        </label>
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-[10px] text-[#555555]">Company (optional)</span>
          <input
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            className={inputClass}
            autoComplete="organization"
          />
        </label>
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-[10px] text-[#555555]">How can we help?</span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={6}
            className="w-full resize-y border border-[#cfcfcf] bg-white px-2.5 py-2 text-[11.5px] text-[#333333]"
          />
        </label>
      </div>

      {feedback && (
        <p role="alert" className="mt-4 border border-[#efd3ce] bg-[#fdf5f3] px-3 py-2 text-[10.5px] text-[#a9554a]">
          {feedback}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-5 h-9 bg-[#F4A128] px-6 text-[11px] font-medium text-white transition-colors hover:bg-[#dd8b16] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "loading" ? "Sending…" : "Submit enquiry"}
      </button>

      <p className="mt-4 text-[9.5px] leading-[1.6] text-[#999999]">
        Please do not include account numbers, passwords or card details in this form.
      </p>
    </form>
  )
}
