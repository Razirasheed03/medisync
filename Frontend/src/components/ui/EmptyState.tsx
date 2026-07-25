interface EmptyStateProps {
  title: string
  description: string
}

/** Placeholder body used when a list or view has no content. */
export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="glass-panel flex flex-col items-center justify-center gap-2 rounded-2xl px-6 py-16 text-center">
      <span
        className="mb-1 flex size-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-500"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="size-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
          />
        </svg>
      </span>
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      <p className="max-w-sm text-sm text-muted">{description}</p>
    </div>
  )
}
