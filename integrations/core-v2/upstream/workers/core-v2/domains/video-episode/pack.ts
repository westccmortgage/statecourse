/* VIDEO EPISODE: THE FIRST DOMAIN WHOSE EVIDENCE IS WATCHED.
 *
 * The other packs read sheets, rows and time ranges. This one reads a film, and
 * that changes nothing about the kernel: a shot is a segment, a gate verdict is
 * a claim about it, two blind readers judge each gate independently, the kernel
 * compares them, a critic and an arbiter settle a disagreement, and the verdict
 * on the whole film is deterministic code over accepted claims.
 *
 * WHAT THIS PACK DOES NOT DO is score. gates.ts holds fifteen hard gates and
 * every one of them is required; a reader reports pass or fail with what it saw,
 * and a film that fails one is REPAIR_REQUIRED however well it did on the other
 * fourteen. `machineConfidence` is reported because the envelope has the field
 * and nothing in this pack reads it.
 *
 * The continuity of a story-bearing object is a second predicate rather than a
 * sixteenth gate, because it is not a verdict about a shot: it is three
 * observations per shot — was the object visible, was it the same object, and
 * was a change accounted for on screen — that only mean something in sequence.
 * The deriver puts the sequence together. That is how the letter in the train
 * film is caught: no single shot is wrong, and the pair of them is.
 */
import type {
  AgentResultEnvelope, AgentRoleDefinition, ClaimRecord, ProposedClaim, SegmentRecord, SourceDescriptor,
  TaskRecord, WorkPacket,
} from "../../kernel/contracts.ts";
import { KERNEL_TASK_TYPES } from "../../kernel/contracts.ts";
import { DEFAULT_NORMALISERS } from "../../kernel/comparison.ts";
import { emptyEnvelope } from "../../kernel/deterministic.ts";
import type { DomainPack, ExpansionInput, TaskSpec } from "../../kernel/domain.ts";
import { INDEPENDENCE_GROUPS } from "../../kernel/domain.ts";
import { FILM_GATES, SHOT_GATES, reviewFilm, type FilmEvidence, type ObjectTrace, type Verdict } from "./gates.ts";

export const PACK_ID = "video-episode";
export const PACK_VERSION = "1.0";

export const TASK = {
  discoverShots: `${PACK_ID}:discover_shots`,
  readShot: `${PACK_ID}:read_shot`,
  readFilm: `${PACK_ID}:read_film`,
  composeVerdict: `${PACK_ID}:compose_verdict`,
} as const;

/* The predicates. Two, and the second is the one no single shot can answer. */
export const GATE_VERDICT = "gate_verdict";
export const OBJECT_CONTINUITY = "object_continuity";
export const ACCEPTANCE_VERDICT = "acceptance_verdict";

export const ROLES: AgentRoleDefinition[] = [
  {
    roleKey: "shot_discoverer", version: "1.0", kind: "discoverer", phase: "discover", taskTypes: [TASK.discoverShots],
    description: "Finds the shots of one film as time ranges. Judges nothing.",
    inputContract: "one film", outputContract: "shot segments with time ranges",
    maximumSources: 1, maximumClaims: 0, maximumFollowUpDepth: 0, requiresVisualInput: true, requiresIndependentReading: false,
    allowedActions: [], routingProfile: "visual_analysis", executorKind: "model",
    producesAssessments: false, producesAdjudication: false, producesDecisions: false, producesCalculations: false, producesSegments: true,
  },
  {
    roleKey: "shot_reader", version: "1.0", kind: "analyst", phase: "analyze", taskTypes: [TASK.readShot],
    description: "Watches one shot blind and judges every per-shot gate on it, plus what the story's objects do in it.",
    inputContract: "one shot segment",
    outputContract: "one pass-or-fail gate verdict per shot gate, each with what was seen, and one continuity observation per story-bearing object",
    /* Every gate, plus room for the objects a shot can carry. A reader that
       needs more than this is being asked to judge more than one shot. */
    maximumSources: 1, maximumClaims: SHOT_GATES.length + 4, maximumFollowUpDepth: 1,
    requiresVisualInput: true, requiresIndependentReading: true,
    allowedActions: ["read_related_segment", "open_linked_segment", "request_human_review"],
    routingProfile: "visual_analysis", executorKind: "model",
    producesAssessments: false, producesAdjudication: false, producesDecisions: false, producesCalculations: false, producesSegments: false,
  },
  {
    roleKey: "film_reader", version: "1.0", kind: "analyst", phase: "analyze", taskTypes: [TASK.readFilm],
    description: "Watches the whole film blind and judges the gates that only the whole film can answer.",
    inputContract: "every shot of one film, in order",
    outputContract: "one pass-or-fail gate verdict per film gate, each with what was seen",
    maximumSources: 32, maximumClaims: FILM_GATES.length, maximumFollowUpDepth: 1,
    requiresVisualInput: true, requiresIndependentReading: true,
    allowedActions: ["read_related_segment", "request_human_review"],
    routingProfile: "visual_analysis", executorKind: "model",
    producesAssessments: false, producesAdjudication: false, producesDecisions: false, producesCalculations: false, producesSegments: false,
  },
  {
    roleKey: "film_verdict_composer", version: "1.0", kind: "deriver", phase: "derive", taskTypes: [TASK.composeVerdict],
    description: "Turns the accepted gate verdicts of one film into ACCEPTED, REPAIR_REQUIRED or REJECTED. Code; names every input.",
    inputContract: "accepted gate verdicts and continuity observations",
    outputContract: "one acceptance verdict naming every gate that was not satisfied",
    maximumSources: 0, maximumClaims: 1, maximumFollowUpDepth: 0, requiresVisualInput: false, requiresIndependentReading: false,
    allowedActions: [], routingProfile: "deterministic", executorKind: "deterministic",
    producesAssessments: false, producesAdjudication: false, producesDecisions: false, producesCalculations: false, producesSegments: false,
  },
];

export const OBJECTIVES: Record<string, string> = {
  [TASK.discoverShots]: "Find every shot of this film. Return each as a segment with a time range. Judge nothing about what is in them.",
  [TASK.readShot]:
    "Watch this shot. For each gate named in the packet, say whether it passes or fails and what in the shot made you say so. "
    + "A gate you cannot judge from this shot fails: say that you could not see it. For each story-bearing object named in the packet, "
    + "say whether it is visible, whether it is the same object it was, and whether anything on screen accounts for a change.",
  [TASK.readFilm]:
    "Watch these shots in order as one film. For each gate named in the packet, say whether it passes or fails and what in the film "
    + "made you say so. Judge the film, not the shots: a film of three good shots that tell no story fails.",
  [TASK.composeVerdict]: "Turn the accepted gate verdicts of this film into one acceptance verdict. Name every gate that was not satisfied.",
};

/* The subjects. A film is one source and its shots are its segments, so the film
   and the shot are the obvious two — but a gate verdict is not about a shot: it
   is about ONE GATE of one shot, and that has to be in the subject key rather
   than in the claim's scope.
   
   The reason is the kernel's, and it is a good one. A reader may write anything
   into a scope, including who it is, so the packet builder relays only a short
   allow-list of scope keys and drops the rest. The first version of this pack
   put the gate in `scope.gate`; it never reached the critic, which therefore
   found nothing in the source for a claim it could not identify, and every
   corroborated gate verdict was rejected. The subject is where a domain says
   what a claim is about. */
export const filmSubject = (ordinal: number) => `film/${ordinal}`;
export const shotSubject = (ordinal: number, shot: number) => `film/${ordinal}/shot/${shot}`;
export const shotGateSubject = (ordinal: number, shot: number, gate: string) =>
  `${shotSubject(ordinal, shot)}/gate/${gate}`;
export const filmGateSubject = (ordinal: number, gate: string) => `${filmSubject(ordinal)}/gate/${gate}`;
export const shotObjectSubject = (ordinal: number, shot: number, slug: string) =>
  `${shotSubject(ordinal, shot)}/object/${slug}`;

export const objectSlug = (object: string) => object.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/* The gate a subject key names, and the shot it belongs to when it has one. */
export function readGateSubject(subjectKey: string): { shot: string | null; gate: string } | null {
  const cut = subjectKey.lastIndexOf("/gate/");
  if (cut < 0) return null;
  const owner = subjectKey.slice(0, cut);
  return { shot: owner.includes("/shot/") ? owner : null, gate: subjectKey.slice(cut + "/gate/".length) };
}

export function readObjectSubject(subjectKey: string): { shot: string; slug: string } | null {
  const cut = subjectKey.lastIndexOf("/object/");
  if (cut < 0) return null;
  return { shot: subjectKey.slice(0, cut), slug: subjectKey.slice(cut + "/object/".length) };
}

export class VideoEpisodePack implements DomainPack {
  readonly id = PACK_ID;
  readonly version = PACK_VERSION;
  readonly roles = ROLES;
  readonly objectives = OBJECTIVES;

  discovererFor(source: SourceDescriptor): string | null {
    return source.sourceKind === "film" ? "shot_discoverer" : null;
  }

  expand(input: ExpansionInput): TaskSpec[] {
    const specs: TaskSpec[] = [];
    const shots = input.segments.filter((s) => s.segmentKind === "shot" && s.status === "accepted");
    const ordinalOf = (sourceId: string) => input.manifest.sources.find((x) => x.sourceId === sourceId)?.ordinal ?? 0;
    const bySource = new Map<string, SegmentRecord[]>();
    for (const shot of shots) bySource.set(shot.sourceId, [...(bySource.get(shot.sourceId) ?? []), shot]);

    for (const [sourceId, list] of bySource) {
      const ordered = [...list].sort((a, b) => a.ordinal - b.ordinal);
      const film = filmSubject(ordinalOf(sourceId));
      const everyReader: string[] = [];
      const everyCompare: string[] = [];

      /* THREE readers per shot, not two. A per-shot gate is the judgement most
         worth disagreeing about, and the kernel can only see a disagreement it
         was given enough readers to find. */
      const shotGroups = INDEPENDENCE_GROUPS.slice(0, Math.min(3, input.policy.maximumIndependentReadersPerSubject));
      for (const shot of ordered) {
        const subject = shotSubject(ordinalOf(sourceId), shot.ordinal);
        const keys = shotGroups.map((g) => `shot:${shot.segmentId}:${g}`);
        shotGroups.forEach((group, i) => specs.push({
          key: keys[i], phase: "analyze", taskType: TASK.readShot, roleKey: "shot_reader", subjectKey: subject,
          sources: [{ sourceId: null, segmentId: shot.segmentId }], independenceGroup: group, priority: 100,
          dependsOn: [], dependsOnTaskIds: [],
        }));
        const compare = `compare-shot:${shot.segmentId}`;
        specs.push({
          key: compare, phase: "compare", taskType: KERNEL_TASK_TYPES.compare, roleKey: "claim_comparator",
          subjectKey: subject, sources: [], independenceGroup: null, priority: 200,
          dependsOn: keys.map((k) => ({ key: k, kind: "requires_claims" as const })), dependsOnTaskIds: [],
        });
        everyReader.push(...keys); everyCompare.push(compare);
      }

      /* The whole film, read by two readers who are handed every shot at once.
         Nothing about a single shot can answer whether the story progresses. */
      const filmGroups = INDEPENDENCE_GROUPS.slice(0, Math.min(2, input.policy.maximumIndependentReadersPerSubject));
      const filmKeys = filmGroups.map((g) => `film:${sourceId}:${g}`);
      filmGroups.forEach((group, i) => specs.push({
        key: filmKeys[i], phase: "analyze", taskType: TASK.readFilm, roleKey: "film_reader", subjectKey: film,
        sources: ordered.map((shot) => ({ sourceId: null, segmentId: shot.segmentId })),
        independenceGroup: group, priority: 150, dependsOn: [], dependsOnTaskIds: [],
      }));
      const filmCompare = `compare-film:${sourceId}`;
      specs.push({
        key: filmCompare, phase: "compare", taskType: KERNEL_TASK_TYPES.compare, roleKey: "claim_comparator",
        subjectKey: film, sources: [], independenceGroup: null, priority: 250,
        dependsOn: filmKeys.map((k) => ({ key: k, kind: "requires_claims" as const })), dependsOnTaskIds: [],
      });
      everyReader.push(...filmKeys); everyCompare.push(filmCompare);

      /* The verdict waits for every comparison, not merely for every reading. A
         verdict composed while two readers still disagree is a verdict about
         evidence nobody has settled. */
      const discovered = input.tasks.some((t) => t.taskType === TASK.discoverShots && t.state === "completed"
        && t.sources.some((s) => s.sourceId === sourceId));
      if (discovered && everyReader.length) {
        specs.push({
          key: `verdict:${sourceId}`, phase: "derive", taskType: TASK.composeVerdict,
          roleKey: "film_verdict_composer", subjectKey: film, sources: [], independenceGroup: null, priority: 500,
          dependsOn: [
            ...everyReader.map((k) => ({ key: k, kind: "requires_claims" as const })),
            ...everyCompare.map((k) => ({ key: k, kind: "requires_completion" as const })),
          ],
          dependsOnTaskIds: [],
        });
      }
    }
    return specs;
  }

  decisionSubjects(claims: ClaimRecord[]): string[] {
    return [...new Set(claims.filter((c) => c.status === "accepted" && c.subjectType === "film").map((c) => c.subjectKey))].sort();
  }

  validateClaim(packet: WorkPacket, claim: ProposedClaim, _envelope: AgentResultEnvelope): string[] {
    const problems: string[] = [];
    if (packet.taskType === TASK.readShot) {
      if (claim.predicate === GATE_VERDICT) {
        const named = readGateSubject(claim.subjectKey);
        if (claim.subjectType !== "shot_gate") problems.push(`claim ${claim.claimKey}: the subject of a shot gate verdict is that gate of that shot`);
        if (!named?.shot) problems.push(`claim ${claim.claimKey}: ${claim.subjectKey} does not name a gate of a shot`);
        else if (!SHOT_GATES.includes(named.gate as (typeof SHOT_GATES)[number])) {
          problems.push(`claim ${claim.claimKey}: ${named.gate} is not one of this pack's shot gates`);
        }
        problems.push(...this.#verdictShape(claim));
      } else if (claim.predicate === OBJECT_CONTINUITY) {
        if (claim.subjectType !== "shot_object") problems.push(`claim ${claim.claimKey}: a continuity observation is about one object in one shot`);
        if (!readObjectSubject(claim.subjectKey)) problems.push(`claim ${claim.claimKey}: ${claim.subjectKey} does not name an object in a shot`);
        if (!claim.value.attributes?.object) problems.push(`claim ${claim.claimKey}: a continuity observation names the object it is about`);
        const visible = claim.value.attributes?.visible;
        if (visible !== "yes" && visible !== "no") {
          problems.push(`claim ${claim.claimKey}: visible is yes or no, not ${String(visible)}`);
        }
      } else {
        problems.push(`claim ${claim.claimKey}: a shot reader reports ${GATE_VERDICT} or ${OBJECT_CONTINUITY}`);
      }
    } else if (packet.taskType === TASK.readFilm) {
      const named = readGateSubject(claim.subjectKey);
      if (claim.predicate !== GATE_VERDICT) problems.push(`claim ${claim.claimKey}: a film reader reports ${GATE_VERDICT}`);
      if (claim.subjectType !== "film_gate") problems.push(`claim ${claim.claimKey}: the subject of a film gate verdict is that gate of the film`);
      if (!named || named.shot) problems.push(`claim ${claim.claimKey}: ${claim.subjectKey} does not name a gate of the whole film`);
      else if (!FILM_GATES.includes(named.gate as (typeof FILM_GATES)[number])) {
        problems.push(`claim ${claim.claimKey}: ${named.gate} is not one of this pack's film gates`);
      }
      problems.push(...this.#verdictShape(claim));
    } else if (packet.taskType === TASK.composeVerdict) {
      if (claim.predicate !== ACCEPTANCE_VERDICT || claim.subjectType !== "film") {
        problems.push(`claim ${claim.claimKey}: the composed verdict is ${ACCEPTANCE_VERDICT} of a film`);
      }
    } else if (packet.taskType.startsWith(`${PACK_ID}:`)) {
      problems.push(`claim ${claim.claimKey}: ${packet.taskType} produces no claims`);
    }
    return problems;
  }

  /* A gate verdict is pass or fail, and it is nothing without what was seen.
     "I could not tell" is a legitimate reading and it is NOT a pass: it comes
     back as an unknown value, and the deriver treats it as no evidence. */
  #verdictShape(claim: ProposedClaim): string[] {
    const problems: string[] = [];
    if (claim.unit !== null) problems.push(`claim ${claim.claimKey}: a gate verdict has no unit`);
    if (claim.value.known) {
      if (claim.value.text !== "passed" && claim.value.text !== "failed") {
        problems.push(`claim ${claim.claimKey}: a gate verdict is passed or failed, not ${String(claim.value.text)}`);
      }
      if (!claim.anchorKeys.length) {
        problems.push(`claim ${claim.claimKey}: a gate verdict says what in the film made it, so it anchors to the film`);
      }
    }
    return problems;
  }

  normaliseUnit(unit: string | null): string | null {
    return unit === null || unit === undefined ? null : unit.trim().toLowerCase();
  }
  normaliseKey(key: string): string { return DEFAULT_NORMALISERS.key(key); }

  /* The shot before and the shot after. Continuity is a claim about a join, so
     the reader that needs more than its own shot needs exactly its neighbours. */
  isRelated(target: SegmentRecord, task: TaskRecord, segments: SegmentRecord[]): boolean {
    const own = task.sources
      .map((s) => segments.find((x) => x.segmentId === s.segmentId))
      .filter(Boolean) as SegmentRecord[];
    return own.some((o) => o.sourceId === target.sourceId && Math.abs(o.ordinal - target.ordinal) === 1);
  }
  isReference(segment: SegmentRecord): boolean { return segment.segmentKind === "reference_frame"; }
  linkedSegments(segment: SegmentRecord, segments: SegmentRecord[]): SegmentRecord[] {
    return segments.filter((s) => s.segmentKind === "reference_frame" && s.sourceId === segment.sourceId);
  }

  /* ── the verdict ─────────────────────────────────────────────────────────
     Deterministic, and the only place in this pack where fifteen separate
     judgements become one answer. It reads accepted claims and nothing else:
     a verdict that could reach past the kernel's acceptance would be a way to
     deliver a film on evidence the kernel had rejected. */
  async derive(packet: WorkPacket): Promise<AgentResultEnvelope> {
    const env = emptyEnvelope(packet);
    const accepted = packet.context.claims.filter((c) => c.status === "accepted");
    const gates = accepted.filter((c) => c.predicate === GATE_VERDICT);
    if (!gates.length) {
      env.outcome = "insufficient_evidence";
      env.limitations.push("not one gate verdict was accepted, so there is nothing to judge the film on");
      return env;
    }

    const verdictOf = (claim: (typeof gates)[number]): Verdict => ({
      /* An unknown value is a reader that could not tell. Null, not false: the
         film is unmeasured on that gate, which is a different answer from a
         film that failed it, and reviewFilm keeps them different. */
      pass: claim.value.known ? claim.value.text === "passed" : null,
      evidence: claim.anchors.map((a) => a.quotedText).filter(Boolean).join("; ") || null,
    });

    const named = gates.map((claim) => ({ claim, at: readGateSubject(claim.subjectKey) }))
      .filter((x) => x.at !== null) as { claim: (typeof gates)[number]; at: { shot: string | null; gate: string } }[];
    const shotIds = [...new Set(named.filter((x) => x.at.shot).map((x) => x.at.shot as string))].sort(
      (a, b) => a.localeCompare(b, undefined, { numeric: true }));
    const evidence: FilmEvidence = {
      shots: shotIds.map((shotId) => ({
        shotId,
        verdicts: Object.fromEntries(named
          .filter((x) => x.at.shot === shotId)
          .map((x) => [x.at.gate, verdictOf(x.claim)])) as FilmEvidence["shots"][number]["verdicts"],
      })),
      film: Object.fromEntries(named
        .filter((x) => x.at.shot === null)
        .map((x) => [x.at.gate, verdictOf(x.claim)])) as FilmEvidence["film"],
    };

    /* One trace per object, its shots in the order the shots are in. */
    const continuity = accepted.filter((c) => c.predicate === OBJECT_CONTINUITY && readObjectSubject(c.subjectKey));
    const slugs = [...new Set(continuity.map((c) => readObjectSubject(c.subjectKey)!.slug))].sort();
    const traces: ObjectTrace[] = slugs.map((slug) => {
      const mine = continuity.filter((c) => readObjectSubject(c.subjectKey)!.slug === slug);
      return {
        object: String(mine[0]?.value.attributes?.object ?? slug),
        shots: mine
          .sort((a, b) => a.subjectKey.localeCompare(b.subjectKey, undefined, { numeric: true }))
          .map((c) => ({
            shotId: readObjectSubject(c.subjectKey)!.shot,
            visible: c.value.attributes?.visible === "yes",
            sameObject: tri(c.value.attributes?.same_object),
            visibleTransferOrExit: tri(c.value.attributes?.accounted_for),
          })),
      };
    });

    const review = reviewFilm(evidence, traces);
    const inputs = [...gates, ...continuity];
    inputs.forEach((claim, i) => {
      const anchor = claim.anchors[0];
      if (!anchor) return;
      env.anchors.push({
        anchorKey: `in-${i}`, sourceKind: "segment", sourceId: anchor.sourceId, segmentId: anchor.segmentId,
        locator: {}, quotedText: null,
      });
    });
    env.claims.push({
      claimKey: "verdict", subjectType: "film", subjectKey: packet.subjectKey, predicate: ACCEPTANCE_VERDICT,
      value: {
        known: true, quantity: null, text: review.verdict,
        attributes: {
          gates_judged: gates.length,
          gates_unsatisfied: review.failed.length,
          continuity_findings: review.continuity.length,
          not_satisfied: review.failed.map((f) => `${f.name}:${f.reason}`).join(", ") || null,
          because: review.because,
        },
      },
      unit: null, observationBasis: "derived", scope: {}, anchorKeys: env.anchors.map((a) => a.anchorKey),
      /* Not a score, and never read as one. */
      machineConfidence: null, inputClaimIds: inputs.map((c) => c.ref),
    });
    if (review.verdict !== "ACCEPTED") {
      env.limitations.push(`the film is ${review.verdict}: ${review.because}`);
    }
    return env;
  }
}

/* "yes" / "no" / anything else. A reader that did not look says so by saying
   nothing, and nothing is not false. */
function tri(value: string | number | null | undefined): boolean | null {
  if (value === "yes") return true;
  if (value === "no") return false;
  return null;
}
