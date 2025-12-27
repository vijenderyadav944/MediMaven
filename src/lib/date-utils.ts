import { format as dateFnsFormat, formatDistanceToNow as dateFnsFormatDistanceToNow } from "date-fns"

// IST timezone offset in minutes (UTC+5:30 = 330 minutes)
const IST_OFFSET_MINUTES = 330

/**
 * Convert a UTC date to IST (Indian Standard Time)
 * This ensures consistent timezone display regardless of server location
 */
export function toIST(date: Date | string): Date {
  const d = new Date(date)
  // Get the UTC time in milliseconds
  const utcTime = d.getTime() + (d.getTimezoneOffset() * 60000)
  // Add IST offset
  return new Date(utcTime + (IST_OFFSET_MINUTES * 60000))
}

/**
 * Format a date in IST timezone
 * Use this instead of date-fns format() for consistent timezone display
 */
export function formatInIST(date: Date | string, formatStr: string): string {
  const istDate = toIST(date)
  return dateFnsFormat(istDate, formatStr)
}

/**
 * Format time in 12-hour format with AM/PM in IST
 */
export function formatTimeIST(date: Date | string): string {
  return formatInIST(date, "h:mm a")
}

/**
 * Format date as readable string in IST
 */
export function formatDateIST(date: Date | string): string {
  return formatInIST(date, "PPP")
}

/**
 * Format date and time in IST
 */
export function formatDateTimeIST(date: Date | string): string {
  return `${formatInIST(date, "PPP")} at ${formatInIST(date, "h:mm a")}`
}

/**
 * Format relative time (e.g., "5 minutes ago")
 */
export function formatRelativeTime(date: Date | string): string {
  return dateFnsFormatDistanceToNow(new Date(date), { addSuffix: true })
}

/**
 * Check if a date is today (in IST)
 */
export function isTodayIST(date: Date | string): boolean {
  const istDate = toIST(date)
  const today = toIST(new Date())
  return istDate.toDateString() === today.toDateString()
}

/**
 * Get current time in IST
 */
export function nowIST(): Date {
  return toIST(new Date())
}
