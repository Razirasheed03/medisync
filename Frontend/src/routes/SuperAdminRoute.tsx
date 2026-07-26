import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

import { markUnauthorizedAccess } from '@/lib/sessionFlags'
import { useAuth } from '@/store'

import { paths } from './paths'

/** Restricts nested pages to authenticated Super Admin users. */
export function SuperAdminRoute() {
  const { user } = useAuth()
  const allowed = user?.role === 'SUPER_ADMIN'

  useEffect(() => {
    if (!allowed) {
      markUnauthorizedAccess()
    }
  }, [allowed])

  if (!allowed) {
    return <Navigate to={paths.dashboard} replace />
  }

  return <Outlet />
}
