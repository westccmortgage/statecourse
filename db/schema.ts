import { integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const courseVersions = sqliteTable("course_versions", {
  courseId: text("course_id").notNull(),
  version: text("version").notNull(),
  state: text("state").notNull(),
  title: text("title").notNull(),
  approvalStatus: text("approval_status").notNull(),
  approvalNumber: text("approval_number"),
  rulesJson: text("rules_json").notNull(),
  contentHash: text("content_hash").notNull(),
  effectiveDate: text("effective_date"),
  expirationDate: text("expiration_date"),
  createdAt: text("created_at").notNull(),
}, (table) => [primaryKey({ columns: [table.courseId, table.version] })]);

export const courseEnrollments = sqliteTable("course_enrollments", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull(),
  studentEmail: text("student_email").notNull(),
  courseId: text("course_id").notNull(),
  courseVersion: text("course_version").notNull(),
  role: text("role").notNull().default("student"),
  status: text("status").notNull().default("active"),
  currentHour: integer("current_hour").notNull().default(1),
  complianceCreditEligible: integer("compliance_credit_eligible", { mode: "boolean" }).notNull().default(false),
  assignedInstructorId: text("assigned_instructor_id"),
  createdAt: text("created_at").notNull(),
}, (table) => [uniqueIndex("course_enrollment_student_course_version").on(table.studentId, table.courseId, table.courseVersion)]);

export const courseRoles = sqliteTable("course_roles", {
  userEmail: text("user_email").notNull(),
  courseId: text("course_id").notNull(),
  role: text("role").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  grantedAt: text("granted_at").notNull(),
  grantedBy: text("granted_by").notNull(),
}, (table) => [primaryKey({ columns: [table.userEmail, table.courseId, table.role] })]);

export const hourProgress = sqliteTable("hour_progress", {
  enrollmentId: text("enrollment_id").notNull(),
  courseId: text("course_id").notNull(),
  courseVersion: text("course_version").notNull(),
  hourId: integer("hour_id").notNull(),
  activeSeconds: integer("active_seconds").notNull().default(0),
  sectionsViewedJson: text("sections_viewed_json").notNull().default("[]"),
  activityComplete: integer("activity_complete", { mode: "boolean" }).notNull().default(false),
  engagementComplete: integer("engagement_complete", { mode: "boolean" }).notNull().default(false),
  remediationTriggered: integer("remediation_triggered", { mode: "boolean" }).notNull().default(false),
  remediationContentViewed: integer("remediation_content_viewed", { mode: "boolean" }).notNull().default(false),
  remediationSatisfied: integer("remediation_satisfied", { mode: "boolean" }).notNull().default(false),
  complianceBlock: text("compliance_block"),
  completedAt: text("completed_at"),
  updatedAt: text("updated_at").notNull(),
  revision: integer("revision").notNull().default(0),
}, (table) => [primaryKey({ columns: [table.enrollmentId, table.hourId] })]);

export const studySessions = sqliteTable("study_sessions", {
  id: text("id").primaryKey(),
  enrollmentId: text("enrollment_id").notNull(),
  courseId: text("course_id").notNull(),
  courseVersion: text("course_version").notNull(),
  hourId: integer("hour_id").notNull(),
  startedAt: text("started_at").notNull(),
  lastHeartbeatAt: text("last_heartbeat_at"),
  endedAt: text("ended_at"),
  activeSeconds: integer("active_seconds").notNull().default(0),
  inactiveSeconds: integer("inactive_seconds").notNull().default(0),
  status: text("status").notNull().default("active"),
  sessionMetadataJson: text("session_metadata_json").notNull().default("{}"),
});

export const assessmentAttempts = sqliteTable("assessment_attempts", {
  id: text("id").primaryKey(),
  enrollmentId: text("enrollment_id").notNull(),
  courseId: text("course_id").notNull(),
  courseVersion: text("course_version").notNull(),
  hourId: integer("hour_id").notNull(),
  concept: text("concept").notNull(),
  assessmentType: text("assessment_type").notNull(),
  questionId: text("question_id").notNull(),
  answerToken: text("answer_token").notNull(),
  correct: integer("correct", { mode: "boolean" }).notNull(),
  attemptNumber: integer("attempt_number").notNull(),
  submittedAt: text("submitted_at").notNull(),
});

export const remediationEvents = sqliteTable("remediation_events", {
  id: text("id").primaryKey(),
  enrollmentId: text("enrollment_id").notNull(),
  courseId: text("course_id").notNull(),
  courseVersion: text("course_version").notNull(),
  hourId: integer("hour_id").notNull(),
  eventType: text("event_type").notNull(),
  questionId: text("question_id"),
  correct: integer("correct", { mode: "boolean" }),
  attemptNumber: integer("attempt_number"),
  occurredAt: text("occurred_at").notNull(),
});

export const instructorSupportQueue = sqliteTable("instructor_support_queue", {
  id: text("id").primaryKey(),
  enrollmentId: text("enrollment_id").notNull(),
  studentId: text("student_id").notNull(),
  studentEmail: text("student_email").notNull(),
  courseId: text("course_id").notNull(),
  courseVersion: text("course_version").notNull(),
  hourId: integer("hour_id").notNull(),
  concept: text("concept").notNull(),
  attempts: integer("attempts").notNull().default(0),
  lastActivityAt: text("last_activity_at").notNull(),
  helpRequested: integer("help_requested", { mode: "boolean" }).notNull().default(false),
  status: text("status").notNull().default("open"),
  instructorId: text("instructor_id"),
  resolvedAt: text("resolved_at"),
});

export const courseAuditLog = sqliteTable("course_audit_log", {
  id: text("id").primaryKey(),
  actorId: text("actor_id").notNull(),
  actorRole: text("actor_role").notNull(),
  studentId: text("student_id"),
  enrollmentId: text("enrollment_id"),
  courseId: text("course_id").notNull(),
  courseVersion: text("course_version").notNull(),
  hourId: integer("hour_id"),
  eventType: text("event_type").notNull(),
  eventJson: text("event_json").notNull(),
  sessionId: text("session_id"),
  requestMetadataJson: text("request_metadata_json").notNull().default("{}"),
  occurredAt: text("occurred_at").notNull(),
});
