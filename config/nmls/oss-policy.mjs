// Published NMLS Functional Specifications v17, effective 2026-01-01.
// Separate required floors from provider design decisions. This file is not an
// approval, a substitute for human content review, or a BioSig interface spec.
export const NMLS_OSS_REQUIREMENTS = Object.freeze({
  secondsPerHour: 3000,
  idleLogoutMs: 360000,
  mediaMaxSeconds: 300,
  untimedActivitiesPerHour: 2,
  untimedActivityMaxCreditSeconds: 300,
  shortModuleMaxSeconds: 600,
  shortQuizMinQuestions: 3,
  longQuizMinQuestions: 5,
  longQuizMaxQuestions: 10,
  bankRatio: 2,
  finalMinPassPercent: 70,
  finalShortMaxHours: 2,
  finalShortMinQuestions: 15,
  finalLongMinQuestions: 25,
  finalShortMaxCreditSeconds: 600,
  finalLongMaxCreditSeconds: 1200,
  rocsVersion: '4',
  bankingCalendarDays: 7,
});

export const NMLS_OSS_DESIGN = Object.freeze({
  maxCreditableEventGapMs: 30000,
  moduleQuizPassPercent: 80,
  finalCreditSeconds: 0,
  defaultFinalQuestions: 25,
  // Break/day policies are versioned separately in session-policy.mjs.
  // They are not yet enforced by the existing private-review adapter.
});

export const NMLS_OSS_SOURCES = Object.freeze({
  design: 'https://mortgage.nationwidelicensingsystem.org/knowledge/Products/nmls/pubs/nmlsEdFuncSpec/education/funcSpec/maps/topics/nmlsFS_OSS_courseDesign.html',
  time: 'https://mortgage.nationwidelicensingsystem.org/knowledge/Products/nmls/pubs/nmlsEdFuncSpec/education/funcSpec/maps/topics/nmlsFS_OSS_timeReq.html',
  final: 'https://mortgage.nationwidelicensingsystem.org/knowledge/Products/nmls/pubs/nmlsEdFuncSpec/education/funcSpec/maps/topics/nmlsFS_endCourseAssessment.html',
  identity: 'https://mortgage.nationwidelicensingsystem.org/knowledge/Products/nmls/pubs/nmlsEdFuncSpec/education/funcSpec/maps/topics/nmlsFS_OSS_IDAuth.html',
});
