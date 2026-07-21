/**
 * Centralized, typed access to environment variables.
 * All Vite env vars must be read through this module so that
 * missing configuration fails loudly and in one place.
 */

function requireEnv(key: keyof ImportMetaEnv): string {
  const value = import.meta.env[key]

  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Missing required environment variable: ${key}`)
  }

  return value
}

export const env = {
  apiBaseUrl: requireEnv('VITE_API_BASE_URL'),
  appName: requireEnv('VITE_APP_NAME'),
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const
