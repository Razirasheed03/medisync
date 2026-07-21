import { getApiErrorMessage } from '@/api/client'
import { Card, ErrorState, PageHeader, Spinner } from '@/components/ui'
import { useDashboard } from '@/features/dashboard'
import type { UserRole } from '@/features/auth'
import { useAuth } from '@/store'

const statsByRole: Record<
  UserRole,
  Array<{ label: string; key: string }>
> = {
  SUPER_ADMIN: [
    { label: "Today's Appointments", key: 'appointmentsToday' },
    { label: 'Active Doctors', key: 'doctors' },
    { label: 'Receptionists', key: 'receptionists' },
    { label: 'Registered Patients', key: 'patients' },
    { label: 'Active Schedules', key: 'activeSchedules' },
    { label: 'Upcoming Appointments', key: 'upcomingAppointments' },
  ],
  RECEPTIONIST: [
    { label: "Today's Appointments", key: 'appointmentsToday' },
    { label: 'Booked Today', key: 'bookedToday' },
    { label: 'Arrived Today', key: 'arrivedToday' },
    { label: 'Completed Today', key: 'completedToday' },
    { label: 'Registered Patients', key: 'patients' },
  ],
  DOCTOR: [
    { label: "Today's Appointments", key: 'appointmentsToday' },
    { label: 'Arrived Today', key: 'arrivedToday' },
    { label: 'Completed Today', key: 'completedToday' },
    { label: 'Upcoming Appointments', key: 'upcomingAppointments' },
  ],
}

const roleTitles: Record<UserRole, string> = {
  SUPER_ADMIN: 'Admin Dashboard',
  RECEPTIONIST: 'Reception Dashboard',
  DOCTOR: 'Doctor Dashboard',
}

export function DashboardPage() {
  const { user } = useAuth()
  const role = user?.role
  const dashboardQuery = useDashboard(role)

  if (!role) return null

  return (
    <>
      <PageHeader
        title={roleTitles[role]}
        description="Overview of clinic activity."
      />

      {dashboardQuery.isPending ? (
        <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-16">
          <Spinner />
          <span className="text-sm font-medium text-slate-500">
            Loading dashboard…
          </span>
        </div>
      ) : dashboardQuery.isError ? (
        <ErrorState
          message={getApiErrorMessage(dashboardQuery.error)}
          onRetry={() => void dashboardQuery.refetch()}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {statsByRole[role].map((stat) => {
            const value =
              (dashboardQuery.data as unknown as Record<string, number>)[
                stat.key
              ] ?? 0

            return (
              <Card key={stat.key}>
                <p className="text-sm font-medium text-slate-500">
                  {stat.label}
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {value}
                </p>
              </Card>
            )
          })}
        </div>
      )}
    </>
  )
}
