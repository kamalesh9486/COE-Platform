import { useEffect } from 'react'

/**
 * Reference-counted body scroll lock.
 * Multiple modals can call this simultaneously — the lock is only
 * released when all callers have unmounted or set active=false.
 *
 * @param active - When false, this caller does not contribute to the lock.
 *                 Defaults to true (always lock on mount).
 */
let lockCount = 0

export function useScrollLock(active = true) {
  useEffect(() => {
    if (!active) return
    lockCount++
    document.body.style.overflow = 'hidden'
    return () => {
      lockCount--
      if (lockCount <= 0) {
        lockCount = 0
        document.body.style.overflow = ''
      }
    }
  }, [active])
}
