// One read-only projection shared by the signed door and acceptance probes.
import type { Queryable } from '../../core-v2/postgres/wire.ts';
import { canonical, sha256, isUuid } from '../../core-v2/kernel/ids.ts';
import { PREDICATE } from '../../core-v2/domains/ceo-admin/pack.ts';
import { readSubject } from '../../core-v2/domains/ceo-admin/records.ts';
import { sourceSnapshot, reviewKind } from './result-source.ts';

const asObject = (value: unknown): Record<string, unknown> => {
  if (value === null || value === undefined) return {};
  if (typeof value === "string") { try { return JSON.parse(value) as Record<string, unknown>; } catch { return {}; } }
  return value as Record<string, unknown>;
};

async function workflowOf(db: Queryable, organizationId: string, workflowId: unknown) {
  if (!isUuid(workflowId)) return null;
  const found = await db.query(
    `select id::text as id, state, requested_scope, error_code, error_message
       from public.intelligence_workflows
      where id = $1::uuid and organization_id = $2::uuid`,
    [workflowId, organizationId]);
  return found.rows[0] ?? null;
}

export async function readResultsSnapshot(db: Queryable, organizationId: string, requestedWorkflow: unknown) {
  const snapshotAt = String((await db.query("select transaction_timestamp()::text as at")).rows[0].at);
  const workflow = await workflowOf(db, organizationId, requestedWorkflow);
  if (!workflow) return null;
  const workflowId = String(workflow.id);
  const scope = asObject(workflow.requested_scope);

  const sourceMaterial = (await db.query(`select external_subject_key,segment_kind,record_version,content,content_sha256
    from public.ceo_admin_material where workflow_id=$1::uuid and organization_id=$2::uuid
    and segment_kind='record_fields' order by external_subject_key,record_version,content_sha256`,[workflowId,organizationId])).rows;

  const claims = (await db.query(
    `select c.id::text as id, c.subject_type, c.subject_key, c.predicate, c.value, c.scope,
            c.status, c.observation_basis, c.independence_group, c.created_at
       from public.evidence_claims c
      where c.workflow_id = $1::uuid
      order by c.subject_key, c.created_at, c.id`, [workflowId])).rows;

  const anchors = (await db.query(
    `select an.claim_id::text as claim_id, an.quoted_text, s.segment_kind, s.label
       from public.evidence_anchors an
       left join public.source_segments s on s.id = an.segment_id
      where an.workflow_id = $1::uuid and an.claim_id is not null order by an.id`, [workflowId])).rows;

  const assessments = (await db.query(
    `select cs.claim_id::text as claim_id, cs.assessment, cs.reason_code, cs.explanation
       from public.claim_assessments cs
      where cs.workflow_id = $1::uuid order by cs.id`, [workflowId])).rows;

  const disagreements = (await db.query(
    `select d.id::text as id, d.kind, d.severity, d.state, d.subject_signature,
            d.needs_human_reason, d.resolution_decision_id::text as resolution_decision_id
       from public.disagreements d where d.workflow_id = $1::uuid order by d.id`, [workflowId])).rows;

  const candidates = (await db.query(
    `select dc.disagreement_id::text as disagreement_id, dc.claim_id::text as claim_id
       from public.disagreement_claims dc
       join public.disagreements d on d.id = dc.disagreement_id
      where d.workflow_id = $1::uuid and dc.role = 'candidate'
      order by dc.disagreement_id, dc.position, dc.claim_id`, [workflowId])).rows;

  const decisions = (await db.query(
    `select d.id::text as id, d.subject_key, d.decision_type, d.status, d.authority,
            d.title, d.rationale, d.summary, d.risk_level
       from public.decisions d where d.workflow_id = $1::uuid
      order by d.created_at, d.id`, [workflowId])).rows;

  const anchorsFor = (claimId: string) => anchors
    .filter((a) => String(a.claim_id) === claimId)
    .map((a) => ({
      quotedText: a.quoted_text ?? null,
      segmentKind: a.segment_kind ?? null,
      label: a.label ?? null,
    }));

  /* READER A AND READER B, BY THE GROUP THEY READ UNDER — never by which
     machine answered. A screen that named the machine would be inviting
     somebody to prefer one, and preferring one is exactly what independence
     is for. */
  const readerOf = (group: unknown) => {
    const text = String(group ?? "");
    if (text === "reader-a") return "reader_a";
    if (text === "reader-b") return "reader_b";
    if (text === "reader-c") return "reader_c";
    return null;
  };

  type Entry = {
    subjectKey: string; question: string | null; recordKey: string | null; subjectType: string;
    readings: Record<string, unknown>[]; disagreements: Record<string, unknown>[];
    verifications: Record<string, unknown>[]; proposals: Record<string, unknown>[];
    accepted: Record<string, unknown>[];
  };
  const bySubject = new Map<string, Entry>();
  const slot = (subjectKey: string, subjectType: string): Entry => {
    let found = bySubject.get(subjectKey);
    if (!found) {
      const read = readSubject(subjectKey);
      found = {
        subjectKey, subjectType,
        question: read?.question ?? null, recordKey: read?.recordKey ?? null,
        readings: [], disagreements: [], verifications: [], proposals: [], accepted: [],
      };
      bySubject.set(subjectKey, found);
    }
    return found;
  };

  for (const claim of claims) {
    const subjectKey = String(claim.subject_key);
    /* The ingest's own identity claim is true, necessary, and not a finding. */
    if (String(claim.predicate) === "content_identity") continue;
    const entry = slot(subjectKey, String(claim.subject_type));
    const reading = {
      claimId: String(claim.id),
      reader: readerOf(claim.independence_group),
      predicate: String(claim.predicate),
      part: String(asObject(claim.scope).part ?? "") || null,
      value: asObject(claim.value).text ?? null,
      quantity: asObject(claim.value).quantity ?? null,
      attributes: asObject(asObject(claim.value).attributes),
      basis: String(claim.observation_basis),
      status: String(claim.status),
      evidence: anchorsFor(String(claim.id)),
    };
    entry.readings.push(reading);
    if (String(claim.observation_basis) === "derived" || String(claim.status) === "accepted") {
      const proposed = [PREDICATE.emailProject, PREDICATE.emailAttention, PREDICATE.emailFollowUp,
        PREDICATE.commitment, PREDICATE.conflict, PREDICATE.band, PREDICATE.dailyOrder] as string[];
      if (proposed.includes(String(claim.predicate)) && String(claim.status) === "accepted") {
        entry.accepted.push(reading);
      }
    }
    for (const a of assessments.filter((x) => String(x.claim_id) === String(claim.id))) {
      entry.verifications.push({
        claimId: String(claim.id), verdict: String(a.assessment),
        reasonCode: String(a.reason_code ?? ""), explanation: String(a.explanation ?? ""),
      });
    }
  }

  for (const d of disagreements) {
    const signature = asObject(d.subject_signature);
    const subjectKey = String(signature.subject_key ?? "");
    /* A signature's subject key is normalised; the claims carry the written
       one. Matching on the normalised form is what joins them. */
    const entry = [...bySubject.values()].find((e) => e.subjectKey.toLowerCase() === subjectKey.toLowerCase())
      ?? slot(subjectKey, "subject");
    entry.disagreements.push({
      disagreementId: String(d.id), kind: String(d.kind), severity: String(d.severity),
      reviewKind: reviewKind(signature),
      state: String(d.state), predicate: String(signature.predicate ?? ""),
      needsHumanReason: d.needs_human_reason ?? null,
      resolutionDecisionId: d.resolution_decision_id ?? null,
      candidateClaimIds: candidates.filter((c) => String(c.disagreement_id) === String(d.id))
        .map((c) => String(c.claim_id)),
    });
  }

  for (const d of decisions) {
    const entry = slot(String(d.subject_key), "subject");
    entry.proposals.push({
      decisionId: String(d.id), decisionType: String(d.decision_type),
      status: String(d.status), authority: String(d.authority),
      title: String(d.title ?? ""), rationale: String(d.rationale ?? ""),
      riskLevel: String(d.risk_level ?? "normal"), summary: asObject(d.summary),
    });
  }

  const result = {
    workflowId, state: String(workflow.state),
    batchId: scope.batch_id ?? null, today: scope.today ?? null,
    subjects: [...bySubject.values()].sort((a, b) => a.subjectKey.localeCompare(b.subjectKey))
      .map(subject=>({...subject,sourceSnapshot:sourceSnapshot(sourceMaterial,subject.recordKey??'')})),
  };
  return { ...result, projectionProtocol: "core-v2.results.1", snapshotAt,
    revision: sha256(canonical(result)), completeResultSet: true };
}

