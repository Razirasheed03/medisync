import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { getApiErrorMessage } from '@/api/client'
import {
  Button,
  Card,
  ConfirmDialog,
  ErrorState,
  LoadingBlock,
  PageHeader,
  Textarea,
} from '@/components/ui'
import {
  DEPARTMENT_LABELS,
  StatusBadge,
  useAppointment,
  useCancelAppointment,
  useDoctors,
  useMarkAppointmentArrived,
  useUpdateAppointment,
} from '@/features/appointments'
import { paths } from '@/routes/paths'
import { useAuth } from '@/store'
import { useToast } from '@/providers/toast'
import { formatTime, formatTimeRange } from '@/utils'

const notesSchema = z.object({
  notes: z.string().trim().max(2000, 'Notes cannot exceed 2000 characters'),
})

type NotesFormValues = z.infer<typeof notesSchema>

export function AppointmentDetailsPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const appointmentQuery = useAppointment(id)
  const doctorsQuery = useDoctors()
  const cancelMutation = useCancelAppointment(id)
  const arriveMutation = useMarkAppointmentArrived(id)
  const updateMutation = useUpdateAppointment(id)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NotesFormValues>({
    resolver: zodResolver(notesSchema),
    values: { notes: appointmentQuery.data?.notes ?? '' },
  })

  if (appointmentQuery.isPending) {
    return <LoadingBlock label="Loading appointment…" variant="detail" />
  }

  if (appointmentQuery.isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(appointmentQuery.error)}
        onRetry={() => void appointmentQuery.refetch()}
      />
    )
  }

  const appointment = appointmentQuery.data
  const doctorName =
    doctorsQuery.data?.find((doctor) => doctor.id === appointment.doctorId)
      ?.name ?? appointment.doctorId

  const canManage =
    user?.role === 'SUPER_ADMIN' || user?.role === 'RECEPTIONIST'
  const isDoctor = user?.role === 'DOCTOR'
  // Doctors can only record notes once the patient has arrived.
  const canEditNotes = isDoctor && appointment.status === 'ARRIVED'

  const onConfirmCancel = async () => {
    setActionError(null)

    try {
      await cancelMutation.mutateAsync()
      setIsCancelDialogOpen(false)
      showToast('Appointment cancelled', 'success')
    } catch (error) {
      setActionError(getApiErrorMessage(error))
      setIsCancelDialogOpen(false)
    }
  }

  const onMarkArrived = async () => {
    setActionError(null)

    try {
      await arriveMutation.mutateAsync()
      showToast('Patient marked as arrived', 'success')
    } catch (error) {
      setActionError(getApiErrorMessage(error))
    }
  }

  const onSaveNotes = async (values: NotesFormValues) => {
    setActionError(null)

    try {
      await updateMutation.mutateAsync({
        notes: values.notes || null,
        status: 'COMPLETED',
      })
      showToast('Consultation notes saved', 'success')
    } catch (error) {
      setActionError(getApiErrorMessage(error))
    }
  }

  const details: Array<{ label: string; value: string }> = [
    { label: 'Patient name', value: appointment.patientName },
    { label: 'Patient email', value: appointment.patientEmail ?? '—' },
    { label: 'Patient phone', value: appointment.patientPhone },
    { label: 'Doctor', value: doctorName },
    {
      label: 'Department',
      value: DEPARTMENT_LABELS[appointment.department],
    },
    { label: 'Date', value: appointment.appointmentDate },
    {
      label: 'Time',
      value: formatTimeRange(appointment.startTime, appointment.endTime),
    },
    { label: 'Purpose', value: appointment.purpose || '—' },
  ]

  return (
    <>
      <PageHeader
        title="Appointment Details"
        description={`Appointment for ${appointment.patientName}.`}
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => navigate(paths.appointments)}
            >
              Back to list
            </Button>
            {canManage && appointment.status === 'BOOKED' ? (
              <>
                <Button
                  variant="secondary"
                  onClick={() =>
                    navigate(paths.appointmentEdit(appointment.id))
                  }
                >
                  Edit
                </Button>
                <Button
                  variant="secondary"
                  disabled={arriveMutation.isPending}
                  onClick={() => void onMarkArrived()}
                >
                  {arriveMutation.isPending
                    ? 'Marking…'
                    : 'Mark patient arrived'}
                </Button>
                <Button
                  variant="danger"
                  onClick={() => setIsCancelDialogOpen(true)}
                >
                  Cancel appointment
                </Button>
              </>
            ) : null}
            {canManage && appointment.status === 'ARRIVED' ? (
              <Button
                variant="danger"
                onClick={() => setIsCancelDialogOpen(true)}
              >
                Cancel appointment
              </Button>
            ) : null}
          </>
        }
      />

      {actionError ? (
        <div
          role="alert"
          className="rounded-xl border border-danger/20 bg-red-50/80 px-3 py-2 text-sm text-danger"
        >
          {actionError}
        </div>
      ) : null}

      <Card>
        <div className="flex items-center justify-between border-b border-glass-border pb-4">
          <h2 className="text-base font-semibold text-ink">Overview</h2>
          <StatusBadge status={appointment.status} />
        </div>

        <dl className="grid grid-cols-1 gap-x-8 gap-y-4 pt-4 sm:grid-cols-2">
          {details.map(({ label, value }) => (
            <div key={label}>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                {label}
              </dt>
              <dd className="mt-1 text-sm text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card>
        <h2 className="mb-4 text-base font-semibold text-ink">
          Consultation notes
        </h2>
        {canEditNotes ? (
          <form
            onSubmit={handleSubmit(onSaveNotes)}
            className="flex flex-col gap-4"
          >
            <Textarea
              label="Notes"
              placeholder="Record consultation notes…"
              error={errors.notes?.message}
              {...register('notes')}
            />
            <div className="flex justify-end gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Save notes & complete'}
              </Button>
            </div>
          </form>
        ) : (
          <>
            <p className="whitespace-pre-wrap text-sm text-ink">
              {appointment.notes || '—'}
            </p>
            {isDoctor && appointment.status === 'BOOKED' ? (
              <p className="mt-3 rounded-xl border border-warning/20 bg-amber-50/80 px-3 py-2 text-xs text-warning">
                Notes can be recorded once the receptionist marks the patient
                as arrived.
              </p>
            ) : null}
          </>
        )}
      </Card>

      <ConfirmDialog
        open={isCancelDialogOpen}
        title="Cancel this appointment?"
        description={`This will cancel the appointment for ${appointment.patientName} on ${appointment.appointmentDate} at ${formatTime(appointment.startTime)}. This action cannot be undone.`}
        confirmLabel="Cancel appointment"
        cancelLabel="Keep appointment"
        isConfirming={cancelMutation.isPending}
        onConfirm={() => void onConfirmCancel()}
        onCancel={() => setIsCancelDialogOpen(false)}
      />
    </>
  )
}
