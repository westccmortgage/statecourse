import test from 'node:test';
import assert from 'node:assert/strict';
import { NMLS_CE_REQUIREMENTS as requirements, NMLS_CE_DRAFT_COURSES as courses } from '../config/nmls/course-plan.mjs';
import { planNmlsCe, evaluateNmlsPackage, nmlsAgencyOptions } from '../lib/nmls-ce-planner.mjs';

const plan = (...agencyIds) => planNmlsCe({ year: 2026, agencyIds });

test('verified snapshot covers 50 states, 55 state agencies, and separate DC without enabling sale', () => {
  const states = requirements.rows.filter((row) => row.state_code !== 'DC');
  assert.equal(new Set(states.map((row) => row.state_code)).size, 50);
  assert.equal(states.length, 55);
  assert.equal(requirements.rows.length, 56);
  for (const row of requirements.rows) {
    const p = plan(row.agency_id);
    assert.equal(p.ok, true, row.agency_id);
    assert.equal(p.plannedStudyHours, row.total_hours, row.agency_id);
    assert.equal(p.plannedHoursCoverRequirements, true, row.agency_id);
    assert.equal(p.salesAuthorized, false);
    assert.equal(p.requirements[0].unresolvedReadiness.schoolAuthorityReviewed, false);
    assert.match(p.requirements[0].sourceUrl, /^https:\/\/mortgage\.nationwidelicensingsystem\.org\//);
  }
  assert.throws(() => { requirements.rows[0].total_hours = 1; }, TypeError);
});

test('California and Utah require agency selection; they are not interchangeable', () => {
  assert.equal(plan('CA').code, 'agency_selection_ambiguous');
  assert.equal(plan('UT').code, 'agency_selection_ambiguous');
  assert.equal(nmlsAgencyOptions('CA', 2026).length, 2);
  assert.equal(plan('CA-DRE').courseIds.length, 1);
  assert.deepEqual(plan('CA-DFPI').courseIds, ['nmls-ce-2026-core-7', 'nmls-ce-2026-ca-dfpi-1']);
  assert.equal(plan('CA-DRE', 'CA-DFPI').plannedStudyHours, 9);
  assert.equal(plan('UT-DRE').plannedStudyHours, 9);
  assert.equal(plan('UT-DFI').plannedStudyHours, 8);
});

test('federal credit is shared once; distinct agency state courses are not shared', () => {
  assert.equal(plan('TX-SML', 'TX-OCCC', 'MI', 'IL').plannedStudyHours, 8);
  assert.equal(plan('SC-BFI', 'SC-DCA').plannedStudyHours, 9);
  assert.equal(plan('NJ', 'WA').plannedStudyHours, 13);
  assert.equal(plan('NY', 'NJ', 'WV').plannedStudyHours, 17);
  assert.equal(plan('NJ', 'NJ').plannedStudyHours, 12);
  assert.equal(plan(...requirements.rows.filter((r) => r.state_code !== 'DC').map((r) => r.agency_id)).plannedStudyHours, 39);
});

test('8h national does not close state requirements; 7+1 WA still lacks general elective', () => {
  const national = evaluateNmlsPackage({ year: 2026, agencyIds: ['NJ'], courseIds: ['nmls-ce-2026-comprehensive-8'] });
  assert.equal(national.ok, true);
  assert.equal(national.plannedHoursCoverRequirements, false);
  assert.equal(national.coverage[0].missing.general, 2);
  assert.equal(national.coverage[0].missing.state, 2);
  const wa = evaluateNmlsPackage({ year: 2026, agencyIds: ['WA'], courseIds: ['nmls-ce-2026-core-7', 'nmls-ce-2026-wa-1'] });
  assert.equal(wa.plannedHoursCoverRequirements, false);
  assert.equal(wa.coverage[0].missing.general, 1);
});

test('duplicate/overlapping courses do not manufacture credit', () => {
  const base = { year: 2026, agencyIds: ['TX-SML'] };
  assert.equal(evaluateNmlsPackage({ ...base, courseIds: ['nmls-ce-2026-core-7', 'nmls-ce-2026-core-7'] }).code, 'duplicate_course');
  assert.equal(evaluateNmlsPackage({ ...base, courseIds: ['nmls-ce-2026-core-7', 'nmls-ce-2026-comprehensive-8'] }).code, 'overlapping_course_content');
  assert.equal(evaluateNmlsPackage({ ...base, courseIds: ['nmls-ce-2026-comprehensive-8', 'nmls-ce-2026-general-1'] }).code, 'overlapping_course_content');
  assert.equal(evaluateNmlsPackage({ ...base, courseIds: ['nmls-ce-2026-ca-dfpi-1'] }).code, 'invalid_course_credit_allocation');
});

test('future years, late CE, unsupported roles, incomplete inputs and altered credit fail closed', () => {
  const base = { year: 2026, agencyIds: ['NV'] };
  assert.equal(planNmlsCe({ ...base, year: 2027 }).code, 'requirements_year_not_verified');
  assert.equal(planNmlsCe({ ...base, role: 'qualifying_employee' }).code, 'special_role_requires_review');
  assert.equal(planNmlsCe({ ...base, late: true }).code, 'late_ce_requires_separate_courses');
  for (const input of [null, [], 'CA', 2026]) assert.equal(planNmlsCe(input).ok, false);
  assert.equal(planNmlsCe({ year: 2026 }).code, 'agency_selection_required');
  assert.equal(plan('GU').code, 'unknown_agency');
  assert.equal(evaluateNmlsPackage(base, null).code, 'invalid_course_inventory');
  const corrupt = structuredClone(courses);
  corrupt[0].credit.general = -1;
  assert.equal(evaluateNmlsPackage({ ...base, courseIds: [corrupt[0].id] }, corrupt).code, 'invalid_course_credit_allocation');
  assert.ok(courses.every((c) => c.status === 'authoring' && c.nmlsCourseId === null));
});
