/* THE SCRIPTED READERS OF THE VIDEO EPISODE PACK.
 *
 * Each reader answers from the fixture's truth, so a disagreement in a test is
 * one a test asked for rather than one the mock invented. A reader of a shot
 * sees only that shot: the letter's disappearance is therefore reported as two
 * separate observations by two different readings, and only the deriver — which
 * sees the accepted claims in order — can put them together.
 */
import type { PacketClaim, WorkPacket } from "../../kernel/contracts.ts";
import { emptyEnvelope } from "../../kernel/deterministic.ts";
import { ExecutorRegistry } from "../../kernel/executors.ts";
import type { Responder, Script, TruthOracle, TruthReading } from "../mock-executor.ts";
import { ScriptedExecutor, kernelRoleResponders } from "../mock-executor.ts";
import type { FilmSet, GateTruth, ObjectTruth } from "./fixture.ts";
import { FILM_GATES, SHOT_GATES } from "./gates.ts";
import {
  GATE_VERDICT, OBJECT_CONTINUITY, VideoEpisodePack, filmGateSubject, objectSlug,
  readGateSubject, readObjectSubject, shotGateSubject, shotObjectSubject,
} from "./pack.ts";

const pack = new VideoEpisodePack();

const objectValue = (object: ObjectTruth) => ({
  known: true, quantity: null, text: object.visible ? "visible" : "absent",
  attributes: {
    /* The readable name travels in the value, not in the subject: the subject
       carries a slug, and attributes are the one part of a claim the packet
       builder relays whole. */
    object: object.object,
    visible: object.visible ? "yes" : "no",
    same_object: object.sameObject === null ? null : object.sameObject ? "yes" : "no",
    accounted_for: object.accountedFor === null ? null : object.accountedFor ? "yes" : "no",
  },
});

const said = (truth: GateTruth) => ({
  known: truth.pass !== null,
  quantity: null,
  text: truth.pass === null ? null : truth.pass ? "passed" : "failed",
  attributes: {},
});

export function discoverShots(packet: WorkPacket, truth: FilmSet) {
  const env = emptyEnvelope(packet);
  const ref = packet.sources.find((s) => s.kind === "source");
  const film = ref ? truth.byFilmHash.get(ref.contentHash.replace(/^digest=[^:]+:/, "")) : null;
  if (!ref || !film) { env.outcome = "failed_known"; env.limitations.push("no film in the packet"); return env; }
  for (const shot of film.shots) {
    env.segments.push({
      segmentKey: `shot-${shot.ordinal}`, sourceId: ref.sourceId, parentSegmentId: null, segmentKind: "shot",
      label: shot.label, ordinal: shot.ordinal,
      locator: { start_ms: shot.startMs, end_ms: shot.endMs }, contentHash: shot.contentHash,
    });
  }
  return env;
}

export function readShot(packet: WorkPacket, truth: FilmSet) {
  const env = emptyEnvelope(packet);
  const ref = packet.sources[0];
  const shot = ref?.segmentId ? truth.byShotHash.get(ref.contentHash) : null;
  if (!ref || !shot) { env.outcome = "failed_known"; env.limitations.push("no shot in the packet"); return env; }

  for (const gate of SHOT_GATES) {
    const verdict = shot.gates[gate];
    const anchorKey = `at-${gate}`;
    env.anchors.push({
      anchorKey, sourceKind: "segment_locator", sourceId: ref.sourceId, segmentId: ref.segmentId,
      locator: { start_ms: shot.startMs, end_ms: shot.endMs }, quotedText: verdict.seen,
    });
    env.claims.push({
      /* The gate is in the SUBJECT, so two readers of one shot are lined up gate
         against gate — and so the critic that reopens the shot can tell which of
         the eight it is being asked about. */
      claimKey: `gate-${gate}`, subjectType: "shot_gate",
      subjectKey: `${packet.subjectKey}/gate/${gate}`, predicate: GATE_VERDICT,
      value: said(verdict), unit: null, observationBasis: "observed",
      scope: {}, anchorKeys: [anchorKey], machineConfidence: 0.8,
    });
  }
  for (const object of shot.objects) {
    const slug = objectSlug(object.object);
    const anchorKey = `at-object-${slug}`;
    env.anchors.push({
      anchorKey, sourceKind: "segment_locator", sourceId: ref.sourceId, segmentId: ref.segmentId,
      locator: { start_ms: shot.startMs, end_ms: shot.endMs },
      quotedText: object.visible ? `${object.object} is on screen` : `${object.object} is not on screen`,
    });
    env.claims.push({
      claimKey: `object-${slug}`, subjectType: "shot_object",
      subjectKey: `${packet.subjectKey}/object/${slug}`, predicate: OBJECT_CONTINUITY,
      value: objectValue(object),
      unit: null, observationBasis: "observed", scope: {},
      anchorKeys: [anchorKey], machineConfidence: 0.8,
    });
  }
  return env;
}

export function readFilm(packet: WorkPacket, truth: FilmSet) {
  const env = emptyEnvelope(packet);
  const film = truth.films[0];
  const shots = packet.sources.filter((s) => s.segmentId);
  if (!shots.length) { env.outcome = "failed_known"; env.limitations.push("no shot of the film in the packet"); return env; }
  for (const gate of FILM_GATES) {
    const verdict = film.gates[gate];
    /* A film gate points at the whole of every shot, not at a range across
       them: a locator that spans the film lies outside each segment it names,
       and the kernel rejected the reading for exactly that reason the first
       time this was written. */
    const keys = shots.map((shot, i) => {
      const anchorKey = `at-${gate}-${i}`;
      env.anchors.push({
        anchorKey, sourceKind: "segment", sourceId: shot.sourceId, segmentId: shot.segmentId,
        locator: {}, quotedText: verdict.seen,
      });
      return anchorKey;
    });
    env.claims.push({
      claimKey: `gate-${gate}`, subjectType: "film_gate",
      subjectKey: `${packet.subjectKey}/gate/${gate}`, predicate: GATE_VERDICT,
      value: said(verdict), unit: null, observationBasis: "observed", scope: {},
      anchorKeys: keys, machineConfidence: 0.7,
    });
  }
  return env;
}

/* The shot a subject key names. The oracle is asked about a claim from packets
   that may hand over different sources than the reading did — a critic reopens
   a place, an arbiter reads a disagreement — so resolving the shot through the
   packet's own source list made the truth unreadable for exactly the claims the
   kernel most needed an independent opinion on. The subject key is the stable
   way to ask, and it is the fixture's own key. */
function shotOf(truth: FilmSet, subjectKey: string) {
  const ordinal = Number(subjectKey.split("/shot/")[1]);
  return Number.isInteger(ordinal) ? truth.films[0].shots[ordinal] ?? null : null;
}

export function oracleFor(truth: FilmSet): TruthOracle {
  return {
    readingFor(_packet: WorkPacket, claim: PacketClaim): TruthReading {
      if (claim.predicate === GATE_VERDICT) {
        const named = readGateSubject(claim.subjectKey);
        if (!named) return null;
        if (named.shot === null) {
          const verdict = truth.films[0].gates[named.gate];
          return verdict ? { value: said(verdict), unit: null } : null;
        }
        const shot = shotOf(truth, named.shot);
        if (!shot) return "unreadable";
        const verdict = shot.gates[named.gate];
        return verdict ? { value: said(verdict), unit: null } : null;
      }
      if (claim.predicate === OBJECT_CONTINUITY) {
        const named = readObjectSubject(claim.subjectKey);
        const shot = named ? shotOf(truth, named.shot) : null;
        if (!named || !shot) return "unreadable";
        const object = shot.objects.find((o) => objectSlug(o.object) === named.slug);
        return object ? { value: objectValue(object), unit: null } : null;
      }
      return null;
    },
  };
}

export function packResponders(truth: FilmSet): Record<string, Responder> {
  return {
    shot_discoverer: (p) => discoverShots(p, truth),
    shot_reader: (p) => readShot(p, truth),
    film_reader: (p) => readFilm(p, truth),
    ...kernelRoleResponders(oracleFor(truth), (u) => pack.normaliseUnit(u)),
  };
}

export const MOCK_FAMILIES = [
  "reader-family-one", "reader-family-two", "reader-family-three",
  "critic-family-one", "critic-family-two", "arbiter-family-one",
];

export function mockExecutors(truth: FilmSet, options: { families?: string[]; aliases?: Record<string, string>; scripts?: Record<string, Script> } = {}) {
  const registry = new ExecutorRegistry();
  const executors: Record<string, ScriptedExecutor> = {};
  const responders = packResponders(truth);
  for (const family of options.families ?? MOCK_FAMILIES) {
    const alias = options.aliases?.[family];
    if (alias && executors[alias]) { registry.register(executors[alias], [family]); executors[family] = executors[alias]; continue; }
    const executor = new ScriptedExecutor(family, responders, options.scripts?.[family] ?? null);
    registry.register(executor, [family]);
    executors[family] = executor;
  }
  return { registry, executors };
}
