"use client"

import { useState } from "react"
import { currency } from "@/lib/bank"
import { useBank } from "@/lib/bank-store"
import { TransferModal } from "@/components/bank/transfer-modal"

export default function DashboardPage() {
  const { currentUser } = useBank()
  const [transferOpen, setTransferOpen] = useState(false)

  const user = currentUser
  if (!user) return null

  return (
    <div className="mx-auto w-full max-w-[720px] space-y-4">
      <div>
        <h1 className="text-[20px] font-semibold text-[#333333]">Welcome, {user.name}</h1>
        <p className="mt-1 text-[11.5px] text-[#777777]">Your account overview</p>
      </div>

      <div className="border border-[#d7d7d7] bg-white px-4 py-4">
        <div className="text-[11px] font-medium text-[#777777]">Account balance</div>
        <div className="mt-1 text-[24px] font-semibold text-[#333333]">{currency(user.balance)}</div>
        <button
          type="button"
          onClick={() => setTransferOpen(true)}
          className="mt-3 h-9 bg-[#ddaa3f] px-4 text-[12px] font-medium text-white hover:bg-[#c99735]"
        >
          Transfer Money
        </button>
      </div>

      <div className="border border-[#d7d7d7] bg-white px-4 py-4">
        <h2 className="mb-3 text-[12px] font-medium text-[#555555]">Account details</h2>
        <div className="grid grid-cols-[120px_1fr] gap-y-2 text-[12px] text-[#777777]">
          <span>Account name</span>
          <span className="text-[#333333]">{user.name}</span>
          <span>Account number</span>
          <span className="text-[#333333]">{user.accountNumber}</span>
          <span>Status</span>
          <span className={user.status === "Active" ? "text-[#28a745]" : "text-[#b05b4f]"}>{user.status}</span>
          <span>Telephone</span>
          <span className="text-[#333333]">{user.phone || "-"}</span>
          <span>Date of birth</span>
          <span className="text-[#333333]">{user.dob || "-"}</span>
        </div>
      </div>

      <TransferModal open={transferOpen} onClose={() => setTransferOpen(false)} />
    </div>
  )
}
