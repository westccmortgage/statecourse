/**
 * TX-BLOCK — generator core for Texas Principles of Real Estate I, mirroring the spirit of
 * scripts/lib/generate-ca-block-maps.mjs (screen ranges derived from a frozen lesson's own
 * headings, never copied text) but built against Texas's real module shape, which is NOT
 * California's fixed six-section/eight-problem template:
 *
 *   ## TREC Topic: <title>              (front matter — prescribed minutes, objectives prose,
 *                                         the module's statute-grounding note; dropped, like the
 *                                         H1, from the generated screens)
 *   ## Unit: <title>                    (repeats 2-10 times per module; this is the natural block
 *                                         unit — Texas's own PRINS1-1 course-approval form already
 *                                         names each one, e.g. T01U1, and principles-i-course.mjs
 *                                         already carries a hand-authored learning objective for
 *                                         every one of the 46 units, which this generator reuses
 *                                         rather than re-deriving)
 *   ### Statute reading exercise: ...   (0+ per unit, always trailing that unit's teaching prose)
 *   ### Applied exercise: ...           (0+ per unit, same position)
 *   ## Module recap                    (closes the module; becomes its own single-screen block)
 *
 * One block per unit (id = the unit's own PRINS1-1 code, lowercased — "t01u1"), one trailing
 * recap block per module. Retrieval banks are NOT generated here: they come from
 * config/texas/principles-i-block-retrieval.mjs, itself adapted from the existing formative
 * question bank (config/texas/principles-i-question-bank.mjs) plus newly authored items for the
 * units that bank doesn't yet cover — see scripts/build-tx-retrieval-bank.mjs.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * `screenMedia` HOOK — BUILT, VALIDATED, AND DORMANT UNTIL COMPLETE ASSETS EXIST.
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 *
 * A course may supply `screenMedia`, keyed by an emitted instruction-screen id. The generator
 * refuses unknown or retrieval-screen ids, refuses required/autoplay/assessment media, and refuses
 * to write a generated map unless the MP4, poster, shipping VTT and plain-text transcript all exist
 * as non-empty files under public/statecourse/media. It also requires the author to record factual,
 * visual, logo-safety and accessibility review. This is deliberately stricter than California's
 * first media hook because a partially attached player is worse than no video.
 *
 * Texas Law of Agency activates its reviewed IABS 1-2 video at t02u5-s1. The remaining editorial
 * packages target t05u3-s1 and t06u3-s1 and stay inactive until each final render, poster,
 * measured-duration shipping VTT and transcript has passed the same reviews.
 * DO NOT HAND-EDIT A GENERATED COURSE FILE.
 *
 * THE TESTS THAT SHIP WITH THE HOOK. Each of these is a test, not a note.
 *
 *   1.  EXACT SCREEN PLACEMENT. A media entry attaches to the screen id it names and to no other.
 *       An entry naming a screen the generator did not emit REFUSES TO GENERATE — it must not be
 *       dropped, warned about, or attached to a near-miss id.
 *   2.  `required: false`. Every attached media entry is optional. The generator refuses an entry
 *       that omits it or sets it true.
 *   3.  NON-BLOCKING PROGRESSION. The screen's completion, and the block's, do not depend on the
 *       media. A student who never opens it progresses identically: no progress gate, no completion
 *       requirement, no assessment dependency, no autoplay.
 *   4.  MP4, VTT, TRANSCRIPT AND POSTER PRESENCE. All four assets resolve on disk at the paths the
 *       entry names. A missing one is a generation failure, not a broken player at runtime.
 *   5.  ACCESSIBLE PLAYER CONTROLS AND KEYBOARD ACCESS. The emitted entry carries the controls the
 *       player needs and is reachable and operable by keyboard alone, in the screen's tab order.
 *   6.  CAPTION AVAILABILITY. A caption track is present, is served, and is selectable — and it is
 *       the SHIPPING .vtt, never a file whose name or NOTE block marks it provisional.
 *   7.  NO OVERLAP WITH THE StateCourse LOGO. The player's rendered box does not intersect the
 *       logo's region on any supported viewport.
 *   8.  NO SECURE ASSESSMENT CONTENT. The media carries no quiz question, self-test, poll, answer or
 *       answer recap, and no item drawn from a retrieval or final-exam bank.
 *   9.  NO VIDEO ON THE RETRIEVAL SCREEN. A media entry keyed to a screen of type "retrieval"
 *       REFUSES TO GENERATE. Retrieval happens on its own screen with the video, the document and
 *       the visible answers no longer displayed; that separation must be enforced here, not
 *       remembered by whoever authors the spec.
 *   10. NO ACTIVATION WHEN ANY REQUIRED MEDIA ASSET IS ABSENT. If MP4, poster, shipping VTT or
 *       transcript is missing, the screen generates with NO media at all rather than with a partial
 *       player. There is no such thing as a half-attached video: a dead player, a nonfunctional
 *       poster, a decorative badge or an unavailable transcript is worse than no video.
 */

import fs from "node:fs";
import path from "node:path";

const q = (value) => JSON.stringify(String(value));

const MEDIA_BASE = "/media/";

function publicAssetPath(root, source, label) {
  if (typeof source !== "string" || !source.startsWith(MEDIA_BASE)) {
    throw new Error(`${label} must use a ${MEDIA_BASE} path`);
  }
  const publicRoot = path.resolve(root, "public/statecourse");
  const resolved = path.resolve(publicRoot, source.slice(1));
  if (!resolved.startsWith(`${publicRoot}${path.sep}`)) throw new Error(`${label} escapes public/statecourse`);
  return resolved;
}

function requireAsset(root, source, label, extensionPattern) {
  if (!extensionPattern.test(source || "")) throw new Error(`${label} has the wrong file type: ${source || "missing"}`);
  const resolved = publicAssetPath(root, source, label);
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile() || fs.statSync(resolved).size === 0) {
    throw new Error(`${label} is missing or empty: ${source}`);
  }
}

/**
 * Validate and normalize the hand-authored media map before a generated block-map file is written.
 * Exported so tests and future Texas course wrappers enforce one contract rather than reimplementing
 * it beside every course.
 */
export function validateScreenMedia({ root, moduleNumber, blocks, screenMedia = {} }) {
  const emittedScreens = new Map();
  for (const block of blocks) {
    block.screens.forEach((screen, index) => emittedScreens.set(`${block.id}-s${index + 1}`, screen));
  }

  const normalized = {};
  for (const [screenId, entry] of Object.entries(screenMedia)) {
    const screen = emittedScreens.get(screenId);
    if (!screen) throw new Error(`module ${moduleNumber}: screenMedia names unknown screen ${screenId}`);
    if (screen.type === "retrieval") throw new Error(`module ${moduleNumber}: screenMedia cannot attach to retrieval screen ${screenId}`);
    if (screen.type !== "instruction") throw new Error(`module ${moduleNumber}: screenMedia may attach only to an instruction screen (${screenId} is ${screen.type})`);
    if (entry?.required !== false || entry?.nonBlocking !== true) {
      throw new Error(`module ${moduleNumber}: screenMedia ${screenId} must declare required:false and nonBlocking:true`);
    }
    if (entry?.noAssessmentContent !== true) {
      throw new Error(`module ${moduleNumber}: screenMedia ${screenId} must declare noAssessmentContent:true`);
    }
    if (!Array.isArray(entry.videos) || entry.videos.length === 0) {
      throw new Error(`module ${moduleNumber}: screenMedia ${screenId} must carry at least one video`);
    }

    const videos = entry.videos.map((video, index) => {
      const prefix = `module ${moduleNumber}: screenMedia ${screenId} video ${index + 1}`;
      if (!video?.label || !video?.duration) throw new Error(`${prefix} needs a label and measured duration`);
      if (!/^\d+:[0-5]\d$/.test(video.duration)) throw new Error(`${prefix} duration must be measured m:ss`);
      if (video.autoplay !== false) throw new Error(`${prefix} must declare autoplay:false`);
      if (video.controls !== true || video.keyboardAccessible !== true || video.captionsSelectable !== true) {
        throw new Error(`${prefix} must declare controls, keyboard access and selectable captions`);
      }
      if (video.factualQcApproved !== true || video.visualQcApproved !== true || video.logoSafeReviewed !== true || video.accessibilityQcApproved !== true) {
        throw new Error(`${prefix} is missing factual, visual, logo-safety or accessibility approval`);
      }
      if (/provisional/i.test(video.captions || "")) throw new Error(`${prefix} cannot use provisional captions`);
      requireAsset(root, video.src, `${prefix} MP4`, /\.mp4$/i);
      requireAsset(root, video.poster, `${prefix} poster`, /\.(?:webp|png|jpe?g)$/i);
      requireAsset(root, video.captions, `${prefix} captions`, /\.vtt$/i);
      requireAsset(root, video.transcript, `${prefix} transcript`, /\.txt$/i);
      return Object.freeze({
        src: video.src,
        poster: video.poster,
        captions: video.captions,
        transcript: video.transcript,
        label: video.label,
        duration: video.duration,
        required: false,
        nonBlocking: true,
        autoplay: false,
        controls: true,
        keyboardAccessible: true,
        captionsSelectable: true,
      });
    });
    normalized[screenId] = Object.freeze({ videos: Object.freeze(videos) });
  }
  return Object.freeze(normalized);
}

/** unitCodesInOrder: e.g. ["T01U1","T01U2","T01U3","T01U4"] for module 01, in file order. */
export function parseModule(markdown, unitCodesInOrder) {
  const lines = markdown.replace(/\r/g, "").split("\n");
  const marks = []; // { kind: "unit"|"exercise"|"recap", heading, lineIndex, title }
  lines.forEach((line, index) => {
    const unit = line.match(/^## Unit: (.+)$/);
    if (unit) { marks.push({ kind: "unit", heading: line.trim(), lineIndex: index, title: unit[1].trim() }); return; }
    const recap = line.match(/^### Module recap\s*$/);
    if (recap) { marks.push({ kind: "recap", heading: line.trim(), lineIndex: index, title: "Module recap" }); return; }
    const optional = line.match(/^## Optional reference: (.+)$/);
    if (optional) { marks.push({ kind: "optional", heading: line.trim(), lineIndex: index, title: optional[1].trim() }); return; }
    const exercise = line.match(/^### (Statute reading exercise|Applied exercise): (.+)$/);
    if (exercise) { marks.push({ kind: "exercise", heading: line.trim(), lineIndex: index, title: `${exercise[1]}: ${exercise[2].trim()}` }); return; }
  });

  const units = marks.filter((m) => m.kind === "unit");
  if (units.length !== unitCodesInOrder.length) {
    throw new Error(`module: found ${units.length} "## Unit:" headings, expected ${unitCodesInOrder.length} (${unitCodesInOrder.join(",")})`);
  }
  const recapMark = marks.find((m) => m.kind === "recap");
  if (!recapMark) throw new Error("module: no \"### Module recap\" heading found");
  /* A module may close with one "## Optional reference:" section. It is not required work: the
     student may skip it, no assessment item may depend on it, and its minutes are excluded from
     required time. It becomes its own trailing block with required:false rather than being folded
     into the recap — and the recap's range has to STOP at it, or the recap screen would silently
     carry optional material as required review. */
  const optionalMark = marks.find((m) => m.kind === "optional");

  const blocks = [];
  units.forEach((unitMark, index) => {
    const code = unitCodesInOrder[index];
    const nextBoundary = units[index + 1] ?? recapMark;
    const exercisesInRange = marks.filter(
      (m) => m.kind === "exercise" && m.lineIndex > unitMark.lineIndex && m.lineIndex < nextBoundary.lineIndex
        && (!optionalMark || m.lineIndex < optionalMark.lineIndex),
    );
    const screens = [];
    const instructionTo = exercisesInRange.length ? exercisesInRange[0].heading : nextBoundary.heading;
    /* The first unit's first screen also absorbs the module's front matter ("## TREC Topic:" —
       prescribed time, the module-level objectives prose, the statute-grounding note) and the
       bare H1, exactly as the Mortgage/Principles/Practice California blocks absorb their
       lesson's front matter into Block 1's first screen rather than dropping it. */
    const instructionFrom = index === 0 ? "^" : unitMark.heading;
    screens.push({ type: "instruction", title: unitMark.title, from: instructionFrom, to: instructionTo });
    exercisesInRange.forEach((exercise, exIndex) => {
      const to = exercisesInRange[exIndex + 1] ? exercisesInRange[exIndex + 1].heading : nextBoundary.heading;
      screens.push({ type: "practice", title: exercise.title, from: exercise.heading, to });
    });
    screens.push({ type: "retrieval", title: "Retrieval check", questionId: `${code.toLowerCase()}-q1` });
    blocks.push({ id: code.toLowerCase(), code, title: unitMark.title, screens });
  });

  return { blocks, recapMark, optionalMark };
}

/**
 * course: {
 *   root, curriculumDir,
 *   courseId: "tx-principles-real-estate-i-30-v1",
 *   moduleNumber: 1..9,
 *   unitCodes: ["T01U1", ...],           // this module's units, in file order
 *   unitObjectives: { T01U1: "...", ... }, // from config/texas/principles-i-course.mjs UNIT_OBJECTIVES
 *   outFile: (moduleNumber) => path,
 * }
 */
export function generateModuleBlocks(course, moduleNumber) {
  const nn = String(moduleNumber).padStart(2, "0");
  const lessonPath = `${course.curriculumDir}/module-${nn}.md`;
  const markdown = fs.readFileSync(lessonPath, "utf8");
  const { blocks, recapMark, optionalMark } = parseModule(markdown, course.unitCodes);

  for (const block of blocks) {
    const objective = course.unitObjectives[block.code];
    if (!objective) throw new Error(`module ${nn}: no learning objective for unit ${block.code}`);
  }

  /* Validate every media dependency before rendering any output. A failed asset or placement check
     leaves the existing generated map untouched rather than producing a half-attached player. */
  const screenMedia = validateScreenMedia({
    root: course.root,
    moduleNumber,
    blocks,
    screenMedia: course.screenMedia || {},
  });

  const renderScreen = (blockId, screen, index) => {
    const id = `${blockId}-s${index + 1}`;
    if (screen.type === "retrieval") {
      return `        { id: ${q(id)}, sequence: ${index + 1}, type: "retrieval", title: ${q(screen.title)}, questionId: ${q(screen.questionId)} },`;
    }
    const mediaEntry = screenMedia[id];
    const media = mediaEntry ? `, videos: ${JSON.stringify(mediaEntry.videos)}` : "";
    return `        { id: ${q(id)}, sequence: ${index + 1}, type: ${q(screen.type)}, title: ${q(screen.title)}, content: RANGE(${q(screen.from)}, ${q(screen.to)})${media} },`;
  };

  const rendered = blocks.map((block, blockIndex) => `    {
      id: ${q(block.id)}, sequence: ${blockIndex + 1}, required: true,
      code: ${q(block.code)},
      title: ${q(block.title)},
      learningObjective: ${q(course.unitObjectives[block.code])},
      screens: [
${block.screens.map((screen, index) => renderScreen(block.id, screen, index)).join("\n")}
      ],
    },`).join("\n");

  const recapBlockId = `t${moduleNumber}-recap`;
  const recapBlock = `    {
      id: ${q(recapBlockId)}, sequence: ${blocks.length + 1}, required: true,
      title: "Module recap",
      screens: [
        { id: ${q(`${recapBlockId}-s1`)}, sequence: 1, type: "review", title: "Module recap", content: RANGE(${q(recapMark.heading)}, ${q(optionalMark ? optionalMark.heading : "$")}) },
      ],
    },`;

  /* required:false is load-bearing, not decorative. The engine must not gate progression on this
     block, no quiz or examination item may be traced to it, and the time evidence counts its words
     under optional rather than required. */
  const optionalBlockId = `t${moduleNumber}-optional`;
  const optionalBlock = optionalMark ? `
    {
      id: ${q(optionalBlockId)}, sequence: ${blocks.length + 2}, required: false, optional: true,
      title: ${q(optionalMark.title)},
      nonBlocking: true,
      excludedFromRequiredTime: true,
      noAssessmentMayDependOnThis: true,
      screens: [
        { id: ${q(`${optionalBlockId}-s1`)}, sequence: 1, type: "optional-reference", title: ${q(optionalMark.title)}, content: RANGE(${q(optionalMark.heading)}, "$") },
      ],
    },` : "";

  /* The generated file's own header. A course that is not Principles of Real Estate I supplies its
     own through course.generatedHeader(nn) — the block comment, without a trailing newline — so
     that a generated artifact names the course it actually describes, the script that regenerates
     it, and where its objectives came from. Omitting it keeps the original header byte for byte,
     which is what lets Principles I and II regenerate unchanged. */
  const header = course.generatedHeader
    ? course.generatedHeader(nn)
    : `/**
 * GENERATED FILE — Texas Principles of Real Estate I, Module ${nn} learning-block map.
 * Derived from the frozen module's own headings by scripts/generate-tx-principles-block-maps.mjs.
 * Learning objectives come from config/texas/principles-i-course.mjs's UNIT_OBJECTIVES (already
 * hand-authored, traced to read statute sections); the retrieval bank lives in
 * config/texas/principles-i-block-retrieval.mjs. Do not edit by hand — regenerate.
 */`;

  const body = `${header}

const RANGE = (from, to) => Object.freeze({ from, to });

export const MODULE_${moduleNumber}_BLOCKS = Object.freeze({
  courseId: ${q(course.courseId)},
  moduleId: ${q(`module-${nn}`)},
  version: "1.0",
  contentPath: ${q(`/content/texas/${course.courseId}/module-${nn}.md`)},
  blocks: [
${rendered}
${recapBlock}${optionalBlock}
  ],
});

export default MODULE_${moduleNumber}_BLOCKS;
`;
  fs.writeFileSync(course.outFile(moduleNumber), body);
  return course.outFile(moduleNumber);
}
