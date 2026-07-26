import { Component, type ErrorInfo, type ReactNode } from 'react'

import { paths } from '@/routes/paths'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

/**
 * Global error boundary. Catches render-time errors anywhere in the
 * tree and shows a recoverable fallback instead of a blank screen.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Unhandled render error:', error, errorInfo)
  }

  handleReset = (): void => {
    this.setState({ error: null })
    window.location.assign(paths.dashboard)
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-sm font-semibold tracking-wide text-brand-600 uppercase">
            Something went wrong
          </p>
          <h1 className="text-2xl font-bold text-ink">
            An unexpected error occurred
          </h1>
          <p className="max-w-md text-sm text-muted">{this.state.error.message}</p>
          <button
            type="button"
            onClick={this.handleReset}
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            Back to dashboard
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
