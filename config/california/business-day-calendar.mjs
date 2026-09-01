/*
 * California business-day calendar for the refund and cancellation policy.
 *
 * WHY THIS EXISTS AND WHAT IT IS NOT
 *
 * The adopted StateCourse policy CA-2026-08-20-v1 states a full-refund window that closes at
 * the later of seven business days after enrollment or completion of the first lesson
 * assignment. That structure is the one the Bureau for Private Postsecondary Education uses:
 *
 *   5 CCR section 70000(d), effective July 1, 2026 — "'Cancellation Period' means the period
 *   from the signing of the enrollment agreement either through the student's attendance at
 *   the first class session, or the seventh business day after enrollment, whichever is
 *   later."
 *
 * Read directly from the Bureau's published regulations. What that regulation does NOT do is
 * define "business day": the term appears throughout 5 CCR 70000-76245 and is nowhere
 * defined in it. So the convention below is StateCourse LLC's own, adopted deliberately, and
 * it must never be described in a filed document as a rule the Bureau or the Department of
 * Real Estate imposes. The Department's Course Provider Handbook requires the refund and
 * cancellation policy to be disclosed on the General Information Page before
 * registration/enrollment; it is not the source of the seven-day figure.
 *
 * THE CONVENTION
 *
 * A business day is Monday through Friday, excluding the holidays in Government Code section
 * 6700, with the observance rules in section 6701 applied. Every federal holiday observed in
 * California under 5 U.S.C. 6103 falls on a date section 6700 already names, so the federal
 * list adds no further dates; it is stated here so a reader does not have to check.
 *
 * Excluding more days LENGTHENS the full-refund window, so an over-inclusive calendar errs
 * in the student's favour. Under-inclusion is the dangerous direction, and it is what the
 * coverage rule below exists to prevent.
 *
 * Government Code section 6700(a), as amended by Stats. 2026, Ch. 7 (AB 2156), effective
 * March 26, 2026, and section 6701, as amended by Stats. 2020, Ch. 14 (AB 82). Both read
 * directly from leginfo.legislature.ca.gov on 2026-08-21.
 */

/* Section 6700(a) paragraphs that resolve to a date any calendar can compute. */
const FIXED_DATE_HOLIDAYS = Object.freeze([
  { month: 1, day: 1, name: "January 1", basis: "Gov. Code 6700(a)(2)" },
  { month: 2, day: 12, name: "Lincoln Day", basis: "Gov. Code 6700(a)(5)" },
  { month: 3, day: 31, name: "Farmworkers Day", basis: "Gov. Code 6700(a)(7)" },
  { month: 4, day: 24, name: "Genocide Remembrance Day", basis: "Gov. Code 6700(a)(8)" },
  { month: 6, day: 19, name: "Juneteenth", basis: "Gov. Code 6700(a)(11)" },
  { month: 7, day: 4, name: "Independence Day", basis: "Gov. Code 6700(a)(12)" },
  { month: 9, day: 9, name: "Admission Day", basis: "Gov. Code 6700(a)(14)" },
  { month: 11, day: 11, name: "Veterans Day", basis: "Gov. Code 6700(a)(17)" },
  { month: 12, day: 25, name: "Christmas Day", basis: "Gov. Code 6700(a)(18)" },
]);

/* "The Nth <weekday> in <month>". Weekday is 0=Sunday through 6=Saturday. */
const NTH_WEEKDAY_HOLIDAYS = Object.freeze([
  { month: 1, weekday: 1, nth: 3, name: "Dr. Martin Luther King, Jr. Day", basis: "Gov. Code 6700(a)(3)" },
  { month: 2, weekday: 1, nth: 3, name: "Third Monday in February", basis: "Gov. Code 6700(a)(6)" },
  { month: 5, weekday: 1, nth: -1, name: "Memorial Day", basis: "Gov. Code 6700(a)(10)" },
  { month: 9, weekday: 1, nth: 1, name: "Labor Day", basis: "Gov. Code 6700(a)(13)" },
  { month: 9, weekday: 5, nth: 4, name: "Native American Day", basis: "Gov. Code 6700(a)(15)" },
  { month: 10, weekday: 1, nth: 2, name: "Columbus Day", basis: "Gov. Code 6700(a)(16)" },
  /* Section 6700(a)(20)(A) covers days the President or Governor appoint; (20)(B) names
     "the Thursday in November appointed as Thanksgiving Day" as the one such day that is not
     subject to the local-government carve-out, so it is the one appointed day a calendar can
     rely on in advance. */
  { month: 11, weekday: 4, nth: 4, name: "Thanksgiving Day", basis: "Gov. Code 6700(a)(20)" },
]);

/*
 * Two section 6700 holidays are defined against lunar calendars and cannot be computed:
 *
 *   (a)(4) Lunar New Year — "the date corresponding with the second new moon following the
 *          winter solstice, or the third new moon following the winter solstice should an
 *          intercalary month intervene."
 *   (a)(9) Diwali — "the 15th day of the month of Kartik in the Hindu lunar calendar."
 *
 * Deriving either in code would mean shipping an ephemeris or a Hindu calendar
 * implementation, and getting one subtly wrong would silently shorten a student's refund
 * window. They are recorded as explicit dates instead, one year at a time, and a year whose
 * dates are not recorded is not covered — see coverageFor below.
 *
 * These dates need confirming against an official California source each year before the
 * year is added. They are the only entries in this file not derived from the statute's own
 * words, and they are marked so nobody mistakes them for derived values.
 */
const LUNAR_HOLIDAYS = Object.freeze({
  2026: Object.freeze([
    { date: "2026-02-17", name: "Lunar New Year", basis: "Gov. Code 6700(a)(4)", derived: false },
    { date: "2026-11-08", name: "Diwali", basis: "Gov. Code 6700(a)(9)", derived: false },
  ]),
  2027: Object.freeze([
    { date: "2027-02-06", name: "Lunar New Year", basis: "Gov. Code 6700(a)(4)", derived: false },
  ]),
});

/* A year is covered only when every lunar holiday section 6700 names has a recorded date.
   2027's Diwali is not recorded, so 2027 is not covered and the engine refuses rather than
   computing a window that is one day too short. */
const REQUIRED_LUNAR_HOLIDAYS = Object.freeze(["Lunar New Year", "Diwali"]);

/*
 * Good Friday is deliberately NOT here. Section 6700(a)(19) makes it a holiday "from 12 noon
 * until 3 p.m." — three hours, not a day. Treating it as a full non-business day would be
 * inventing a rule the statute does not state.
 *
 * Days appointed ad hoc by the President or the Governor under (a)(20)(A) cannot be known in
 * advance and are not here either. Their omission can only shorten a window, so where one is
 * proclaimed it must be added to this file before the window is computed across it.
 */

const pad = (value) => String(value).padStart(2, "0");
const iso = (date) => `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
const utc = (year, month, day) => new Date(Date.UTC(year, month - 1, day));

function nthWeekdayOf(year, month, weekday, nth) {
  if (nth === -1) {
    const last = new Date(Date.UTC(year, month, 0));
    const shift = (last.getUTCDay() - weekday + 7) % 7;
    last.setUTCDate(last.getUTCDate() - shift);
    return last;
  }
  const first = utc(year, month, 1);
  const shift = (weekday - first.getUTCDay() + 7) % 7;
  return utc(year, month, 1 + shift + (nth - 1) * 7);
}

/**
 * Every holiday observed in a given year, as ISO dates, each carrying the statute that makes
 * it one. Section 6701's observance shifts are applied here rather than at lookup time, so
 * the returned list is the full set of dates a business-day calculation must skip.
 */
export function holidaysFor(year) {
  const observed = new Map();
  const add = (date, name, basis) => {
    const key = iso(date);
    if (!observed.has(key)) observed.set(key, { date: key, name, basis });
  };

  for (const holiday of FIXED_DATE_HOLIDAYS) {
    const date = utc(year, holiday.month, holiday.day);
    add(date, holiday.name, holiday.basis);
    /* 6701(a): if January 1, February 12, March 31, July 4, September 9, November 11 or
       December 25 falls on a Sunday, the following Monday is a holiday. */
    if (date.getUTCDay() === 0 && holiday.month !== 4 && holiday.month !== 6) {
      const monday = new Date(date.getTime());
      monday.setUTCDate(monday.getUTCDate() + 1);
      add(monday, `${holiday.name} observed`, "Gov. Code 6701(a)");
    }
    /* 6701(b): if November 11 falls on a Saturday, the preceding Friday is a holiday. */
    if (holiday.month === 11 && holiday.day === 11 && date.getUTCDay() === 6) {
      const friday = new Date(date.getTime());
      friday.setUTCDate(friday.getUTCDate() - 1);
      add(friday, "Veterans Day observed", "Gov. Code 6701(b)");
    }
  }

  for (const holiday of NTH_WEEKDAY_HOLIDAYS) {
    add(nthWeekdayOf(year, holiday.month, holiday.weekday, holiday.nth), holiday.name, holiday.basis);
  }

  for (const holiday of LUNAR_HOLIDAYS[year] ?? []) {
    const [y, m, d] = holiday.date.split("-").map(Number);
    add(utc(y, m, d), holiday.name, holiday.basis);
  }

  return Object.freeze([...observed.values()].sort((a, b) => a.date.localeCompare(b.date)));
}

/** Which of section 6700's lunar holidays have no recorded date for a year. */
export function unresolvedHolidaysFor(year) {
  const recorded = new Set((LUNAR_HOLIDAYS[year] ?? []).map((holiday) => holiday.name));
  return Object.freeze(REQUIRED_LUNAR_HOLIDAYS.filter((name) => !recorded.has(name)));
}

export function isCovered(year) {
  return unresolvedHolidaysFor(year).length === 0;
}

export const CALENDAR_COVERED_YEARS = Object.freeze(
  Object.keys(LUNAR_HOLIDAYS).map(Number).filter(isCovered).sort(),
);

const holidayCache = new Map();
function holidaySet(year) {
  if (!holidayCache.has(year)) holidayCache.set(year, new Set(holidaysFor(year).map((holiday) => holiday.date)));
  return holidayCache.get(year);
}

/** Monday to Friday, and not a Government Code section 6700 holiday. */
export function isBusinessDay(date) {
  const weekday = date.getUTCDay();
  if (weekday === 0 || weekday === 6) return false;
  return !holidaySet(date.getUTCFullYear()).has(iso(date));
}

/**
 * Add business days, refusing rather than guessing.
 *
 * A year with an unrecorded lunar holiday would produce a window one day too SHORT, which
 * takes a refund away from a student who is entitled to it. That is the one error this
 * calculation must never make quietly, so the calculation throws instead and the year must
 * be added to LUNAR_HOLIDAYS before any window can cross it.
 */
export function addBusinessDays(from, days) {
  if (!(from instanceof Date) || Number.isNaN(from.getTime())) throw new TypeError("addBusinessDays: invalid date");
  if (!Number.isInteger(days) || days < 0) throw new RangeError("addBusinessDays: days must be a non-negative integer");
  const date = new Date(from.getTime());
  const assertCovered = (year) => {
    if (isCovered(year)) return;
    const missing = unresolvedHolidaysFor(year).join(", ");
    throw new RangeError(
      `California business-day calendar does not cover ${year}: no recorded date for ${missing}. ` +
        "Add it to config/california/business-day-calendar.mjs before computing a window across that year.",
    );
  };
  assertCovered(date.getUTCFullYear());
  let remaining = days;
  while (remaining > 0) {
    date.setUTCDate(date.getUTCDate() + 1);
    assertCovered(date.getUTCFullYear());
    if (isBusinessDay(date)) remaining -= 1;
  }
  return date;
}

/* The sentence the RE 313 sheet, the Terms and the policy document all state, in one place
   so three documents cannot describe the same convention three ways. */
export const BUSINESS_DAY_CONVENTION =
  "A business day is Monday through Friday, excluding the holidays in California Government " +
  "Code section 6700 with the observance rules in section 6701 applied. Every federal holiday " +
  "observed in California falls on a date section 6700 already names, so no further dates are " +
  "added. Good Friday is not excluded, because section 6700(a)(19) makes it a holiday only " +
  "from 12 noon until 3 p.m. rather than for a full day.";
