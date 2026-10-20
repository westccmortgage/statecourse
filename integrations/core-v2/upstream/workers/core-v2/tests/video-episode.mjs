/* A DOMAIN WHOSE EVIDENCE IS WATCHED, THROUGH THE ENGINE THAT WAS ALREADY THERE.
 *
 * gates.ts can say a film must be repaired. That is worth nothing until the
 * verdicts it reads are produced the way this engine produces every other piece
 * of evidence: by blind readers, on segments a discoverer found, compared
 * against each other, criticised, arbitrated when they disagree, and accepted or
 * rejected by the kernel before any verdict is composed from them.
 *
 * So this drives the real scheduler over the real pack. Three readers watch each
 * shot, two watch the whole film, and the composed verdict is deterministic code
 * over accepted claims only. Nothing here is video-specific to the kernel: the
 * same scheduler runs the transcripts and the records packs unchanged.
 *
 * The film it runs on is the eighteen-second train film: technically perfect,
 * fifteen hard gates passing, and the letter gone. In memory, on scripted
 * executors, with a manual clock and the network closed.
 */
import { harness, closeNetwork } from "./harness.mjs";
import { syntheticFilmSet } from "../domains/video-episode/fixture.ts";
import { mockExecutors } from "../domains/video-episode/mocks.ts";
import {
  ACCEPTANCE_VERDICT, GATE_VERDICT, OBJECT_CONTINUITY, PACK_ID, TASK, VideoEpisodePack,
  filmGateSubject, filmSubject, objectSlug, readGateSubject, shotGateSubject, shotObjectSubject, shotSubject,
} from "../domains/video-episode/pack.ts";
import { FILM_GATES, SHOT_GATES } from "../domains/video-episode/gates.ts";
import { SyntheticTranscriptsPack } from "../domains/synthetic-transcripts/pack.ts";
import { assemble, manualClock } from "../domains/simulate.ts";
import { KERNEL_TASK_TYPES } from "../kernel/contracts.ts";
import { INDEPENDENCE_GROUPS } from "../kernel/domain.ts";
import { KERNEL_ROLES, RoleRegistry } from "../kernel/roles.ts";
import { completionOf } from "../kernel/completion.ts";

const tripped = closeNetwork();
const t = harness("a film is evidence, and every one of its gates is judged by somebody who watched it");

const sorted = (xs) => [...xs].sort();
const same = (a, b) => a.length === b.length && sorted(a).every((x, i) => sorted(b)[i] === x);

function world(seed, options = {}) {
  const truth = syntheticFilmSet({ seed, ...(options.film ?? {}) });
  const { registry, executors } = mockExecutors(truth, options.mocks ?? {});
  const parts = assemble({ manifest: truth.manifest, pack: new VideoEpisodePack(), executors: registry, clock: manualClock() });
  return { truth, wf: truth.manifest.workflowId, registry, executors, ...parts };
}

async function drive(scheduler, maxTicks = 300) {
  await scheduler.plan();
  for (let i = 0; i < maxTicks; i++) {
    const r = await scheduler.tick();
    if (r.dispatched.length === 0 && r.released === 0 && r.stopped === 0 && r.reconciled === 0 && scheduler.inFlight.size === 0) break;
  }
  return scheduler.runUntilQuiescent();
}

/* ═══════════════════════════ 1 · the pack is a pack */
t.section("the seam, before anything runs");
{
  const pack = new VideoEpisodePack();
  t.check("it is a domain pack with its own roles and none of the kernel's",
    pack.roles.length === 4 && !pack.roles.some((r) => KERNEL_ROLES.some((k) => k.roleKey === r.roleKey)));
  t.check("every one of its task types is namespaced to it",
    Object.values(TASK).every((x) => x.startsWith(`${PACK_ID}:`)));
  t.check("and every task type has an objective",
    same(Object.keys(pack.objectives), Object.values(TASK)));
  t.check("the readers of a film need to see it", 
    pack.roles.filter((r) => r.kind === "analyst").every((r) => r.requiresVisualInput && r.requiresIndependentReading));
  t.check("the verdict is code, not a model",
    pack.roles.find((r) => r.roleKey === "film_verdict_composer").executorKind === "deterministic");
  t.check("a shot reader may claim once per shot gate and no more than that plus its objects",
    pack.roles.find((r) => r.roleKey === "shot_reader").maximumClaims === SHOT_GATES.length + 4);
  /* The registry is the kernel's, and it refuses a pack that collides with it. */
  const registry = new RoleRegistry(pack);
  t.check("the kernel's role registry accepts this pack beside its own roles",
    registry.forTaskType(TASK.readShot).roleKey === "shot_reader"
    && KERNEL_ROLES.every((k) => registry.keys.includes(k.roleKey)));
  let clashed = false;
  try { new RoleRegistry({ ...pack, roles: [...pack.roles, KERNEL_ROLES[0]] }); } catch { clashed = true; }
  t.check("and refuses a pack that redefines one of its own roles", clashed);
}

/* ═══════════════════════════ 2 · the whole run */
t.section("one film, read end to end by the engine that reads sheets and recordings");
const w = world("video/1");
const report = await drive(w.scheduler);
const tasks = await w.repo.listTasks(w.wf);
const claims = await w.repo.listClaims(w.wf);
const segments = await w.repo.listSegments(w.wf);
/* How many blind readers a subject gets is the policy's to say, not this pack's.
   It asks for three and takes what it is given. */
const READERS = Math.min(3, w.policy.maximumIndependentReadersPerSubject);

t.check("the run finished", report.workflow.state === "completed", report.workflow.state);
t.check("the film declared no shots, so every one of them was discovered",
  w.truth.manifest.sources[0].declaredSegments.length === 0 && segments.filter((s) => s.segmentKind === "shot").length === 3);
t.check("the shots are top-level: a shot hangs off the film, not off another shot",
  segments.filter((s) => s.segmentKind === "shot").every((s) => s.parentSegmentId === null));
{
  const packTypes = [...new Set(tasks.map((x) => x.taskType))].filter((x) => x.startsWith(`${PACK_ID}:`));
  const kernelTypes = [...new Set(tasks.map((x) => x.taskType))].filter((x) => !x.startsWith(`${PACK_ID}:`));
  t.check("the only pack task types in the run are this pack's four",
    same(packTypes, Object.values(TASK)), packTypes.join(", "));
  t.check("and every other task type is one of the kernel's own",
    kernelTypes.every((x) => Object.values(KERNEL_TASK_TYPES).includes(x)), kernelTypes.join(", "));
}

t.section("readers watched every shot, and none of them saw another's answer");
{
  const shotReads = tasks.filter((x) => x.taskType === TASK.readShot);
  t.check(`${READERS} readings per shot, ${READERS * 3} in all`, shotReads.length === READERS * 3, `${shotReads.length}`);
  t.check("each shot was read once per independence group the policy allows",
    [0, 1, 2].every((ordinal) => {
      const groups = shotReads.filter((x) => x.subjectKey === shotSubject(0, ordinal)).map((x) => x.independenceGroup);
      return same(groups, INDEPENDENCE_GROUPS.slice(0, READERS));
    }));
  const packets = Object.values(w.executors).flatMap((e) => e.received).filter((p) => p.roleKey === "shot_reader");
  t.check("A SHOT READER WAS HANDED ONE SHOT AND NOTHING ELSE",
    packets.length > 0 && packets.every((p) => p.sources.length === 1 && p.sources[0].segmentId));
  t.check("AND NEVER ANOTHER READER'S CLAIM",
    packets.every((p) => p.context.claims.length === 0),
    `${packets.filter((p) => p.context.claims.length).length} packets carried claims`);
  const filmPackets = Object.values(w.executors).flatMap((e) => e.received).filter((p) => p.roleKey === "film_reader");
  t.check("a film reader was handed every shot at once, which is what a film is",
    filmPackets.length > 0 && filmPackets.every((p) => p.sources.length === 3));
}

t.section("a gate is a subject, because a critic has to know which one it is asked about");
{
  const gateClaims = claims.filter((c) => c.predicate === GATE_VERDICT);
  const shotGates = gateClaims.filter((c) => c.subjectType === "shot_gate");
  const filmGates = gateClaims.filter((c) => c.subjectType === "film_gate");
  t.check("every shot gate was judged by every reader of that shot",
    shotGates.length === 3 * READERS * SHOT_GATES.length, `${shotGates.length}`);
  t.check("every film gate was judged by both readers of the film",
    filmGates.length === 2 * FILM_GATES.length, `${filmGates.length}`);
  t.check("every gate of every shot has its own subject",
    SHOT_GATES.every((gate) => [0, 1, 2].every((ordinal) =>
      shotGates.some((c) => c.subjectKey === shotGateSubject(0, ordinal, gate)))));
  t.check("and every film gate has its own",
    FILM_GATES.every((gate) => filmGates.some((c) => c.subjectKey === filmGateSubject(0, gate))));
  /* The kernel relays only an allow-list of scope keys, so a pack that put the
     gate in the scope would be handing the critic a claim it cannot identify. */
  t.check("NOT ONE GATE VERDICT DEPENDS ON A SCOPE KEY SURVIVING THE PACKET",
    gateClaims.every((c) => Object.keys(c.scope).length === 0));
  t.check("not one gate verdict carries a unit", gateClaims.every((c) => c.unit === null));
  t.check("AND EVERY ONE OF THEM SAYS WHAT WAS SEEN", gateClaims.every((c) => c.anchorIds.length > 0));
  t.check("no gate verdict was rejected: the readers agreed and the critic reopened the shot",
    gateClaims.every((c) => c.status !== "rejected"),
    [...new Set(gateClaims.map((c) => c.status))].join(", "));
  t.check("AND EVERY GATE HAS AN ACCEPTED READING, WHICH IS THE ONLY KIND THE VERDICT READS",
    [...new Set(gateClaims.map((c) => c.subjectKey))].every((subject) =>
      gateClaims.some((c) => c.subjectKey === subject && c.status === "accepted")));
}

t.section("the letter, which no single shot got wrong");
{
  const letter = claims.filter((c) => c.predicate === OBJECT_CONTINUITY);
  const slug = objectSlug("the letter");
  t.check("shot one reports it on screen and shot two reports it gone",
    letter.some((c) => c.subjectKey === shotObjectSubject(0, 0, slug) && c.value.attributes.visible === "yes")
    && letter.some((c) => c.subjectKey === shotObjectSubject(0, 1, slug) && c.value.attributes.visible === "no"));
  t.check("and NEITHER READING IS A FAILED GATE — each shot is correct on its own",
    claims.filter((c) => c.predicate === GATE_VERDICT && c.value.text === "failed").length === 0);

  const verdict = claims.find((c) => c.predicate === ACCEPTANCE_VERDICT);
  t.check("a verdict was composed", Boolean(verdict));
  t.check("THE FILM IS REPAIR_REQUIRED, ON FIFTEEN PASSING GATES",
    verdict?.value.text === "REPAIR_REQUIRED", `${verdict?.value.text}: ${verdict?.value.attributes.because}`);
  t.check("and the reason names the shot the letter went missing in",
    String(verdict?.value.attributes.because ?? "").includes(shotSubject(0, 1)),
    String(verdict?.value.attributes.because ?? "").slice(0, 140));
  t.check("no gate is listed as unsatisfied, because none is",
    verdict?.value.attributes.not_satisfied === null && verdict?.value.attributes.continuity_findings === 1);
  t.check("the verdict names every claim it was computed from",
    (verdict?.inputClaimIds?.length ?? 0) >= SHOT_GATES.length);
  t.check("AND IT IS NOT A SCORE", verdict?.machineConfidence === null && verdict?.unit === null);
  t.check("it was composed by code, not by a model",
    tasks.find((x) => x.taskType === TASK.composeVerdict)?.executorKind !== "model");
}

/* ═══════════════════════════ 3 · a film that is actually fine */
t.section("a film where the letter's exit is shown is ACCEPTED");
{
  const clean = world("video/2", { film: { letterExitShown: true } });
  await drive(clean.scheduler);
  const verdict = (await clean.repo.listClaims(clean.wf)).find((c) => c.predicate === ACCEPTANCE_VERDICT);
  t.check("every gate passes and the object is accounted for: ACCEPTED",
    verdict?.value.text === "ACCEPTED", `${verdict?.value.text}: ${verdict?.value.attributes.because}`);
  t.check("and nothing is listed as unsatisfied", verdict?.value.attributes.not_satisfied === null);
}

t.section("a film nobody watched for the letter is REJECTED, not ACCEPTED");
{
  const blind = world("video/3", { film: { letterWatched: false } });
  await drive(blind.scheduler);
  const verdict = (await blind.repo.listClaims(blind.wf)).find((c) => c.predicate === ACCEPTANCE_VERDICT);
  /* Shot one saw it; nobody answered for shot two. Silence about a letter the
     story is about reads exactly like a letter that stayed put, and that is the
     reading this refuses. */
  t.check("SILENCE ABOUT A STORY-BEARING OBJECT IS NOT A PASS",
    verdict?.value.text === "REJECTED", `${verdict?.value.text}: ${verdict?.value.attributes.because}`);
  t.check("and the film is not merely repairable: nobody has measured it",
    String(verdict?.value.attributes.because ?? "").includes("measured, not repaired"));
}

t.section("a gate no reader could judge is not a gate that passed");
{
  const unjudged = world("video/4", {
    film: { letterExitShown: true, breaks: { "shot:1:action_legible": { pass: null, seen: "the shot is too dark to tell" } } },
  });
  await drive(unjudged.scheduler);
  const all = await unjudged.repo.listClaims(unjudged.wf);
  const verdict = all.find((c) => c.predicate === ACCEPTANCE_VERDICT);
  t.check("the unknown reading is carried as unknown, not as false",
    all.some((c) => c.predicate === GATE_VERDICT
      && readGateSubject(c.subjectKey)?.gate === "action_legible" && !c.value.known));
  t.check("AND THE FILM IS REJECTED: AN UNMEASURED FILM IS MEASURED, NOT REPAIRED",
    verdict?.value.text === "REJECTED", `${verdict?.value.text}: ${verdict?.value.attributes.because}`);
}

t.section("a gate a reader failed is REPAIR_REQUIRED, and the shot is named");
{
  const broken = world("video/5", {
    film: { letterExitShown: true, breaks: { "shot:2:wardrobe_stable": { pass: false, seen: "the coat is a different coat" } } },
  });
  await drive(broken.scheduler);
  const verdict = (await broken.repo.listClaims(broken.wf)).find((c) => c.predicate === ACCEPTANCE_VERDICT);
  t.check("REPAIR_REQUIRED", verdict?.value.text === "REPAIR_REQUIRED",
    `${verdict?.value.text}: ${verdict?.value.attributes.because}`);
  t.check("and the gate and the shot are both named",
    String(verdict?.value.attributes.not_satisfied ?? "").includes("wardrobe_stable")
    && String(verdict?.value.attributes.not_satisfied ?? "").includes(shotSubject(0, 2)),
    String(verdict?.value.attributes.not_satisfied ?? ""));
}

t.section("a whole-film gate no shot could have failed");
{
  const flat = world("video/6", {
    film: { letterExitShown: true, breaks: { "film:story_progresses": { pass: false, seen: "the same moment three times" } } },
  });
  await drive(flat.scheduler);
  const verdict = (await flat.repo.listClaims(flat.wf)).find((c) => c.predicate === ACCEPTANCE_VERDICT);
  t.check("THREE GOOD SHOTS THAT TELL NO STORY ARE REPAIR_REQUIRED",
    verdict?.value.text === "REPAIR_REQUIRED", `${verdict?.value.text}`);
  t.check("and the film gate is what is named",
    String(verdict?.value.attributes.not_satisfied ?? "").includes("film/story_progresses"),
    String(verdict?.value.attributes.not_satisfied ?? ""));
}

/* ═══════════════════════════ 4 · the kernel is still the kernel */
t.section("nothing of this domain reached the kernel");
{
  const pack = new VideoEpisodePack();
  const other = new SyntheticTranscriptsPack();
  t.check("the two packs share not one role key",
    !pack.roles.some((r) => other.roles.some((o) => o.roleKey === r.roleKey)));
  t.check("nor one task type",
    !Object.values(TASK).some((x) => Object.values(other.objectives).includes(x)));
  /* The claim validator is the pack's, and it refuses what this domain does not
     say — including a verdict dressed up as a number. */
  const problems = pack.validateClaim(
    { taskType: TASK.readShot, subjectKey: shotSubject(0, 0) },
    { claimKey: "x", subjectType: "shot_gate", subjectKey: shotGateSubject(0, 0, "action_legible"), predicate: GATE_VERDICT,
      value: { known: true, quantity: 0.82, text: "0.82" }, unit: "score", scope: {}, anchorKeys: ["a"], machineConfidence: null },
    null);
  t.check("A SCORE IS NOT A GATE VERDICT", problems.length >= 2, problems.join(" | "));
  t.check("and a gate this domain does not have is refused",
    pack.validateClaim({ taskType: TASK.readShot, subjectKey: shotSubject(0, 0) },
      { claimKey: "x", subjectType: "shot_gate", subjectKey: shotGateSubject(0, 0, "looks_nice"), predicate: GATE_VERDICT,
        value: { known: true, quantity: null, text: "passed" }, unit: null, scope: {},
        anchorKeys: ["a"], machineConfidence: null }, null)
      .some((p) => p.includes("not one of this pack's shot gates")));
  t.check("a verdict with nothing to point at is refused",
    pack.validateClaim({ taskType: TASK.readFilm, subjectKey: filmSubject(0) },
      { claimKey: "x", subjectType: "film_gate", subjectKey: filmGateSubject(0, "story_progresses"), predicate: GATE_VERDICT,
        value: { known: true, quantity: null, text: "passed" }, unit: null, scope: {},
        anchorKeys: [], machineConfidence: null }, null)
      .some((p) => p.includes("anchors to the film")));
  t.check("a shot gate dressed up as a film gate is refused",
    pack.validateClaim({ taskType: TASK.readFilm, subjectKey: filmSubject(0) },
      { claimKey: "x", subjectType: "film_gate", subjectKey: shotGateSubject(0, 0, "story_progresses"), predicate: GATE_VERDICT,
        value: { known: true, quantity: null, text: "passed" }, unit: null, scope: {},
        anchorKeys: ["a"], machineConfidence: null }, null)
      .some((p) => p.includes("does not name a gate of the whole film")));
  t.check("and a continuity observation that names no object is refused",
    pack.validateClaim({ taskType: TASK.readShot, subjectKey: shotSubject(0, 0) },
      { claimKey: "x", subjectType: "shot_object", subjectKey: shotObjectSubject(0, 0, "the-letter"), predicate: OBJECT_CONTINUITY,
        value: { known: true, quantity: null, text: "visible", attributes: { visible: "yes" } }, unit: null, scope: {},
        anchorKeys: ["a"], machineConfidence: null }, null)
      .some((p) => p.includes("names the object it is about")));
}

t.section("every door stayed closed");
t.check("nothing in this file tried the network", tripped() === 0, `${tripped()} attempts`);
t.finish();
