import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { io, type Socket } from 'socket.io-client'

import { appointmentKeys } from '@/features/appointments'
import { dashboardKeys } from '@/features/dashboard'
import { env } from '@/lib/env'
import { useAuth } from '@/store'

/** Derives the Socket.IO origin from the REST API base URL. */
function getSocketOrigin(): string {
  return new URL(env.apiBaseUrl).origin
}

/**
 * Opens an authenticated Socket.IO connection while the user is signed
 * in and invalidates active appointment / dashboard queries whenever an
 * appointment lifecycle event arrives. Invalidation is debounced to avoid
 * refetch storms when multiple events arrive close together.
 */
export function useRealtimeAppointments(): void {
  const { accessToken, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!isAuthenticated || !accessToken || env.configurationError) return

    const socket: Socket = io(getSocketOrigin(), {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
    })

    let debounceTimer: number | undefined

    const invalidate = () => {
      window.clearTimeout(debounceTimer)
      debounceTimer = window.setTimeout(() => {
        void queryClient.invalidateQueries({ queryKey: appointmentKeys.all })
        void queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
      }, 300)
    }

    socket.on('appointment:created', invalidate)
    socket.on('appointment:updated', invalidate)
    socket.on('appointment:cancelled', invalidate)

    return () => {
      window.clearTimeout(debounceTimer)
      socket.off('appointment:created', invalidate)
      socket.off('appointment:updated', invalidate)
      socket.off('appointment:cancelled', invalidate)
      socket.disconnect()
    }
  }, [accessToken, isAuthenticated, queryClient])
}
