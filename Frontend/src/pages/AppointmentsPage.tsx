import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { getApiErrorMessage } from '@/api/client'
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  Spinner,
} from '@/components/ui'
import {
  AppointmentFilters,
  DEPARTMENT_LABELS,
  Pagination,
  StatusBadge,
  useAppointments,
  useDoctors,
  type AppointmentListFilters,
} from '@/features/appointments'
import { paths } from '@/routes/paths'
import { useAuth } from '@/store'
import { formatTimeRange } from '@/utils'

const initialFilters: AppointmentListFilters = {
  page: 1,
  limit: 10,
  sortOrder: 'asc',
}

export function AppointmentsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const canBook =
    user?.role === 'SUPER_ADMIN' || user?.role === 'RECEPTIONIST'
  const showDoctorFilter = user?.role !== 'DOCTOR'

  const [filters, setFilters] = useState<AppointmentListFilters>(initialFilters)
  const appointmentsQuery = useAppointments(filters)
  const doctorsQuery = useDoctors()

  const doctorNames = useMemo(
    () =>
      new Map(
        (doctorsQuery.data ?? []).map((doctor) => [doctor.id, doctor.name]),
      ),
    [doctorsQuery.data],
  )

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.doctorId ||
      filters.department ||
      filters.date ||
      filters.dateFrom ||
      filters.dateTo ||
      filters.status,
  )

  return (
    <>
      <PageHeader
        title="Appointments"
        description={
          user?.role === 'DOCTOR'
            ? 'Your appointments.'
            : 'View and manage patient appointments.'
        }
        actions={
          canBook ? (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => navigate(paths.appointmentScheduler)}
              >
                Scheduler
              </Button>
              <Button onClick={() => navigate(paths.appointmentCreate)}>
                New appointment
              </Button>
            </div>
          ) : undefined
        }
      />

      <Card className="p-4 sm:p-6">
        <AppointmentFilters
          filters={filters}
          onChange={setFilters}
          showDoctorFilter={showDoctorFilter}
        />
      </Card>

      {appointmentsQuery.isPending ? (
        <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-16">
          <Spinner />
          <span className="text-sm font-medium text-slate-500">
            Loading appointments…
          </span>
        </div>
      ) : appointmentsQuery.isError ? (
        <ErrorState
          message={getApiErrorMessage(appointmentsQuery.error)}
          onRetry={() => void appointmentsQuery.refetch()}
        />
      ) : appointmentsQuery.data.appointments.length === 0 ? (
        <EmptyState
          title="No appointments found"
          description={
            hasActiveFilters
              ? 'No appointments match the current filters. Try adjusting or clearing them.'
              : 'There are no appointments yet.'
          }
        />
      ) : (
        <>
          <Card className="overflow-x-auto p-0">
            <table className="w-full min-w-200 text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 sm:px-6">Patient</th>
                  <th className="px-4 py-3 sm:px-6">Mobile</th>
                  {showDoctorFilter ? (
                    <th className="px-4 py-3 sm:px-6">Doctor</th>
                  ) : null}
                  <th className="px-4 py-3 sm:px-6">Department</th>
                  <th className="px-4 py-3 sm:px-6">Date</th>
                  <th className="px-4 py-3 sm:px-6">Time</th>
                  <th className="px-4 py-3 sm:px-6">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointmentsQuery.data.appointments.map((appointment) => (
                  <tr
                    key={appointment.id}
                    className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 sm:px-6">
                      <Link
                        to={paths.appointmentDetails(appointment.id)}
                        className="font-medium text-brand-700 hover:underline"
                      >
                        {appointment.patientName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600 sm:px-6">
                      {appointment.patientPhone}
                    </td>
                    {showDoctorFilter ? (
                      <td className="px-4 py-3 text-slate-600 sm:px-6">
                        {doctorNames.get(appointment.doctorId) ?? '—'}
                      </td>
                    ) : null}
                    <td className="px-4 py-3 text-slate-600 sm:px-6">
                      {DEPARTMENT_LABELS[appointment.department]}
                    </td>
                    <td className="px-4 py-3 text-slate-600 sm:px-6">
                      {appointment.appointmentDate}
                    </td>
                    <td className="px-4 py-3 text-slate-600 sm:px-6">
                      {formatTimeRange(appointment.startTime, appointment.endTime)}
                    </td>
                    <td className="px-4 py-3 sm:px-6">
                      <StatusBadge status={appointment.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Pagination
            pagination={appointmentsQuery.data.pagination}
            onPageChange={(page) => setFilters({ ...filters, page })}
          />
        </>
      )}
    </>
  )
}
