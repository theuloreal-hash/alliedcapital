import { useCallback, useRef, useState } from "react"

export function usePendingAction() {
  const [pending, setPending] = useState(false)
  const locked = useRef(false)

  const run = useCallback(async <T,>(action: () => Promise<T>): Promise<T | undefined> => {
    if (locked.current) return

    locked.current = true
    setPending(true)
    try {
      return await action()
    } finally {
      locked.current = false
      setPending(false)
    }
  }, [])

  return { pending, run }
}
