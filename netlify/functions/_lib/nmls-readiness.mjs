import { NMLS_TRAINING_COURSE as identity } from '../../../config/nmls-course-identity.mjs';
import { getNmlsReviewCourse } from './nmls-review-content.mjs';
import { getNmlsDraftFinalDefinition } from '../../../lib/nmls-final-authoring-content.mjs';
import { nmlsOfficialEvidence } from './nmls-official-evidence.mjs';

const count = value => Number.isSafeInteger(value) && value >= 0 ? value : null;
const phases = new Set(['source', 'first_assessment', 'remediation_required', 'remediation', 'second_assessment', 'passed', 'staff_review_required']);

// The source is private. This deliberate projection contains neither teaching
// bodies nor assessment stems, selections, responses, feedback, or answer keys.
export function nmlsCurriculumSummary({ courseFor = getNmlsReviewCourse, finalFor = getNmlsDraftFinalDefinition } = {}) {
  try {
    const course = courseFor(identity.contentKey), final = finalFor(identity.contentKey);
    if (course.id !== identity.contentKey || course.digest !== identity.contentDigest ||
        final.contentDigest !== course.digest || final.courseKey !== course.id ||
        course.approvalId !== null || course.salesAuthorized !== false ||
        final.creditIssuanceAllowed !== false || final.salesAuthorized !== false) throw new Error('source_mismatch');
    const questions = new Set();
    const modules = course.modules.map(module => {
      for (const q of module.quiz.bank) questions.add(q.id);
      for (const unit of module.units) if (unit.actionQuestion) questions.add(unit.actionQuestion.id);
      return {
        id: module.id, title: module.title,
        lessons: module.units.map(unit => ({ id: unit.id, title: unit.title, provisionalMinutes: unit.requiredSeconds / 60 })),
        questionBankCount: module.quiz.bank.length,
        provisionalMinutes: module.units.reduce((sum, unit) => sum + unit.requiredSeconds / 60, 0),
        sourceLinks: (module.sources || []).map(source => ({ title: source.title, url: source.url })),
      };
    });
    const lessonCount = modules.reduce((sum, module) => sum + module.lessons.length, 0);
    const provisionalMinutes = modules.reduce((sum, module) => sum + module.provisionalMinutes, 0);
    const structurallyComplete = modules.length === 8 && lessonCount === 45 && questions.size === 123 &&
      provisionalMinutes === 400 && final.items.length === 50 && final.questionCount === 25 &&
      course.modules.every(module => module.units.every(unit => unit.content?.trim() && unit.actionQuestion) && module.quiz.bank.length >= 10);
    return {
      available: true, structurallyComplete, identity, contentDigest: course.digest,
      definitionDigest: final.digest, moduleCount: modules.length, lessonCount,
      formativeQuestionCount: questions.size, provisionalMinutes,
      finalQuestionCount: final.questionCount, finalBankCount: final.items.length,
      modules, sourceFiles: course.editorial.sourceRecords.map(source => ({ path: source.path, sha256: source.sha256 })),
      representativeTimingVerified: course.editorial.validatedDuration === true,
      humanAssessmentReviewed: final.humanReviewed === true,
      approvalEstablished: false, creditIssuanceAllowed: false,
      scopeNotice: 'National training content only. State-specific CE supplements are not included. Provisional minutes are not approved CE hours.',
    };
  } catch {
    return { available: false, structurallyComplete: false, identity, reason: 'nmls_curriculum_integrity_unverified' };
  }
}

export function nmlsTrainingProgress(row) {
  const runtime = row.runtime;
  const notStarted = runtime === null && row.revision === 0 && row.course_id === identity.id && row.course_version === identity.version;
  const valid = runtime?.schema === 'nmls-free-training-runtime-v1' && runtime.purpose === 'free_training' &&
    runtime.courseId === identity.id && runtime.courseVersion === identity.version &&
    row.course_id === identity.id && row.course_version === identity.version &&
    runtime.contentDigest === identity.contentDigest && count(row.revision) !== null && phases.has(runtime.phase);
  return {
    enrollmentId: row.enrollment_id, courseId: row.course_id, revision: count(row.revision),
    phase: valid ? runtime.phase : notStarted ? 'not_started' : 'unverified',
    completedUnits: notStarted ? 0 : valid && Array.isArray(runtime.source?.completedUnitIds) ? new Set(runtime.source.completedUnitIds).size : null,
    passedModules: notStarted ? 0 : valid && Array.isArray(runtime.source?.passedModuleIds) ? new Set(runtime.source.passedModuleIds).size : null,
    trainingCompleted: valid && runtime.phase === 'passed',
    nmlsCreditEarned: false,
  };
}

export function buildNmlsReadiness({ inventory, datasets }, curriculum = nmlsCurriculumSummary(), officialEvidence = nmlsOfficialEvidence()) {
  const complete = source => source?.available === true && source.truncated === false;
  const courseRows = (datasets.courses?.rows || []).filter(course => course.id === identity.id && course.state === identity.state && course.product_type === identity.productType && course.current_version === identity.version);
  const record = complete(datasets.courses) && courseRows.length === 1 ? courseRows[0] : null;
  const publicRows = (inventory?.rows || []).filter(course => course.id === identity.id && course.category === 'mortgage' && course.state === identity.state && course.version === identity.version);
  const publicConnected = inventory?.publicAvailable === true && publicRows.length === 1;
  const definitions = (datasets.nmlsDefinitions?.rows || []).filter(row => row.course_id === identity.id && row.course_version === identity.version);
  const definition = complete(datasets.nmlsDefinitions) && definitions.length === 1 ? definitions[0] : null;
  const definitionVerified = Boolean(definition && curriculum.available && definition.content_digest === curriculum.contentDigest && definition.definition_digest === curriculum.definitionDigest);
  const decisions = (datasets.governance?.rows || []).filter(row => row.offering_id === identity.id && row.offering_kind === 'course' && row.state === identity.state && row.discipline === identity.discipline);
  const governance = complete(datasets.governance) && decisions.length === 1 ? decisions[0] : null;
  const courseRecordConnected = Boolean(record && publicConnected && curriculum.structurallyComplete);
  const ready = courseRecordConnected && definitionVerified && record.trainingReadiness?.ready === true;
  const findings = [];
  const add = (code, message) => findings.push({ code, message });
  if (!courseRecordConnected) add('nmls_course_record_missing', 'A complete NMLS curriculum, exact database identity and mortgage catalog connection have not all been verified.');
  if (!definitionVerified) add('nmls_training_definition_unverified', 'The production training definition is missing, unreadable or differs from the authored course version.');
  if (!ready) add('nmls_learning_connection_unverified', 'The training delivery engine has not passed its current database definition check.');
  if (!governance) add('nmls_governance_unverified', 'The exact national mortgage offering has no unambiguous readable governance decision.');
  else if (!governance.training_access_enabled) add('nmls_training_closed', 'Free training is closed by the current offering decision.');
  const approval = governance?.approval_status === 'approved' && governance.approval_currently_effective === true;
  // Generic offering approval is not proof of a distinct NMLS provider approval.
  add('nmls_provider_approval_unverified', 'NMLS education-provider approval evidence has not been independently verified for this curriculum.');
  if (!approval) add('nmls_course_approval_not_effective', 'No currently effective NMLS course approval is recorded for this exact offering.');
  if (!curriculum.representativeTimingVerified) add('nmls_representative_timing_pending', 'Representative-learner timing is not verified; 400 minutes remains a provisional design budget.');
  if (!curriculum.humanAssessmentReviewed) add('nmls_human_review_pending', 'Independent human subject-matter and assessment review is not recorded.');
  if(!officialEvidence.available)add('nmls_official_evidence_unverified','The retained official-source manifest and original files could not be verified; no empty or complete archive is assumed.');
  else {
    if(officialEvidence.retainedHtmlCount!==officialEvidence.expectedHtmlCount)add('nmls_official_html_incomplete','One or more required official HTML bodies are missing, changed or inconsistent with the pinned acquisition.');
    if(officialEvidence.unresolvedOriginalCount)add('nmls_rocs_originals_missing','Original ROCS V4 and ROCS retention FAQ PDFs remain unretained and visually unverified. HTML retention is not a substitute.');
    if(!officialEvidence.aiBodyReviewComplete)add('nmls_official_ai_review_pending','The original bodies and their AI-only comparison record are not all verified; this would still not constitute human review.');
  }
  return {
    identity, curriculum, officialEvidence, courseRecordConnected, definitionVerified,
    freeTrainingAvailable: Boolean(ready && governance?.training_access_enabled === true),
    governanceAvailable: Boolean(governance), courseApprovalEffective: Boolean(approval),
    providerApprovalVerified: false, creditIssuanceAllowed: false, reportingEnabled: false,
    paymentMode: governance?.payment_mode || 'disabled',
    livePaymentPermissionRecorded: governance?.live_charging_permitted === true,
    livePaymentsActivated: false,
    progress: complete(datasets.nmlsProgress) ? datasets.nmlsProgress.rows : null,
    enrollmentCount: complete(datasets.enrollments) ? datasets.enrollments.rows.filter(row => row.course_id === identity.id && row.enrollment_origin === 'training').length : null,
    videoAssetCount: complete(datasets.videos) ? datasets.videos.rows.filter(row => row.course_id === identity.id).length : null,
    findings,
  };
}
