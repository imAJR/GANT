/**
 * GANT — Calendar & Working Days Calculation Engine
 * Handles project calendar, weekend exclusion, and working day arithmetic.
 */

// Format Date object to YYYY-MM-DD
export function toDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Validates whether a date string is a real calendar date in YYYY-MM-DD format.
 * Checks calendar limits (days in month, leap years, etc.)
 */
export function isValidDateString(dateStr: unknown): dateStr is string {
  if (typeof dateStr !== 'string') return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) return false;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  if (year < 1970 || year > 2100) return false;
  if (month < 1 || month > 12) return false;

  // Month days check including leap years
  const daysInMonth = new Date(year, month, 0).getDate();
  return day >= 1 && day <= daysInMonth;
}

// Parse YYYY-MM-DD safely into a local Date object (avoiding timezone offset shifts)
export function parseLocalDate(dateStr: string): Date {
  if (!isValidDateString(dateStr)) {
    // Return a safe fallback Date if string is malformed
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(dateStr));
    if (match) {
      const y = parseInt(match[1], 10);
      const m = Math.max(1, Math.min(12, parseInt(match[2], 10)));
      const d = Math.max(1, Math.min(28, parseInt(match[3], 10)));
      return new Date(y, m - 1, d, 12, 0, 0);
    }
    return new Date(2026, 9, 11, 12, 0, 0); // 2026-10-11 fallback
  }
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0); // midday avoids DST jumps
}

// Check if a day of week is in project's weekend days
export function sanitizeWeekendDays(weekendDays?: number[]): number[] {
  if (!Array.isArray(weekendDays)) return [5, 6];
  const unique = Array.from(new Set(weekendDays.filter((d) => typeof d === 'number' && d >= 0 && d <= 6)));
  if (unique.length === 0 || unique.length >= 7) {
    return [5, 6];
  }
  return unique;
}

export function isWeekendDay(date: Date | string, weekendDays: number[]): boolean {
  const safeWeekends = sanitizeWeekendDays(weekendDays);
  const d = typeof date === 'string' ? parseLocalDate(date) : date;
  return safeWeekends.includes(d.getDay());
}

// Ensure date is a valid working day; if weekend, advances to the next working day
export function alignToWorkingDay(dateStr: string, weekendDays: number[]): string {
  const safeWeekends = sanitizeWeekendDays(weekendDays);
  const d = parseLocalDate(dateStr);
  while (safeWeekends.includes(d.getDay())) {
    d.setDate(d.getDate() + 1);
  }
  return toDateString(d);
}

/**
 * Add N working days to a start date.
 * For duration = 1: if start is working day, ends on the same day.
 * For duration = 0 (Milestone): ends on same date.
 */
export function calculateEndDate(startDate: string, duration: number, weekendDays: number[]): string {
  const safeWeekends = sanitizeWeekendDays(weekendDays);
  if (duration <= 0) {
    return alignToWorkingDay(startDate, safeWeekends);
  }

  // Ensure start date is on a working day
  const d = parseLocalDate(alignToWorkingDay(startDate, safeWeekends));

  // The first working day is already day 1
  let remainingDays = duration - 1;

  while (remainingDays > 0) {
    d.setDate(d.getDate() + 1);
    if (!safeWeekends.includes(d.getDay())) {
      remainingDays--;
    }
  }

  return toDateString(d);
}

/**
 * Advance a date by N working days.
 * Unlike calculateEndDate (which includes day 1 if duration > 0),
 * addWorkingDays(D, 1) returns the next working day after D.
 */
export function addWorkingDays(startDate: string, workingDays: number, weekendDays: number[]): string {
  const safeWeekends = sanitizeWeekendDays(weekendDays);
  if (workingDays <= 0) {
    return alignToWorkingDay(startDate, safeWeekends);
  }
  const d = parseLocalDate(alignToWorkingDay(startDate, safeWeekends));
  let remaining = workingDays;
  while (remaining > 0) {
    d.setDate(d.getDate() + 1);
    if (!safeWeekends.includes(d.getDay())) {
      remaining--;
    }
  }
  return toDateString(d);
}

export function getNextWorkingDay(dateStr: string, weekendDays: number[]): string {
  return addWorkingDays(dateStr, 1, weekendDays);
}

/**
 * Given a required end date and working day duration, calculate the necessary start date.
 */
export function calculateStartDateForEndDate(endDate: string, duration: number, weekendDays: number[]): string {
  const safeWeekends = sanitizeWeekendDays(weekendDays);
  if (duration <= 0) {
    return alignToWorkingDay(endDate, safeWeekends);
  }
  const d = parseLocalDate(endDate);
  // Rewind if endDate lands on weekend
  while (safeWeekends.includes(d.getDay())) {
    d.setDate(d.getDate() - 1);
  }

  let remainingDays = duration - 1;
  while (remainingDays > 0) {
    d.setDate(d.getDate() - 1);
    if (!safeWeekends.includes(d.getDay())) {
      remainingDays--;
    }
  }

  return toDateString(d);
}

/**
 * Calculate the number of working days between two dates inclusive.
 */
export function calculateWorkingDaysBetween(startDate: string, endDate: string, weekendDays: number[]): number {
  const safeWeekends = sanitizeWeekendDays(weekendDays);
  const d1 = parseLocalDate(startDate);
  const d2 = parseLocalDate(endDate);

  if (d1.getTime() > d2.getTime()) return 0;

  let count = 0;
  const current = new Date(d1);

  while (current.getTime() <= d2.getTime()) {
    if (!safeWeekends.includes(current.getDay())) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

/**
 * Calculate calendar difference in days between two dates.
 */
export function diffCalendarDays(startDate: string, endDate: string): number {
  const d1 = parseLocalDate(startDate);
  const d2 = parseLocalDate(endDate);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Add raw calendar days to a date string.
 */
export function addCalendarDays(dateStr: string, days: number): string {
  const d = parseLocalDate(dateStr);
  d.setDate(d.getDate() + days);
  return toDateString(d);
}

/**
 * Get next day string
 */
export function getNextDay(dateStr: string): string {
  return addCalendarDays(dateStr, 1);
}

/**
 * Arabic & English day names
 */
export const WEEKDAY_NAMES_AR = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
];

export const WEEKDAY_NAMES_EN = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const MONTH_NAMES_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

export const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Format a date string nicely
 */
export function formatDisplayDate(dateStr: string, locale: 'ar' | 'en' = 'ar'): string {
  if (!dateStr) return '';
  const d = parseLocalDate(dateStr);
  const day = d.getDate();
  const monthName = locale === 'ar' ? MONTH_NAMES_AR[d.getMonth()] : MONTH_NAMES_EN[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${monthName} ${year}`;
}
