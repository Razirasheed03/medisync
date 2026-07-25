import { Skeleton } from './Skeleton'

type LoadingVariant =
  | 'default'
  | 'cards'
  | 'table'
  | 'detail'
  | 'form'
  | 'slots'
  | 'schedules'

interface LoadingBlockProps {
  label?: string
  variant?: LoadingVariant
  /** Number of cards / rows / slot tiles to preview. */
  count?: number
}

function CardsSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="glass-panel rounded-2xl p-4 sm:p-5">
          <Skeleton className="h-3.5 w-28 rounded-full" />
          <Skeleton className="mt-4 h-8 w-16 rounded-lg" />
        </div>
      ))}
    </div>
  )
}

function TableSkeleton({ count }: { count: number }) {
  return (
    <div className="glass-panel overflow-hidden rounded-2xl">
      <div className="flex gap-4 border-b border-glass-border bg-white/50 px-4 py-3.5 sm:px-5">
        <Skeleton className="h-3 w-20 rounded-full" />
        <Skeleton className="hidden h-3 w-24 rounded-full sm:block" />
        <Skeleton className="hidden h-3 w-28 rounded-full md:block" />
        <Skeleton className="ml-auto h-3 w-16 rounded-full" />
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: count }, (_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 px-4 py-3.5 sm:px-5"
          >
            <Skeleton className="h-3.5 w-28 rounded-full sm:w-36" />
            <Skeleton className="hidden h-3.5 w-24 rounded-full sm:block" />
            <Skeleton className="hidden h-3.5 w-32 rounded-full md:block" />
            <Skeleton className="ml-auto h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="glass-panel rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between border-b border-glass-border pb-4">
          <Skeleton className="h-5 w-28 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="grid grid-cols-1 gap-x-8 gap-y-5 pt-5 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-20 rounded-full" />
              <Skeleton className="h-4 w-40 rounded-full" />
            </div>
          ))}
        </div>
      </div>
      <div className="glass-panel rounded-2xl p-5 sm:p-6">
        <Skeleton className="mb-4 h-5 w-40 rounded-full" />
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>
    </div>
  )
}

function FormSkeleton() {
  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-3.5 w-24 rounded-full" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ))}
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Skeleton className="h-9 w-24 rounded-xl" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
    </div>
  )
}

function SlotsSkeleton({ count }: { count: number }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: count }, (_, index) => (
          <Skeleton key={index} className="h-10 w-full rounded-xl" />
        ))}
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-3 w-16 rounded-full" />
        <Skeleton className="h-3 w-14 rounded-full" />
      </div>
    </div>
  )
}

function SchedulesSkeleton({ count }: { count: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="glass-panel rounded-2xl p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-4 w-40 rounded-full" />
              <Skeleton className="h-3 w-52 rounded-full" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-16 rounded-xl" />
              <Skeleton className="h-9 w-24 rounded-xl" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, dayIndex) => (
              <div
                key={dayIndex}
                className="rounded-xl border border-glass-border bg-white/65 px-3 py-2"
              >
                <Skeleton className="h-3.5 w-20 rounded-full" />
                <Skeleton className="mt-2 h-3 w-28 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function DefaultSkeleton() {
  return (
    <div className="glass-panel overflow-hidden rounded-2xl p-6">
      <div className="space-y-3">
        <Skeleton className="h-4 w-1/3 rounded-full" />
        <Skeleton className="h-3 w-full rounded-full" />
        <Skeleton className="h-3 w-5/6 rounded-full" />
        <Skeleton className="mt-4 h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-4/5" />
      </div>
    </div>
  )
}

/** Contextual in-page skeleton used across list and detail views. */
export function LoadingBlock({
  label = 'Loading…',
  variant = 'default',
  count,
}: LoadingBlockProps) {
  const content =
    variant === 'cards' ? (
      <CardsSkeleton count={count ?? 6} />
    ) : variant === 'table' ? (
      <TableSkeleton count={count ?? 6} />
    ) : variant === 'detail' ? (
      <DetailSkeleton />
    ) : variant === 'form' ? (
      <FormSkeleton />
    ) : variant === 'slots' ? (
      <SlotsSkeleton count={count ?? 8} />
    ) : variant === 'schedules' ? (
      <SchedulesSkeleton count={count ?? 2} />
    ) : (
      <DefaultSkeleton />
    )

  return (
    <div role="status" aria-live="polite" aria-label={label}>
      {content}
      <span className="sr-only">{label}</span>
    </div>
  )
}
