import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  BUSINESS_DAY_CONVENTION,
  CALENDAR_COVERED_YEARS,
  addBusinessDays,
  holidaysFor,
  isBusinessDay,
  isCovered,
  unresolvedHolidaysFor,
} from "../config/california/business-day-calendar.mjs";

/*
 * The business-day calendar behind CA-2026-08-20-v1's seven-day full-refund window.
 *
 * The convention is StateCourse LLC's own. 5 CCR 70000(d) gives the window its shape — "the
 * seventh business day after enrollment, whichever is later" — but 5 CCR 70000-76245 uses
 * "business day" throughout without defining it, so the definition below comes from
 * Government Code sections 6700 and 6701 by choice, not by compulsion. These tests hold that
 * choice to the statute's actual words.
 */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const day = (year, month, date) => new Date(Date.UTC(year, month - 1, date));

test("every holiday in the calendar names the statute that makes it one", () => {
  for (const year of CALENDAR_COVERED_YEARS) {
    const holidays = holidaysFor(year);
    assert.ok(holidays.length > 0, `${year} has no holidays`);
    for (const holiday of holidays) {
      assert.match(holiday.basis, /^Gov\. Code 670[01]\(/, `${holiday.name} in ${year} has no statutory basis`);
      assert.match(holiday.date, /^\d{4}-\d{2}-\d{2}$/);
      assert.equal(holiday.date.slice(0, 4), String(year));
    }
  }
});

test("2026 carries every Government Code 6700 holiday on the right date", () => {
  const byName = Object.fromEntries(holidaysFor(2026).map((holiday) => [holiday.name, holiday.date]));
  assert.equal(byName["January 1"], "2026-01-01");
  assert.equal(byName["Dr. Martin Luther King, Jr. Day"], "2026-01-19", "third Monday in January");
  assert.equal(byName["Lincoln Day"], "2026-02-12");
  assert.equal(byName["Third Monday in February"], "2026-02-16");
  assert.equal(byName["Lunar New Year"], "2026-02-17");
  assert.equal(byName["Farmworkers Day"], "2026-03-31");
  assert.equal(byName["Genocide Remembrance Day"], "2026-04-24");
  assert.equal(byName["Memorial Day"], "2026-05-25", "last Monday in May");
  assert.equal(byName.Juneteenth, "2026-06-19");
  assert.equal(byName["Independence Day"], "2026-07-04");
  assert.equal(byName["Labor Day"], "2026-09-07", "first Monday in September");
  assert.equal(byName["Admission Day"], "2026-09-09");
  assert.equal(byName["Native American Day"], "2026-09-25", "fourth Friday in September");
  assert.equal(byName["Columbus Day"], "2026-10-12", "second Monday in October");
  assert.equal(byName.Diwali, "2026-11-08");
  assert.equal(byName["Veterans Day"], "2026-11-11");
  assert.equal(byName["Thanksgiving Day"], "2026-11-26", "fourth Thursday in November");
  assert.equal(byName["Christmas Day"], "2026-12-25");
});

/*
 * Section 6700(a)(19) makes Good Friday a holiday "from 12 noon until 3 p.m." — three hours,
 * not a day. Excluding the whole day would be inventing a rule the statute does not state,
 * and in the wrong direction it would matter: an over-long window is generous, but a rule
 * that is not in the statute has no business being in a filed policy either way.
 */
test("Good Friday is not treated as a full non-business day", () => {
  assert.equal(holidaysFor(2026).some((holiday) => /good friday/i.test(holiday.name)), false);
  assert.match(BUSINESS_DAY_CONVENTION, /Good Friday is not excluded/);
  assert.match(BUSINESS_DAY_CONVENTION, /12 noon until 3 p\.m\./);
});

test("the federal list adds nothing, and the convention says so", () => {
  /* Every 5 U.S.C. 6103 holiday falls on a date section 6700 already names. Washington's
     Birthday and section 6700(a)(6)'s "third Monday in February" are the same day. */
  const dates = new Set(holidaysFor(2026).map((holiday) => holiday.date));
  for (const federal of [
    "2026-01-01", "2026-01-19", "2026-02-16", "2026-05-25", "2026-06-19",
    "2026-07-04", "2026-09-07", "2026-10-12", "2026-11-11", "2026-11-26", "2026-12-25",
  ]) {
    assert.ok(dates.has(federal), `${federal} is a federal holiday the calendar does not carry`);
  }
  assert.match(BUSINESS_DAY_CONVENTION, /no further dates are\s+added/);
});

test("section 6701's observance shifts are applied", () => {
  /* 6701(a): 1 January 2028 is a Saturday and 25 December 2028 a Monday, so pick a year where
     one of the named dates lands on a Sunday. 4 July 2027 is a Sunday, so 5 July is observed. */
  const july2027 = holidaysFor(2027).map((holiday) => holiday.date);
  assert.ok(july2027.includes("2027-07-04"));
  assert.ok(july2027.includes("2027-07-05"), "6701(a) requires the Monday after a Sunday holiday");

  /* 6701(b): 11 November 2028 is a Saturday, so the preceding Friday is a holiday. */
  const nov2028 = holidaysFor(2028).map((holiday) => holiday.date);
  assert.ok(nov2028.includes("2028-11-10"), "6701(b) requires the Friday before a Saturday Veterans Day");
});

test("weekends and holidays are not business days, and ordinary weekdays are", () => {
  assert.equal(isBusinessDay(day(2026, 3, 7)), false, "Saturday");
  assert.equal(isBusinessDay(day(2026, 3, 8)), false, "Sunday");
  assert.equal(isBusinessDay(day(2026, 2, 17)), false, "Lunar New Year");
  assert.equal(isBusinessDay(day(2026, 11, 26)), false, "Thanksgiving");
  assert.equal(isBusinessDay(day(2026, 3, 9)), true, "an ordinary Monday");
});

test("counting seven business days skips both weekends and holidays", () => {
  assert.equal(addBusinessDays(day(2026, 3, 2), 7).toISOString().slice(0, 10), "2026-03-11");
  /* Across Lincoln Day, the third Monday, and Lunar New Year. */
  assert.equal(addBusinessDays(day(2026, 2, 10), 7).toISOString().slice(0, 10), "2026-02-24");
  /* Across Thanksgiving. */
  assert.equal(addBusinessDays(day(2026, 11, 23), 7).toISOString().slice(0, 10), "2026-12-03");
});

/*
 * The safety property. An unrecorded lunar holiday would produce a window one day too SHORT,
 * taking a refund from a student entitled to it. The calendar refuses instead. 2027's Diwali
 * has no recorded date, so 2027 is uncovered and any window crossing it throws.
 */
test("a year with an unresolved holiday is refused rather than computed short", () => {
  assert.deepEqual(unresolvedHolidaysFor(2026), []);
  assert.equal(isCovered(2026), true);
  assert.deepEqual(unresolvedHolidaysFor(2027), ["Diwali"]);
  assert.equal(isCovered(2027), false);
  assert.deepEqual(CALENDAR_COVERED_YEARS, [2026]);

  assert.throws(() => addBusinessDays(day(2027, 3, 2), 7), /does not cover 2027/);
  /* And a window that starts in a covered year but runs into an uncovered one. */
  assert.throws(() => addBusinessDays(day(2026, 12, 29), 7), /does not cover 2027/);
});

test("the convention is stated once and never restated by hand", () => {
  assert.match(BUSINESS_DAY_CONVENTION, /Monday through Friday/);
  assert.match(BUSINESS_DAY_CONVENTION, /Government Code section 6700/);
  assert.match(BUSINESS_DAY_CONVENTION, /section 6701/);

  /*
   * The convention is StateCourse LLC's, not a regulator's. 5 CCR 70000-76245 uses "business
   * day" and defines it nowhere, and the DRE Course Provider Handbook requires the policy to
   * be disclosed but is not the source of the seven-day figure. No document may say either
   * body requires this count.
   */
  const files = [
    "config/california/business-day-calendar.mjs",
    "lib/refund-policy.mjs",
    "docs/payments/california-refund-policy.md",
  ];
  for (const file of files) {
    const full = path.join(root, file);
    if (!fs.existsSync(full)) continue;
    const text = fs.readFileSync(full, "utf8");
    assert.equal(
      /DRE requires seven business days|Department of Real Estate requires seven|Bureau requires seven business/i.test(text),
      false,
      `${file} attributes the seven-day count to a regulator that does not impose it`,
    );
  }
});

test("the superseded no-holiday convention is gone from every document", () => {
  const candidates = [
    "config/california/business-day-calendar.mjs",
    "lib/refund-policy.mjs",
    "docs/payments/california-refund-policy.md",
    "california/submission/01_Real_Estate_Principles/06-re313-general-information-page.md",
    "california/submission/02_Real_Estate_Practice/06-re313-general-information-page.md",
    "california/submission/03_Mortgage_Loan_Brokering_and_Lending/06-re313-general-information-page.md",
    "public/statecourse/terms/index.html",
  ];
  for (const file of candidates) {
    const full = path.join(root, file);
    if (!fs.existsSync(full)) continue;
    const text = fs.readFileSync(full, "utf8");
    assert.equal(
      /names no holiday calendar and .{0,40}has not adopted one|no holiday calendar is applied|so none is applied/i.test(text),
      false,
      `${file} still states the superseded convention that holidays are counted as business days`,
    );
  }
});
