/** Formats a 24-hour "HH:mm" string as 12-hour time, e.g. "09:30" → "9:30 AM". */
export function formatTime(time: string): string {
  const [rawHours = 0, minutes = 0] = time.split(':').map(Number)
  const period = rawHours >= 12 ? 'PM' : 'AM'
  const hours = rawHours % 12 || 12
  return `${hours}:${String(minutes).padStart(2, '0')} ${period}`
}

/** Formats a slot range as "9:00 AM – 9:30 AM". */
export function formatTimeRange(startTime: string, endTime: string): string {
  return `${formatTime(startTime)} – ${formatTime(endTime)}`
}
