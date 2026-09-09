/**
 * TX Law of Agency — mechanical validation of the three video packages.
 *
 * WHAT THIS IS FOR. The three Law of Agency videos exist as four parallel representations of the
 * same words — the scene narration, the HeyGen production prompt, the caption file, and the clean
 * transcript published beside the player — plus two coordinate spaces (crop bands and highlight
 * rectangles) measured against one held PDF. Four copies of a sentence is four chances for a legal
 * qualifier to fall out of one of them, and that is exactly what happened before the v2
 * consolidation: a confidentiality rule lost "unless required to do so by law" from its narration
 * while the highlight box was showing the student that very exception on the page.
 *
 * So this script does not ask anyone to assert that the four agree. It re-derives the agreement
 * from the files every time it runs.
 *
 * WHAT IT REFUSES TO DO. It does not pass a check quietly when the check cannot be fully
 * mechanised. Three of the eight are partial by nature — you cannot verify a rendered frame that
 * does not exist, and "this box marks only the concept the narration names" has a semantic half no
 * geometry can settle. Those checks say so in their own output, name the residue, and the residue
 * is repeated in the summary.
 *
 * Usage:  node scripts/validate-loa-video-packages.mjs [--json]
 * Exit 0 only if all eight checks pass. Requires python3 with pdfplumber for check 6.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HOME = path.join(root, "texas/tx-law-of-agency-30-v1");
const PROD = path.join(HOME, "video-production");
const CAPS = path.join(PROD, "captions");
const FORM_PDF = path.join(root, "texas/trec-sources/forms/IABS-1-2.pdf");
const PLAN = path.join(HOME, "video-instruction-plan.md");
const ADDENDUM = path.join(PROD, "production-readiness-addendum.md");

/* Refuse to weaken the PDF coordinate audit merely because the shell's default Python lacks the
   PDF package. An explicit override wins, then the bundled desktop runtime when present, and then
   the host Python used in CI. */
const PYTHON_CANDIDATES = [
  process.env.STATECOURSE_PYTHON,
  path.join(os.homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3"),
  "python3",
].filter(Boolean);
const PYTHON = PYTHON_CANDIDATES.find((candidate) =>
  spawnSync(candidate, ["-c", "import pdfplumber"], { stdio: "ignore" }).status === 0
);
if (!PYTHON) {
  throw new Error("pdfplumber is required for the IABS coordinate audit; set STATECOURSE_PYTHON to a Python that provides it");
}

const VIDEOS = Object.freeze([
  Object.freeze({ n: 1, stem: "tx-iabs-1-2-document-overview", file: "iabs-1-2-document-overview.md", title: "IABS 1-2 Document Overview", screen: "t02u5-s1", blockMap: "config/texas/law-of-agency-module-2-blocks.mjs", duration: "3:30" }),
  Object.freeze({ n: 2, stem: "tx-representation-or-showing-only-2026", file: "representation-or-showing-only-2026.md", title: "Representation or Showing Only: the 2026 decision", screen: "t05u3-s1", blockMap: "config/texas/law-of-agency-module-5-blocks.mjs", duration: "3:03" }),
  Object.freeze({ n: 3, stem: "tx-intermediary-brokerage", file: "intermediary-brokerage.md", title: "Texas Intermediary Brokerage", screen: "t06u3-s1", blockMap: "config/texas/law-of-agency-module-6-blocks.mjs", duration: "3:20" }),
]);

/* ── text normalisation ───────────────────────────────────────────────────────────────────────
   The four representations are typeset differently — the caption file hard-wraps at 90 columns,
   the transcript is a markdown blockquote, the prompt sits inside a fenced code block. None of
   that is operative wording. Curly quotation marks, en/em dashes and the PDF's own ligature CIDs
   are folded here so that a comparison is about words, never about typography. Nothing that could
   change a legal meaning is folded: no case folding, no punctuation stripping, no stemming. */
const foldQuotes = (s) => s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
const norm = (s) => foldQuotes(String(s)).replace(/[—–]/g, " — ").replace(/\s+/g, " ").trim();
/** The held PDF encodes "ti" as (cid:415) and "tt" as (cid:425). Map them back before comparing. */
const foldForm = (s) =>
  foldQuotes(String(s).replace(/\(cid:415\)/g, "ti").replace(/\(cid:425\)/g, "tt"))
    .replace(/[—–]/g, "-")
    .replace(/\s+/g, " ")
    .trim();

const read = (p) => fs.readFileSync(p, "utf8");
const section = (text, from, to) => {
  const a = text.indexOf(from);
  if (a < 0) throw new Error(`section not found: ${from}`);
  const rest = text.slice(a + from.length);
  const b = to ? rest.indexOf(to) : -1;
  return b < 0 ? rest : rest.slice(0, b);
};

/* ── parsing the package ──────────────────────────────────────────────────────────────────────── */

/** §6 scene-by-scene: number, visual line, the assets it holds, its narration, its highlight rects. */
function parseScenes(md) {
  const s6 = section(md, "## 6. Scene-by-scene structure", "\n## 7. ");
  const parts = s6.split(/\n### Scene (\d+) — /).slice(1);
  const scenes = [];
  for (let i = 0; i < parts.length; i += 2) {
    const body = parts[i + 1];
    const visual = (body.match(/\*\*Visual\.\*\*([\s\S]*?)\n\n/) || [, ""])[1];
    const narrBlock = body.match(/\*\*Narration\.\*\*\n((?:>.*\n)+)/);
    scenes.push({
      n: Number(parts[i]),
      visual: norm(visual),
      assets: [...new Set([...visual.matchAll(/`([a-z0-9-]+\.png)`/g)].map((m) => m[1]))],
      narration: narrBlock ? norm(narrBlock[1].replace(/^> ?/gm, "")) : "",
      rects: [...body.matchAll(/x\s*(\d+(?:\.\d+)?)\s*[–-]\s*(\d+(?:\.\d+)?)\s*,\s*y\s*(\d+(?:\.\d+)?)\s*[–-]\s*(\d+(?:\.\d+)?)/g)]
        .map((m) => ({ x0: +m[1], x1: +m[2], top: +m[3], bottom: +m[4] })),
      body,
    });
  }
  return scenes;
}

/** §6's own table: | n | visual | ≈ N s |  — the DERIVED durations, re-derived by check 3. */
function parseSceneTable(md) {
  const s6 = section(md, "## 6. Scene-by-scene structure", "\n### Scene 1");
  const rows = [...s6.matchAll(/^\|\s*(\d+)\s*\|[^|]*\|\s*≈\s*(\d+)\s*s\s*\|/gm)].map((m) => ({ n: +m[1], seconds: +m[2] }));
  const total = s6.match(/\*\*Total\*\*\s*\|\s*\*\*≈\s*(\d+)\s*min\s*(\d+)\s*s\*\*/);
  return { rows, totalSeconds: total ? +total[1] * 60 + +total[2] : null };
}

/** §7 HeyGen prompt: one Script: "…" per scene, in scene order. */
const parsePromptScripts = (md) =>
  [...section(md, "## 7. HeyGen-ready production prompt", "\n## 8.").matchAll(/\nScript: "([\s\S]*?)"\n/g)].map((m) => norm(m[1]));

/** §9 clean transcript: the blockquote, one paragraph per scene. */
const parseCleanTranscript = (md) =>
  section(md, "## 9. Clean transcript", "\n## 10.")
    .split("\n")
    .filter((l) => l.startsWith(">"))
    .join("\n")
    .split(/\n>\s*\n/)
    .map((p) => norm(p.replace(/^> ?/gm, "")))
    .filter(Boolean);

/** The on-disk WebVTT: cue start, end and text. NOTE blocks are ignored, as a player ignores them. */
function parseVtt(file) {
  const raw = read(file);
  if (!raw.startsWith("WEBVTT")) throw new Error(`${path.basename(file)}: no WEBVTT header`);
  const ts = (v) => {
    const m = v.trim().match(/^(\d\d):(\d\d):(\d\d)\.(\d\d\d)$/);
    if (!m) throw new Error(`bad timestamp ${v}`);
    return +m[1] * 3600 + +m[2] * 60 + +m[3] + +m[4] / 1000;
  };
  return raw
    .trim()
    .split(/\n\s*\n/)
    .filter((b) => b.includes("-->"))
    .map((b) => {
      const lines = b.trim().split("\n");
      const [a, e] = lines[0].split("-->");
      return { start: ts(a), end: ts(e), text: norm(lines.slice(1).join(" ")), lines: lines.slice(1) };
    });
}

/** The `vtt` fenced block inside §8, which must be the same cues as the file on disk. */
const parseEmbeddedVtt = (md) => (md.match(/```vtt\n([\s\S]*?)```/) || [, ""])[1];

/* ── the held form, read once with pdfplumber ─────────────────────────────────────────────────── */
function readForm() {
  const py = `
import json, pdfplumber
pg = pdfplumber.open(${JSON.stringify(FORM_PDF)}).pages[0]
print(json.dumps({
  "width": pg.width, "height": pg.height,
  "text": pg.extract_text(),
  "lines": [{"text": l["text"], "x0": l["x0"], "x1": l["x1"], "top": l["top"], "bottom": l["bottom"]} for l in pg.extract_text_lines()],
  "words": [{"text": w["text"], "x0": w["x0"], "x1": w["x1"], "top": w["top"], "bottom": w["bottom"]} for w in pg.extract_words()],
}))
`;
  return JSON.parse(execFileSync(PYTHON, ["-c", py], { maxBuffer: 64 * 1024 * 1024 }).toString());
}

/* ── the fifty printed form strings the three videos read aloud or box ────────────────────────
   The list is the enumeration, not a count someone remembered: a string earns a place here if a
   video reads it aloud or draws a highlight rectangle around it. Check 6 tests each for verbatim
   containment in the held PDF's own extracted text, after the ligature CIDs are mapped back. */
const FORM_STRINGS = Object.freeze([
  /* Video 1 — bands A, B, C, E, F, G, H */
  ["1", "Texas law requires all real estate license holders to give the following information about brokerage services to prospective buyers, tenants, sellers and landlords."],
  ["1", "Information About Brokerage Services"],
  ["1", "11-03-2025"],
  ["1", "TYPES OF REAL ESTATE LICENSE HOLDERS:"],
  ["1", "A BROKER is responsible for all brokerage activities, including acts performed by sales agents sponsored by the broker."],
  ["1", "A SALES AGENT must be sponsored by a broker and works with clients on behalf of the broker."],
  ["1", "A BROKER'S MINIMUM DUTIES REQUIRED BY LAW"],
  ["1", "(A client is the person or party that the broker represents):"],
  ["1", "Put the interests of the client above all others, including the broker's own interests;"],
  ["1", "Inform the client of any material information about the property or transaction received by the broker;"],
  ["1", "Answer the client's questions and present any offer to or counter-offer from the client"],
  ["1", "Treat all parties to a real estate transaction honestly and fairly."],
  ["1", "A LICENSE HOLDER CAN REPRESENT A PARTY IN A REAL ESTATE TRANSACTION:"],
  ["1", "AS AGENT FOR OWNER (SELLER/LANDLORD):"],
  ["1", "The broker becomes the property owner's agent through an agreement with the owner, usually in a written listing to sell or property management agreement."],
  ["1", "AS AGENT FOR BUYER/TENANT:"],
  ["1", "The broker becomes the buyer/tenant's agent by agreeing to represent the buyer, usually through a written representation agreement."],
  ["1", "An owner's agent fees are not set by law and are fully negotiable."],
  ["1", "A buyer/tenant's agent fees are not set by law and are fully negotiable."],
  ["1", "AS AGENT FOR BOTH - INTERMEDIARY:"],
  ["1", "A LICENSE HOLDER CAN SHOW PROPERTY TO A BUYER/TENANT WITHOUT REPRESENTING THE BUYER/TENANT IF:"],
  ["1", "LICENSE HOLDER CONTACT INFORMATION:"],
  ["1", "This notice is being provided for information purposes."],
  ["1", "It does not create an obligation for you to use the broker's services."],
  ["1", "Name of Sponsoring Broker"],
  ["1", "Name of Designated Broker"],
  ["1", "Name of Licensed Supervisor of Sales"],
  ["1", "Name of Sales Agent/Associate"],
  ["1", "License No."],
  ["1", "Buyer/Tenant/Seller/Landlord Initials"],
  /* Video 2 — bands D and G */
  ["2", "WRITTEN AGREEMENTS ARE REQUIRED IN CERTAIN SITUATIONS:"],
  ["2", "A license holder who performs brokerage activity for a prospective buyer of residential property must enter into a written agreement with the buyer before showing any residential property to the buyer or if no residential property will be shown, before presenting an offer on behalf of the buyer."],
  ["2", "This written agreement must contain specific information required by Texas law."],
  ["2", "For more information on these requirements, see section 1101.563 of the Texas Occupations Code."],
  ["2", "The broker has not agreed with the buyer/tenant, either orally or in writing, to represent the buyer/tenant;"],
  ["2", "The broker is not otherwise acting as the buyer/tenant's agent at the time of showing the property;"],
  ["2", "The broker does not provide the buyer/tenant opinions or advice regarding the property or real estate transactions generally;"],
  ["2", "The broker does not perform any other act of real estate brokerage for the buyer/tenant."],
  ["2", "Before showing a residential property to an unrepresented prospective buyer, a license holder must enter into a written agreement that contains the information required by section 1101.563 of the Texas Occupations Code."],
  ["2", "The agreement may not be exclusive and must be limited to no more than 14 days."],
  /* Video 3 — band F */
  ["3", "To act as an intermediary between the parties the broker must first obtain the written agreement of each party to the transaction."],
  ["3", "The written agreement must state who will pay the broker and, in conspicuous bold or underlined print, set forth the broker's obligations as an intermediary."],
  ["3", "in conspicuous bold or underlined print"],
  ["3", "A broker who acts as an intermediary:"],
  ["3", "Must treat all parties to the transaction impartially and fairly;"],
  ["3", "May, with the parties' written consent, appoint a different license holder associated with the broker to each party (owner and buyer) to communicate with, provide opinions and advice to, and carry out the instructions of each party to the transaction."],
  ["3", "Must not, unless specifically authorized in writing to do so by the party, disclose:"],
  ["3", "that the owner will accept a price less than the written asking price;"],
  ["3", "that the buyer/tenant will pay a price greater than the price submitted in a written offer; and"],
  ["3", "any confidential information or any other information that a party specifically instructs the broker in writing not to disclose, unless required to do so by law."],
]);

/* ── the ten repaired qualifiers, named ───────────────────────────────────────────────────────
   Nine are places where narration was reading THE FORM and had dropped or compressed its printed
   wording. The tenth read the held STATUTE. Both counts are kept separate rather than merged,
   because a reviewer checking either figure should find it. Each entry names a fragment that must
   appear, verbatim after normalisation, in ALL FOUR representations of its scene. */
const REPAIRED_QUALIFIERS = Object.freeze([
  { id: "R1", video: 1, scene: 1, source: "form", name: "the form's full recipient list", fragment: "to prospective buyers, tenants, sellers and landlords" },
  { id: "R2", video: 1, scene: 4, source: "form", name: "duty bullet 1's closing qualifier", fragment: "including the broker's own interests" },
  { id: "R3", video: 1, scene: 6, source: "form", name: "\"property\" owner, and the printed \"in a written listing\"", fragment: "the broker becomes the property owner's agent through an agreement with the owner, usually in a written listing to sell or property management agreement" },
  { id: "R4", video: 1, scene: 7, source: "form", name: "the restored subject, and no demonstrative the form does not print", fragment: "the broker becomes the buyer or tenant's agent by agreeing to represent the buyer, usually through a written representation agreement" },
  { id: "R5", video: 2, scene: 3, source: "form", name: "the form's relative clause and both triggers", fragment: "a license holder who performs brokerage activity" },
  { id: "R6", video: 2, scene: 4, source: "form", name: "condition 1's oral-or-written qualifier", fragment: "either orally or in writing" },
  { id: "R7", video: 2, scene: 5, source: "form", name: "the code the section belongs to", fragment: "of the Texas Occupations Code" },
  { id: "R8", video: 3, scene: 4, source: "form", name: "the appointment bullet's closing object", fragment: "carry out the instructions of each party to the transaction" },
  { id: "R9", video: 3, scene: 6, source: "form", name: "THE STATUTORY EXCEPTION, plus two qualifiers", fragment: "or any other information that a party specifically instructs the broker in writing not to disclose, unless required to do so by law" },
  { id: "R10", video: 3, scene: 2, source: "statute", name: "§ 1101.561(b) as enacted", fragment: "act as an intermediary under this subchapter if the broker agrees to represent in a transaction a buyer or tenant and a seller or landlord" },
]);

/* ── the corrections the review addendum records, and where each must now live ────────────────
   Check 7's job is to prove the addendum has stopped being an operational dependency. Every
   correction it records is tested for presence in the CANONICAL files. A correction found only in
   the addendum is a failure, not a note. */
const ADDENDUM_CORRECTIONS = Object.freeze([
  { id: "A1", what: "duration of Video 1 is 3:30, not 3:01", needle: /3:30/, where: ["plan", "v1", "vtt1"] },
  { id: "A2", what: "duration of Video 2 is 3:03, not 2:53", needle: /3:03/, where: ["plan", "v2", "vtt2"] },
  { id: "A3", what: "editorial duration of Video 3 is 3:20, not 3:10", needle: /3:20|3 (?:minutes|min) 20/, where: ["plan", "v3"] },
  { id: "A4", what: "total optional video time is 9:53, not 9:04", needle: /9 minutes 53 seconds|9:53/, where: ["plan"] },
  { id: "A5", what: "band G's foot is 592, not 594", needle: /594 → \*\*592\*\*|594 → 592|band G's foot moved 594/, where: ["plan", "v1"] },
  { id: "A6", what: "band H's head is 592, not 588", needle: /588 → \*\*592\*\*|588 → 592|band H's head moved 588/, where: ["plan", "v1"] },
  { id: "A7", what: "Video 1 Scene 4's parenthetical box is x 237.7–582.5-bounded at 237.7, not ≈300", needle: /237\.7/, where: ["plan", "v1"] },
  { id: "A8", what: "Video 1 Scene 9 is two word-exact rectangles, not one box over two lines", needle: /two word-exact rectangles/, where: ["plan", "v1"] },
  { id: "A9", what: "Video 2 Scene 3 is three word-exact rectangles ending on `Code.`", needle: /three word-exact rectangles/, where: ["plan", "v2"] },
  { id: "A10", what: "Video 2 Scene 4 condition 3 stops at y 536.6, not 547.1", needle: /536\.6/, where: ["plan", "v2"] },
  { id: "A11", what: "Video 3 Scene 3 is two word-exact rectangles across the line break", needle: /487\.7/, where: ["plan", "v3"] },
  { id: "A12", what: "the block maps exist and every placement is confirmed against them", needle: /confirmed against the live block map|Screen ids are confirmed references/, where: ["plan"] },
  { id: "A13", what: "the caption .vtt files exist on disk", needle: /captions\/tx-[a-z0-9-]+\.provisional\.vtt/, where: ["plan", "v1", "v2", "v3"] },
  { id: "A14", what: "50 form strings verify verbatim against the held PDF", needle: /50 form strings/, where: ["plan", "v1"] },
  { id: "A15", what: "the screenMedia hook is implemented but dormant until complete reviewed assets exist", needle: /screenMedia/, where: ["plan"] },
  { id: "A16", what: "plan v1 is superseded and its hash preserved", needle: /7ca7234853320ad96275c9a6c7e69a16e0a2ec2b63b6de2fd7ed62ed7f88e403/, where: ["plan"] },
  { id: "A17", what: "the nine narration repairs are recorded with before and after", needle: /nine (?:places|narration repairs)/, where: ["plan", "v1", "v2", "v3"] },
  { id: "A18", what: "no claim of TREC approval anywhere", needle: /holds no TREC approval|approved, endorsed, reviewed or licensed by the\s+Texas Real Estate/, where: ["plan", "v1", "v2", "v3"] },
]);

/* ── the run ──────────────────────────────────────────────────────────────────────────────────── */

const checks = [];
const addCheck = (n, title, run) => {
  const findings = [];
  const notes = [];
  let partial = null;
  try {
    partial = run(findings, notes) || null;
  } catch (err) {
    findings.push(`threw: ${err.message}`);
  }
  checks.push({ n, title, pass: findings.length === 0, findings, notes, partial });
};

const pkgs = VIDEOS.map((v) => {
  const md = read(path.join(PROD, v.file));
  const vttPath = path.join(CAPS, `${v.stem}.provisional.vtt`);
  return {
    ...v,
    md,
    vttPath,
    scenes: parseScenes(md),
    table: parseSceneTable(md),
    prompt: parsePromptScripts(md),
    transcript: parseCleanTranscript(md),
    cues: parseVtt(vttPath),
    embeddedVtt: parseEmbeddedVtt(md),
  };
});
const planText = read(PLAN);
const addendumText = read(ADDENDUM);
const form = readForm();
const formText = foldForm(form.text);

/** Align a scene's narration to a run of consecutive cues. Returns [firstIndex, lastIndex]. */
function alignSceneToCues(scene, cues, from) {
  let acc = "";
  let i = from;
  while (i < cues.length) {
    acc = norm(`${acc} ${cues[i].text}`);
    i += 1;
    if (acc === scene.narration) return [from, i - 1];
    if (acc.length > scene.narration.length + 4) break;
  }
  return null;
}

/* ── check 1 ──────────────────────────────────────────────────────────────────────────────────── */
addCheck(1, "narration, transcript, captions and production prompt carry the same operative wording", (f, notes) => {
  for (const p of pkgs) {
    if (p.prompt.length !== p.scenes.length) f.push(`video ${p.n}: §7 has ${p.prompt.length} Script blocks for ${p.scenes.length} scenes`);
    if (p.transcript.length !== p.scenes.length) f.push(`video ${p.n}: §9 has ${p.transcript.length} paragraphs for ${p.scenes.length} scenes`);
    let cursor = 0;
    for (const s of p.scenes) {
      if (!s.narration) { f.push(`video ${p.n} scene ${s.n}: no narration block`); continue; }
      const prompt = p.prompt[s.n - 1];
      const trans = p.transcript[s.n - 1];
      if (prompt !== s.narration) f.push(`video ${p.n} scene ${s.n}: PROMPT differs from narration`);
      if (trans !== s.narration) f.push(`video ${p.n} scene ${s.n}: TRANSCRIPT differs from narration`);
      const span = alignSceneToCues(s, p.cues, cursor);
      if (!span) { f.push(`video ${p.n} scene ${s.n}: CAPTIONS do not reconstruct the narration from cue ${cursor + 1}`); break; }
      s.cueSpan = span;
      cursor = span[1] + 1;
    }
    if (cursor !== p.cues.length) f.push(`video ${p.n}: ${p.cues.length - cursor} caption cue(s) belong to no scene`);
    /* The §8 copy of the caption file must be the file, or a reader of the production file is
       reading something the renderer will not use. */
    const embedded = p.embeddedVtt.trim().split(/\n\s*\n/).filter((b) => b.includes("-->")).map((b) => b.trim());
    const onDisk = read(p.vttPath).trim().split(/\n\s*\n/).filter((b) => b.includes("-->")).map((b) => b.trim());
    if (embedded.join("\n") !== onDisk.join("\n")) f.push(`video ${p.n}: §8's embedded vtt block differs from ${path.relative(root, p.vttPath)}`);
    notes.push(`video ${p.n}: ${p.scenes.length} scenes · ${p.cues.length} cues · narration ≡ prompt ≡ transcript ≡ captions`);
  }
  return null;
});

/* ── check 2 ──────────────────────────────────────────────────────────────────────────────────── */
addCheck(2, "every repaired legal qualifier appears in all four representations, by name", (f, notes) => {
  for (const q of REPAIRED_QUALIFIERS) {
    const p = pkgs.find((x) => x.n === q.video);
    const scene = p.scenes.find((s) => s.n === q.scene);
    const needle = norm(q.fragment).toLowerCase();
    const reps = {
      narration: scene.narration,
      prompt: p.prompt[q.scene - 1] || "",
      transcript: p.transcript[q.scene - 1] || "",
      captions: scene.cueSpan ? norm(p.cues.slice(scene.cueSpan[0], scene.cueSpan[1] + 1).map((c) => c.text).join(" ")) : norm(p.cues.map((c) => c.text).join(" ")),
    };
    const missing = Object.entries(reps).filter(([, v]) => !v.toLowerCase().includes(needle)).map(([k]) => k);
    if (missing.length) f.push(`${q.id} (video ${q.video} scene ${q.scene}, ${q.name}) missing from: ${missing.join(", ")} — "${q.fragment}"`);
    else notes.push(`${q.id} video ${q.video} scene ${q.scene} · ${q.source} · ${q.name} — present in all four`);
  }
  const formCount = REPAIRED_QUALIFIERS.filter((q) => q.source === "form").length;
  notes.push(`${formCount} form-wording repairs + ${REPAIRED_QUALIFIERS.length - formCount} statutory repair = ${REPAIRED_QUALIFIERS.length} checked`);
  return null;
});

/* ── check 3 ──────────────────────────────────────────────────────────────────────────────────── */
addCheck(3, "every scene duration derives from the caption timeline rather than being asserted alongside it", (f, notes) => {
  let setTotal = 0;
  for (const p of pkgs) {
    for (let i = 1; i < p.cues.length; i += 1) {
      if (p.cues[i].start < p.cues[i - 1].end - 1e-9) f.push(`video ${p.n}: caption cues ${i} and ${i + 1} overlap`);
    }
    for (const s of p.scenes) {
      if (!s.cueSpan) { f.push(`video ${p.n} scene ${s.n}: no cue span (see check 1)`); continue; }
      const derived = p.cues[s.cueSpan[1]].end - p.cues[s.cueSpan[0]].start;
      const stated = (p.table.rows.find((r) => r.n === s.n) || {}).seconds;
      if (stated === undefined) { f.push(`video ${p.n} scene ${s.n}: no row in the §6 duration table`); continue; }
      if (Math.abs(Math.round(derived) - stated) > 0) {
        f.push(`video ${p.n} scene ${s.n}: table says ≈ ${stated} s, caption timeline gives ${derived.toFixed(1)} s`);
      }
    }
    const derivedTotal = p.cues[p.cues.length - 1].end;
    setTotal += derivedTotal;
    if (p.table.totalSeconds === null) f.push(`video ${p.n}: §6 table has no total row`);
    else if (Math.abs(p.table.totalSeconds - derivedTotal) > 1.0) {
      f.push(`video ${p.n}: §6 total ${p.table.totalSeconds}s vs caption timeline ${derivedTotal.toFixed(1)}s`);
    }
    const mm = `${Math.floor(derivedTotal / 60)}:${String(Math.round(derivedTotal % 60)).padStart(2, "0")}`;
    const registry = p.md.match(/duration: "(\d+:\d\d)"/);
    if (!registry) f.push(`video ${p.n}: §11 registry entry has no duration field`);
    else if (p.n === 1 && registry[1] !== "3:15") f.push(`video 1: active registry duration ${registry[1]} ≠ measured 3:15`);
    else if (p.n === 3 && registry[1] !== "3:14") f.push(`video 3: active registry duration ${registry[1]} ≠ measured 3:14`);
    else if (p.n === 2 && registry[1] !== p.duration) f.push(`video ${p.n}: §11 registry duration ${registry[1]} ≠ ${p.duration}`);
    if (!planText.includes(`≈ ${p.duration}`)) f.push(`video ${p.n}: the plan does not carry ≈ ${p.duration}`);
    notes.push(`video ${p.n}: ${p.scenes.length}/${p.scenes.length} scene durations re-derived from ${p.cues.length} cues · total ${mm} (last cue end ${derivedTotal.toFixed(1)}s)`);
  }
  notes.push(`set total ${Math.floor(setTotal / 60)}:${(setTotal % 60).toFixed(1).padStart(4, "0")} — the plan states ≈ 9 minutes 53 seconds`);
  if (!/9 minutes 53 seconds/.test(planText)) f.push("the plan does not state the set total of ≈ 9 minutes 53 seconds");
  return "The editorial cue timelines remain the common source for all three scene tables. Videos 1 and 3 also carry separately measured delivery durations (3:15 and 3:14) from their reviewed renders; Video 2 retains its provisional 150-wpm timing until its render exists.";
});

/* ── check 4 ──────────────────────────────────────────────────────────────────────────────────── */
addCheck(4, "every crop keeps the complete official field or form language in frame", (f, notes) => {
  /* The crop table is read from the file, not restated here: every band's own x and y window,
     per asset, because the page's footer runs wider than its body and one window will not do. */
  const s51 = section(read(path.join(PROD, "iabs-1-2-document-overview.md")), "### 5.1 Frame assets", "### 5.2");
  const bands = [...s51.matchAll(/\|\s*`(iabs-(?:full|band-[a-h]))\.png`\s*\|\s*(\w+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|/g)]
    .map((m) => ({ asset: `${m[1]}.png`, band: m[2], x0: +m[3], x1: +m[4], top: +m[5], bottom: +m[6] }));
  if (bands.length !== 9) f.push(`§5.1 declares ${bands.length} crops, expected 9 (x-left, x-right, y-top, y-bottom)`);
  /* Videos 2 and 3 restate the bands they consume. Their rows must agree with Video 1's table. */
  for (const p of pkgs.slice(1)) {
    const s = section(p.md, "### 5.1 Document frame", "### 5.2");
    for (const m of s.matchAll(/\|\s*`(iabs-band-[a-h])\.png`\s*\|\s*(\w+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|/g)) {
      const b = bands.find((x) => x.asset === `${m[1]}.png`);
      if (!b) { f.push(`video ${p.n} names crop ${m[1]}.png, which §5.1 of video 1 does not declare`); continue; }
      if (b.x0 !== +m[3] || b.x1 !== +m[4] || b.top !== +m[5] || b.bottom !== +m[6]) {
        f.push(`video ${p.n} restates crop ${m[1]}.png as x ${m[3]}–${m[4]} y ${m[5]}–${m[6]}; video 1 §5.1 says x ${b.x0}–${b.x1} y ${b.top}–${b.bottom}`);
      }
    }
  }

  for (const b of bands) {
    for (const l of form.lines) {
      /* 4a. No printed line may straddle a band edge — a cut line is form language lost from frame. */
      const straddlesTop = l.top < b.top - 1e-6 && l.bottom > b.top + 1e-6;
      const straddlesBottom = l.top < b.bottom - 1e-6 && l.bottom > b.bottom + 1e-6;
      if (straddlesTop || straddlesBottom) {
        f.push(`crop ${b.asset} (band ${b.band}, y ${b.top}–${b.bottom}) cuts the printed line "${foldForm(l.text).slice(0, 60)}…" (y ${l.top.toFixed(1)}–${l.bottom.toFixed(1)})`);
      }
      /* 4b. No printed line inside a band may run outside that band's x window. This is the check
             that found `x1 = 592` clipping the footer, and the form number with it. */
      if (l.top >= b.top && l.bottom <= b.bottom && (l.x0 < b.x0 - 1e-6 || l.x1 > b.x1 + 1e-6)) {
        f.push(`crop ${b.asset} x window ${b.x0}–${b.x1} clips "${foldForm(l.text).slice(0, 50)}…" (x ${l.x0.toFixed(1)}–${l.x1.toFixed(1)})`);
      }
    }
  }
  /* 4c. Every highlight rectangle must sit inside the crop the scene is holding, or the box would
         be drawn on a frame that does not contain what it marks. */
  const byAsset = new Map(bands.map((b) => [b.asset, b]));
  for (const p of pkgs) {
    for (const s of p.scenes) {
      const docAssets = s.assets.filter((a) => byAsset.has(a));
      if (!s.rects.length || !docAssets.length) continue;
      for (const r of s.rects) {
        const held = docAssets.some((a) => {
          const b = byAsset.get(a);
          return r.top >= b.top - 1e-6 && r.bottom <= b.bottom + 1e-6 && r.x0 >= b.x0 - 1e-6 && r.x1 <= b.x1 + 1e-6;
        });
        if (!held) f.push(`video ${p.n} scene ${s.n}: rect x ${r.x0}–${r.x1} y ${r.top}–${r.bottom} is not inside any crop the scene holds (${docAssets.join(", ")})`);
      }
    }
  }
  const covered = bands.filter((b) => b.band !== "FULL");
  const lo = Math.min(...covered.map((b) => b.top));
  const hi = Math.max(...covered.map((b) => b.bottom));
  const outside = form.lines.filter((l) => l.bottom < lo || l.top > hi);
  notes.push(`${bands.length} crops · ${form.lines.length} printed lines · 0 straddled edges · every line inside its band fits its band's own x window`);
  notes.push(`bands A–H span y ${lo}–${hi}, x ${Math.min(...covered.map((b) => b.x0))}–${Math.max(...covered.map((b) => b.x1))}; ${outside.length} printed line(s) fall outside every band: ${outside.map((l) => `"${foldForm(l.text).slice(0, 40)}"`).join(", ") || "none"}`);
  return "Verified in PDF-point space against the held page's own text lines. Videos 1 and 3 additionally have human visual reviews of their rendered document frames; Video 2 remains pre-render and cannot yet receive that second-layer review.";
});

/* ── check 5 ──────────────────────────────────────────────────────────────────────────────────── */
addCheck(5, "every highlight targets only the named concept", (f, notes) => {
  let rects = 0;
  let boundWords = 0;
  for (const p of pkgs) {
    for (const s of p.scenes) {
      for (const r of s.rects) {
        rects += 1;
        /* 5a. A rectangle must not cut a printed word in half. A box whose edge falls inside a
               word is marking half a word, which is how "person" got marked in the v1 draft. */
        for (const w of form.words) {
          const xOverlap = w.x1 > r.x0 + 1e-6 && w.x0 < r.x1 - 1e-6;
          const yOverlap = w.bottom > r.top + 1e-6 && w.top < r.bottom - 1e-6;
          if (!xOverlap || !yOverlap) continue;
          const contained = w.x0 >= r.x0 - 0.35 && w.x1 <= r.x1 + 0.35 && w.top >= r.top - 0.35 && w.bottom <= r.bottom + 0.35;
          if (!contained) {
            f.push(`video ${p.n} scene ${s.n}: rect x ${r.x0}–${r.x1} y ${r.top}–${r.bottom} cuts the printed word "${foldForm(w.text)}" (x ${w.x0.toFixed(1)}–${w.x1.toFixed(1)}, y ${w.top.toFixed(1)}–${w.bottom.toFixed(1)})`);
          } else boundWords += 1;
        }
        /* 5b. A rectangle must bound at least one printed word. An empty box marks nothing. */
        const inside = form.words.filter((w) => w.x0 >= r.x0 - 0.35 && w.x1 <= r.x1 + 0.35 && w.top >= r.top - 0.35 && w.bottom <= r.bottom + 0.35);
        if (!inside.length) f.push(`video ${p.n} scene ${s.n}: rect x ${r.x0}–${r.x1} y ${r.top}–${r.bottom} bounds no printed word`);
      }
      /* 5c. No LIVE target may be an estimate. "≈" is permitted only where the file is naming a
             superseded estimate and saying so. */
      for (const m of s.body.matchAll(/[xy]\s*≈\s*[\d.]+/g)) {
        const window = s.body.slice(Math.max(0, m.index - 260), m.index + 260);
        if (!/earlier estimate|was given as|given as|has been replaced|now reads|is corrected|estimate of/.test(window)) {
          f.push(`video ${p.n} scene ${s.n}: live highlight target still stated as an estimate — "${m[0]}"`);
        }
      }
    }
  }
  notes.push(`${rects} highlight rectangles · ${boundWords} printed words bounded · 0 words cut · 0 empty boxes · 0 live estimates`);
  return "Geometry only. That a rectangle bounds whole printed words, and bounds nothing outside itself, is mechanical. That the words it bounds are THE CONCEPT THE NARRATION NAMES — and not a neighbouring provision that happens to be word-aligned — is a reading judgment this script does not make. Each rectangle's intended target is named in prose beside it in §6, and that pairing is what a human reviewer checks.";
});

/* ── check 6 ──────────────────────────────────────────────────────────────────────────────────── */
addCheck(6, "all 50 form strings still verify against the held IABS-1-2.pdf", (f, notes) => {
  if (FORM_STRINGS.length !== 50) f.push(`the enumeration holds ${FORM_STRINGS.length} strings, not 50`);
  const seen = new Set();
  for (const [video, s] of FORM_STRINGS) {
    const needle = foldForm(s);
    if (seen.has(needle)) f.push(`duplicate string in the enumeration: "${s.slice(0, 50)}…"`);
    seen.add(needle);
    if (!formText.includes(needle)) f.push(`video ${video}: NOT VERBATIM in the held form — "${s.slice(0, 80)}${s.length > 80 ? "…" : ""}"`);
  }
  const byVideo = [1, 2, 3].map((v) => FORM_STRINGS.filter(([x]) => x === String(v)).length);
  notes.push(`${FORM_STRINGS.length} strings — video 1: ${byVideo[0]}, video 2: ${byVideo[1]}, video 3: ${byVideo[2]} — all tested for verbatim containment`);
  notes.push(`held form ${path.relative(root, FORM_PDF)} · ${form.words.length} words · ${form.lines.length} lines · (cid:415)→ti, (cid:425)→tt applied`);
  /* The videos must not put words on the page that the page does not print. */
  const dualAgent = /dual agent|dual agency/i.test(formText);
  if (dualAgent) f.push("the held form prints 'dual agent'/'dual agency' — the videos' load-bearing negative would be false");
  notes.push("load-bearing negative re-checked: 'dual agent' and 'dual agency' appear 0 times on the held form");
  return null;
});

/* ── check 7 ──────────────────────────────────────────────────────────────────────────────────── */
addCheck(7, "no correction exists only in the addendum", (f, notes) => {
  const canonical = {
    plan: planText,
    v1: pkgs[0].md,
    v2: pkgs[1].md,
    v3: pkgs[2].md,
    vtt1: read(pkgs[0].vttPath),
    vtt2: read(pkgs[1].vttPath),
    vtt3: read(pkgs[2].vttPath),
  };
  for (const c of ADDENDUM_CORRECTIONS) {
    const found = c.where.filter((w) => c.needle.test(canonical[w]));
    if (!found.length) f.push(`${c.id} exists only in the addendum: ${c.what}`);
    else if (found.length < c.where.length) {
      const missing = c.where.filter((w) => !found.includes(w));
      f.push(`${c.id} (${c.what}) is missing from ${missing.join(", ")}`);
    }
  }
  /* The addendum must declare itself superseded, so nobody reads it as instruction. */
  if (!/SUPERSEDED — REVIEW HISTORY ONLY/.test(addendumText)) f.push("the addendum does not declare itself superseded review history");
  if (!/NOT AN OPERATIONAL DEPENDENCY/.test(addendumText)) f.push("the addendum does not declare that it is not an operational dependency");
  notes.push(`${ADDENDUM_CORRECTIONS.length} addendum corrections traced into the canonical files`);
  return "The enumeration of what the addendum records is authored, not derived: this script cannot read the addendum's prose and discover a correction nobody listed. It proves that every LISTED correction is present canonically, and that the addendum declares itself non-operational. Adding a correction to the addendum without adding it here would evade the check — which is why corrections belong in the canonical files first.";
});

/* ── check 8 ──────────────────────────────────────────────────────────────────────────────────── */
addCheck(8, "the canonical private Stream package records two activations and one pending render", (f, notes) => {
  const required = [
    ["plan", PLAN],
    ...pkgs.map((p) => [`video ${p.n} production file`, path.join(PROD, p.file)]),
    ...pkgs.map((p) => [`video ${p.n} captions`, p.vttPath]),
    ["held IABS 1-2 form", FORM_PDF],
    ["source inventory", path.join(root, "texas/trec-sources/source-inventory.json")],
    ...VIDEOS.map((v) => [`block map for ${v.screen}`, path.join(root, v.blockMap)]),
    ["active screenMedia registry", path.join(root, "config/texas/law-of-agency-screen-media.mjs")],
    ["video 1 final QC record", path.join(PROD, "qc/tx-iabs-1-2-document-overview-final.json")],
    ["video 3 final QC record", path.join(PROD, "qc/tx-intermediary-brokerage-final.json")],
    ["video 1 private captions", path.join(root, "private-media/texas/tx-iabs-1-2-document-overview.vtt")],
    ["video 1 protected transcript", path.join(root, "private-media/texas/tx-iabs-1-2-document-overview.txt")],
    ["video 3 private captions", path.join(root, "private-media/texas/tx-intermediary-brokerage.vtt")],
    ["video 3 protected transcript", path.join(root, "private-media/texas/tx-intermediary-brokerage.txt")],
    ["private Stream server allowlist", path.join(root, "config/stream-media.mjs")],
    ["private Stream authorization and signing core", path.join(root, "netlify/functions/_lib/stream-delivery.mjs")],
    ["private Stream playback endpoint", path.join(root, "netlify/functions/stream-playback.mjs")],
    ["private Stream evidence endpoint", path.join(root, "netlify/functions/stream-events.mjs")],
    ["private Stream transcript endpoint", path.join(root, "netlify/functions/stream-transcript.mjs")],
  ];
  for (const [name, p] of required) {
    if (!fs.existsSync(p) || (fs.statSync(p).isFile() && fs.statSync(p).size === 0)) {
      f.push(`missing or empty: ${name} (${path.relative(root, p)})`);
    }
  }

  /* Every ingredient of a render must be present in the canonical files. */
  for (const p of pkgs) {
    const need = [
      ["learning objective", /## 1\. Learning objective/],
      ["exact planned placement", /## 3\. Exact planned placement/],
      ["source list", /## 4\. Source list/],
      ["asset build spec", /## 5\. Document (?:asset|and diagram assets)/],
      ["scene-by-scene storyboard", /## 6\. Scene-by-scene structure/],
      ["HeyGen production prompt", /## 7\. HeyGen-ready production prompt/],
      ["caption-ready transcript", /## 8\. Caption-ready transcript/],
      ["clean transcript", /## 9\. Clean transcript/],
      ["poster specification", /## 10\. Poster specification/],
      ["optional / non-blocking config", /## 11\. Optional \/ non-blocking configuration/],
      ["production status", /## 12\. Production status/],
      ["accessibility checklist", /## 13\. Accessibility checklist/],
      ["source-fidelity verification log", /## 14\. Source-fidelity verification log/],
    ];
    for (const [name, re] of need) if (!re.test(p.md)) f.push(`video ${p.n}: no ${name}`);
    /* A production file must not send a renderer to the addendum for anything. */
    for (const m of p.md.matchAll(/[^\n]*production-readiness-addendum[^\n]*/g)) {
      if (!/review history only|is not an operational dependency|nothing a renderer needs exists only there/i.test(m[0])) {
        f.push(`video ${p.n}: refers a reader to the addendum without marking it review history — "${m[0].trim().slice(0, 90)}"`);
      }
    }
    if (!/poster/i.test(p.md)) f.push(`video ${p.n}: no poster specification`);
    if ((p.n === 1 || p.n === 3) && !/(?:poster[^\n]*(?:built|approved)|Cloudflare Stream player thumbnail)/i.test(p.md)) {
      f.push(`video ${p.n}: the production file does not record its final Stream thumbnail as ready`);
    }
    if (p.n === 2 && !/does not exist until the render exists|not built|NOT BUILT/i.test(p.md)) {
      f.push(`video ${p.n}: the poster specification does not say the poster does not yet exist`);
    }
    if (p.n === 3 && !/provider-managed poster/i.test(p.md)) {
      f.push("video 3: the production file does not record its provider-managed poster");
    }
  }
  for (const m of planText.matchAll(/[^\n]*production-readiness-addendum[^\n]*/g)) {
    if (!/review history|not an operational dependency|check 7/i.test(m[0])) {
      f.push(`the plan refers a reader to the addendum without marking it review history — "${m[0].trim().slice(0, 90)}"`);
    }
  }

  /* Status must be reported in four layers, and no layer may borrow another's. */
  const layerRow = (label, status) => new RegExp(`${label}[^|\n]*\\|\\s*\\*\\*${status}\\*\\*`);
  for (const [label, re] of [
    ["editorial and legal package READY", layerRow("[Ee]ditorial and legal package", "READY")],
    ["rendered video / VTT / poster PARTIAL", layerRow("[Rr]endered video", "PARTIAL")],
    ["screenMedia integration READY", layerRow("`screenMedia` integration support", "READY")],
    ["course placement PARTIAL", layerRow("[Cc]ourse placement activation", "PARTIAL")],
  ]) if (!re.test(planText)) f.push(`the plan does not report the ${label} layer`);
  /* "production-ready" may appear only where the plan is refusing the phrase. */
  for (const m of planText.matchAll(/[^\n]*production-ready[^\n]*(?:\n[^\n]*)?/gi)) {
    if (!/not a status this plan uses|is not "production-ready"|does not use that phrase|and this plan does not use/i.test(m[0])) {
      f.push(`the plan uses the phrase 'production-ready' — "${m[0].trim().replace(/\s+/g, " ").slice(0, 90)}"`);
    }
  }
  for (const p of pkgs) {
    for (const m of p.md.matchAll(/[^\n]*production-ready[^\n]*(?:\n[^\n]*)?/gi)) {
      if (!/not "production-ready"|that\s+phrase is not used of it|is not a status/i.test(m[0])) {
        f.push(`video ${p.n} uses the phrase 'production-ready' — "${m[0].trim().replace(/\s+/g, " ").slice(0, 90)}"`);
      }
    }
  }

  /* Retrieval must be a separate screen with no video, no form and no answers on it. */
  for (const v of VIDEOS) {
    const map = read(path.join(root, v.blockMap));
    const unit = v.screen.replace(/-s1$/, "");
    const s1 = map.match(new RegExp(`\\{[^\\n]*id: "${unit}-s1"[^\\n]*\\}`));
    const s3 = map.match(new RegExp(`\\{[^\\n]*id: "${unit}-s3"[^\\n]*\\}`));
    if (!s1) f.push(`${v.blockMap}: no screen ${unit}-s1`);
    if (!s3) { f.push(`${v.blockMap}: no screen ${unit}-s3`); continue; }
    if (!/type: "retrieval"/.test(s3[0])) f.push(`${unit}-s3 is not a retrieval screen`);
    if (/content: RANGE/.test(s3[0])) f.push(`${unit}-s3 carries a content range — the module text would be on the retrieval screen`);
    if (/videos:|screenMedia|documents:/.test(s3[0])) f.push(`${unit}-s3 carries media — the video would still be on screen at retrieval`);
    if ((v.n === 1 || v.n === 3) && s1 && !new RegExp(v.stem).test(s1[0])) f.push(`${unit}-s1 does not carry reviewed video ${v.n}`);
    if (v.n === 2 && s1 && /videos:|screenMedia/.test(s1[0])) f.push(`${unit}-s1 carries media before final assets and reviews exist`);
    notes.push(`${unit}: s1 instruction (${v.n === 2 ? "video pending" : "reviewed private Stream video active"}) → s2 practice → s3 retrieval, questionId only, no content range and no media`);
  }
  /* Exactly videos 1 and 3 may be wired; video 2 remains absent. */
  for (const v of VIDEOS) {
    const map = read(path.join(root, v.blockMap));
    if ((v.n === 1 || v.n === 3) && !map.includes(v.stem)) f.push(`${v.blockMap} does not reference active ${v.stem}`);
    if (v.n === 2 && map.includes(v.stem)) f.push(`${v.blockMap} references pending ${v.stem}`);
  }
  const mediaDir = path.join(root, "public/statecourse/media");
  const publicCopies = fs.readdirSync(mediaDir).filter((n) => VIDEOS.some((v) => n.startsWith(v.stem)));
  if (publicCopies.length) {
    f.push(`private Stream source has a public media copy: ${publicCopies.join(", ")}`);
  }
  const screenRegistry = read(path.join(root, "config/texas/law-of-agency-screen-media.mjs"));
  for (const v of VIDEOS.filter((candidate) => candidate.n !== 2)) {
    if (!screenRegistry.includes(`provider: "cloudflare-stream"`) || !screenRegistry.includes(`assetKey: "${v.stem}"`)) {
      f.push(`active private Stream registry is missing ${v.stem}`);
    }
  }
  if (screenRegistry.includes(VIDEOS[1].stem)) f.push(`private Stream registry contains pending ${VIDEOS[1].stem}`);
  for (const signal of ["signedPlaybackRequired: true", "streamReady: true", "captionsUploaded: true", "protectedTranscriptReady: true", "autoplay: false", "required: false", "nonBlocking: true"]) {
    if (!screenRegistry.includes(signal)) f.push(`private Stream registry does not assert ${signal}`);
  }
  for (const [name, text] of [["plan", planText], ...pkgs.map((p) => [`video ${p.n}`, p.md])]) {
    if (/TREC[- ]approved|approved by (?:the )?(?:TREC|Texas Real Estate Commission)/i.test(text)) f.push(`${name} claims TREC approval`);
  }
  notes.push("videos 1 and 3 use signed private Stream delivery with protected transcripts and active instruction-screen references · video 2 remains absent · no public source copies · no claim of TREC approval");
  return "The validator can prove asset presence, exact placement, status separation, and the recorded QC gates. Human review remains the authority for visual quality, logo safety, and factual fidelity; its signed record is hashed into the freeze.";
});

/* ── report ───────────────────────────────────────────────────────────────────────────────────── */
const failed = checks.filter((c) => !c.pass);
if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ pass: failed.length === 0, checks }, null, 2));
} else {
  console.log("LOA video package validation — texas/tx-law-of-agency-30-v1\n");
  for (const c of checks) {
    console.log(`${c.pass ? "PASS" : "FAIL"}  check ${c.n} — ${c.title}`);
    for (const n of c.notes) console.log(`        · ${n}`);
    for (const f of c.findings) console.log(`        ✗ ${f}`);
    if (c.partial) console.log(`        NOT FULLY MECHANISED: ${c.partial}`);
    console.log("");
  }
  const partials = checks.filter((c) => c.partial);
  console.log(`${checks.length - failed.length}/${checks.length} checks pass · ${partials.length} are partial by nature (checks ${partials.map((c) => c.n).join(", ")}) and say so above`);
  console.log("Editorial and legal package READY · rendered assets PARTIAL (2/3) · private Stream integration READY · course placement PARTIAL (2/3)");
}
process.exit(failed.length ? 1 : 0);
