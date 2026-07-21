export const WEEKDAYS = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
] as const

export type Weekday = (typeof WEEKDAYS)[number]

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday',
}

export interface ScheduleSession {
  startTime: string
  endTime: string
  breakStartTime?: string
  breakEndTime?: string
}

export interface WorkingDay {
  day: Weekday
  sessions: ScheduleSession[]
}

export interface DoctorSchedule {
  id: string
  doctorId: string
  workingDays: WorkingDay[]
  slotDuration: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateScheduleInput {
  doctorId: string
  workingDays: WorkingDay[]
  slotDuration: number
  isActive?: boolean
}

export interface UpdateScheduleInput {
  workingDays: WorkingDay[]
  slotDuration: number
}
