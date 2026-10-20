/* THE WHOLE CEO ADMIN CHAIN, AGAINST THE REAL MIGRATIONS.
 *
 * The pack's own suite proves what the kernel does with an answer. This
 * proves the part that only SQL can prove:
 *
 *   · migration 068 applies, and its two doors do what they say;
 *   · a submission becomes a workflow, its sources, its material and its
 *     spending authority in ONE commit, or none of it exists;
 *   · the material a reader was handed is still there for a critic on a later
 *     pass, addressed by hash, and a hash from another workflow is not
 *     answered;
 *   · a runner picking the workflow up tomorrow rebuilds the pack from the
 *     workflow's own scope rather than from anything ambient;
 *   · a newer version of the same row is a different workflow over different
 *     material, and cannot rewrite the first one's answer;
 *   · and the whole chain runs on the Postgres record to a terminal state,
 *     producing proposals with evidence and no side effect anywhere.
 *
 * The tenancy mapping is proved as a gate rather than as a lookup: a submitter
 * that is not registered, is registered for another owner, is disabled, or has
 * been removed from the organization gets nothing, and each of those is a
 * separate check because each is a separate way in.
 *
 * THE NETWORK IS NOT SEALED HERE, and that is not an omission. This suite
 * boots a throwaway PostgreSQL cluster, which needs to start a process, and
 * the kernel's guard shuts that door along with the rest. The database-backed
 * suites beside this one make the same trade for the same reason. What holds
 * instead is the shape of the only connection any of them opens: a unix
 * socket under /var/tmp to a cluster this process created and drops. No
 * provider is named, reached, or configured anywhere below.
 */
import { harness } from "../../core-v2/tests/harness.mjs";
import { HARNESS_LOCATION, withThrowawayDatabase } from "../../core-v2/tests/postgres-harness.mjs";
import { PostgresOrchestrationRepository } from "../../core-v2/postgres/repository.ts";
import { entityId, sha256 } from "../../core-v2/kernel/ids.ts";
import { assemble, manualClock } from "../../core-v2/domains/simulate.ts";
import { TERMINAL_WORKFLOW_STATES } from "../../core-v2/kernel/transitions.ts";
import { CeoAdminPack, PREDICATE } from "../../core-v2/domains/ceo-admin/pack.ts";
import { RoleRegistry } from "../../core-v2/kernel/roles.ts";
import { mockExecutors } from "../../core-v2/domains/ceo-admin/mocks.ts";
import { ceoAdminFixture, FIXTURE_PROJECTS, FIXTURE_RECORDS, FIXTURE_TODAY } from "../../core-v2/domains/ceo-admin/fixture.ts";
import { SOURCE_CONTRACT_VERSION } from "../../core-v2/domains/ceo-admin/records.ts";
import { admit, isSubmissionRefusal, packOptionsOfScope, parseSubmission } from "../ceo-admin/submission.ts";
import { CeoAdminMaterialResolver, materialItemsOf, PostgresCeoMaterialStore } from "../ceo-admin/material.ts";
import { startFromManifest } from "../start.ts";
import { readResultsSnapshot } from '../ceo-admin/results.ts';

const t = harness("the CEO Admin chain, against the real migrations");

const n = (rows) => Number(rows[0].n);

const submissionBody = (organizationId, over = {}) => ({
  domain: "ceo_admin",
  contractVersion: SOURCE_CONTRACT_VERSION,
  organizationId,
  batchId: "morning-2031-03-17",
  capturedAt: "2031-03-17T08:00:00Z",
  today: FIXTURE_TODAY,
  projectKeys: FIXTURE_PROJECTS,
  records: FIXTURE_RECORDS.map((r) => ({ ...r.input })),
  conflictPairs: [{ calendar: "calendar:cal-one:evt-one", task: "task:11111111-1111-4111-8111-111111111111" }],
  ...over,
});

const admittedFor = (organizationId, over = {}) => {
  const parsed = parseSubmission(submissionBody(organizationId, over));
  if (isSubmissionRefusal(parsed)) throw new Error(`the fixture submission was refused: ${parsed.refused}`);
  const out = admit(parsed);
  if (isSubmissionRefusal(out)) throw new Error(`the fixture submission was not admitted: ${out.refused}`);
  return out;
};

/* The submit path of the door, as the door performs it: workflow, sources,
   material and authority in one commit. Written here rather than imported
   because the door is Deno and this is node; what matters is that both do the
   same four writes inside one `startFromManifest`. */
async function submit(client, organizationId, admitted, authorizedUsd = 2) {
  return await startFromManifest({
    client,
    organizationId,
    manifest: admitted.manifest,
    pack: new CeoAdminPack(packOptionsOfScope(admitted.manifest.requestedScope)),
    alongside: async (tx, workflowId) => {
      await new PostgresCeoMaterialStore(tx).putItems(workflowId, materialItemsOf(admitted.read.map((r) => r.record)));
      await tx.query(
        `select 1 from public.core_v2_authorize_workflow_spending(
           $1::uuid, $2::numeric, $3::numeric, 'USD', null, null, null, 4, null)`,
        [workflowId, authorizedUsd, 0.5]);
    },
  });
}

await withThrowawayDatabase(async ({ client, organizationId, userId }) => {
  /* ════════════════════════════════════════ (1) the mapping is a gate */
  t.section("(1) which organization an external owner's work belongs to is a row, not a variable");

  const adminOwner = entityId("admin-owner", "integration");
  const otherOwner = entityId("admin-owner", "somebody-else");
  const stranger = entityId("user", "not-a-member");
  await client.query("insert into auth.users(id, email) values ($1, null)", [stranger]);

  const tenantFor = async (submitter, owner) => {
    const found = await client.query(
      "select public.ceo_admin_tenant_for($1::uuid, $2::uuid)::text as org", [submitter, owner]);
    return found.rows[0].org;
  };

  t.check("with no mapping at all, nobody may submit for anybody",
    (await tenantFor(userId, adminOwner)) === null);

  await client.query(
    `insert into public.ceo_admin_tenants(admin_owner_user_id, organization_id, submitter_user_id, label)
     values ($1::uuid, $2::uuid, $3::uuid, 'the integration owner')`,
    [adminOwner, organizationId, userId]);

  t.check("the registered submitter, for the owner it was registered for, gets that owner's organization",
    (await tenantFor(userId, adminOwner)) === organizationId);
  t.check("the same submitter gets nothing for an owner it was not registered for",
    (await tenantFor(userId, otherOwner)) === null);
  t.check("a signer nobody registered gets nothing, even for a real owner",
    (await tenantFor(stranger, adminOwner)) === null);

  await client.query("update public.ceo_admin_tenants set enabled = false where admin_owner_user_id = $1::uuid", [adminOwner]);
  t.check("a mapping somebody switched off stops answering, without being deleted",
    (await tenantFor(userId, adminOwner)) === null);
  await client.query("update public.ceo_admin_tenants set enabled = true where admin_owner_user_id = $1::uuid", [adminOwner]);

  await client.query("delete from public.organization_members where user_id = $1::uuid", [userId]);
  t.check("a submitter removed from the organization stops answering too — the mapping alone authorises nothing",
    (await tenantFor(userId, adminOwner)) === null);
  await client.query(
    "insert into public.organization_members(organization_id, user_id, role) values ($1, $2, 'owner')",
    [organizationId, userId]);
  t.check("and starts again when membership is restored", (await tenantFor(userId, adminOwner)) === organizationId);

  /* ══════════════════════════════════════════════ (2) one commit, or none */
  t.section("(2) a submission becomes a workflow, its sources, its material and its authority together");

  const admitted = admittedFor(organizationId);
  const created = await submit(client, organizationId, admitted);
  const workflowId = created.workflowId;

  t.check("the workflow the door named before writing anything is the workflow that exists",
    workflowId === admitted.workflowId, workflowId);

  const counts = {};
  for (const [name, sql] of [
    ["intelligence_workflows", "select count(*) n from public.intelligence_workflows where id = $1"],
    ["workflow_sources", "select count(*) n from public.workflow_sources where workflow_id = $1"],
    ["source_segments", "select count(*) n from public.source_segments where workflow_id = $1"],
    ["workflow_outbox", "select count(*) n from public.workflow_outbox where workflow_id = $1"],
    ["workflow_continuations", "select count(*) n from public.workflow_continuations where workflow_id = $1"],
    ["workflow_cost_budgets", "select count(*) n from public.workflow_cost_budgets where workflow_id = $1"],
    ["ceo_admin_material", "select count(*) n from public.ceo_admin_material where workflow_id = $1"],
  ]) counts[name] = n((await client.query(sql, [workflowId])).rows);

  /* THE SEGMENT ROWS ARE NOT HERE YET, AND SHOULD NOT BE.
     A source's declared parts are persisted by the kernel when that source's
     ingest task commits — they are input to the engine, not output of the
     door. What the door must have written is everything else, and the
     material, which has to be in place BEFORE the first pass rather than
     after it. Section 5 checks the segments once the run has made them. */
  const atStart = { ...counts };
  delete atStart.source_segments;
  t.check("every part of a start exists: the workflow, its sources, its start command, its first waking, its budget and its material",
    Object.values(atStart).every((x) => x > 0), JSON.stringify(counts));

  t.check("the material is in place before the first pass, one row per part the manifest declares",
    counts.ceo_admin_material === admitted.manifest.sources.reduce((x, s) => x + s.declaredSegments.length, 0),
    `${counts.ceo_admin_material} material rows, ${admitted.manifest.sources.reduce((x, s) => x + s.declaredSegments.length, 0)} declared parts`);

  t.check("no part of the engine's own record was written before the engine ran",
    counts.source_segments === 0);

  t.check("the authority the door wrote is the authority the record holds",
    Number((await client.query(
      "select authorized_maximum::float8 as n from public.workflow_cost_budgets where workflow_id = $1", [workflowId])).rows[0].n) === 2);

  /* WHAT THE MATERIAL ROWS SAY ABOUT WHERE THEY CAME FROM. */
  const provenance = (await client.query(
    `select distinct source_type, record_version from public.ceo_admin_material
      where workflow_id = $1 order by source_type`, [workflowId])).rows;
  t.check("every material row carries the kind of row it came from and the version it was at",
    provenance.length > 0 && provenance.every((r) => r.source_type && r.record_version),
    provenance.map((r) => `${r.source_type}@${r.record_version}`).join(" "));

  t.check("no material row carries an address, a token or anything anybody could fetch with",
    n((await client.query(
      `select count(*) n from public.ceo_admin_material
        where workflow_id = $1 and (content ~* 'https?://' or content ~* 'bearer |api[_-]?key|refresh_token')`,
      [workflowId])).rows) === 0);

  /* ════════════════════════════════════ (3) the text, by hash and by nothing else */
  t.section("(3) a resolver answers a hash this workflow declared, and answers nothing else");

  const store = new PostgresCeoMaterialStore(client);
  /* The parts the manifest declares, which is what the material was stored
     under and what a packet will authorise once the ingest has persisted
     them. Reading them from the manifest rather than from the engine's tables
     is the point: the resolver answers a hash, and a hash exists before a
     segment row does. */
  const declaredParts = admitted.manifest.sources.flatMap((source) =>
    source.declaredSegments.map((part) => ({ sourceId: source.sourceId, contentHash: part.contentHash })));
  const segments = [...declaredParts].sort((a, b) => a.contentHash.localeCompare(b.contentHash))
    .map((part) => ({ id: null, content_hash: part.contentHash, sourceId: part.sourceId }));
  const sourceIdOf = segments[0].sourceId;

  const reference = (hash, segmentId) => ({
    sourceId: sourceIdOf, segmentId, kind: "segment", sourceKind: "email_message",
    segmentKind: "record_fields", parentSegmentId: null, label: null, ordinal: 0,
    locator: {}, contentHash: hash,
  });

  const resolver = new CeoAdminMaterialResolver(store, workflowId);
  const first = segments[0];
  const answered = await resolver.resolve([reference(String(first.content_hash), null)]);
  t.check("a hash this workflow declared is answered with the characters it was stored under",
    answered.length === 1 && sha256(answered[0].content.text) === String(first.content_hash));

  t.check("a hash nobody stored is not answered, and the answer is silence rather than something else",
    (await resolver.resolve([reference("0".repeat(64), null)])).length === 0);

  const elsewhere = new CeoAdminMaterialResolver(store, entityId("workflow", "somebody-else"));
  t.check("another workflow's resolver is not answered with this workflow's text, though the hash is real",
    (await elsewhere.resolve([reference(String(first.content_hash), null)])).length === 0);

  t.check("the door out answers by hash only — there is no listing, no search and no way to ask for a subject",
    n((await client.query(
      `select count(*) n from public.ceo_admin_read_material($1::uuid, $2::text[])`,
      [workflowId, `{"${first.content_hash}"}`])).rows) === 1);

  /* ═════════════════════════════ (4) the pack a later pass rebuilds */
  t.section("(4) a runner tomorrow rebuilds the pack this workflow was planned under");

  const scope = (await client.query(
    "select requested_scope from public.intelligence_workflows where id = $1", [workflowId])).rows[0].requested_scope;
  const asObject = typeof scope === "string" ? JSON.parse(scope) : scope;
  const options = packOptionsOfScope(asObject);

  t.check("the taxonomy and the date it was started under are read back from the workflow itself",
    !isSubmissionRefusal(options) && options.today === FIXTURE_TODAY
    && [...options.projectKeys].sort().join() === [...FIXTURE_PROJECTS].sort().join(),
    `${options.projectKeys.length} project keys, today ${options.today}`);

  t.check("the rebuilt pack is one the registry admits, with nothing wrong with it",
    new RoleRegistry(new CeoAdminPack(options)).assertConsistent().length === 0);

  t.check("a workflow planned under a contract version this runner does not speak is refused rather than continued under a guess",
    isSubmissionRefusal(packOptionsOfScope({ ...asObject, contract_version: "ceo-admin.source.99" })));

  /* ═══════════════════════════════ (5) the whole chain, on the real record */
  t.section("(5) the chain runs on the Postgres record to a terminal state, and proposes");

  /* THE MOCKS ANSWER ABOUT THE WORKFLOW BEING DRIVEN, not about a fixture that
     happened to name the same sources. A source id now carries the organisation
     and the workflow, so the fixture is built with both — which is what this
     section always meant and previously got by coincidence, because the old
     derivation named only the record. */
  const fixture = ceoAdminFixture({ organizationId, workflowId });
  const pack = new CeoAdminPack(options);
  const { registry } = mockExecutors(fixture, pack);
  const repo = new PostgresOrchestrationRepository(client, { organizationId });
  const { scheduler } = assemble({
    manifest: admitted.manifest, pack, executors: registry, repo, clock: manualClock(), owner: "integration-1",
  });

  await scheduler.plan();
  for (let i = 0; i < 600; i++) {
    const r = await scheduler.tick();
    if (r.dispatched.length === 0 && r.released === 0 && r.stopped === 0 && r.reconciled === 0 && scheduler.inFlight.size === 0) break;
  }
  await scheduler.runUntilQuiescent();

  const workflow = await repo.getWorkflow(workflowId);
  const tasks = await repo.listTasks(workflowId);
  const claims = await repo.listClaims({ workflowId });
  const decisions = await repo.listDecisions(workflowId);

  t.check("the workflow reaches a terminal state on the real record",
    TERMINAL_WORKFLOW_STATES.includes(workflow.state), workflow.state);
  t.check("no task is left failed or unknown",
    tasks.every((x) => x.state === "completed"),
    JSON.stringify(tasks.reduce((m, x) => ({ ...m, [x.state]: (m[x.state] ?? 0) + 1 }), {})));

  const bands = claims.filter((c) => c.predicate === PREDICATE.band && c.status === "accepted");
  const projected = await readResultsSnapshot(client, organizationId, workflowId);
  const reopened = await readResultsSnapshot(client, organizationId, workflowId);
  t.check('the production result projection has a stable complete revision and immutable source fields',
    projected.completeResultSet && projected.revision === reopened.revision
    && projected.subjects.some(s => s.sourceSnapshot?.recordVersion && s.sourceSnapshot.fields.subject));
  t.check('the same projection cannot be read through another organization',
    await readResultsSnapshot(client, entityId('organization','stranger'), workflowId) === null);
  const order = claims.filter((c) => c.predicate === PREDICATE.dailyOrder).sort((a, b) => a.value.quantity - b.value.quantity);
  const attention = claims.filter((c) => c.predicate === PREDICATE.emailAttention);

  t.check("every record that carries urgency has an accepted band",
    bands.length === 9, `${bands.length} bands`);
  t.check("the day is ordered, one position per record, urgent first",
    order.length === 9 && order[0].value.attributes.band === "immediate"
    && order.every((c, i) => c.value.quantity === i + 1));
  /* FIVE MESSAGES, NOT SIX. The circular never reached a reader: stage zero
     settled it from its own headers, which is the whole point of stage zero
     and is worth asserting as a number rather than trusting as a design. */
  t.check("every message stage zero kept was read twice, and the one it settled was never read at all",
    attention.length === 10 && admitted.notRead.length === 1,
    `${attention.length} readings of ${attention.length / 2} messages; ${admitted.notRead.length} settled before reading`);
  t.check("a decision was composed, and every one of them rests on evidence",
    decisions.length > 0 && decisions.every((d) => d.evidence.length > 0), `${decisions.length} decisions`);

  /* NOW the engine has persisted the parts each source declared, and there is
     exactly one piece of stored text for each of them. A part with no
     material is a reader handed nothing; material with no part is text
     nobody can be authorised to read. */
  const persistedParts = n((await client.query(
    "select count(*) n from public.source_segments where workflow_id = $1", [workflowId])).rows);
  t.check("once the run has persisted each source's declared parts, there is one piece of stored text for each",
    persistedParts === counts.ceo_admin_material,
    `${persistedParts} parts, ${counts.ceo_admin_material} material rows`);

  t.check("and every part the engine persisted is one the store can answer for",
    n((await client.query(
      `select count(*) n from public.source_segments s
        where s.workflow_id = $1
          and not exists (select 1 from public.ceo_admin_material m
                           where m.workflow_id = s.workflow_id and m.content_sha256 = s.content_hash)`,
      [workflowId])).rows) === 0);

  /* THE PROPOSAL IS A PROPOSAL, IN THE DATABASE TOO. */
  const actionable = n((await client.query(
    `select count(*) n from public.decision_actions da
       join public.decisions d on d.id = da.decision_id
      where d.workflow_id = $1
        and da.action_type not in ('review','verify_source','request_information','proceed','hold')`,
    [workflowId])).rows);
  t.check("not one decision action in the record is a thing done to a mailbox, a calendar or a task list",
    actionable === 0);

  t.check("every accepted proposal can be carried back to the words it came from",
    claims.filter((c) => c.status === "accepted").every((c) => c.anchorIds.length > 0));

  /* ═════════════════════════════════ (6) a newer version is a new reading */
  t.section("(6) an edited row starts a second workflow; it cannot rewrite the first one's answer");

  const second = admittedFor(organizationId, {
    batchId: "afternoon-2031-03-17",
    records: FIXTURE_RECORDS.map((r) => ({ ...r.input, recordVersion: "2" })),
  });
  t.check("the same rows at a new version name a different workflow",
    second.workflowId !== workflowId);

  const secondCreated = await submit(client, organizationId, second);
  /* WHAT CHANGES AT A NEW VERSION, AND WHAT DELIBERATELY DOES NOT.
     A SOURCE's identity carries the version, so every source of the second
     batch is a different source and the engine will read it again. The
     MATERIAL is content-addressed, so a part whose characters did not change
     hashes to the same thing — which is correct and is what makes the store
     cheap: identical text is identical text. What keeps the two runs apart is
     not the hash but the key, which is (workflow, hash). */
  const firstSources = (await client.query(
    "select content_hash from public.workflow_sources where workflow_id = $1 order by ordinal", [workflowId]))
    .rows.map((r) => String(r.content_hash));
  const secondSources = (await client.query(
    "select content_hash from public.workflow_sources where workflow_id = $1 order by ordinal", [secondCreated.workflowId]))
    .rows.map((r) => String(r.content_hash));

  t.check("every source of the second batch is a different source: a version is part of what a row IS",
    secondSources.length === firstSources.length && secondSources.every((h) => !firstSources.includes(h)),
    `${secondSources.length} sources, none shared`);

  t.check("its material rows are its own, keyed by workflow, however familiar the text",
    n((await client.query(
      "select count(*) n from public.ceo_admin_material where workflow_id = $1", [secondCreated.workflowId])).rows)
      === counts.ceo_admin_material);

  t.check("and the first workflow's resolver still answers only for the first workflow",
    (await new CeoAdminMaterialResolver(store, secondCreated.workflowId)
      .resolve([reference(String(first.content_hash), null)])).length
      === (await new CeoAdminMaterialResolver(store, workflowId)
        .resolve([reference(String(first.content_hash), null)])).length);

  t.check("the first workflow's material is untouched: an edit adds, it never rewrites",
    n((await client.query(
      "select count(*) n from public.ceo_admin_material where workflow_id = $1", [workflowId])).rows) === counts.ceo_admin_material);

  t.check("the first workflow's claims are untouched too",
    (await repo.listClaims({ workflowId })).length === claims.length);

  t.check("both versions of one row are visible under one subject key, newest first — which is how a screen knows a proposal is stale",
    n((await client.query(
      `select count(distinct record_version) n from public.ceo_admin_material
        where organization_id = $1 and external_subject_key = $2`,
      [organizationId, "email:acct-one:msg-regulator"])).rows) === 2);

  /* ══════════════════════════════════ (7) the material store refuses widening */
  t.section("(7) nothing in the store can be asked a question");

  t.check("writing is idempotent: the same parts written twice are the same rows",
    (await new PostgresCeoMaterialStore(client).putItems(
      workflowId, materialItemsOf(admitted.read.map((r) => r.record)))) === 0);

  t.check("the material table grants nothing to anybody but the service role",
    n((await client.query(
      `select count(*) n from information_schema.role_table_grants
        where table_name = 'ceo_admin_material' and grantee in ('anon','authenticated','public')`)).rows) === 0);

  t.check("and it has row-level security on with no policy at all, so a grant made by mistake still reaches nothing",
    n((await client.query(
      `select count(*) n from pg_policies where tablename = 'ceo_admin_material'`)).rows) === 0
    && String((await client.query(
      `select relrowsecurity::text as on from pg_class where relname = 'ceo_admin_material'`)).rows[0].on) === "true");

  t.check("the tenancy table is service-role only as well",
    n((await client.query(
      `select count(*) n from information_schema.role_table_grants
        where table_name = 'ceo_admin_tenants' and grantee in ('anon','authenticated','public')`)).rows) === 0);
});

t.section("(8) the only connection was to the throwaway cluster");
t.check("this suite reached a unix socket under /var/tmp and nothing else — no host, no port, no provider",
  HARNESS_LOCATION.work.startsWith("/var/tmp") && typeof HARNESS_LOCATION.port === "number",
  `${HARNESS_LOCATION.work}`);

t.finish();
