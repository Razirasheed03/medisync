export interface AdminDashboard {
  doctors: number
  receptionists: number
  patients: number
  activeSchedules: number
  appointmentsToday: number
  upcomingAppointments: number
}

export interface ReceptionDashboard {
  patients: number
  appointmentsToday: number
  bookedToday: number
  arrivedToday: number
  completedToday: number
}

export interface DoctorDashboard {
  appointmentsToday: number
  arrivedToday: number
  completedToday: number
  upcomingAppointments: number
}
