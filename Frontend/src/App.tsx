import { AppProviders } from '@/providers'
import { AppRoutes } from '@/routes'
import { env } from '@/lib/env'

function ConfigurationError({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-sm font-semibold tracking-wide text-brand-600 uppercase">
        Configuration error
      </p>
      <h1 className="text-xl font-semibold text-ink">
        The app could not start
      </h1>
      <p className="max-w-md text-sm text-muted">{message}</p>
      <p className="max-w-md text-sm text-muted">
        Copy <code className="rounded bg-white/70 px-1.5 py-0.5">Frontend/.env.example</code>{' '}
        to <code className="rounded bg-white/70 px-1.5 py-0.5">Frontend/.env</code> and
        set the required values.
      </p>
    </div>
  )
}

export default function App() {
  if (env.configurationError) {
    return <ConfigurationError message={env.configurationError} />
  }

  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  )
}
