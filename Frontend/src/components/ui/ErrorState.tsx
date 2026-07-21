import { Button } from './Button'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
}

/** In-page error display with an optional retry action. */
export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center"
    >
      <h2 className="text-lg font-semibold text-red-800">{title}</h2>
      <p className="max-w-md text-sm text-red-700">{message}</p>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry} className="mt-1">
          Try again
        </Button>
      ) : null}
    </div>
  )
}
