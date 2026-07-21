import axios, { AxiosError } from 'axios'

import { env } from '@/lib/env'
import { tokenStorage } from '@/lib/storage'
import type { ApiErrorResponse } from '@/types'

/**
 * Centralized Axios instance. All HTTP communication with the
 * backend must go through this client so that auth headers and
 * error normalization are applied consistently.
 */
export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15_000,
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

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      tokenStorage.clear()
    }

    return Promise.reject(error)
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
