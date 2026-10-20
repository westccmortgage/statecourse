/* WHAT MAKES A FILM FINISHED, AS OPPOSED TO CORRECTLY FORMATTED.
 *
 * A master can be 1080×1920, eighteen seconds long, cut into three shots, and
 * full of motion, and still be nothing anybody would watch: the same action
 * three times, a letter that vanishes between shots, morning becoming evening
 * for no reason, and silence where ambience was asked for. Every technical
 * check passes. The film is not finished.
 *
 * So the gates below are semantic, and they are HARD. Two rules make them
 * worth having:
 *
 *   · a required gate that failed cannot be carried by a high average
 *     elsewhere — there is no average here at all, by construction;
 *   · a required gate with NO EVIDENCE is failed, not assumed. "Nobody looked"
 *     and "it was fine" are different facts, and the second one has to be
 *     earned.
 *
 * This file states the gates and evaluates supplied evidence. It does not look
 * at pixels: judging a shot is a reading, and a reading is a provider call made
 * elsewhere, by a blind reader, under the kernel's own rules. What arrives here
 * is that reading's verdict, and what leaves is whether the film may ship.
 */
import type { AcceptanceGate } from "../../kernel/completion.ts";

/* ── per-shot gates ─────────────────────────────────────────────────────────
   Every dynamic clip is judged on each of these, independently. */
export const SHOT_GATES = [
  "character_identity_stable",
  "wardrobe_stable",
  "prop_continuity",
  "physical_plausibility",
  "action_legible",
  "geography_and_screen_direction",
  "time_of_day_and_lighting",
  "expected_action_completed",
] as const;
export type ShotGate = (typeof SHOT_GATES)[number];

/* ── whole-film gates ──────────────────────────────────────────────────── */
export const FILM_GATES = [
  "story_progresses",
  "shots_contribute_distinctly",
  "emotional_development",
  "ending_pays_off",
  "identity_and_props_across_scenes",
  "audio_behaves_as_intended",
  "master_technically_sound",
] as const;
export type FilmGate = (typeof FILM_GATES)[number];

/* A verdict as an independent reader returned it. `null` means it was never
   established — which is the case the gates exist to refuse. */
export type Verdict = { readonly pass: boolean | null; readonly evidence: string | null };
export type ShotEvidence = { readonly shotId: string; readonly verdicts: Partial<Record<ShotGate, Verdict>> };
export type FilmEvidence = {
  readonly shots: readonly ShotEvidence[];
  readonly film: Partial<Record<FilmGate, Verdict>>;
};

const missing: Verdict = { pass: null, evidence: null };

/* Every gate, for every shot, plus every whole-film gate — as the kernel's own
   acceptance-gate shape, so completion reads them exactly as it reads any
   other domain's. A gate nobody supplied arrives as `pass: null`, which
   `completionOf` already treats as a failure. */
export function gatesOf(evidence: FilmEvidence): AcceptanceGate[] {
  const gates: AcceptanceGate[] = [];
  for (const shot of evidence.shots) {
    for (const gate of SHOT_GATES) {
      const verdict = shot.verdicts[gate] ?? missing;
      gates.push({ name: `${shot.shotId}/${gate}`, required: true, passed: verdict.pass, evidence: verdict.evidence });
    }
  }
  for (const gate of FILM_GATES) {
    const verdict = evidence.film[gate] ?? missing;
    gates.push({ name: `film/${gate}`, required: true, passed: verdict.pass, evidence: verdict.evidence });
  }
  return gates;
}

/* Which gates are not satisfied, named precisely enough to repair: the scene
   and the gate, not "the video is bad". */
export function failedGates(evidence: FilmEvidence): { name: string; reason: "failed" | "no_evidence" }[] {
  return gatesOf(evidence)
    .filter((g) => g.required && (g.passed !== true || g.evidence === null))
    .map((g) => ({ name: g.name, reason: g.passed === false ? "failed" as const : "no_evidence" as const }));
}

/* ── a story-bearing object ─────────────────────────────────────────────────
   The letter in the train film. An object the story is about must persist while
   it is visible, stay the same object, and change hands or state only through
   an action the viewer can see. Vanishing, duplicating, morphing or teleporting
   between shots is a continuity failure however good the frames look.

   Supplied per shot as: is it visible, is it the same object, and was there a
   visible action that accounts for a change since the last shot it was in. */
export type ObjectTrace = {
  readonly object: string;
  readonly shots: readonly {
    readonly shotId: string;
    readonly visible: boolean;
    readonly sameObject: boolean | null;
    /* When it stops being visible, or changes hands: was that shown? */
    readonly visibleTransferOrExit: boolean | null;
  }[];
};

export type ContinuityFinding = { readonly object: string; readonly shotId: string; readonly what: string };

export function objectContinuityFindings(traces: readonly ObjectTrace[]): ContinuityFinding[] {
  const findings: ContinuityFinding[] = [];
  for (const trace of traces) {
    let wasVisible = false;
    for (const shot of trace.shots) {
      if (wasVisible && !shot.visible && shot.visibleTransferOrExit !== true) {
        findings.push({ object: trace.object, shotId: shot.shotId,
          what: shot.visibleTransferOrExit === null
            ? `nothing establishes whether ${trace.object} left the frame through a visible action`
            : `${trace.object} stopped being visible with no visible action accounting for it` });
      }
      if (shot.visible && shot.sameObject === false) {
        findings.push({ object: trace.object, shotId: shot.shotId, what: `${trace.object} is not the same object it was` });
      }
      if (shot.visible && shot.sameObject === null) {
        findings.push({ object: trace.object, shotId: shot.shotId, what: `nothing establishes that ${trace.object} is the same object` });
      }
      wasVisible = shot.visible;
    }
  }
  return findings;
}

/* ── the Instant Video product contract ─────────────────────────────────────
   Not prompt prose. The shape the product actually promises, checked. */
export const INSTANT_VIDEO = {
  shots: 3,
  shotSeconds: 6,
  width: 1080,
  height: 1920,
  totalSeconds: 18,
  totalToleranceSeconds: 1.0,
  minimumDistinctShotSizes: 2,
  /* Cinematic ambience is REQUIRED unless the person asked for silence. This is
     the product requirement PR #5's audio work deliberately left open: that
     change made silence legal for an episode that asks for no sound, and Instant
     Video does not ask for no sound — it asks for no DIALOGUE and no MUSIC. */
  ambienceRequired: true,
  beats: ["hook", "change", "payoff"] as const,
} as const;

export type InstantVideoEvidence = {
  readonly shotCount: number;
  readonly width: number;
  readonly height: number;
  readonly totalSeconds: number;
  /* One per shot, in order. A size repeated across all three is a formatting
     pass and a filmmaking failure. */
  readonly shotSizes: readonly string[];
  /* What each shot does in the story, as an independent reader named it. */
  readonly beats: readonly (string | null)[];
  /* Whether the three shots are essentially the same action. */
  readonly distinctActions: boolean | null;
  /* The soundtrack as measured, in the runtime-incident vocabulary:
     `absent` | `silent` | `measurable` | `undecodable`. */
  readonly audioState: string;
  /* Did the person explicitly ask for silence? Only then is silence allowed. */
  readonly silenceRequested: boolean;
};

export function instantVideoGates(evidence: InstantVideoEvidence): AcceptanceGate[] {
  const gate = (name: string, passed: boolean | null, detail: string): AcceptanceGate =>
    ({ name, required: true, passed, evidence: passed === null ? null : detail });

  const sizes = new Set(evidence.shotSizes);
  const ambienceOk = evidence.silenceRequested
    ? evidence.audioState === "silent" || evidence.audioState === "measurable"
    : evidence.audioState === "measurable";

  return [
    gate("instant/shot_count", evidence.shotCount === INSTANT_VIDEO.shots, `${evidence.shotCount} shots`),
    gate("instant/dimensions", evidence.width === INSTANT_VIDEO.width && evidence.height === INSTANT_VIDEO.height,
      `${evidence.width}x${evidence.height}`),
    gate("instant/duration", Math.abs(evidence.totalSeconds - INSTANT_VIDEO.totalSeconds) <= INSTANT_VIDEO.totalToleranceSeconds,
      `${evidence.totalSeconds}s`),
    gate("instant/two_shot_sizes", sizes.size >= INSTANT_VIDEO.minimumDistinctShotSizes,
      `${sizes.size} distinct size(s): ${[...sizes].join(", ")}`),
    gate("instant/beats_in_order",
      evidence.beats.length === INSTANT_VIDEO.beats.length
        && evidence.beats.every((beat, i) => beat === INSTANT_VIDEO.beats[i])
        ? true : evidence.beats.some((b) => b === null) ? null : false,
      `${evidence.beats.join(" -> ")}`),
    gate("instant/no_repeated_action", evidence.distinctActions, "three shots that are not the same action three times"),
    /* THE AMBIENCE GATE. An absent stream or a track below the silence
       threshold fails when ambience is required — and the fix for that failure
       is never a paid call made on the strength of this gate alone. */
    gate("instant/ambience", ambienceOk,
      evidence.silenceRequested
        ? `silence was asked for; measured ${evidence.audioState}`
        : `cinematic ambience is required; measured ${evidence.audioState}`),
  ];
}

/* ── the verdict on a whole film ────────────────────────────────────────────
   Three answers, and the middle one is the one that matters. A film that fails
   a hard gate is not "scored 0.82" and it is not "rejected": it is a film that
   must be REPAIRED before it can be delivered, and the failures above name
   precisely what to repair.

   REPAIR_REQUIRED says nothing about who may authorise that repair or what it
   costs — redoing a shot is a paid regeneration and the kernel refuses it
   automatic authority. Those are separate questions, deliberately: conflating
   "this must not ship" with "this can be fixed for free" is how an unwatchable
   master gets delivered because fixing it looked expensive.

   Missing evidence is REJECTED rather than REPAIR_REQUIRED. A repair has to be
   planned against a known defect, and a gate nobody measured is not a known
   defect — it is an unmeasured film, and the answer is to measure it. */
/* A story-bearing object that nobody followed. Once an object has been seen, the
   shots after it are where it either persists or does not, and a shot with no
   observation of it is not evidence that it persisted — it is a shot nobody was
   asked about, or one a reader did not answer for. Silence about a letter the
   story is about reads exactly like a letter that stayed put, which is how the
   train film would have been accepted by a review that only read the traces it
   was given. */
function unfollowed(evidence: FilmEvidence, traces: readonly ObjectTrace[]): ContinuityFinding[] {
  const order = evidence.shots.map((s) => s.shotId);
  const findings: ContinuityFinding[] = [];
  for (const trace of traces) {
    const seen = new Map(trace.shots.map((s) => [s.shotId, s]));
    const first = order.findIndex((shotId) => seen.get(shotId)?.visible === true);
    if (first < 0) continue;
    for (const shotId of order.slice(first + 1)) {
      const observation = seen.get(shotId);
      /* Once somebody has reported the object absent, the shots after that are
         nobody's business: the absence itself has been judged, either as
         accounted for or as the finding above. What has to be followed is the
         stretch while the object is still supposed to be there. */
      if (observation) { if (!observation.visible) break; continue; }
      findings.push({ object: trace.object, shotId,
        what: `nothing establishes what happened to ${trace.object} in this shot, and it was on screen before it` });
    }
  }
  return findings;
}

export const FILM_VERDICTS = ["ACCEPTED", "REPAIR_REQUIRED", "REJECTED"] as const;
export type FilmVerdict = (typeof FILM_VERDICTS)[number];

export type FilmReview = {
  readonly verdict: FilmVerdict;
  readonly failed: { name: string; reason: "failed" | "no_evidence" }[];
  readonly continuity: ContinuityFinding[];
  readonly because: string;
};

export function reviewFilm(evidence: FilmEvidence, traces: readonly ObjectTrace[] = []): FilmReview {
  const failed = failedGates(evidence);
  const continuity = [...objectContinuityFindings(traces), ...unfollowed(evidence, traces)];
  const unmeasured = failed.filter((f) => f.reason === "no_evidence");
  const broken = failed.filter((f) => f.reason === "failed");
  /* A continuity finding with nothing established is unmeasured too: the trace
     says "nobody looked", and that cannot be repaired into a pass. */
  const unestablished = continuity.filter((f) => f.what.startsWith("nothing establishes"));
  if (unmeasured.length || unestablished.length) {
    return {
      verdict: "REJECTED", failed, continuity,
      because: `${unmeasured.length + unestablished.length} hard gate(s) have no evidence at all`
        + `${unmeasured.length ? `: ${unmeasured.slice(0, 3).map((f) => f.name).join(", ")}` : ""}`
        + "; an unmeasured film is measured, not repaired",
    };
  }
  if (broken.length || continuity.length) {
    return {
      verdict: "REPAIR_REQUIRED", failed, continuity,
      because: [...broken.map((f) => f.name), ...continuity.map((f) => `${f.shotId}: ${f.what}`)]
        .slice(0, 4).join("; ") + " — the film must be repaired before it can be delivered",
    };
  }
  return { verdict: "ACCEPTED", failed, continuity, because: "every hard gate passed on evidence that exists" };
}
