import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { refreshSession } from '@/features/auth/services/authService'
import { env } from '@/lib/env'
import { tokenStorage } from '@/lib/storage'
import { authStore } from '@/store/authStore'
import type { ApiErrorResponse } from '@/types'

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  /** Marks a request that has already been retried after a token refresh. */
  _retry?: boolean
}

/**
 * Centralized Axios instance. All HTTP communication with the
 * backend must go through this client so that auth headers and
 * error normalization are applied consistently.
 *
 * `withCredentials` is required so the browser stores and sends the
 * httpOnly refresh-token cookie on the /auth endpoints.
 */
export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15_000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.get()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

/** Auth endpoints must never trigger a token refresh themselves. */
function isAuthEndpoint(config: RetriableRequestConfig): boolean {
  return config.url?.startsWith('/auth/') ?? false
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const config = error.config as RetriableRequestConfig | undefined

    if (
      error.response?.status !== 401 ||
      !config ||
      config._retry ||
      isAuthEndpoint(config)
    ) {
      return Promise.reject(error)
    }

    config._retry = true

    try {
      const session = await refreshSession()
      config.headers.Authorization = `Bearer ${session.accessToken}`
      return apiClient(config)
    } catch {
      // Refresh failed: end the session. Route guards react to the
      // store update and redirect the user to the login page.
      authStore.clearSession()
      return Promise.reject(error)
    }
  },
)

/** Extracts a human-readable message from any error thrown by the API client. */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'An unexpected error occurred'
}
