import { EmptyState, PageHeader } from '@/components/ui'

export function PatientsPage() {
  return (
    <>
      <PageHeader
        title="Patients"
        description="Browse and manage patient records."
      />
      <EmptyState
        title="Patient management coming soon"
        description="Patient records and registration will be implemented in a later phase."
      />
    </>
  )
}
