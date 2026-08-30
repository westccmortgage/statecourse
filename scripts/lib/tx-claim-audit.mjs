/**
 * Texas course claim-to-source audit — the engine, shared by every Texas course.
 *
 * WHAT THIS PROVES, AND WHAT IT CANNOT. It proves the MECHANICAL half of the audit: that every
 * statutory, rule and regulatory citation appearing in a curriculum names a section that actually
 * exists in a source held on disk, and that every verbatim quotation attributed to a source is
 * present in that source's text. It cannot prove that a paraphrase preserves legal meaning, that an
 * exception has not been taught as a general rule, or that a provision was in force on the project
 * date. Those are the SUBSTANTIVE half and are recorded per claim by review in the ledger this
 * seeds.
 *
 * WHY IT EXISTS. Two real errors got through spot-checking during the Principles II build: Finance
 * Code § 343.102's expiry note was attributed to § 343.101, and § 1101.652's subdivision (34) was
 * cited to subsection (a) rather than (b). Both were citation-level mistakes in text that read
 * perfectly well. Sampling cannot find those; enumeration can. The Law of Agency build has since
 * added a third of the same kind — 22 TAC § 535.191's penalty bands misassigned for two
 * subdivisions — which is why this engine is now shared rather than copied per course.
 *
 * WHY IT WAS EXTRACTED. This code was scripts/audit-prins2-claims.mjs. That script's command is
 * recorded in a frozen artifact (the Principles II content freeze), so its NAME and its OUTPUT must
 * not change; only its body moved here. The Principles II entry point still runs the same command
 * and writes the same ledger, and the byte-for-byte equality of that ledger before and after the
 * extraction was checked rather than assumed.
 *
 * WHAT CHANGED IN THE MOVE. Two things, both additive. Texas codes gained the Labor Code chapters
 * held for Law of Agency's employment topic. And the 22 TAC resolver, which recognised only chapter
 * 535 because Principles II cited nothing else, now recognises the chapters held one-file-per-
 * section under trec-rules/ — 531 above all, since the Canons of Professional Ethics are chapter
 * 531 and Law of Agency is built on them. Neither addition can change a Principles II row: that
 * course cites no Labor Code and no TAC chapter but 535.
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

/**
 * @param {{root: string, curriculumDir: string, outPath: string, generatedBy: string,
 *          generatedFor: string, extraCodes?: Record<string, Record<number, string>>}} course
 */
export function runClaimAudit(course) {
    const { root, curriculumDir: CURRICULUM, outPath, generatedBy, generatedFor, extraCodes = {} } = course;

  /* SOFT-WRAP NORMALISATION. Several modules are hard-wrapped at a column, so a citation or a long
     quotation can contain a newline. A pattern that excludes newlines then misses it entirely — and,
     for quotations, the next match pairs the skipped quotation's closing mark with the following
     quotation's opening mark and reports the prose between them as unverifiable. Collapsing a single
     newline to a space fixes both while preserving paragraph breaks, and is length-preserving, so
     every offset still addresses the same character of the original file. */
  const unwrap = (s) => s.replace(/([^\n])\n(?!\n)/g, "$1 ");

  /* ── which held file carries which citation family ───────────────────────────────────────────
     Texas code chapters are addressed as <chapter>.<section>, so the chapter number identifies the
     file. Where two held chapters could claim the same leading number, the entry lists both and the
     resolver requires an explicit code name in the surrounding text to disambiguate. */
  const TEXAS_CODES = {
    "Labor Code": { 21: "statutes/LA.21.htm", 201: "statutes/LA.201.htm" },
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
    "Estates Code": { 101: "statutes/ES.101.htm", 111: "statutes/ES.111.htm", 112: "statutes/ES.112.htm", 201: "statutes/ES.201.htm", 203: "statutes/ES.203.htm", 251: "statutes/ES.251.htm" },
    "Government Code": { 4001: "statutes/GV.4001.htm", 4005: "statutes/GV.4005.htm" },
    "Business Organizations Code": { 200: "statutes/BO.200.htm" },
    "Civil Practice and Remedies Code": { 16: "statutes/CP.16.htm" },
    "Penal Code": { 32: "statutes/PE.32.htm" },
    "Health and Safety Code": { 361: "statutes/HS.361.htm" },
  };
  for (const [code, chapters] of Object.entries(extraCodes)) TEXAS_CODES[code] = { ...(TEXAS_CODES[code] || {}), ...chapters };

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

  /* CFR parts held for this course. A bare "§ 1002.4" belongs to one of these, not to a Texas code. */
  const CFR_PARTS = new Set(["1002", "1003", "1024", "1026"]);

  /* 22 TAC chapters held one file per section under trec-rules/. Principles II cited only chapter
     535, so the resolver recognised only 535; Law of Agency leans on the Canons in chapter 531 and on
     537.11, and a bare "§ 531.2" must not be resolved as a Texas code chapter 531. No held Texas code
     has a chapter in these numbers, so the mapping is unambiguous. */
  const TAC_CHAPTERS = new Set(["531", "533", "535", "537", "541", "543"]);

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
      /* MARKDOWN BLOCKQUOTE MARKERS. A quotation set as a multi-line blockquote carries "> " at the
         start of every continuation line. The soft-wrap collapse above rewrites those line breaks as
         spaces, which leaves an isolated ">" stranded inside the quotation — "...authorizes a broker
         to act as an > intermediary..." — and no source can ever match that. Six of module 06's
         quotations of §§ 1101.559-.560 were reported missing for this reason alone. Stripping the
         marker is safe on both sides of the comparison: it is applied to source text too, so a source
         that genuinely printed an angle bracket still matches a quotation of it. */
      .replace(/(^|\s)>+(?=\s)/g, "$1")
      /* Quote MARKS are folded to one character. A course quoting a statutory definition must
         switch the inner marks: the statute prints `the term "adverse action" means`, and the
         course has to render it `the term 'adverse action' means` because it is already inside a
         quotation. That is a typographic necessity, not a change to the words, and must not read
         as a non-verbatim quotation. */
      .replace(/[“”„‘’‚'"]/g, "'")
      .replace(/[—–-]/g, "-")
      .replace(/ /g, " ")
      /* Stripping markup injects whitespace where a tag sat. Texas and eCFR sources wrap every
         cross-reference and fraction in markup, so the stripped text reads "Section 347.002 ," and
         "one-sixth ( 1/6 )" — spacing that no correct quotation can reproduce. Normalising the space
         around punctuation on BOTH sides compares the words rather than the markup. */
      .replace(/\s+([,.;:)\]])/g, "$1")
      .replace(/([([])\s+/g, "$1")
      /* Same cause, other side of the bracket: the sources print "Section 1101.651 (d)" because the
         subdivision sits in its own tag. Collapsing the space applies to both texts alike. */
      .replace(/\s+\(/g, "(")
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

  /* ── SECTION SPANS, WHOLE FILES, AND THE WHOLE CORPUS ────────────────────────────────────────
     The quotation check used to search only the files cited within 320 characters of the quotation,
     and to search each of them WHOLE. That conflated three very different outcomes under the single
     headline "not found in cited source":

       (a) the quotation is in the cited source, in the cited section — a pass;
       (b) the quotation is in the cited source but outside the cited section — worth knowing,
           because it says the section span, not the quotation, is what is wrong;
       (c) the quotation is verbatim in a DIFFERENT held source — a real finding about attribution,
           since the nearest citation points elsewhere, but emphatically not a fabricated quotation;
       (d) the quotation is nowhere in the held corpus — the only genuine failure.

     These four are now separated. A miss at a narrower tier always falls through to a wider one, so
     an imperfect span extractor can downgrade a pass to a weaker pass but can never manufacture a
     failure. */

  /** The normalised text of one section of a held file, or null when the span cannot be located.
      Texas Legislative Council HTML anchors every section (<a name="1101.002">) and the eCFR XML
      labels every one (N="1024.7"), so the span is read from the file's own structure rather than
      guessed from prose. TREC rules are held one section per file, so the file IS the span. */
  const spanCache = new Map();
  function sectionSpan(rel, section, kind) {
    const key = `${rel}::${section}`;
    if (spanCache.has(key)) return spanCache.get(key);
    const entry = loadSource(rel);
    let out = null;
    if (entry) {
      if (kind === "trecrule") out = entry.norm;
      else {
        /* The section anchor is NOT simply the next anchor along. Texas Legislative Council emits a
           SECOND, internal anchor immediately after each section anchor —
           <a name="1101.652"></a><a name="57308.157139"></a> — so slicing to the next `name="` gave a
           span about thirty characters long and pushed essentially every quotation down to the
           whole-file tier. The section anchors for a file all share the chapter prefix ("1101."),
           and the internal ones never do, so the span runs to the next anchor WITH THAT PREFIX. */
        const label = kind === "constitution" ? `16.${section}` : section;
        const prefix = `${label.split(".")[0]}.`;
        const attr = kind === "cfr" ? "N" : "name";
        const anchors = [];
        const re = new RegExp(`${attr}="([^"]+)"`, "g");
        let a;
        while ((a = re.exec(entry.raw))) if (a[1].startsWith(prefix)) anchors.push({ at: a.index, name: a[1] });
        const i = anchors.findIndex((x) => x.name === label);
        if (i >= 0) {
          const slice = entry.raw.slice(anchors[i].at, i + 1 < anchors.length ? anchors[i + 1].at : entry.raw.length);
          out = normalizeForQuote(decodeEntities(slice.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " "));
        }
      }
    }
    spanCache.set(key, out);
    return out;
  }

  /** Every held source under texas/trec-sources/, for the corpus-wide tier. Built once, on first
      use, so a course whose quotations all resolve against their cited sources never pays for it. */
  let corpusIndex = null;
  function corpus() {
    if (corpusIndex) return corpusIndex;
    corpusIndex = [];
    const walk = (dir) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) walk(full);
        else if (/\.(html?|htm|txt|xml)$/i.test(e.name)) {
          const rel = path.relative(SOURCE_DIR, full).split(path.sep).join("/");
          const entry = loadSource(rel);
          if (entry) corpusIndex.push({ rel, norm: entry.norm });
        }
      }
    };
    walk(SOURCE_DIR);
    return corpusIndex;
  }

  /* TERMINAL PUNCTUATION. A quotation embedded in the course's own sentence must carry that
     sentence's punctuation inside the closing mark — the ordinary American convention — so a course
     writes "…may not exceed $5,000 for each violation," where § 1101.702 prints "…for each
     violation." The WORDS are verbatim right to the end of the source's own clause; only the
     terminal mark differs, and that mark belongs to the course's sentence, not to the quotation.
     Comparing with the mark attached was the single largest cause of false misses — 187 of Law of
     Agency's 352 — so the comparison drops a trailing mark from the quotation before concluding it
     is absent. Whether the source then RUNS ON into a qualifier is a separate question about
     truncation, answered below and reported separately rather than as an absence. */
  const stripTerminal = (s) => s.replace(/[.,;:]+$/, "").trim();

  const ELLIPSIS = /\s*(?:\.\s*\.\s*\.|…|\[\.\.\.\])\s*/;

  /** Is `needle` present in the normalised haystack? Returns how it matched, or null.
      An elided quotation is satisfied when its segments appear IN ORDER in this one haystack —
      order matters, because segments found in scattered places are not a quotation of a passage. */
  function findIn(hay, needle) {
    if (!hay) return null;
    if (hay.includes(needle)) return { how: "exact" };
    const segments = needle.split(ELLIPSIS).map((x) => x.trim()).filter((x) => x.length >= 12);
    if (segments.length > 1) {
      let from = 0;
      for (const seg of segments) {
        let at = hay.indexOf(seg, from);
        if (at < 0 && seg === segments[segments.length - 1]) at = hay.indexOf(stripTerminal(seg), from);
        if (at < 0) return null;
        from = at + seg.length;
      }
      return { how: "ellipsis-segments-in-order" };
    }
    const bare = stripTerminal(needle);
    if (bare.length < 30 || bare === needle) return null;
    const at = hay.indexOf(bare);
    if (at < 0) return null;
    /* The words matched; record what the source does next so a reviewer can see whether closing the
       quotation there dropped an operative clause. That is the module 02 defect class and it stays
       visible — as a truncation finding, not as a missing quotation. */
    return { how: "terminal-punctuation", tail: hay.slice(at + bare.length, at + bare.length + 90).trim() };
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
    /* Unwrapped for the same reason the quotation pass is: a citation split across a hard line wrap
       ("12 U.S.C.\n§ 1843") would otherwise never match its pattern. The substitution is
       length-preserving, so every offset still addresses the same character of the original. */
    const md = unwrap(fs.readFileSync(modulePath, "utf8"));
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

    /* A citation the course names ONLY in order to say it is not held is not a sourcing defect — it
       is the course being honest about the edge of its own sources, which the build requires. Such a
       reference is classified IDENTIFIED_NOT_TAUGHT and is not counted as a failure. A citation used
       as authority for a proposition must resolve; one named as absent must not. */
    const DISCLAIMS = /\bnot (?:a )?held\b|\bnot among the (?:sources|held)\b|\bwere not held\b|\bwas not held\b|\bis not held\b|\bare not held\b|\bnot read for this course\b|\bnot a held source\b|\bnot in the held\b|\bwe do not hold\b|\bnot available to this course\b/i;

    const push = (idx, citation, kind, sourceRel, section, note) => {
      const entry = loadSource(sourceRel);
      const present = sectionPresent(entry, section, kind);
      const courseText = sentenceAround(md, idx);
      /* The disclaimer is often in an adjacent sentence — "…§ 9607. That section was not held for
         this course." — so the window is the surrounding passage, not the one sentence. */
      const passage = md.slice(Math.max(0, idx - 700), Math.min(md.length, idx + 700));
      const disclaimed = DISCLAIMS.test(passage);
      let status;
      if (entry && present) status = "MECHANICAL_PASS";
      else if (disclaimed) status = "IDENTIFIED_NOT_TAUGHT";
      else if (!entry) status = "SOURCE_NOT_HELD";
      else status = "SECTION_NOT_FOUND";
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
        status,
        courseText,
        substantiveStatus: "PENDING_REVIEW",
        reviewerNote: note || (status === "IDENTIFIED_NOT_TAUGHT" ? "named by the course expressly as a source it does not hold; no proposition is asserted from it" : ""),
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
      const [full, , raw] = m;
      const section = raw.replace(/\.$/, "");
      const part = section.split(".")[0];
      /* A PART-level reference — "Regulation Z, 12 C.F.R. part 1026" — names a body of rules, not a
         provision. It is satisfied when any section of that part is held, since the course is
         identifying the regulation rather than asserting a rule from a specific section. */
      if (!section.includes(".")) {
        const anyHeld = fs.readdirSync(path.join(SOURCE_DIR, "federal")).some((f) => f.startsWith(`ecfr-12cfr${part}`));
        rows.push({
          claimId: nextId(moduleId), module: moduleId, unit: unitAt(m.index),
          citation: full, kind: "cfr-part", section: part,
          sourceFile: anyHeld ? `texas/trec-sources/federal/ecfr-12cfr${part}.*.xml` : null,
          sourceHeld: anyHeld, sectionPresent: anyHeld,
          status: anyHeld ? "MECHANICAL_PASS" : "SOURCE_NOT_HELD",
          courseText: sentenceAround(md, m.index), substantiveStatus: "PENDING_REVIEW",
          reviewerNote: anyHeld ? "part-level reference; sections of this part are held" : "part-level reference and no section of this part is held",
          correctionCommit: null,
        });
        continue;
      }
      const rel = part === "1024" ? "federal/ecfr-12cfr1024.xml" : `federal/ecfr-12cfr${section}.xml`;
      push(m.index, full, "cfr", rel, section);
    }

    /* TREC rules: "22 TAC § 535.62" or "Commission rule 535.65" */
    for (const m of md.matchAll(/22\s+TAC\s+§+\s*((?:531|533|535|537|541|543)\.\d+)/g)) {
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
      if (TAC_CHAPTERS.has(chapter)) { push(m.index, m[0], "trecrule", `trec-rules/${section}.txt`, section); continue; }
      /* A bare "§ 1002.4" or "§ 1026.32" is a CFR section, not a Texas chapter. Texas has no code
         chapter in these ranges among the held sources, and the modules cite Regulations B, X and Z
         by bare section once the part has been named. Resolving them as Texas chapters produced 103
         phantom AMBIGUOUS_CODE rows. */
      if (CFR_PARTS.has(chapter)) {
        const rel = chapter === "1024" ? "federal/ecfr-12cfr1024.xml" : `federal/ecfr-12cfr${section}.xml`;
        push(m.index, `12 C.F.R. § ${section}`, "cfr", rel, section);
        continue;
      }
      const named = detectCodeContext(before);
      let target = named && TEXAS_CODES[named]?.[chapter] ? { code: named, file: TEXAS_CODES[named][chapter] } : null;
      if (!target && UNAMBIGUOUS_CHAPTER.has(chapter)) target = UNAMBIGUOUS_CHAPTER.get(chapter);
      /* Still ambiguous by name — e.g. a bare "§ 11.022" where chapter 11 belongs to the Property,
         Tax and Water Codes alike, and the words "Water Code" sit further back than the name window.
         Ask the candidate files which one actually CONTAINS the section: if exactly one does, the
         citation is not genuinely ambiguous and guessing is not required. */
      if (!target) {
        const candidates = [];
        for (const [code, chapters] of Object.entries(TEXAS_CODES)) {
          const file = chapters[chapter];
          if (!file) continue;
          const entry = loadSource(file);
          if (entry && sectionPresent(entry, section, "texas")) candidates.push({ code, file });
        }
        if (candidates.length === 1) target = candidates[0];
        /* MORE THAN ONE HELD CODE CONTAINS THE SECTION. "§ 21.002" is a real section of both the
           Labor Code and the Property Code, and module 09 cites chapter 21 twenty-seven times while
           teaching employment discrimination.

           Proximity must NOT decide this. The nearest code name to five of those citations is
           "Property Code" — and it is nearest only because the passage mentions "Property Code
           chapter 301" in an aside about where fair housing is taught. Widening detectCodeContext's
           window would therefore resolve them CONFIDENTLY AND WRONGLY.

           Ask instead which candidate code the module ever names in the same breath as THIS chapter:
           the module writes "Labor Code chapter 21" and "Labor Code § 21.202" seven times, and never
           pairs any other held code with chapter 21. That pairing is the document's own answer, not
           the resolver's guess. If no candidate is paired with the chapter, or more than one is, the
           citation stays AMBIGUOUS_CODE — which is the correct answer, not a failure of nerve. */
        if (!target && candidates.length > 1) {
          const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const paired = candidates.filter(({ code }) =>
            new RegExp(`${esc(code)}\\s*(?:,\\s*)?(?:chapter\\s*|ch\\.\\s*|§+\\s*)${chapter}\\b`, "i").test(md));
          if (paired.length === 1) target = paired[0];
        }
      }
      if (!target) {
        rows.push({ claimId: nextId(moduleId), module: moduleId, unit: unitAt(m.index), citation: m[0], kind: "texas", section, sourceFile: null, sourceHeld: false, sectionPresent: false, status: "AMBIGUOUS_CODE", courseText: sentenceAround(md, m.index), substantiveStatus: "PENDING_REVIEW", reviewerNote: `chapter ${chapter} is claimed by more than one held code; no code name appears within 400 characters, more than one held file contains the section, and the module never names a single code together with chapter ${chapter}`, correctionCommit: null });
        continue;
      }
      push(m.index, `${target.code} ${m[0]}`, "texas", target.file, section);
    }
  }

  /* ── quotation check: every "…" attributed near a citation must appear in the cited source ──── */
  let quotesChecked = 0, quotesFailed = 0;
  /* quotesFailed now means what it says: the quotation is nowhere in the held corpus. The weaker
     outcomes are counted and listed separately so the headline number is not inflated by them. */
  let quotesPassed = 0, quotesPassedOutsideSection = 0, quotesAttributionReview = 0, quotesTruncationReview = 0;
  const quoteFailures = [];   // genuinely absent from every held source — the only real failures
  const quoteFindings = [];   // found, but not where the nearest citation pointed
  const quoteTruncations = [];// found verbatim, but closed before the source's sentence ended
  /* A quotation is checked only when it is attributable: it must sit within 320 characters of a
     citation whose source is held, and it must look like statutory language rather than the course's
     own voice. An unattributable quoted phrase is not a sourcing failure — it is the module quoting
     itself, a term of art, or a hypothetical speaker — so it is counted separately rather than
     reported as a miss. Bracketed alterations "[z]oning" are normalised, since that is the standard
     convention for adjusting a quotation's first letter and does not make the quotation non-verbatim. */
  const CITE_NEAR = 320;
  let quotesUnattributable = 0;

  /* SOFT-WRAP NORMALISATION. Several modules are hard-wrapped at a column, so a quotation longer than
     the wrap width contains a newline. A quote pattern that excludes newlines then skips that
     quotation entirely — and, worse, the next match pairs the SKIPPED quotation's closing mark with
     the following quotation's opening mark and reports the connective prose between them as an
     unverifiable quote. That produced 16 phantom failures and hid the real quotations behind them.

     Collapsing a single newline to a space rewrites the wrapped quotation into one line while
     preserving paragraph breaks, so paragraph-spanning pairs are still rejected. Length is preserved
     exactly — one character in, one character out — so every offset computed on the collapsed text
     still addresses the same position in the original, and unit attribution stays correct. */


  for (const file of moduleFiles) {
    const md = unwrap(fs.readFileSync(path.join(CURRICULUM, file), "utf8"));
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
      /* A real quotation never begins or ends with whitespace. When it appears to, the regex has
         paired the CLOSING mark of one quotation with the OPENING mark of the next and captured the
         connective prose between them — the dominant source of phantom misses. Reject those outright
         rather than trying to guess from the first word. */
      if (/^\s|\s$/.test(m[1])) { quotesUnattributable += 1; continue; }
      if (/\n/.test(m[1])) { quotesUnattributable += 1; continue; }
      /* ATTRIBUTION IS JUDGED AT PARAGRAPH SCOPE, not by a character window alone.
         A ±320-character window asks "what citation is nearest?", but that is not how a reader
         attributes a quotation. A passage that opens "Rule 22 TAC § 531.2 is titled 'Fidelity', and
         it opens: ..." and then quotes four of the rule's clauses over the next several lines has
         attributed every one of them to § 531.2 — yet the window sees only the § 535.156 citation
         that follows the last clause, and reports the quotation as belonging to a source that does
         not contain it. That produced 84 ATTRIBUTION_REVIEW rows on the first Law of Agency run,
         and the ones examined by hand were all correctly attributed in their own paragraph.
         Candidates are therefore every citation in the enclosing paragraph, plus the window, which
         still catches a quotation whose section is named in the previous or next paragraph. */
      const paraStart = md.lastIndexOf("\n\n", m.index) + 1;
      const paraEndRaw = md.indexOf("\n\n", m.index);
      const paraEnd = paraEndRaw === -1 ? md.length : paraEndRaw;
      const near = citeOffsets.filter(
        (c) => Math.abs(c.at - m.index) <= CITE_NEAR || (c.at >= paraStart && c.at <= paraEnd),
      );
      if (!near.length) { quotesUnattributable += 1; continue; }
      const needle = normalizeForQuote(quote);
      if (needle.length < 30) { quotesUnattributable += 1; continue; }
      quotesChecked += 1;
      /* ── the four tiers ─────────────────────────────────────────────────────────────────────
         Cited section, then cited file, then the whole held corpus, then genuinely absent. A
         sentence often cites two sources, so every nearby cited source is tried at each tier
         before widening. */
      const nearSources = [...new Set(near.map((c) => `${c.row.sourceFile}::${c.row.section}::${c.row.kind}`))]
        .map((k) => { const [f, section, kind] = k.split("::"); return { rel: f.replace("texas/trec-sources/", ""), section, kind }; });

      let resolved = null;
      for (const s of nearSources) {                              // tier 1 — the cited section
        const hit = findIn(sectionSpan(s.rel, s.section, s.kind), needle);
        if (hit) { resolved = { tier: "MECHANICAL_PASS", rel: s.rel, section: s.section, hit }; break; }
      }
      if (!resolved) for (const s of nearSources) {               // tier 2 — the whole cited file
        const entry = loadSource(s.rel);
        const hit = entry && findIn(entry.norm, needle);
        if (hit) {
          resolved = {
            tier: "MECHANICAL_PASS_OUTSIDE_SECTION", rel: s.rel, section: s.section, hit,
            note: `verbatim in the cited source but outside the span this script computed for § ${s.section}; the section-boundary extraction is imperfect for this file, not the quotation`,
          };
          break;
        }
      }
      if (!resolved) {                                            // tier 3 — the whole held corpus
        const nearRels = new Set(nearSources.map((s) => s.rel));
        for (const c of corpus()) {
          if (nearRels.has(c.rel)) continue;
          const hit = findIn(c.norm, needle);
          if (hit) {
            resolved = {
              tier: "ATTRIBUTION_REVIEW", rel: c.rel, section: null, hit,
              note: "verbatim in a held source, but not in any source cited within 320 characters of it; the quotation is real and the nearest citation is the thing to check",
            };
            break;
          }
        }
      }

      if (resolved) {
        /* Found. Record the two things a reviewer still needs: where it actually lives, and whether
           closing the quotation early left the source's own sentence running on into a qualifier —
           the module 02 defect class, kept visible as a truncation finding rather than an absence. */
        const tail = resolved.hit.how === "terminal-punctuation" ? resolved.hit.tail : null;
        const runsOn = tail && !(tail === "" || /^[.,;:]/.test(tail) || /^\(\s*[a-z0-9]+\s*\)/.test(tail)
          || /^(?:sec\.|added by|amended by|acts\s+\d{4})/.test(tail));
        if (resolved.tier === "MECHANICAL_PASS") quotesPassed += 1;
        else if (resolved.tier === "MECHANICAL_PASS_OUTSIDE_SECTION") quotesPassedOutsideSection += 1;
        else quotesAttributionReview += 1;
        if (resolved.tier !== "MECHANICAL_PASS") {
          quoteFindings.push({
            module: moduleId,
            status: resolved.tier,
            candidateSections: [...new Set(near.map((c) => c.row.section))].slice(0, 4),
            attributedTo: `texas/trec-sources/${resolved.rel}`,
            matchedAs: resolved.hit.how,
            note: resolved.note,
            quote: quote.slice(0, 200),
          });
        }
        if (runsOn) {
          quotesTruncationReview += 1;
          quoteTruncations.push({
            module: moduleId,
            status: "TRUNCATION_REVIEW",
            classification: /^(?:to|for|unless|except|if|provided|in order|so that|and\b|or\b|but\b)/.test(tail)
              ? "TRUNCATED_MID_CLAUSE" : "TRUNCATED_REVIEW",
            candidateSections: [...new Set(near.map((c) => c.row.section))].slice(0, 4),
            attributedTo: `texas/trec-sources/${resolved.rel}`,
            sourceContinuesWith: tail,
            note: "the quoted words are verbatim, but the quotation closes before the source's sentence does; check that no operative qualifier was dropped",
            quote: quote.slice(0, 200),
          });
        }
      } else {
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
        /* An elided quotation is checked segment by segment. The threshold is low because a real
           elision often leaves a short but distinctive fragment — "a sale of land by . . . the
           Veterans' Land Board" — and discarding those made a correctly-marked elision look like a
           fabrication. */
        const segments = needle.split(/\s*(?:\.\s*\.\s*\.|…|\[\.\.\.\])\s*/).map((x) => x.trim()).filter((x) => x.length >= 12);
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
          /* A stable id so a reviewer's disposition survives a re-run. Derived from the module and
             the quotation text, not from position, so an edit elsewhere in the file cannot orphan
             a recorded disposition. */
          id: crypto.createHash("sha256").update(`${moduleId}|${quote}`).digest("hex").slice(0, 12),
          module: moduleId,
          status: "QUOTE_NOT_IN_CORPUS",
          note: "not found in any source held under texas/trec-sources/, at section, file or corpus level",
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
  const failures = rows.filter((r) => r.status !== "MECHANICAL_PASS" && r.status !== "IDENTIFIED_NOT_TAUGHT");


  const payload = {
    generatedBy,
    generatedFor,
    note: "Mechanical layer only. substantiveStatus is set by review, not by this script.",
    curriculumHashes: Object.fromEntries(moduleFiles.map((f) => [f, crypto.createHash("sha256").update(fs.readFileSync(path.join(CURRICULUM, f))).digest("hex")])),
    totals: {
      citations: rows.length, byStatus, quotesChecked, quotesFailed, quotesUnattributable,
      quotesPassed, quotesPassedOutsideSection, quotesAttributionReview, quotesTruncationReview,
    },
    quoteFailures,
    quoteFindings,
    quoteTruncations,
    claims: rows,
  };
  fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`);

  console.log("citations found:", rows.length);
  for (const [k, v] of Object.entries(byStatus).sort()) console.log(`  ${k}: ${v}`);
  console.log("verbatim quotations checked:", quotesChecked);
  console.log(`  in the cited section: ${quotesPassed}`);
  console.log(`  in the cited source but outside the computed section span: ${quotesPassedOutsideSection}`);
  console.log(`  ATTRIBUTION_REVIEW (verbatim in a held source the nearest citation does not name): ${quotesAttributionReview}`);
  console.log(`  NOT FOUND anywhere in the held corpus: ${quotesFailed}`);
  console.log(`  (of those found, ${quotesTruncationReview} close before the source's sentence ends — truncation review)`);
  console.log("unattributable (not near a citation, not counted):", quotesUnattributable);
  if (quoteFailures.length) {
    console.log("\nquotations absent from the held corpus (first 20):");
    for (const q of quoteFailures.slice(0, 20)) console.log(`  ${q.module} [${q.classification}; near ${q.candidateSections.join(", ")}]: "${q.quote}…"`);
  }
  if (quoteFindings.length) {
    console.log("\nattribution findings (first 20):");
    for (const q of quoteFindings.slice(0, 20)) console.log(`  ${q.module} [${q.status}; near ${q.candidateSections.join(", ")}] -> ${q.attributedTo}`);
  }
  if (failures.length) {
    console.log("\nmechanical failures (first 40):");
    for (const f of failures.slice(0, 40)) console.log(`  ${f.claimId} ${f.module} [${f.status}] ${f.citation} -> ${f.sourceFile || "(unmapped)"}`);
  }
  console.log("\nledger written:", path.relative(root, outPath));
  return { rows, failures, payload, byStatus, quotesChecked, quotesFailed, quotesUnattributable, quoteFailures, quoteFindings, quoteTruncations };

}
