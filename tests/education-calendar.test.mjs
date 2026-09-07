import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCalendarDate, calendarDateString, addCalendarMonths } from '../config/calendar-date.mjs';
import { arizonaEducationValidity } from '../config/arizona-course-engine.mjs';
import { missouriEducationWindow } from '../config/education-date-windows.mjs';
import { missouriEducationReadiness } from '../config/missouri-course-engine.mjs';

test('date parser rejects normalized impossible dates and ambiguous input', () => {
  for (const value of ['2026-02-30','2025-02-29','2026-13-01','09/06/2026','2026-09-06T00:00:00Z',null]) assert.equal(parseCalendarDate(value), null);
  assert.equal(calendarDateString(parseCalendarDate('2024-02-29')), '2024-02-29');
});
test('calendar months clamp rather than overflow and do not mutate input', () => {
  for (const [start, months, expected] of [['2026-08-31',6,'2027-02-28'],['2023-08-31',6,'2024-02-29'],['2024-02-29',120,'2034-02-28'],['2026-01-10',6,'2026-07-10'],['2020-03-01',120,'2030-03-01']]) {
    const original = parseCalendarDate(start);
    assert.equal(calendarDateString(addCalendarMonths(original,months)),expected);
    assert.equal(calendarDateString(original),start);
  }
});
test('Arizona accepts anniversary, rejects next day and future course', () => {
  assert.equal(arizonaEducationValidity('2020-03-01','2030-03-01').withinWindow,true);
  assert.equal(arizonaEducationValidity('2020-03-01','2030-03-02').withinWindow,false);
  assert.equal(arizonaEducationValidity('2020-03-01','2020-02-29').withinWindow,false);
  assert.equal(arizonaEducationValidity('2024-02-29','2034-02-28').withinWindow,true);
  assert.equal(arizonaEducationValidity('2024-02-29','2034-03-01').withinWindow,false);
  assert.equal(arizonaEducationValidity('2024-02-29','2026-02-30').withinWindow,null);
});
const records = (preexam, mrep) => [
  {courseId:'mo-salesperson-preexam-48-v1',complete:true,completedOn:preexam},
  {courseId:'mo-real-estate-practice-24-v1',complete:true,completedOn:mrep}
];
test('Missouri standard route anchors to the pre-exam completion, handles month ends and future completions', () => {
  assert.equal(missouriEducationWindow(records('2026-01-10','2026-02-01'),'2026-07-10').withinWindow,true);
  assert.equal(missouriEducationWindow(records('2026-01-10','2026-02-01'),'2026-07-11').withinWindow,false);
  assert.equal(missouriEducationWindow(records('2026-08-31','2026-09-01'),'2027-02-28').withinWindow,true);
  assert.equal(missouriEducationWindow(records('2026-08-31','2026-09-01'),'2027-03-01').withinWindow,false);
  assert.equal(missouriEducationWindow(records('2026-03-10','2026-04-01'),'2026-03-20').withinWindow,false);
  // An out-of-sequence MREP record must not silently change the regulator's stated anchor.
  assert.equal(missouriEducationWindow(records('2026-03-10','2026-01-01'),'2026-08-01').windowClosesOn,'2026-09-10');
  assert.equal(missouriEducationWindow(records('2026-02-30','2026-04-01'),'2026-05-01'),null);
});

test('Missouri engine rejects impossible dates, future courses and an out-of-sequence MREP',()=>{
 const complete=(pre,mrep)=>Object.fromEntries(records(pre,mrep).map(v=>[v.courseId,{courseComplete:true,certificateEligible:true,completedOn:v.completedOn}]));
 assert.match(missouriEducationReadiness(complete('2026-02-30','2026-04-01'),{applicationDate:'2026-05-01'}).readinessBlockedBy,/Valid completion/);
 assert.match(missouriEducationReadiness(complete('2026-03-10','2026-04-01'),{applicationDate:'2026-03-20'}).readinessBlockedBy,/before application/);
 assert.match(missouriEducationReadiness(complete('2026-03-10','2026-01-01'),{applicationDate:'2026-08-01'}).readinessBlockedBy,/pre-exam course before MREP/);
 assert.equal(missouriEducationReadiness(complete('2026-08-31','2026-09-01'),{applicationDate:'2027-02-28'}).readinessBlockedBy,null);
});
