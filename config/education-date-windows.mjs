import { parseCalendarDate, calendarDateString, addCalendarMonths } from './calendar-date.mjs';

// Standard Missouri salesperson application route, separate from any reciprocity exception.
export function missouriEducationWindow(perCourse, applicationDate) {
  if (!perCourse.every(entry => entry.complete) || !applicationDate) return null;
  const application = parseCalendarDate(applicationDate);
  const dates = perCourse.map(entry => parseCalendarDate(entry.completedOn));
  if (!application || dates.some(date => !date)) return null;
  const preexamIndex = perCourse.findIndex(entry => entry.courseId === 'mo-salesperson-preexam-48-v1');
  if (preexamIndex < 0) return null;
  const preexam = dates[preexamIndex];
  const earliest = new Date(Math.min(...dates.map(date => date.valueOf())));
  const latest = new Date(Math.max(...dates.map(date => date.valueOf())));
  const deadline = addCalendarMonths(preexam, 6);
  return {
    earliestCompletion: calendarDateString(earliest),
    windowStartsOn: calendarDateString(preexam),
    windowCourseId: 'mo-salesperson-preexam-48-v1',
    latestCompletion: calendarDateString(latest),
    windowClosesOn: calendarDateString(deadline),
    applicationDate: calendarDateString(application),
    completionAfterApplication: latest > application,
    withinWindow: application >= latest && application <= deadline,
    sourceUrl: 'https://pr.mo.gov/realestate-how-to.asp'
  };
}
