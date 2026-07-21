import { useEffect, type ReactNode } from 'react'

import { restoreSession } from '@/features/auth'

interface AuthProviderProps {
  children: ReactNode
}

/**
 * Kicks off session restoration on application startup by exchanging
 * the httpOnly refresh cookie for a fresh access token. Auth state
 * lives in the central auth store; this component only triggers the
 * bootstrap. Children render immediately — route guards hold the UI
 * on the loading screen until restoration settles.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  useEffect(() => {
    void restoreSession()
  }, [])

  return <>{children}</>
}
