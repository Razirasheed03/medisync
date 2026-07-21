import { useSyncExternalStore } from 'react'

import { tokenStorage } from '@/lib/storage'

import type { AuthSession, AuthStatus, AuthUser } from '@/features/auth/types'

export interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  status: AuthStatus
  isAuthenticated: boolean
  isRestoring: boolean
}

/**
 * Centralized authentication state. Implemented as a framework-agnostic
 * external store so both React components (via `useAuth`) and the Axios
 * interceptors can read and update it without duplicating state.
 */
let state: AuthState = {
  user: null,
  accessToken: null,
  status: 'restoring',
  isAuthenticated: false,
  isRestoring: true,
}

const listeners = new Set<() => void>()

function setState(next: Pick<AuthState, 'user' | 'accessToken' | 'status'>): void {
  state = {
    ...next,
    isAuthenticated: next.status === 'authenticated',
    isRestoring: next.status === 'restoring',
  }

  for (const listener of listeners) listener()
}

export const authStore = {
  getState(): AuthState {
    return state
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  /** Stores a fresh session after a successful login or refresh. */
  setSession(session: AuthSession): void {
    tokenStorage.set(session.accessToken)
    setState({
      user: session.user,
      accessToken: session.accessToken,
      status: 'authenticated',
    })
  },

  /** Clears every trace of the session (state + persisted token). */
  clearSession(): void {
    tokenStorage.clear()
    setState({ user: null, accessToken: null, status: 'unauthenticated' })
  },
}

/** Reactive access to the centralized authentication state. */
export function useAuth(): AuthState {
  return useSyncExternalStore(authStore.subscribe, authStore.getState)
}
