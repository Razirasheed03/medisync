import { Component, type ErrorInfo, type ReactNode } from 'react'

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
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Unhandled render error:', error, errorInfo)
  }

  handleReset = (): void => {
    this.setState({ error: null })
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center">
          <p className="text-sm font-semibold tracking-wide text-brand-600 uppercase">
            Something went wrong
          </p>
          <h1 className="text-2xl font-bold text-slate-900">
            An unexpected error occurred
          </h1>
          <p className="max-w-md text-sm text-slate-500">
            {this.state.error.message}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
