import { useQuery } from '@tanstack/react-query'

import type { UserRole } from '@/features/auth'

import { fetchDashboard } from './services/dashboardService'

export const dashboardKeys = {
  all: ['dashboard'] as const,
  role: (role: UserRole) => [...dashboardKeys.all, role] as const,
}

export function useDashboard(role: UserRole | undefined) {
  return useQuery({
    queryKey: dashboardKeys.role(role ?? 'SUPER_ADMIN'),
    queryFn: () => fetchDashboard(role!),
    enabled: Boolean(role),
  })
}
