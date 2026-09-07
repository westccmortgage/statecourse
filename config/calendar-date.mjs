/** Date-only calendar arithmetic; never interpret a legal calendar date in a local timezone. */
export function parseCalendarDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value ? parsed : null;
}

export function calendarDateString(date) {
  return date.toISOString().slice(0, 10);
}

/** Clamp the day to the target calendar month's last day, rather than overflowing into a later month. */
export function addCalendarMonths(date, months) {
  if (!(date instanceof Date) || Number.isNaN(date.valueOf()) || !Number.isInteger(months)) return null;
  const target = new Date(date);
  const day = target.getUTCDate();
  target.setUTCDate(1);
  target.setUTCMonth(target.getUTCMonth() + months);
  const monthEnd = new Date(target);
  monthEnd.setUTCMonth(monthEnd.getUTCMonth() + 1);
  monthEnd.setUTCDate(0);
  target.setUTCDate(Math.min(day, monthEnd.getUTCDate()));
  return target;
}
