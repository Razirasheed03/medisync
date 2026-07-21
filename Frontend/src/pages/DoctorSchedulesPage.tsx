import { useState } from 'react'

import { getApiErrorMessage } from '@/api/client'
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  Spinner,
} from '@/components/ui'
import { useDoctors } from '@/features/appointments'
import {
  ScheduleForm,
  useCreateSchedule,
  useSchedules,
  useUpdateSchedule,
  useUpdateScheduleStatus,
  WEEKDAY_LABELS,
  type DoctorSchedule,
} from '@/features/schedules'
import { useAuth } from '@/store'
import { useToast } from '@/providers/toast'
import { formatTimeRange } from '@/utils'

export function DoctorSchedulesPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'SUPER_ADMIN'
  const { showToast } = useToast()

  const [editor, setEditor] = useState<
    { mode: 'create' } | { mode: 'edit'; schedule: DoctorSchedule } | null
  >(null)

  const schedulesQuery = useSchedules()
  const doctorsQuery = useDoctors()
  const createMutation = useCreateSchedule()
  const statusMutation = useUpdateScheduleStatus()

  const doctorNames = new Map(
    (doctorsQuery.data ?? []).map((doctor) => [doctor.id, doctor.name]),
  )
  const assignedDoctorIds = (schedulesQuery.data ?? []).map(
    (schedule) => schedule.doctorId,
  )

  if (editor?.mode === 'create') {
    return (
      <>
        <PageHeader
          title="Create Schedule"
          description="Define working days, sessions, breaks, and slot duration."
        />
        <Card>
          <ScheduleForm
            assignedDoctorIds={assignedDoctorIds}
            submitLabel="Create schedule"
            onCancel={() => setEditor(null)}
            onCreate={async (input) => {
              await createMutation.mutateAsync(input)
              showToast('Schedule created', 'success')
              setEditor(null)
            }}
          />
        </Card>
      </>
    )
  }

  if (editor?.mode === 'edit') {
    return (
      <EditScheduleView
        schedule={editor.schedule}
        onDone={() => setEditor(null)}
      />
    )
  }

  return (
    <>
      <PageHeader
        title="Doctor Schedules"
        description="Manage doctor availability and working hours."
        actions={
          isAdmin ? (
            <Button onClick={() => setEditor({ mode: 'create' })}>
              New schedule
            </Button>
          ) : undefined
        }
      />

      {schedulesQuery.isPending ? (
        <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-16">
          <Spinner />
          <span className="text-sm font-medium text-slate-500">
            Loading schedules…
          </span>
        </div>
      ) : schedulesQuery.isError ? (
        <ErrorState
          message={getApiErrorMessage(schedulesQuery.error)}
          onRetry={() => void schedulesQuery.refetch()}
        />
      ) : schedulesQuery.data.length === 0 ? (
        <EmptyState
          title="No schedules yet"
          description={
            isAdmin
              ? 'Create the first doctor schedule to enable appointment booking.'
              : 'No doctor schedules have been configured yet.'
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {schedulesQuery.data.map((schedule) => (
            <Card key={schedule.id} className="p-4 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    {doctorNames.get(schedule.doctorId) ?? schedule.doctorId}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Slot duration: {schedule.slotDuration} minutes ·{' '}
                    <span
                      className={
                        schedule.isActive
                          ? 'font-medium text-emerald-700'
                          : 'font-medium text-slate-500'
                      }
                    >
                      {schedule.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
                {isAdmin ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setEditor({ mode: 'edit', schedule })}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      disabled={statusMutation.isPending}
                      onClick={() =>
                        void statusMutation
                          .mutateAsync({
                            doctorId: schedule.doctorId,
                            isActive: !schedule.isActive,
                          })
                          .then(() =>
                            showToast(
                              schedule.isActive
                                ? 'Schedule deactivated'
                                : 'Schedule activated',
                              'success',
                            ),
                          )
                          .catch((error: unknown) =>
                            showToast(getApiErrorMessage(error), 'error'),
                          )
                      }
                    >
                      {schedule.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                ) : null}
              </div>

              <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {schedule.workingDays.map((day) => (
                  <li
                    key={day.day}
                    className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
                  >
                    <p className="font-medium text-slate-900">
                      {WEEKDAY_LABELS[day.day]}
                    </p>
                    {day.sessions.map((session, index) => (
                      <p key={index} className="text-slate-600">
                        {formatTimeRange(session.startTime, session.endTime)}
                        {session.breakStartTime && session.breakEndTime
                          ? ` (break ${formatTimeRange(session.breakStartTime, session.breakEndTime)})`
                          : ''}
                      </p>
                    ))}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}

function EditScheduleView({
  schedule,
  onDone,
}: {
  schedule: DoctorSchedule
  onDone: () => void
}) {
  const updateMutation = useUpdateSchedule(schedule.doctorId)
  const { showToast } = useToast()

  return (
    <>
      <PageHeader
        title="Edit Schedule"
        description="Update working days, sessions, breaks, and slot duration."
      />
      <Card>
        <ScheduleForm
          schedule={schedule}
          submitLabel="Save changes"
          onCancel={onDone}
          onUpdate={async (input) => {
            await updateMutation.mutateAsync(input)
            showToast('Schedule updated', 'success')
            onDone()
          }}
        />
      </Card>
    </>
  )
}
