import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { isAuthenticated } from '@/features/auth'
import { paths } from './paths'

/**
 * Guards authenticated routes. Unauthenticated users are redirected
 * to the login page, preserving the location they attempted to visit.
 */
export function ProtectedRoute() {
  const location = useLocation()

  if (!isAuthenticated()) {
    return <Navigate to={paths.login} state={{ from: location }} replace />
  }

  return <Outlet />
}
