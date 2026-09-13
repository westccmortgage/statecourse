import { NMLS_CE_DRAFT_COURSES, NMLS_CE_REQUIREMENTS } from '../config/nmls/course-plan.mjs';

const categories = ['federal', 'ethics', 'nontraditional', 'general'];
const field = { federal: 'federal_hours', ethics: 'ethics_hours', nontraditional: 'nontraditional_hours', general: 'general_elective_hours' };

function failure(code, detail) {
  return { ok: false, code, detail, salesAuthorized: false };
}

export function nmlsAgencyOptions(stateCode, year) {
  return NMLS_CE_REQUIREMENTS.rows.filter((row) => row.state_code === stateCode && row.ce_year === year)
    .map(({ agency_id, agency_label }) => ({ id: agency_id, label: agency_label }));
}

function selectedRequirements(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return failure('invalid_plan_input');
  const { year, agencyIds, role = 'ordinary_mlo', late = false } = input;
  if (year !== 2026) return failure('requirements_year_not_verified', year);
  if (role !== 'ordinary_mlo') return failure('special_role_requires_review', role);
  if (late !== false) return failure('late_ce_requires_separate_courses');
  if (!Array.isArray(agencyIds) || !agencyIds.length || agencyIds.some((id) => typeof id !== 'string')) {
    return failure('agency_selection_required');
  }
  const rows = [];
  for (const id of new Set(agencyIds)) {
    const row = NMLS_CE_REQUIREMENTS.rows.find((item) => item.agency_id === id);
    if (!row) {
      const options = nmlsAgencyOptions(id, year);
      return failure(options.length > 1 ? 'agency_selection_ambiguous' : 'unknown_agency', { id, options });
    }
    if (row.ce_year !== year || row.verification_level !== 'individual_nmls_agency_page_read') {
      return failure('agency_requirements_not_verified', id);
    }
    rows.push(row);
  }
  return { ok: true, rows };
}

// A prospective package only. Never deduct previous CE or infer exemptions from
// a state name. Cross-state general-elective substitutions need separate review.
export function planNmlsCe(input = {}) {
  const selected = selectedRequirements(input);
  if (!selected.ok) return selected;
  const { rows } = selected;
  const generalHours = Math.max(...rows.map((r) => r.general_elective_hours));
  const courseIds = [generalHours > 0 ? 'nmls-ce-2026-comprehensive-8' : 'nmls-ce-2026-core-7'];
  for (let n = 2; n <= generalHours; n += 1) courseIds.push(`nmls-ce-2026-general-${n}`);
  for (const row of rows) {
    if (row.state_specific_hours) courseIds.push(`nmls-ce-2026-${row.agency_id.toLowerCase()}-${row.state_specific_hours}`);
  }
  const evaluated = evaluateNmlsPackage({ ...input, courseIds });
  if (!evaluated.ok) return evaluated;
  return {
    ...evaluated,
    purpose: 'prospective_annual_ce_plan',
    planningBasis: 'common_core_once_plus_general_electives_plus_each_selected_agency_course',
    requirements: rows.map((r) => ({
      agencyId: r.agency_id, label: r.agency_label, hours: r.total_hours,
      sourceUrl: r.source_url, sourceCheckedAt: r.source_checked_at,
      sourceDeadlineText: r.ce_deadline_as_nmls_displayed,
      // The source wording may differ from operational renewal deadlines.
      deadlineIndependentlyVerified: false, notes: r.notes,
      unresolvedReadiness: {
        schoolAuthorityReviewed: r.legal_school_authority_reviewed,
        stateCourseOutlineVerified: r.state_course_outline_verified,
        deliveryExceptionVerified: r.delivery_exception_verified,
      },
    })),
    limitations: [
      'Not a license-renewal determination or proof of course approval.',
      'Ordinary annual state-licensed MLO CE only; special roles, exemptions, late CE and prior completions require review.',
      'The 8h comprehensive and 7h core are separate proposed courses, not independently creditable pieces of one approval.',
      'Only each named agency course is counted as that agency’s state-specific credit.',
      'All courses are in development. No payment, enrollment or NMLS credit is available.',
    ],
  };
}

export function evaluateNmlsPackage(input = {}, courses = NMLS_CE_DRAFT_COURSES) {
  const selected = selectedRequirements(input);
  if (!selected.ok) return selected;
  if (!Array.isArray(courses) || courses.some((course) => !course || typeof course !== 'object')) return failure('invalid_course_inventory');
  const { courseIds } = input;
  if (!Array.isArray(courseIds) || !courseIds.length || courseIds.some((id) => typeof id !== 'string')) {
    return failure('course_selection_required');
  }
  if (new Set(courseIds).size !== courseIds.length) return failure('duplicate_course');
  const picked = [];
  const seenFamilies = new Set();
  for (const id of courseIds) {
    const course = courses.find((item) => item.id === id);
    if (!course) return failure('unknown_course', id);
    if (course.year !== input.year || course.format !== 'OSS') return failure('course_year_or_format_mismatch', id);
    if (!Number.isInteger(course.hours) || course.hours < 1 || !course.credit ||
        !categories.concat('state').every((key) => Number.isInteger(course.credit[key]) && course.credit[key] >= 0) ||
        categories.concat('state').reduce((sum, key) => sum + course.credit[key], 0) !== course.hours ||
        (course.credit.state > 0 && !selected.rows.some((r) => r.agency_id === course.credit.agency)) ||
        !Array.isArray(course.contentFamilies) || !course.contentFamilies.length) {
      return failure('invalid_course_credit_allocation', id);
    }
    for (const family of course.contentFamilies) {
      if (typeof family !== 'string' || !family || seenFamilies.has(family)) return failure('overlapping_course_content', id);
      seenFamilies.add(family);
    }
    picked.push(course);
  }
  const common = Object.fromEntries(categories.map((key) => [key, picked.reduce((sum, c) => sum + c.credit[key], 0)]));
  const coverage = selected.rows.map((row) => {
    const state = picked.filter((c) => c.credit.agency === row.agency_id).reduce((sum, c) => sum + c.credit.state, 0);
    const missing = Object.fromEntries(categories.map((key) => [key, Math.max(0, row[field[key]] - common[key])]));
    missing.state = Math.max(0, row.state_specific_hours - state);
    return { agencyId: row.agency_id, requiredHours: row.total_hours, applicableHours: Object.values(common).reduce((s, n) => s + n, 0) + state,
      missing, plannedHoursCoverRequirements: Object.values(missing).every((n) => n === 0) };
  });
  return {
    ok: true, year: input.year, courseIds: [...courseIds],
    plannedStudyHours: picked.reduce((sum, course) => sum + course.hours, 0),
    coverage, plannedHoursCoverRequirements: coverage.every((r) => r.plannedHoursCoverRequirements),
    salesAuthorized: false,
  };
}
