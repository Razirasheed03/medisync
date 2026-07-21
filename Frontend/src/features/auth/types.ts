export type UserRole = 'SUPER_ADMIN' | 'RECEPTIONIST' | 'DOCTOR'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
}

/** Payload returned by the backend login and refresh endpoints. */
export interface AuthSession {
  accessToken: string
  user: AuthUser
}

/**
 * - `restoring`: the app is exchanging the refresh cookie on startup.
 * - `authenticated` / `unauthenticated`: the session outcome is known.
 */
export type AuthStatus = 'restoring' | 'authenticated' | 'unauthenticated'
