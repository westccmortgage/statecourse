// Read-only projection used by the authenticated Studio door and SQL proofs.
import type {Queryable} from '../core-v2/postgres/wire.ts';
import {emptySections,isComparisonSubject,sectionFor,type SubjectShape} from './sections.ts';
const asObject=(v:unknown):Record<string,unknown>=>v==null?{}:typeof v==='string'?JSON.parse(v):v as Record<string,unknown>;
export async function readAnalysisResults(db:Queryable,organization:string,analysisId:string){
  const run=(await db.query(`select workflow_id,question,question_kind,title,state from analysis_runs
    where id=$1::uuid and organization_id=$2::uuid`,[analysisId,organization])).rows[0];
  if(!run)return null;
  const workflowId=run.workflow_id?String(run.workflow_id):null;
  if(!workflowId)return {analysisId,started:false,workflowId:null,subjects:[],sections:emptySections(),unpaired:0};
  /* WHAT NOBODY COULD RELATE TO ANYTHING.
     Frozen with the workflow, so a result shows the same gaps it was produced
     with. These are not failures and not findings: they are places the run
     could not ask a comparison question about, and the owner is the one who
     can close them. */
  const scope = asObject((await db.query(
    `select requested_scope from public.intelligence_workflows where id = $1::uuid`, [workflowId])).rows[0]?.requested_scope);
  const unpaired = Array.isArray(scope.unpaired) ? scope.unpaired as { kind: string; place: { file: number; ordinal: number }; question: string }[] : [];

  /* Every reading, with who made it, what it said, and the piece of the
     owner's own file it came out of. */
  const claims = (await db.query(
    `select c.id::text as id, c.subject_type, c.subject_key, c.predicate, c.value, c.unit,
            c.status, c.independence_domain, c.observation_basis,
            a.role_key, a.role_version, a.executor_family, a.model_reported, a.state as attempt_state,
            t.id::text as task_id
       from public.evidence_claims c
       left join public.agent_attempts a on a.id = c.attempt_id
       left join public.workflow_tasks t on t.id = c.task_id
      where c.workflow_id = $1::uuid
      order by c.subject_key, c.created_at, c.id`, [workflowId])).rows;

  const anchors = (await db.query(
    `select an.claim_id::text as claim_id, an.assessment_id::text as assessment_id,
            an.quoted_text, an.locator, s.content_hash, s.segment_kind, s.label
       from public.evidence_anchors an
       left join public.source_segments s on s.id = an.segment_id
      where an.workflow_id = $1::uuid order by an.id`, [workflowId])).rows;

  const assessments = (await db.query(
    `select cs.id::text as id, cs.claim_id::text as claim_id, cs.assessment, cs.reason_code,
            cs.explanation, cs.proposed_value, a.role_key, a.executor_family, a.model_reported
       from public.claim_assessments cs
       left join public.agent_attempts a on a.id = cs.attempt_id
      where cs.workflow_id = $1::uuid order by cs.id`, [workflowId])).rows;

  const decisions = (await db.query(
    `select d.id::text as id, d.subject_key, d.decision_type, d.status, d.authority,
            d.title, d.rationale, d.summary
       from public.decisions d where d.workflow_id = $1::uuid
      order by d.created_at,d.id`, [workflowId])).rows;

  /* A task that never produced a claim is still a place somebody asked about,
     and leaving it off the screen is how a missing reading becomes invisible. */
  const openTasks = (await db.query(
    `select t.subject_key, t.state, t.task_type, t.role_key, t.terminal_reason
       from public.workflow_tasks t
      where t.workflow_id = $1::uuid and t.subject_key <> ''
      order by t.subject_key,t.id`, [workflowId])).rows;

  const anchorsFor = (claimId: string) => anchors
    .filter((a) => String(a.claim_id ?? "") === claimId)
    .map((a) => ({
      quotedText: a.quoted_text ?? null,
      locator: asObject(a.locator),
      contentHash: a.content_hash ?? null,
      segmentKind: a.segment_kind ?? null,
      label: a.label ?? null,
    }));

  const bySubject = new Map<string, SubjectShape & {
    subjectType: string; subjectKey: string; problems: string[];
  }>();
  /* Declared before the loops that use it, because a subject's identity is
     decided by the whole set of task subjects rather than by each in turn. */
  const slot = (type: string, key: string) => {
    const id = `${type}:${key}`;
    let found = bySubject.get(id);
    if (!found) {
      found = {
        subjectType: type, subjectKey: key, readings: [], reviews: [], decisions: [], taskStates: [],
        problems: [], comparison: isComparisonSubject(key),
      };
      bySubject.set(id, found);
    }
    return found;
  };

  /* A subject key is `page/<file>/<page>` or `moment/<file>/<moment>`; the
     part before the first slash is the kind, which is how a task row and a
     claim row find each other without the tasks table carrying a second copy
     of it. */
  /* WHICH TASK SUBJECTS ARE PLACES A PERSON CARES ABOUT.
     Two are not. `source:1` is the ingest saying the bytes are what the
     manifest said they were — true, necessary, and not a finding. And a
     subject that extends another — `pages/1/1/1/3/corroborated` is the
     kernel's decision ABOUT `pages/1/1/1/3` — is that place, not a second
     one; leaving it separate splits one fact across two cards. */
  const taskKeys = openTasks.map((row) => String(row.subject_key)).filter((key) => !key.startsWith("source:"));
  const placeOf = (key: string) =>
    taskKeys.filter((other) => other !== key && key.startsWith(`${other}/`))
      .sort((a, b) => b.length - a.length)[0] ?? key;

  for (const row of openTasks) {
    const raw = String(row.subject_key);
    if (raw.startsWith("source:")) continue;
    const key = placeOf(raw);
    const s = slot(key.split("/")[0] || "subject", key);
    s.taskStates.push(String(row.state));
    if (row.terminal_reason) s.problems.push(String(row.terminal_reason));
  }

  for (const c of claims) {
    /* The ingest's statement about the bytes is not one of the findings. */
    if (String(c.predicate) === "content_identity") continue;
    const s = slot(String(c.subject_type), placeOf(String(c.subject_key)));
    s.readings.push({
      claimId: String(c.id),
      predicate: String(c.predicate),
      value: asObject(c.value),
      unit: c.unit ?? null,
      status: String(c.status),
      basis: String(c.observation_basis),
      /* Which independent family read it. Two readings only corroborate when
         these differ — that is what independence means here. */
      independenceDomain: c.independence_domain ?? null,
      role: c.role_key ?? null,
      roleVersion: c.role_version ?? null,
      executor: c.executor_family ?? null,
      model: c.model_reported ?? null,
      anchors: anchorsFor(String(c.id)),
    });
    for (const review of assessments.filter((a) => String(a.claim_id) === String(c.id))) {
      s.reviews.push({
        claimId: String(c.id),
        verdict: String(review.assessment),
        reasonCode: String(review.reason_code),
        explanation: review.explanation ?? null,
        proposedValue: review.proposed_value ?? null,
        role: review.role_key ?? null,
        executor: review.executor_family ?? null,
        model: review.model_reported ?? null,
      });
    }
  }
  for (const d of decisions) {
    const key = String(d.subject_key ?? "");
    /* THE SAME RULE THE TASKS AND THE CLAIMS ARE HELD TO, AND IT HAS TO BE
       REPEATED HERE BECAUSE A DECISION ARRIVES BY A DIFFERENT DOOR.
       `source:1` is the ingest saying the bytes are the bytes the manifest
       named. It is true, it is necessary, and it is not a finding about
       anybody's plans. Filtered out of the tasks and out of the claims, it
       still walked in as a DECISION — and the fallback below made it a place
       of its own, so the first thing an owner saw under Confirmed was a
       bookkeeping fact about a file rather than nothing. Confirmed showing
       "1" when nothing about the drawings was confirmed is the exact
       overstatement the three sections exist to prevent. */
    if (key.startsWith("source:")) continue;
    /* A decision names the subject it is about, and the kernel may qualify
       that name — `moment/2/1/corroborated` is a decision about the claim on
       `moment/2/1`. Matching on the prefix is how a decision reaches the place
       it belongs to; matching on equality quietly loses every one of them,
       which is how a screen ends up showing nothing as decided while the
       record is full of decisions. */
    const s = [...bySubject.values()].find((x) => x.subjectKey === key)
      ?? [...bySubject.values()].filter((x) => key.startsWith(`${x.subjectKey}/`))
           .sort((a, b) => b.subjectKey.length - a.subjectKey.length)[0]
      ?? slot("decision", key || "the analysis");
    s.decisions.push({
      decisionId: String(d.id), type: String(d.decision_type), status: String(d.status),
      authority: String(d.authority), title: String(d.title), rationale: String(d.rationale ?? ""),
      summary: asObject(d.summary),
    });
  }

  for (const gap of unpaired) {
    const key = `${gap.kind}/${gap.place.file}/${gap.place.ordinal}`;
    const slotted = slot(gap.kind, key);
    slotted.problems.push(gap.question);
  }

  const subjects = [...bySubject.values()]
    .map((s) => ({ ...s, section: sectionFor(s) }))
    .sort((a, b) => a.subjectKey.localeCompare(b.subjectKey, undefined, { numeric: true }));

  const sections = emptySections();
  for (const s of subjects) (sections as Record<string, unknown[]>)[s.section].push(s);

  return {
    analysisId, started: true, workflowId,
    title: run.title ?? null, question: run.question ?? "", questionKind: run.question_kind ?? null,
    subjects, sections,
    counts: {
      confirmed: sections.confirmed.length,
      discrepancy: sections.discrepancy.length,
      needsCheck: sections.needsCheck.length,
    },
    unpaired: unpaired.length,
    pairingNote: String(scope.pairingNote ?? ""),
  };
}

