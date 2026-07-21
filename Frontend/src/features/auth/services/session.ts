import { tokenStorage } from '@/lib/storage'

/**
 * Session helpers used by the route guards. The real login flow
 * (forms + API calls) will be implemented in a later phase; for now
 * authentication state is derived purely from the stored token.
 */

export function isAuthenticated(): boolean {
  return tokenStorage.get() !== null
}

/** Development helper until the real login flow lands. */
export function startPlaceholderSession(): void {
  tokenStorage.set('placeholder-dev-token')
}

export function endSession(): void {
  tokenStorage.clear()
}
