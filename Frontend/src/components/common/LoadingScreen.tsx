interface LoadingScreenProps {
  label?: string
}

/** Full-screen loading state used for lazy routes and app bootstrapping. */
export function LoadingScreen({ label = 'Loading…' }: LoadingScreenProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-screen flex-col items-center justify-center gap-3"
    >
      <span className="size-8 animate-spin rounded-full border-2 border-brand-100 border-t-brand-500" />
      <p className="text-sm text-muted">{label}</p>
    </div>
  )
}
