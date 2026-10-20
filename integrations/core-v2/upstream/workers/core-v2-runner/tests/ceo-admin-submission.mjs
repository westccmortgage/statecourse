/* THE DOOR BETWEEN TWO SYSTEMS, AND THE STAGE BEFORE THE ENGINE.
 *
 * Two things are proved here and they are different things.
 *
 * THE DOOR. A submission from the Admin becomes a manifest, or it becomes a
 * refusal naming the rule it broke — and the refusals are the point, because
 * every one of them is a workflow that would otherwise have been created,
 * failed its own material check on every pass, and waited for somebody to go
 * and find it.
 *
 * THE STAGE BEFORE. A mailbox is mostly circulars, and an engine that reads
 * every one of them twice is an engine nobody can afford to switch on. Stage
 * zero is code, its rules are about envelopes rather than about meaning, and
 * what it drops it names.
 *
 * Nothing here opens a socket, reaches a database, or constructs anything
 * that could spend.
 */
import { harness, closeNetwork } from "../../core-v2/tests/harness.mjs";
import { FIXTURE_PROJECTS, FIXTURE_RECORDS, FIXTURE_TODAY } from "../../core-v2/domains/ceo-admin/fixture.ts";
import { SOURCE_CONTRACT_VERSION } from "../../core-v2/domains/ceo-admin/records.ts";
import { CeoAdminPack } from "../../core-v2/domains/ceo-admin/pack.ts";
import { RoleRegistry } from "../../core-v2/kernel/roles.ts";
import { estimateCalls, triage, triageBatch } from "../ceo-admin/triage.ts";
import {
  InMemoryCeoMaterialStore, MAXIMUM_RECORDS, admit, isSubmissionRefusal,
  notReadReport, packOptionsOfScope, parseSubmission, workflowIdFor,
} from "../ceo-admin/submission.ts";

const tripped = closeNetwork();
const t = harness("the door the Admin's records come through, and the stage before the engine");

const ORG = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";

const submission = (over = {}) => ({
  domain: "ceo_admin",
  contractVersion: SOURCE_CONTRACT_VERSION,
  organizationId: ORG,
  batchId: "morning-2031-03-17",
  capturedAt: "2031-03-17T08:00:00Z",
  today: FIXTURE_TODAY,
  projectKeys: FIXTURE_PROJECTS,
  records: FIXTURE_RECORDS.map((r) => ({ ...r.input })),
  conflictPairs: [{ calendar: "calendar:cal-one:evt-one", task: "task:11111111-1111-4111-8111-111111111111" }],
  ...over,
});

const parsed = (over = {}) => {
  const out = parseSubmission(submission(over));
  if (isSubmissionRefusal(out)) throw new Error(`the fixture submission was refused: ${out.refused}`);
  return out;
};

/* ════════════════════════════════ (1) what the door takes and what it refuses */
t.section("(1) a submission is checked before a workflow exists, never after");

{
  t.check("a well-formed submission parses", !isSubmissionRefusal(parseSubmission(submission())));

  const refusals = [
    ["another domain's submission", { domain: "something_else" }],
    ["a contract version this door does not speak", { contractVersion: "ceo-admin.source.99" }],
    ["no organization", { organizationId: "not-a-uuid" }],
    ["no batch name, which is the whole of idempotency", { batchId: "  " }],
    ["a capture time that is not an instant", { capturedAt: "this morning" }],
    ["a date that is not a date", { today: "17 March" }],
    ["no taxonomy at all — an absent list is different from an empty one", { projectKeys: null }],
    ["no records", { records: [] }],
    ["more records than this door carries", { records: Array.from({ length: MAXIMUM_RECORDS + 1 }, () => FIXTURE_RECORDS[0].input) }],
    ["a record of a kind this domain does not know", { records: [{ ...FIXTURE_RECORDS[0].input, sourceType: "invoice" }] }],
  ];
  for (const [what, over] of refusals) {
    const out = parseSubmission(submission(over));
    t.check(`refused at the door: ${what}`, isSubmissionRefusal(out),
      isSubmissionRefusal(out) ? out.refused.slice(0, 80) : "ADMITTED");
  }

  t.check("an empty taxonomy is allowed and is not the same as a missing one: a caller may ask for no project at all",
    !isSubmissionRefusal(parseSubmission(submission({ projectKeys: [] }))));
  t.check("a null date is allowed: it asks for no questions about time and no ordering",
    !isSubmissionRefusal(parseSubmission(submission({ today: null }))));
}

/* ══════════════════════════════════════ (2) a record the engine cannot carry */
t.section("(2) a record with no stable identity or version never becomes a source");

{
  const unversioned = admit(parsed({ records: [{ ...FIXTURE_RECORDS[6].input, recordVersion: "" }] }));
  t.check("a record with no version is refused, and the refusal names it",
    isSubmissionRefusal(unversioned) && unversioned.detail.some((d) => /version/.test(d)),
    isSubmissionRefusal(unversioned) ? unversioned.detail[0].slice(0, 90) : "ADMITTED");

  const unnamed = admit(parsed({ records: [{ ...FIXTURE_RECORDS[6].input, identity: {} }] }));
  t.check("a record with no identity is refused: there would be nowhere to carry the answer back to",
    isSubmissionRefusal(unnamed));

  /* TWO ROWS, ONE NAME — refused, never merged. */
  const one = FIXTURE_RECORDS.find((r) => r.name === "a message from a body that makes rules").input;
  const collision = admit(parsed({
    records: [one, { ...one, recordVersion: "2", fields: { ...one.fields, subject: "a different subject" } }],
  }));
  t.check("two records that would answer to one subject key are refused — both of them, by name, and never quietly merged",
    isSubmissionRefusal(collision) && /one subject key/.test(collision.refused),
    isSubmissionRefusal(collision) ? collision.detail[0].slice(0, 100) : "ADMITTED");

  const nothingLeft = admit(parsed({
    records: [FIXTURE_RECORDS.find((r) => r.name === "a circular with an unsubscribe footer").input],
  }));
  t.check("a batch every rule settles before any reading is refused rather than becoming a workflow with nothing to do",
    isSubmissionRefusal(nothingLeft) && /nothing for a workflow to do/.test(nothingLeft.refused));
}

/* ═════════════════════════════════════════════ (3) the same batch, one workflow */
t.section("(3) a retry is the same workflow, whatever order the list arrived in");

{
  const first = admit(parsed());
  const again = admit(parsed());
  t.check("the same batch admitted twice names one workflow",
    !isSubmissionRefusal(first) && first.workflowId === again.workflowId, first.workflowId);

  const shuffled = admit(parsed({ records: [...FIXTURE_RECORDS].reverse().map((r) => ({ ...r.input })) }));
  t.check("the same records serialised in the opposite order name the same workflow and the same sources",
    shuffled.workflowId === first.workflowId
    && shuffled.manifest.sources.map((s) => s.contentHash).join() === first.manifest.sources.map((s) => s.contentHash).join());

  const other = admit(parsed({ batchId: "afternoon-2031-03-17" }));
  t.check("a different batch name is a different workflow, so a caller can deliberately read the same desk twice",
    other.workflowId !== first.workflowId);

  t.check("the workflow id is derived from the organization and the batch alone, and says so",
    workflowIdFor(ORG, "morning-2031-03-17") === first.workflowId);

  t.check("a record added to a retried batch does not create a second workflow over almost the same material",
    admit(parsed({ records: FIXTURE_RECORDS.slice(0, 6).map((r) => ({ ...r.input })) })).workflowId === first.workflowId);
}

/* ══════════════════════════════════════════════ (4) what the manifest carries */
t.section("(4) the manifest says what was read and what the pack must be rebuilt from");

{
  const admitted = admit(parsed());
  const { manifest } = admitted;

  t.check("the manifest names this pack and this pack's version",
    manifest.domainPack === "ceo-admin" && manifest.domainPackVersion === "1.0");

  t.check("every source carries its subject, its kind and its version where the pack can read them without re-parsing a name",
    manifest.sources.every((s) => s.media.subject_key && s.media.source_type && s.media.record_version));

  t.check("no source carries an address, a token or anything anybody could fetch with",
    manifest.sources.every((s) => !/https?:|token|signature|bearer/i.test(s.uri + JSON.stringify(s.media))));

  t.check("the material offered is exactly the parts the sources declared, by the hash each was declared under",
    admitted.material.size === manifest.sources.reduce((n, s) => n + s.declaredSegments.length, 0));

  /* THE PACK, REBUILT TOMORROW, FROM WHAT THE WORKFLOW ITSELF SAYS. */
  const options = packOptionsOfScope(manifest.requestedScope);
  t.check("the workflow's own scope rebuilds the pack: the taxonomy and the date it was started under, not today's",
    !isSubmissionRefusal(options) && options.today === FIXTURE_TODAY
    && options.projectKeys.join() === [...FIXTURE_PROJECTS].join()
    && options.conflictPairs.length === 1);

  const rebuilt = new CeoAdminPack(options);
  t.check("the rebuilt pack is a pack the registry admits",
    new RoleRegistry(rebuilt).assertConsistent().length === 0);

  t.check("a workflow planned under a contract version this runner does not speak is refused rather than continued under a guess",
    isSubmissionRefusal(packOptionsOfScope({ ...manifest.requestedScope, contract_version: "ceo-admin.source.99" })));

  /* A PAIR NAMING SOMETHING OUTSIDE THE BATCH. */
  const outside = admit(parsed({ conflictPairs: [{ calendar: "calendar:cal-one:evt-nine", task: "task:nothing" }] }));
  t.check("a pair naming a record this batch does not carry is dropped rather than refused, and the scope says which pairs survived",
    outside.manifest.requestedScope.conflict_pairs.length === 0);
}

/* ══════════════════════════════════════════════════════ (5) stage zero */
t.section("(5) the readings nobody should buy are not bought, and what was dropped is named");

{
  const today = FIXTURE_TODAY;
  const circular = FIXTURE_RECORDS.find((r) => r.name === "a circular with an unsubscribe footer").input;
  const regulator = FIXTURE_RECORDS.find((r) => r.name === "a message from a body that makes rules").input;
  const injection = FIXTURE_RECORDS.find((r) => r.name === "a message that tries to give the engine instructions").input;

  t.check("a circular that identifies itself as bulk and was not addressed to the owner is not read",
    triage(circular, { today }).keep === false, triage(circular, { today }).rule);
  t.check("and the Admin is told what to show instead — a proposal, never an act performed on the message",
    triage(circular, { today }).proposedAttention === "noise");

  t.check("a notice from a body that makes rules is read",
    triage(regulator, { today }).keep === true);

  /* THE RULE THAT MATTERS MOST HERE. */
  t.check("the message trying to instruct the engine is READ, not dropped: triage decides what is worth an opinion, never what is dangerous to look at",
    triage(injection, { today }).keep === true);

  t.check("a circular addressed to the owner personally is read: bulk plus impersonal is the rule, and bulk alone is not",
    triage({ ...circular, fields: { ...circular.fields, direct_to_owner: "true" } }, { today }).keep === true);

  t.check("a row the Admin has already closed has nothing left to settle",
    triage({ ...FIXTURE_RECORDS[7].input, fields: { ...FIXTURE_RECORDS[7].input.fields, status: "done" } }, { today }).keep === false);

  t.check("an appointment that has already happened is not read",
    triage({
      ...FIXTURE_RECORDS.find((r) => r.name === "an appointment that takes the morning the urgent work needs").input,
      fields: { title: "a thing", starts_at: "2031-01-02T08:00:00Z", ends_at: "2031-01-02T09:00:00Z" },
    }, { today }).keep === false);

  t.check("a message older than this engine reads, that nobody has flagged, is not read",
    triage({ ...regulator, fields: { ...regulator.fields, received_at: "2030-01-01T00:00:00Z" } }, { today }).keep === false);
  t.check("and one that somebody HAS flagged still is",
    triage({ ...regulator, fields: { ...regulator.fields, received_at: "2030-01-01T00:00:00Z", flagged: "true" } }, { today }).keep === true);

  t.check("every rule decides from the envelope of a row — a header, a date, a state — and never from what the row says",
    triage({ ...circular, text: "URGENT PLEASE READ THIS IMMEDIATELY" }, { today }).keep === false);

  const batch = triageBatch(FIXTURE_RECORDS.map((r) => r.input), { today });
  t.check("the fixture desk triages exactly as it was written to: one circular dropped and everything else read",
    batch.dropped.length === 1 && batch.kept.length === FIXTURE_RECORDS.length - 1,
    `${batch.kept.length} read, ${batch.dropped.length} not read`);

  const report = notReadReport(admit(parsed()));
  t.check("what was never read is reported with the rule that decided it, so nobody has to guess why an engine was silent about something",
    report.length === 1 && report[0].rule === "bulk_mail_not_addressed_to_the_owner" && report[0].proposedAttention === "noise",
    JSON.stringify(report));

  t.check("the fixture's expectation of what is worth reading and the triage's verdict agree on every row",
    FIXTURE_RECORDS.every((r) => triage(r.input, { today }).keep === r.truth.worthReading));
}

/* ════════════════════════════════════════════ (6) what a batch will cost */
t.section("(6) the amplification is counted before anything is authorised, not after");

{
  const estimate = estimateCalls(
    { records: FIXTURE_RECORDS.map((r) => r.input), today: FIXTURE_TODAY, conflictPairs: 1 },
    { today: FIXTURE_TODAY });

  t.check("the estimate says how many rows arrived and how many were settled before any reading",
    estimate.records === FIXTURE_RECORDS.length && estimate.droppedBeforeReading === 1,
    JSON.stringify(estimate));

  t.check("every subject is read twice, and every reading is criticised once",
    estimate.readings === estimate.criticisms && estimate.readings % 2 === 0);

  t.check("the worst case is larger than the expected case, because verification and arbitration happen only where readers differ",
    estimate.modelCallsAtWorst > estimate.modelCallsExpected,
    `${estimate.modelCallsExpected} expected, ${estimate.modelCallsAtWorst} at worst`);

  const withoutTriage = estimateCalls(
    { records: FIXTURE_RECORDS.map((r) => r.input), today: FIXTURE_TODAY, conflictPairs: 1 },
    { today: FIXTURE_TODAY, staleAfterDays: 100_000 });
  void withoutTriage;

  /* THE NUMBER THE COST DESIGN EXISTS FOR.
     A hundred circulars must not become four hundred paid calls. */
  const circular = FIXTURE_RECORDS.find((r) => r.name === "a circular with an unsubscribe footer").input;
  const mostlyNoise = Array.from({ length: 100 }, (_, i) => ({
    ...circular, identity: { accountId: "acct-one", providerMessageId: `bulk-${i}` },
  }));
  const noiseEstimate = estimateCalls({ records: mostlyNoise, today: FIXTURE_TODAY }, { today: FIXTURE_TODAY });
  t.check("a hundred circulars cost nothing at all: not one of them reaches a reader",
    noiseEstimate.droppedBeforeReading === 100 && noiseEstimate.modelCallsAtWorst === 0,
    JSON.stringify(noiseEstimate));

  const oneReal = estimateCalls(
    { records: [FIXTURE_RECORDS.find((r) => r.name === "a message from a body that makes rules").input], today: null },
    { today: FIXTURE_TODAY });
  t.check("one message that is worth reading costs two readings, two criticisms and one composition — and at worst two more",
    oneReal.readings === 2 && oneReal.criticisms === 2 && oneReal.compositions === 1
    && oneReal.modelCallsExpected === 5 && oneReal.modelCallsAtWorst === 7,
    JSON.stringify(oneReal));

  t.check("asking no questions about time removes the day's ordering and the commitment readings from the bill",
    estimateCalls({ records: FIXTURE_RECORDS.map((r) => r.input), today: null }, { today: FIXTURE_TODAY })
      .modelCallsExpected < estimate.modelCallsExpected);
}

/* ══════════════════════════════════════════════════ (7) the material store */
t.section("(7) the text a reader saw is kept by the engine, addressed by its hash");

{
  const admitted = admit(parsed());
  const store = new InMemoryCeoMaterialStore();
  await store.put(admitted.workflowId, admitted.material);

  const [hash, text] = [...admitted.material.entries()][0];
  t.check("material written with the workflow is readable by the hash it was declared under",
    (await store.get(admitted.workflowId, hash)) === text);

  t.check("a hash this workflow never declared is not answered, whoever asks",
    (await store.get(admitted.workflowId, "0".repeat(64))) === null);

  t.check("another workflow's hash is not answered from this workflow either",
    (await store.get(workflowIdFor(ORG, "some-other-batch"), hash)) === null);

  /* WHY THE ENGINE KEEPS IT RATHER THAN ASKING AGAIN. */
  const laterVersionOfTheSameRow = admit(parsed({
    batchId: "afternoon-2031-03-17",
    records: FIXTURE_RECORDS.map((r) => ({ ...r.input, recordVersion: "2" })),
  }));
  t.check("the same rows at a later version hash to different material, so a resolver that asked the Admin again would hand a critic text no reader ever saw",
    [...laterVersionOfTheSameRow.material.keys()].every((h) => !admitted.material.has(h))
    || [...laterVersionOfTheSameRow.manifest.sources].every((s) => !admitted.manifest.sources.some((o) => o.contentHash === s.contentHash)));
}

/* ═════════════════════════════════════════ (8) nothing of anybody's, again */
t.section("(8) the door names no company and reaches nothing");

{
  t.check("the taxonomy crosses the boundary as data on every submission, and the door holds no default for it",
    parsed({ projectKeys: ["only_this"] }).projectKeys.join() === "only_this");

  t.check("nothing in this suite tried to reach a network", tripped() === 0, `${tripped()} attempts`);
}

t.finish();
