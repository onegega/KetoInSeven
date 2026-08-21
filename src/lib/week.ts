/**
 * Week maths, all in the device's local timezone.
 *
 * The formatting helpers take a translator rather than owning month and day
 * names, so the same date renders in whichever language is selected without
 * this module knowing anything about locales.
 */

import { DAY_KEY, MONTH_KEY } from '@/i18n/keys';
import type { Translator } from '@/i18n/translate';

export type WeekStartDay = 0 | 1; // Sunday | Monday

const MS_PER_DAY = 86_400_000;

/** Local midnight for the given date, with the time component discarded. */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** The first day of the week `date` falls in, at local midnight. */
export function startOfWeek(date: Date, weekStartsOn: WeekStartDay): Date {
  const day = startOfDay(date);
  const shift = (day.getDay() - weekStartsOn + 7) % 7;
  day.setDate(day.getDate() - shift);
  return day;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/**
 * Stable id for a week: the ISO date of its first day, e.g. `2026-08-17`.
 * Built from local date parts rather than `toISOString()`, which would shift
 * the day for anyone east or west of UTC.
 */
export function toDateId(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function weekIdFor(date: Date, weekStartsOn: WeekStartDay): string {
  return toDateId(startOfWeek(date, weekStartsOn));
}

/** The seven dates of the week beginning at `weekStart`. */
export function weekDates(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  );
}

/** Whole days from today to `date` — negative in the past. */
export function daysFromToday(date: Date): number {
  return Math.round((startOfDay(date).getTime() - startOfDay(new Date()).getTime()) / MS_PER_DAY);
}

export function formatDayAndMonth(date: Date, t: Translator): string {
  return `${date.getDate()} ${t(MONTH_KEY[date.getMonth()])}`;
}

/** e.g. "17 Aug – 23 Aug". */
export function formatWeekRange(weekStart: Date, t: Translator): string {
  return `${formatDayAndMonth(weekStart, t)} – ${formatDayAndMonth(addDays(weekStart, 6), t)}`;
}

/** "Today", "Tomorrow", "Yesterday", or the weekday name. */
export function relativeDayLabel(date: Date, t: Translator): string {
  const delta = daysFromToday(date);
  if (delta === 0) return t('day.today');
  if (delta === 1) return t('day.tomorrow');
  if (delta === -1) return t('day.yesterday');
  return t(DAY_KEY[date.getDay()]);
}
