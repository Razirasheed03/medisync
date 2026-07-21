import { Card, PageHeader } from '@/components/ui'

const placeholderStats = [
  { label: "Today's Appointments", value: '—' },
  { label: 'Active Doctors', value: '—' },
  { label: 'Registered Patients', value: '—' },
  { label: 'Open Schedules', value: '—' },
]

export function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of clinic activity."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {placeholderStats.map((stat) => (
          <Card key={stat.label}>
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {stat.value}
            </p>
          </Card>
        ))}
      </div>
    </>
  )
}
