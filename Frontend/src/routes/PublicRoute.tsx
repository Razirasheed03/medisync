import { Navigate, Outlet } from 'react-router-dom'

import { isAuthenticated } from '@/features/auth'
import { paths } from './paths'

/**
 * Guards public-only routes (e.g. login). Authenticated users are
 * redirected to the dashboard instead.
 */
export function PublicRoute() {
  if (isAuthenticated()) {
    return <Navigate to={paths.dashboard} replace />
  }

  return <Outlet />
}
