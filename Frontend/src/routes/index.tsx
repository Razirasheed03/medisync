import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { LoadingScreen } from '@/components/common'
import { AppLayout, AuthLayout } from '@/layouts'

import { paths } from './paths'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'

const LoginPage = lazy(() =>
  import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const DoctorSchedulesPage = lazy(() =>
  import('@/pages/DoctorSchedulesPage').then((m) => ({
    default: m.DoctorSchedulesPage,
  })),
)
const AppointmentsPage = lazy(() =>
  import('@/pages/AppointmentsPage').then((m) => ({
    default: m.AppointmentsPage,
  })),
)
const PatientsPage = lazy(() =>
  import('@/pages/PatientsPage').then((m) => ({ default: m.PatientsPage })),
)
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
)

const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [{ path: paths.login, element: <LoginPage /> }],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: paths.dashboard, element: <DashboardPage /> },
          { path: paths.doctorSchedules, element: <DoctorSchedulesPage /> },
          { path: paths.appointments, element: <AppointmentsPage /> },
          { path: paths.patients, element: <PatientsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <RouterProvider router={router} />
    </Suspense>
  )
}
