import { useNavigate, useParams } from 'react-router-dom'

import { getApiErrorMessage } from '@/api/client'
import { Card, ErrorState, PageHeader, Spinner } from '@/components/ui'
import {
  AppointmentForm,
  useAppointment,
  useUpdateAppointment,
} from '@/features/appointments'
import { paths } from '@/routes/paths'

export function EditAppointmentPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()

  const appointmentQuery = useAppointment(id)
  const updateMutation = useUpdateAppointment(id)

  if (appointmentQuery.isPending) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-16">
        <Spinner />
        <span className="text-sm font-medium text-slate-500">
          Loading appointment…
        </span>
      </div>
    )
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

  return (
    <>
      <PageHeader
        title="Edit Appointment"
        description={`Update the appointment for ${appointment.patientName}.`}
      />
      <Card>
        <AppointmentForm
          appointment={appointment}
          submitLabel="Save changes"
          onUpdate={async (input) => {
            await updateMutation.mutateAsync(input)
            navigate(paths.appointmentDetails(id))
          }}
        />
      </Card>
    </>
  )
}
