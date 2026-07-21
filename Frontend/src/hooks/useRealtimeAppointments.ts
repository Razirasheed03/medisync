import { useEffect } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { io, type Socket } from 'socket.io-client'

import { appointmentKeys, doctorKeys } from '@/features/appointments'
import { dashboardKeys } from '@/features/dashboard'
import { env } from '@/lib/env'
import { useAuth } from '@/store'

/** Derives the Socket.IO origin from the REST API base URL. */
function getSocketOrigin(): string {
  return new URL(env.apiBaseUrl).origin
}

/**
 * Opens an authenticated Socket.IO connection while the user is signed
 * in and invalidates appointment / slot / dashboard queries whenever an
 * appointment lifecycle event arrives.
 */
export function useRealtimeAppointments(): void {
  const { accessToken, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return

    const socket: Socket = io(getSocketOrigin(), {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
    })

    const invalidate = () => {
      void queryClient.invalidateQueries({ queryKey: appointmentKeys.all })
      void queryClient.invalidateQueries({ queryKey: doctorKeys.all })
      void queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
    }

    socket.on('appointment:created', invalidate)
    socket.on('appointment:updated', invalidate)
    socket.on('appointment:cancelled', invalidate)

    return () => {
      socket.off('appointment:created', invalidate)
      socket.off('appointment:updated', invalidate)
      socket.off('appointment:cancelled', invalidate)
      socket.disconnect()
    }
  }, [accessToken, isAuthenticated, queryClient])
}
