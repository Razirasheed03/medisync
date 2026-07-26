import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

import type { UserRole } from '@/features/auth'
import { markUnauthorizedAccess } from '@/lib/sessionFlags'
import { useAuth } from '@/store'

import { paths } from './paths'

interface RoleRouteProps {
  roles: readonly UserRole[]
}

/** Restricts nested pages to authenticated users with one of the given roles. */
export function RoleRoute({ roles }: RoleRouteProps) {
  const { user } = useAuth()
  const allowed = Boolean(user && roles.includes(user.role))

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
