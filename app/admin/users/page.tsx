"use client"

import { useMemo, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Search, ShieldCheck, UserPlus, Users } from "lucide-react"
import { Avatar, Card, PageHeader, PanelHeading, StatusPill } from "@/components/bank/ui"
import { Field, FieldHint, FormError, Input, Select } from "@/components/bank/form"
import { Modal } from "@/components/bank/modal"
import { Toast, useToast } from "@/components/bank/toast"
import { Button } from "@/components/ui/button"
import { currency, formatDate, type BankUser } from "@/lib/bank"
import { useBank } from "@/lib/bank-store"

type AdjustState = { user: BankUser; direction: "in" | "out" }

const emptyForm = { name: "", email: "", password: "", openingBalance: "" }

export default function AdminUsersPage() {
  const { users: allUsers, createCustomer, updateCustomer, setCustomerStatus, deleteCustomer, restoreCustomer, adjustBalance, resetPassword, impersonateCustomer, userTransactions } = useBank()
  const customers = allUsers.filter((user) => user.role === "user")
  const router = useRouter()
  const { message, tone, notify } = useToast()

  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<"all" | "Active" | "Suspended" | "Deleted">("all")
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState("")
  const [adjust, setAdjust] = useState<AdjustState | null>(null)
  const [adjustAmount, setAdjustAmount] = useState("")
  const [adjustNote, setAdjustNote] = useState("")
  const [adjustError, setAdjustError] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<BankUser | null>(null)
  const [selectedUser, setSelectedUser] = useState<BankUser | null>(null)
  const [editTarget, setEditTarget] = useState<BankUser | null>(null)
  const [editForm, setEditForm] = useState({ name: "", email: "", password: "", phone: "", dob: "" })
  const [editError, setEditError] = useState("")
  const [passwordTarget, setPasswordTarget] = useState<BankUser | null>(null)
  const [passwordValue, setPasswordValue] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return customers.filter((customer) => {
      const matchesQuery =
        !needle ||
        `${customer.name} ${customer.email} ${customer.username ?? ""} ${customer.accountNumber}`
          .toLowerCase()
          .includes(needle)
      const matchesStatus = status === "all" || customer.status === status
      return matchesQuery && matchesStatus
    })
  }, [customers, query, status])

  function openCreate() {
    setForm(emptyForm)
    setFormError("")
    setCreateOpen(true)
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    const opening = Number(form.openingBalance || 0)
    const result = await createCustomer({
      name: form.name,
      email: form.email,
      password: form.password,
      openingBalance: Number.isFinite(opening) ? opening : Number.NaN,
    })
    if (!result.ok) {
      setFormError(result.error)
      return
    }
    notify(`Customer created. Sign-in details emailed to ${result.email}.`)
    setCreateOpen(false)
    setForm(emptyForm)
  }

  function openAdjust(user: BankUser, direction: "in" | "out") {
    setAdjust({ user, direction })
    setAdjustAmount("")
    setAdjustNote("")
    setAdjustError("")
  }

  async function handleAdjust(event: FormEvent) {
    event.preventDefault()
    if (!adjust) return
    const value = Number(adjustAmount)
    const result = await adjustBalance(
      adjust.user.id,
      value,
      adjust.direction,
      adjustNote || (adjust.direction === "in" ? "Account credit" : "Account debit"),
    )
    if (!result.ok) {
      setAdjustError(result.error)
      return
    }
    notify(
      `${adjust.direction === "in" ? "Credited" : "Debited"} ${currency(value)} ${adjust.direction === "in" ? "to" : "from"} ${adjust.user.name}'s account.`,
    )
    setAdjust(null)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await deleteCustomer(deleteTarget.id)
    notify(`${deleteTarget.name}'s account was deleted. You can restore it later.`)
    setDeleteTarget(null)
  }

  function openEdit(user: BankUser) {
    setEditTarget(user)
    setEditForm({
      name: user.name,
      email: user.email,
      password: "",
      phone: user.phone ?? "",
      dob: user.dob ?? "",
    })
    setEditError("")
    setSelectedUser(null)
  }

  async function handleEdit(event: FormEvent) {
    event.preventDefault()
    if (!editTarget) return
    const result = await updateCustomer(editTarget.id, {
      name: editForm.name.trim(),
      email: editForm.email.trim(),
      ...(editForm.password ? { password: editForm.password } : {}),
      phone: editForm.phone.trim(),
      dob: editForm.dob.trim(),
    })
    if (!result.ok) {
      setEditError(result.error)
      return
    }
    notify(
      editForm.password
        ? `${editForm.name.trim()}'s profile updated and the new password emailed to them.`
        : `${editForm.name.trim()}'s profile updated.`,
    )
    setEditTarget(null)
  }

  async function handleResetPassword(event: FormEvent) {
    event.preventDefault()
    if (!passwordTarget) return
    const result = await resetPassword(passwordTarget.id, passwordValue)
    if (!result.ok) {
      setPasswordError(result.error)
      return
    }
    notify(`New password emailed to ${passwordTarget.email}.`)
    setPasswordTarget(null)
    setPasswordValue("")
    setPasswordError("")
  }

  async function handleImpersonate(user: BankUser) {
    await impersonateCustomer(user.id)
    setSelectedUser(null)
    notify(`Now viewing as ${user.name}.`)
    router.push("/dashboard")
  }

  return (
    <>
      <PageHeader
        eyebrow="Customers"
        title="Customer management"
        description="Create customer profiles, adjust balances and control access. Only administrators can add customers."
        actions={
          <Button className="h-9 px-3 text-[11.5px] font-semibold" onClick={openCreate}>
            <UserPlus className="size-3.5" /> Create customer
          </Button>
        }
      />

      <Card>
        <PanelHeading title="All customers" description={`${filtered.length} of ${customers.length} profiles`} />
        <div className="flex flex-col gap-2.5 px-4 py-3.5 sm:flex-row sm:items-center sm:px-5">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-[#9da2a3]" />
            <Input
              aria-label="Search customers"
              placeholder="Search name, email or account number…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-9 pl-9 text-[12px]"
            />
          </div>
          <Select
            aria-label="Filter by status"
            value={status}
            onChange={(event) => setStatus(event.target.value as "all" | "Active" | "Suspended" | "Deleted")}
            className="h-9 w-full text-[12px] sm:w-[160px]"
          >
            <option value="all">All statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Deleted">Deleted</option>
          </Select>
        </div>

        <div className="border-t border-border">
          {filtered.length === 0 ? (
            <div className="px-4 py-12 text-center text-[12px] text-muted-foreground">
              No customers match your filters.
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-border bg-[#fbfbf9]">
                    <th className="px-4 py-2.5 text-[10px] font-semibold tracking-wide text-[#a0a4a5] uppercase sm:px-5">Customer</th>
                    <th className="px-4 py-2.5 text-[10px] font-semibold tracking-wide text-[#a0a4a5] uppercase">Account</th>
                    <th className="px-4 py-2.5 text-[10px] font-semibold tracking-wide text-[#a0a4a5] uppercase">Balance</th>
                    <th className="px-4 py-2.5 text-[10px] font-semibold tracking-wide text-[#a0a4a5] uppercase">Status</th>
                    <th className="px-4 py-2.5 text-[10px] font-semibold tracking-wide text-[#a0a4a5] uppercase">Joined</th>
                    <th className="px-4 py-2.5 text-right text-[10px] font-semibold tracking-wide text-[#a0a4a5] uppercase sm:px-5">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((customer) => (
                    <tr key={customer.id} className="border-b border-[#f0f0ed] last:border-0 hover:bg-[#fbfbf8]">
                      <td className="px-4 py-3 sm:px-5">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={customer.name} className="size-9" />
                          <div className="min-w-0">
                            <div className="text-[12.5px] font-semibold text-[#46515a]">{customer.name}</div>
                            <div className="text-[10.5px] text-[#a0a5a5]">{customer.email}</div>
                            {customer.username && (
                              <div className="text-[10px] text-[#b4b8b9]">@{customer.username}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[10.5px] whitespace-nowrap text-[#737b80]">{customer.accountNumber}</td>
                      <td className="px-4 py-3 text-[12.5px] font-bold whitespace-nowrap text-[#45515a]">{currency(customer.balance)}</td>
                      <td className="px-4 py-3">
                        <StatusPill status={customer.status} />
                      </td>
                      <td className="px-4 py-3 text-[11px] whitespace-nowrap text-[#969c9e]">{formatDate(customer.createdAt)}</td>
                      <td className="px-4 py-3 text-right sm:px-5">
                        <button
                          type="button"
                          aria-label={`Actions for ${customer.name}`}
                          onClick={() => setSelectedUser(customer)}
                          className="grid size-7 place-items-center rounded-md text-[#7d868c] transition hover:bg-[#f1f1ee]"
                        >
                          <MoreHorizontal className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex items-start gap-2 border-t border-border px-4 py-3 text-[10.5px] leading-relaxed text-[#7f8a80] sm:px-5">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-[#6f9177]" />
          Customers receive their sign-in details by email and can change the password from their profile.
        </div>
      </Card>

      {createOpen && (
        <Modal
          title="Create customer"
          description="The customer can sign in immediately with these details."
          onClose={() => setCreateOpen(false)}
          footer={
            <>
              <Button variant="outline" className="h-9 px-3 text-[12px]" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" form="create-customer-form" className="h-9 px-3 text-[12px] font-semibold">
                Create customer
              </Button>
            </>
          }
        >
          <form id="create-customer-form" onSubmit={handleCreate} className="space-y-3.5">
            <Field label="Full name" htmlFor="new-name">
              <Input
                id="new-name"
                autoFocus
                placeholder="e.g. Imafidon Helen"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </Field>
            <Field label="Email address" htmlFor="new-email">
              <Input
                id="new-email"
                type="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
            </Field>
            <div className="grid gap-3.5 sm:grid-cols-2">
              <Field label="Temporary password" htmlFor="new-password" hint="Emailed to the customer · at least 6 characters">
                <Input
                  id="new-password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                />
              </Field>
              <Field label="Opening balance" htmlFor="new-balance" hintRight={<FieldHint>Optional</FieldHint>}>
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[12px] font-semibold text-[#8a9196]">
                    $
                  </span>
                  <Input
                    id="new-balance"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={form.openingBalance}
                    onChange={(event) => setForm({ ...form, openingBalance: event.target.value })}
                    className="pl-7"
                  />
                </div>
              </Field>
            </div>
            <div className="flex items-start gap-2 rounded-lg border border-[#eee3ce] bg-[#fbf7ef] px-3 py-2.5 text-[10.5px] leading-relaxed text-[#796744]">
              <Users className="mt-0.5 size-3.5 shrink-0 text-[#b78025]" />
              An account number is generated automatically. Any opening balance appears as the first deposit.
            </div>
            <FormError>{formError}</FormError>
          </form>
        </Modal>
      )}

      {adjust && (
        <Modal
          title={adjust.direction === "in" ? "Credit customer account" : "Debit customer account"}
          description={`${adjust.user.name} · ${currency(adjust.user.balance)} available`}
          onClose={() => setAdjust(null)}
          footer={
            <>
              <Button variant="outline" className="h-9 px-3 text-[12px]" onClick={() => setAdjust(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                form="adjust-form"
                className="h-9 px-3 text-[12px] font-semibold"
              >
                {adjust.direction === "in" ? "Add funds" : "Remove funds"}
              </Button>
            </>
          }
        >
          <form id="adjust-form" onSubmit={handleAdjust} className="space-y-3.5">
            <Field label="Amount" htmlFor="adjust-amount" hintRight={<FieldHint>USD</FieldHint>}>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[13px] font-semibold text-[#8a9196]">
                  $
                </span>
                <Input
                  id="adjust-amount"
                  autoFocus
                  inputMode="decimal"
                  placeholder="0.00"
                  value={adjustAmount}
                  onChange={(event) => setAdjustAmount(event.target.value)}
                  className="pl-7 text-[15px] font-semibold"
                />
              </div>
            </Field>
            <Field label="Description" htmlFor="adjust-note" hint="Appears on the customer's statement.">
              <Input
                id="adjust-note"
                placeholder={adjust.direction === "in" ? "e.g. Goodwill credit" : "e.g. Fee correction"}
                value={adjustNote}
                onChange={(event) => setAdjustNote(event.target.value)}
              />
            </Field>
            <FormError>{adjustError}</FormError>
            <div className="rounded-lg bg-[#fbf9f4] px-3 py-2.5 text-[10.5px] leading-relaxed text-[#8a8172]">
              {adjust.direction === "in"
                ? "The amount is added to the customer's available balance immediately."
                : "The amount is removed from the customer's available balance. It cannot exceed the current balance."}
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <Modal
          title="Delete customer"
          description="The account is disabled and can be restored later."
          onClose={() => setDeleteTarget(null)}
          footer={
            <>
              <Button variant="outline" className="h-9 px-3 text-[12px]" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button className="h-9 bg-[#b05b4f] px-3 text-[12px] font-semibold text-white hover:bg-[#9d4c41]" onClick={handleDelete}>
                Delete customer
              </Button>
            </>
          }
        >
          <p className="text-[12px] leading-relaxed text-[#5b656d]">
            Delete <strong>{deleteTarget.name}</strong> ({deleteTarget.email})? Their account is disabled and they
            cannot sign in. Their {userTransactions(deleteTarget.id).length} transaction(s) are kept and the account
            can be restored from the actions menu.
          </p>
        </Modal>
      )}

      {selectedUser && (
        <Modal
          title="Customer actions"
          description={`${selectedUser.name} · ${selectedUser.email}`}
          onClose={() => setSelectedUser(null)}
          footer={
            <Button variant="outline" className="h-9 px-3 text-[12px]" onClick={() => setSelectedUser(null)}>
              Close
            </Button>
          }
        >
          <div className="grid gap-2">
            <Button className="h-9 justify-start px-3 text-[12px] font-semibold" onClick={() => { setSelectedUser(null); openAdjust(selectedUser, "in") }}>
              Credit account
            </Button>
            <Button className="h-9 justify-start px-3 text-[12px] font-semibold" onClick={() => { setSelectedUser(null); openAdjust(selectedUser, "out") }}>
              Debit account
            </Button>
            <Button variant="outline" className="h-9 justify-start px-3 text-[12px]" onClick={() => openEdit(selectedUser)}>
              Edit profile
            </Button>
            <Button
              variant="outline"
              className="h-9 justify-start px-3 text-[12px]"
              onClick={() => {
                setPasswordTarget(selectedUser)
                setPasswordValue("")
                setPasswordError("")
                setSelectedUser(null)
              }}
            >
              Reset password
            </Button>
            <Button variant="outline" className="h-9 justify-start px-3 text-[12px]" onClick={() => handleImpersonate(selectedUser)}>
              Impersonate
            </Button>
            {selectedUser.status !== "Deleted" && (
              <Button
                variant="outline"
                className="h-9 justify-start px-3 text-[12px]"
                onClick={async () => {
                  const next = selectedUser.status === "Active" ? "Suspended" : "Active"
                  await setCustomerStatus(selectedUser.id, next)
                  notify(`${selectedUser.name}'s account is now ${next.toLowerCase()}.`)
                  setSelectedUser(null)
                }}
              >
                {selectedUser.status === "Active" ? "Disable account" : "Enable account"}
              </Button>
            )}
            {selectedUser.status === "Deleted" ? (
              <Button
                className="h-9 justify-start px-3 text-[12px] font-semibold"
                onClick={async () => {
                  await restoreCustomer(selectedUser.id)
                  notify(`${selectedUser.name}'s account restored.`)
                  setSelectedUser(null)
                }}
              >
                Restore account
              </Button>
            ) : (
              <Button
                className="h-9 justify-start bg-[#b05b4f] px-3 text-[12px] font-semibold text-white hover:bg-[#9d4c41]"
                onClick={() => {
                  setDeleteTarget(selectedUser)
                  setSelectedUser(null)
                }}
              >
                Delete account
              </Button>
            )}
          </div>
        </Modal>
      )}

      {editTarget && (
        <Modal
          title="Edit customer"
          description="Update profile details."
          onClose={() => setEditTarget(null)}
          footer={
            <>
              <Button variant="outline" className="h-9 px-3 text-[12px]" onClick={() => setEditTarget(null)}>
                Cancel
              </Button>
              <Button type="submit" form="edit-customer-form" className="h-9 px-3 text-[12px] font-semibold">
                Save changes
              </Button>
            </>
          }
        >
          <form id="edit-customer-form" onSubmit={handleEdit} className="space-y-3.5">
            <Field label="Full name" htmlFor="edit-name">
              <Input id="edit-name" value={editForm.name} onChange={(event) => setEditForm({ ...editForm, name: event.target.value })} />
            </Field>
            <Field label="Email address" htmlFor="edit-email">
              <Input id="edit-email" type="email" value={editForm.email} onChange={(event) => setEditForm({ ...editForm, email: event.target.value })} />
            </Field>
            <Field label="New password" htmlFor="edit-password" hint="Leave blank to keep the current password. Setting one emails it to the customer.">
              <Input
                id="edit-password"
                type="text"
                autoComplete="new-password"
                value={editForm.password}
                onChange={(event) => setEditForm({ ...editForm, password: event.target.value })}
              />
            </Field>
            <div className="grid gap-3.5 sm:grid-cols-2">
              <Field label="Telephone" htmlFor="edit-phone">
                <Input id="edit-phone" value={editForm.phone} onChange={(event) => setEditForm({ ...editForm, phone: event.target.value })} />
              </Field>
              <Field label="Date of birth" htmlFor="edit-dob">
                <Input id="edit-dob" value={editForm.dob} onChange={(event) => setEditForm({ ...editForm, dob: event.target.value })} />
              </Field>
            </div>
            <FormError>{editError}</FormError>
          </form>
        </Modal>
      )}

      {passwordTarget && (
        <Modal
          title="Reset password"
          description={`${passwordTarget.name} · ${passwordTarget.email}`}
          onClose={() => setPasswordTarget(null)}
          footer={
            <>
              <Button variant="outline" className="h-9 px-3 text-[12px]" onClick={() => setPasswordTarget(null)}>
                Cancel
              </Button>
              <Button type="submit" form="reset-password-form" className="h-9 px-3 text-[12px] font-semibold">
                Save and email
              </Button>
            </>
          }
        >
          <form id="reset-password-form" onSubmit={handleResetPassword} className="space-y-3.5">
            <Field
              label="New password"
              htmlFor="reset-password-value"
              hint="The customer is emailed this password and should change it after signing in."
            >
              <Input
                id="reset-password-value"
                type="text"
                autoComplete="new-password"
                value={passwordValue}
                onChange={(event) => setPasswordValue(event.target.value)}
                placeholder="At least 6 characters"
              />
            </Field>
            <FormError>{passwordError}</FormError>
          </form>
        </Modal>
      )}

      <Toast message={message} tone={tone} />
    </>
  )
}
