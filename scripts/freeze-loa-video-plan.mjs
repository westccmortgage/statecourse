/**
 * TX Law of Agency — deterministic freeze of the VIDEO PLAN and everything a render depends on.
 *
 * WHY THIS EXISTS SEPARATELY FROM THE CURRICULUM FREEZE. Until 2026-08-30 the curriculum freeze
 * hashed `video-instruction-plan.md` directly. That made a video artifact a curriculum artifact:
 * correcting a duration, or a highlight rectangle that was cutting a printed word in half, reported
 * drift against the content freeze and required a curriculum-freeze break to land. During one pass
 * that deadlock was resolved the only way it could be at the time — the plan edit was reversed byte
 * for byte and the corrections were parked in an unhashed addendum. That left a hashed canonical
 * plan carrying known defects and an unhashed file carrying the fixes: acceptable as review history,
 * not acceptable as a production package, because a renderer consulting the canonical files would
 * have reproduced the defects.
 *
 * A video plan is not curriculum. Correcting a video should never require breaking a curriculum
 * freeze. So each artifact now owns its own domain: this script hashes the video package, and
 * `scripts/freeze-loa-curriculum.mjs` hashes THIS SCRIPT'S ARTIFACT rather than the plan. One level
 * of indirection. The curriculum freeze still pins the video state exactly — any change to any video
 * artifact changes this freeze, which changes the hash the curriculum freeze holds — but it pins it
 * through a stable pointer that the video freeze owns.
 *
 * WHAT IT REFUSES TO FREEZE. A freeze over a package that does not validate lends a hash's authority
 * to a defect. This script runs `scripts/validate-loa-video-packages.mjs` and refuses to write if any
 * of its eight checks fails.
 *
 * Usage:  node scripts/freeze-loa-video-plan.mjs [--write]
 * Without --write it verifies the current freeze against disk and exits non-zero on drift.
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HOME = path.join(root, "texas/tx-law-of-agency-30-v1");
const PROD = path.join(HOME, "video-production");
const OUT = path.join(HOME, "video-plan-freeze.json");

const COURSE_ID = "tx-law-of-agency-30-v1";
const FREEZE_ID = "LOA-VIDEO-PLAN-FREEZE-2026-09-09-v5";

const PREVIOUS_FREEZE = Object.freeze({
  freezeId: "LOA-VIDEO-PLAN-FREEZE-2026-09-08-v4",
  sha256: "d3be6148a53991db565a4ed1b358f1852b52fd1d4c5e1e964f1bc4ff05025026",
  bytes: 25498,
  change:
    "The accepted Texas Intermediary Brokerage render, English captions and transcript were activated through Cloudflare Stream as optional, non-blocking media at t06u3-s1. Video 2 remains inactive.",
});

/**
 * The byte-state this freeze supersedes. Plan v1 was hashed by
 * LOA-CONTENT-FREEZE-2026-08-30-v3 at this value. It is preserved so that anyone holding the old
 * artifact can identify what they hold, and so that "SUPERSEDED" names a specific object rather
 * than a mood.
 */
const SUPERSEDES = Object.freeze({
  artifact: "texas/tx-law-of-agency-30-v1/video-instruction-plan.md",
  version: "plan v1",
  sha256: "7ca7234853320ad96275c9a6c7e69a16e0a2ec2b63b6de2fd7ed62ed7f88e403",
  bytes: 29239,
  hashedBy: "LOA-CONTENT-FREEZE-2026-08-30-v3, as the artifact 'video instruction plan'",
  status: "SUPERSEDED",
  whySuperseded:
    "v1 was correct when written and wrong in four particulars by the time it was frozen: it gave three durations that its own caption blocks contradicted, it said the Law of Agency block maps did not exist when they did, it said the caption files existed only inside the production files when they were on disk, and it described the screen ids as reservations when every one of them had been confirmed against a live generated screen. None of that was discoverable from the file itself, which is the point of recording it here.",
  whereItsCorrectionsWere:
    "texas/tx-law-of-agency-30-v1/video-production/production-readiness-addendum.md, which is retained as review history and hashed below in that character. It is not an operational dependency: validator check 7 diffs its corrections against the canonical files and fails if any exists only there.",
});

/**
 * WHAT CHANGED AND WHY, per correction. A freeze that records only hashes tells a later reader that
 * something moved, not what moved or whether it should have. Every correction consolidated into the
 * canonical files at this freeze is named here with its class, its evidence and the check that now
 * prevents its recurrence.
 */
const CONSOLIDATED_CORRECTIONS = Object.freeze([
  Object.freeze({
    id: "NARRATION-1..9",
    class: "legal wording — narration reading the held form had drifted from its printed text",
    count: 9,
    landedIn: "all four representations of each affected scene: §6 narration, §7 HeyGen prompt, §8 caption cue text and the on-disk .vtt, §9 clean transcript",
    detail: Object.freeze([
      "V1 S1 — restored 'all real estate license holders', 'the following information', and the recipient list 'to prospective buyers, tenants, sellers and landlords'.",
      "V1 S4 — the three client-duty bullets had been compressed to noun phrases; read as printed, including 'including the broker's own interests'.",
      "V1 S6 — restored 'property' owner and the printed 'usually in a written listing to sell or property management agreement'.",
      "V1 S7 — restored the dropped subject ('the broker becomes the buyer or tenant's agent'), and removed a demonstrative the form does not print ('those fees' -> 'fees').",
      "V2 S3 — restored 'who performs' and both statutory triggers, 'before showing any residential property to the buyer or if no residential property will be shown, before presenting an offer on behalf of the buyer'.",
      "V2 S4 — the four conditions had lost their objects; condition 1 had lost 'either orally or in writing', which is the whole trap the unit teaches.",
      "V2 S5 — restored 'of the Texas Occupations Code' after section 1101.563.",
      "V3 S4 — restored 'to the transaction' at the close of the appointment bullet.",
      "V3 S6 — restored 'or any other information', 'specifically', and the statutory exception 'unless required to do so by law'.",
    ]),
    mostConsequential:
      "V3 S6. The earlier narration dropped 'unless required to do so by law' from a confidentiality rule WHILE THE HIGHLIGHT BOX AROUND THAT SUB-BULLET WAS SHOWING THE STUDENT THAT VERY EXCEPTION ON THE PAGE. Narration and image contradicted each other on a point of law. This is the defect class that justifies checks 1 and 2 existing at all.",
    preventedBy: "validator checks 1 and 2 — the four representations are re-derived and compared, and each repaired qualifier is tested by name in all four",
  }),
  Object.freeze({
    id: "NARRATION-10",
    class: "legal wording — narration reading the held statute had drifted from its enacted text",
    count: 1,
    landedIn: "V3 S2, all four representations",
    detail: Object.freeze([
      "Restored § 1101.561(b) as enacted: 'a broker must agree to act as an intermediary under this subchapter if the broker agrees to represent in a transaction a buyer or tenant and a seller or landlord'.",
    ]),
    note: "Counted separately from the nine. The nine are places narration was reading THE FORM; this one was reading the statute. Both counts are stated rather than merged so that a reviewer checking either figure finds it.",
    preventedBy: "validator check 2, entry R10",
  }),
  Object.freeze({
    id: "COORD-1..2",
    class: "crop geometry — a band edge cut a printed line in half",
    count: 2,
    landedIn: "iabs-1-2-document-overview.md §5.1, and the restated rows in Videos 2 and 3",
    detail: Object.freeze([
      "Band G foot 594 -> 592. 594 fell inside the printed line 'LICENSE HOLDER CONTACT INFORMATION: This notice is being provided...' (y 593.2-603.1).",
      "Band H head 588 -> 592. 588 fell inside 'limited to no more than 14 days.' (y 579.0-589.0).",
    ]),
    preventedBy: "validator check 4a — every printed line is tested against every band edge",
  }),
  Object.freeze({
    id: "COORD-3..6",
    class: "highlight geometry — a rectangle cut a printed word, or swept in text the narration was not reading",
    count: 4,
    landedIn: "§6 of the production files named",
    detail: Object.freeze([
      "V1 S4 — the parenthetical box at 'x ~300-481.8' began inside the word 'person'; now the measured x 237.7-481.8.",
      "V1 S9 — one box over two whole printed lines swept in the block label and the unrelated 'Please acknowledge receipt...' sentence; now two word-exact rectangles bounding only the narrated sentence.",
      "V2 S3 — one box cut off the sentence's opening words and swept in the unrelated 'Even if a written agreement is not required...' sentence; now three word-exact rectangles, the last around the single word 'Code.'",
      "V2 S4 — condition 3's box ran to y 547.1 and swallowed the conjunction 'and' that the form prints on a line of its own, marking two things at once; now stops at y 536.6, and that printed 'and' gets its own box in the closing 'all four' moment where the narration talks about it.",
    ]),
    preventedBy: "validator check 5 — no rectangle may cut a printed word, bound nothing, or remain stated as an estimate",
  }),
  Object.freeze({
    id: "COORD-7",
    class: "highlight geometry — a target that straddles a line break drawn as one loose box",
    count: 1,
    landedIn: "intermediary-brokerage.md §6, Scene 3",
    detail: Object.freeze([
      "V3 S3 — the inner cue on 'in conspicuous bold or underlined print' was estimated at 'x ~26.4-260', which marked only the phrase's second half and swept in five following words. The phrase straddles a line break, so it is now one cue in two word-exact rectangles: x 487.7-582.5 y 382.9-392.8 and x 26.4-95.1 y 393.2-403.2.",
    ]),
    preventedBy: "validator check 5",
  }),
  Object.freeze({
    id: "COORD-8",
    class: "crop geometry — the x window clipped the page footer, and the form number with it",
    count: 1,
    foundBy: "scripts/validate-loa-video-packages.mjs check 4b, at this freeze — NOT in the review addendum, which predates it",
    landedIn: "iabs-1-2-document-overview.md §5.1, with the recomputed composed scale factor and band heights; restated rows in Videos 2 and 3; video-instruction-plan.md §4 and §11",
    detail: Object.freeze([
      "Every draft gave one x window for every band, x0 = 20, x1 = 592, described as 'the full text column'. The page's footer line 'Regulated by the Texas Real Estate Commission Information available at www.trec.texas.gov IABS 1-2' runs to x 599.2, so a crop stopping at 592 clipped it — including the form number. Band H is the frame on which Video 1 reads the foot of the page.",
      "Band window is now x0 = 20, x1 = 600; iabs-full.png takes the whole 612-point media box. Composed scale factor 0.7255 -> 0.7155; band heights recomputed to A 177, B 117, C 180, D 238, E 338, F 355, G 292, H 570 px; effective resolution ~206 dpi.",
    ]),
    preventedBy: "validator check 4b — every printed line inside a band is tested against that band's own x window",
  }),
  Object.freeze({
    id: "DURATION-1",
    class: "metadata — a duration asserted beside a caption timeline that contradicted it",
    count: 1,
    landedIn: "video-instruction-plan.md §2, §3, §7; §6 scene table and §11 registry entry of each production file",
    detail: Object.freeze([
      "Plan v1 gave Video 1 a scene table totalling 3:01 while Video 1's own caption block ran to 3:17. Two figures for one video, asserted side by side.",
      "Fixed at the root rather than by correcting the instance: every scene duration and every video duration is now DERIVED from that video's caption cue timeline, with the scene matched to its cues by comparing narration against cue text. There is one timeline and the tables are a view of it.",
      "Durations after derivation: 3:30 / 3:03 / 3:20, total 9:53. Plan v1 said 3:01 / 2:53 / 3:10, total 9:04. The rise is the nine narration repairs restoring full printed wording, which takes longer to say.",
      "All of it remains PROVISIONAL: the cue timings are computed at 150 wpm with a 1.4-second readability floor, not measured from audio, because no render exists. No student- or reviewer-facing surface states a duration for any of these videos.",
    ]),
    preventedBy: "validator check 3 — every scene duration and every total is re-derived from the caption file and compared",
  }),
  Object.freeze({
    id: "PLACEMENT-1",
    class: "status — the plan understated what had been verified",
    count: 1,
    landedIn: "video-instruction-plan.md §5, §10; §3 of each production file",
    detail: Object.freeze([
      "Plan v1 said no law-of-agency-module-*-blocks.mjs existed and the screen ids were reservations. All twelve maps exist, generated from the frozen modules' own headings, and t02u5-s1, t05u3-s1 and t06u3-s1 exist with the type, title and content range the plan predicted.",
      "The retrieval separation is now derived rather than asserted: each unit's -s3 screen is generated as a retrieval screen carrying a questionId and NO content range and NO media field, two screens after the instruction screen the video attaches to.",
    ]),
    preventedBy: "validator check 8 — the block maps are read and the screen shapes re-derived",
  }),
  Object.freeze({
    id: "CAPTIONS-1",
    class: "status — the caption files existed on disk and the plan did not say so",
    count: 1,
    landedIn: "video-instruction-plan.md §6; §8 of each production file",
    detail: Object.freeze([
      "Three well-formed WebVTT files exist at video-production/captions/, 39 + 33 + 34 cues, each byte-identical to the vtt block in its production file's §8, each opening with a NOTE declaring the timings provisional.",
      "They are deliberately NOT at public/statecourse/media/ and their names carry '.provisional'. A caption file sitting at its shipping path with invented timings is the kind of thing that gets shipped by accident.",
    ]),
    preventedBy: "validator check 1 — the embedded and on-disk caption files are compared cue for cue",
  }),
]);

const sha = (p) => crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const rel = (p) => path.relative(root, p);
const hashOf = (p) => ({ path: rel(p), sha256: sha(p), bytes: fs.statSync(p).size });

/* ── the gate: refuse to freeze a package that does not validate ─────────────────────────────── */
const validation = spawnSync("node", [path.join(root, "scripts/validate-loa-video-packages.mjs"), "--json"], {
  maxBuffer: 64 * 1024 * 1024,
  encoding: "utf8",
});
let validated = null;
try {
  validated = JSON.parse(validation.stdout);
} catch {
  console.error("REFUSING TO FREEZE — the validator did not produce a result:");
  console.error(validation.stderr || validation.stdout);
  process.exit(1);
}
if (!validated.pass) {
  console.error("REFUSING TO FREEZE — the video packages do not validate:");
  for (const c of validated.checks.filter((x) => !x.pass)) {
    console.error(`  check ${c.n} — ${c.title}`);
    for (const f of c.findings) console.error(`    - ${f}`);
  }
  process.exit(1);
}

/* ── everything a render depends on ──────────────────────────────────────────────────────────── */
const artifacts = {
  "video instruction plan (v5, canonical)": hashOf(path.join(HOME, "video-instruction-plan.md")),

  "production file — video 1 IABS 1-2 Document Overview": hashOf(path.join(PROD, "iabs-1-2-document-overview.md")),
  "production file — video 2 Representation or Showing Only": hashOf(path.join(PROD, "representation-or-showing-only-2026.md")),
  "production file — video 3 Texas Intermediary Brokerage": hashOf(path.join(PROD, "intermediary-brokerage.md")),

  "captions — video 1 (provisional timings)": hashOf(path.join(PROD, "captions/tx-iabs-1-2-document-overview.provisional.vtt")),
  "captions — video 2 (provisional timings)": hashOf(path.join(PROD, "captions/tx-representation-or-showing-only-2026.provisional.vtt")),
  "captions — video 3 (provisional timings)": hashOf(path.join(PROD, "captions/tx-intermediary-brokerage.provisional.vtt")),

  "video 1 final QC record": hashOf(path.join(PROD, "qc/tx-iabs-1-2-document-overview-final.json")),
  "video 1 shipping MP4": hashOf(path.join(root, "public/statecourse/media/tx-iabs-1-2-document-overview.mp4")),
  "video 1 shipping poster": hashOf(path.join(root, "public/statecourse/media/tx-iabs-1-2-document-overview-poster.webp")),
  "video 1 shipping captions": hashOf(path.join(root, "public/statecourse/media/tx-iabs-1-2-document-overview.vtt")),
  "video 1 shipping transcript": hashOf(path.join(root, "public/statecourse/media/tx-iabs-1-2-document-overview.txt")),
  "video 3 final QC record": hashOf(path.join(PROD, "qc/tx-loa-v03-texas-intermediary-brokerage-final.json")),
  "video 3 shipping captions": hashOf(path.join(root, "public/statecourse/media/tx-loa-v03-texas-intermediary-brokerage.en.vtt")),
  "video 3 shipping transcript": hashOf(path.join(root, "public/statecourse/media/tx-loa-v03-texas-intermediary-brokerage.txt")),
  "Law of Agency screenMedia registry": hashOf(path.join(root, "config/texas/law-of-agency-screen-media.mjs")),
  "Law of Agency block-map wrapper": hashOf(path.join(root, "scripts/generate-tx-law-of-agency-block-maps.mjs")),

  /* The only permitted source of document pixels. If this changes, every crop, every highlight
     rectangle and every one of the fifty verified strings has to be re-measured. */
  "held form IABS 1-2 (the only permitted source of document pixels)": hashOf(path.join(root, "texas/trec-sources/forms/IABS-1-2.pdf")),
  "held statute OC.1101 (the source of every statutory quotation)": hashOf(path.join(root, "texas/trec-sources/statutes/OC.1101.htm")),
  "source inventory": hashOf(path.join(root, "texas/trec-sources/source-inventory.json")),

  /* The screens the videos name. A regenerated map that moved a screen id would silently unplace
     three videos, so the maps are hashed even though this freeze does not own them. */
  "block map — module 2 (t02u5-s1)": hashOf(path.join(root, "config/texas/law-of-agency-module-2-blocks.mjs")),
  "block map — module 5 (t05u3-s1)": hashOf(path.join(root, "config/texas/law-of-agency-module-5-blocks.mjs")),
  "block map — module 6 (t06u3-s1)": hashOf(path.join(root, "config/texas/law-of-agency-module-6-blocks.mjs")),

  /* The evidence that the package validates is only as stable as the script that produces it. */
  "validator": hashOf(path.join(root, "scripts/validate-loa-video-packages.mjs")),
  "block-map generator core (screenMedia hook built and validated)": hashOf(path.join(root, "scripts/lib/generate-tx-block-maps.mjs")),
  "screenMedia hook acceptance tests": hashOf(path.join(root, "tests/texas-video-integration.test.mjs")),

  /* Hashed as history, not as instruction. */
  "review addendum (SUPERSEDED — review history, not an operational dependency)": hashOf(path.join(PROD, "production-readiness-addendum.md")),
};

const VIDEOS = Object.freeze([
  Object.freeze({ n: 1, title: "IABS 1-2 Document Overview", stem: "tx-iabs-1-2-document-overview", unit: "T02U5", screen: "t02u5-s1", retrievalScreen: "t02u5-s3", derivedDuration: "3:30", measuredDuration: "3:15", renderStatus: "ACTIVE", scenes: 10, cues: 39 }),
  Object.freeze({ n: 2, title: "Representation or Showing Only: the 2026 decision", stem: "tx-representation-or-showing-only-2026", unit: "T05U3", screen: "t05u3-s1", retrievalScreen: "t05u3-s3", derivedDuration: "3:03", scenes: 7, cues: 33 }),
  Object.freeze({ n: 3, title: "Texas Intermediary Brokerage", stem: "tx-intermediary-brokerage", unit: "T06U3", screen: "t06u3-s1", retrievalScreen: "t06u3-s3", derivedDuration: "3:20", measuredDuration: "3:07", renderStatus: "ACTIVE_CLOUDFLARE_STREAM", scenes: 7, cues: 45 }),
]);

const freeze = {
  freezeId: FREEZE_ID,
  courseId: COURSE_ID,
  frozenOn: "2026-09-09",
  generatedBy: "scripts/freeze-loa-video-plan.mjs",
  what: "The video instruction plan and every artifact a render of the three Law of Agency videos depends on. This freeze is what scripts/freeze-loa-curriculum.mjs hashes in place of the plan itself, so that correcting a video does not require breaking a curriculum freeze.",

  /* No layer may borrow another's status. */
  status: {
    editorialAndLegalPackage: "READY — at this freeze and not before it. Script, HeyGen prompt, storyboard and scene table, clean transcript, caption cue text, crop coordinates, highlight coordinates, duration metadata and poster specification are complete, source-verified and internally consistent.",
    renderedAssets: "PARTIAL — Video 1 has a final local MP4, shipping .vtt, transcript and poster. Video 3 has an accepted Cloudflare Stream render, provider-managed poster, uploaded English track, local final .vtt and transcript. Video 2 remains pending.",
    screenMediaIntegrationSupport: "READY — scripts/lib/generate-tx-block-maps.mjs validates exact instruction-screen placement, optional/non-blocking delivery, complete local assets or a strict Cloudflare Stream URL, shipping captions, measured duration, explicit transcript, assessment separation and completed factual/visual/accessibility/logo-safety review. Eleven focused tests pass.",
    coursePlacementActivation: "PARTIAL — Video 1 is active at t02u5-s1 and Video 3 is active at t06u3-s1 as optional, non-blocking media. Video 2 has no shipping assets or block-map reference.",
    doNotSay: "'production-ready'. It collapses distinct asset, placement, course-approval and provider-approval layers into one.",
  },

  previousFreeze: PREVIOUS_FREEZE,
  supersedes: SUPERSEDES,
  consolidatedCorrections: CONSOLIDATED_CORRECTIONS,

  videos: VIDEOS,

  validation: {
    ranAt: "freeze time — this artifact is not written if any check fails",
    command: "node scripts/validate-loa-video-packages.mjs",
    checks: validated.checks.map((c) => ({
      n: c.n,
      title: c.title,
      pass: c.pass,
      notFullyMechanised: c.partial || null,
    })),
    checksPassing: `${validated.checks.filter((c) => c.pass).length}/${validated.checks.length}`,
    partial: validated.checks.filter((c) => c.partial).map((c) => c.n),
  },

  assessmentSeparation: {
    confirmed: true,
    derivedFrom: "the generated block maps themselves, re-read on every validator run",
    statement:
      "Retrieval happens on a separate screen. Each video attaches to its unit's -s1 instruction screen; the unit's practice screen -s2 follows; the retrieval check is -s3, which the generator emits as { id, sequence, type: 'retrieval', title, questionId } with NO content range and NO media field of any kind. When the student reaches the retrieval screen the video, the highlighted form and the five visible answers are no longer displayed — they belong to -s1, two screens behind.",
    placements: VIDEOS.map((v) => ({ video: v.n, instruction: v.screen, practice: `${v.unit.toLowerCase()}-s2`, retrieval: v.retrievalScreen })),
    alsoTrue: "No video contains a quiz question, a self-test, a poll, an answer or an answer recap. No answer is revealed immediately before a retrieval check. Every video ends on the avatar with no document and no panel on screen, so no highlight is up when the student is asked to retrieve.",
  },

  afterFreeze:
    "No video wording, coordinate, duration or shipping asset may change silently. A correction found later must break THIS freeze explicitly, name the artifact and the reason, re-run the validator, and create a new video-freeze version with new hashes. Because the curriculum freeze pins this artifact's hash, its dependency pointer must then be re-frozen under a new content-freeze id. Re-taking either freeze under the same id is forbidden — an id denoting two byte-states is not an identifier.",

  artifacts,

  reproduce: [
    "node scripts/validate-loa-video-packages.mjs",
    "node scripts/freeze-loa-video-plan.mjs",
    "node scripts/freeze-loa-curriculum.mjs",
  ],

  notApproved:
    "StateCourse holds no TREC approval for this course or as a qualifying education provider. Nothing in these videos, their captions, their posters, their transcripts, their production files or this artifact states or implies that the videos, the course, or StateCourse is approved, endorsed, reviewed or licensed by the Texas Real Estate Commission. The form shown is the Commission's; the instruction wrapped around it is StateCourse's.",
};

if (process.argv.includes("--write")) {
  fs.writeFileSync(OUT, `${JSON.stringify(freeze, null, 2)}\n`);
  console.log(`FROZEN — ${FREEZE_ID}`);
} else {
  if (!fs.existsSync(OUT)) {
    console.error("no video freeze artifact; run with --write");
    process.exit(1);
  }
  const onDisk = JSON.parse(fs.readFileSync(OUT, "utf8"));
  const drift = [];
  if (onDisk.freezeId !== FREEZE_ID) drift.push(`freeze id on disk is ${onDisk.freezeId}, this script writes ${FREEZE_ID}`);
  for (const [name, a] of Object.entries(artifacts)) {
    const was = onDisk.artifacts[name];
    if (!was) drift.push(`${name} (${a.path}) is not in the freeze`);
    else if (was.sha256 !== a.sha256) drift.push(`${name} (${a.path}) changed since the freeze`);
  }
  for (const name of Object.keys(onDisk.artifacts)) {
    if (!(name in artifacts)) drift.push(`${name} was frozen and is no longer hashed`);
  }
  if (drift.length) {
    console.error("VIDEO FREEZE DRIFT:");
    for (const d of drift) console.error(`  - ${d}`);
    process.exit(1);
  }
  console.log(`video freeze intact — ${onDisk.freezeId}`);
}

console.log(`  ${Object.keys(artifacts).length} artifacts · validator ${validated.checks.filter((c) => c.pass).length}/${validated.checks.length} · supersedes plan v1 ${SUPERSEDES.sha256.slice(0, 12)}…`);
console.log(`  editorial READY · rendered assets PARTIAL (2/3) · screenMedia integration READY · course placement PARTIAL (2/3)`);
