/**
 * Date utilities for Bill History and Custom Date Range Calendar
 */

export interface CalendarDay {
  day: number;
  month: number; // 0-indexed (0 = Jan, 11 = Dec)
  year: number;
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isRangeStart?: boolean;
  isRangeEnd?: boolean;
  isInRange?: boolean;
  isFuture?: boolean;
  isDisabled?: boolean;
  hasBills?: boolean;
}

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const MONTH_NAMES_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const MONTH_MAP: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

/**
 * Parse a bill date string in various formats:
 * - 'DD-MMM-YYYY' (e.g. '24-Oct-2023', '08-Sep-2026', '8-Sep-2026', '01-Sep-2026')
 * - 'YYYY-MM-DD'
 * - 'DD/MM/YYYY'
 * - Standard ISO or Date-parsable strings
 */
export const parseBillDate = (dateStr: string | undefined | null): Date | null => {
  if (!dateStr || typeof dateStr !== 'string') {
    return null;
  }

  const trimmed = dateStr.trim();
  if (!trimmed) {
    return null;
  }

  // Handle 'DD-MMM-YYYY' or 'DD/MMM/YYYY' (e.g. 24-Oct-2023 or 08-Sept-2026)
  const parts = trimmed.split(/[- /]/);
  if (parts.length === 3) {
    const p0 = parseInt(parts[0], 10);
    const p1MonthStr = parts[1].toLowerCase();
    const p2Year = parseInt(parts[2], 10);

    if (!isNaN(p0) && MONTH_MAP[p1MonthStr] !== undefined && !isNaN(p2Year)) {
      return new Date(p2Year, MONTH_MAP[p1MonthStr], p0);
    }

    // Handle 'YYYY-MM-DD'
    const p0Year = parseInt(parts[0], 10);
    const p1Num = parseInt(parts[1], 10);
    const p2Day = parseInt(parts[2], 10);
    if (parts[0].length === 4 && !isNaN(p0Year) && !isNaN(p1Num) && !isNaN(p2Day)) {
      return new Date(p0Year, p1Num - 1, p2Day);
    }

    // Handle 'DD-MM-YYYY' or 'DD/MM/YYYY'
    if (parts[2].length === 4 && !isNaN(p0) && !isNaN(p1Num) && !isNaN(p2Year)) {
      return new Date(p2Year, p1Num - 1, p0);
    }
  }

  // Fallback to standard Date constructor
  const parsed = new Date(trimmed);
  return isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Normalizes a date to midnight (00:00:00.000) for exact date comparisons
 */
export const normalizeDate = (d: Date): Date => {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
};

/**
 * Check if two dates represent the exact same calendar day (Year, Month, Date)
 * completely independent of time and timezone offsets.
 */
export const isSameDay = (d1: Date | null | undefined, d2: Date | null | undefined): boolean => {
  if (!d1 || !d2) return false;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

/**
 * Check if a date is strictly in the future compared to referenceDate (defaults to current local time)
 */
export const isFutureDate = (
  date: Date | null | undefined,
  referenceDate: Date = new Date()
): boolean => {
  if (!date || isNaN(date.getTime())) return false;
  return normalizeDate(date).getTime() > normalizeDate(referenceDate).getTime();
};

/**
 * Checks if targetDate is within [startDate, endDate] inclusive.
 * Also prevents future dates from matching.
 */
export const isDateInRange = (
  targetDate: Date | null | undefined,
  startDate: Date | null | undefined,
  endDate: Date | null | undefined
): boolean => {
  if (!targetDate || !startDate) return false;

  const targetTime = normalizeDate(targetDate).getTime();
  const startTime = normalizeDate(startDate).getTime();

  if (!endDate) {
    return targetTime === startTime;
  }

  const endTime = normalizeDate(endDate).getTime();
  const minTime = Math.min(startTime, endTime);
  const maxTime = Math.max(startTime, endTime);

  return targetTime >= minTime && targetTime <= maxTime;
};

/**
 * Validates a date range, ensuring neither date is in the future and enforcing ordering.
 */
export const validateDateRange = (
  startDate: Date | null | undefined,
  endDate: Date | null | undefined,
  maxDate: Date = new Date()
): { isValid: boolean; error?: string; validatedStart?: Date; validatedEnd?: Date } => {
  if (!startDate) {
    return { isValid: false, error: 'From Date is required' };
  }

  if (isFutureDate(startDate, maxDate)) {
    return { isValid: false, error: 'From Date cannot be a future date' };
  }

  if (endDate && isFutureDate(endDate, maxDate)) {
    return { isValid: false, error: 'To Date cannot be a future date' };
  }

  const startNorm = normalizeDate(startDate);
  const endNorm = endDate ? normalizeDate(endDate) : startNorm;

  const actualStart = startNorm.getTime() <= endNorm.getTime() ? startNorm : endNorm;
  const actualEnd = startNorm.getTime() <= endNorm.getTime() ? endNorm : startNorm;

  return {
    isValid: true,
    validatedStart: actualStart,
    validatedEnd: actualEnd,
  };
};

/**
 * Format a Date object into various consistent representations
 */
export const formatBillDate = (
  date: Date | null | undefined,
  formatType: 'display' | 'readable' | 'full' | 'monthYear' = 'display'
): string => {
  if (!date || isNaN(date.getTime())) return '';

  const day = date.getDate();
  const dayPadded = day < 10 ? `0${day}` : `${day}`;
  const monthShort = MONTH_NAMES_SHORT[date.getMonth()];
  const monthFull = MONTH_NAMES_FULL[date.getMonth()];
  const year = date.getFullYear();
  const dayName = DAY_NAMES[date.getDay()];

  switch (formatType) {
    case 'display':
      // Matches existing app format: '24-Oct-2023', '08-Sep-2026'
      return `${dayPadded}-${monthShort}-${year}`;

    case 'readable':
      // 'Sep 8, 2026'
      return `${monthShort} ${day}, ${year}`;

    case 'full':
      // 'Tuesday, 08 Sep 2026'
      return `${dayName}, ${dayPadded} ${monthShort} ${year}`;

    case 'monthYear':
      // 'September 2026'
      return `${monthFull} ${year}`;

    default:
      return `${dayPadded}-${monthShort}-${year}`;
  }
};

/**
 * Format a date range into a clean string, e.g. "Sep 1, 2026 – Sep 8, 2026"
 */
export const formatDateRange = (
  startDate: Date | null | undefined,
  endDate: Date | null | undefined,
  formatType: 'readable' | 'display' = 'readable'
): string => {
  if (!startDate && !endDate) return '';
  if (startDate && !endDate) {
    return formatBillDate(startDate, formatType);
  }
  if (!startDate && endDate) {
    return formatBillDate(endDate, formatType);
  }

  if (startDate && endDate) {
    if (isSameDay(startDate, endDate)) {
      return formatBillDate(startDate, formatType);
    }
    const actualStart = startDate.getTime() <= endDate.getTime() ? startDate : endDate;
    const actualEnd = startDate.getTime() <= endDate.getTime() ? endDate : startDate;
    return `${formatBillDate(actualStart, formatType)} – ${formatBillDate(actualEnd, formatType)}`;
  }

  return '';
};

/**
 * Returns the start of the week (Monday) for the given date.
 */
export const getStartOfWeek = (date: Date = new Date()): Date => {
  const d = normalizeDate(date);
  const dayOfWeek = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - diff);
};

export interface PresetDateRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Calculates dynamic date range for presets (Today, This week, This month)
 * through today, never including future dates.
 */
export const getPresetDateRange = (
  filter: 'Today' | 'This week' | 'This month' | 'This Week' | 'This Month',
  referenceDate: Date = new Date()
): PresetDateRange => {
  const today = normalizeDate(referenceDate);

  if (filter === 'Today') {
    return { startDate: today, endDate: today };
  }

  if (filter === 'This week' || filter === 'This Week') {
    const startOfWeek = getStartOfWeek(today);
    return { startDate: startOfWeek, endDate: today };
  }

  if (filter === 'This month' || filter === 'This Month') {
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return { startDate: startOfMonth, endDate: today };
  }

  return { startDate: today, endDate: today };
};

/**
 * Generates the full 35 or 42 grid of calendar days for a given year and month,
 * including preceding and succeeding days from neighboring months to fill the calendar grid.
 * Marks future dates as disabled based on maxDate (defaults to today).
 */
export const getMonthCalendarDays = (
  year: number,
  month: number,
  startDate: Date | null,
  endDate: Date | null,
  markedDatesSet?: Set<string>,
  maxDate: Date = new Date()
): CalendarDay[] => {
  const today = new Date();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun, 6 = Sat
  const totalDaysInMonth = lastDayOfMonth.getDate();

  const days: CalendarDay[] = [];

  const checkRange = (d: Date) => {
    const isFuture = isFutureDate(d, maxDate);
    if (isFuture) {
      return { isStart: false, isEnd: false, inRange: false, isSel: false, isFuture: true, isDisabled: true };
    }

    const isStart = isSameDay(d, startDate);
    const isEnd = isSameDay(d, endDate);
    const inRange = startDate && endDate ? isDateInRange(d, startDate, endDate) : false;
    const isSel = isStart || isEnd || (!endDate && isStart);
    return { isStart, isEnd, inRange, isSel, isFuture: false, isDisabled: false };
  };

  // Previous month padding
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const prevDate = new Date(year, month - 1, day);
    const dateKey = `${prevDate.getFullYear()}-${prevDate.getMonth()}-${prevDate.getDate()}`;
    const { isStart, isEnd, inRange, isSel, isFuture, isDisabled } = checkRange(prevDate);

    days.push({
      day,
      month: month - 1,
      year: month === 0 ? year - 1 : year,
      date: prevDate,
      isCurrentMonth: false,
      isToday: isSameDay(prevDate, today),
      isSelected: isSel,
      isRangeStart: isStart,
      isRangeEnd: isEnd,
      isInRange: inRange,
      isFuture,
      isDisabled,
      hasBills: markedDatesSet ? markedDatesSet.has(dateKey) : false,
    });
  }

  // Current month days
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const currDate = new Date(year, month, d);
    const dateKey = `${currDate.getFullYear()}-${currDate.getMonth()}-${currDate.getDate()}`;
    const { isStart, isEnd, inRange, isSel, isFuture, isDisabled } = checkRange(currDate);

    days.push({
      day: d,
      month,
      year,
      date: currDate,
      isCurrentMonth: true,
      isToday: isSameDay(currDate, today),
      isSelected: isSel,
      isRangeStart: isStart,
      isRangeEnd: isEnd,
      isInRange: inRange,
      isFuture,
      isDisabled,
      hasBills: markedDatesSet ? markedDatesSet.has(dateKey) : false,
    });
  }

  // Next month padding to reach multiple of 7 (35 or 42)
  const remainingCells = (7 - (days.length % 7)) % 7;
  for (let n = 1; n <= remainingCells; n++) {
    const nextDate = new Date(year, month + 1, n);
    const dateKey = `${nextDate.getFullYear()}-${nextDate.getMonth()}-${nextDate.getDate()}`;
    const { isStart, isEnd, inRange, isSel, isFuture, isDisabled } = checkRange(nextDate);

    days.push({
      day: n,
      month: month + 1,
      year: month === 11 ? year + 1 : year,
      date: nextDate,
      isCurrentMonth: false,
      isToday: isSameDay(nextDate, today),
      isSelected: isSel,
      isRangeStart: isStart,
      isRangeEnd: isEnd,
      isInRange: inRange,
      isFuture,
      isDisabled,
      hasBills: markedDatesSet ? markedDatesSet.has(dateKey) : false,
    });
  }

  return days;
};
