/* THE DOOR THE OTHER SYSTEM'S ROWS COME THROUGH.
 *
 * Seven operations, all authenticated, none of which reads a provider key or
 * sends anything to a provider itself:
 *
 *   preflight    what this deployment can and cannot do, by name
 *   estimate     what a batch would cost, before a workflow exists
 *   submit       the press: workflow, sources, material and authority, one commit
 *   status       everything a screen needs, rebuilt from the record
 *   results      the readings, the disagreements and the proposals, with evidence
 *   adjudicate   a person's decision, through the record's own door
 *   cancel       stop giving out new work; say honestly what is already out
 *
 * WHO MAY CALL IT, AND WHAT THAT PROVES.
 *
 * Not a browser. The administrative application's own backend holds one
 * secret shared with this door and nothing else, signs each request body
 * with it, and calls this. Two independent things then have to be true
 * before anything happens: the signature verifies (see
 * workers/core-v2-runner/ceo-admin/signature.ts — this function is deployed
 * with `verify_jwt = false`, because the platform's JWT would need this
 * project's own signing secret, which can mint any role), and
 * `ceo_admin_tenant_for` says that the submitter this deployment names is
 * registered for the administrative owner named in the request AND is still
 * a member of that organization.
 *
 * THE ORGANIZATION IS NEVER THE CALLER'S TO CHOOSE. A submission may name an
 * administrative owner; it may not name an organization. The mapping row says
 * which organization that owner's work belongs to, and that is the one used.
 * A caller that could pass an organization could read another tenant's
 * workflows by passing theirs.
 *
 * WHAT THIS DOOR CANNOT DO, BY CONSTRUCTION.
 *
 * It cannot act on anything in the other system. There is no operation here
 * that archives, sends, deletes, labels or creates anything over there, and
 * there is nothing in an engine result that could be turned into one: the
 * kernel has no phase in which a claim becomes a side effect. What crosses
 * back is claims, evidence, disagreements and proposals. What is done about
 * them is decided by a person, in the system that owns the rows.
 */
import "../_shared/core-v2/install-node-globals.ts";

import { EdgeDatabase, DatabaseUnreachable, type Queryable } from "../_shared/core-v2/deno-postgres.ts";
import {WorkOrderRefusal} from '../../../workers/core-v2/work-orders/contract.ts';
import {confirmAdminDelivery,AUDIT_DELIVERABLE,AUDIT_CRITERIA} from '../../../workers/core-v2-runner/ceo-admin/delivery.ts';
import { WORK_ORDER_OPERATIONS, workOrderOperation } from '../_shared/core-v2/work-orders.ts';
import { attachWorkflow, createWorkOrder } from '../../../workers/core-v2/work-orders/store.ts';
import { readResultsSnapshot } from '../../../workers/core-v2-runner/ceo-admin/results.ts';
import { isRouteProblem, routeToRecord } from "../_shared/core-v2/route.ts";
import { corsHeaders, preflightResponse } from "../_shared/core-v2/cors.ts";
import { startFromManifest, alreadyInTransaction } from "../../../workers/core-v2-runner/start.ts";
import { CeoAdminPack } from "../../../workers/core-v2/domains/ceo-admin/pack.ts";
import { SOURCE_CONTRACT_VERSION } from "../../../workers/core-v2/domains/ceo-admin/records.ts";
import {
  admit, isSubmissionRefusal, notReadReport, packOptionsOfScope, parseSubmission, workflowIdFor,
} from "../../../workers/core-v2-runner/ceo-admin/submission.ts";
import { materialItemsOf, PostgresCeoMaterialStore } from "../../../workers/core-v2-runner/ceo-admin/material.ts";
import { line } from "../core-v2-runner/log.ts";
import { SIGNATURE_HEADER, TIMESTAMP_HEADER, verify } from "../../../workers/core-v2-runner/ceo-admin/signature.ts";

const FUNCTION = "core-v2-ceo-admin";
const ROUTE_PREFIX = "CORE_V2_RUNNER";

/* WHICH DOOR ANSWERED, IN THE ANSWER ITSELF.
   A caller that cannot tell which build replied cannot tell a fixed deployment
   from a stale one, and that is exactly the question that took a day to settle
   when the Admin kept resubmitting one batch: every layer looked right in its
   own repository and nobody could prove what was actually running. Bumped by
   hand when the identity contract below changes. */
const DOOR_VERSION = "ceo-admin-door.2";

/* The caller's own name for one submission attempt, echoed so the two sides of
   a request can be lined up in two log streams. It is a correlation handle and
   nothing else: never trusted, never stored, never part of any identity, and
   refused unless it looks like a machine-generated id. That last rule is what
   keeps a subject line or an address out of the engine's logs. */
const CORRELATION = /^[A-Za-z0-9._-]{8,64}$/;
function correlationOf(body: Body): string | null {
  const given = body.correlationId;
  return typeof given === "string" && CORRELATION.test(given) ? given : null;
}

/* WHAT ONE BATCH MAY EVER BE AUTHORISED TO SPEND, whatever a request says.
   A person choosing an amount is choosing inside this, not past it: a typed
   zero too many should cost a refusal rather than a bill. */
const CEILING_USD = 10;
/* And what one attempt may cost, so a single runaway request cannot consume a
   whole batch's authority on its own. */
const PER_ATTEMPT_USD = 0.75;

type Body = Record<string, unknown>;

let asking: Request | null = null;
const json = (status: number, body: Body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
      ...(asking ? corsHeaders(asking) : {}),
    },
  });

const isUuid = (value: unknown): value is string =>
  typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

/* The submitter is this deployment's to name, never the request's. Holding
   the door secret proves a request came from the administrative
   application; it does not let that application choose who it is. */
function configuredSubmitter(): string | null {
  const id = Deno.env.get("CORE_V2_CEO_ADMIN_SUBMITTER");
  return isUuid(id) ? id : null;
}

/* THE ONE QUESTION THAT DECIDES EVERYTHING ELSE.
   Which organization is this signer allowed to work in, on behalf of this
   administrative owner? The record answers; the request does not. */
async function organizationFor(db: EdgeDatabase, caller: string, adminOwner: unknown): Promise<string | null> {
  if (!isUuid(adminOwner)) return null;
  const found = await db.query(
    `select public.ceo_admin_tenant_for($1::uuid, $2::uuid)::text as organization_id`,
    [caller, adminOwner]);
  const id = found.rows[0]?.organization_id;
  return typeof id === "string" && id.length > 0 ? id : null;
}

/* A workflow this caller is allowed to look at: one of this organization's. */
async function workflowOf(db: Queryable, organizationId: string, workflowId: unknown) {
  if (!isUuid(workflowId)) return null;
  const found = await db.query(
    `select id::text as id, state, requested_scope, error_code, error_message
       from public.intelligence_workflows
      where id = $1::uuid and organization_id = $2::uuid`,
    [workflowId, organizationId]);
  return found.rows[0] ?? null;
}

Deno.serve(async (request: Request): Promise<Response> => {
  asking = request;
  if (request.method === "OPTIONS") return preflightResponse(request);
  if (request.method !== "POST") return json(405, { refused: "this door takes POST" });

  const raw = await request.text();
  const problem = verify(Deno.env.get("CEO_ADMIN_DOOR_SECRET"), request.headers.get(TIMESTAMP_HEADER),
    request.headers.get(SIGNATURE_HEADER), raw, Math.floor(Date.now() / 1000));
  if (problem) {
    /* The reason goes to the log for an operator; the caller learns only
       that it was refused, never which part of the proof was missing. */
    console.error(line({ fn: FUNCTION, event: "refused_signature", problem }));
    return json(401, { refused: "this request is not signed by the administrative application" });
  }
  const caller = configuredSubmitter();
  if (!caller) return json(503, { refused: "this door names no submitter yet; it is not armed" });

  let body: Body = {};
  try { body = JSON.parse(raw) as Body; } catch { body = {}; }
  const op = typeof body.op === "string" ? body.op : "";

  if (op === "preflight") return preflight();

  const route = routeToRecord(ROUTE_PREFIX, (name) => Deno.env.get(name));
  if (isRouteProblem(route)) return json(503, { refused: route.problem });

  let db: EdgeDatabase | null = null;
  try {
    db = await EdgeDatabase.connect(route.url, FUNCTION);
    const organizationId = await organizationFor(db, caller, body.adminOwnerUserId);
    if (!organizationId) {
      /* One refusal for "you are not a registered submitter", "not for that
         owner", "the mapping is disabled" and "you are no longer a member".
         Which of the four it is would tell a caller how to become one. */
      return json(403, { refused: "this caller may not submit work for that owner" });
    }

    if (WORK_ORDER_OPERATIONS.includes(op)) {
      const result=await workOrderOperation(db,organizationId,String(body.adminOwnerUserId),'ceo-admin',body);
      return json(result.status,result.body);
    }
    if (op === "estimate") return await estimate(db, organizationId, body);
    if (op === "submit") return await submit(db, caller, organizationId, body);
    if (op === "status") return await status(db, organizationId, body);
    if (op === "results") return await results(db, organizationId, body);
    if (op === 'confirm_admin_delivery') return json(200,await confirmAdminDelivery(db,organizationId,
      String(body.adminOwnerUserId),body.workflowId,body.receipt));
    if (op === "adjudicate") return await adjudicate(db, caller, organizationId, body);
    if (op === "cancel") return await cancel(db, organizationId, body);
    return json(400, {
      refused: `unknown operation ${op || "(none)"}; this door knows preflight, estimate, submit, status, results, adjudicate and cancel`,
    });
  } catch (error) {
    if (error instanceof WorkOrderRefusal) return json(409,{refused:error.code,detail:error.message});
    if (error instanceof DatabaseUnreachable) return json(503, { refused: "the record is not reachable" });
    console.error(line({ fn: FUNCTION, event: "unhandled", op, problem: (error as Error).name }));
    return json(500, { refused: "the operation did not complete", problem: (error as Error).name });
  } finally {
    if (db) await db.end().catch(() => undefined);
  }
});

/* ───────────────────────────────────────────────────────────── preflight
 *
 * Names, never values. It answers "can this deployment read anything, and if
 * not, which thing is missing" — the question an operator actually has, and
 * the one a 500 never answers. It needs no tenant, because it says nothing
 * about anybody's data. */
function preflight(): Response {
  const set = (name: string) => Boolean(Deno.env.get(name));
  return json(200, {
    contractVersion: SOURCE_CONTRACT_VERSION,
    ceilingUsd: CEILING_USD,
    perAttemptUsd: PER_ATTEMPT_USD,
    /* True or false against a NAME. No value of any of these ever leaves. */
    route: set("CORE_V2_RUNNER_DB_HOST") && set("CORE_V2_RUNNER_DB_USER") && set("CORE_V2_RUNNER_DB_NAME"),
    runnerSecret: set("CORE_V2_RUNNER_SECRET"),
    providerRegistry: set("CORE_V2_RUNNER_REGISTRY"),
    authorizedUsd: set("CORE_V2_RUNNER_AUTHORIZED_USD"),
    doorSecret: set("CEO_ADMIN_DOOR_SECRET"),
    submitter: configuredSubmitter() !== null,
    paidCallsAllowed: Deno.env.get("CORE_V2_ALLOW_PAID_CALLS") === "true",
    providerNetworkAllowed: Deno.env.get("CORE_V2_RUNNER_ALLOW_PROVIDER_NETWORK") === "true",
    note: "false means that name is not set in this deployment. No value of any secret is ever returned.",
  });
}

/* ────────────────────────────────────────────────────────────── estimate
 *
 * The whole of stage zero and stage one, with no workflow created and nothing
 * spent. A caller sees what would be read, what would not be and why, and how
 * many paid calls it would come to — before authorising anything. */
async function estimate(_db: EdgeDatabase, organizationId: string, body: Body): Promise<Response> {
  const parsed = parseSubmission({ ...body, organizationId });
  if (isSubmissionRefusal(parsed)) return json(400, parsed as unknown as Body);
  const admitted = admit(parsed);
  if (isSubmissionRefusal(admitted)) return json(409, admitted as unknown as Body);
  return json(200, {
    workflowId: admitted.workflowId,
    read: admitted.read.map((r) => r.record.subjectKey),
    notRead: notReadReport(admitted),
    estimate: admitted.estimate,
    ceilingUsd: CEILING_USD,
  });
}

/* ───────────────────────────────────────────────────────────────── submit
 *
 * ONE COMMIT, OR NOTHING AT ALL.
 *
 * The workflow, its sources, its start command, its audit entry, its first
 * continuation, the material its readers will be handed, and the authority it
 * may spend under — all of it, or none of it. A submit that half-happened
 * would leave a workflow whose first pass finds nothing to read and whose
 * every retry fails the same way, and somebody would have to go and find it.
 */
async function submit(db: EdgeDatabase, caller: string, organizationId: string, body: Body): Promise<Response> {
  const asked = Number(body.authorizedUsd);
  if (!Number.isFinite(asked) || asked <= 0) {
    return json(400, { refused: "submit needs the amount you authorise this batch to spend" });
  }
  if (asked > CEILING_USD) {
    return json(400, { refused: `one batch may be authorised at most $${CEILING_USD}`, ceilingUsd: CEILING_USD });
  }

  const correlationId = correlationOf(body);
  const parsed = parseSubmission({ ...body, organizationId });
  if (isSubmissionRefusal(parsed)) return json(400, parsed as unknown as Body);
  const admitted = admit(parsed);
  if (isSubmissionRefusal(admitted)) return json(409, admitted as unknown as Body);

  /* WHAT THIS DOOR ACTUALLY PARSED, said out loud before anything is decided.
     The batch id below is the one the workflow id was derived from — not the one
     the caller believes it sent. When those two differ every layer can look
     correct in its own source while the run still lands on the wrong workflow,
     which is exactly what happened on 2026-09-27: four signed POSTs arrived
     carrying `desk-2026-09-27` while the Admin route had resolved
     `desk-2026-09-27-retry-af4eb392`, and this door answered truthfully about
     the batch it was actually given. A caller can now detect that from the
     response instead of from a day of log archaeology. */
  const acceptedBatchId = parsed.batchId;
  console.log(line({
    fn: FUNCTION, event: "ceo_admin.identity", op: "submit", door_version: DOOR_VERSION,
    correlation: correlationId, accepted_batch: acceptedBatchId,
    derived_workflow: admitted.workflowId, by: caller,
  }));

  /* A RETRY IS THE SAME WORKFLOW, NOT A SECOND READING.
     The id is derived from the organization and the caller's own batch name,
     so a caller that never saw the first answer asks again and is told about
     the workflow it already has. */
  const already = await workflowOf(db, organizationId, admitted.workflowId);
  if (already) {
    /* A RETRY MAY BE THE RECOVERY SIGNAL.
       The first response can be lost after the workflow commits but before its
       best-effort wake-up arrives. Re-knocking is safe: the continuation store
       leases due work, and a finished workflow has nothing due. */
    const woke = await knock();
    return json(200, {
      correlationId, doorVersion: DOOR_VERSION, acceptedBatchId,
      workflowId: admitted.workflowId, state: String(already.state), created: false,
      read: admitted.read.length, notRead: notReadReport(admitted), wokeRunner: woke,
      note: "this batch was already submitted; its workflow is named above and its runner was knocked again",
    });
  }

  const options = packOptionsOfScope(admitted.manifest.requestedScope);
  if (isSubmissionRefusal(options)) return json(409, options as unknown as Body);
  const pack = new CeoAdminPack(options);
  const items = materialItemsOf(admitted.read.map((r) => r.record));

  const created = await startFromManifest({
    client: db as never,
    organizationId,
    manifest: admitted.manifest,
    pack,
    alongside: async (tx, workflowId) => {
      const order = body.work_order_id ? null : await createWorkOrder(alreadyInTransaction(tx),organizationId,
        String(body.adminOwnerUserId),'ceo-admin',{
          idempotency_key:`desk_${workflowId.replaceAll('-','_')}`,
          goal:'Review the submitted desk records and prepare evidence-backed internal action proposals',
          requested_deliverable:AUDIT_DELIVERABLE,acceptance_criteria:AUDIT_CRITERIA,
          source:{system:'ceo-admin',type:'desk_batch',identifier:acceptedBatchId,revision:null},
        });
      await attachWorkflow(tx,organizationId,body.work_order_id??order?.work_order_id,workflowId,body.work_order_revision??order?.revision);
      /* The text its readers will be handed, written with the workflow. */
      const store = new PostgresCeoMaterialStore(tx);
      await store.putItems(workflowId, items);
      /* And what it may spend, written with it too — so there is no moment in
         which a runnable workflow exists with no authority, and none in which
         an authority exists for a workflow that does not. */
      await tx.query(
        `select 1 from public.core_v2_authorize_workflow_spending(
           $1::uuid, $2::numeric, $3::numeric, 'USD', null, null, null, $4::integer, null)`,
        [workflowId, asked, Math.min(PER_ATTEMPT_USD, asked),
          Number(Deno.env.get("CORE_V2_RUNNER_CONCURRENT_ATTEMPTS") || 4)]);
    },
  });

  console.log(line({
    fn: FUNCTION, event: "ceo_admin.submit", workflow: created.workflowId,
    read: admitted.read.length, not_read: admitted.notRead.length,
    calls_at_worst: admitted.estimate.modelCallsAtWorst, authorized_usd: asked, by: caller,
  }));

  const woke = await knock();
  return json(202, {
    correlationId, doorVersion: DOOR_VERSION, acceptedBatchId,
    workflowId: created.workflowId, state: created.state, created: true,
    read: admitted.read.length, notRead: notReadReport(admitted),
    estimate: admitted.estimate, authorizedUsd: asked, wokeRunner: woke,
    note: "the reading continues on the server; nothing is done to any of these rows",
  });
}

/* The knock. Best effort and deliberately unable to fail the submit: the
   record already says the workflow is due, and the watchdog reads that. */
async function knock(): Promise<boolean> {
  const base = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("CORE_V2_RUNNER_SECRET");
  const url = Deno.env.get("CORE_V2_RUNNER_TICK_URL");
  if (!base || !key || !url) return false;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-core-v2-runner": key },
      body: JSON.stringify({ limit: 1 }),
    });
    return response.ok;
  } catch { return false; }
}

/* ──────────────────────────────────────────────────────────────── status */

async function status(db: EdgeDatabase, organizationId: string, body: Body): Promise<Response> {
  const workflow = await workflowOf(db, organizationId, body.workflowId);
  if (!workflow) return json(404, { refused: "no such workflow for this owner" });
  const workflowId = String(workflow.id);

  const tasks = (await db.query(
    `select state, count(*)::int as n from public.workflow_tasks
      where workflow_id = $1::uuid group by state`, [workflowId])).rows;
  const waiting = (await db.query(
    `select count(*)::int as n from public.disagreements
      where workflow_id = $1::uuid and state = 'needs_human'`, [workflowId])).rows[0]?.n ?? 0;
  const budget = (await db.query(
    `select authorized_maximum::text as authorized, reserved::text as reserved,
            settled::text as spent, currency, stopped_reason
       from public.workflow_cost_budgets where workflow_id = $1::uuid`, [workflowId])).rows[0] ?? null;
  const continuation = (await db.query(
    `select state, due_at, idle_streak, settled_reason, last_error
       from public.workflow_continuations where workflow_id = $1::uuid`, [workflowId])).rows[0] ?? null;

  const byState: Record<string, number> = {};
  for (const row of tasks) byState[String(row.state)] = Number(row.n);
  const total = Object.values(byState).reduce((n, x) => n + x, 0);

  return json(200, {
    workflowId, state: String(workflow.state),
    errorCode: workflow.error_code ?? null, errorMessage: workflow.error_message ?? null,
    tasks: byState,
    /* No percentage is invented: finished out of existing is a count somebody
       can check. */
    finished: byState.completed ?? 0, totalTasks: total,
    waitingForAPerson: Number(waiting),
    budget, continuation,
  });
}

/* ─────────────────────────────────────────────────────────────── results
 *
 * THE DECISION AUDIT, AS DATA.
 *
 * One entry per subject, carrying the whole sequence a person needs in order
 * to disagree with it: what was read, what each independent reader said, where
 * they differed, what a reviewer found when it opened the record again, what
 * the engine proposes, and the words under all of it.
 *
 * What it does not carry: a prompt, a provider's name, a raw provider
 * response, a cost, or an identifier of a machine. Those are in the record for
 * an operator; they are not part of an answer and a screen does not need them
 * to show its working.
 */
async function results(db: EdgeDatabase, organizationId: string, body: Body): Promise<Response> {
  return await db.transaction(async (tx) => {
    await tx.query("set transaction isolation level repeatable read, read only");
    const result = await readResultsSnapshot(tx, organizationId, body.workflowId);
    return result ? json(200,result) : json(404,{refused:"no such workflow for this owner"});
  });
}

/* ─────────────────────────────────────────────────────────── adjudicate
 *
 * A PERSON'S DECISION, THROUGH THE RECORD'S OWN DOOR.
 *
 * The engine user and the signed Admin owner pass distinct authority checks
 * before reaching the same database resolver. This door passes the person's
 * choice and returns the decision recorded against the evidence. */
async function adjudicate(db: EdgeDatabase, caller: string, organizationId: string, body: Body): Promise<Response> {
  const disagreementId = body.disagreementId;
  if (!isUuid(disagreementId)) return json(400, { refused: "adjudicate needs a disagreementId" });
  const adminOwner = body.adminOwnerUserId;
  if (!isUuid(adminOwner)) return json(400, { refused: "adjudicate needs an adminOwnerUserId" });
  const outcome = String(body.outcome ?? "");
  if (!["accept_claim", "correct", "reject_all", "needs_more_evidence"].includes(outcome)) {
    return json(400, {
      refused: "outcome is accept_claim, correct, reject_all or needs_more_evidence",
    });
  }

  const owns = (await db.query(
    `select 1 as ok from public.disagreements
      where id = $1::uuid and organization_id = $2::uuid`, [disagreementId, organizationId])).rows.length > 0;
  if (!owns) return json(404, { refused: "no such disagreement for this owner" });

  try {
    const settled = (await db.query(
      `select id::text as id, decision_type, status, authority
         from public.core_v2_resolve_ceo_admin_disagreement(
           $1::uuid, $2::uuid, $3::uuid, $4::text, $5::text,
           $6::uuid, $7::jsonb, $8::text, $9::text, $10::uuid[])`,
      [caller, adminOwner, disagreementId, outcome,
        body.note === undefined || body.note === null ? null : String(body.note),
        isUuid(body.acceptedClaimId) ? body.acceptedClaimId : null,
        body.correctedValue === undefined || body.correctedValue === null ? null : JSON.stringify(body.correctedValue),
        body.correctedUnit === undefined || body.correctedUnit === null ? null : String(body.correctedUnit),
        body.correctedSource === undefined || body.correctedSource === null ? null : String(body.correctedSource),
        Array.isArray(body.evidenceAnchorIds) && body.evidenceAnchorIds.length
          ? `{${(body.evidenceAnchorIds as unknown[]).filter(isUuid).map((id) => `"${id}"`).join(",")}}`
          : null])).rows[0] ?? null;
    return json(200, {
      disagreementId, outcome,
      decision: settled,
      note: settled
        ? "the person's decision is recorded against the evidence"
        : "recorded; asking for more evidence settles nothing and says so",
    });
  } catch (error) {
    /* The door's own refusals are the useful ones: not your role, not open,
       the accepted claim did not compete, a correction with no source. */
    return json(409, { refused: String((error as Error).message ?? "the record refused that decision") });
  }
}

/* ──────────────────────────────────────────────────────────────── cancel */

async function cancel(db: EdgeDatabase, organizationId: string, body: Body): Promise<Response> {
  const workflow = await workflowOf(db, organizationId, body.workflowId);
  if (!workflow) return json(404, { refused: "no such workflow for this owner" });
  const workflowId = String(workflow.id);
  await db.query(`select 1 from public.core_v2_cancel_workflow($1::uuid, $2::text)`,
    [workflowId, body.reason === undefined ? null : String(body.reason)]);
  const reopened = (await db.query(
    `select 1 as ok from public.core_v2_reopen_continuation($1::uuid)`, [workflowId])).rows.length > 0;
  return json(202, {
    workflowId, cancelRequested: true, wakingReopened: reopened,
    note: "work not yet sent is stopped; an attempt that may have been served stays an unknown outcome",
  });
}
