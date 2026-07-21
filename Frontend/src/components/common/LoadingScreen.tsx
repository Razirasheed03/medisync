interface LoadingScreenProps {
  label?: string
}

/** Full-screen loading state used for lazy routes and app bootstrapping. */
export function LoadingScreen({ label = 'Loading…' }: LoadingScreenProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50"
    >
      <span className="size-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
  )
}
