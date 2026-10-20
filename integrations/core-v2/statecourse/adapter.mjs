import { VERSION, COURSE_ID, IntegrationError, digest, freeze, requestInput } from './contract.mjs';
export const AUTH_SQL = `select exists (
 select 1 from statecourse_staff_private.proofs p
 join public.current_staff_actor_bindings b on b.auth_user_id=p.user_id
 where p.proof_hash=$1 and p.user_id=$2::uuid and p.session_id=$3::uuid
 and statecourse_staff_private.proof_active(p)
 and b.actor_role in ('owner','administrator') and b.binding_status='active'
 and (b.scope_state is null or b.scope_state='CA')
 and (b.effective_at is null or b.effective_at<=statement_timestamp())
 and (b.expires_at is null or b.expires_at>statement_timestamp())
) as allowed`;
// Parameter positions: enrollment id, fixed course id. All queries share one snapshot.
export const QUERIES = Object.freeze({
 enrollments: `select id,course_id,state,status,course_version,enrollment_origin,review_role,compliance_credit_eligible,console_content_release_id from public.enrollments where id=$1::uuid and course_id=$2 and state='CA'`,
 courses: `select id,state,current_version,approval_status,regulatory_approval_number from public.courses where id=$2 and exists(select 1 from public.enrollments where id=$1::uuid and course_id=$2)`,
 regulatory_course_versions: `select course_id,version,lifecycle_status,required_hours,approval_number,enrollment_enabled,regulatory_credit_enabled,effective_date,expiration_date from public.regulatory_course_versions where course_id=$2 and version=(select course_version from public.enrollments where id=$1::uuid and course_id=$2)`,
 access_grants: `select id,enrollment_id,course_id,status,granted_at,revoked_at from public.access_grants where enrollment_id=$1::uuid and course_id=$2`,
 lms_compliance_state: `select enrollment_id,required_study_seconds,credited_study_seconds,final_exam_eligible,final_exam_status,regulatory_credit_status,certificate_status from public.lms_compliance_state where enrollment_id=$1::uuid and exists(select 1 from public.enrollments where id=$1::uuid and course_id=$2)`,
 lms_assignment_state: `select enrollment_id,course_id,course_version,assignment_id,assignment_version,status,active_seconds,remediation_status,completed_at from public.lms_assignment_state where enrollment_id=$1::uuid and course_id=$2 order by assignment_id,assignment_version limit 1001`,
 lms_block_progress: `select enrollment_id,course_id,course_version,assignment_id,block_id,status,mastered_at from public.lms_block_progress where enrollment_id=$1::uuid and course_id=$2 order by assignment_id,block_id limit 1001`,
 payment_enrollments: `select payment_id,enrollment_id,course_id,allocated_amount,is_primary,package_id from public.payment_enrollments where enrollment_id=$1::uuid and course_id=$2 order by payment_id limit 1001`,
 payments: `select p.id,p.enrollment_id,p.course_id,p.stripe_mode,p.amount,p.currency,p.status,p.refund_status,p.refund_amount from public.payments p where exists(select 1 from public.enrollments e where e.id=$1::uuid and e.course_id=$2) and (p.enrollment_id=$1::uuid or exists(select 1 from public.payment_enrollments pe where pe.payment_id=p.id and pe.enrollment_id=$1::uuid and pe.course_id=$2)) order by p.id limit 1001`,
 console_course_releases: `select r.id,r.course_id,r.content_hash,r.published_at from public.console_course_releases r join public.enrollments e on e.console_content_release_id=r.id and e.course_id=r.course_id where e.id=$1::uuid and e.course_id=$2`,
 console_course_reviews: `select id,course_id,content_hash,outcome,reviewed_at from public.console_course_reviews where course_id=$2 and content_hash=(select r.content_hash from public.console_course_releases r join public.enrollments e on e.console_content_release_id=r.id and e.course_id=r.course_id where e.id=$1::uuid and e.course_id=$2) order by reviewed_at,id limit 1001`,
 console_tasks: `select id,course_id,status,priority,revision,updated_at from public.console_tasks where course_id=$2 and exists(select 1 from public.enrollments where id=$1::uuid and course_id=$2) order by id limit 1001`,
 console_task_events: `select te.id,te.task_id,te.recorded_at from public.console_task_events te join public.console_tasks t on t.id=te.task_id where t.course_id=$2 and exists(select 1 from public.enrollments where id=$1::uuid and course_id=$2) order by te.id limit 1001`,
 console_evidence_events: `select id,event_order,course_id,course_version,area,evidence_key,status,effective_at,expires_at,recorded_at from public.console_evidence_events where course_id=$2 and course_version=(select course_version from public.enrollments where id=$1::uuid and course_id=$2) order by event_order limit 1001`,
 console_review_findings: `select id,event_order,course_id,course_version,enrollment_id,finding_key,content_hash,status,recorded_at from public.console_review_findings where enrollment_id=$1::uuid and course_id=$2 order by event_order limit 1001`,
});
export class StateCourseReader {
  // connect() returns an exclusively leased TLS SQL connection with query(text, values)
  // and release(). Do not pass the kernel's trust-only local Postgres wire client.
  constructor({ connect }) { this.connect = connect; }
  async transaction(identity, work) {
    const connection = await this.connect();
    try {
      await connection.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
      await connection.query("SET LOCAL statement_timeout = '5s'");
      const auth = await connection.query(AUTH_SQL, [identity.proofHash, identity.userId, identity.sessionId]);
      if (auth.rows[0]?.allowed !== true) throw new IntegrationError('staff_scope_or_session_denied', 403);
      const result = await work(connection);
      await connection.query('COMMIT');
      return result;
    } catch (error) {
      try { await connection.query('ROLLBACK'); } catch { /* never expose driver details */ }
      throw error;
    } finally { await connection.release(); }
  }
  async read(identity, input) {
    const scope = requestInput(input);
    return this.transaction(identity, async connection => {
      const tables = {};
      for (const [table, sql] of Object.entries(QUERIES)) {
        const { rows } = await connection.query(sql, [scope.enrollmentId, COURSE_ID]);
        if (rows.length > 1000) throw new IntegrationError('source_limit_exceeded', 422);
        tables[table] = rows;
        if (table === 'enrollments' && rows.length !== 1) throw new IntegrationError('enrollment_not_found', 404);
      }
      const { rows } = await connection.query('select transaction_timestamp() as captured_at');
      // JSON round-trip normalizes Date/bigint driver values; SQL bigint must remain strings.
      const snapshot = JSON.parse(JSON.stringify({ contractVersion: VERSION, scope, capturedAt: rows[0].captured_at, tables }));
      return freeze({ ...snapshot, snapshotHash: digest(snapshot) });
    });
  }
  async reauthorize(identity) { return this.transaction(identity, async () => true); }
}
