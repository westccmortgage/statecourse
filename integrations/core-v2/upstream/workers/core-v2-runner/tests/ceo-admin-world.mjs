/* THE WORLD THE RUNNER BUILDS FOR A CEO ADMIN WORKFLOW.
 *
 * WHY THIS SUITE EXISTS.
 *
 * `buildWorldFor` decides whether a workflow may run and can stop one for ever,
 * and until this file it had no test of any kind. On 2026-09-27 the only real
 * workflow this engine has been given — 37 administrative rows, with $1.00 of
 * its owner's authority written into `workflow_cost_budgets` in the same commit
 * that created it — was stopped for good six seconds later. The record kept one
 * word: `material_not_provable`. That word was the label of ONE of six
 * refusals, written for all of them, and the refusal that actually fired was
 * about money. Recovering that took a day of elimination, because nothing
 * distinguishing had been written down.
 *
 * Two changes are proved here, and the proofs are the point:
 *
 *   DECISION 0 — a CEO Admin source id now names the organisation and the
 *   workflow as well as the record. It did not, `workflow_sources.id` is a bare
 *   primary key, and so the ordinary retry — a re-read minutes later that finds
 *   most rows unchanged — could not be stored at all, and one tenant's rows
 *   refused another tenant's identical ones.
 *
 *   DECISION 1 — a CEO Admin workflow's authority is read from the record the
 *   door wrote, not from a deployment-wide environment variable. The variable
 *   may only LOWER what the record allows; its absence is no longer the absence
 *   of an authority. This makes CEO Admin agree with `analysisWorld`, which has
 *   always read the record.
 *
 * And the diagnostics that made the first failure unreadable: a refusal now
 * carries a machine word for what it was and a second for the safe part of why,
 * both from closed sets, plus a correlation id and the runner's version.
 *
 * THE NETWORK IS NOT SEALED, for the same reason it is not sealed in the two
 * database-backed suites beside this one: booting a throwaway cluster needs to
 * start a process, and the kernel's guard shuts that door with the rest. What
 * holds instead is that the transport handed to the real world builder RECORDS
 * every attempted send and performs none, and the last section asserts the
 * recording is empty. No provider is named, reached or configured; nothing here
 * can spend.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { harness } from "../../core-v2/tests/harness.mjs";
import { withThrowawayDatabase } from "../../core-v2/tests/postgres-harness.mjs";
import { PostgresOrchestrationRepository } from "../../core-v2/postgres/repository.ts";
import { entityId } from "../../core-v2/kernel/ids.ts";
import { CeoAdminPack } from "../../core-v2/domains/ceo-admin/pack.ts";
import { FIXTURE_PROJECTS, FIXTURE_RECORDS, FIXTURE_TODAY } from "../../core-v2/domains/ceo-admin/fixture.ts";
import {
  SOURCE_CONTRACT_VERSION, SOURCE_IDENTITY_COMPATIBILITY, SOURCE_IDENTITY_KIND,
  legacySourceIdV1, normaliseRecord, sourceOf,
} from "../../core-v2/domains/ceo-admin/records.ts";
import {
  admit, isSubmissionRefusal, packOptionsOfScope, parseSubmission, workflowIdFor,
} from "../ceo-admin/submission.ts";
import { materialItemsOf, PostgresCeoMaterialStore } from "../ceo-admin/material.ts";
import { startFromManifest } from "../start.ts";
import { PostgresContinuationStore } from "../continuations.ts";
import { invocationClock } from "../clock.ts";
import {
  AUTHORITY_VARIABLE, DETAIL, REFUSAL, RUNNER_VERSION,
  authorityFromRecord, buildWorldFor, isAuthority, isProblem, operatorRegistry,
} from "../world.ts";
import { tickOnce } from "../tick.ts";

const t = harness("the world the runner builds for a CEO Admin workflow");

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const n = (rows) => Number(rows[0].n);

/* The declaration this deployment ships with — the same file the Edge Function
   imports when the environment names none. Read rather than imported so this
   runs under node without an import attribute. */
const BUNDLED = JSON.parse(
  readFileSync(join(ROOT, "workers", "core-v2-canary", "registry.canary.json"), "utf8"));

/* A TRANSPORT THAT CANNOT SEND AND SAYS SO AFTERWARDS. */
const attempted = [];
const recordingTransport = () => ({
  unresolvedHosts: [],
  send: (request) => {
    attempted.push(String(request?.url ?? "unnamed"));
    return Promise.reject(new Error("this suite performs no request"));
  },
});

/* The environment a deployment presents, as a map. Nothing ambient: a name this
   object does not carry is a name that is not set. */
const envOf = (values = {}) => (name) => values[name];

/* THE EXACT SCOPE PRODUCTION STORED for af4eb392-5fb4-551d-b1c5-e1a810c03e9d,
   read out of `intelligence_workflows.requested_scope` on 2026-09-28 01:40 UTC
   and pasted here as data. */
const PRODUCTION_SCOPE = {
  today: "2026-09-27",
  batch_id: "desk-2026-09-27",
  project_keys: ["crdp", "mdai", "pcn", "personal_admin", "plg", "statecourse", "tokenization", "wccm", "wccr"],
  records_read: 37,
  conflict_pairs: [],
  contract_version: "ceo-admin.source.1",
  records_submitted: 44,
};

const PREDECESSOR_BATCH = "desk-2026-09-27";
const SUCCESSOR_BATCH = "desk-2026-09-27-retry-af4eb392";

const submissionBody = (organizationId, over = {}) => ({
  domain: "ceo_admin",
  contractVersion: SOURCE_CONTRACT_VERSION,
  organizationId,
  batchId: SUCCESSOR_BATCH,
  capturedAt: "2031-03-17T08:00:00Z",
  today: FIXTURE_TODAY,
  projectKeys: FIXTURE_PROJECTS,
  records: FIXTURE_RECORDS.map((r) => ({ ...r.input })),
  conflictPairs: [],
  ...over,
});

const admittedFor = (organizationId, over = {}) => {
  const parsed = parseSubmission(submissionBody(organizationId, over));
  if (isSubmissionRefusal(parsed)) throw new Error(`refused: ${parsed.refused}`);
  const out = admit(parsed);
  if (isSubmissionRefusal(out)) throw new Error(`not admitted: ${out.refused}`);
  return out;
};

/* The door's submit path, performed the way the door performs it: workflow,
   sources, material and authority in one commit. `authorizedUsd: null` writes
   no authority at all, which is the state a fail-closed read must refuse. */
async function submit(client, organizationId, admitted, authorizedUsd = 1, over = {}) {
  return await startFromManifest({
    client, organizationId, manifest: admitted.manifest,
    pack: new CeoAdminPack(packOptionsOfScope(admitted.manifest.requestedScope)),
    alongside: async (tx, workflowId) => {
      await new PostgresCeoMaterialStore(tx).putItems(
        workflowId,
        over.materialItems ?? materialItemsOf(admitted.read.map((r) => r.record)),
      );
      if (authorizedUsd === null) return;
      await tx.query(
        `select 1 from public.core_v2_authorize_workflow_spending(
           $1::uuid, $2::numeric, $3::numeric, $4::text, null, null, $5::integer, 4, null)`,
        [workflowId, authorizedUsd, over.perAttempt ?? Math.min(0.75, authorizedUsd),
          over.currency ?? "USD", over.maximumAttempts ?? null]);
    },
  });
}

const sourceIdsOf = async (client, workflowId) =>
  (await client.query(
    `select id::text as id from public.workflow_sources where workflow_id = $1::uuid order by ordinal`,
    [workflowId])).rows.map((r) => r.id);

await withThrowawayDatabase(async ({ client, organizationId }) => {
  const registry = operatorRegistry(envOf(), BUNDLED);
  if (isProblem(registry)) throw new Error(`the bundled declaration was refused: ${registry.refused}`);
  const clock = invocationClock({
    lifetimeMs: 30_000, safetyMs: 500, answerWithinMs: 5_000,
    settlementRoomMs: 1_000, heartbeatIntervalMs: 500, graceMs: 1_000,
  });
  const store = new PostgresContinuationStore(client);
  const forWorkflow = (workflowId, environment = {}) => buildWorldFor({
    client, workflowId, organizationId, registry,
    gates: { networkFlag: false, environment: envOf(environment) },
    /* DELIBERATELY ZERO. This is the deployment-wide number the old code read
       INSTEAD of the record. Passing 0 everywhere below means every world that
       builds, builds on the record alone — the 2026-09-27 condition exactly. */
    answerWithinMs: clock.answerWithinMs, authorized: 0, transport: recordingTransport,
  });

  /* ═══════════════════════════ (1) the identity the deployed client discarded */
  t.section("(1) the successor batch is a different workflow, which is why the shadowed parameter mattered");

  const admitted = admittedFor(organizationId);
  t.check("the workflow id is derived from the batch id the door was given",
    admitted.workflowId === workflowIdFor(organizationId, SUCCESSOR_BATCH));
  t.check("and the predecessor's batch id derives a DIFFERENT workflow, so sending the wrong one lands on the wrong workflow",
    workflowIdFor(organizationId, PREDECESSOR_BATCH) !== workflowIdFor(organizationId, SUCCESSOR_BATCH));

  const created = await submit(client, organizationId, admitted, 1);
  const workflowId = created.workflowId;
  const firstIds = await sourceIdsOf(client, workflowId);
  t.check("the workflow the door created is the one its own batch id names",
    workflowId === workflowIdFor(organizationId, SUCCESSOR_BATCH));
  t.check("and it named every part it read", firstIds.length === admitted.read.length);

  /* ═════════════════════ (2) DECISION 0 — replaying one batch is idempotent */
  t.section("(2) replaying one batch is idempotent: one workflow, one set of source rows, the same ids");

  const replay = await submit(client, organizationId, admittedFor(organizationId), 1);
  t.check("the replay returns the workflow that already exists rather than creating a second",
    replay.workflowId === workflowId);
  const afterReplay = await sourceIdsOf(client, workflowId);
  t.check("it adds no source row and changes no source id",
    afterReplay.length === firstIds.length
    && afterReplay.every((id, i) => id === firstIds[i]),
    `${firstIds.length} → ${afterReplay.length}`);
  t.check("every id is the v2 derivation of (organisation, workflow, subject, version, hash)",
    admitted.read.every((r) => firstIds.includes(
      entityId(SOURCE_IDENTITY_KIND, organizationId, workflowId,
        r.record.subjectKey, r.record.recordVersion, r.record.contentHash))));

  /* ══════ (3) DECISION 0 — a successor over UNCHANGED records now stores */
  t.section("(3) a successor workflow with unchanged records gets different source ids, and can be stored");

  const successor = await submit(
    client, organizationId, admittedFor(organizationId, { batchId: "desk-2026-09-27-retry-again" }), 1);
  const successorIds = await sourceIdsOf(client, successor.workflowId);
  t.check("the successor is a different workflow", successor.workflowId !== workflowId);
  t.check("it stored — the retry of unchanged rows that used to abort on workflow_sources_pkey",
    successorIds.length === firstIds.length);
  t.check("and not one of its source ids is one of the predecessor's",
    successorIds.every((id) => !firstIds.includes(id))
    && new Set([...firstIds, ...successorIds]).size === firstIds.length + successorIds.length);
  t.check("which is exactly what the old derivation could not do: naming only the record, these two sets would have been identical",
    admitted.read.every((r) => legacySourceIdV1(r.record) !== null)
    && firstIds.every((id) => !admitted.read.some((r) => legacySourceIdV1(r.record) === id)));

  /* ════════════ (4) DECISION 0 — two organisations, identical neutral rows */
  t.section("(4) two organisations submitting identical records do not collide, and neither reads the other's rows");

  const otherOrg = entityId("organization", "second-tenant");
  const otherUser = entityId("user", "second-tenant-owner");
  await client.query("insert into auth.users(id, email) values ($1, null)", [otherUser]);
  await client.query("insert into public.organizations(id, name) values ($1, $2)", [otherOrg, "a second organisation"]);
  await client.query("insert into public.organization_members(organization_id, user_id, role) values ($1, $2, 'owner')", [otherOrg, otherUser]);

  const otherAdmitted = admittedFor(otherOrg);
  const otherCreated = await submit(client, otherOrg, otherAdmitted, 1);
  const otherIds = await sourceIdsOf(client, otherCreated.workflowId);

  t.check("the other organisation's submission of the same records stores",
    otherIds.length === firstIds.length);
  t.check("its workflow id differs, because the organisation is in the derivation",
    otherCreated.workflowId !== workflowId);
  t.check("and no source id is shared between the two organisations",
    otherIds.every((id) => !firstIds.includes(id) && !successorIds.includes(id)));

  /* NOT READ AND NOT REUSED, asserted against the record rather than inferred
     from the ids. Each organisation's repository is scoped to it, and the
     material store answers for one workflow only. */
  const mineRepo = new PostgresOrchestrationRepository(client, { organizationId });
  const theirsRepo = new PostgresOrchestrationRepository(client, { organizationId: otherOrg });
  const mineSources = await mineRepo.listSources(workflowId);
  const theirsSources = await theirsRepo.listSources(otherCreated.workflowId);
  t.check("each organisation's repository lists only its own workflow's sources",
    mineSources.length === firstIds.length && theirsSources.length === otherIds.length
    && mineSources.every((s) => firstIds.includes(s.sourceId))
    && theirsSources.every((s) => otherIds.includes(s.sourceId)));

  const theirMaterial = new PostgresCeoMaterialStore(client);
  const theirHashes = otherAdmitted.read.map((r) => r.record.contentHash);
  const crossRead = await theirMaterial.getMany(workflowId, theirHashes);
  t.check("and the material store, asked for the other organisation's hashes under MY workflow, answers nothing",
    crossRead.size === 0, `${crossRead.size} answered`);
  t.check("no cross-tenant row exists at all: every source row in the database belongs to the workflow that names it",
    n((await client.query(
      `select count(*)::int as n from public.workflow_sources s
        join public.intelligence_workflows w on w.id = s.workflow_id
        where s.organization_id <> w.organization_id`)).rows) === 0);

  /* ══════ (5) DECISION 0 — a partially failed submission retries cleanly */
  t.section("(5) a partially failed submission can be retried without duplicating source rows inside the same workflow");

  /* The workflow is driven to a hard stop, then the SAME batch is submitted
     again — which is what an Admin does when it never saw the first answer. */
  await store.stopForGood(successor.workflowId, REFUSAL.materialNotProvable);
  const stateAfterStop = (await client.query(
    `select state from public.intelligence_workflows where id = $1::uuid`, [successor.workflowId])).rows[0].state;
  const retryOfFailed = await submit(
    client, organizationId, admittedFor(organizationId, { batchId: "desk-2026-09-27-retry-again" }), 1);
  const idsAfterRetry = await sourceIdsOf(client, successor.workflowId);
  t.check("the workflow it names is the one that failed, not a new one",
    retryOfFailed.workflowId === successor.workflowId, stateAfterStop);
  t.check("and its source rows are untouched: none added, none duplicated, none renamed",
    idsAfterRetry.length === successorIds.length
    && idsAfterRetry.every((id, i) => id === successorIds[i]));
  t.check("a source id appears exactly once in the whole database",
    n((await client.query(
      `select count(*)::int as n from (
         select id from public.workflow_sources group by id having count(*) > 1) d`)).rows) === 0);

  /* ════════════════════════ (6) DECISION 0 — the compatibility boundary */
  t.section("(6) where v1 ends and v2 begins, stated as a test rather than as a paragraph");

  t.check("the two schemes never produce the same id for the same record",
    FIXTURE_RECORDS.every((f) => {
      const record = normaliseRecord(f.input);
      return legacySourceIdV1(record)
        !== sourceOf(record, 0, { organizationId, workflowId }).sourceId;
    }));
  t.check("v1's formula still yields exactly what it always yielded, so rows already in the record are still named correctly",
    legacySourceIdV1(normaliseRecord(FIXTURE_RECORDS[0].input))
      === entityId("ceo-admin-source",
        normaliseRecord(FIXTURE_RECORDS[0].input).subjectKey,
        normaliseRecord(FIXTURE_RECORDS[0].input).recordVersion,
        normaliseRecord(FIXTURE_RECORDS[0].input).contentHash));

  /* A WORKFLOW WHOSE ROWS WERE WRITTEN THE OLD WAY KEEPS THEM. Written here
     with v1 ids on purpose — that is the production shape — and then read back
     through the same call every later pass uses. */
  const legacyAdmitted = admittedFor(organizationId, { batchId: "desk-legacy-v1" });
  const legacyWorkflowId = legacyAdmitted.workflowId;
  await startFromManifest({
    client, organizationId,
    manifest: {
      ...legacyAdmitted.manifest,
      sources: legacyAdmitted.read.map((r, ordinal) => {
        const v1 = legacySourceIdV1(r.record);
        const source = sourceOf(r.record, ordinal, { organizationId, workflowId: legacyWorkflowId });
        return {
          ...source, sourceId: v1,
          declaredSegments: source.declaredSegments.map((d) => ({ ...d, sourceId: v1 })),
        };
      }),
    },
    pack: new CeoAdminPack(packOptionsOfScope(legacyAdmitted.manifest.requestedScope)),
    alongside: async (tx, id) => {
      await new PostgresCeoMaterialStore(tx).putItems(id, materialItemsOf(legacyAdmitted.read.map((r) => r.record)));
      await tx.query(
        `select 1 from public.core_v2_authorize_workflow_spending($1::uuid, 1::numeric, 0.75::numeric, 'USD', null, null, null, 4, null)`, [id]);
    },
  });
  const legacyIds = await sourceIdsOf(client, legacyWorkflowId);
  t.check("its rows carry v1 ids, and reading them back returns those ids rather than re-deriving anything",
    legacyIds.length === legacyAdmitted.read.length
    && legacyAdmitted.read.every((r) => legacyIds.includes(legacySourceIdV1(r.record))));
  t.check("and a world still builds for it, so an existing workflow is not stranded by the new scheme",
    !isProblem(await forWorkflow(legacyWorkflowId)));
  t.check("the boundary is declared in code: admission only, no rows rewritten, no migration",
    SOURCE_IDENTITY_COMPATIBILITY.version === 2
    && SOURCE_IDENTITY_COMPATIBILITY.rowsRewritten === 0
    && SOURCE_IDENTITY_COMPATIBILITY.migrationRequired === false
    && SOURCE_IDENTITY_COMPATIBILITY.derivedAt === "admission only");

  /* ══════ (7) DECISION 1 — the 2026-09-27 refusal no longer happens */
  t.section("(7) with the deployment-wide variable unset, the world now BUILDS — the record is the authority");

  const built = await forWorkflow(workflowId);
  t.check("the world builds with CORE_V2_RUNNER_AUTHORIZED_USD absent",
    !isProblem(built), isProblem(built) ? `${built.code} / ${built.detailCode}` : "built");
  t.check("it is the CEO Admin pack, rebuilt from this workflow's own scope",
    !isProblem(built) && built.world.pack.id === "ceo-admin");
  t.check("and it is authorised at the amount the RECORD holds, not at any deployment number",
    !isProblem(built) && built.config.authorization.maximumAuthorizedCost === 1
    && built.config.authorization.currency === "USD");
  t.check("with the provider network still shut, so nothing this world holds could send",
    !isProblem(built) && built.config.authorization.providerNetworkFlag === false
    && built.config.authorization.environmentGate === false);

  const incompleteAdmitted = admittedFor(organizationId, { batchId: "desk-incomplete-material" });
  const incompleteItems = materialItemsOf(incompleteAdmitted.read.map((r) => r.record));
  const incomplete = await submit(client, organizationId, incompleteAdmitted, 1, {
    materialItems: incompleteItems.slice(1),
  });
  const incompleteWorld = await forWorkflow(incomplete.workflowId);
  t.check("a first pass with one declared part missing is refused before planning",
    isProblem(incompleteWorld)
    && incompleteWorld.code === REFUSAL.materialNotProvable
    && incompleteWorld.detailCode === DETAIL.partsMissingFromStore);
  t.check("that proof does not depend on source_segments already existing",
    n((await client.query(
      `select count(*)::int as n from public.source_segments where workflow_id = $1::uuid`,
      [incomplete.workflowId])).rows) === 0);

  /* ════════════════════ (8) DECISION 1 — the record, read and checked */
  t.section("(8) the authority read: what it accepts, and every way it fails closed");

  const authority = await authorityFromRecord(client, workflowId, organizationId, envOf());
  t.check("a good row reads as an authority, with the record's own numbers",
    isAuthority(authority) && authority.authorized === 1 && authority.recordAuthorized === 1
    && authority.currency === "USD" && authority.deploymentCeiling === null);
  t.check("an absent attempt limit is not a refusal — the deployment's default applies",
    isAuthority(authority) && authority.maximumAttempts === null);

  /* A WORKFLOW WITH NO AUTHORITY AT ALL. */
  const unauthorised = await submit(
    client, organizationId, admittedFor(organizationId, { batchId: "desk-no-authority" }), null);
  const noRow = await authorityFromRecord(client, unauthorised.workflowId, organizationId, envOf());
  t.check("no budget row: refused, and named as an authority problem rather than a material one",
    isProblem(noRow) && noRow.code === REFUSAL.authorityNotInRecord
    && noRow.detailCode === DETAIL.budgetRowMissing);
  t.check("and the world refuses for the same reason, so a workflow nobody authorised cannot run",
    isProblem(await forWorkflow(unauthorised.workflowId)));

  const disappearing = await submit(
    client, organizationId, admittedFor(organizationId, { batchId: "desk-authority-disappears" }), 1);
  const beforeDelete = await forWorkflow(disappearing.workflowId);
  if (isProblem(beforeDelete)) throw new Error(beforeDelete.refused);
  await client.query(
    `delete from public.workflow_cost_budgets where workflow_id = $1::uuid`,
    [disappearing.workflowId]);
  await t.refused("a budget row that disappears after world construction is not recreated from memory",
    () => beforeDelete.world.authorize(disappearing.workflowId, client));
  t.check("the failed fallback left no replacement authority behind",
    n((await client.query(
      `select count(*)::int as n from public.workflow_cost_budgets where workflow_id = $1::uuid`,
      [disappearing.workflowId])).rows) === 0);

  /* EACH INVALID ROW, ONE AT A TIME, ON A WORKFLOW OF ITS OWN SO NOTHING LEAKS
     BETWEEN THE CASES. */
  const caseFor = async (label, patch) => {
    const wf = await submit(client, organizationId, admittedFor(organizationId, { batchId: `desk-authority-${label}` }), 1);
    await client.query(`update public.workflow_cost_budgets set ${patch} where workflow_id = $1::uuid`, [wf.workflowId]);
    return await authorityFromRecord(client, wf.workflowId, organizationId, envOf());
  };
  /* WHOSE AUTHORITY IT IS, PROVED WHERE IT IS ACTUALLY ENFORCED.
     `authorityFromRecord` checks the organisation too, and that check turns out
     to be unreachable from here — the database refuses the mutation outright, so
     a budget row cannot come to belong to somebody else in the first place. That
     is the stronger guarantee, so it is the one asserted; the code's own check
     stays as defence in depth against a future door that writes the row
     directly, and is not counted below as a distinguishable cause. */
  const tenantWorkflow = await submit(
    client, organizationId, admittedFor(organizationId, { batchId: "desk-authority-tenant" }), 1);
  await t.refused("a budget row cannot be made to belong to another organisation at all",
    () => client.query(
      `update public.workflow_cost_budgets set organization_id = $2::uuid where workflow_id = $1::uuid`,
      [tenantWorkflow.workflowId, otherOrg]));
  t.check("and it still reads as this organisation's authority afterwards",
    isAuthority(await authorityFromRecord(client, tenantWorkflow.workflowId, organizationId, envOf())));

  const stopped = await caseFor("stopped", "stopped_reason = 'operator stopped it', stopped_at = now()");
  t.check("a budget whose spending was stopped is refused, and a runner does not restart it",
    isProblem(stopped) && stopped.detailCode === DETAIL.budgetStopped);

  const zero = await caseFor("zero", "authorized_maximum = 0, maximum_per_attempt = 0");
  t.check("an authority of zero permits nothing and is refused",
    isProblem(zero) && zero.detailCode === DETAIL.budgetNotPositive);

  const perAttempt = await caseFor("perattempt", "maximum_per_attempt = 0");
  t.check("a per-attempt limit of zero is refused",
    isProblem(perAttempt) && perAttempt.detailCode === DETAIL.budgetPerAttemptInvalid);

  const tooBig = await caseFor("toobig", "authorized_maximum = 1, maximum_per_attempt = 2");
  t.check("a per-attempt limit larger than the whole authority is refused",
    isProblem(tooBig) && tooBig.detailCode === DETAIL.budgetPerAttemptInvalid);

  const badAttempts = await caseFor("attempts", "maximum_attempts = 0");
  t.check("an attempt limit that permits no attempt is refused, while an absent one is not",
    isProblem(badAttempts) && badAttempts.detailCode === DETAIL.budgetAttemptLimitInvalid);

  const eur = await caseFor("currency", "currency = 'EUR'");
  t.check("a currency this runner does not price in is refused rather than compared",
    isProblem(eur) && eur.detailCode === DETAIL.budgetCurrencyUnexpected);

  /* ═══════════ (9) DECISION 1 — the variable, in the one direction it acts */
  t.section("(9) the deployment variable is a ceiling and nothing else");

  const rich = await submit(client, organizationId, admittedFor(organizationId, { batchId: "desk-rich" }), 5, { perAttempt: 2 });
  const lowered = await authorityFromRecord(client, rich.workflowId, organizationId, envOf({ [AUTHORITY_VARIABLE]: "1" }));
  t.check("a ceiling below the record lowers what may be spent, and says what the record said",
    isAuthority(lowered) && lowered.authorized === 1 && lowered.recordAuthorized === 5
    && lowered.deploymentCeiling === 1 && lowered.maximumPerAttempt <= 1);
  const notRaised = await authorityFromRecord(client, rich.workflowId, organizationId, envOf({ [AUTHORITY_VARIABLE]: "99" }));
  t.check("a ceiling above the record does not raise it: the record still decides",
    isAuthority(notRaised) && notRaised.authorized === 5);
  const unusable = await authorityFromRecord(client, rich.workflowId, organizationId, envOf({ [AUTHORITY_VARIABLE]: "0" }));
  t.check("a ceiling an operator set to nothing is honoured and named, not ignored",
    isProblem(unusable) && unusable.detailCode === DETAIL.deploymentCeilingIsZero);
  t.check("and an UNSET variable lowers nothing — its absence is not the absence of an authority",
    isAuthority(await authorityFromRecord(client, rich.workflowId, organizationId, envOf()))); 

  /* ═════════════════ (10) the diagnostics that were missing on 2026-09-27 */
  t.section("(10) a refusal says what it was, in words that cannot carry anybody's content");

  const SAFE = /^[a-z][a-z0-9_]*$/;
  const refusals = [noRow, stopped, zero, perAttempt, tooBig, badAttempts, eur, unusable];
  t.check("every refusal carries a code and a detail code from the closed sets",
    refusals.every((r) => isProblem(r)
      && Object.values(REFUSAL).includes(r.code)
      && Object.values(DETAIL).includes(r.detailCode)));
  t.check("and both are machine words: no message, no subject, no address, no amount could be smuggled through one",
    refusals.every((r) => SAFE.test(r.code) && SAFE.test(r.detailCode)));
  /* THE SET, NAMED. Two of the eight cases share `budget_per_attempt_invalid`
     on purpose — a per-attempt limit of zero and one larger than the whole
     authority are the same defect — so the assertion is the exact set, not a
     count, which would have hidden a code quietly covering two causes it should
     have told apart. */
  t.check("the detail codes are exactly the causes these rows have, and no code is standing in for another",
    JSON.stringify([...new Set(refusals.map((r) => r.detailCode))].sort())
      === JSON.stringify([
        DETAIL.budgetAttemptLimitInvalid, DETAIL.budgetCurrencyUnexpected, DETAIL.budgetNotPositive,
        DETAIL.budgetPerAttemptInvalid, DETAIL.budgetRowMissing, DETAIL.budgetStopped,
        DETAIL.deploymentCeilingIsZero,
      ].sort()),
    [...new Set(refusals.map((r) => r.detailCode))].sort().join(", "));

  /* THE PASS, AND WHAT IT WRITES. */
  await client.query(
    `update public.workflow_continuations set due_at = now() + interval '1 hour' where workflow_id <> $1::uuid`,
    [unauthorised.workflowId]);
  await client.query(
    `update public.workflow_continuations set due_at = now() - interval '1 minute' where workflow_id = $1::uuid`,
    [unauthorised.workflowId]);
  const refusedTick = await tickOnce({
    runner: "ceo-admin-world-suite", client, store, clock,
    gates: { networkFlag: false, environment: envOf() },
    transport: recordingTransport, bundledRegistry: BUNDLED,
    correlationId: "suite-correlation-0001",
    startedAt: Date.now(), deadlineAt: Date.now() + 30_000,
  });
  t.check("the tick reports that the world was not built, no longer calling every refusal a material problem",
    refusedTick.kind === "world_not_built" && refusedTick.workflowId === unauthorised.workflowId,
    `${refusedTick.kind}`);
  t.check("it carries the refusal's own code, the caller's correlation id and the runner's version",
    refusedTick.code === REFUSAL.authorityNotInRecord
    && refusedTick.detailCode === DETAIL.budgetRowMissing
    && refusedTick.correlationId === "suite-correlation-0001"
    && refusedTick.runnerVersion === RUNNER_VERSION);

  const told = (await client.query(
    `select state, error_code, error_message from public.intelligence_workflows where id = $1::uuid`,
    [unauthorised.workflowId])).rows[0];
  t.check("and the RECORD is told the refusal that happened, where it used to be told material_not_provable whatever happened",
    told.error_message === REFUSAL.authorityNotInRecord && told.error_code === "runner_stopped",
    `${told.state} / ${told.error_code} / ${told.error_message}`);
  t.check("the settled continuation agrees with it",
    (await store.read(unauthorised.workflowId))?.settledReason === REFUSAL.authorityNotInRecord);

  /* A CORRELATION ID IS VALIDATED, NOT TRUSTED.
     On a workflow of its own, and made the only one due, so this cannot pass by
     the tick finding nothing to claim. */
  const forBadCorrelation = await submit(
    client, organizationId, admittedFor(organizationId, { batchId: "desk-bad-correlation" }), null);
  await client.query(
    `update public.workflow_continuations set due_at = now() + interval '1 hour' where workflow_id <> $1::uuid`,
    [forBadCorrelation.workflowId]);
  await client.query(
    `update public.workflow_continuations set due_at = now() - interval '1 minute' where workflow_id = $1::uuid`,
    [forBadCorrelation.workflowId]);
  const badCorrelation = await tickOnce({
    runner: "ceo-admin-world-suite", client, store, clock,
    gates: { networkFlag: false, environment: envOf() },
    transport: recordingTransport, bundledRegistry: BUNDLED,
    correlationId: "no\nnewlines or spaces allowed \"here\"",
    startedAt: Date.now(), deadlineAt: Date.now() + 30_000,
  });
  t.check("the tick claimed that workflow, so the next check is about a refusal and not about an idle tick",
    badCorrelation.kind === "world_not_built"
    && badCorrelation.workflowId === forBadCorrelation.workflowId, badCorrelation.kind);
  t.check("and a correlation id a log line could be broken with is replaced rather than carried",
    badCorrelation.kind === "world_not_built"
    && SAFE.test(badCorrelation.correlationId.replace(/-/g, "_"))
    && !/[\s"']/.test(badCorrelation.correlationId),
    badCorrelation.kind === "world_not_built" ? badCorrelation.correlationId : badCorrelation.kind);

  /* ══════ (11) the pack this workflow was planned under, and the tasks */
  t.section("(11) production's own scope rebuilds, and a corrected submission plans this material's tasks");

  const rebuilt = packOptionsOfScope(PRODUCTION_SCOPE);
  t.check("the scope production stored for af4eb392 rebuilds a pack rather than refusing",
    !isSubmissionRefusal(rebuilt) && rebuilt.projectKeys.length === 9 && rebuilt.today === "2026-09-27");

  await client.query(
    `update public.workflow_continuations set due_at = now() + interval '1 hour' where workflow_id <> $1::uuid`,
    [workflowId]);
  await client.query(
    `update public.workflow_continuations set due_at = now() - interval '1 minute' where workflow_id = $1::uuid`,
    [workflowId]);
  const ran = await tickOnce({
    runner: "ceo-admin-world-suite-2", client, store, clock,
    gates: { networkFlag: false, environment: envOf() },
    transport: recordingTransport, bundledRegistry: BUNDLED,
    startedAt: Date.now(), deadlineAt: Date.now() + 30_000,
  });
  t.check("the pass runs on the record's authority alone, with no deployment variable set anywhere",
    ran.kind === "ran" && ran.workflowId === workflowId,
    ran.kind === "world_not_built" ? `${ran.code} / ${ran.detailCode}` : ran.kind);

  const planned = n((await client.query(
    `select count(*)::int as n from public.workflow_tasks where workflow_id = $1::uuid`, [workflowId])).rows);
  const units = (await client.query(
    `select total_units from public.intelligence_workflows where id = $1::uuid`, [workflowId])).rows[0];
  t.check("and it planned this material's tasks, counted out of the record rather than asserted",
    planned > 0 && Number(units.total_units) === planned, `${planned} tasks`);
  t.check("which is what the production workflow never got: it has zero, because its world was never built",
    planned > 0);

  const budgetAfter = (await client.query(
    `select authorized_maximum::text as authorized, reserved::text as reserved, settled::text as settled
       from public.workflow_cost_budgets where workflow_id = $1::uuid`, [workflowId])).rows[0];
  t.check("the ledger holds the record's own authority, and nothing was settled because nothing was sent",
    Number(budgetAfter.authorized) === 1 && Number(budgetAfter.settled) === 0,
    `authorized ${budgetAfter.authorized}, reserved ${budgetAfter.reserved}, settled ${budgetAfter.settled}`);

  /* ═════════════════════════════ (12) no migration, and nothing sent */
  t.section("(12) the schema is untouched, and no request left this suite");

  t.check("workflow_sources.id is still the same bare primary key: the new derivation needed no constraint change",
    n((await client.query(
      `select count(*)::int as n from pg_constraint
        where conrelid = 'public.workflow_sources'::regclass and conname = 'workflow_sources_pkey'`)).rows) === 1);
  /* THE THREE INDEXES MIGRATION 058 CREATED, AND NO FOURTH.
     `workflow_sources_identity` is worth naming: it is already
     `unique (workflow_id, uri, content_hash, object_version_id)`, so 058's own
     intent for a source's identity was ALWAYS workflow-scoped. The `id`
     derivation was the one place that was not, which is why the change is a
     correction rather than a new idea — and why it needs no migration. */
  t.check("and no index or constraint was added to carry the change: these are migration 058's own three",
    JSON.stringify((await client.query(
      `select indexname from pg_indexes
        where schemaname = 'public' and tablename = 'workflow_sources' order by indexname`)).rows.map((r) => r.indexname))
      === JSON.stringify([
        "workflow_sources_identity", "workflow_sources_pkey", "workflow_sources_workflow_id_ordinal_key",
      ]),
    (await client.query(
      `select string_agg(indexname, ', ' order by indexname) as names from pg_indexes
        where schemaname = 'public' and tablename = 'workflow_sources'`)).rows[0].names ?? "");
  t.check("the transport handed to the real world builder recorded no attempted send",
    attempted.length === 0, attempted.join(", "));
});

t.finish();
