import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const controlBase =
  "w-full rounded-lg border border-[#e3e4e0] bg-white px-3 text-[13px] text-[#33404a] outline-none transition placeholder:text-[#a9aeb0] focus:border-[#c89849] focus:ring-3 focus:ring-[#c89849]/15 disabled:cursor-not-allowed disabled:bg-muted"

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlBase, "h-10", className)} {...props} />
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(controlBase, "h-10 appearance-none pr-8", className)} {...props}>
      {children}
    </select>
  )
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(controlBase, "min-h-[74px] resize-none py-2.5", className)} {...props} />
}

export function Field({
  label,
  htmlFor,
  hint,
  hintRight,
  children,
}: {
  label: string
  htmlFor?: string
  hint?: string
  hintRight?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={htmlFor} className="text-[11.5px] font-semibold text-[#4d5860]">
          {label}
        </label>
        {hintRight}
      </div>
      {children}
      {hint && <span className="text-[10.5px] text-muted-foreground">{hint}</span>}
    </div>
  )
}

export function FormError({ children }: { children: ReactNode }) {
  if (!children) return null
  return (
    <div
      role="alert"
      className="rounded-lg border border-[#f0dcd8] bg-[#fcf4f2] px-3 py-2 text-[11.5px] font-medium text-[#a9554a]"
    >
      {children}
    </div>
  )
}

export function FieldHint({ children }: { children: ReactNode }) {
  return <span className="text-[10.5px] font-normal text-[#9aa0a2]">{children}</span>
}
