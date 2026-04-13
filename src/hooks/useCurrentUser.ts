import { useState, useEffect } from 'react'
import { getContext } from '@microsoft/power-apps/app'
import { Cr978_coe_personsService } from '../generated'

export interface CurrentUser {
  name:    string
  role:    string
  email:   string
  loading: boolean
}

/** 6-second timeout wrapper so the hook never hangs indefinitely. */
function withTimeout<T>(promise: Promise<T>, ms = 6000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), ms)
    ),
  ])
}

export function useCurrentUser(): CurrentUser {
  const [user, setUser] = useState<CurrentUser>({
    name: '', role: '', email: '', loading: true,
  })

  useEffect(() => {
    let active = true

    async function load() {
      // ── Step 1: get identity from Power Apps context ──────────
      let name  = 'User'
      let email = ''

      try {
        const ctx = await withTimeout(getContext())
        name  = ctx.user.fullName         ?? ctx.user.userPrincipalName ?? 'User'
        email = ctx.user.userPrincipalName ?? ''
      } catch {
        // host unreachable (local dev or timeout) — proceed with defaults
        if (import.meta.env.DEV) {
          console.warn('[useCurrentUser] Power Apps SDK context unavailable — using fallback identity. This is expected in local development.')
        }
      }

      if (!active) return

      // ── Step 2: look up role / designation from Dataverse ─────
      // The cr978_coe_persons table stores cr978_roleidname (linked role)
      // and cr978_coe_designation (job title) keyed by cr978_email.
      let role = ''

      if (email) {
        try {
          const res = await withTimeout(Cr978_coe_personsService.getAll(), 5000)
          const emailLower = email.toLowerCase()
          const match = res.data?.find(
            p => p.cr978_email?.toLowerCase() === emailLower
          )
          if (match) {
            // Prefer linked role name, fall back to freetext designation
            role = match.cr978_roleidname ?? match.cr978_coe_designation ?? ''
          }
        } catch (err) {
          // non-fatal — fall back to 'Member' so the sidebar never shows a blank role
          console.warn('[useCurrentUser] Person lookup timed out or failed:', err instanceof Error ? err.message : String(err))
          role = 'Member'
        }
      }

      if (!active) return

      setUser({ name, role, email, loading: false })
    }

    load()
    return () => { active = false }
  }, [])

  return user
}
