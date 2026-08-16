CREATE TABLE `assessment_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`enrollment_id` text NOT NULL,
	`course_id` text NOT NULL,
	`course_version` text NOT NULL,
	`hour_id` integer NOT NULL,
	`concept` text NOT NULL,
	`assessment_type` text NOT NULL,
	`question_id` text NOT NULL,
	`answer_token` text NOT NULL,
	`correct` integer NOT NULL,
	`attempt_number` integer NOT NULL,
	`submitted_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `course_audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_id` text NOT NULL,
	`actor_role` text NOT NULL,
	`student_id` text,
	`enrollment_id` text,
	`course_id` text NOT NULL,
	`course_version` text NOT NULL,
	`hour_id` integer,
	`event_type` text NOT NULL,
	`event_json` text NOT NULL,
	`session_id` text,
	`request_metadata_json` text DEFAULT '{}' NOT NULL,
	`occurred_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `course_enrollments` (
	`id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`student_email` text NOT NULL,
	`course_id` text NOT NULL,
	`course_version` text NOT NULL,
	`role` text DEFAULT 'student' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`current_hour` integer DEFAULT 1 NOT NULL,
	`compliance_credit_eligible` integer DEFAULT false NOT NULL,
	`assigned_instructor_id` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `course_enrollment_student_course_version` ON `course_enrollments` (`student_id`,`course_id`,`course_version`);--> statement-breakpoint
CREATE TABLE `course_roles` (
	`user_email` text NOT NULL,
	`course_id` text NOT NULL,
	`role` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`granted_at` text NOT NULL,
	`granted_by` text NOT NULL,
	PRIMARY KEY(`user_email`, `course_id`, `role`)
);
--> statement-breakpoint
CREATE TABLE `course_versions` (
	`course_id` text NOT NULL,
	`version` text NOT NULL,
	`state` text NOT NULL,
	`title` text NOT NULL,
	`approval_status` text NOT NULL,
	`approval_number` text,
	`rules_json` text NOT NULL,
	`content_hash` text NOT NULL,
	`effective_date` text,
	`expiration_date` text,
	`created_at` text NOT NULL,
	PRIMARY KEY(`course_id`, `version`)
);
--> statement-breakpoint
CREATE TABLE `hour_progress` (
	`enrollment_id` text NOT NULL,
	`course_id` text NOT NULL,
	`course_version` text NOT NULL,
	`hour_id` integer NOT NULL,
	`active_seconds` integer DEFAULT 0 NOT NULL,
	`sections_viewed_json` text DEFAULT '[]' NOT NULL,
	`activity_complete` integer DEFAULT false NOT NULL,
	`engagement_complete` integer DEFAULT false NOT NULL,
	`remediation_triggered` integer DEFAULT false NOT NULL,
	`remediation_content_viewed` integer DEFAULT false NOT NULL,
	`remediation_satisfied` integer DEFAULT false NOT NULL,
	`compliance_block` text,
	`completed_at` text,
	`updated_at` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`enrollment_id`, `hour_id`)
);
--> statement-breakpoint
CREATE TABLE `instructor_support_queue` (
	`id` text PRIMARY KEY NOT NULL,
	`enrollment_id` text NOT NULL,
	`student_id` text NOT NULL,
	`student_email` text NOT NULL,
	`course_id` text NOT NULL,
	`course_version` text NOT NULL,
	`hour_id` integer NOT NULL,
	`concept` text NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`last_activity_at` text NOT NULL,
	`help_requested` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`instructor_id` text,
	`resolved_at` text
);
--> statement-breakpoint
CREATE TABLE `remediation_events` (
	`id` text PRIMARY KEY NOT NULL,
	`enrollment_id` text NOT NULL,
	`course_id` text NOT NULL,
	`course_version` text NOT NULL,
	`hour_id` integer NOT NULL,
	`event_type` text NOT NULL,
	`question_id` text,
	`correct` integer,
	`attempt_number` integer,
	`occurred_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `study_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`enrollment_id` text NOT NULL,
	`course_id` text NOT NULL,
	`course_version` text NOT NULL,
	`hour_id` integer NOT NULL,
	`started_at` text NOT NULL,
	`last_heartbeat_at` text,
	`ended_at` text,
	`active_seconds` integer DEFAULT 0 NOT NULL,
	`inactive_seconds` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`session_metadata_json` text DEFAULT '{}' NOT NULL
);
