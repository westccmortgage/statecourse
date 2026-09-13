import sourceRequirements from './ce-requirements-2026.json' with { type: 'json' };

function deepFreeze(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}
const requirements = deepFreeze(structuredClone(sourceRequirements));
const agencyIds = new Set();
for (const row of requirements.rows) {
  const fields = ['federal_hours', 'ethics_hours', 'nontraditional_hours', 'general_elective_hours', 'state_specific_hours'];
  if (agencyIds.has(row.agency_id) || row.ce_year !== 2026 ||
      !fields.every((field) => Number.isSafeInteger(row[field]) && row[field] >= 0) ||
      fields.reduce((total, field) => total + row[field], 0) !== row.total_hours) {
    throw new Error('nmls_requirement_snapshot_invalid');
  }
  agencyIds.add(row.agency_id);
}

// Authoring inventory, NOT the commerce catalog. Every course requires its own
// approval. The 7h core cannot be sold as a partial completion of the 8h course.
export const NMLS_CE_YEAR = 2026;
export const NMLS_DELIVERY_FORMAT = 'OSS';

function draft(id, title, hours, credit, contentFamilies) {
  return Object.freeze({
    id, title, year: NMLS_CE_YEAR, format: NMLS_DELIVERY_FORMAT, hours,
    credit: Object.freeze(credit), contentFamilies: Object.freeze(contentFamilies),
    status: 'authoring', providerId: null, nmlsCourseId: null,
    approvedFrom: null, approvedThrough: null,
  });
}

const core = { federal: 3, ethics: 2, nontraditional: 2, general: 0, agency: null, state: 0 };
const coreFamilies = ['2026-federal-core', '2026-ethics-core', '2026-nontraditional-core'];

export const NMLS_CE_DRAFT_COURSES = Object.freeze([
  draft('nmls-ce-2026-comprehensive-8', '8 Hour SAFE Comprehensive: 2026 Mortgage Continuing Education', 8,
    { ...core, general: 1 }, [...coreFamilies, '2026-general-1']),
  draft('nmls-ce-2026-core-7', '7 Hour SAFE Core: 2026 Mortgage Continuing Education', 7,
    core, coreFamilies),
  ...[1, 2, 3].map((n) => draft(`nmls-ce-2026-general-${n}`,
    `1 Hour SAFE Elective: 2026 General Elective ${n}`, 1,
    { federal: 0, ethics: 0, nontraditional: 0, general: 1, agency: null, state: 0 },
    [`2026-general-${n}`])),
  ...requirements.rows.filter((row) => row.state_specific_hours > 0).map((row) =>
    draft(`nmls-ce-2026-${row.agency_id.toLowerCase()}-${row.state_specific_hours}`,
      `${row.state_specific_hours} Hour SAFE ${row.agency_id} Elective: 2026 State-Specific Continuing Education`, row.state_specific_hours,
      { federal: 0, ethics: 0, nontraditional: 0, general: 0, agency: row.agency_id, state: row.state_specific_hours },
      [`2026-state-${row.agency_id}`])),
]);

export const NMLS_CE_REQUIREMENTS = requirements;
