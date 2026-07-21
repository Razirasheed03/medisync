import { EmptyState, PageHeader } from '@/components/ui'

export function AppointmentsPage() {
  return (
    <>
      <PageHeader
        title="Appointments"
        description="View and manage patient appointments."
      />
      <EmptyState
        title="Appointment management coming soon"
        description="Appointment booking and scheduling will be implemented in a later phase."
      />
    </>
  )
}
