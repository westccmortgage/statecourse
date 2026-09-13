// DRAFT provider implementation choices, not quoted NMLS numerical rules.
// Keep separate from the already-pinned review/course content. Not deployed.
export const NMLS_SESSION_POLICY = Object.freeze({
  id: 'statecourse-oss-session-draft-2026-02',
  sourceSpecification: 'NMLS Functional Specifications v17, effective 2026-01-01',
  sourceCheckedOn: '2026-09-10',
  rocsVersion: '4',
  rocsRetentionYears: 5,
  // Conservative conversion of four instructional hours at50min/hour.
  // NMLS does not expressly prescribe200 vs240 active minutes here.
  breakAfterStudyMs: 200 * 60_000,
  // NMLS requires a break but does not specify its minimum duration here.
  minimumBreakMs: 10 * 60_000,
  // Provider choice:10 active hours in every rolling24h, including assessments
  // and repeated/uncredited study, plus12 wall-clock hours per session.
  rollingStudyLimitMs: 600 * 60_000,
  rollingWindowMs: 24 * 60 * 60_000,
  sessionWallLimitMs: 12 * 60 * 60_000,
  minimumNewSessionRestMs: 12 * 60 * 60_000,
  maximumObservationMs: 30_000,
  // A restriction-only budget, never observed study or educational credit.
  // Recovery starts a fresh minimumBreakMs pause after clearing delivery.
  uncertaintyRecovery: 'conservative-gap-debit-v1',
  // Binding digest changes; old grants are not silently migrated to v2.
  initialExposureAccounting: 'initial-material-gap-restriction-only-v1',
  sources: Object.freeze({
    rocs: 'https://mortgage.nationwidelicensingsystem.org/knowledge/Products/nmls/pubs/nmlsEdFuncSpec/education/funcSpec/maps/topics/nmlsFS_OSS_ROCS.html',
    breaks: 'https://mortgage.nationwidelicensingsystem.org/knowledge/Products/nmls/pubs/nmlsEdFuncSpec/education/funcSpec/maps/topics/nmlsFS_timeReqsMandatoryBreaks.html',
    session: 'https://mortgage.nationwidelicensingsystem.org/knowledge/Products/nmls/pubs/nmlsEdFuncSpec/education/funcSpec/maps/topics/nmlsFS_timeReqsMaxCourseSession.html',
    seatTime: 'https://mortgage.nationwidelicensingsystem.org/knowledge/Products/nmls/pubs/nmlsEdFuncSpec/education/funcSpec/maps/topics/nmlsFS_timeReqsEnsureSeatTime.html',
    year: 'https://mortgage.nationwidelicensingsystem.org/knowledge/Products/nmls/pubs/nmlsEdFuncSpec/education/funcSpec/maps/topics/nmlsFS_OSS_timeReq.html',
  }),
});
