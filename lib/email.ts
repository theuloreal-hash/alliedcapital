import nodemailer, { type Transporter } from "nodemailer"

const HOST = process.env.SMTP_HOST
const PORT = Number(process.env.SMTP_PORT ?? 465)
const USER = process.env.SMTP_USER
const PASS = process.env.SMTP_PASS
const FROM = process.env.SMTP_FROM ?? USER ?? "no-reply@alliedcapitalbank.com"
const ADMIN_EMAIL = process.env.ADMIN_NOTIFY_EMAIL?.trim() || USER?.trim() || ""

let transporter: Transporter | null = null

function getTransport(): Transporter | null {
  if (!HOST || !USER || !PASS) return null
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: HOST,
      port: PORT,
      secure: PORT === 465,
      auth: { user: USER, pass: PASS },
    })
  }
  return transporter
}

/** Sends mail when SMTP is configured; otherwise logs so the demo still works. */
export async function sendMail(options: { to: string; subject: string; text: string }) {
  const transport = getTransport()
  if (!options.to) return { ok: false as const, error: "No recipient address." }

  if (!transport) {
    console.info(`[email:simulated] to=${options.to} subject="${options.subject}"\n${options.text}`)
    return { ok: false as const, error: "SMTP is not configured." }
  }

  try {
    await transport.sendMail({ from: FROM, to: options.to, subject: options.subject, text: options.text })
    return { ok: true as const }
  } catch (error) {
    console.error("[email] failed:", error)
    return { ok: false as const, error: error instanceof Error ? error.message : "Send failed." }
  }
}

export async function sendCredentialsEmail(input: { to: string; name: string; password: string; temporary: boolean }) {
  const subject = input.temporary
    ? "Your Allied Capital Bank online banking password"
    : "Your Allied Capital Bank password was reset"
  return sendMail({
    to: input.to,
    subject,
    text: [
      `Dear ${input.name || "customer"},`,
      "",
      input.temporary
        ? "An online banking profile has been created for you at Allied Capital Bank."
        : "Your online banking password has been reset by the bank.",
      "",
      `Sign-in email: ${input.to}`,
      `Password: ${input.password}`,
      "",
      "Please sign in and change this password from your profile page.",
      "",
      "Allied Capital Bank",
    ].join("\n"),
  })
}

/** Notifies the bank's operations inbox about something a customer did. */
export async function notifyAdmin(input: { action: string; actor: string; details?: string }) {
  if (!ADMIN_EMAIL) {
    console.warn(`[email] admin notification not sent: ADMIN_NOTIFY_EMAIL is not configured. ${input.action} by ${input.actor}.`)
    return
  }
  const result = await sendMail({
    to: ADMIN_EMAIL,
    subject: `[Allied Capital Bank] ${input.action}`,
    text: [
      `Action: ${input.action}`,
      `Customer: ${input.actor}`,
      `Time: ${new Date().toISOString()}`,
      "",
      input.details ?? "",
      "",
      "This is an automated notification from the online banking system.",
    ].join("\n"),
  })
  if (!result.ok) {
    console.error(`[email] admin notification failed: ${input.action} by ${input.actor}. ${result.error}`)
  }
}

export function notifyCustomerAction(input: {
  action: string
  customer: { name: string; email: string }
  details?: string
}) {
  return notifyAdmin({
    action: input.action,
    actor: `${input.customer.name} (${input.customer.email})`,
    details: input.details,
  })
}
