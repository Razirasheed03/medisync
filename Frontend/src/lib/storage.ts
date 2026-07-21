/**
 * Thin wrapper around localStorage so the storage mechanism
 * can be swapped (e.g. for httpOnly-cookie flows) without
 * touching consumers.
 */

const ACCESS_TOKEN_KEY = 'medisync.accessToken'

export const tokenStorage = {
  get(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  },
  set(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token)
  },
  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
  },
}
