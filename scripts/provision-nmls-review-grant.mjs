import { pathToFileURL } from 'node:url';
import { getNmlsReviewCourse } from '../netlify/functions/_lib/nmls-review-content.mjs';

const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const stop = (code) => { throw new Error(code); };
const errorCodes = new Set(['invalid_provision_options', 'invalid_grant_expiry', 'apply_confirmation_required',
  'nmls_review_course_not_found', 'supabase_project_mismatch', 'service_credentials_missing',
  'review_provision_unavailable', 'existing_verified_account_required', 'student_record_required',
  'review_migration_unavailable', 'existing_grant_conflict', 'grant_readback_failed']);
export const publicProvisionError = (error) => errorCodes.has(error?.message) ? error.message : 'review_provision_unavailable';

export function planReviewGrant(options, { now = Date.now(), courseFor = getNmlsReviewCourse } = {}) {
  const allowed = new Set(['student-id', 'operator-student-id', 'grant-id', 'course-key', 'expires-at',
    'evidence', 'expect-project-ref', 'apply', 'confirm-private-review-grant']);
  if (!options || Object.keys(options).some((key) => !allowed.has(key)) ||
    !['student-id', 'operator-student-id', 'grant-id'].every((key) => UUID.test(options[key] || '')) ||
    !/^[a-z0-9]{20}$/.test(options['expect-project-ref'] || '') ||
    typeof options.evidence !== 'string' || options.evidence.trim().length < 5 || options.evidence.length > 2000 ||
    (options.apply !== undefined && options.apply !== true) ||
    (options['confirm-private-review-grant'] !== undefined && options['confirm-private-review-grant'] !== true)) stop('invalid_provision_options');
  const expiry = Date.parse(options['expires-at']);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(options['expires-at'] || '') ||
    !Number.isFinite(expiry) || new Date(expiry).toISOString() !== options['expires-at'].replace(/(?<=:\d{2})Z$/, '.000Z') ||
    expiry <= now || expiry - now > 90 * 86400000) stop('invalid_grant_expiry');
  if (options.apply && !options['confirm-private-review-grant']) stop('apply_confirmation_required');
  const course = courseFor(options['course-key']);
  return { operation: options.apply ? 'apply_private_review_grant' : 'plan_only_no_network',
    projectRef: options['expect-project-ref'], grant: {
      id: options['grant-id'].toLowerCase(), student_id: options['student-id'].toLowerCase(),
      course_key: course.id, content_digest: course.digest, access_mode: 'non_credit_review',
      status: 'active', expires_at: new Date(expiry).toISOString(),
      granted_by: options['operator-student-id'].toLowerCase(), evidence: options.evidence.trim(),
    }, authorityNotice: 'Operator attribution is not staff-role verification. Apply only with the account owner’s authority and protected service credentials.',
    studyUrl: `https://statecourse.com/student/nmls-review/?grant_id=${options['grant-id'].toLowerCase()}` };
}

export async function provisionReviewGrant(options, { env = process.env, fetcher = globalThis.fetch, clock = Date.now, now = clock(), courseFor } = {}) {
  const plan = planReviewGrant(options, { now, ...(courseFor ? { courseFor } : {}) });
  if (!options.apply) return plan; // ZERO network and no secret needed in plan mode.
  const requireUnexpired = () => {
    const current = clock();
    if (!Number.isFinite(current) || Date.parse(plan.grant.expires_at) <= Math.max(now, current)) stop('invalid_grant_expiry');
  };
  if (env.SUPABASE_URL !== `https://${plan.projectRef}.supabase.co`) stop('supabase_project_mismatch');
  if (typeof env.SUPABASE_SERVICE_ROLE_KEY !== 'string' || !env.SUPABASE_SERVICE_ROLE_KEY.trim()) stop('service_credentials_missing');
  const request = async (path, method = 'GET', body) => {
    try {
      const response = await fetcher(`${env.SUPABASE_URL}${path}`, { method,
        headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          'content-type': 'application/json', prefer: 'return=representation' },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(20000) });
      const value = await response.json().catch(() => null);
      return { status: response.status, value };
    } catch { stop('review_provision_unavailable'); }
  };
  for (const id of new Set([plan.grant.student_id, plan.grant.granted_by])) {
    const identity = await request(`/auth/v1/admin/users/${id}`);
    if (identity.status !== 200 || identity.value?.id !== id ||
      !(identity.value.email_confirmed_at || identity.value.confirmed_at) ||
      (identity.value.banned_until && Date.parse(identity.value.banned_until) > now)) stop('existing_verified_account_required');
    const student = await request(`/rest/v1/students?id=eq.${id}&select=id`);
    if (student.status !== 200 || !Array.isArray(student.value) || student.value.length !== 1 || student.value[0].id !== id) stop('student_record_required');
  }
  // This RPC verifies both migrations, without creating an attempt or enrollment.
  const availability = await request('/rest/v1/rpc/nmls_review_list', 'POST', { p_student_id: plan.grant.student_id });
  if (availability.status !== 200 || !Array.isArray(availability.value)) stop('review_migration_unavailable');
  const path = `/rest/v1/nmls_review_access_grants?id=eq.${plan.grant.id}&select=id,student_id,course_key,content_digest,access_mode,status,expires_at,granted_by,evidence`;
  const identical = (value) => value && Object.entries(plan.grant).every(([key, expected]) =>
    key === 'expires_at' ? Date.parse(value[key]) === Date.parse(expected) : value[key] === expected);
  const existing = await request(path);
  if (existing.status !== 200 || !Array.isArray(existing.value)) stop('review_provision_unavailable');
  if (existing.value.length) {
    if (existing.value.length !== 1 || !identical(existing.value[0])) stop('existing_grant_conflict');
    requireUnexpired();
    return { ...plan, result: 'existing_identical_grant_verified' };
  }
  requireUnexpired();
  const created = await request('/rest/v1/nmls_review_access_grants', 'POST', plan.grant);
  // A concurrent same-ID creation is handled by exact read-back, never an upsert.
  if (created.status !== 201 && created.status !== 409) stop('review_provision_unavailable');
  const readback = await request(path);
  if (readback.status !== 200 || !Array.isArray(readback.value) || readback.value.length !== 1 || !identical(readback.value[0])) stop('grant_readback_failed');
  requireUnexpired();
  return { ...plan, result: created.status === 201 ? 'private_grant_created_and_verified' : 'existing_identical_grant_verified' };
}

function argumentsToOptions(args) {
  const options = {};
  for (let i = 0; i < args.length; i++) {
    if (!/^--[a-z-]+$/.test(args[i])) stop('invalid_provision_options');
    const key = args[i].slice(2); if (Object.hasOwn(options, key)) stop('invalid_provision_options');
    options[key] = ['apply', 'confirm-private-review-grant'].includes(key) ? true : args[++i];
  }
  return options;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const receipt = await provisionReviewGrant(argumentsToOptions(process.argv.slice(2)));
    // No credentials, raw API bodies, email addresses or private evidence in logs.
    const { evidence: omittedEvidence, ...grant } = receipt.grant;
    console.log(JSON.stringify({ ...receipt, grant }, null, 2));
  } catch (error) { console.error(publicProvisionError(error)); process.exitCode = 1; }
}
