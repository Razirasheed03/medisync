import { useNavigate, useSearchParams } from 'react-router-dom'

import { Card, PageHeader } from '@/components/ui'
import {
  AppointmentForm,
  useCreateAppointment,
} from '@/features/appointments'
import { paths } from '@/routes/paths'

export function CreateAppointmentPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createMutation = useCreateAppointment()

  const initialSlot = {
    ...(searchParams.get('doctorId')
      ? { doctorId: searchParams.get('doctorId')! }
      : {}),
    ...(searchParams.get('date')
      ? { appointmentDate: searchParams.get('date')! }
      : {}),
    ...(searchParams.get('startTime')
      ? { startTime: searchParams.get('startTime')! }
      : {}),
    ...(searchParams.get('endTime')
      ? { endTime: searchParams.get('endTime')! }
      : {}),
  }

  return (
    <>
      <PageHeader
        title="New Appointment"
        description="Book an appointment against a doctor's available slots."
      />
      <Card>
        <AppointmentForm
          submitLabel="Create appointment"
          initialSlot={
            Object.keys(initialSlot).length > 0 ? initialSlot : undefined
          }
          onCreate={async (input) => {
            const appointment = await createMutation.mutateAsync(input)
            navigate(paths.appointmentDetails(appointment.id))
          }}
        />
      </Card>
    </>
  )
}
