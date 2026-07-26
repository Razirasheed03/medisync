import { useEffect, type ReactNode } from 'react'

import {
  getAccessTokenExpiryMs,
  refreshSession,
  restoreSession,
} from '@/features/auth'
import { useAuth } from '@/store'

interface AuthProviderProps {
  children: ReactNode
}

/**
 * Kicks off session restoration on application startup by exchanging
 * the httpOnly refresh cookie for a fresh access token. Also schedules
 * a proactive refresh shortly before access-token expiry. Auth state
 * lives in the central auth store; this component only triggers bootstrap
 * and refresh timing. Children render immediately — route guards hold
 * the UI on the loading screen until restoration settles.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { accessToken, isAuthenticated } = useAuth()

  useEffect(() => {
    void restoreSession()
  }, [])

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return

    const expiryMs = getAccessTokenExpiryMs(accessToken)
    if (!expiryMs) return

    // Refresh one minute before expiry, with a small floor so we never
    // schedule in the past for very short tokens.
    const delay = Math.max(expiryMs - Date.now() - 60_000, 5_000)
    const timer = window.setTimeout(() => {
      void refreshSession().catch(() => {
        // Interceptor / restore paths handle hard failures.
      })
    }, delay)

    return () => window.clearTimeout(timer)
  }, [accessToken, isAuthenticated])

  return <>{children}</>
}
