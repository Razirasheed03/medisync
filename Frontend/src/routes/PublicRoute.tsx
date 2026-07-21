import { Navigate, Outlet } from 'react-router-dom'

import { LoadingScreen } from '@/components/common'
import { useAuth } from '@/store'

import { paths } from './paths'

/**
 * Guards public-only routes (e.g. login). Waits for session restoration
 * to settle so a returning user is not shown the login form for a
 * moment before being redirected to the dashboard.
 */
export function PublicRoute() {
  const { isAuthenticated, isRestoring } = useAuth()

  if (isRestoring) {
    return <LoadingScreen label="Checking your session…" />
  }

  if (isAuthenticated) {
    return <Navigate to={paths.dashboard} replace />
  }

  return <Outlet />
}
