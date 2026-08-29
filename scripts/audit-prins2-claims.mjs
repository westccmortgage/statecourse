/**
 * TX Principles II — mechanical claim-to-source audit.
 *
 * WHAT THIS PROVES, AND WHAT IT CANNOT. This script proves the MECHANICAL half of the audit: that
 * every statutory, rule and regulatory citation appearing in the curriculum names a section that
 * actually exists in a source held on disk, and that every verbatim quotation attributed to a
 * source is present in that source's text. It cannot prove that a paraphrase preserves legal
 * meaning, that an exception has not been taught as a general rule, or that a provision was in
 * force on the project date. Those are the SUBSTANTIVE half and are recorded per claim by human /
 * agent review in the audit ledger this script seeds.
 *
 * WHY IT EXISTS. Two real errors got through spot-checking during this build: Finance Code
 * § 343.102's expiry note was attributed to § 343.101, and § 1101.652's subdivision (34) was cited
 * to subsection (a) rather than (b). Both were citation-level mistakes in text that read perfectly
 * well. Sampling cannot find those; enumeration can.
 *
 * OUTPUT. A JSON ledger at texas/tx-principles-real-estate-ii-30-v1/claim-audit.json with one row
 * per citation occurrence, and a summary to stdout. Exit status is non-zero if any citation
 * resolves to a section that is not present in a held source, so this can gate a build.
 *
 * Usage: node scripts/audit-prins2-claims.mjs [--json <path>]
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CURRICULUM = path.join(root, "texas/tx-principles-real-estate-ii-30-v1/curriculum");

/* ── which held file carries which citation family ───────────────────────────────────────────
   Texas code chapters are addressed as <chapter>.<section>, so the chapter number identifies the
   file. Where two held chapters could claim the same leading number, the entry lists both and the
   resolver requires an explicit code name in the surrounding text to disambiguate. */
const TEXAS_CODES = {
  "Occupations Code": { 1101: "statutes/OC.1101.htm", 1103: "statutes/OC.1103.htm" },
  "Property Code": {
    5: "statutes/PR.5.htm", 11: "statutes/PR.11.htm", 12: "statutes/PR.12.htm",
    13: "statutes/PR.13.htm", 21: "statutes/PR.21.htm", 41: "statutes/PR.41.htm",
    51: "statutes/PR.51.htm", 53: "statutes/PR.53.htm", 91: "statutes/PR.91.htm",
    92: "statutes/PR.92.htm", 111: "statutes/PR.111.htm", 202: "statutes/PR.202.htm",
    301: "statutes/PR.301.htm",
  },
  "Local Government Code": { 211: "statutes/LG.211.htm", 212: "statutes/LG.212.htm", 232: "statutes/LG.232.htm" },
  "Business & Commerce Code": { 9: "statutes/BC.9.htm", 17: "statutes/BC.17.htm", 26: "statutes/BC.26.htm" },
  "Finance Code": { 343: "statutes/FI.343.htm" },
  "Water Code": { 11: "statutes/WA.11.htm" },
  "Natural Resources Code": { 21: "statutes/NR.21.htm" },
  "Tax Code": { 11: "statutes/TX.11.htm", 32: "statutes/TX.32.htm" },
  "Insurance Code": { 2501: "statutes/IN.2501.htm" },
  "Estates Code": { 101: "statutes/ES.101.htm", 111: "statutes/ES.111.htm", 112: "statutes/ES.112.htm", 201: "statutes/ES.201.htm", 251: "statutes/ES.251.htm" },
  "Government Code": { 4001: "statutes/GV.4001.htm", 4005: "statutes/GV.4005.htm" },
  "Business Organizations Code": { 200: "statutes/BO.200.htm" },
  "Civil Practice and Remedies Code": { 16: "statutes/CP.16.htm" },
};

/* Chapter numbers that are unambiguous across every held Texas code, for bare "§ N.M" citations. */
const UNAMBIGUOUS_CHAPTER = (() => {
  const owners = new Map();
  for (const [code, chapters] of Object.entries(TEXAS_CODES)) {
    for (const ch of Object.keys(chapters)) {
      if (!owners.has(ch)) owners.set(ch, []);
      owners.get(ch).push({ code, file: chapters[ch] });
    }
  }
  const out = new Map();
  for (const [ch, list] of owners) if (list.length === 1) out.set(ch, list[0]);
  return out;
})();

const FEDERAL_TITLES = {
  12: (s) => `federal/us12-${s}.html`,
  15: (s) => `federal/us15-${s}.html`,
  16: (s) => `federal/us16-${s}.html`,
  26: (s) => `federal/us26-${s}.html`,
  42: (s) => `federal/us42-${s}.html`,
};

const SOURCE_DIR = path.join(root, "texas/trec-sources");

/** uscode.house.gov emits the section symbol as the entity &sect;, and the eCFR XML uses numeric
    entities throughout. Decoding has to happen before any section or quotation match. */
function decodeEntities(s) {
  return s
    .replace(/&sect;/g, "§")
    .replace(/&#xA7;|&#167;/g, "§")
    .replace(/&#x2014;|&#8212;|&mdash;/g, "—")
    .replace(/&#x2013;|&#8211;|&ndash;/g, "–")
    .replace(/&#x201C;|&#8220;|&ldquo;/g, '"')
    .replace(/&#x201D;|&#8221;|&rdquo;/g, '"')
    .replace(/&#x2019;|&#8217;|&rsquo;/g, "'")
    .replace(/&#x2018;|&#8216;|&lsquo;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;|&#xA0;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

/** Quotation comparison must survive typographic differences that carry no legal meaning:
    dash and quote styles, non-breaking spaces, and the markdown emphasis the course uses. */
function normalizeForQuote(s) {
  return s
    .replace(/\*\*|\*|_/g, "")
    .replace(/[“”„]/g, '"')
    .replace(/[‘’‚]/g, "'")
    .replace(/[—–-]/g, "-")
    .replace(/ /g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

const fileCache = new Map();
function loadSource(rel) {
  if (fileCache.has(rel)) return fileCache.get(rel);
  const full = path.join(SOURCE_DIR, rel);
  if (!fs.existsSync(full)) { fileCache.set(rel, null); return null; }
  const raw = fs.readFileSync(full, "utf8");
  const text = decodeEntities(raw.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ");
  const entry = { raw, text, norm: normalizeForQuote(text) };
  fileCache.set(rel, entry);
  return entry;
}

/** Does the held source actually contain this section as a section, not merely as a cross-reference? */
function sectionPresent(entry, section, kind) {
  if (!entry) return false;
  if (kind === "texas") {
    // Texas Legislative Council anchors every section: <a name="92.103">
    if (entry.raw.includes(`name="${section}"`)) return true;
    return new RegExp(`Sec\\.\\s*${section.replace(".", "\\.")}\\.`).test(entry.text);
  }
  if (kind === "federal") {
    return new RegExp(`§\\s*${section.replace(".", "\\.")}\\.?\\s+[A-Z]`).test(entry.text);
  }
  if (kind === "cfr") {
    return entry.raw.includes(`N="${section}"`) || new RegExp(`§\\s*${section.replace(".", "\\.")}\\b`).test(entry.text);
  }
  if (kind === "trecrule") {
    return entry.text.includes(`§${section}`) || entry.text.includes(`§ ${section}`);
  }
  if (kind === "constitution") {
    return entry.raw.includes(`name="16.${section}"`) || new RegExp(`Sec\\.\\s*${section}\\.`).test(entry.text);
  }
  return false;
}

/* ── citation extraction ─────────────────────────────────────────────────────────────────────
   Every citation occurrence is a row. `context` is the sentence it sits in, which is what a
   substantive reviewer needs in order to judge whether the source supports the statement. */
const CODE_NAMES = Object.keys(TEXAS_CODES);

function detectCodeContext(before) {
  let best = null, bestAt = -1;
  for (const name of CODE_NAMES) {
    const at = before.lastIndexOf(name);
    if (at > bestAt) { bestAt = at; best = name; }
  }
  // Only trust a code name mentioned reasonably close by.
  if (best && before.length - bestAt <= 400) return best;
  return null;
}

function sentenceAround(text, index) {
  const start = Math.max(0, text.lastIndexOf(".", index - 1) + 1);
  let end = text.indexOf(".", index);
  if (end < 0) end = Math.min(text.length, index + 300);
  return text.slice(start, Math.min(end + 1, text.length)).replace(/\s+/g, " ").trim();
}

const rows = [];
let idCounter = 0;
const nextId = (module) => `${module}-C${String(++idCounter).padStart(4, "0")}`;

const moduleFiles = fs.readdirSync(CURRICULUM).filter((f) => /^module-\d+\.md$/.test(f)).sort();

for (const file of moduleFiles) {
  const modulePath = path.join(CURRICULUM, file);
  const md = fs.readFileSync(modulePath, "utf8");
  const moduleId = file.replace(/\.md$/, "");

  /* Which unit is a given offset inside? */
  const unitMarks = [];
  const unitRe = /^## Unit: (.+)$/gm;
  let um;
  while ((um = unitRe.exec(md))) unitMarks.push({ at: um.index, unit: um[1].trim() });
  const unitAt = (idx) => {
    let cur = "(front matter)";
    for (const m of unitMarks) { if (m.at <= idx) cur = m.unit; else break; }
    return cur;
  };

  const push = (idx, citation, kind, sourceRel, section, note) => {
    const entry = loadSource(sourceRel);
    const present = sectionPresent(entry, section, kind);
    rows.push({
      claimId: nextId(moduleId),
      module: moduleId,
      unit: unitAt(idx),
      citation,
      kind,
      section,
      sourceFile: entry ? `texas/trec-sources/${sourceRel}` : null,
      sourceHeld: Boolean(entry),
      sectionPresent: present,
      status: !entry ? "SOURCE_NOT_HELD" : present ? "MECHANICAL_PASS" : "SECTION_NOT_FOUND",
      courseText: sentenceAround(md, idx),
      substantiveStatus: "PENDING_REVIEW",
      reviewerNote: note || "",
      correctionCommit: null,
    });
  };

  /* Federal: "42 U.S.C. § 3604(a)" */
  for (const m of md.matchAll(/(\d+)\s+U\.S\.C\.\s+§+\s*(\d+[a-z]?(?:-\d+)?)/g)) {
    const [full, title, section] = m;
    const rel = FEDERAL_TITLES[Number(title)]?.(section);
    if (!rel) { rows.push({ claimId: nextId(moduleId), module: moduleId, unit: unitAt(m.index), citation: full, kind: "federal", section, sourceFile: null, sourceHeld: false, sectionPresent: false, status: "SOURCE_NOT_HELD", courseText: sentenceAround(md, m.index), substantiveStatus: "PENDING_REVIEW", reviewerNote: `no held file mapped for title ${title}`, correctionCommit: null }); continue; }
    push(m.index, full, "federal", rel, section);
  }

  /* CFR: "12 C.F.R. § 1024.7". Regulation X is held as one whole-subpart capture; Regulations B
     and Z were pulled section by section, so the file layout differs by part. */
  for (const m of md.matchAll(/(\d+)\s+C\.F\.R\.\s+(?:part\s+)?§?\s*([\d.]+)/g)) {
    const [full, , section] = m;
    const part = section.split(".")[0];
    const rel = part === "1024" ? "federal/ecfr-12cfr1024.xml" : `federal/ecfr-12cfr${section}.xml`;
    push(m.index, full, "cfr", rel, section);
  }

  /* TREC rules: "22 TAC § 535.62" or "Commission rule 535.65" */
  for (const m of md.matchAll(/22\s+TAC\s+§+\s*(535\.\d+)/g)) {
    push(m.index, m[0], "trecrule", `trec-rules/${m[1]}.txt`, m[1]);
  }

  /* Texas Constitution: "article XVI, section 50(a)(6)" / "art. XVI, § 50" */
  for (const m of md.matchAll(/art(?:icle|\.)\s+XVI,?\s+(?:section|§)\s*(\d+)/gi)) {
    push(m.index, m[0], "constitution", "statutes/CN.16.htm", m[1]);
  }

  /* Texas codes: "Property Code § 92.103" and bare "§ 92.103(a)" */
  for (const m of md.matchAll(/§+\s*(\d+)\.(\d+[A-Za-z]?)/g)) {
    const chapter = m[1], section = `${m[1]}.${m[2]}`;
    const before = md.slice(Math.max(0, m.index - 400), m.index);
    // Skip anything already captured as federal/CFR/TAC by looking for those markers immediately before.
    if (/U\.S\.C\.\s*$|C\.F\.R\.\s*(?:part\s+)?$|22\s+TAC\s*$/.test(before)) continue;
    if (chapter === "535") { push(m.index, m[0], "trecrule", `trec-rules/${section}.txt`, section); continue; }
    const named = detectCodeContext(before);
    let target = named && TEXAS_CODES[named]?.[chapter] ? { code: named, file: TEXAS_CODES[named][chapter] } : null;
    if (!target && UNAMBIGUOUS_CHAPTER.has(chapter)) target = UNAMBIGUOUS_CHAPTER.get(chapter);
    if (!target) {
      rows.push({ claimId: nextId(moduleId), module: moduleId, unit: unitAt(m.index), citation: m[0], kind: "texas", section, sourceFile: null, sourceHeld: false, sectionPresent: false, status: "AMBIGUOUS_CODE", courseText: sentenceAround(md, m.index), substantiveStatus: "PENDING_REVIEW", reviewerNote: `chapter ${chapter} is claimed by more than one held code and no code name appears within 400 characters`, correctionCommit: null });
      continue;
    }
    push(m.index, `${target.code} ${m[0]}`, "texas", target.file, section);
  }
}

/* ── quotation check: every "…" attributed near a citation must appear in the cited source ──── */
let quotesChecked = 0, quotesFailed = 0;
const quoteFailures = [];
/* A quotation is checked only when it is attributable: it must sit within 320 characters of a
   citation whose source is held, and it must look like statutory language rather than the course's
   own voice. An unattributable quoted phrase is not a sourcing failure — it is the module quoting
   itself, a term of art, or a hypothetical speaker — so it is counted separately rather than
   reported as a miss. Bracketed alterations "[z]oning" are normalised, since that is the standard
   convention for adjusting a quotation's first letter and does not make the quotation non-verbatim. */
const CITE_NEAR = 320;
let quotesUnattributable = 0;
for (const file of moduleFiles) {
  const md = fs.readFileSync(path.join(CURRICULUM, file), "utf8");
  const moduleId = file.replace(/\.md$/, "");
  const moduleRows = rows.filter((r) => r.module === moduleId && r.sourceHeld && r.sectionPresent);
  /* Index every citation occurrence's offset so proximity is real, not sentence-guessed. */
  const citeOffsets = [];
  for (const r of moduleRows) {
    const needle = r.section;
    let from = 0, at;
    while ((at = md.indexOf(needle, from)) >= 0) { citeOffsets.push({ at, row: r }); from = at + needle.length; }
  }
  for (const m of md.matchAll(/"([^"\n]{40,600})"/g)) {
    const quote = m[1].replace(/\[([a-zA-Z])\]/g, "$1");
    /* Reject candidates that are not plausibly a quotation of statutory text:
       - spanning a paragraph break or a markdown block marker means the regex has paired the
         closing quote of one quotation with the opening quote of the next, capturing the prose
         in between;
       - a candidate that starts mid-sentence with a lowercase connective ("and", "are", "is")
         is the same artefact. */
    if (/\n/.test(m[1]) || /^[\s]*(?:and|are|is|was|were|but|or|to|of|the)\b/i.test(m[1]) && /^\s/.test(m[1])) {
      quotesUnattributable += 1; continue;
    }
    const near = citeOffsets.filter((c) => Math.abs(c.at - m.index) <= CITE_NEAR);
    if (!near.length) { quotesUnattributable += 1; continue; }
    const needle = normalizeForQuote(quote);
    if (needle.length < 30) { quotesUnattributable += 1; continue; }
    quotesChecked += 1;
    /* Verbatim against ANY nearby cited source counts as verified — a sentence often cites two. */
    const hit = near.some((c) => {
      const entry = loadSource(c.row.sourceFile.replace("texas/trec-sources/", ""));
      return entry && entry.norm.includes(needle);
    });
    if (!hit) {
      quotesFailed += 1;
      /* Classify the failure so a reviewer can triage instead of re-deriving it:
         - ELLIPSIS: the course marked an omission, so a single contiguous match is not expected;
           every segment is checked separately and the class records whether all segments matched.
         - TRUNCATED: the source contains the whole quoted string as a PREFIX and continues. The
           course closed the quotation early — usually with a full stop — which can silently drop
           an operative clause. This is the class that produced a real defect in module 02.
         - PARTIAL: a long leading run matches and then diverges: a wording change inside the quote.
         - NO_MATCH: not found at all. */
      const sources = [...new Set(near.map((c) => c.row.sourceFile))].map((f) => loadSource(f.replace("texas/trec-sources/", ""))).filter(Boolean);
      let cls = "NO_MATCH", longest = 0, tail = null;
      const segments = needle.split(/\s*(?:\.\s*\.\s*\.|…)\s*/).filter((s) => s.length >= 25);
      if (segments.length > 1) {
        const allSegs = segments.every((seg) => sources.some((s) => s.norm.includes(seg)));
        cls = allSegs ? "ELLIPSIS_ALL_SEGMENTS_PRESENT" : "ELLIPSIS_SEGMENT_MISSING";
      } else {
        const bare = needle.replace(/[.,;:]+$/, "");
        for (const s of sources) {
          const at = s.norm.indexOf(bare);
          if (at >= 0) {
            tail = s.norm.slice(at + bare.length, at + bare.length + 90).trim();
            longest = bare.length;
            /* Quoting only part of a sentence is ordinary and correct legal writing. What matters
               is whether the cut LOSES something: a cut at a subdivision boundary, or before a new
               sentence, is clean; a cut that leaves the source's own sentence running on into a
               qualifier, exception or purpose clause can change the rule the reader takes away.
               The module 02 defect was of the second kind — the quotation stopped before
               "to determine whether the loan is a low-rate home loan". */
            const cleanCut = tail === "" || /^\(\s*[a-z0-9]+\s*\)/.test(tail) || /^(?:sec\.|added by|amended by|acts\s+\d{4})/.test(tail);
            const runsOn = /^(?:to|for|unless|except|if|provided|in order|so that|and\b|or\b|but\b)/.test(tail);
            cls = cleanCut ? "TRUNCATED_CLEAN_CUT" : runsOn ? "TRUNCATED_MID_CLAUSE" : "TRUNCATED_REVIEW";
            break;
          }
          let lo = 25, hi = needle.length, best = 0;
          while (lo <= hi) {
            const mid = (lo + hi) >> 1;
            if (s.norm.includes(needle.slice(0, mid))) { best = mid; lo = mid + 1; } else hi = mid - 1;
          }
          if (best > longest) { longest = best; if (best >= 60) cls = "PARTIAL"; }
        }
      }
      quoteFailures.push({
        module: moduleId,
        candidateSections: [...new Set(near.map((c) => c.row.section))].slice(0, 4),
        classification: cls,
        matchedPrefixChars: longest,
        sourceContinuesWith: tail,
        quote: quote.slice(0, 200),
      });
    }
  }
}

/* ── report ─────────────────────────────────────────────────────────────────────────────────── */
const byStatus = rows.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {});
const failures = rows.filter((r) => r.status !== "MECHANICAL_PASS");

const outPath = path.join(root, "texas/tx-principles-real-estate-ii-30-v1/claim-audit.json");
const payload = {
  generatedBy: "scripts/audit-prins2-claims.mjs",
  generatedFor: "Texas Principles of Real Estate II",
  note: "Mechanical layer only. substantiveStatus is set by review, not by this script.",
  curriculumHashes: Object.fromEntries(moduleFiles.map((f) => [f, crypto.createHash("sha256").update(fs.readFileSync(path.join(CURRICULUM, f))).digest("hex")])),
  totals: { citations: rows.length, byStatus, quotesChecked, quotesFailed, quotesUnattributable },
  quoteFailures,
  claims: rows,
};
fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`);

console.log("citations found:", rows.length);
for (const [k, v] of Object.entries(byStatus).sort()) console.log(`  ${k}: ${v}`);
console.log("verbatim quotations checked:", quotesChecked, "| not found in cited source:", quotesFailed, "| unattributable (not near a citation, not counted):", quotesUnattributable);
if (quoteFailures.length) {
  console.log("\nquotation misses (first 20):");
  for (const q of quoteFailures.slice(0, 20)) console.log(`  ${q.module} [near ${q.candidateSections.join(", ")}]: "${q.quote}…"`);
}
if (failures.length) {
  console.log("\nmechanical failures (first 40):");
  for (const f of failures.slice(0, 40)) console.log(`  ${f.claimId} ${f.module} [${f.status}] ${f.citation} -> ${f.sourceFile || "(unmapped)"}`);
}
console.log("\nledger written:", path.relative(root, outPath));
process.exitCode = failures.length ? 1 : 0;
