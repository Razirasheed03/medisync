import { cn } from '@/utils'

interface SpinnerProps {
  className?: string
}

/** Inline loading spinner for in-page loading states. */
export function Spinner({ className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-block size-5 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600',
        className,
      )}
    />
  )
}
