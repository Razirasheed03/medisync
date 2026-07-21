import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { LoadingScreen } from '@/components/common'
import { useAuth } from '@/store'

import { paths } from './paths'

/**
 * Guards authenticated routes. While the session is being restored on
 * startup, the loading screen is shown instead of redirecting, which
 * prevents a flash of the login page for returning users.
 * Unauthenticated users are redirected to the login page, preserving
 * the location they attempted to visit.
 */
export function ProtectedRoute() {
  const location = useLocation()
  const { isAuthenticated, isRestoring } = useAuth()

  if (isRestoring) {
    return <LoadingScreen label="Checking your session…" />
  }

  if (!isAuthenticated) {
    return <Navigate to={paths.login} state={{ from: location }} replace />
  }

  return <Outlet />
}
