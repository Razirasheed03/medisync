import { EmptyState, PageHeader } from '@/components/ui'

export function DoctorSchedulesPage() {
  return (
    <>
      <PageHeader
        title="Doctor Schedules"
        description="Manage doctor availability and working hours."
      />
      <EmptyState
        title="Schedule management coming soon"
        description="Doctor schedule views will be implemented in a later phase."
      />
    </>
  )
}
