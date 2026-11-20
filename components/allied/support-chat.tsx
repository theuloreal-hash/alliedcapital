"use client"

import { useState, type FormEvent } from "react"
import { MessageSquare, Send, X } from "lucide-react"

type Message = { from: "agent" | "visitor"; text: string }

const GREETING: Message = {
  from: "agent",
  text: "Hello, welcome to Allied Capital Bank. How can we help you today?",
}

export function SupportChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([GREETING])
  const [value, setValue] = useState("")

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const text = value.trim()
    if (!text) return
    setMessages((current) => [
      ...current,
      { from: "visitor", text },
      {
        from: "agent",
        text: "Thank you for your message. A member of our customer support team will respond shortly. For urgent enquiries, please call 1-800-227-4825.",
      },
    ])
    setValue("")
  }

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label="Customer support chat"
          className="fixed right-4 bottom-[88px] z-50 flex max-h-[420px] w-[320px] max-w-[calc(100vw-32px)] flex-col border border-[#dcdcdc] bg-white sm:right-5"
        >
          <div className="flex items-center justify-between bg-[#2A6FDB] px-4 py-3 text-white">
            <div>
              <div className="text-[12px] font-medium">Customer support</div>
              <div className="text-[9.5px] text-[#D6E4FA]">Online now</div>
            </div>
            <button
              type="button"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
              className="grid size-7 place-items-center text-white/90 hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto bg-[#FAFAFA] p-3" aria-live="polite">
            {messages.map((message, index) => (
              <div
                key={`${message.from}-${index}`}
                className={`max-w-[85%] px-3 py-2 text-[10.5px] leading-[1.55] ${
                  message.from === "agent"
                    ? "bg-white text-[#444444] ring-1 ring-[#e5e5e5]"
                    : "ml-auto bg-[#2A6FDB] text-white"
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-[#dcdcdc] bg-white p-2.5">
            <input
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="Type your message"
              aria-label="Message"
              className="h-8 min-w-0 flex-1 border border-[#dcdcdc] px-2 text-[11px] text-[#333333]"
            />
            <button
              type="submit"
              aria-label="Send message"
              className="grid size-8 shrink-0 place-items-center bg-[#2A6FDB] text-white hover:bg-[#215bb5]"
            >
              <Send className="size-3.5" />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        aria-label={open ? "Close customer support chat" : "Open customer support chat"}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="fixed right-4 bottom-4 z-50 grid size-[56px] place-items-center rounded-full bg-[#2A6FDB] text-white shadow-[0_4px_14px_rgba(30,70,140,0.3)] transition-colors hover:bg-[#215bb5] sm:right-5 sm:bottom-5 sm:size-[60px]"
      >
        <MessageSquare className="size-6" strokeWidth={1.8} />
      </button>
    </>
  )
}
