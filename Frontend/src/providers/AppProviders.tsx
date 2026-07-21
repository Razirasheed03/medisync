import type { ReactNode } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'

import { ErrorBoundary } from '@/components/common'
import { queryClient } from '@/lib/queryClient'

import { AuthProvider } from './AuthProvider'
import { ToastProvider } from './ToastProvider'

interface AppProvidersProps {
  children: ReactNode
}

/** Composes every global provider in a single place. */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
