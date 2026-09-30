/**
 * IST (Asia/Kolkata, UTC+5:30) time helpers.
 *
 * WHY THIS EXISTS: reporting boundaries ("a day", "which hour was that call in") were
 * previously computed with `date.setHours(0,0,0,0)` in server local time. That silently
 * shifts every daily total and hour bucket if the VPS timezone is ever changed or the
 * process runs in a different region. All reporting in this codebase now goes through
 * these helpers so boundaries are pinned to IST regardless of the host clock.
 *
 * Storage stays UTC; only the *boundaries* and *labels* are IST.
 */

export const IST_TIMEZONE = 'Asia/Kolkata';
export const IST_OFFSET_MINUTES = 330; // UTC+5:30
const MS_PER_MINUTE = 60_000;
const MS_PER_DAY = 24 * 60 * MS_PER_MINUTE;

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** The IST calendar date (YYYY-MM-DD) that a given instant falls on. */
export function istDateString(d: Date = new Date()): string {
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/** Hour of day (0-23) in IST for a given instant. */
export function istHourOf(d: Date): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: IST_TIMEZONE,
    hour: '2-digit',
    hourCycle: 'h23', // h23 avoids Intl returning "24" for midnight
  }).format(d);
  return Number(parts);
}

/** Minutes since IST midnight, useful for precise intra-hour bucketing. */
export function istMinutesOfDay(d: Date): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: IST_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).format(d);
  const [h, m, s] = parts.split(':').map(Number);
  return h * 60 + m + s / 60;
}

export interface IstDayRange {
  /** YYYY-MM-DD in IST */
  isoDate: string;
  /** UTC instant of 00:00:00 IST on that day */
  start: Date;
  /** UTC instant of 00:00:00 IST on the following day (exclusive upper bound) */
  end: Date;
}

/**
 * Resolve the UTC [start, end) window covering one IST calendar day.
 *
 * Accepts either an explicit YYYY-MM-DD (interpreted as an IST date) or a Date
 * (converted to its IST calendar date).
 */
export function istDayRange(dateInput?: string | Date | null): IstDayRange {
  let isoDate: string;
  if (typeof dateInput === 'string' && ISO_DATE_RE.test(dateInput)) {
    isoDate = dateInput;
  } else {
    isoDate = istDateString(dateInput ? new Date(dateInput) : new Date());
  }

  const [y, m, d] = isoDate.split('-').map(Number);
  // 00:00 IST == 18:30 UTC the previous day.
  const startMs = Date.UTC(y, m - 1, d, 0, 0, 0) - IST_OFFSET_MINUTES * MS_PER_MINUTE;
  return {
    isoDate,
    start: new Date(startMs),
    end: new Date(startMs + MS_PER_DAY),
  };
}

/** Shift an IST date string by N days, staying in IST. */
export function addIstDays(isoDate: string, days: number): string {
  const { start } = istDayRange(isoDate);
  return istDateString(new Date(start.getTime() + days * MS_PER_DAY));
}

/** The IST date N days before today (N=0 → today). */
export function istDateOffset(days: number): string {
  return addIstDays(istDateString(), days);
}

/** Human-readable IST timestamp, e.g. "30 Sep 2026, 14:05". */
export function formatIst(d: Date | string, withSeconds = false): string {
  const date = d instanceof Date ? d : new Date(d);
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...(withSeconds ? { second: '2-digit' } : {}),
    hourCycle: 'h23',
  }).format(date);
}

/** Compact IST time label for hour buckets, e.g. "14:00". */
export function formatIstHourLabel(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}

/** The UTC window for a single IST clock hour on a given IST date. */
export function istHourRange(isoDate: string, hour: number): { start: Date; end: Date } {
  const day = istDayRange(isoDate);
  const startMs = day.start.getTime() + hour * 60 * MS_PER_MINUTE;
  return { start: new Date(startMs), end: new Date(startMs + 60 * MS_PER_MINUTE) };
}
