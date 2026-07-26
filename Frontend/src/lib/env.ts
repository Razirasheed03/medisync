/**
 * Centralized, typed access to environment variables.
 * Missing configuration is reported via `configurationError` so the UI
 * can show a recoverable screen instead of crashing at import time.
 */

function readRequired(key: keyof ImportMetaEnv): string | null {
  const value = import.meta.env[key]
  return typeof value === 'string' && value.length > 0 ? value : null
}

const apiBaseUrl = readRequired('VITE_API_BASE_URL')
const appName = readRequired('VITE_APP_NAME')

const missingKeys = [
  !apiBaseUrl ? 'VITE_API_BASE_URL' : null,
  !appName ? 'VITE_APP_NAME' : null,
].filter((key): key is string => Boolean(key))

export const env = {
  apiBaseUrl: apiBaseUrl ?? '',
  appName: appName ?? 'MediSync',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  /** True in local/dev builds, or when explicitly enabled via env. */
  showTestCredentials:
    import.meta.env.DEV || import.meta.env.VITE_SHOW_TEST_CREDENTIALS === 'true',
  configurationError:
    missingKeys.length > 0
      ? `Missing required environment variable(s): ${missingKeys.join(', ')}`
      : null,
} as const
