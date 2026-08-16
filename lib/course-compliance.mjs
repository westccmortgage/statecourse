export const VIRGINIA_COURSE_RULES = Object.freeze({
  courseId: "va-salesperson-principles-v1",
  courseVersion: "1.0-submission-draft",
  requiredHours: 60,
  requiredActiveSeconds: 3_000,
  requiredSectionCount: 3,
  sequentialNavigation: true,
  activeTimeTracking: true,
  heartbeatCapSeconds: 20,
  heartbeatGapSeconds: 45,
  idleAfterSeconds: 120,
  requiresAppliedActivity: true,
  requiresEngagementCheck: true,
  requiresCorrectRemediationCheck: true,
  instructorFlagAfterFailedAttempts: 3,
  finalExamRequiresAllHours: true,
  completionPeriodDays: null,
  proctoring: "pending_board_approved_configuration",
  approvalStatus: "submission_draft",
});

export function newHourProgress(hourId = 1) {
  return {
    hourId,
    activeSeconds: 0,
    sectionsViewed: [],
    activityComplete: false,
    engagementComplete: false,
    primaryAttempts: 0,
    remediationTriggered: false,
    remediationContentViewed: false,
    remediationSatisfied: false,
    remediationAttempts: 0,
    complianceBlock: null,
    completedAt: null,
  };
}

export function creditHeartbeat(progress, previous, current, rules = VIRGINIA_COURSE_RULES) {
  if (current.role !== "student" || current.complianceCreditEligible !== true) return 0;
  if (!previous || !Number.isFinite(previous.at) || !Number.isFinite(current.at)) return 0;
  const elapsed = Math.max(0, Math.floor((current.at - previous.at) / 1_000));
  if (elapsed <= 0 || elapsed > rules.heartbeatGapSeconds) return 0;
  const engaged = current.visible && current.focused && current.connected &&
    current.secondsSinceInteraction <= rules.idleAfterSeconds && !progress.complianceBlock;
  if (!engaged) return 0;
  return Math.min(elapsed, rules.heartbeatCapSeconds);
}

export function applyHeartbeat(progress, previous, current, rules = VIRGINIA_COURSE_RULES) {
  const credit = creditHeartbeat(progress, previous, current, rules);
  return { ...progress, activeSeconds: progress.activeSeconds + credit, lastHeartbeatAt: current.at };
}

export function markSectionViewed(progress, sectionId) {
  return progress.sectionsViewed.includes(sectionId)
    ? progress
    : { ...progress, sectionsViewed: [...progress.sectionsViewed, sectionId] };
}

export function submitPrimaryAssessment(progress, correct) {
  return correct
    ? { ...progress, primaryAttempts: progress.primaryAttempts + 1, engagementComplete: true }
    : {
        ...progress,
        primaryAttempts: progress.primaryAttempts + 1,
        remediationTriggered: true,
        engagementComplete: false,
      };
}

export function submitRemediationAssessment(progress, correct) {
  return {
    ...progress,
    remediationAttempts: progress.remediationAttempts + 1,
    remediationSatisfied: Boolean(correct && progress.remediationContentViewed),
    engagementComplete: Boolean(correct && progress.remediationContentViewed),
  };
}

export function hourRequirements(progress, rules = VIRGINIA_COURSE_RULES) {
  const contentComplete = progress.sectionsViewed.length >= rules.requiredSectionCount;
  const activeTimeComplete = progress.activeSeconds >= rules.requiredActiveSeconds;
  const remediationComplete = !progress.remediationTriggered || progress.remediationSatisfied;
  const completed = contentComplete && activeTimeComplete && progress.activityComplete &&
    progress.engagementComplete && remediationComplete && !progress.complianceBlock;
  return {
    contentComplete,
    activeTimeComplete,
    activityComplete: progress.activityComplete,
    engagementComplete: progress.engagementComplete,
    remediationComplete,
    complianceClear: !progress.complianceBlock,
    completed,
  };
}

export function finalizeHour(progress, now = new Date().toISOString(), rules = VIRGINIA_COURSE_RULES) {
  return hourRequirements(progress, rules).completed && !progress.completedAt
    ? { ...progress, completedAt: now }
    : progress;
}

export function canAccessHour({ role, requestedHour, completedHours, currentHour }, rules = VIRGINIA_COURSE_RULES) {
  if (["reviewer", "regulator", "admin"].includes(role)) return true;
  if (role !== "student") return false;
  if (!rules.sequentialNavigation) return true;
  return completedHours.includes(requestedHour) || requestedHour === currentHour;
}

export function shouldFlagInstructor(progress, rules = VIRGINIA_COURSE_RULES) {
  return progress.primaryAttempts + progress.remediationAttempts >= rules.instructorFlagAfterFailedAttempts ||
    progress.helpRequested === true;
}
