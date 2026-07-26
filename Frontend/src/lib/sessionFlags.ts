const SESSION_EXPIRED_KEY = 'medisync.sessionExpired'
const UNAUTHORIZED_KEY = 'medisync.unauthorized'

/** Marks that the next login screen should explain a lost session. */
export function markSessionExpired(): void {
  try {
    sessionStorage.setItem(SESSION_EXPIRED_KEY, '1')
  } catch {
    // Ignore storage failures (private mode quotas, etc.).
  }
}

export function consumeSessionExpired(): boolean {
  try {
    const value = sessionStorage.getItem(SESSION_EXPIRED_KEY)
    if (!value) return false
    sessionStorage.removeItem(SESSION_EXPIRED_KEY)
    return true
  } catch {
    return false
  }
}

/** One-shot flag for role-guard redirects (read by AppLayout). */
export function markUnauthorizedAccess(): void {
  try {
    sessionStorage.setItem(UNAUTHORIZED_KEY, '1')
  } catch {
    // Ignore storage failures.
  }
}

export function consumeUnauthorizedAccess(): boolean {
  try {
    const value = sessionStorage.getItem(UNAUTHORIZED_KEY)
    if (!value) return false
    sessionStorage.removeItem(UNAUTHORIZED_KEY)
    return true
  } catch {
    return false
  }
}
