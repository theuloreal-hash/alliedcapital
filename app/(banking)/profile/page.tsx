"use client"

import { useState, type FormEvent } from "react"
import { useBank } from "@/lib/bank-store"
import { Card, PageHeader } from "@/components/bank/ui"
import { Field, FormError, Input } from "@/components/bank/form"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/bank/ui"

export default function ProfilePage() {
  const { currentUser, updateCustomer, changePassword } = useBank()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: currentUser?.name ?? "",
    email: currentUser?.email ?? "",
    phone: currentUser?.phone ?? "",
    dob: currentUser?.dob ?? "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" })
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")

  const user = currentUser
  if (!user) return null

  function startEdit() {
    setForm({
      name: user!.name,
      email: user!.email,
      phone: user!.phone ?? "",
      dob: user!.dob ?? "",
    })
    setError("")
    setSuccess("")
    setEditing(true)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError("")
    const result = await updateCustomer(user!.id, {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      dob: form.dob.trim(),
    })
    if (!result.ok) {
      setError(result.error)
      return
    }
    setSuccess("Profile updated. The bank has been notified.")
    setEditing(false)
  }

  async function handlePassword(event: FormEvent) {
    event.preventDefault()
    setPasswordError("")
    setPasswordSuccess("")
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordError("The new passwords do not match.")
      return
    }
    const result = await changePassword(passwordForm.current, passwordForm.next)
    if (!result.ok) {
      setPasswordError(result.error)
      return
    }
    setPasswordSuccess("Password changed. Use the new password next time you sign in.")
    setPasswordForm({ current: "", next: "", confirm: "" })
  }

  return (
    <>
      <PageHeader eyebrow="Profile" title="My profile" description="View and update your personal details." />
      <Card className="max-w-[560px]">
        <div className="flex items-center gap-3 border-b border-[#d7d7d7] bg-[#f2f2f2] px-4 py-3">
          <Avatar name={user.name} className="size-10" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium text-[#555555]">{user.name}</div>
            <div className="truncate text-[10.5px] text-[#777777]">{user.email}</div>
          </div>
          {!editing && (
            <Button className="h-8 px-3 text-[11.5px]" onClick={startEdit}>
              Edit profile
            </Button>
          )}
        </div>
        <div className="px-4 py-4">
          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <Field label="Full name" htmlFor="profile-name">
                <Input id="profile-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </Field>
              <Field label="Email address" htmlFor="profile-email">
                <Input id="profile-email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              </Field>
              <div className="grid gap-3.5 sm:grid-cols-2">
                <Field label="Telephone" htmlFor="profile-phone">
                  <Input id="profile-phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
                </Field>
                <Field label="Date of birth" htmlFor="profile-dob">
                  <Input id="profile-dob" value={form.dob} onChange={(event) => setForm({ ...form, dob: event.target.value })} />
                </Field>
              </div>
              <FormError>{error}</FormError>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="h-9 px-3 text-[12px]" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="h-9 px-3 text-[12px] font-semibold">
                  Save changes
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-[120px_1fr] gap-y-2 text-[12px] text-[#777777]">
              <span>Account name</span>
              <span className="text-[#333333]">{user.name}</span>
              <span>Email</span>
              <span className="text-[#333333]">{user.email}</span>
              <span>Account number</span>
              <span className="text-[#333333]">{user.accountNumber}</span>
              <span>Telephone</span>
              <span className="text-[#333333]">{user.phone || "-"}</span>
              <span>Date of birth</span>
              <span className="text-[#333333]">{user.dob || "-"}</span>
              <span>Status</span>
              <span className={user.status === "Active" ? "text-[#28a745]" : "text-[#b05b4f]"}>{user.status}</span>
            </div>
          )}
          {success && <p className="mt-3 text-[11px] text-[#59866b]">{success}</p>}
        </div>
      </Card>

      <Card className="mt-4 max-w-[560px]">
        <div className="border-b border-[#d7d7d7] bg-[#f2f2f2] px-4 py-3 text-[12px] font-medium text-[#555555]">
          Change password
        </div>
        <form onSubmit={handlePassword} className="space-y-3.5 px-4 py-4">
          <Field label="Current password" htmlFor="password-current">
            <Input
              id="password-current"
              type="password"
              autoComplete="current-password"
              value={passwordForm.current}
              onChange={(event) => setPasswordForm({ ...passwordForm, current: event.target.value })}
            />
          </Field>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field label="New password" htmlFor="password-next">
              <Input
                id="password-next"
                type="password"
                autoComplete="new-password"
                value={passwordForm.next}
                onChange={(event) => setPasswordForm({ ...passwordForm, next: event.target.value })}
              />
            </Field>
            <Field label="Confirm new password" htmlFor="password-confirm">
              <Input
                id="password-confirm"
                type="password"
                autoComplete="new-password"
                value={passwordForm.confirm}
                onChange={(event) => setPasswordForm({ ...passwordForm, confirm: event.target.value })}
              />
            </Field>
          </div>
          <FormError>{passwordError}</FormError>
          {passwordSuccess && <p className="text-[11px] text-[#59866b]">{passwordSuccess}</p>}
          <Button type="submit" className="h-9 px-3 text-[12px] font-semibold">
            Update password
          </Button>
        </form>
      </Card>
    </>
  )
}