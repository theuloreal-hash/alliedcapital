import type { ComponentProps, ReactNode } from "react"
import { LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

type AsyncButtonProps = ComponentProps<typeof Button> & {
  pending: boolean
  pendingText: string
  children: ReactNode
}

export function AsyncButton({ pending, pendingText, children, ...props }: AsyncButtonProps) {
  return (
    <Button {...props} disabled={props.disabled || pending} aria-busy={pending}>
      {pending ? <LoaderCircle aria-hidden="true" className="size-3.5 animate-spin" /> : null}
      {pending ? pendingText : children}
    </Button>
  )
}
