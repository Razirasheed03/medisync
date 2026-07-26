import { apiClient } from '@/api/client'
import { markSessionExpired } from '@/lib/sessionFlags'
import { tokenStorage } from '@/lib/storage'
import { authStore } from '@/store/authStore'
import type { ApiResponse } from '@/types'

import type { AuthSession } from '../types'

export interface LoginCredentials {
  email: string
  password: string
}

/**
 * Authenticates the user. On success the backend also sets the
 * httpOnly refresh-token cookie; we only handle the access token
 * and user returned in the body.
 */
export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  const { data } = await apiClient.post<ApiResponse<AuthSession>>(
    '/auth/login',
    credentials,
  )

  authStore.setSession(data.data)
  return data.data
}

/**
 * Exchanges the refresh cookie for a new access token. Deduplicated so
 * concurrent 401s (or startup + interceptor races) trigger exactly one
 * refresh request against the backend.
 */
let refreshPromise: Promise<AuthSession> | null = null

export function refreshSession(): Promise<AuthSession> {
  refreshPromise ??= apiClient
    .post<ApiResponse<AuthSession>>('/auth/refresh', {})
    .then(({ data }) => {
      authStore.setSession(data.data)
      return data.data
    })
    .finally(() => {
      refreshPromise = null
    })

  return refreshPromise
}

/**
 * Attempts to restore the session on application startup using the
 * refresh cookie. Single-flight for the page lifetime so React
 * StrictMode double-effects share one restore (avoids refresh-token
 * rotation races). Resolves the auth status either way; never throws.
 */
let restorePromise: Promise<void> | null = null

export function restoreSession(): Promise<void> {
  if (authStore.getState().isAuthenticated) {
    return Promise.resolve()
  }

  restorePromise ??= (async () => {
    try {
      await refreshSession()
    } catch {
      // Only treat this as an expired session if we previously held an
      // access token — anonymous first visits also fail refresh quietly.
      if (tokenStorage.get()) {
        markSessionExpired()
      }
      authStore.clearSession()
    }
  })()

  return restorePromise
}

/**
 * Ends the session. Local state is always cleared, even if the
 * backend call fails (e.g. network error), so the user is never
 * stuck in a half-logged-out state.
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout', {})
  } finally {
    authStore.clearSession()
  }
}

/** Reads JWT `exp` (ms) from an access token without verifying the signature. */
export function getAccessTokenExpiryMs(token: string): number | null {
  try {
    const payloadSegment = token.split('.')[1]
    if (!payloadSegment) return null
    const payload = JSON.parse(atob(payloadSegment)) as { exp?: unknown }
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null
  } catch {
    return null
  }
}
