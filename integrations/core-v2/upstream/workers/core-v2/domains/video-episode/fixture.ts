/* AN INVENTED FILM, AND THE TRUTH ABOUT WHAT IS IN IT.
 *
 * Eighteen seconds, three shots of six, 1080x1920 — the Instant Video shape,
 * because that is the product this domain was written against. A film declares
 * nothing about itself: a discoverer finds its shots as time ranges, and every
 * per-shot gate is a judgement a reader makes by watching one.
 *
 * The default film is the one that matters. Every technical check passes, all
 * fifteen hard gates pass, and the letter the story is about is visible in the
 * first shot and gone in the second with nothing on screen accounting for it.
 * A film nobody watched properly delivers; a film this pack read does not.
 */
import type { SourceDescriptor, SourceManifest } from "../../kernel/contracts.ts";
import { canonical, entityId, sha256 } from "../../kernel/ids.ts";
import { FILM_GATES, INSTANT_VIDEO, SHOT_GATES } from "./gates.ts";

export type GateTruth = { pass: boolean | null; seen: string };
/* What an object does in one shot, as a reader watching that shot would see it. */
export type ObjectTruth = { object: string; visible: boolean; sameObject: boolean | null; accountedFor: boolean | null };

export type Shot = {
  label: string; ordinal: number; startMs: number; endMs: number; size: string; action: string;
  contentHash: string;
  gates: Record<string, GateTruth>;
  objects: ObjectTruth[];
};

export type Film = {
  sourceId: string; ordinal: number; label: string; width: number; height: number; durationMs: number;
  contentHash: string; shots: Shot[]; gates: Record<string, GateTruth>;
};

export type FilmSetOptions = {
  seed?: string;
  organizationId?: string;
  workflowId?: string;
  /* Gate verdicts to override, as "shot:<ordinal>:<gate>" or "film:<gate>". */
  breaks?: Record<string, GateTruth>;
  /* Whether the letter's exit is shown. The default is the production defect:
     it is not shown, and a reader watching shot two says so. */
  letterExitShown?: boolean | null;
  /* Set false to make the readers of shot two report nothing about the letter,
     which is the "nobody looked" case rather than the "it vanished" case. */
  letterWatched?: boolean;
};

export type FilmSet = {
  manifest: SourceManifest;
  films: Film[];
  byFilmHash: Map<string, Film>;
  byShotHash: Map<string, Shot>;
};

const SIZES = ["wide", "medium", "close"];
const ACTIONS = [
  "a hand sets a letter on the table by the window",
  "the train pulls away and the table is bare",
  "the platform empties and the window goes dark",
];
const BEATS = INSTANT_VIDEO.beats;

const pass = (seen: string): GateTruth => ({ pass: true, seen });

export function syntheticFilmSet(options: FilmSetOptions = {}): FilmSet {
  const seed = options.seed ?? "video-episode/1";
  const breaks = options.breaks ?? {};
  const organizationId = options.organizationId ?? entityId("fixture-organisation", seed);
  const workflowId = options.workflowId ?? entityId("fixture-workflow", seed);
  const watched = options.letterWatched !== false;
  const exitShown = options.letterExitShown ?? false;

  const shots: Shot[] = [];
  for (let i = 0; i < INSTANT_VIDEO.shots; i++) {
    const startMs = i * INSTANT_VIDEO.shotSeconds * 1000;
    const gates: Record<string, GateTruth> = {};
    for (const gate of SHOT_GATES) {
      gates[gate] = breaks[`shot:${i}:${gate}`]
        ?? pass(`${gate} holds in ${BEATS[i]}: ${ACTIONS[i]}`);
    }
    /* The letter is in the first shot and not in the second. Only a reader of
       the second shot can say whether anything showed it leaving, and only the
       two readings together mean anything. */
    const objects: ObjectTruth[] = [];
    if (i === 0) objects.push({ object: "the letter", visible: true, sameObject: true, accountedFor: null });
    if (i === 1 && watched) objects.push({ object: "the letter", visible: false, sameObject: null, accountedFor: exitShown });
    const shot: Shot = {
      label: `shot ${i + 1}`, ordinal: i, startMs, endMs: startMs + INSTANT_VIDEO.shotSeconds * 1000,
      size: SIZES[i % SIZES.length], action: ACTIONS[i], contentHash: "", gates, objects,
    };
    shot.contentHash = `fx-${sha256(canonical({ seed, i, action: shot.action, gates, objects })).slice(0, 24)}`;
    shots.push(shot);
  }

  const filmGates: Record<string, GateTruth> = {};
  for (const gate of FILM_GATES) {
    filmGates[gate] = breaks[`film:${gate}`] ?? pass(`${gate} holds across ${BEATS.join(", ")}`);
  }

  const film: Film = {
    sourceId: entityId("fixture-film", seed), ordinal: 0, label: "an eighteen-second film",
    width: INSTANT_VIDEO.width, height: INSTANT_VIDEO.height,
    durationMs: INSTANT_VIDEO.totalSeconds * 1000, contentHash: "", shots, gates: filmGates,
  };
  film.contentHash = `fx-${sha256(canonical({ seed, shots: shots.map((s) => s.contentHash), filmGates })).slice(0, 24)}`;

  const descriptor: SourceDescriptor = {
    sourceId: film.sourceId, ordinal: 0, sourceKind: "film", label: film.label,
    uri: `fixture://video-episode/${sha256(seed).slice(0, 8)}`,
    contentHash: film.contentHash, hashAlgorithm: "sha-256", objectVersionId: null,
    byteSize: 4_000_000, media: { fixture: true, duration_ms: film.durationMs, width: film.width, height: film.height },
    declaredSegments: [],
  };

  const manifest: SourceManifest = {
    workflowId, organizationId, domainPack: "video-episode", domainPackVersion: "1.0",
    workflowType: "instant_video_acceptance", requestedScope: { fixture: seed }, sources: [descriptor],
  };
  return {
    manifest, films: [film],
    byFilmHash: new Map([[film.contentHash, film]]),
    byShotHash: new Map(shots.map((s) => [s.contentHash, s] as const)),
  };
}
