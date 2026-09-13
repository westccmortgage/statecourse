import { NMLS_OSS_REQUIREMENTS as R } from '../config/nmls/oss-policy.mjs';

const buckets = ['federal', 'ethics', 'nontraditional', 'general', 'state'];
const positiveInt = (n) => Number.isSafeInteger(n) && n > 0;
const nonnegativeInt = (n) => Number.isSafeInteger(n) && n >= 0;
const text = (value) => typeof value === 'string' && value.trim().length > 0;
const strings = (values) => Array.isArray(values) && values.length > 0 && values.every(text) && new Set(values).size === values.length;
const sourceUrls = (values) => strings(values) && values.every((value) => {
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
});
const contentRef = (value) => text(value) && !value.startsWith('/') && !value.includes('\\') && !value.split('/').includes('..');

export function validateNmlsOssManifest(manifest = {}) {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) return {
    ok: false, errors: [{ code: 'manifest_object_required', path: '' }],
    approvalEstablished: false, contentSufficiencyEstablished: false,
  };
  const errors = [];
  const add = (code, path) => errors.push({ code, path });
  if (manifest.format !== 'OSS' || manifest.educationType !== 'CE') add('oss_ce_required', 'format');
  if (!positiveInt(manifest.hours) || manifest.hours > 20) add('supported_integer_hours_required', 'hours');
  if (!positiveInt(manifest.year)) add('education_year_required', 'year');
  if (!text(manifest.id) || !text(manifest.contentVersion)) add('immutable_content_reference_required', 'id');
  const hours = manifest.hours || 0;
  if (!manifest.credit || !buckets.every((key) => nonnegativeInt(manifest.credit[key])) ||
      buckets.reduce((sum, key) => sum + (manifest.credit?.[key] || 0), 0) !== hours) add('credit_hours_do_not_reconcile', 'credit');
  if (!Array.isArray(manifest.modules) || manifest.modules.length < 2) add('multiple_modules_required', 'modules');
  const planned = Object.fromEntries(buckets.map((key) => [key, 0]));
  let untimedCount = 0;
  const identifiers = new Set();
  const checkId = (id, path) => {
    if (typeof id !== 'string' || !id || identifiers.has(id)) add('unique_identifier_required', path);
    identifiers.add(id);
  };
  const checkAssessment = (assessment, path, minimum, maximum = Infinity) => {
    const stems = new Set();
    if (!assessment || !positiveInt(assessment.questionsPerAttempt) || assessment.questionsPerAttempt < minimum || assessment.questionsPerAttempt > maximum) {
      add('assessment_attempt_size_invalid', path);
    }
    if (!Array.isArray(assessment?.bank) || assessment.bank.length < R.bankRatio * (assessment.questionsPerAttempt || minimum)) add('assessment_bank_too_small', path);
    for (const [i, item] of (Array.isArray(assessment?.bank) ? assessment.bank : []).entries()) {
      if (!item || typeof item !== 'object') { add('assessment_item_invalid', `${path}.bank.${i}`); continue; }
      checkId(item.id, `${path}.bank.${i}.id`);
      if (item.type !== 'single_choice' || !Array.isArray(item.options) || item.options.length < 3 ||
          new Set(item.options).size !== item.options.length || item.options.some((o) => typeof o !== 'string' || !o.trim()) ||
          !nonnegativeInt(item.correctIndex) || item.correctIndex >= item.options.length) add('assessment_item_invalid', `${path}.bank.${i}`);
      if (!text(item.stem) || !text(item.rationale) || !sourceUrls(item.sourceUrls) || !text(item.objectiveId)) add('assessment_evidence_missing', `${path}.bank.${i}`);
      const normalizedStem = typeof item.stem === 'string' ? item.stem.trim().toLowerCase().replace(/\s+/g, ' ') : '';
      if (normalizedStem && stems.has(normalizedStem)) add('duplicate_assessment_stem', `${path}.bank.${i}`);
      stems.add(normalizedStem);
      if (item.reviewStatus !== 'accepted') add('assessment_human_review_missing', `${path}.bank.${i}`);
    }
    if (!positiveInt(assessment?.passPercent) || assessment.passPercent > 100) add('assessment_pass_mark_invalid', path);
  };
  for (const [mi, module] of (Array.isArray(manifest.modules) ? manifest.modules : []).entries()) {
    const path = `modules.${mi}`;
    if (!module || typeof module !== 'object') { add('module_invalid', path); continue; }
    checkId(module.id, `${path}.id`);
    if (!Array.isArray(module.units) || module.units.length < 2) add('multiple_module_units_required', path);
    let moduleSeconds = 0;
    for (const [ui, unit] of (Array.isArray(module.units) ? module.units : []).entries()) {
      const up = `${path}.units.${ui}`;
      if (!unit || typeof unit !== 'object') { add('unit_invalid', up); continue; }
      checkId(unit.id, `${up}.id`);
      if (!buckets.includes(unit.topic) || !positiveInt(unit.requiredSeconds)) add('unit_topic_or_time_invalid', up);
      else { planned[unit.topic] += unit.requiredSeconds; moduleSeconds += unit.requiredSeconds; }
      if (!contentRef(unit.contentRef) || !strings(unit.objectiveIds) || !sourceUrls(unit.sourceUrls)) add('unit_content_evidence_missing', up);
      if (!strings(unit.requiredActionIds)) add('unit_active_learning_required', up);
      const hasAction = (id) => text(id) && Array.isArray(unit.requiredActionIds) && unit.requiredActionIds.includes(id);
      if (unit.media !== undefined && !Array.isArray(unit.media)) add('media_array_required', up);
      for (const media of (Array.isArray(unit.media) ? unit.media : [])) {
        if (!media || typeof media !== 'object') { add('media_segment_invalid', up); continue; }
        if (!['audio', 'video'].includes(media.kind) || !positiveInt(media.durationSeconds) || media.durationSeconds > R.mediaMaxSeconds) add('media_segment_invalid', up);
        if (!contentRef(media.keyPointsRef) || !hasAction(media.afterActivityId)) add('media_support_or_interaction_missing', up);
        if (!contentRef(media.transcriptRef) || (media.kind === 'video' && !contentRef(media.captionsRef))) add('media_accessibility_missing', up);
      }
      if (unit.untimedActivities !== undefined && !Array.isArray(unit.untimedActivities)) add('untimed_activity_array_required', up);
      for (const activity of (Array.isArray(unit.untimedActivities) ? unit.untimedActivities : [])) {
        untimedCount += 1;
        if (!activity || typeof activity !== 'object') { add('untimed_activity_invalid', up); continue; }
        if (!nonnegativeInt(activity.creditSeconds) || activity.creditSeconds > R.untimedActivityMaxCreditSeconds ||
            !hasAction(activity.comprehensionCheckId)) add('untimed_activity_invalid', up);
      }
    }
    const isShort = moduleSeconds <= R.shortModuleMaxSeconds;
    checkAssessment(module.quiz, `${path}.quiz`, isShort ? R.shortQuizMinQuestions : R.longQuizMinQuestions,
      isShort ? Infinity : R.longQuizMaxQuestions);
  }
  if (untimedCount > hours * R.untimedActivitiesPerHour) add('too_many_untimed_activities', 'modules');
  for (const key of buckets) {
    if (planned[key] < (manifest.credit?.[key] || 0) * R.secondsPerHour) add('topic_time_shortfall', `credit.${key}`);
  }
  const shortFinal = hours <= R.finalShortMaxHours;
  checkAssessment(manifest.final, 'final', shortFinal ? R.finalShortMinQuestions : R.finalLongMinQuestions);
  if ((manifest.final?.passPercent || 0) < R.finalMinPassPercent) add('final_pass_mark_below_floor', 'final');
  if (!nonnegativeInt(manifest.final?.creditSeconds) || manifest.final.creditSeconds > (shortFinal ? R.finalShortMaxCreditSeconds : R.finalLongMaxCreditSeconds)) add('final_credit_exceeds_limit', 'final');
  // This first implementation assigns full topic time to instruction, and never
  // uses exam minutes to fill a subject allocation. Later designs need review.
  if (manifest.final?.creditSeconds !== 0) add('credited_final_not_implemented', 'final');
  return { ok: errors.length === 0, errors, plannedInstructionSeconds: planned,
    approvalEstablished: false, contentSufficiencyEstablished: false };
}

// Integer arithmetic prevents 17/25 being rounded up to a 70% passing score.
export function nmlsAssessmentPassed(correct, count, passPercent = 70) {
  return nonnegativeInt(correct) && positiveInt(count) && correct <= count &&
    positiveInt(passPercent) && passPercent <= 100 && correct * 100 >= count * passPercent;
}
