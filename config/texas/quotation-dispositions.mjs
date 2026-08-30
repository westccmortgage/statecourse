/**
 * Texas courses — reviewed dispositions for quotations the mechanical audit cannot match.
 *
 * WHY THIS FILE REPLACES A NUMBER. The Principles II acceptance report gated point 7 on
 * "actionableQuotes.length <= 2". That 2 was not derived from anything; it was the count the
 * then-current matcher happened to produce, and it silently encoded the matcher's defects as a
 * standard. When the matcher was repaired and its coverage widened — 1,048 quotations checked
 * became 1,162 — the count moved to 8 and the course failed a gate it had passed for no better
 * reason than that a tool had improved. A threshold fitted to a broken instrument is not a
 * standard, so it is gone.
 *
 * WHAT REPLACES IT. Every quotation the audit cannot match must have a disposition recorded here,
 * and none of them may be a sourcing defect. That is a real requirement: it permits zero unexplained
 * unmatched quotations rather than an arbitrary handful, and it cannot be satisfied by a tool
 * getting worse.
 *
 * THE IDS ARE STABLE. Each key is sha256(moduleId + "|" + quotation), truncated, computed by the
 * audit engine. It survives a re-run and an edit elsewhere in the same file. If a quotation is
 * rewritten its id changes, the disposition is orphaned, and the gate fails until the new id is
 * reviewed — which is the behaviour we want.
 *
 * A DISPOSITION IS A REVIEW FINDING, NOT A SUPPRESSION. Recording one asserts that a person or
 * agent looked at the quotation against the held source and reached the stated conclusion. Nothing
 * here is a pattern-based exemption, and no disposition may be added to make a gate pass.
 */

/** The only dispositions that exist. Anything else fails at load. */
export const DISPOSITIONS = Object.freeze({
  /* Quoted language invented for teaching: speech in a fact pattern, a model script the module
     labels as practice rather than law, or a formulation quoted in order to be refuted. It asserts
     no source and belongs to no statute; the matcher sees quotation marks near a citation and
     cannot know the difference. */
  INVENTED_DIALOGUE: "invented dialogue or hypothetical fact-pattern language; asserts no source text",
  /* The source's own layout puts the quoted words in separate table cells or columns, so they are
     never contiguous in the extracted text even though a reader sees them as one phrase. */
  FORM_FIELD_LABEL_NOT_CONTIGUOUS: "field labels from a form whose layout separates them in the source text",
  /* A bracketed alteration signalled in the ordinary way, e.g. "provide[]" for "provides" to fit the
     carrying sentence's grammar. Correct practice; unmatched because the brackets change the string. */
  BRACKETED_ALTERATION: "a signalled bracketed alteration; verbatim apart from the marked change",
  /* An ellipsis elides intervening words. Both flanks verify; the elision is disclosed. */
  ELLIPSIS_DISCLOSED: "an ellipsis discloses elided words; the quoted flanks verify against the source",
  /* An ellipsis elides a cross-reference to an exception. Disclosed, so not concealment, but the
     quotation would read better with the qualifier and is a candidate for the next revision. */
  ELLIPSIS_ELIDES_CROSS_REFERENCE: "disclosed ellipsis that drops a cross-reference to an exception; improve at next revision",
  /* Minor punctuation inside a quotation differs from the source, e.g. a dropped colon. Disclosed
     here rather than left to look like an unverified quotation. */
  PUNCTUATION_DEVIATION: "quoted words verify; interior punctuation differs from the source",
  /* The source is held but this engine cannot read it — the six TREC PDFs have no text extractor
     available here. A tool coverage limit, recorded as one. */
  SOURCE_HELD_BUT_NOT_MACHINE_READABLE: "the source is held as a PDF the audit engine cannot extract",
  /* The quotation is verbatim in the section its citation names. Recorded when the mechanical audit
     still surfaces the row for another reason — most often because the source's own sentence runs
     on past the closing quotation mark, and a reviewer has read the continuation and established
     that no operative qualifier, exception or scope limit was lost. */
  VERIFIED_IN_CITED_SECTION: "verbatim in the cited section; the continuation past the closing mark carries no lost qualifier",
  /* Verbatim in the source the citation names, but outside the span this engine computes for that
     section. The section-boundary extraction is imperfect for some files; the quotation is not. */
  VERIFIED_ELSEWHERE_IN_CITED_SOURCE: "verbatim elsewhere in the cited source; the computed section span, not the quotation, is what is off",
  /* Attribution is judged by the passage, not by a character window. The quotation is verbatim in a
     held source that the enclosing paragraph names — as its subject, its heading, or in the
     carrying sentence — while the citation nearest the quotation marks belongs to a neighbour. */
  ATTRIBUTED_AT_PARAGRAPH_SCOPE: "verbatim in a held source the enclosing passage names, though not the nearest citation",
  /* Quotation marks around words that are the course's own restatement rather than the source's.
     Recording this asserts the marks were removed and the resulting paraphrase left supported. */
  PARAPHRASE_NOT_QUOTATION: "a paraphrase that should not carry quotation marks; the marks were removed",
  /* The real thing: a quotation attributed to a source that does not contain it. Any of these fails
     the acceptance gate. */
  SOURCING_DEFECT: "attributed to a source that does not carry the words; must be fixed",
});

export const SOURCING_DEFECT = "SOURCING_DEFECT";

const record = (disposition, module, reason) => Object.freeze({ disposition, module, reason });

/**
 * Principles of Real Estate II — reviewed 2026-08-30 against the held sources, after the matcher
 * repair widened coverage from 1,048 to 1,162 checked quotations. Eight unmatched, none a defect.
 */
const PRINCIPLES_II = Object.freeze({
  cb804a77811a: record("BRACKETED_ALTERATION", "module-02",
    "Texas Constitution art. XVI § 50(a)(5)(C) reads 'expressly provides'; the module writes 'expressly provide[]' so the words fit its carrying sentence 'the contract must'. The brackets signal the alteration in the ordinary way and the rest is verbatim."),
  "699067b9881a": record("FORM_FIELD_LABEL_NOT_CONTIGUOUS", "module-05",
    "Field labels from the Property Code § 5.008 seller's disclosure form. The held source lays the form out in two columns, so these words are never contiguous in the extracted text even though the printed notice reads them as one line."),
  a11eb86c6dd4: record("FORM_FIELD_LABEL_NOT_CONTIGUOUS", "module-05",
    "Same § 5.008 form-layout cause as 699067b9881a — the methamphetamine line is interleaved with the adjacent column in the held HTML."),
  "8fe65d19c4fe": record("PUNCTUATION_DEVIATION", "module-06",
    "Occupations Code § 1101.155(b) reads 'a contract form that is: (1) prepared by the property owner'. The module drops the colon after 'is'. Every quoted word verifies; only the interior punctuation differs, and the ellipsis correctly discloses the elided 'for the sale, exchange, option, or lease of an interest in real property'."),
  a1de68d9ed84: record("INVENTED_DIALOGUE", "module-07",
    "A seller's line in a DTPA fact pattern. Asserts no source."),
  "7cab6ee1ec2a": record("INVENTED_DIALOGUE", "module-07",
    "A seller's answer in a misrepresentation fact pattern. Asserts no source."),
  "942e2915d797": record("ELLIPSIS_ELIDES_CROSS_REFERENCE", "module-08",
    "42 U.S.C. § 3610(g)(2)(A) reads 'the Secretary shall, except as provided in subparagraph (C), immediately issue a charge on behalf of the aggrieved person'. The module's ellipsis elides the subparagraph (C) cross-reference. The elision is disclosed and both flanks verify, but the exception should be carried at the next content revision."),
  f4cdc184652c: record("INVENTED_DIALOGUE", "module-08",
    "A blockbusting solicitation invented to illustrate 42 U.S.C. § 3604(e). Asserts no source; it is the conduct the section prohibits, not the section's words."),
});

/* ── helpers for the Law of Agency entry ────────────────────────────────────────────────────────
   Each helper states the check that was actually performed, and takes the facts that differ per
   quotation. Nothing here is a pattern-based exemption: the helper writes down a finding, it does
   not decide one. Every id below was located in its module, read in its enclosing passage, and
   compared character by character with the held source named in its reason. */

/** Quoted language the course invented — dialogue in a fact pattern, a model script, or a wrong
    formulation quoted in order to be refuted. It asserts no source, so its absence from the corpus
    is the correct result rather than a miss. */
const invented = (module, what) => record("INVENTED_DIALOGUE", module,
  `${what}. Read in place: the words are the course's own, are attributed to no statute, rule or form, and are absent from every file under texas/trec-sources/ for that reason rather than through a sourcing failure.`);

/** Verbatim in a held source that the enclosing passage names, but not in the source the nearest
    citation names. The matcher judges attribution by proximity; a reader judges it by the passage. */
const paraScope = (module, file, anchor, near) => record("ATTRIBUTED_AT_PARAGRAPH_SCOPE", module,
  `Compared with texas/trec-sources/${file}: verbatim there. The enclosing passage attributes it to ${anchor}; the matcher flagged it only because the nearest citation in its window is ${near}. The attribution a reader makes is the correct one.`);

/** The quoted words are verbatim and the source's own sentence continues past the closing mark.
    Recorded only where reading the continuation showed that no operative qualifier or exception was
    lost — the `why` says how that was established for this quotation. */
const truncOk = (module, file, why) => record("VERIFIED_IN_CITED_SECTION", module,
  `Compared with texas/trec-sources/${file}: verbatim. The source's sentence runs on past the closing quotation mark, which is what the truncation check reports; ${why}`);

/** Same, for a quotation the engine could only place outside the section span it computed. */
const truncOutside = (module, file, why) => record("VERIFIED_ELSEWHERE_IN_CITED_SOURCE", module,
  `Compared with texas/trec-sources/${file}: verbatim, though outside the span the engine computes for the cited section. Read the continuation past the closing mark; ${why}`);

/**
 * Texas Law of Agency — reviewed 2026-08-30 against the held sources. 1,108 quotations checked;
 * 148 could not be matched mechanically to the source their nearest citation names. Every one was
 * dispositioned. Two quotations were extended during that review because they closed before the
 * source's own clause did (module 02's § 535.156 offer-submission carve-out and module 03's
 * § 1101.562 showing permission); both are noted at their ids. No sourcing defect was found.
 *
 * RE-RECONCILED after the reduction passes, the same day. The reduction took the course from 1,657
 * required minutes to 1,530.8 and moved a great deal of prose, so the reconciliation was run again
 * against the reduced curriculum: 126 unmatched quotations, 8 of them carrying no disposition and
 * 30 dispositions carrying no quotation. The eight are dispositioned below. Twenty-eight of the
 * thirty orphans are retired, with reasons, in LAW_OF_AGENCY_RETIRED; the other two were not
 * orphaned by an editorial choice but by a reduction edit that had truncated a quotation away from
 * a material qualifier, and the curriculum was corrected rather than the disposition retired:
 *
 *   module 03, DTPA § 17.45(9). The reduction deleted 'adding that "actual awareness may be
 *   inferred where objective manifestations indicate that a person acted with actual awareness"',
 *   leaving the definition of "knowingly" to close at "of the act or practice." That reads as a
 *   requirement of proven subjective awareness, which is the opposite of what § 17.45(9) says and
 *   the opposite of what the module's own applied exercise turns on. The clause is restored, and
 *   id 4f8b60c2917d is live again.
 *
 *   module 10, 22 TAC § 535.149. The reduction rewrote the rule's deceptive-practices sentence as
 *   'ties deceptive practices to "the acts described in the Texas Business and Commerce Code
 *   §17.46"', dropping "include, but are not limited to" — the words that make the § 17.46 list
 *   illustrative rather than exhaustive. The qualifier is restored and id e98d8ba4d8ed is live
 *   again. One further defect was found in the same pass and fixed: module 09 opened a sentence
 *   with § 535.2(h)(3) and capitalised the rule's lower-case initial without brackets. The matcher
 *   lowercases both sides and can never see that; see 325b9d322735.
 */
const LAW_OF_AGENCY = Object.freeze({
  /* ── the LOA-1 course approval form: held as a PDF the engine cannot read ────────────────────
     Verified by hand with pdfplumber against texas/trec-sources/LOA-1.pdf (3 pages, LOA-1
     (09/11/2024)). Every module's front matter quotes its topic's scope note from that form; only
     these three sit near enough to a citation for the matcher to test them. The form prints the
     scope notes without a sentence-final period, which the modules supply from their own carrying
     sentence in the ordinary American convention. The other nine scope notes, the per-unit minute
     figures and the 1,500-minute total were checked against the same extraction at the same time
     and all agree. */
  "3e66f62e20b3": record("SOURCE_HELD_BUT_NOT_MACHINE_READABLE", "module-02",
    "LOA-1 page 1 prints 'Relationship between principal & agent; authority of agent' as the scope note above the five units of the Basic Agency Relationships, Disclosure and Duties to the Client topic (subtotal 125 minutes, which module 02's prescribed time matches). Verbatim. The audit engine indexes only .htm/.html/.txt/.xml, so it cannot see the held PDF; extracted with pdfplumber and read directly."),
  "1f429a14fc02": record("SOURCE_HELD_BUT_NOT_MACHINE_READABLE", "module-04",
    "LOA-1 page 2 prints 'Disclosure of agency; listing or buying representation procedures' above the five units of the Seller Agency topic (subtotal 120 minutes, matching module 04). Verbatim. Extracted with pdfplumber because the engine holds no PDF text extractor."),
  a3da769ae44f: record("SOURCE_HELD_BUT_NOT_MACHINE_READABLE", "module-05",
    "The same LOA-1 page 2 scope note, printed a second time above the six units of the Buyer Agency topic (subtotal 150 minutes, matching module 05). Verbatim against the pdfplumber extraction; identical text to 1f429a14fc02 but a distinct id because it sits in a different module."),

  /* ── invented dialogue and hypothetical fact-pattern language ────────────────────────────────
     Twenty-four quotations, none of which asserts source text. They are people speaking in
     exercises, model scripts the modules explicitly label as practice rather than law, and
     formulations quoted in order to be corrected. */
  "238242322df8": invented("module-03", "Marcus's second question in the applied exercise on 22 TAC § 535.157 response times"),
  e783920044f3: invented("module-03", "A misstatement of § 1101.805 the module quotes in order to refute it — the next sentence is 'It does not say that', and the shield's two conditions in § 1101.805(e) are then set out in full"),
  "4fa464b839f0": invented("module-03", "The module's own lesson sentence, set in quotation marks to contrast with the wrong lesson it has just quoted ('the lesson is not \"you are protected\"')"),
  "154e93a268e7": invented("module-03", "The wrong takeaway about death disclosure, quoted so the module can replace it with the statutory sentence carrying the 'unrelated to the condition of the property' qualifier"),
  "5dd14ca1d7cd": invented("module-04", "Marguerite's instruction to the sponsoring broker in the net-listing applied exercise on 22 TAC § 535.16"),
  "96504f3077a5": invented("module-04", "A hypothetical instruction from a listing broker to a cooperating broker, used to show how § 1101.557(b)(1) is violated"),
  "0de09504f0b1": invented("module-04", "Broker Ellis's first statement at the Hallmans' door in the applied exercise on 22 TAC § 535.153"),
  "378f82159d7b": invented("module-04", "Broker Ellis's second statement in the same exercise, the one § 1101.652(b)(22) is applied to"),
  "4a1d8f5f7b6c": invented("module-04", "Nguyen's text message to Ellis in the same exercise, used to raise § 1101.557(b)(1)"),
  "9c9f75618af8": invented("module-06", "A script for announcing intermediary status which the module immediately labels 'practice, not law — no held source prescribes the script', tracing each clause to § 1101.559(c), § 1101.651(d) and § 1101.557(b)"),
  "7a947cf52893": invented("module-06", "One of three specimen sentences of general transaction advice, quoted to show what takes a license holder outside § 1101.562(a)(3)"),
  "365f6421261f": invented("module-06", "Specimen negotiating advice to an unrepresented buyer, quoted as the behaviour that causes unintended dual representation"),
  bad77b547ac3: invented("module-06", "The module's model safe reply at a listing, with each clause traced afterwards to § 1101.558(b), § 1101.562(a)(3), § 1101.562(c) and § 1101.557(b)(3)"),
  "3c65dbce8fd7": invented("module-08", "Priya's 9:44 p.m. reply in the applied exercise on § 1101.558"),
  a0d60ed40e12: invented("module-08", "The entire text of a fictional brokerage's one-sentence agency policy page, quoted so students can identify the three decisions it fails to make"),
  b4c013f75219: invented("module-09", "A broker's statement to a new agent in the applied exercise on Labor Code § 201.072"),
  da93d655bbbb: invented("module-09", "A broker's paraphrase of 22 TAC § 535.2(a)'s third sentence, quoted in an exercise that asks which sentence the broker is relying on"),
  abadc3fc8ae9: invented("module-11", "Words the module says § 17.46(b)(5) does NOT contain — quoted to make the point that the subdivision carries no scienter element. Confirmed against BC.17.htm that the phrase is absent from § 17.46, which is what the module asserts"),
  "33db94725cd7": invented("module-11", "A specimen misdescription of an option period, used to illustrate § 17.46(b)(12)"),
  "828813bb7dd2": invented("module-11", "A specimen misdescription of a listing agreement's cancellation terms, used for the same subdivision"),
  "5fdd520da92d": invented("module-11", "A specimen overstatement of an agent's authority, used to illustrate § 17.46(b)(14)"),
  "8fbe362551c9": invented("module-11", "A specimen overstatement about a residential service contract, used to illustrate § 17.46(b)(20)"),
  a2e1b8dcacfe: invented("module-11", "The listing agent's written statement about the foundation in the Mansfield damages exercise"),
  "4169e987f383": invented("module-11", "One of four specimen sentences the module sets side by side to teach the first carve-out to § 17.49(i) — two offered as statements of fact ('This house is 2,900 square feet', 'The roof was replaced in 2021') and two as judgment or opinion. It describes no property that exists"),

  /* ── attributed at paragraph scope ───────────────────────────────────────────────────────────
     Sixty-nine quotations that are verbatim in a held source, just not in the source the nearest
     citation names. Each was located in its module and read in its enclosing passage; in every case
     the passage names the source the words came from, usually as its subject ("Rule 22 TAC § 535.2
     is the operational statement…" followed by a subsection-by-subsection walk-through), and the
     citation the matcher latched onto belongs to a neighbouring sentence. */
  "0c03607c0da1": paraScope("module-01", "articles/what-changes-2026-buyer-tenant-representation.html", "TREC's explanatory article on the 2026 changes, which the sentence names and labels guidance rather than law", "§ 1101.002 and § 1101.805"),
  ba3479be7734: paraScope("module-01", "articles/what-changes-2026-buyer-tenant-representation.html", "the same TREC article named in the same sentence", "§ 1101.002 and § 1101.805"),
  "971bb3f903e4": paraScope("module-01", "articles/what-changes-2026-buyer-tenant-representation.html", "the same TREC article named in the same sentence", "§ 1101.002 and § 1101.805"),
  "4cf31e798e85": paraScope("module-02", "trec-rules/531.20.txt", "22 TAC § 531.20 — the shorter label, with its 12-point minimum", "§ 1101.558"),
  cdd221b63238: paraScope("module-02", "trec-rules/531.20.txt", "22 TAC § 531.20(b)(2), quoted in the same walk-through", "§ 1101.558"),
  "1f01729fe68b": record("ATTRIBUTED_AT_PARAGRAPH_SCOPE", "module-02",
    "The 'business website' definition. The matcher resolved it to texas/trec-sources/trec-rules/531.18.txt, but the identical three-element definition also appears in 531.20.txt ('For purposes of this section, business website means a website on the internet that: is accessible to the public; contains information about a license holder's real estate brokerage services; and the content of the website is controlled by the license holder'), and § 531.20 is the rule the passage is walking through and names as 'the rule'. Checked both files; verbatim in each."),
  "691784a081c4": paraScope("module-02", "trec-rules/531.20.txt", "22 TAC § 531.20(c), the delivery-methods subsection, in the same walk-through", "§ 1101.558"),
  "14433475922f": paraScope("module-03", "articles/what-changes-2026-buyer-tenant-representation.html", "TREC's article on the 2026 changes, which the sentence names and holds 'as guidance rather than as law'", "§ 1101.805 and § 1101.804"),
  "63cacee8f6f6": paraScope("module-04", "trec-rules/535.16.txt", "22 TAC § 535.16, whose net-listing conditions the passage has just applied ('The rule then explains itself')", "§ 531.2"),
  b6d53a31616f: paraScope("module-04", "trec-rules/535.16.txt", "22 TAC § 535.16, in the same passage", "§ 531.2"),
  "3f7bdd09c764": paraScope("module-04", "articles/what-changes-2026-buyer-tenant-representation.html", "TREC's 2026 article, named in the carrying sentence", "§ 1101.002 and § 1101.805"),
  "1423746af18d": paraScope("module-04", "articles/what-changes-2026-buyer-tenant-representation.html", "the same TREC article", "§ 1101.002 and § 1101.805"),
  "5f8eddb81f30": paraScope("module-04", "articles/what-changes-2026-buyer-tenant-representation.html", "the same TREC article", "§ 1101.002 and § 1101.805"),
  "3634f2922956": paraScope("module-05", "articles/what-changes-2026-buyer-tenant-representation.html", "TREC's article, named in the carrying sentence ('TREC's article puts the same limit in plain words')", "§ 1101.563"),
  "880058b91123": paraScope("module-05", "articles/trec-contracts-page-2026-08-29.html", "TREC's contracts page, named in the carrying sentence ('TREC's contracts page states')", "§ 537.11 and § 1101.563"),
  "7c0be2326ac6": paraScope("module-05", "articles/what-changes-2026-buyer-tenant-representation.html", "TREC's 2026 article, worked through across this passage", "§ 1101.563, § 1101.562 and § 1101.558"),
  e1654b2acbf4: paraScope("module-05", "articles/what-changes-2026-buyer-tenant-representation.html", "the same TREC article", "§ 1101.563, § 1101.562 and § 1101.558"),
  e168add498d2: paraScope("module-05", "articles/what-changes-2026-buyer-tenant-representation.html", "the same TREC article", "§ 1101.563, § 1101.562 and § 1101.558"),
  "0218aa687233": paraScope("module-05", "articles/what-changes-2026-buyer-tenant-representation.html", "the same TREC article ('The article adds a sentence that surprises people')", "§ 1101.563, § 1101.562 and § 1101.558"),
  "182a49a7d1a0": paraScope("module-05", "articles/what-changes-2026-buyer-tenant-representation.html", "the same TREC article ('The article also states the practical timing')", "§ 1101.563 and § 1101.652"),
  "7393d4f6a2ff": paraScope("module-05", "articles/what-changes-2026-buyer-tenant-representation.html", "the same TREC article", "§ 1101.563 and § 1101.652"),
  "3962ae76d599": paraScope("module-05", "articles/what-changes-2026-buyer-tenant-representation.html", "TREC's article, which the sentence names in full with its 01-07-2026 date before quoting it", "§ 1101.563, § 1101.562 and § 1101.652"),
  "82c4d74e4e23": record("ATTRIBUTED_AT_PARAGRAPH_SCOPE", "module-06",
    "Compared with texas/trec-sources/trec-rules/531.2.txt: verbatim, matched as ellipsis segments in order. The enclosing sentence names the source two words earlier ('Rule 531.2 — the Canon the Commission titles Fidelity'); the nearest citation is § 1101.557. The ellipsis elides only 'of the license holder' from 'the primary duty of the license holder is to represent the interests of the client'. The canon's counterweight proviso — 'that, however, the license holder, in performing duties to the client, shall treat other parties to a transaction fairly' — is not quoted here, and was checked: modules 01, 02, 03 and 10 each quote it verbatim, and module 06 teaches § 1101.559(c)'s fair-and-impartial duty throughout."),
  "84763a8deff5": paraScope("module-06", "trec-rules/531.2.txt", "22 TAC § 531.2, in the same sentence", "§ 1101.557"),
  "53f369afcce0": paraScope("module-06", "trec-rules/531.2.txt", "22 TAC § 531.2, in the same sentence", "§ 1101.557"),
  "0d85ca0f40f2": paraScope("module-06", "trec-rules/535.2.txt", "22 TAC § 535.2, named in the same sentence ('Rule 535.2, the broker responsibility rule taught in Module 09, requires that')", "§ 1101.803"),
  dd9e134186fc: paraScope("module-06", "trec-rules/535.144.txt", "22 TAC § 535.144, named at the head of the sentence ('Rule 535.144 governs the related situation')", "§ 1101.557 and § 1101.652"),
  "4f3d60267597": paraScope("module-09", "trec-rules/535.2.txt", "22 TAC § 535.2(g), inside the unit titled 'Broker Responsibility (Relationships between Brokers and Agents, §535.2)' which walks the rule subsection by subsection", "§ 535.154 and § 535.155"),
  "55987238e6c8": paraScope("module-09", "trec-rules/535.2.txt", "22 TAC § 535.2(i), whose lead-in the passage quotes before listing its eight requirements", "§ 201.072 and § 535.146"),
  "0376851112b9": paraScope("module-09", "trec-rules/535.2.txt", "22 TAC § 535.2(i)(1), first of those eight", "§ 535.146"),
  "86978dbd396b": paraScope("module-09", "trec-rules/535.2.txt", "22 TAC § 535.2(i)(2)", "§ 535.146"),
  c975c0f24b65: paraScope("module-09", "trec-rules/535.2.txt", "22 TAC § 535.2(i)(3), quoted with a bracketed lower-case initial ('[a]ny and all compensation') so it fits the carrying sentence", "§ 535.146"),
  "874119902221": paraScope("module-09", "trec-rules/535.2.txt", "22 TAC § 535.2(i)(4)", "§ 535.146"),
  "120969eebf91": paraScope("module-09", "trec-rules/535.2.txt", "22 TAC § 535.2(i)(5)", "§ 535.146"),
  "77e393a07ca8": paraScope("module-09", "trec-rules/535.2.txt", "22 TAC § 535.2(i)(5)'s first-three-times coaching floor", "§ 535.146"),
  "23c369085df4": paraScope("module-09", "trec-rules/535.2.txt", "22 TAC § 535.2(i)(6)", "§ 535.146"),
  "675465392452": paraScope("module-09", "trec-rules/535.2.txt", "22 TAC § 535.2(i)(7)", "§ 535.146"),
  a7579c7020b7: paraScope("module-09", "trec-rules/535.2.txt", "22 TAC § 535.2(c), the trust-funds subsection of the same walk-through", "§ 535.146 — which is the cross-reference printed inside the quoted sentence itself, so the matcher's nearest citation is a word the rule supplied"),
  "7b823fce53b7": paraScope("module-09", "trec-rules/535.2.txt", "22 TAC § 535.2(d), the property-management subsection, immediately next in the same walk-through", "§ 535.146, carried over from the subsection quoted just above"),
  "7de302cc5f98": record("ATTRIBUTED_AT_PARAGRAPH_SCOPE", "module-09",
    "Compared with texas/trec-sources/trec-rules/535.2.txt: verbatim there. It is § 535.2(h)'s record-retention lead-in, quoted inside the unit titled 'Broker Responsibility (Relationships between Brokers and Agents, §535.2)' which walks the rule subsection by subsection; the matcher flagged it only because the nearest citation in its window is § 535.155, named in subsection (g) one paragraph above. One deviation, checked and recorded rather than left to look like an unverified quotation: the source's sentence ends in a colon that introduces the eight record categories and the module closes the quotation with a full stop. The eight categories are then quoted one by one in the next sentence, so the colon's work is done rather than dropped."),
  "325b9d322735": record("ATTRIBUTED_AT_PARAGRAPH_SCOPE", "module-09",
    "Compared with texas/trec-sources/trec-rules/535.2.txt: verbatim there — § 535.2(h)(3), the third of the eight record categories — and the enclosing passage attributes it to § 535.2, whose subsections it is walking; the matcher flagged it only because the nearest citation in its window is § 201.072, named two sentences later. A DEFECT WAS FOUND HERE AND FIXED IN THE CURRICULUM. The rule prints the category in lower case, as an item in the list § 535.2(h)'s colon introduces. The module opened a sentence with it and silently capitalised the initial, and no mechanical check can catch that: the matcher lowercases both sides before comparing. The module now reads '[S]ubstantive communications with parties to the transaction', which signals the alteration in the ordinary way and matches the convention this same unit already uses for '[a]ny and all compensation' and '[r]ecords are properly maintained'. The lower-case occurrence in the eight-category list four lines above was checked and is verbatim."),
  "05d32d567603": paraScope("module-10", "federal/us42-3604.html", "42 U.S.C. § 3604(a), quoted in a subsection-by-subsection walk of § 3604", "§ 3603"),
  "15112e8b7bb9": paraScope("module-10", "federal/us42-3605.html", "42 U.S.C. § 3605(a), named in the carrying sentence ('Section 3605(a) provides that')", "§ 3604, § 3606 and § 3603"),
  "342c95d68b31": paraScope("module-10", "federal/us42-3605.html", "42 U.S.C. § 3605(b)(2), named in the same sentence", "§ 3604, § 3606 and § 3603"),
  c30e3f470ace: paraScope("module-10", "federal/us42-3617.html", "42 U.S.C. § 3617, named in the carrying sentence ('And § 3617 makes it unlawful')", "§ 3604, § 3606 and § 3603"),
  e98d8ba4d8ed: paraScope("module-10", "trec-rules/535.149.txt", "22 TAC § 535.149, in the same sentence", "§ 535.1, § 535.2, § 535.145 and § 1101.652"),
  "4dc50c768f7c": record("ATTRIBUTED_AT_PARAGRAPH_SCOPE", "module-10",
    "Compared with texas/trec-sources/trec-rules/535.149.txt: verbatim there — the rule's gift sentence entire, including the 'but license holders when procuring prospects must otherwise comply with the provisions of §535.20 of this title' limb that makes it a conditional permission and not a blanket one. The enclosing passage attributes it to § 535.149, which its own carrying sentence names ('Section 535.149 does the same work for § 1101.652(b)(14) and (b)(15)'); the matcher never indexes that citation because the module writes the rule's number without a section symbol, which is also why the sections it reports as nearest are § 535.1, § 535.2, § 535.145 and § 1101.652 — the first two of them substring matches inside '535.149' and '535.145'. Only the terminal full stop differs, rendered as a comma so the sentence can continue. Successor to the retired 35e6ed9801ae, which was the same words without that comma."),
  "281c3c30c6ef": paraScope("module-12", "trec-rules/535.155.txt", "22 TAC § 535.155, the unit's own rule, in the social-media paragraph", "§ 1101.652"),
  "8c090b8338a4": paraScope("module-12", "trec-rules/535.155.txt", "22 TAC § 535.155, same paragraph", "§ 1101.652"),
  b48d187f3cf6: paraScope("module-12", "trec-rules/535.155.txt", "22 TAC § 535.155, same paragraph", "§ 1101.652"),
  cd8cd3583ae5: paraScope("module-12", "trec-rules/535.155.txt", "22 TAC § 535.155's misleading-advertisement lead-in", "§ 535.17 and § 1101.652"),
  "503c7e492990": paraScope("module-12", "trec-rules/535.155.txt", "22 TAC § 535.155's first listed misleading advertisement", "§ 535.17 and § 1101.652"),
  f23c64f657c2: paraScope("module-12", "trec-rules/535.155.txt", "22 TAC § 535.155, in the same enumeration", "§ 535.17 and § 1101.652"),
  "2b09cb557c55": paraScope("module-12", "trec-rules/535.155.txt", "22 TAC § 535.155, in the same enumeration", "§ 535.17 and § 1101.652"),
  "5195201646c0": paraScope("module-12", "trec-rules/535.155.txt", "22 TAC § 535.155, in the same enumeration", "§ 535.17 and § 1101.652"),
  "074b12c97750": paraScope("module-12", "trec-rules/535.155.txt", "22 TAC § 535.155, in the same enumeration — and the quotation carries the 'unless it is based on an appraisal that is disclosed and readily available upon request' proviso", "§ 535.17 and § 1101.652"),
  "60915187563d": paraScope("module-12", "trec-rules/535.155.txt", "22 TAC § 535.155, in the same enumeration", "§ 535.17 and § 1101.652"),
  d8f41cf1a886: paraScope("module-12", "trec-rules/535.155.txt", "22 TAC § 535.155's three timing items, quoted with the exclusive-listing waiver proviso intact", "§ 535.17"),
  "218075552e3c": paraScope("module-12", "articles/what-changes-2026-buyer-tenant-representation.html", "TREC's article, named in the carrying sentence ('TREC's article says so and says')", "§ 1101.555 and § 1101.563"),
  b3453ea1f461: paraScope("module-12", "trec-rules/537.11.txt", "22 TAC § 537.11(c), whose form-approval conditions the paragraph is enumerating", "§ 1101.652"),
  "3b4d85f06861": paraScope("module-12", "trec-rules/537.11.txt", "22 TAC § 537.11's two affirmative advisory duties, introduced two sentences earlier", "§ 1101.654"),
  "6412b45c2c4d": paraScope("module-12", "trec-rules/535.146.txt", "22 TAC § 535.146, the trust-money rule the paragraph is walking through", "§ 1101.652"),
  c1ca58720096: paraScope("module-12", "trec-rules/535.144.txt", "22 TAC § 535.144(c), the unit's subject", "§ 535.155"),
  "1b6989ff29c5": paraScope("module-12", "trec-rules/535.154.txt", "22 TAC § 535.154's team-name definition, in the paragraph walking that rule", "§ 535.155"),
  "2b749852721d": paraScope("module-12", "trec-rules/535.154.txt", "22 TAC § 535.154, first of the three team-name rules", "§ 535.155"),
  be42e7988136: paraScope("module-12", "trec-rules/535.154.txt", "22 TAC § 535.154, second of the three", "§ 535.155"),
  da1f2e4e0397: paraScope("module-12", "trec-rules/535.154.txt", "22 TAC § 535.154, third of the three", "§ 535.155"),
  "72c84d0cc3c8": paraScope("module-12", "trec-rules/535.154.txt", "22 TAC § 535.154's assumed-business-name registration requirement", "§ 535.2"),
  "6e87f26e1d50": paraScope("module-12", "statutes/OC.1101.htm", "Occupations Code § 1101.552(e), reached by a subsection walk of § 1101.552 that begins two sentences earlier with subsection (d)", "§ 535.21 and § 535.2"),

  /* ── truncation review: the quoted words are verbatim and the source's sentence runs on ───────
     This is the class that matters most, because every quoted word can be verbatim and the
     quotation can still change the law by closing before an "unless", an "except as provided", or a
     scope-limiting clause. Each of the thirty below was read against the held source WITH the
     continuation, and each reason records where the dropped words went. Four quotations did not
     survive that reading. Module 02's § 535.156 quotation was extended in the curriculum and now
     matches cleanly, so it has no id here at all; module 03's § 1101.562 sentence was corrected
     around an unchanged quoted string and keeps its id, 51592f113960. The re-reconciliation after
     the reduction found two more, both introduced by the reduction itself and both fixed in the
     curriculum: § 17.45(9)'s inference clause at 4f8b60c2917d and § 535.149's 'include, but are
     not limited to' at e98d8ba4d8ed, which is filed under paragraph scope. Every reason in this
     section was re-read against the reduced modules; one, 7ad7daf0a5c9, quoted a clause the
     reduction had shortened and its wording is updated. */
  "6e8deb0c5100": truncOk("module-01", "statutes/OC.1101.htm",
    "the source continues 'to conduct not more than three real estate transactions annually', which is a material cap. It is not dropped: the quotation sits inside a statute reading exercise whose very next words are 'Does the exemption have a limit? Quote it.', and the module states the cap in full twice earlier ('The attorney-in-fact exemption has a numerical cap of \"not more than three real estate transactions annually\"'). Extending the quotation here would delete the question the exercise exists to ask."),
  "492fb176e40d": truncOk("module-01", "trec-rules/535.2.txt",
    "the source continues 'and is obliged to convey to the principal all information known to the agent which may affect the principal's decision unless prohibited by other law'. The carrying sentence quotes that closing qualifier itself — 'and then qualifies it \"unless prohibited by other law\"' — and then explains what other law prohibits, so the qualifier is carried rather than dropped."),
  "7bee67adbb27": truncOk("module-03", "trec-rules/535.157.txt",
    "the source continues 'within two calendar days'. The quotation is naming the rule's third category of addressee, not stating the rule: 22 TAC § 535.157 is block-quoted in its entirety earlier in the same module ('within two calendar days'), the deadline is set in bold in the module recap, and computing it is one of the module's stated objectives. Both occurrences of this quotation share this id."),
  "51592f113960": truncOk("module-03", "statutes/OC.1101.htm",
    "the source continues 'if the broker: (1) has not agreed…' — four conjunctive conditions on the permission. Reading it, the sentence overstated § 1101.562(a) by naming the permission without them, so the curriculum was CORRECTED: it now reads 'permits a broker, on the four conjunctive conditions Module 05 sets out, to show real property \"to a party without representing the party\"'. The quoted string is unchanged, so the id is unchanged; modules 01 and 02 already enumerate all four conditions."),
  a64f87f24763: truncOk("module-03", "statutes/OC.1101.htm",
    "the source continues 'made by a license holder in a real estate transaction unless the party: (1) knew…'. The quotation is lexical — the sentence is 'Section 1101.805 speaks of \"a misrepresentation or a concealment of a material fact\"', quoting the statute's phrase for the concept of concealment, not stating a liability rule. The rule itself, § 1101.805(e) with both conditions, is block-quoted in full earlier in the same module."),
  "4f8b60c2917d": truncOk("module-03", "statutes/BC.17.htm",
    "the source continues 'giving rise to the consumer's claim or, in an action brought under subdivision (2) of subsection (a) of Section 17.50…', which identifies which act the awareness must attach to rather than qualifying the standard. The operative element — actual awareness at the time of the act — is quoted whole, and the carrying sentence goes straight on to quote § 17.45(9)'s inference clause."),
  "167b46b80544": truncOk("module-03", "statutes/PR.5.htm",
    "the source continues 'unrelated to the condition of the property', which is the qualifier that decides the whole stigmatised-property topic. It is not dropped: the quotation sits in a statute reading exercise whose instruction is 'write out the qualifier the statute attaches to the words \"death by natural causes, suicide, or accident.\"' The module states the qualifier verbatim three further times and gives it its own heading, 'Qualifier one'."),
  a1bc097e76ad: truncOk("module-03", "statutes/OC.1101.htm",
    "the source continues 'of a buyer, seller, landlord, or tenant, including a trustee, guardian, executor, administrator, receiver, or attorney-in-fact'. That is an illustrative enumeration introduced by 'including', not a qualifier; the quotation is in the module recap, and § 1101.551(2) is block-quoted complete — enumeration and exclusion sentence both — in the unit the recap summarises."),
  "0d67f15f6355": truncOk("module-05", "statutes/OC.1101.htm",
    "the same § 1101.563(b) trigger clause as fe3d4e255729. The carrying sentence is making the point that the section reaches prospective buyers only, and the module block-quotes subsection (b) whole in the next paragraph ('Subsection (b) states the mandate and the moment it attaches')."),
  ef6f109871ba: truncOk("module-05", "statutes/OC.1101.htm",
    "the source continues with § 1101.558(c)'s three conditions. The quotation is doing scope work, not stating the exception: the sentence's point is that § 1101.558(c) relieves only the (b-1) notice and does not reach § 1101.562(b). The three conditions are set out elsewhere in the module and § 1101.558(c)(3) is applied by number two sentences later."),
  d3cb264cf2d8: truncOk("module-06", "statutes/OC.1101.htm",
    "the source continues 'and for that purpose may act as an agent of the parties'. The quotation is the short form used to make the point that the intermediary is the broker; the same module quotes § 1101.551(1) with the dropped clause intact twice, and analyses that clause word by word ('the intermediary \"may act as an agent of the parties\" — plural, jointly')."),
  d2ee82c7a0c3: truncOk("module-06", "statutes/OC.1101.htm",
    "the source continues 'may not: (1) disclose…'. The quotation is § 1101.651(d)'s subject clause and the carrying sentence ends with the colon before block-quoting all four subdivisions with their 'unless' clauses; the heading above it reads 'What the intermediary may not disclose: § 1101.651(d), in full and with its qualifiers' and warns that people drop the unless clauses. Both occurrences share this id."),
  d0c3ea0d7348: truncOk("module-06", "statutes/OC.1101.htm",
    "the same § 1101.651(d) subject clause, quoted here to show that the subsection is drafted to govern intermediaries and therefore survives § 1101.561(a)'s supersession. No rule is stated, so the 'may not' list that follows in the source is not being summarised."),
  d645e171e492: truncOutside("module-06", "statutes/OC.1101.htm",
    "the source continues 'may appoint: (1) a license holder associated with the broker…'. The quotation is § 1101.560(a)'s subject clause under the heading 'Who may appoint', and § 1101.560(a) and (b) are block-quoted in full immediately above it."),
  b006dad04f0c: truncOutside("module-06", "statutes/OC.1101.htm",
    "the source continues 'to communicate with and carry out instructions of one party'. The quotation is in the module recap, naming who may be appointed; the recap's own sentence supplies the rest of the mechanism ('one licensee to one party and another to any other party; and the appointment is valid only if the parties' written consent authorized it')."),
  "76659e347a1b": truncOk("module-07", "statutes/OC.1101.htm",
    "the source continues 'or by a person authorized by that party to sign the document'. That alternative is not lost: § 1101.806(c) is quoted complete, including those words, in the sentence immediately before, and this short quotation is the emphasis pull-out that follows ('Notice exactly who must have signed'). Both occurrences share this id."),
  "7da365b17585": truncOk("module-07", "statutes/OC.1101.htm",
    "the source continues 'in a contract, other than a contract to perform property management services…'. The property-management exception is carried, in the course's own voice, in the same sentence: 'which forces every brokerage service contract other than property management to carry \"a definite termination date…\"'."),
  "98742fb98e70": truncOk("module-07", "statutes/OC.1101.htm",
    "the source continues 'as required by subsection (a), the person shall verify…'. The quotation identifies the aggrieved person § 1101.606(c) describes, in a passage whose whole point is that this is a recovery-fund provision and not an agency-termination rule; no rule is being stated from the quoted words."),
  dd95c36b17cc: truncOk("module-07", "statutes/OC.1101.htm",
    "the same § 1101.651(d) subject clause as d2ee82c7a0c3, here in module 07's confidentiality section. The passage's next sentence quotes subdivision (d)(3) whole with all three of its lettered exceptions ('unless: (A)… (B)… (C)…')."),
  "2973a4e569ec": truncOutside("module-09", "federal/us26-3508.html",
    "what follows the quoted words in the held file is not statutory text at all but the uscode.house.gov page's own navigation chrome ('result 1 of 1 current 2024 main ed.'). The quotation is the section heading of 26 U.S.C. § 3508, and § 3508(a) is quoted in full in the next sentence."),
  ada97ea62424: truncOk("module-09", "trec-rules/535.3.txt",
    "the source continues 'except with the written consent of the sales agent's sponsoring broker'. The written-consent exception is not dropped: the same sentence quotes § 535.3's second sentence complete with it, and this short quotation is the emphasis pull-out that follows ('Note the breadth — \"a commission or other valuable consideration,\" not merely a commission')."),
  "670bf074c12f": truncOk("module-09", "trec-rules/535.3.txt",
    "the quoted words are the rule's title, and what the source 'continues' with is the rule's first sentence. The module block-quotes both of § 535.3's sentences, complete with the written-consent exceptions, in the lines immediately following."),
  "79e8d95a1974": truncOk("module-10", "trec-rules/535.191.txt",
    "the source continues 'for violations of the following sections of the Act and Rules: §1101.552; …'. The carrying sentence supplies that referent itself — it says § 535.191 places '22 TAC §535.157' in this band — and 22 TAC § 535.157 is in fact listed in § 535.191's $100-$1,500 band. Checked the band membership against the held rule."),
  c2e92ee879c2: truncOk("module-10", "trec-rules/535.191.txt",
    "the same lowest band, quoted in the unit that enumerates all three. The ten sections the module attributes to this band — § 1101.652(a)(3), (a)(8), (b)(23), (b)(29), (b)(33), (b)(34), 22 TAC §§ 535.21, 535.154, 535.155 and 535.157 — were each checked against § 535.191's own list and all ten are in it."),
  "9013096b854c": truncOk("module-10", "trec-rules/535.191.txt",
    "the middle band. The thirteen sections the module attributes to it — §§ 1101.652(a)(4)-(7), (b)(1), (b)(7)-(8), (b)(12), (b)(14), (b)(22), § 1101.654(a), 22 TAC §§ 531.18, 531.20, 535.2, 535.16 and 535.17 — were each checked against § 535.191's list and all are in it, as are the module's separate middle-band claims for § 531.20, § 1101.654(a) and §§ 1101.652(b)(30)-(31)."),
  "6e6aac3c64ab": truncOk("module-10", "trec-rules/535.191.txt",
    "the top band. The sections the module attributes to it — § 1101.651, § 1101.652(a)(2), (b)(2)-(6), (b)(9)-(11), (b)(13), (b)(15)-(21), (b)(24)-(27), (b)(32), 22 TAC § 535.141(g), §§ 535.145-535.148 and § 535.156 — were each checked against § 535.191's list and all are in it. Every band the module names in prose elsewhere was checked the same way."),
  "7ad7daf0a5c9": truncOk("module-10", "trec-rules/537.11.txt",
    "the source continues 'that contains: the name of the attorney or trade association who prepared the form…'. Those disclosure conditions are carried in the same sentence in the course's own voice — the module 10 reduction shortened that clause to 'subject to the disclosures the rule lists' and the sentence closes 'only through a Texas attorney and only with those disclosures on the form' — and module 12 sets out all five of them, two of them quoted. Reason re-checked against the reduced module 10 text; the finding is unchanged."),
  "8c119cde0bdc": truncOk("module-10", "statutes/OC.1101.htm",
    "the source continues 'in a contract, other than a contract to perform property management services'. The exception is carried in the carrying sentence — 'every agreement in which you agree to perform services requiring a license, other than a property management contract, must \"specify a definite termination date…\"'."),
  "2f19eac08408": truncOk("module-11", "statutes/BC.17.htm",
    "the matched run continues 'in the conduct of any trade or commerce are hereby declared unlawful', which is § 17.46(a)'s unlawfulness declaration. The carrying sentence is about § 17.46(b)'s list, where the same phrase appears as the defined term the list expands; the trade-or-commerce limit belongs to (a) and is not being stated here."),
  "58300e5d69dc": truncOk("module-11", "statutes/BC.17.htm",
    "the source continues 'on the falsity or deception or in detrimental ignorance of the unfairness'. The carrying sentence goes straight on to quote § 17.45(13)'s inference clause and to say 'That final clause is the whole point of the definition; drop it and you have taught yourself the opposite of Texas law', so the definition is delivered complete."),
});

export const BY_COURSE = Object.freeze({
  "tx-principles-real-estate-ii-30-v1": PRINCIPLES_II,
  "tx-law-of-agency-30-v1": LAW_OF_AGENCY,
});

/* ── retirement: what happens to a disposition whose quotation is gone ───────────────────────────
   A DELETED RECORD LEAVES NO TRACE THAT A REVIEW HAPPENED. When a reduction pass rewrites or
   removes the prose that carried a quotation, the disposition that explained it stops matching
   anything and `reconcile` reports it as orphaned. The tempting fix is to delete the line. That is
   the wrong fix: the file would then be indistinguishable from one in which the review was never
   done, and a quotation quietly restored later would come back with no record that it had once been
   read against its source. A retired disposition is therefore MOVED here, not deleted, and it must
   say which of a fixed set of things happened to it and, where there is one, name its successor id.

   RETIREMENT IS NOT A DISPOSITION. Nothing here excuses a quotation. Every record below describes a
   quotation that the audit no longer reports at all; the moment one is reported again, `reconcile`
   raises it as `resurfaced` and it must be reviewed afresh rather than covered by its old finding. */

/** The only retirement reasons that exist. Anything else fails at load. */
export const RETIREMENTS = Object.freeze({
  /* The prose that carried the quotation was cut. Nothing in the course quotes those words now. */
  QUOTATION_REMOVED: "the quotation went with the prose that carried it; nothing quotes those words any more",
  /* The words themselves changed. The new wording is a different quotation and needs its own review
     under its own id, which the record names. */
  QUOTATION_REWRITTEN: "the quotation's wording changed; the successor id carries the fresh review",
  /* The quoted words are the same; the string that hashes to the id is not — a comma moved inside
     the closing mark, a list item became a sentence. Same quotation, new key. */
  REKEYED: "the quoted words are unchanged; the id moved because the string did",
  /* The finding is gone rather than the quotation. Most often a reduction moved the citation the
     passage names closer to the quotation, so it now resolves in the cited section and the audit
     stops reporting it. */
  FINDING_RESOLVED: "the quotation stands and now resolves in the section its citation names; there is no finding left to disposition",
  /* The quotation stands, verbatim and correctly attributed, but the audit no longer produces a row
     for it — its paragraph lost the citation that put it in scope, or the extractor's quote pairing
     changed around it. Recorded rather than dropped, because nothing about the quotation changed. */
  NO_LONGER_AUDITED: "the quotation stands unchanged; the audit no longer produces a row for it",
});

const retired = (retirement, module, disposition, reason, successor = null) =>
  Object.freeze({ retirement, module, disposition, reason, successor });

/**
 * Texas Law of Agency — dispositions retired on 2026-08-30, after the reduction passes that took the
 * course from 1,657 required minutes to 1,530.8. Twenty-eight of the 148 reviewed dispositions
 * stopped matching any quotation. Each was traced through `git log`/`git show` to the pass that
 * changed it and classified below: 18 removed with their prose, 2 re-keyed, 5 whose finding the
 * reduction itself resolved, 3 still in the course but no longer audited. None was deleted.
 *
 * Two further orphans are absent from this list because they were not retired: 4f8b60c2917d and
 * e98d8ba4d8ed were orphaned by reduction edits that had truncated a quotation away from a material
 * qualifier, and the curriculum was corrected instead, which restored both quotations and both ids.
 */
const LAW_OF_AGENCY_RETIRED = Object.freeze({
  /* ── removed with the prose that carried them ─────────────────────────────────────────────── */
  d59d00ea621b: retired("QUOTATION_REMOVED", "module-02", "ATTRIBUTED_AT_PARAGRAPH_SCOPE",
    "The module 02 reduction (49bec67) removed the whole open-house walk-through of TREC's 2026 article. Module 05 teaches the same passage and quotes the same article; the sentences either side of these words carry their own live dispositions there at 7c0be2326ac6, e1654b2acbf4 and 0218aa687233. Nothing in module 02 quotes these words now."),
  "6bd18f300d68": retired("QUOTATION_REMOVED", "module-02", "ATTRIBUTED_AT_PARAGRAPH_SCOPE",
    "Removed by the same edit (49bec67). The same sentence of TREC's article is quoted in module 05 and dispositioned there at 7c0be2326ac6."),
  "0fdee43f0b64": retired("QUOTATION_REMOVED", "module-02", "ATTRIBUTED_AT_PARAGRAPH_SCOPE",
    "Removed by the same edit (49bec67). The same sentence of TREC's article is quoted in module 05 and dispositioned there at e1654b2acbf4."),
  d8e7b908ad2b: retired("QUOTATION_REMOVED", "module-02", "ATTRIBUTED_AT_PARAGRAPH_SCOPE",
    "Removed by the same edit (49bec67). The same sentence of TREC's article is quoted in module 05 and dispositioned there at 0218aa687233."),
  fe3d4e255729: retired("QUOTATION_REMOVED", "module-02", "VERIFIED_IN_CITED_SECTION",
    "The § 1101.563(b) trigger clause went with its carrying sentence in the module 02 reduction (49bec67). The identical truncation finding on the same clause survives in module 05, where it is dispositioned at 0d67f15f6355, so the reviewed conclusion that closing at the trigger loses nothing is still recorded where the quotation still is."),
  f2206b068b58: retired("QUOTATION_REMOVED", "module-03", "INVENTED_DIALOGUE",
    "The three model attribution phrases ('the seller states', 'per the appraisal district', 'according to the 2023 inspection report') were cut from module 03 at b81b38a. No model attribution phrase is quoted in the module now."),
  f52a5d786bc6: retired("QUOTATION_REMOVED", "module-03", "INVENTED_DIALOGUE",
    "The model answer 'that is not information I inquire about or disclose.' was cut when the § 531.19 stacking paragraph was compressed in the module 03 reduction (79807ff). The rule it illustrated is still taught in the same paragraph; the invented script is gone."),
  "0e5ccb1b456a": retired("QUOTATION_REMOVED", "module-03", "VERIFIED_IN_CITED_SECTION",
    "The Property Code § 5.011(e) deadline quotation went with the executory-contract paragraph at b81b38a. Module 03 no longer cites § 5.011 at all, so the finding that the matcher had placed the words in § 5.012(d) rather than § 5.011(e) has nothing left to attach to."),
  d4e51e96c027: retired("QUOTATION_REMOVED", "module-04", "INVENTED_DIALOGUE",
    "The Sunday-afternoon open-house applied exercise was removed from module 04 in the final reduction (49bec67), taking the visitor's question with it."),
  "34c6a932d426": retired("QUOTATION_REMOVED", "module-04", "INVENTED_DIALOGUE",
    "The cooperating license holder's email in the same removed exercise (49bec67)."),
  "58f164482612": retired("QUOTATION_REMOVED", "module-08", "INVENTED_DIALOGUE",
    "The hypothetical answer about where an IABS delivery email lives was cut from module 08 at b81b38a, along with the § 535.2 record-category paragraph it illustrated. Module 08 still teaches the retention duty; it no longer stages the answer as speech."),
  "5bb5457ebc8d": retired("QUOTATION_REMOVED", "module-09", "INVENTED_DIALOGUE",
    "The specimen written scope of authorised activities was cut from module 09 in the reduction pass that also touched module 03 (79807ff). The point it made — that a scope the broker does not enforce protects nobody — survives in the course's own voice in the § 535.2(a) walk-through."),
  "6440c6e4d6ab": retired("QUOTATION_REMOVED", "module-09", "ATTRIBUTED_AT_PARAGRAPH_SCOPE",
    "At b81b38a the inline quotation of § 535.3's second consenting-broker clause was replaced by the course's own sentence, 'The receiving sentence contemplates two possible consenting brokers, because the rule anticipates that you may change brokers between earning and being paid.' The rule's two sentences are still block-quoted whole immediately above, so the words are taught; they are simply no longer quoted a second time inline."),
  "132aa53f313a": retired("QUOTATION_REMOVED", "module-09", "VERIFIED_IN_CITED_SECTION",
    "Labor Code § 21.002's broad-coverage direction was cut from module 09 at b81b38a. The reviewed conclusion — that the continuation 'under Subchapters B and C' locates the rule rather than narrowing it — described a quotation the module no longer makes."),
  "339c39a67994": retired("QUOTATION_REMOVED", "module-09", "VERIFIED_IN_CITED_SECTION",
    "The § 1101.355(b) designated-broker quotation was cut at b81b38a. Module 09 still states the designated-broker requirement in the course's own words."),
  f5919cb5bc07: retired("QUOTATION_REMOVED", "module-09", "VERIFIED_IN_CITED_SECTION",
    "The quotation of 22 TAC § 535.148's title went with module 09's compression of the undisclosed-compensation unit (b766347), which now points to module 05 where the rule is taught in full. The title is no longer quoted here."),
  "516d318bd69d": retired("QUOTATION_REMOVED", "module-10", "ATTRIBUTED_AT_PARAGRAPH_SCOPE",
    "At b81b38a the quoted elements of a 'lottery' were replaced by the course's summary 'it defines the elements of a lottery'. The quotation no longer exists. Noted for the content record rather than for this file: the elements themselves are now stated nowhere in the course, though § 535.149 is held and the sentence still promises that the rule defines them."),
  "044bb4589eeb": retired("QUOTATION_REMOVED", "module-11", "VERIFIED_IN_CITED_SECTION",
    "The § 17.49(b) federal-authorisation exemption, and the sentence narrowing it that the disposition recorded as carried, were both removed from module 11 at b81b38a. Module 11 no longer mentions the FTC exemption, so neither the quotation nor the truncation finding exists."),

  /* ── re-keyed: same words, new id ─────────────────────────────────────────────────────────── */
  "0c51fb61a703": retired("REKEYED", "module-09", "ATTRIBUTED_AT_PARAGRAPH_SCOPE",
    "§ 535.2(h)'s eighth record category. The reduction rewrapped the eight-category list so the final item now closes the sentence, which moved the full stop inside the quotation marks: 'sponsorship agreements between the broker and sponsored sales agents.' The words are unchanged and verbatim against 535.2.txt. The successor id is not itself audited — the reduction also left that paragraph with no citation inside the audit's window — so it is recorded here as the key the quotation would carry.",
    "8b1b72a33215"),
  "35e6ed9801ae": retired("REKEYED", "module-10", "ATTRIBUTED_AT_PARAGRAPH_SCOPE",
    "§ 535.149's gift sentence. At b81b38a the three quoted limbs of the rule became one sentence, which turned the semicolon after 'of this title' into a comma inside the closing mark. Same words, new id; the successor carries the current review.",
    "4dc50c768f7c"),

  /* ── the reduction resolved the finding itself ────────────────────────────────────────────── */
  c3d3b05ecc5c: retired("FINDING_RESOLVED", "module-02", "ATTRIBUTED_AT_PARAGRAPH_SCOPE",
    "Unchanged and still verbatim in 531.20.txt. The module 02 reduction shortened the § 531.20 walk-through so that the paragraph's own opening citation — 'The rule: 22 TAC § 531.20.' — now falls inside the quotation's window, and the audit resolves it as a plain MECHANICAL_PASS in the cited section. The paragraph-scope finding this record explained no longer arises."),
  "8dff58833704": retired("FINDING_RESOLVED", "module-02", "ATTRIBUTED_AT_PARAGRAPH_SCOPE",
    "The longer of § 531.20's two homepage-link labels, in the same paragraph and resolved by the same edit. Verified as MECHANICAL_PASS against 531.20.txt."),
  "63eace1dab73": retired("FINDING_RESOLVED", "module-09", "ATTRIBUTED_AT_PARAGRAPH_SCOPE",
    "§ 535.2(i)(8), still quoted with its bracketed lower-case initial ('[r]ecords are properly maintained'). The reduction brought the following paragraph's 'Section 535.2(i)' citation within the window, and the quotation now resolves as MECHANICAL_PASS in 535.2.txt."),
  "12a5fc8b8d59": retired("FINDING_RESOLVED", "module-09", "ATTRIBUTED_AT_PARAGRAPH_SCOPE",
    "§ 535.2(i)(1)'s geographic-competence tail, resolved by the same edit and now a MECHANICAL_PASS in 535.2.txt."),
  b3ed78fa412e: retired("FINDING_RESOLVED", "module-12", "ATTRIBUTED_AT_PARAGRAPH_SCOPE",
    "§ 535.2(h)(3), quoted in module 12's records habit. The module 12 reduction rewrote the paragraph above it — it now reads 'requires the broker to keep eight categories of records', not 'to maintain' — and left the § 535.2 citation inside the window, so the quotation resolves in the cited section. Both the wording the old reason quoted and the finding it explained are gone; the quotation is unchanged."),

  /* ── still in the course, no longer audited ───────────────────────────────────────────────── */
  "2c97ec37c1e1": retired("NO_LONGER_AUDITED", "module-03", "INVENTED_DIALOGUE",
    "Georgia's line at the listing appointment is still in the applied exercise 'The roof in Lubbock', word for word. The module 03 reduction took the citations out of the paragraphs around it, so the quotation now sits outside the audit's citation window and no row is produced for it. It is still invented dialogue and would be dispositioned the same way if it were reported again."),
  "76818056dc45": retired("NO_LONGER_AUDITED", "module-09", "ATTRIBUTED_AT_PARAGRAPH_SCOPE",
    "§ 535.2(h)(3) as it appears in the eight-category list, unchanged and verbatim against 535.2.txt. The reduction left that list in a paragraph with no citation inside the audit's window, so the audit no longer checks any of the eight. All eight were re-read against 535.2.txt lines 10-17 during this pass and every one is verbatim. The second occurrence of these words, four lines below, is audited and dispositioned at 325b9d322735."),
  "6c776af5df91": retired("NO_LONGER_AUDITED", "module-11", "ATTRIBUTED_AT_PARAGRAPH_SCOPE",
    "§ 17.46(b)(24)'s inducement clause, still quoted verbatim in module 11 and still correct. The reduction shortened the quotation before it to 'known at the time of the transaction,' — 37 characters, under the extractor's 40-character floor — so the quote-pairing regex now pairs that quotation's closing mark with this one's opening mark, rejects the connective prose between them, and consumes the opening mark. Nothing about the quotation changed; the extractor stopped producing a row. Re-verified against BC.17.htm this pass, and the same clause is quoted twice more in module 11 where it does resolve (f5c3e6eaf47a, e20f9c52c778)."),
});

export const RETIRED_BY_COURSE = Object.freeze({
  "tx-law-of-agency-30-v1": LAW_OF_AGENCY_RETIRED,
});

/**
 * Reconcile a course's unmatched quotations against the recorded dispositions.
 * @param {string} courseId
 * @param {Array<{id: string, module: string, quote: string}>} unmatched  audit.quoteFailures
 */
export function reconcile(courseId, unmatched) {
  const recorded = BY_COURSE[courseId] || {};
  const retiredRecords = RETIRED_BY_COURSE[courseId] || {};
  const undispositioned = unmatched.filter((q) => !recorded[q.id]);
  const defects = unmatched.filter((q) => recorded[q.id]?.disposition === SOURCING_DEFECT);
  const orphaned = Object.keys(recorded).filter((id) => !unmatched.some((q) => q.id === id));
  const byDisposition = {};
  for (const q of unmatched) {
    const d = recorded[q.id]?.disposition ?? "UNDISPOSITIONED";
    byDisposition[d] = (byDisposition[d] || 0) + 1;
  }
  /* A retired disposition asserts that the audit no longer reports its quotation. If one is
     reported again — prose restored, a citation moved back into range — the retirement is a
     statement that has become false, and the quotation needs reviewing under the current text
     rather than being covered by a finding made about an older version of the module. */
  const resurfaced = Object.keys(retiredRecords).filter((id) => unmatched.some((q) => q.id === id));
  return Object.freeze({
    courseId,
    unmatched: unmatched.length,
    undispositioned,
    defects,
    /* A disposition whose quotation no longer exists. Not a failure — a quotation may have been
       rewritten or removed — but it must not sit unnoticed, because a stale disposition is how an
       exemption outlives the thing it explained. Retiring it into RETIRED_BY_COURSE, with the
       reason it no longer applies, is how one leaves this list without being deleted. */
    orphaned,
    retired: Object.keys(retiredRecords).length,
    resurfaced,
    byDisposition,
    clean: undispositioned.length === 0 && defects.length === 0 && resurfaced.length === 0,
  });
}

/* ── load-time invariants ───────────────────────────────────────────────────────────────────── */
for (const [courseId, records] of Object.entries(BY_COURSE)) {
  for (const [id, r] of Object.entries(records)) {
    if (!DISPOSITIONS[r.disposition]) {
      throw new Error(`quotation-dispositions: ${courseId}/${id} uses unknown disposition ${r.disposition}`);
    }
    if (!r.reason || r.reason.length < 40) {
      throw new Error(`quotation-dispositions: ${courseId}/${id} has no substantive reason recorded`);
    }
    if (!/^[0-9a-f]{12}$/.test(id)) {
      throw new Error(`quotation-dispositions: ${courseId}/${id} is not a 12-hex audit id`);
    }
  }
}

/* The retired records carry the same invariants, plus the ones that make a retirement a record
   rather than a disposal: it keeps the disposition it is retiring, it cannot also be live, and the
   two retirement reasons that exist because a quotation moved to a new key must name that key. */
for (const [courseId, records] of Object.entries(RETIRED_BY_COURSE)) {
  const live = BY_COURSE[courseId] || {};
  for (const [id, r] of Object.entries(records)) {
    if (!/^[0-9a-f]{12}$/.test(id)) {
      throw new Error(`quotation-dispositions: retired ${courseId}/${id} is not a 12-hex audit id`);
    }
    if (!RETIREMENTS[r.retirement]) {
      throw new Error(`quotation-dispositions: retired ${courseId}/${id} uses unknown retirement ${r.retirement}`);
    }
    if (!DISPOSITIONS[r.disposition]) {
      throw new Error(`quotation-dispositions: retired ${courseId}/${id} retires unknown disposition ${r.disposition}`);
    }
    if (!r.reason || r.reason.length < 40) {
      throw new Error(`quotation-dispositions: retired ${courseId}/${id} has no substantive reason recorded`);
    }
    if (live[id]) {
      throw new Error(`quotation-dispositions: ${courseId}/${id} is both live and retired`);
    }
    const needsSuccessor = r.retirement === "REKEYED" || r.retirement === "QUOTATION_REWRITTEN";
    if (needsSuccessor && !r.successor) {
      throw new Error(`quotation-dispositions: retired ${courseId}/${id} is ${r.retirement} and must name its successor id`);
    }
    if (r.successor !== null) {
      if (!needsSuccessor) {
        throw new Error(`quotation-dispositions: retired ${courseId}/${id} names a successor but was retired as ${r.retirement}`);
      }
      if (!/^[0-9a-f]{12}$/.test(r.successor) || r.successor === id || records[r.successor]) {
        throw new Error(`quotation-dispositions: retired ${courseId}/${id} names an unusable successor ${r.successor}`);
      }
    }
  }
}

export default { DISPOSITIONS, RETIREMENTS, BY_COURSE, RETIRED_BY_COURSE, reconcile };
