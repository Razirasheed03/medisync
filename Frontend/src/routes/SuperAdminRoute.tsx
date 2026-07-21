import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from '@/store'

import { paths } from './paths'

/** Restricts nested pages to authenticated Super Admin users. */
export function SuperAdminRoute() {
  const { user } = useAuth()

  if (user?.role !== 'SUPER_ADMIN') {
    return <Navigate to={paths.dashboard} replace />
  }

  return <Outlet />
}
