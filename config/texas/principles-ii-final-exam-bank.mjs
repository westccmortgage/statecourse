/**
 * Texas Principles of Real Estate II — CONFIDENTIAL FINAL EXAMINATION BANK.
 *
 * ── CONFIDENTIALITY ─────────────────────────────────────────────────────────────────────────────
 * THIS FILE IS AN ANSWER KEY. It must never be importable from a student-facing surface. It lives in
 * config/, outside every served tree; nothing in public/ may import it, transitively or otherwise;
 * and no build may emit an artifact containing a prompt, a choice array, a correctChoice, a
 * rationale or a `teaches` anchor from this file. Answer keys and rationales never reach the
 * browser. The examination engine is expected to permute choices deterministically at serve time
 * (items are authored with the correct answer at index 0 purely for reviewability) and to strip the
 * key, the rationale, the crosswalk and the source from anything a student can see. 22 TAC
 * § 535.65(h)(2) — read below — requires final examination questions to be "kept confidential and be
 * significantly different from any quiz questions and exercises used in the course", and this file
 * is written to both halves of that sentence.
 *
 * ── REGULATORY BASIS, STATED FROM THE SOURCES THAT WERE READ ────────────────────────────────────
 * The numbers this bank is built to are those exported as ASSESSMENT_REQUIREMENTS by
 * config/texas/trec-rules-source-lock.mjs, which derives them from two rule sections held on disk
 * with recorded hashes: 22 TAC § 535.62 (texas/trec-sources/trec-rules/535.62.txt) and 22 TAC
 * § 535.65 (texas/trec-sources/trec-rules/535.65.txt). Both files were read for this build, and the
 * requirements below are quoted from them rather than recalled:
 *
 *   • § 535.62(b)(7) — a course must "include at least four versions of a final examination," and
 *     each version must cover "each topic required by the Act or Rules for the specific course,"
 *     must not "contain any true/false questions," must not "repeat more than one third of the
 *     questions from other versions of the final examination," and — for a qualifying course other
 *     than a real estate math course — must consist "of at least two questions per credit course
 *     hour" drawn "from a question bank consisting of at least four questions per credit course
 *     hour." For this 30-hour course that is FOUR versions of at least SIXTY questions each, drawn
 *     from a bank of at least ONE HUNDRED TWENTY.
 *   • § 535.62(b)(7)(A)–(C) — the same paragraph separately prescribes the FORMATIVE instruments
 *     (topic quizzes of at least three questions per topic, one scenario-based exercise per 10
 *     credit hours or less, distance-education progression gating, and a replacement question after
 *     an incorrect answer). Those live in config/texas/principles-ii-question-bank.mjs. This file is
 *     the summative instrument and is deliberately built apart from them.
 *   • § 535.65(h)(2) — "Final examination questions must be kept confidential and be significantly
 *     different from any quiz questions and exercises used in the course."
 *   • § 535.65(h)(4) — a provider "must rotate all versions of the examination required by
 *     § 535.62(b)(7) ... throughout the approval period for a course in a manner acceptable to the
 *     Commission and must require an unweighted passing score of 70%."
 *   • § 535.65(i)(2) — a subsequent final examination "must be a different version of the original
 *     final examination given to the student."
 *   • § 535.65(h)(6) and § 535.65(i)(4) — no credit after a second failure; the student must retake
 *     the course and the final course examination.
 *
 * The rotation rule, the second-attempt rule, the 70% unweighted passing score and the pairwise
 * overlap computation are recorded in config/texas/principles-ii-final-exam-forms.mjs.
 *
 * WHAT THE BASIS DOES NOT INCLUDE. The Secretary of State's codified 22 TAC text remains unread;
 * the two rule files above are TREC's own published reproduction, classified TIER 4 by
 * trec-rules-source-lock.mjs, and TX_PROVIDER_RULE_SOURCE_LOCK still FAILS. Building this bank is
 * not approval and is not submission readiness. Nothing here may be described as TREC-approved, and
 * no Texas qualifying credit may be offered for this course.
 *
 * ── WHAT EVERY ITEM IS TRACED TO ────────────────────────────────────────────────────────────────
 * `topic` and `unit` name the PRINS2-1 topic and unit the item examines, read from
 * config/texas/principles-ii-course-form.mjs. `teaches` is the exam-to-instruction crosswalk: the
 * anchor of the module unit in the frozen curriculum (texas/tx-principles-real-estate-ii-30-v1/
 * curriculum/) that teaches the tested proposition. `source` names the controlling authority where
 * the item tests law, and says so plainly where the item tests arithmetic or practice instead.
 *
 * ── SOURCE DISCIPLINE ───────────────────────────────────────────────────────────────────────────
 * No item asserts a legal proposition the frozen curriculum does not teach. Where the curriculum
 * deliberately states no number — FHA and VA program figures, PMI thresholds and premium rates,
 * appraiser qualifying-education and experience hour counts, the appraiser and licensing
 * examination passing scores, TREC fee amounts, and the maximum conventional first-mortgage loan
 * amount referenced by Finance Code § 343.201(1)(C) — no item supplies one either, and several
 * items test exactly that restraint. Every dollar figure in a fact pattern is labelled illustrative
 * and is invented to make arithmetic visible; every arithmetic result was computed and checked.
 *
 * ── SEPARATION FROM THE FORMATIVE INSTRUMENTS ───────────────────────────────────────────────────
 * config/texas/principles-ii-question-bank.mjs carries 44 topic-quiz items and 44 replacement
 * questions. Every one of those 88 prompts was read before this bank was authored, and this bank
 * was written to avoid them at three levels: no proposition is tested here with the fact pattern
 * the formative bank uses for it; where the same rule must appear in both (the rule set is finite),
 * the fact pattern, the party, the arithmetic and the distractor set are all different; and a large
 * majority of the items below test propositions the formative bank never reaches at all — six of
 * the 44 PRINS2-1 units are untouched by the formative bank entirely. There is no scenario file for
 * this course in config/texas/ as of this build; if one is added, it must be checked against this
 * bank before either ships.
 */

import { TOPICS, ALL_UNITS } from "./principles-ii-course-form.mjs";
import { ASSESSMENT_REQUIREMENTS } from "./trec-rules-source-lock.mjs";

/* The exam-to-instruction crosswalk, unit by unit. Each value is the GitHub-style anchor of the
   "## Unit: ..." heading in the named frozen curriculum module. Every item's `teaches` must equal
   the entry for its own unit; the invariants below refuse any other value. */
export const UNIT_ANCHORS = Object.freeze({
  T01U1: "module-01.md#unit-calculators",
  T01U2: "module-01.md#unit-fractions-and-percentages",
  T02U1: "module-02.md#unit-sources-of-real-estate-financing",
  T02U2: "module-02.md#unit-mortgage-market",
  T02U3: "module-02.md#unit-application-for-credit",
  T02U4: "module-02.md#unit-payment-plans",
  T02U5: "module-02.md#unit-conventional-fha--va-loans",
  T02U6: "module-02.md#unit-texas-loan-programs",
  T02U7: "module-02.md#unit-govt-influence-in-mortgage-lending",
  T02U8: "module-02.md#unit-other-financing-techniques",
  T02U9: "module-02.md#unit-financing-legislation",
  T03U1: "module-03.md#unit-requirements-to-become-an-appraiser",
  T03U2: "module-03.md#unit-key-appraisal-terms",
  T03U3: "module-03.md#unit-appraising--the-appraisal-process",
  T03U4: "module-03.md#unit-value",
  T03U5: "module-03.md#unit-three-approaches-to-value",
  T03U6: "module-03.md#unit-pricing-a-property",
  T04U1: "module-04.md#unit-leasehold-estates",
  T04U2: "module-04.md#unit-leasing-real-estate",
  T04U3: "module-04.md#unit-common-lease-provisions",
  T04U4: "module-04.md#unit-texas-landlord--tenant-statutes",
  T04U5: "module-04.md#unit-types-of-leases",
  T05U1: "module-05.md#unit-land-use-controls",
  T05U2: "module-05.md#unit-public-ownership",
  T05U3: "module-05.md#unit-environmental-protection-legislation",
  T06U1: "module-06.md#unit-basic-provisions-of-the-texas-real-estate-license-act",
  T06U2: "module-06.md#unit-subchapter-a---general-provisions",
  T06U3: "module-06.md#unit-professional-organizations",
  T06U4: "module-06.md#unit-real-estate---the-business-of-value",
  T06U5: "module-06.md#unit-the-purpose-of-licensing-laws---what-a-license-holder-can-and-cannot-do",
  T06U6: "module-06.md#unit-the-texas-real-estate-commission--licensing-requirements",
  T07U1: "module-07.md#unit-the-law-of-agency",
  T07U2: "module-07.md#unit-agency-positions-and-disclosure",
  T07U3: "module-07.md#unit-brokerage--nature-of-the-brokerage-business",
  T07U4: "module-07.md#unit-fiduciary-duties",
  T07U5: "module-07.md#unit-texas-deceptive-trade-practices---consumer-protection-act",
  T08U1: "module-08.md#unit-equal-opportunity-in-housing",
  T08U2: "module-08.md#unit-texas-fair-housing-laws",
  T08U3: "module-08.md#unit-housing-discrimination",
  T08U4: "module-08.md#unit-housing-credit-discrimination",
  T08U5: "module-08.md#unit-community-reinvestment",
  T09U1: "module-09.md#unit-property-management",
  T09U2: "module-09.md#unit-management-considerations",
  T09U3: "module-09.md#unit-the-management-profession",
});

/* Minimum items per PRINS2-1 topic. Six is the floor the build works to so that every topic can be
   sampled in every one of the four versions with room to spare; the actual blueprint is
   proportional to the form's prescribed minutes and is asserted against it below. */
export const MIN_ITEMS_PER_TOPIC = 6;

const item = (id, spec) =>
  Object.freeze({
    id,
    topic: spec.topic,
    unit: spec.unit,
    prompt: spec.prompt,
    choices: Object.freeze(spec.choices),
    correctChoice: spec.correctChoice ?? 0,
    rationale: spec.rationale,
    teaches: spec.teaches,
    source: spec.source,
  });

export const FINAL_EXAM_BANK = Object.freeze([

  /* ══ T01 Real Estate Math — 30 prescribed minutes ══════════════════════════════════════════ */

  item("PRINS2-F001", {
    topic: "T01", unit: "T01U1",
    prompt: "A license holder is carrying a long unrounded intermediate figure from one step of a proration into the next. What is the working value of a calculator's M+, M-, MR and MC keys in that situation, and what habit does the course attach to them?",
    choices: [
      "Their value is precision rather than storage: they carry a full unrounded intermediate result into the next step instead of forcing the user to write down a rounded one and key it back in — and memory must be cleared before every new problem, because a stale value in memory is a silent error that nothing on the display announces.",
      "Their value is that a figure held in memory is protected from the machine's internal rounding, so an answer recalled from memory is always accurate to more decimal places than the same answer left on the display.",
      "Their value is that recalling a stored figure forces the machine to honour the order of operations on the keystrokes that follow, which a four-function machine otherwise ignores.",
      "Their value is auditability: the memory register keeps a running log of the figures entered, which can be recalled in sequence to reconstruct how an answer was reached.",
    ],
    rationale: "M+ adds the display to memory, M- subtracts from it, MR recalls it and MC clears it, and the course's point is that their real service is carrying an unrounded intermediate forward — the same discipline as rounding once at the end. Clearing memory before each new problem is part of the rule, because the display gives no warning that a leftover value is still sitting there. The near-miss about protection from internal rounding is wrong: memory stores whatever value was sent to it, at whatever precision the calculation produced, and holding a figure in memory does not add accuracy that the calculation did not have.",
    teaches: "module-01.md#unit-calculators",
    source: "No legal source — module-01 teaches arithmetic as arithmetic and states no Texas statute, TREC rule or federal law for the order of operations, rounding conventions or calculator practice.",
  }),

  item("PRINS2-F002", {
    topic: "T01", unit: "T01U1",
    prompt: "Asked why a working license holder should write the equation down before touching the keypad, which explanation matches the reason the course gives?",
    choices: [
      "Because a calculator will faithfully compute the wrong thing: writing down what is being solved for, what is known, and how they connect is what catches a wrongly framed problem while it is still cheap to catch.",
      "Because a written equation is required documentation for any figure that reaches a settlement statement, and an unwritten calculation cannot be relied on by the closer.",
      "Because writing the equation converts the problem into a form a four-function calculator can evaluate correctly, which it otherwise cannot.",
      "Because the equation must be written before the arithmetic in order to establish the order of operations, which is otherwise indeterminate.",
    ],
    rationale: "The course's whole point about calculators is that what makes real estate math go wrong is almost never the mathematics — it is reaching for the machine before the problem has been stated, and the machine will compute a wrong formulation perfectly. The near-miss about the order of operations inverts the lesson: precedence is fixed by arithmetic itself (parentheses, exponents, multiplication and division left to right, then addition and subtraction), and writing the equation down does not establish it — it exposes whether the machine you are holding will honour it.",
    teaches: "module-01.md#unit-calculators",
    source: "No legal source — module-01 makes no legal statement and cites none for calculator or rounding practice.",
  }),

  item("PRINS2-F003", {
    topic: "T01", unit: "T01U1",
    prompt: "Applying the course's rounding rule, to what precision should each of these be rounded, and at what point in the work?",
    choices: [
      "Money to the cent, square footage to the whole foot, and a rate to the hundredth of a percent — each rounded once, at the end, because rounding an intermediate result and then multiplying magnifies the error by the multiplier.",
      "Every figure to two decimal places as soon as it is produced, so that each step of the work is internally consistent and can be re-checked line by line.",
      "Money to the cent and every other quantity to the nearest whole number, rounded at each step, because carrying decimals through a chain of steps compounds the machine's own rounding error.",
      "Money to the dollar, square footage to the nearest ten feet, and a rate to the whole percent, rounded at the end, because greater precision implies an accuracy the underlying data does not support.",
    ],
    rationale: "The rule is to round once, at the end, to the precision the answer actually requires, and the course states those three precisions by name. The tax-proration illustration shows why: rounding a daily figure a half-cent too early moved a single closing line item by $0.97, because the discarded fraction was multiplied 214 times. The near-miss that rounds at every step to two places is the exact error the illustration is built to expose — the internal consistency it buys is consistency in being wrong.",
    teaches: "module-01.md#unit-calculators",
    source: "No legal source — module-01 states that no Texas statute, TREC rule or federal law prescribes a rounding convention.",
  }),

  item("PRINS2-F004", {
    topic: "T01", unit: "T01U2",
    prompt: "An illustrative brokerage fee of $17,325 was earned at an agreed rate of 4.5 percent of the sale price. What was the sale price, and which arrangement of the percentage relationship produces it? (Figures are illustrative only; no rate here is standard, customary or required.)",
    choices: [
      "$385,000 — whole = part divided by rate: 17,325 divided by 0.045.",
      "$346,500 — whole = part multiplied by the complement of the rate: 17,325 multiplied by 0.955, then scaled.",
      "$779.63 — rate = part divided by whole, applied to the fee itself: 17,325 multiplied by 0.045.",
      "$392,325 — whole = part plus the rate applied to the part: 17,325 plus 4.5 percent of 17,325, then scaled to the price.",
    ],
    rationale: "Every percentage problem contains a part, a whole and a rate and supplies two of the three; here the part ($17,325) and the rate (0.045) are given, so whole = part divided by rate = 17,325 divided by 0.045 = $385,000, which checks back as 385,000 multiplied by 0.045 = 17,325. The near-miss at $779.63 is the arithmetic for finding the part, not the whole: multiplying the fee by the rate answers a question nobody asked, and it is the classic failure to name the whole before starting.",
    teaches: "module-01.md#unit-fractions-and-percentages",
    source: "No legal source — module-01 states that every dollar figure and percentage in it is an illustration and none is a required, customary or standard figure.",
  }),

  item("PRINS2-F005", {
    topic: "T01", unit: "T01U2",
    prompt: "An illustrative marketing allowance is set at 0.75 percent of an illustrative $412,000 list price. Converting the percentage to a decimal by hand rather than using the percent key, what is the allowance?",
    choices: [
      "$3,090 — 0.75 percent is 0.0075, and 412,000 multiplied by 0.0075 is 3,090.",
      "$30,900 — 0.75 percent is 0.075, and 412,000 multiplied by 0.075 is 30,900.",
      "$309 — 0.75 percent is 0.00075, and 412,000 multiplied by 0.00075 is 309.",
      "$5,493.33 — 412,000 divided by 0.75, then adjusted by moving the decimal two places.",
    ],
    rationale: "Converting a percent to a decimal means moving the decimal point two places left, so 0.75% becomes 0.0075 and 412,000 multiplied by 0.0075 = $3,090; the 1% check confirms it, since one percent of $412,000 is $4,120 and three-quarters of that is about $3,090. The near-miss at $30,900 moves the decimal only one place — treating 0.75% as 0.075, which is 7.5% — and is precisely the slip the course warns about with sub-one-percent rates.",
    teaches: "module-01.md#unit-fractions-and-percentages",
    source: "No legal source — module-01 teaches notation conversion as arithmetic and cites nothing for it.",
  }),

  item("PRINS2-F006", {
    topic: "T01", unit: "T01U2",
    prompt: "On an illustrative transaction the total commission is $19,800, of which the listing brokerage retains $10,800, and the listing sales agent's share of that $10,800 is $7,560. Expressed as rates, what share did the agent receive, and of what? (Illustrative figures only.)",
    choices: [
      "Seventy percent of the listing brokerage's share (7,560 divided by 10,800) and about 38.18 percent of the total commission (7,560 divided by 19,800) — two different rates because the two computations name two different wholes.",
      "Seventy percent of the total commission, since the agent's split percentage is applied to the commission the transaction generated.",
      "About 38.18 percent of the listing brokerage's share, since the agent's rate is measured against the money the brokerage kept.",
      "Fifty percent of the total commission and seventy percent of the brokerage's share, because the listing side of a co-brokered transaction is by definition half the total.",
    ],
    rationale: "Rate = part divided by whole, and the whole is whatever figure the percentage is being taken of: against the listing brokerage's $10,800 the agent's $7,560 is 0.70, and against the $19,800 total it is 0.381818, or about 38.18 percent. The near-miss that calls it seventy percent of the total commission is the error the course flags directly — the agent did not receive seventy percent of anything the seller paid, only seventy percent of one brokerage's share. The fourth choice also imports an assumption the facts do not support: $10,800 is not half of $19,800.",
    teaches: "module-01.md#unit-fractions-and-percentages",
    source: "No legal source — module-01 states the split structures described in it are business practice and every figure is an illustration.",
  }),

  /* ══ T02 Real Estate Financing Principles — 275 prescribed minutes ═════════════════════════ */

  item("PRINS2-F007", {
    topic: "T02", unit: "T02U1",
    prompt: "An Amarillo applicant assembles her file through a mortgage broker, who places the loan with a lender that funds it. The broker gives her the written list of homeownership counseling organizations. Under 12 C.F.R. § 1024.20(a)(3), what is the lender's position?",
    choices: [
      "The lender is not required to provide an additional list, but the lender remains responsible for ensuring that the list is provided to the applicant in accordance with the section.",
      "The lender must provide its own list regardless, because the regulation places the counseling-list duty on the lender alone and a broker's delivery does not discharge it.",
      "The lender has no duty of any kind once a mortgage broker is in the transaction, because the regulation transfers both the delivery duty and the responsibility for it to whichever party is standing in front of the applicant.",
      "The lender's duty is suspended only if the broker delivers the list within three business days of the lender's own receipt of the application, rather than within three business days of the broker's.",
    ],
    rationale: "Regulation X allows either the broker or the dealer to deliver the counseling list, provides that the lender need not provide an additional list if the broker has done so, and then places ultimate responsibility on the lender for ensuring the list is provided. The near-miss that removes the lender's duty entirely reads only the first half of the paragraph; the architecture of the section is that the broker is the applicant's point of contact and may discharge the disclosure duty, while the lender remains the party accountable for it.",
    teaches: "module-02.md#unit-sources-of-real-estate-financing",
    source: "12 C.F.R. § 1024.20(a)(3) (Regulation X)",
  }),

  item("PRINS2-F008", {
    topic: "T02", unit: "T02U1",
    prompt: "A self-employed borrower with volatile receipts is buying a rural tract with a manufactured home on it. Three national originators decline; a local commercial bank writes the loan and keeps it. What structural feature of that bank explains the different answer?",
    choices: [
      "It is a depository holding the loan in portfolio: because it funds from its own deposits and keeps the risk, it can write the loan to whatever terms it is willing to live with rather than to a rulebook a buyer of the loan publishes.",
      "It is a depository, so federal law permits it to underwrite outside the standards a non-depository originator must apply to the same borrower.",
      "It is a depository, so its loans are exempt from the disclosure and consumer-protection regimes that make an unusual file expensive for other originators to document.",
      "It is a depository, so it can sell the loan more readily than a mortgage banker can, and that resale certainty is what lets it accept an unusual borrower profile.",
    ],
    rationale: "A depository takes deposits and can fund a loan with money already inside the institution, hold it in portfolio, and collect the payments itself — which is exactly the freedom the standardized market does not have, because a loan written for sale has to fit the purchaser's published eligibility standards. The fourth choice inverts the mechanism: it is the decision NOT to sell that creates the flexibility here, not greater ease of sale. The second and third choices invent legal consequences the sources read for this course do not state.",
    teaches: "module-02.md#unit-sources-of-real-estate-financing",
    source: "Finance Code § 343.105(a) (naming lenders, mortgage bankers and licensed mortgage brokers as separate categories); the portfolio-lending description is market practice, which module-02 states without citation.",
  }),

  item("PRINS2-F009", {
    topic: "T02", unit: "T02U1",
    prompt: "The surviving spouse of a Texas mortgagor is not on the note and cannot get the servicer to speak to her about the home loan. Finance Code § 343.103 gives her a route. What does it require of her, and of the servicer?",
    choices: [
      "She must make a request accompanied by the proof the section lists and carrying the statutory notice in bold-faced, capital or underlined letters; the servicer must then provide the information a monthly statement would contain within thirty days after receiving the request.",
      "She must obtain letters testamentary or an order of heirship first; on presenting either, the servicer must provide the loan information within thirty days.",
      "She must record an affidavit of heirship in the county real property records; the servicer must then add her to the note and provide monthly statements going forward.",
      "She need only ask in writing; the servicer must provide the information within sixty days, and the Gramm-Leach-Bliley Act otherwise bars disclosure to a non-obligor.",
    ],
    rationale: "Section 343.103 gives the surviving spouse a statutory route that turns on proof rather than probate: a death certificate, an affidavit of disinterested witnesses in the form referenced in Estates Code § 203.002 including language that she was married to the mortgagor at the time of death, and her own affidavit that she currently resides in the mortgaged property as her primary residence — plus the prescribed notice reciting that the request is made under § 343.103 and that the disclosure is not in conflict with the Gramm-Leach-Bliley Act. The servicer then has thirty days. The near-miss requiring letters testamentary imports a probate step the section does not; the whole point of the provision is that a spouse who cannot produce one still has a route.",
    teaches: "module-02.md#unit-sources-of-real-estate-financing",
    source: "Texas Finance Code § 343.103",
  }),

  item("PRINS2-F010", {
    topic: "T02", unit: "T02U1",
    prompt: "A Texas home loan is paid off in full. Eight days later the former mortgagor delivers a written request that the release of lien be filed. Under Finance Code § 343.108, by when must the release be delivered to the mortgagor or filed with the county clerk?",
    choices: [
      "Not later than the 30th day after the servicer or mortgagee receives the written request, because the request was delivered on or before the 20th day after payoff and so shortens the ordinary deadline.",
      "Not later than the 60th day after receipt of the correct payoff amount, because a mortgagor's request cannot shorten a statutory period.",
      "Not later than the 20th day after payoff, because the request itself fixes the deadline at the date it was delivered.",
      "Not later than the 30th day after payoff, because a written request converts the payoff date into the start of a thirty-day period.",
    ],
    rationale: "The ordinary rule is sixty days after receipt of the correct payoff amount; a written request for delivery or filing made on or before the twentieth day after payoff shortens the deadline to thirty days after the servicer or mortgagee receives that request. The near-miss holding to sixty days ignores the acceleration the statute expressly provides; the fourth choice runs the thirty days from the wrong event, and the difference matters because the clock starts on receipt of the request, not on payoff.",
    teaches: "module-02.md#unit-sources-of-real-estate-financing",
    source: "Texas Finance Code § 343.108(b), (c)",
  }),

  item("PRINS2-F011", {
    topic: "T02", unit: "T02U2",
    prompt: "A Texas mortgage banker funds thirty-year notes off a revolving warehouse line and sells them within a few weeks. Which statement best describes what the secondary market does for that business and, through it, for the next Texas buyer?",
    choices: [
      "It supplies liquidity: selling the closed notes returns the same capital to the line so it can be lent again many times a year, which is why long-term mortgage paper is available at all to an ordinary buyer.",
      "It supplies the interest rate: the secondary market sets the rate the originator must quote, which is why originators in different parts of Texas quote the same rate on the same day.",
      "It supplies the underwriting decision: the purchaser of the loan makes the credit decision, and the originator's approval is provisional until the purchaser accepts the file.",
      "It supplies loan servicing: the secondary market exists so that the originator does not have to collect payments, and it has no effect on the amount of capital available to lend.",
    ],
    rationale: "Liquidity is the first reason the course gives — a lender that lends ten million into thirty-year notes and holds them is finished for thirty years, while a lender that sells them lends the same ten million again and again, so the same capital supports many times as much lending. The fourth choice is the near-miss because servicing transfer is a real and visible consequence of a sale, but it is a consequence, not the purpose, and it does not explain why long-term paper is available at all. Rate transmission is a separate, third reason and it is not a rate-setting power.",
    teaches: "module-02.md#unit-mortgage-market",
    source: "No statutory source — module-02 presents liquidity, risk transfer and rate transmission as market description; Finance Code § 343.201(1)(C) is cited there only for the Legislature's own reference to a secondary-market loan limit.",
  }),

  item("PRINS2-F012", {
    topic: "T02", unit: "T02U2",
    prompt: "A Texas loan officer tells a borrower privately that he would happily make the loan but 'the guidelines don't allow that.' What is he actually describing, and what does Finance Code § 343.201(1)(C) show about how far that idea reaches into Texas law?",
    choices: [
      "He is describing standardization — the terms on which someone else will buy the loan — and § 343.201(1)(C) shows the Legislature writing a Texas consumer-protection threshold by reference to the maximum conventional first-mortgage loan amount established and adjusted by the Federal National Mortgage Association, whose dollar figure no source held for this course states.",
      "He is describing standardization, and § 343.201(1)(C) shows the Legislature adopting a fixed Texas dollar ceiling for high-cost home loans that a license holder should learn and quote.",
      "He is describing his own institution's risk appetite, and § 343.201(1)(C) shows that Texas defers to each lender's published guidelines in defining a high-cost home loan.",
      "He is describing federal underwriting regulations, and § 343.201(1)(C) shows that Texas incorporates those regulations directly as the state's own underwriting standard.",
    ],
    rationale: "Standardization is the requirement that loans be underwritten, documented and delivered to uniform standards so they can be pooled and traded, which is why an originator describes a rulebook that is not its own; and § 343.201(1)(C) is a Texas statute writing a threshold by reference to a limit a secondary-market institution establishes and adjusts. The near-miss is the second choice: the provision is a reference, not a figure, the amount changes over time, and module-02 states expressly that no source held for this course gives it — a license holder who needs the number must look it up.",
    teaches: "module-02.md#unit-mortgage-market",
    source: "Texas Finance Code § 343.201(1)(C); 15 U.S.C. § 1691(e)(6) (defining valuation to include values developed pursuant to the policy of a government sponsored enterprise)",
  }),

  item("PRINS2-F013", {
    topic: "T02", unit: "T02U3",
    prompt: "A Texas applicant withdraws her application two weeks after the appraisal on the house is completed. The loan would have been secured by a first lien on the dwelling. Under 15 U.S.C. § 1691(e), what is she entitled to?",
    choices: [
      "A copy of the written appraisal and of any other valuation developed in connection with her application, at no additional cost for the copy, because the right applies whether the creditor grants or denies credit or the application is incomplete or withdrawn.",
      "Nothing, because the right to a copy attaches only where the creditor takes adverse action on a completed application.",
      "A copy only if she pays the creditor a reasonable fee to reimburse the cost of producing the copy, since the appraisal was ordered for the creditor's benefit.",
      "A copy only if she requests one within thirty days of withdrawing, because the three-day pre-closing delivery rule no longer has a closing to run against.",
    ],
    rationale: "Section 1691(e)(1) entitles the applicant to a copy of any and all written appraisals and valuations developed in connection with the application promptly upon completion, and in no case later than three days before closing, 'whether the creditor grants or denies the applicant's request for credit or the application is incomplete or withdrawn' — the words that decide this fact pattern. The third choice is the near-miss because the statute does permit a reasonable fee to reimburse the cost of the appraisal itself; what § 1691(e)(4) forbids is a charge for the copy, which must be provided at no additional cost.",
    teaches: "module-02.md#unit-application-for-credit",
    source: "15 U.S.C. § 1691(e)(1)-(5)",
  }),

  item("PRINS2-F014", {
    topic: "T02", unit: "T02U3",
    prompt: "Finance Code § 343.105 requires a written notice to each applicant for a Texas home loan. Which statement about that notice is accurate?",
    choices: [
      "It is given at closing, on a separate document, in at least 14-point type, and warns that intentionally or knowingly making a materially false or misleading written statement to obtain property or credit violates Penal Code § 32.32 — and a lender's failure to give a complying notice does not affect the validity or enforceability of the home loan by any holder.",
      "It is given at closing, on a separate document, in at least 14-point type, and a lender's failure to give a complying notice renders the home loan voidable at the borrower's election.",
      "It is given not later than the third business day after the application is received, in at least 12-point type, and the applicant is not required to execute it.",
      "It is given at closing and states that every materially false statement on a home loan application is punishable by imprisonment for a term of 2 to 99 years, which is the grading the Penal Code assigns to the offense.",
    ],
    rationale: "Section 343.105(a)-(d) requires the notice at closing, on a separate document, in at least 14-point type, requires the applicant to verify the information and execute it, and provides in subsection (d) that a failure to give a complying notice does not affect the validity or enforceability of the loan by any holder. The fourth choice is the near-miss and the one a license holder is most likely to repeat: '2 years to 99 years' is the Finance Code's prescribed NOTICE language describing the top of the ladder, while Penal Code § 32.32(c) grades the offense by the value of the property or amount of credit, from a Class C misdemeanor upward.",
    teaches: "module-02.md#unit-application-for-credit",
    source: "Texas Finance Code § 343.105(a)-(d); Texas Penal Code § 32.32(b), (c)",
  }),

  item("PRINS2-F015", {
    topic: "T02", unit: "T02U3",
    prompt: "A Texas lender wants to offer prepaid single-premium credit life insurance with a home loan. Finance Code § 343.104 permits that only on a condition. What is it?",
    choices: [
      "The statutory notice must be hand delivered or mailed to the applicant not later than the third business day after the date the application is received, telling the applicant that the coverage is not required as a condition of closing, that a single premium will be financed at the loan's interest rate, and that cancellation within thirty days of the date of the loan produces a full refund or credit.",
      "The premium must be disclosed on a separate document in at least 14-point type at closing, and the applicant must execute it.",
      "The applicant must sign a written waiver acknowledging that the coverage is optional, delivered at closing along with the other loan documents.",
      "The coverage must be offered on the same terms to every applicant for the same product, and the premium may not be financed.",
    ],
    rationale: "Section 343.104 conditions the offer on delivery of a prescribed notice by hand or mail not later than the third business day after the application is received, and the notice's own content is the point: the coverage is optional, a single premium will be financed at the loan's interest rate, and the statutory text states in capitals that the applicant must cancel within thirty days of the date of the loan to receive a full refund or credit. The second choice is the near-miss because it describes the separate-document, 14-point, at-closing notice — but that is § 343.105, the false-statement notice, which is a different requirement with a different trigger.",
    teaches: "module-02.md#unit-application-for-credit",
    source: "Texas Finance Code § 343.104",
  }),

  item("PRINS2-F016", {
    topic: "T02", unit: "T02U4",
    prompt: "An adjustable-rate loan carries a margin of 2.25 percentage points and a periodic cap limiting any single adjustment to 2 percentage points. The loan's current rate is 4.00 percent, and at the adjustment date the index stands at 4.25 percent. What is the new rate? (Illustrative figures chosen to show the mechanism.)",
    choices: [
      "6.00 percent — the fully indexed rate is 4.25 plus 2.25, or 6.50 percent, but the periodic cap holds this adjustment to 4.00 plus 2.00, so the cap binds and the borrower carries a rate below the formula's output until a later adjustment.",
      "6.50 percent — the fully indexed rate is the index plus the margin, and a periodic cap limits only how far the index itself may move.",
      "4.25 percent — the rate resets to the index, and the margin is added only at the final adjustment before maturity.",
      "6.25 percent — the cap is applied to the margin, so the margin is reduced from 2.25 to 2.00 points and added to the index.",
    ],
    rationale: "Index plus margin gives the fully indexed rate of 6.50 percent; the periodic cap limits the movement at this adjustment to 2 percentage points from the current 4.00 percent, so the new rate is 6.00 percent and the cap binds. The second choice is the near-miss: it computes the fully indexed rate correctly and then misdescribes what the cap constrains — the cap limits how far the loan's own rate may move at one adjustment and over the life of the loan, not how far the published index may move.",
    teaches: "module-02.md#unit-payment-plans",
    source: "No statutory source for ARM components — module-02 states that index, margin, fully indexed rate, adjustment period and caps are matters of loan-document drafting and market practice, not of any statute held for this course; Finance Code § 343.101(a) is cited there only for the fully-indexed-rate substitution in the low-rate refinancing test.",
  }),

  item("PRINS2-F017", {
    topic: "T02", unit: "T02U4",
    prompt: "A Texas high-cost home loan is written with 54 level monthly payments followed by a final payment three times the average of the earlier scheduled monthly payments, due in month 55. It is not a bridge loan and the schedule is not adjusted to seasonal or irregular income. Does it comply with Finance Code § 343.202?",
    choices: [
      "No — the final payment is more than twice the average of the earlier scheduled monthly payments and becomes due less than 60 months after the date of the loan, and neither stated exception applies.",
      "Yes — § 343.202 permits a balloon on a high-cost home loan of any size so long as the loan has run at least 48 months.",
      "No — § 343.202 forbids any balloon payment on a high-cost home loan without exception, so the timing is irrelevant.",
      "Yes — § 343.202 measures the final payment against the first scheduled payment rather than the average of the earlier ones, and three times the first payment is within the statutory allowance.",
    ],
    rationale: "Section 343.202 bars a scheduled payment more than twice as large as the average of earlier scheduled monthly payments unless the balloon becomes due not less than 60 months after the date of the loan, subject to a seasonal-or-irregular-income exception and a bridge-loan exception; a payment at three times the average due in month 55 fails both halves of the test. The third choice is the near-miss and states the rule too strongly: the section does not forbid balloons on high-cost home loans, it forbids early ones, and the line is drawn at sixty months.",
    teaches: "module-02.md#unit-payment-plans",
    source: "Texas Finance Code § 343.202",
  }),

  item("PRINS2-F018", {
    topic: "T02", unit: "T02U5",
    prompt: "A buyer making a small down payment on a conventional loan is told she will pay for private mortgage insurance. She asks whether it will make her mortgage payments if she loses her job. What is the accurate answer?",
    choices: [
      "No — private mortgage insurance is a private insurance product, paid for by the borrower, that indemnifies the lender against a portion of its loss on default; it does not protect the borrower and does not pay the borrower's mortgage.",
      "Yes, in part — private mortgage insurance covers a stated number of the borrower's monthly payments during a documented involuntary unemployment, which is why the borrower pays for it.",
      "No — but it does protect the borrower's equity, because the insurer pays down the loan balance by the insured percentage on default.",
      "Yes — it is the borrower's insurance because the borrower pays the premium, and the lender is merely named as loss payee.",
    ],
    rationale: "PMI is credit enhancement for the lender: the lender bears the loss if a borrower defaults and the property sells for less than the debt, so on a low-down-payment conventional loan the lender requires insurance against part of that loss, and the borrower pays for it. The fourth choice is the near-miss because it starts from a true fact — the borrower pays the premium — and draws the wrong conclusion; who pays does not determine who is indemnified. Note also that the LTV threshold at which PMI is required, its premium rates and its termination rules are not stated in any source held for this course.",
    teaches: "module-02.md#unit-conventional-fha--va-loans",
    source: "No statutory source — module-02 states expressly that the LTV threshold, premium rates and termination rules for private mortgage insurance are not stated in any source held for this course and states none of them.",
  }),

  item("PRINS2-F019", {
    topic: "T02", unit: "T02U5",
    prompt: "A buyer with a substantial down payment is purchasing a property whose price puts the loan above the maximum conventional first-mortgage loan amount referenced in Finance Code § 343.201(1)(C). Which description of her likely financing is accurate?",
    choices: [
      "A non-conforming conventional loan — conventional because no government agency insures or guarantees it, non-conforming because it does not meet the secondary market's eligibility standards, so its terms are set by the individual holder rather than by a standardized rulebook.",
      "A conforming conventional loan carrying a size premium, since the applicable limit sets pricing rather than eligibility.",
      "A government-backed loan, because financing above the conventional limit is available only through a federal insurance or guaranty program.",
      "A non-conforming loan, which is unavailable in Texas because there is no standardized purchaser for it.",
    ],
    rationale: "A conventional loan is one not insured or guaranteed by a government agency; it is conforming when it satisfies the applicable secondary-market eligibility standards including the loan-amount limit, and non-conforming when it does not — commonly called a jumbo loan, which is a market term rather than a statutory one. The fourth choice is the near-miss: non-conforming loans are made, particularly by depositories in portfolio; what is absent is a standardized buyer, which is why the terms are priced and underwritten by the holder. The dollar amount of the limit is not stated in any source held for this course.",
    teaches: "module-02.md#unit-conventional-fha--va-loans",
    source: "Texas Finance Code § 343.201(1)(C) (referencing, without stating, the maximum conventional loan amount for first mortgages established and adjusted by the Federal National Mortgage Association)",
  }),

  item("PRINS2-F020", {
    topic: "T02", unit: "T02U6",
    prompt: "A Texas family wants a lien on the homestead to secure work on the house. In one case the work is a new detached garage; in the other it is the repair and renovation of the existing kitchen. Under Texas Constitution article XVI, § 50(a)(5), what does the Constitution require in each case?",
    choices: [
      "For NEW improvements the Constitution requires only that the work and material be contracted for in writing. For repair or renovation of EXISTING improvements four conditions attach: a writing with the consent of both spouses given in the same manner required for a sale and conveyance of the homestead; the contract not executed before the fifth day after the owner makes written application for the extension of credit; an express three-day right to rescind without penalty or charge; and execution by the owner and the owner's spouse only at the office of a third-party lender making the extension of credit, an attorney at law, or a title company.",
      "Both cases require the same four conditions, because § 50(a)(5) draws no distinction between new construction and repair.",
      "For new improvements the four conditions attach, and for repair or renovation only a signed writing is required, because the Constitution guards most closely against liens for work that does not yet exist.",
      "Neither case requires more than a signed written contract; the five-day, three-day and place-of-execution conditions belong to § 50(a)(6) home equity credit and have no application to a mechanic's lien.",
    ],
    rationale: "Section 50(a)(5) is asymmetric on its face: work and material used in constructing NEW improvements need only be 'contracted for in writing,' while work and material used to repair or renovate EXISTING improvements carry four conditions, which is why a Texas home-improvement lien on an existing house is a formal transaction rather than a handshake. Conditions (B) and (C) — the five-day wait and the three-day rescission — both yield where the work is necessary to complete immediate repairs to conditions materially affecting the health or safety of the owner or a person residing in the homestead and the owner acknowledges that in writing. The third choice is the near-miss and reverses the asymmetry exactly.",
    teaches: "module-02.md#unit-texas-loan-programs",
    source: "Texas Constitution art. XVI, § 50(a)(5)(A)-(D)",
  }),

  item("PRINS2-F021", {
    topic: "T02", unit: "T02U6",
    prompt: "A Texas owner whose homestead carries a section 50(a)(6) home equity loan is offered a refinance into an ordinary non-home-equity loan. What does article XVI, § 50(f) require, and what is the owner giving up?",
    choices: [
      "Unless the refinance is itself an (a)(6) or (a)(7) extension of credit, all four conditions must be met: it may not close before the first anniversary of the date the home equity credit was closed; it may advance no additional funds other than funds to refinance debt described by subsections (a)(1) through (a)(7) and actual costs and reserves the lender requires; the refinanced principal plus all other recorded encumbrances may not exceed 80 percent of fair market value on the date of the refinance; and the lender must give a prescribed written notice on a separate document not later than the third business day after the application and at least 12 days before closing — a notice that warns in capitals that the new loan will permit foreclosure without a court order and will be with recourse for personal liability.",
      "The refinance may close at any time once the owner requests it, because a home equity loan loses its (a)(6) character on repayment of the original advance; no notice is required.",
      "The refinance is prohibited outright, because § 50(a)(6)(K) permits only one home-equity-related debt on a homestead at any time and a refinance would create a second.",
      "The four conditions apply, but the owner gives up nothing of substance, because judicial foreclosure and non-recourse follow the homestead rather than the particular loan.",
    ],
    rationale: "Subsection (f) supplies the four conditions and subsection (f-1) completes the mechanism by deeming the resulting lien one described by (a)(4) and letting an owner's affidavit conclusively establish compliance. The fourth choice is the near-miss because it gets the conditions right and the consequence wrong: the § 50(f)(2)(D) notice exists precisely because the owner is trading away two real protections — a lien foreclosable only by court order and credit without recourse for personal liability — and the Constitution requires the lender to say so in capital letters twelve days ahead of time.",
    teaches: "module-02.md#unit-texas-loan-programs",
    source: "Texas Constitution art. XVI, § 50(f), (f-1); § 50(a)(6)(C), (D)",
  }),

  item("PRINS2-F022", {
    topic: "T02", unit: "T02U6",
    prompt: "Texas Constitution article XVI, § 50 makes a lender or holder forfeit all principal and interest on a home equity loan for a failure to comply that is not corrected within the statutory cure period, and separately identifies defects that cannot be cured at all. Which two are the non-curable ones?",
    choices: [
      "An extension of credit made by a person other than one of the categories of authorized lender described in paragraph (P), and a lien not created under a written agreement with the consent of each owner and each owner's spouse — the second subject only to a non-consenting spouse subsequently consenting.",
      "A fee overcharge above the two percent cap, and a lien exceeding the eighty percent limit — because neither can be unwound once the loan has funded.",
      "A closing conducted somewhere other than the office of the lender, an attorney at law or a title company, and a closing held before the twelfth day after the § 50(g) notice.",
      "A prepayment penalty and a provision making the credit recourse against the owner, because both change the fundamental character of the loan.",
    ],
    rationale: "Paragraph (Q)(x) supplies a menu of cures, including refunding an overcharge, written acknowledgments limiting the lien to the eighty percent ceiling or disclaiming additional collateral, and a catch-all refund or credit of $1,000 with an offer to refinance at no cost; paragraph (Q)(xi) then identifies the two failures the Constitution treats as fatal — an unauthorized lender under paragraph (P), and a lien not created with the consent of each owner and each owner's spouse, unless a spouse who did not initially consent subsequently consents. The second choice names precisely the two defects the Constitution DOES make curable, which is why it is the near-miss.",
    teaches: "module-02.md#unit-texas-loan-programs",
    source: "Texas Constitution art. XVI, § 50(a)(6)(P), (Q)(x), (Q)(xi)",
  }),

  item("PRINS2-F023", {
    topic: "T02", unit: "T02U7",
    prompt: "Mortgage rates in Texas have risen by roughly a percentage point since spring, and a Georgetown seller's showings have slowed. Which explanation of the mechanism is accurate on the account module-02 gives?",
    choices: [
      "Buyers can pay less rather than wanting the house less: a higher rate raises the monthly payment on any given loan amount, which reduces the loan a fixed monthly budget will carry, which reduces what that buyer can offer — so the pricing question is about purchasing power, not desire.",
      "Buyers want the house less: higher rates signal a weakening economy, and the resulting loss of confidence is what removes demand at any price.",
      "The central bank has set mortgage rates higher, and originators are required to quote the rate it sets until it is changed.",
      "Lenders have tightened eligibility standards in response to the rate move, so the same buyers no longer qualify for any loan amount.",
    ],
    rationale: "The transmission runs through payments: higher rates raise the payment on a given loan amount, which shrinks the loan a fixed budget supports, which lowers what the buyer can pay — and module-02's illustration shows a single percentage point moving one borrower's purchasing power by roughly $29,000 without changing the borrower's income by a dollar. The third choice is the near-miss and overstates the mechanism: mortgage rates are long-term rates the central bank does not set directly; they respond to policy through expectations and the general level of interest rates. Module-02 also states that no source held for this course sets out the structure, powers or operations of the Federal Reserve System.",
    teaches: "module-02.md#unit-govt-influence-in-mortgage-lending",
    source: "No statutory source for monetary transmission — module-02 presents it as economic description and cites nothing for it; 15 U.S.C. § 1601(a) is cited there for Congress's framing of credit disclosure as an instrument of economic stabilization.",
  }),

  item("PRINS2-F024", {
    topic: "T02", unit: "T02U7",
    prompt: "A buyer of new construction in a growing Texas suburb closes with a low escrow estimate, and a year later — after the improved home is assessed for the first time — the escrow analysis produces a shortage and the payment jumps. What happened, and under which rule?",
    choices: [
      "Nothing improper: 12 C.F.R. § 1024.17(c)(7) permits a servicer, in the case of unassessed new construction, to estimate from the assessment of comparable residential property in the market area, and the first assessment of the improved home then resets the estimate.",
      "The servicer violated 12 C.F.R. § 1024.17 by estimating below the known charge, and the shortage must be absorbed by the servicer rather than the borrower.",
      "The lender under-disclosed at application, and Regulation X requires the payment to be held at the disclosed level for the first escrow account computation year.",
      "The servicer imposed a cushion greater than the one-sixth Regulation X allows, and the correction of that cushion is what produced the payment increase.",
    ],
    rationale: "Regulation X tells a servicer how to estimate: it must use the charge for the next computation year if known; if not, it may use the preceding year's charge, or that charge modified by not more than the most recent annual change in the national Consumer Price Index for all urban consumers; and for unassessed new construction it may estimate from the assessment of comparable residential property in the market area. The second choice is the near-miss because it correctly identifies that the estimate was low, but the low estimate is exactly what the rule permits when there is nothing yet to assess — the fault, if any, is in nobody warning the buyer.",
    teaches: "module-02.md#unit-govt-influence-in-mortgage-lending",
    source: "12 C.F.R. § 1024.17(c)(7) (Regulation X); see also § 1024.17(c)(1)(i)-(ii) (the one-sixth cushion and the one-twelfth monthly sum)",
  }),

  item("PRINS2-F025", {
    topic: "T02", unit: "T02U8",
    prompt: "A Texas owner proposes to convey a house that will still be encumbered by a recorded lien at the time of the conveyance. Property Code § 5.016 imposes a duty. Which statement about it is accurate?",
    choices: [
      "A separate written disclosure in at least 12-point type must be given to the purchaser and to each lienholder on or before the seventh day before the earlier of the conveyance's effective date or the execution of a binding contract; a violation does not invalidate the conveyance, but where the notice was not given the purchaser may terminate the contract for any reason on or before the seventh day after receiving it.",
      "A separate written disclosure in at least 14-point type must be given at closing, and a violation renders the conveyance void as against the lienholder.",
      "The lienholder's written consent must be obtained before the conveyance, and a conveyance without it is voidable at the lienholder's election.",
      "The disclosure must be given seven days before closing, and a violation entitles the purchaser to rescind at any time within two years and recover all payments made.",
    ],
    rationale: "Section 5.016(a) requires the separate written disclosure in at least 12-point type on or before the seventh day before the earlier of the effective date of the conveyance or the execution of a binding contract, identifying the property and each lienholder and the debt terms and stating whether the lienholder has consented; § 5.016(b) provides that a violation does not invalidate a conveyance and gives the purchaser a seven-day termination right running from receipt of the late notice. The third choice is the near-miss: the statute requires the disclosure to state whether the lienholder has consented, which is not the same as requiring consent.",
    teaches: "module-02.md#unit-other-financing-techniques",
    source: "Texas Property Code § 5.016(a)-(d)",
  }),

  item("PRINS2-F026", {
    topic: "T02", unit: "T02U8",
    prompt: "A Texas seller drafting an executory contract for the conveyance of a house the purchaser will live in proposes a late fee equal to 10 percent of the monthly payment and a $750 charge if the purchaser pays the balance off ahead of schedule. Apply Property Code § 5.073(a).",
    choices: [
      "Both provisions are barred: the section forbids a late fee exceeding the lesser of eight percent of the monthly payment or the actual administrative cost of processing the late payment, and forbids a provision imposing a prepayment penalty or any similar fee.",
      "The late fee is permitted because it is under the twelve percent Texas allows on a residential dwelling in a structure of not more than four units; the prepayment charge is barred.",
      "Both provisions are permitted if the purchaser initials them separately, because § 5.073(b) allows a knowing and voluntary waiver of the subchapter's protections.",
      "The late fee is barred, but the prepayment charge is permitted so long as it is disclosed in the § 5.071 financing statement.",
    ],
    rationale: "Section 5.073(a) bars a late fee exceeding the lesser of eight percent of the monthly payment or the actual administrative cost of processing the late payment, and separately bars a prepayment penalty or similar fee — and § 5.071 independently requires the seller's written financing statement to state the fact that no prepayment penalty may be charged. The second choice is the near-miss because it borrows the twelve percent safe harbour from Property Code § 92.019(a-1), which governs late fees in a residential LEASE, not the executory-contract subchapter. Section 5.073(b) also voids any provision purporting to waive a right or exempt a party from a duty under the subchapter.",
    teaches: "module-02.md#unit-other-financing-techniques",
    source: "Texas Property Code § 5.073(a), (b); § 5.071",
  }),

  item("PRINS2-F027", {
    topic: "T02", unit: "T02U8",
    prompt: "A Texas seller owns a home worth $300,000 subject to an existing first lien of $150,000 at 4 percent. A buyer pays $30,000 down and signs a wraparound note to the seller for $270,000 at 7 percent, and the seller continues to pay the underlying note. Using simple annual interest, what is the seller's annual interest spread and the effective annual return on the seller's own capital in the deal? (Illustrative figures only.)",
    choices: [
      "A spread of $12,900 on capital of $120,000, or about 10.75 percent — wrap interest of $18,900 less underlying interest of $6,000, against a wrap balance of $270,000 less the underlying balance of $150,000.",
      "A spread of $18,900 on capital of $270,000, or 7 percent — the wrap note's own interest measured against its own balance.",
      "A spread of $12,900 on capital of $300,000, or 4.3 percent — the interest differential measured against the property's value.",
      "A spread of $6,000 on capital of $150,000, or 4 percent — the difference between the two rates applied to the underlying balance.",
    ],
    rationale: "Wrap interest is 270,000 multiplied by 0.07 = $18,900; underlying interest is 150,000 multiplied by 0.04 = $6,000; the spread is $12,900. The seller's actual capital in the deal is the wrap balance less the underlying balance, 270,000 minus 150,000 = $120,000, so the effective return is 12,900 divided by 120,000 = 0.1075. The second choice is the near-miss: it measures a real number ($18,900 of interest collected) against the wrong base, ignoring that $150,000 of the wrap balance is someone else's money the seller is still paying for. A wraparound also leaves the buyer exposed if the seller stops paying the underlying lender.",
    teaches: "module-02.md#unit-other-financing-techniques",
    source: "No statutory source for the arithmetic — module-02 labels the wraparound figures illustrative; Property Code § 5.016 supplies the encumbered-conveyance warning that a wraparound sits inside, and § 5.085 restricts an executory-contract seller's ability to contract while encumbered.",
  }),

  item("PRINS2-F028", {
    topic: "T02", unit: "T02U9",
    prompt: "A client asks what the Truth in Lending Act actually does about the cost of credit. Reading 15 U.S.C. § 1601(a), which answer is accurate?",
    choices: [
      "It requires meaningful disclosure of credit terms so the consumer can compare more readily among available terms; Congress did not cap what credit may cost, and framed informed use of credit as strengthening competition and enhancing economic stabilization.",
      "It caps the annual percentage rate a creditor may charge on consumer credit secured by a dwelling, and requires disclosure of the capped rate.",
      "It prohibits unfair credit terms outright, and the disclosure requirements exist to help regulators identify creditors who use them.",
      "It requires disclosure of credit terms so that the consumer may rescind any consumer credit transaction within three business days of consummation.",
    ],
    rationale: "Section 1601(a) states the mechanism and the end together: assure a meaningful disclosure of credit terms so the consumer can compare more readily the various credit terms available and avoid the uninformed use of credit, on the finding that informed use of credit strengthens competition and enhances economic stabilization. TILA's mechanism is disclosure, not price control. The fourth choice is the near-miss because a right of rescission does exist in the wider Regulation Z scheme — but § 1026.23 was not held for this course, module-02 states nothing about it, and it is not what § 1601(a) says.",
    teaches: "module-02.md#unit-financing-legislation",
    source: "15 U.S.C. § 1601(a)",
  }),

  item("PRINS2-F029", {
    topic: "T02", unit: "T02U9",
    prompt: "A Texas investor lends his own money on dwellings occasionally and assumes that occasional lending is unregulated lending. Under 12 C.F.R. § 1026.2(a)(17)(v), when does a person regularly extend consumer credit?",
    choices: [
      "For credit other than credit subject to § 1026.32, more than 25 times in the preceding calendar year, or more than 5 times for transactions secured by a dwelling — but a person regularly extends consumer credit if in any 12-month period the person originates more than one credit extension subject to § 1026.32, or one or more such extensions through a mortgage broker.",
      "Only where the person extends credit more than 25 times in the preceding calendar year, without regard to whether the credit is secured by a dwelling.",
      "Only where lending is the person's principal business, measured by the share of the person's income derived from interest.",
      "More than 5 times in the preceding calendar year for any consumer credit, and more than 25 times for credit secured by a dwelling.",
    ],
    rationale: "Section 1026.2(a)(17)(v) sets a 25-times general threshold and a 5-times threshold for dwelling-secured transactions, and then collapses the threshold almost to zero for high-cost mortgages: more than one § 1026.32 extension in any 12-month period, or one or more such extensions made through a mortgage broker, makes the person a creditor with TILA's obligations. The fourth choice is the near-miss because it has the two numbers but transposes them — the lower threshold is the one that applies to dwelling-secured credit, which is the whole point of the rule.",
    teaches: "module-02.md#unit-financing-legislation",
    source: "12 C.F.R. § 1026.2(a)(17)(v) (Regulation Z)",
  }),

  /* ══ T03 Real Estate Appraisal — 220 prescribed minutes ═══════════════════════════════════ */

  item("PRINS2-F030", {
    topic: "T03", unit: "T03U1",
    prompt: "A Texas appraiser trainee performs an appraisal under the direction of a supervisory appraiser and co-signs the report. Under Occupations Code § 1103.354, who else must sign, and where does responsibility sit?",
    choices: [
      "The supervisory appraiser must sign each report prepared by the trainee and is responsible to the public and to the board for the trainee's reports and conduct.",
      "No one else need sign, because the trainee's own credential authorizes the work; the supervisory appraiser is responsible only for the trainee's training.",
      "The supervisory appraiser must sign only where the trainee's experience hours are being claimed toward a credential; otherwise the trainee signs alone.",
      "The board must countersign the report before it is delivered, which is how the trainee's work is verified for experience purposes.",
    ],
    rationale: "Section 1103.354 lets a trainee perform an appraisal under a supervisory appraiser's direction, requires the supervisory appraiser to sign each report the trainee prepares, and makes the supervisory appraiser responsible to the public and to the board for the trainee's reports and conduct — responsibility does not dilute as it travels down. The second choice is the near-miss: it correctly notes that the trainee may co-sign, but treats the credential as self-sufficient when § 1103.201(a) permits a trainee to appraise only under supervision.",
    teaches: "module-03.md#unit-requirements-to-become-an-appraiser",
    source: "Texas Occupations Code § 1103.354; see also § 1103.201(a), § 1103.351",
  }),

  item("PRINS2-F031", {
    topic: "T03", unit: "T03U1",
    prompt: "A Texas sales agent who completed qualifying real estate courses now pursues an appraiser credential and asks whether any of that coursework counts. What does Occupations Code § 1103.204 provide?",
    choices: [
      "The board shall give credit toward the chapter's education requirement for classroom hours taken in the course of becoming licensed as a real estate broker or sales agent, or for professional development or continuing education courses taken, provided those hours satisfy the requirements established by the guidelines recognized by the Appraiser Qualifications Board.",
      "No credit is available, because appraiser qualifying education and real estate qualifying education are separate schemes with no overlap.",
      "Credit is available only for hours taken within the two years preceding the application, because appraiser education expires on the second anniversary of completion.",
      "Credit is available at the board's discretion and is capped by statute at one-half of the applicant's total education requirement.",
    ],
    rationale: "Section 1103.204(c) directs the board to give credit for classroom hours taken in becoming a broker or sales agent, and for professional development or continuing education courses, so long as those hours satisfy the guidelines the Appraiser Qualifications Board recognizes — a sales agent does not start from zero. The third choice is the near-miss because it invents an expiry: § 1103.204(b) says the opposite, that the chapter does not limit the amount of time in which an applicant is required to satisfy the education requirements. Note also that Chapter 1103 states no hour counts at all; those live in board rule tracking AQB criteria, and no such rule was read for this course.",
    teaches: "module-03.md#unit-requirements-to-become-an-appraiser",
    source: "Texas Occupations Code § 1103.204(b), (c); § 1103.202(2)",
  }),

  item("PRINS2-F032", {
    topic: "T03", unit: "T03U1",
    prompt: "A Texas certified appraiser is asked to sign a report researched and written entirely by someone else, in exchange for a review fee. Under Occupations Code § 1103.402, what governs?",
    choices: [
      "A credentialed person may not sign or endorse an appraisal unless the appraisal is substantially produced by that person, meaning the person contributed in a material and verifiable manner to the research or analysis that results in the final opinion of value.",
      "Signing is permitted so long as the signer reads the report, agrees with its conclusion, and states in the report that the work was performed by another.",
      "Signing is permitted if the person who performed the work is an appraiser trainee, and prohibited only where that person holds no credential of any kind.",
      "Signing is permitted because the signature attests to compliance with the Uniform Standards of Professional Appraisal Practice rather than to authorship of the analysis.",
    ],
    rationale: "Section 1103.402(a) forbids signing or endorsing an appraisal not substantially produced by the signer, and subsection (b) defines substantial production as contributing in a material and verifiable manner to the research or analysis resulting in the final opinion of value; reading and agreeing is not contributing. The third choice is the near-miss because trainee work IS signed by a supervisory appraiser under § 1103.354 — but that provision works because the supervisor directs the work and takes public and board responsibility for it, which is not what a fee-for-signature arrangement describes.",
    teaches: "module-03.md#unit-requirements-to-become-an-appraiser",
    source: "Texas Occupations Code § 1103.402(a), (b); § 1103.354(b)",
  }),

  item("PRINS2-F033", {
    topic: "T03", unit: "T03U2",
    prompt: "A Texas listing advertises 2,410 square feet, a figure that includes an enclosed patio the seller finished but never conditioned or permitted. Applying the definition of gross living area, what is wrong and why?",
    choices: [
      "GLA is finished, above-grade, heated and cooled living space measured to the exterior walls, so an unconditioned enclosure is not GLA; an appraiser will not count it, the appraised value will not reflect it, and the license holder has published an inflated figure.",
      "Nothing is wrong so long as the space is finished and enclosed, because GLA is measured by enclosure rather than by conditioning.",
      "Nothing is wrong, because GLA is measured to the interior room dimensions and an enclosed patio adds interior area whether or not it is conditioned.",
      "The figure is wrong only because the space is unpermitted; a conditioned but unpermitted addition would still be counted in GLA.",
    ],
    rationale: "Each element of the definition excludes something: finished excludes an unfinished attic or bonus room, above-grade excludes a basement, heated and cooled excludes an unconditioned sunroom, screened porch or garage conversion, and measurement to the exterior walls makes GLA larger than the sum of interior room dimensions. The third choice is the near-miss because it gets the direction of measurement backwards — GLA is measured to the exterior walls, so the walls themselves are counted. Adding an unconditioned enclosure to advertised square footage is a common and expensive Texas listing error.",
    teaches: "module-03.md#unit-key-appraisal-terms",
    source: "No statutory source — module-03 teaches gross living area as appraisal vocabulary; the license holder's exposure for publishing an inflated figure runs through Occupations Code § 1101.652(b)(23) and the DTPA provisions taught in module-07.",
  }),

  item("PRINS2-F034", {
    topic: "T03", unit: "T03U2",
    prompt: "An appraiser is valuing a 1948 bungalow on a corner lot two blocks from a transit station in a corridor recently rezoned for mid-rise mixed use. Which statement about highest and best use is accurate?",
    choices: [
      "Highest and best use is the reasonably probable use that is legally permissible, physically possible, financially feasible and maximally productive, applied in that order, and it is analyzed twice — for the site as though vacant and for the property as improved — so the two answers can differ and a large divergence makes the improvement a candidate for demolition.",
      "Highest and best use is the most profitable use the site could support, and the legal and physical tests are applied afterward to confirm the conclusion.",
      "Highest and best use is determined once, for the property as improved, because an appraisal values what exists rather than what could exist.",
      "Highest and best use is the current use unless the owner has applied for a change, because an appraiser may not assume a use the owner has not pursued.",
    ],
    rationale: "The four tests are applied in order — a use that zoning forbids is not rescued by being profitable — and the analysis is performed both for the site as though vacant and for the property as improved, which is why the value of a property whose vacant-site highest and best use is a four-story building can be essentially land value less demolition cost. The second choice is the near-miss because it names the right four ideas and reverses their sequence, which is exactly the error the ordering rule exists to prevent.",
    teaches: "module-03.md#unit-key-appraisal-terms",
    source: "No statutory source — module-03 teaches highest and best use as appraisal analysis, not as a rule of Texas law.",
  }),

  item("PRINS2-F035", {
    topic: "T03", unit: "T03U3",
    prompt: "A Texas property has fire damage the owner intends to repair, and the client needs an opinion of value as if the repairs were complete. Separately, the appraiser must assume that a permitted-looking addition was in fact permitted. Which device is which?",
    choices: [
      "Valuing the house as if repaired is a hypothetical condition — something known to be contrary to fact but assumed for the assignment; assuming the addition was permitted is an extraordinary assumption — something assumed true that, if false, would change the opinion. Both must be disclosed, because both change what the number means.",
      "Both are extraordinary assumptions, because each involves accepting a fact the appraiser has not verified.",
      "Valuing the house as if repaired is an extraordinary assumption, and assuming the addition was permitted is a hypothetical condition.",
      "Both are hypothetical conditions, because each departs from the property's actual condition on the effective date.",
    ],
    rationale: "An extraordinary assumption is something assumed true that would change the opinion if it turned out false; a hypothetical condition is something known to be contrary to fact but assumed for the purpose of the assignment. Fire damage that exists on the effective date is known, so valuing the property as repaired is hypothetical; the permit status is unknown, so assuming it is extraordinary. The third choice is the near-miss and simply transposes them, which is the ordinary way this pair goes wrong.",
    teaches: "module-03.md#unit-appraising--the-appraisal-process",
    source: "No statutory source for the devices themselves — module-03 teaches them as scope-of-work concepts; Occupations Code § 1103.405(a) requires a Texas credentialed appraiser to comply with the current edition of USPAP or with board-rule standards at least as stringent.",
  }),

  item("PRINS2-F036", {
    topic: "T03", unit: "T03U3",
    prompt: "For a suburban Texas house an appraiser develops three indications: sales comparison $389,000, cost $383,400 and income $385,050. What does the reconciliation step require?",
    choices: [
      "Weighing the indications by the reliability of the underlying data, the amount of adjustment each required, and how well each approach matches the way buyers in that market actually behave — so the appraiser weights sales comparison heavily, treats the other two as support, and reports a rounded conclusion rather than an average.",
      "Averaging the three indications and reporting the result to the nearest dollar, because each approach is developed independently and none is entitled to more weight than another.",
      "Selecting the highest indication, because an opinion of market value is the most probable price a property should bring and a higher figure is more probable in a rising market.",
      "Selecting the middle indication, because reconciliation is a check against an outlier in either direction.",
    ],
    rationale: "Reconciliation is analysis, not arithmetic: the appraiser asks how reliable each indication's data was, how much adjustment it required, and how closely the approach models the behaviour of buyers in that market — and reconciliation also happens within an approach, where the adjusted sale prices of individual comparables are reconciled into one indication before any comparison across approaches. Averaging is the near-miss and is the single most common misdescription of the step; the course states flatly that the appraiser does not add three indications and divide by three.",
    teaches: "module-03.md#unit-appraising--the-appraisal-process",
    source: "No statutory source — module-03 teaches reconciliation as the analytical step of the appraisal process.",
  }),

  item("PRINS2-F037", {
    topic: "T03", unit: "T03U3",
    prompt: "A small Texas office building is leased for eight more years at rents well below current market. The client needs an opinion for a purchase decision. Why does identifying the property rights appraised belong to the first step of the process, and what turns on it?",
    choices: [
      "Because the fee simple estate and the leased fee estate are not the same thing: the building encumbered by below-market leases is worth less as a leased fee than the same building would be vacant and available, so an appraiser who values the fee simple when the client needs the leased fee has answered the wrong question.",
      "Because the property rights determine which approach to value may be developed, and only the income approach may be used where a leased fee is appraised.",
      "Because the property rights determine the effective date, since a leased fee must be valued as of the date the lease was signed.",
      "Because the property rights determine whether the appraiser needs a credential, since a leased fee interest may be appraised only by a certified general appraiser.",
    ],
    rationale: "Defining the problem means identifying the client and intended users, the intended use, the type of value, the effective date, the property, and the property rights appraised — and each is capable of changing the answer. Rights change it because a leased fee encumbered by below-market leases is a different quantity from the unencumbered fee simple. The second choice is the near-miss: the income approach does dominate where a property is bought for its income, but the choice of approaches belongs to the scope-of-work step and no rule confines a leased fee to one approach.",
    teaches: "module-03.md#unit-appraising--the-appraisal-process",
    source: "No statutory source — module-03 teaches the six steps of the appraisal process as professional method.",
  }),

  item("PRINS2-F038", {
    topic: "T03", unit: "T03U3",
    prompt: "An appraiser working the Permian Basin analyzes rig counts, regional employment and the local construction pipeline, and separately records each comparable's sale price, financing terms, concessions, days on market and whether the sale was arm's length. Which classification is correct?",
    choices: [
      "The first set is general data — forces outside the property that affect all properties in the market, including governmental influences such as zoning, tax rates and public services — and the second is specific data about the subject and the comparables; general data explains why the market is where it is.",
      "The first set is specific data because it is specific to the Permian Basin, and the second is general data because transaction facts are common to all sales.",
      "Both sets are specific data, because both are gathered for the particular assignment rather than published generally.",
      "The first set is general data and the second is verification, which is a separate step performed after the approaches to value are applied.",
    ],
    rationale: "General data is information about forces outside the property that affect all properties in the market — economic conditions, employment, population, interest rates, construction costs, supply, and governmental influences; specific data is information about the subject and the comparables, including the site, the improvements and each comparable's transaction facts. The fourth choice is the near-miss: verification is real, but it is part of data collection, not a step performed after the approaches — a sale is not usable until its essential facts have been confirmed with a party to it or an equally reliable source.",
    teaches: "module-03.md#unit-appraising--the-appraisal-process",
    source: "No statutory source — module-03 teaches the general/specific data division as appraisal method.",
  }),

  item("PRINS2-F039", {
    topic: "T03", unit: "T03U3",
    prompt: "Why does verification of comparable sales take more effort in Texas than in states where sale prices are recorded, and what does verification most often bring to light?",
    choices: [
      "Because a Texas deed does not ordinarily state what the buyer paid, so appraisers and license holders rely heavily on multiple listing service data and on sales confirmed directly with the parties — and verification is where seller-paid concessions, undisclosed personal property included in the price, and non-arm's-length relationships surface, each of which can move an adjusted sale price by five figures.",
      "Because Texas requires an appraiser to obtain the closing statement for every comparable, which is available only from a party to the transaction.",
      "Because Texas prohibits an appraiser from using multiple listing service data, so every comparable must be confirmed with a party.",
      "Because Texas deeds state the price but not the financing terms, so verification exists to establish whether the sale was financed conventionally.",
    ],
    rationale: "Module-03 records as a matter of practice, and not of any statute cited in this course, that a Texas deed does not ordinarily state what the buyer paid, which is why verification here leans on MLS data and on confirmation with the parties, and why concessions, included personal property and non-arm's-length relationships are the things verification catches. The second choice is the near-miss because it turns a practical reality into a legal requirement that no source read for this course imposes.",
    teaches: "module-03.md#unit-appraising--the-appraisal-process",
    source: "No statutory source — module-03 states this as practice, not as a statute cited in this course.",
  }),

  item("PRINS2-F040", {
    topic: "T03", unit: "T03U4",
    prompt: "Four adjoining quarter-acre lots on a Texas commercial corridor are each worth $85,000 individually. Assembled under one ownership the combined tract is worth $410,000, because only the assembled tract is deep enough for a building with the parking a national tenant requires. What is the plottage value, and what caution attaches to the concept? (Illustrative figures.)",
    choices: [
      "$70,000 — the $410,000 combined value less the $340,000 sum of the separate values — and plottage is not automatic: combining parcels that were already large enough for their highest and best use creates nothing.",
      "$410,000 — plottage is the value of the assembled tract, and assemblage is the term for the increment created.",
      "$340,000 — plottage is the aggregate value the separate parcels contribute to the assembled tract.",
      "$70,000 — and plottage arises automatically whenever adjoining parcels come under one ownership, because a larger parcel always carries a higher unit value.",
    ],
    rationale: "Plottage is the increment created when adjoining parcels are combined so that the combined parcel has a higher unit value than the parcels had separately, and assemblage is the act of combining: 410,000 minus (4 multiplied by 85,000) = 410,000 minus 340,000 = $70,000. The fourth choice is the near-miss because it computes the increment correctly and then states the concept too broadly — plottage is not automatic, and combining parcels already adequate for their highest and best use creates no increment at all.",
    teaches: "module-03.md#unit-value",
    source: "No statutory source — module-03 states that the economic principles of value are analytical vocabulary, that no Texas statute enacts them, and cites none.",
  }),

  item("PRINS2-F041", {
    topic: "T03", unit: "T03U4",
    prompt: "A seller asks whether to spend an illustrative $40,000 finishing out a bonus room before listing. Which principle governs the answer, and what does it turn on?",
    choices: [
      "Contribution — the value of any component equals what it adds to the value of the whole, not what it cost — and the answer turns on conformity data from that seller's own market, because the same improvement can contribute more, less or far less than its cost depending on what buyers at that price point expect.",
      "Substitution — the buyer will pay no more than the cost of an equally desirable substitute — so the improvement contributes its cost, because a buyer could pay that much to build it elsewhere.",
      "Anticipation — value reflects the expectation of future benefits — so the improvement contributes the rent or use the finished room will produce over the buyer's holding period.",
      "Progression — a lesser-valued property is worth more when surrounded by higher-valued ones — so the improvement contributes whatever the neighborhood's higher-valued houses are worth per square foot.",
    ],
    rationale: "Contribution is the principle that a component is worth what it adds to the whole rather than what it cost, which is why a $28,000 kitchen renovation may contribute $22,000, $34,000 or $9,000 depending on the market; conformity and its progression and regression corollaries determine whether the neighborhood rewards or punishes the improvement. The second choice is the near-miss because substitution is a real and central principle — it sets the buyer's ceiling — but it does not equate contribution with cost, and treating cost as contribution is exactly the error the contribution principle exists to correct.",
    teaches: "module-03.md#unit-value",
    source: "No statutory source — module-03 presents these as economic principles, not legal rules.",
  }),

  item("PRINS2-F042", {
    topic: "T03", unit: "T03U5",
    prompt: "An appraiser must decide which approaches to develop for three Texas assignments: a tract house in a large subdivision, a newly built rural fire station, and a leased suburban apartment property. Which allocation matches the reasons the course gives?",
    choices: [
      "Sales comparison dominates for the tract house, because residential buyers actually shop by substitution among near-identical alternatives and verified closed sales are plentiful; the cost approach dominates for the fire station, because it is new construction with little depreciation to estimate and a special-purpose property with almost no sales of substitutes and no income stream to capitalize; and the income approach dominates for the apartments, because it models the behaviour of the buyers who actually price that asset.",
      "Sales comparison dominates in all three, because it is the only approach that rests on what buyers have actually paid.",
      "The cost approach dominates for the tract house because construction cost data is current, sales comparison dominates for the fire station because public buildings trade regularly, and the income approach dominates for the apartments.",
      "All three approaches must be developed and averaged in every assignment, because reconciliation requires an indication from each before a conclusion may be reported.",
    ],
    rationale: "Each approach is an application of substitution and each is strongest where its data is strongest: sales comparison weakens on unique properties, in thin markets and in rapidly moving markets; the cost approach weakens as buildings age, because estimating accrued depreciation on a fifty-year-old improvement is judgment that can swing an answer by six figures; and the income approach is weak or inapplicable for owner-occupied houses, whose buyers are not pricing an income stream. The fourth choice is the near-miss because it converts a real rule — the appraiser develops the approaches applicable and necessary for credible results, omitting an inapplicable one with an explanation — into a requirement to develop all three, and then compounds it by describing reconciliation as averaging, which it is not.",
    teaches: "module-03.md#unit-three-approaches-to-value",
    source: "No statutory source — module-03 teaches the three approaches and their fields of strength as appraisal method.",
  }),

  item("PRINS2-F043", {
    topic: "T03", unit: "T03U5",
    prompt: "Cost approach figures for an illustrative Texas house: replacement cost new of the improvements $290,000; effective age 15 years against a total economic life of 60 years; functional obsolescence $6,000; external obsolescence $10,000; land value $120,000. What is the indicated value?",
    choices: [
      "$321,500 — age-life physical deterioration of 15/60, or 25 percent, is $72,500; total accrued depreciation is $88,500; depreciated improvements are $201,500; plus land value.",
      "$290,500 — age-life physical deterioration of 25 percent is $72,500, and functional and external obsolescence are subtracted from land value rather than from the improvements.",
      "$410,000 — replacement cost new plus land value, because accrued depreciation is deducted only where the improvement is beyond its economic life.",
      "$201,500 — replacement cost new less total accrued depreciation, because land value is developed separately and reported separately from the indicated value.",
    ],
    rationale: "The formula is reproduction or replacement cost new of the improvements, less accrued depreciation, plus land value: 290,000 multiplied by 0.25 = $72,500 physical; plus $6,000 functional and $10,000 external = $88,500 total; 290,000 minus 88,500 = $201,500; plus $120,000 land = $321,500. The fourth choice is the near-miss because it performs the depreciation correctly and then stops before the land, and land value is part of the indicated value rather than a separate report line.",
    teaches: "module-03.md#unit-three-approaches-to-value",
    source: "No statutory source — module-03 labels the cost figures illustrative; the reproduction/replacement distinction and the age-life method are appraisal technique.",
  }),

  item("PRINS2-F044", {
    topic: "T03", unit: "T03U5",
    prompt: "Three rental comparables in a subject's own market indicate gross rent multipliers of 148, 150 and 152. The appraiser selects 150 and the subject's market rent is $2,700 per month. What is the indication, and what is the technique's known weakness? (Illustrative figures.)",
    choices: [
      "$405,000, and the weakness is that a GRM uses gross rent, so it ignores differences in vacancy, taxes, insurance and operating expense between the subject and the comparables — it is evidence, not a substitute for analysis.",
      "$405,000, and the weakness is that a GRM requires at least five comparables to be reliable, so a three-comparable set cannot support a conclusion.",
      "$32,400, because the multiplier is applied to annual rather than monthly gross rent.",
      "$180,000, because the multiplier is derived as monthly rent divided by sale price and must be inverted before it is applied.",
    ],
    rationale: "A GRM is derived as sale price divided by monthly gross rent and applied the same way: 2,700 multiplied by 150 = $405,000. Its weakness is structural — gross rent says nothing about vacancy or operating cost, so two properties with identical gross rents and very different expense loads carry the same GRM. The second choice is the near-miss because it identifies a real limitation of thin data but attaches a comparable-count rule that no source states; the technique's defect is what it measures, not how many sales support it.",
    teaches: "module-03.md#unit-three-approaches-to-value",
    source: "No statutory source — module-03 labels the rental figures illustrative and teaches the gross rent multiplier as appraisal technique.",
  }),

  item("PRINS2-F045", {
    topic: "T03", unit: "T03U6",
    prompt: "A competing market area has 84 active listings, and closings have averaged 24 per month over the trailing six months. What is the months of supply, and what is the figure for? (Illustrative figures.)",
    choices: [
      "3.5 months — active listings divided by average monthly closed sales — and it is market context a license holder gives a seller alongside median days on market and the neighborhood list-to-sale price ratio, not an opinion of the property's value.",
      "3.5 months — closed sales divided by active listings — and it measures how quickly a particular listing will sell.",
      "0.29 months — average monthly closings divided by active listings — and it measures the share of inventory absorbed each month.",
      "84 months — one month of supply for each active listing — and it measures how long the current inventory would take to clear if no new listings arrived.",
    ],
    rationale: "Months of supply is active listings divided by average monthly closed sales: 84 divided by 24 = 3.5. It belongs to the market context a defensible comparative market analysis puts in front of a seller — months of supply, median days on market for comparable sold listings, and the neighborhood list-to-sale price ratio — and it describes the market, not the subject. The second choice is the near-miss because it produces the same number while stating the formula backwards and misdescribing what the figure measures.",
    teaches: "module-03.md#unit-pricing-a-property",
    source: "No statutory source — module-03 teaches months of supply as market context for a comparative market analysis; the license holder's authority to produce a written price opinion is Occupations Code § 1101.002(1)(A)(xi).",
  }),

  item("PRINS2-F046", {
    topic: "T03", unit: "T03U6",
    prompt: "A comparative market analysis is built from four closed sales, all of which are inferior to the subject, so every adjustment is positive and the concluded value sits above every sale in the set. What is the problem, and what does the quality check require?",
    choices: [
      "The conclusion is extrapolation rather than bracketing: the comparable set should include at least one property superior to the subject and at least one inferior, so the conclusion falls inside a range the market has already demonstrated. An all-inferior set is also the classic structure of an overpriced listing.",
      "There is no problem, because positive adjustments are the ordinary result of comparing a superior subject to a market of ordinary houses.",
      "The problem is that four comparables is one more than the working set the course describes, and the weakest sale should be dropped.",
      "The problem is that adjustments must net to zero across a properly selected comparable set, and a set producing only positive adjustments has been mis-selected on that ground.",
    ],
    rationale: "Bracketing is the single most useful quality check available: the set should straddle the subject so the conclusion lands inside a range the market established rather than beyond it, and a set producing only positive adjustments extrapolates past the highest sale. The fourth choice is the near-miss because it invents a netting rule; nothing requires adjustments to net to zero, and a properly bracketed set will often net positive or negative.",
    teaches: "module-03.md#unit-pricing-a-property",
    source: "No statutory source — module-03 teaches bracketing as method; the disciplinary exposure for a price assurance the license holder does not believe is Occupations Code § 1101.652(b)(5).",
  }),

  item("PRINS2-F047", {
    topic: "T03", unit: "T03U6",
    prompt: "Sellers arrive at a listing appointment with an online estimate well above the license holder's analysis. Using Occupations Code §§ 1103.003(4-b) and 1103.004(a)(6), how should the license holder describe that estimate?",
    choices: [
      "It is an automated valuation model — an automated system deriving value from public property records and analytic methodologies — and Chapter 1103 does not apply to the procurement or use of one, which is why it is lawful; it is neither an appraisal nor a comparative market analysis, because it has never been inside the house.",
      "It is an unlicensed appraisal, because Chapter 1103 defines an appraisal as an opinion of value regardless of whether prepared for a federally related transaction, and an automated system produces an opinion of value.",
      "It is a broker price opinion produced by the website's sponsoring brokerage, and is therefore subject to the same three conditions as the license holder's own price opinion.",
      "It is an appraisal exempt from Chapter 1103 only where the consumer requests it directly rather than receiving it as advertising.",
    ],
    rationale: "Section 1103.003(4-b) defines an automated valuation model as an automated system that derives value from public property records and analytic methodologies, and § 1103.004(a)(6) provides that the appraiser chapter does not apply to the procurement or use of one — which is why the consumer-facing online estimate is lawful. The second choice is the near-miss and reasons from a correct premise to the wrong conclusion: § 1103.003(1) does define appraisal broadly, but § 1103.004(a) removes listed activities from the chapter, and the AVM exclusion is one of them.",
    teaches: "module-03.md#unit-pricing-a-property",
    source: "Texas Occupations Code § 1103.003(4-b); § 1103.004(a)(6); § 1103.003(1)",
  }),

  item("PRINS2-F048", {
    topic: "T03", unit: "T03U6",
    prompt: "A license holder prices a listing in a specific Texas subdivision using sales pulled from across the metropolitan area without regard to the subdivision or its school attendance zone. Which subdivision of Occupations Code § 1101.652 is aimed at that failure?",
    choices: [
      "Subsection (a)(6) — the Commission may discipline a license holder who fails to consider market conditions for the specific geographic area in which the license holder is providing a service.",
      "Subsection (b)(23)(A) — publishing an advertisement that misleads or is likely to deceive the public.",
      "Subsection (b)(12) — failing to specify a definite termination date not subject to prior notice in a service contract.",
      "Subsection (b)(17) — guaranteeing that future profits will result from a resale of real property.",
    ],
    rationale: "Section 1101.652(a)(6) is a statutory instruction to do the analysis at the right scale: the specific geographic area, not the metro and not the county. The second choice is the near-miss because a misleading advertisement is a real and adjacent exposure, but (b)(23)(A) reaches published advertising rather than the analytical failure of pricing a listing off the wrong market. Note that pricing at a level the analysis does not support in order to win a listing agreement implicates (b)(5) as well.",
    teaches: "module-03.md#unit-pricing-a-property",
    source: "Texas Occupations Code § 1101.652(a)(6); see also § 1101.652(b)(1), (b)(2), (b)(5), (b)(6)",
  }),

  /* ══ T04 Leases — 130 prescribed minutes ══════════════════════════════════════════════════ */

  item("PRINS2-F049", {
    topic: "T04", unit: "T04U1",
    prompt: "A tenant abandons a Texas leased premises in violation of the lease in month four of a twelve-month term. The lease says the landlord may hold the tenant for the entire remaining term without re-letting. What does Property Code § 91.006 do to that clause?",
    choices: [
      "It overrides it: a landlord has a duty to mitigate damages if a tenant abandons the leased premises in violation of the lease, and that duty may not be waived — so the landlord may not simply sit on the vacant unit and bill for the remaining eight months.",
      "Nothing: § 91.006 states a default rule, and a written lease signed by both parties may allocate the risk of abandonment as the parties choose.",
      "It overrides it only for a residential tenancy, because § 91.006 sits in the chapter that applies only to residential rental property.",
      "It overrides it only where the tenant gave written notice of the abandonment, because the duty to mitigate is triggered by notice.",
    ],
    rationale: "Section 91.006(a) imposes the duty to mitigate on abandonment in violation of the lease, and § 91.006(b) makes the duty non-waivable — a clause promising the landlord the whole remaining term without effort to re-let cannot survive it. The third choice is the near-miss because it confuses the two chapters: it is Property Code chapter 92 that § 92.002 confines to residential rental property, while chapter 91 supplies rules applicable to landlords and tenants generally, commercial tenancies included.",
    teaches: "module-04.md#unit-leasehold-estates",
    source: "Texas Property Code § 91.006(a), (b); see also § 92.002",
  }),

  item("PRINS2-F050", {
    topic: "T04", unit: "T04U1",
    prompt: "A Texas owner and an occupant agree orally to a fourteen-month tenancy of a dwelling at a stated monthly rent. A second owner makes an identical oral agreement for eleven months. What is the difference in exposure?",
    choices: [
      "Both are leases — Property Code § 92.001(3) defines a lease of a dwelling to include an oral agreement — but Business and Commerce Code § 26.01 makes an agreement unenforceable unless it or a memorandum of it is in writing and signed by the party to be charged, and § 26.01(b)(5) applies that to a lease of real estate for a term longer than one year, so the fourteen-month agreement is exposed in a way the eleven-month agreement is not.",
      "Neither is a lease, because a lease of a dwelling must be in writing to create a leasehold estate in Texas.",
      "Both are equally exposed, because the statute of frauds reaches any lease of real estate regardless of term.",
      "The fourteen-month agreement is void and the eleven-month agreement is enforceable, because a lease longer than one year that is not in writing has no legal effect.",
    ],
    rationale: "Section 92.001(3) defines a lease as any written or oral agreement between a landlord and tenant establishing or modifying the terms of use and occupancy of a dwelling, so both are leases; § 26.01(b)(5) then makes a lease for a term longer than one year unenforceable absent a signed writing or memorandum. The fourth choice is the near-miss because it reaches the right practical conclusion by the wrong route — the statute of frauds makes an agreement unenforceable, which is not the same as void, and the distinction matters to what a party may still recover.",
    teaches: "module-04.md#unit-leasehold-estates",
    source: "Texas Property Code § 92.001(3); Texas Business and Commerce Code § 26.01(a), (b)(5)",
  }),

  item("PRINS2-F051", {
    topic: "T04", unit: "T04U2",
    prompt: "A Texas limited partnership owns an apartment property, and its general partner negotiates the leases in the course of that role. Separately, a salaried employee of a hotel operator handles the hotel's guest-room leasing and its management. Applying Occupations Code § 1101.005, is either performing an act that requires a license?",
    choices: [
      "Neither — § 1101.005(10) and (11) exempt leases of real estate owned by a limited partnership or a limited liability company when handled by a general partner, manager, managing member, or an employee who negotiates the transaction in the course of employment, and § 1101.005(9)(C) removes the lease or management of a hotel or motel from the chapter's subject matter altogether.",
      "Both — leasing is an act of a broker under § 1101.002(1)(A), and no exemption in § 1101.005 turns on the form in which the owner holds title or on the type of lodging leased.",
      "Only the general partner is exempt — the hotel exclusion reaches the sale of a hotel or motel rather than its leasing or management.",
      "Only the hotel employee is exempt — an entity's general partner is a separate person from the entity, so leasing the entity's property is leasing another person's property.",
    ],
    rationale: "Section 1101.005(10) and (11) exempt leases of real estate owned by a limited partnership or limited liability company handled by a general partner, manager, managing member or an employee negotiating in the course of employment, and § 1101.005(9)(C) excludes the lease or management of a hotel or motel from the chapter. The third choice is the near-miss because it narrows the hotel exclusion to a sale; the subdivision's words reach the lease OR management of a hotel or motel, which is why hotel leasing offices are outside chapter 1101 altogether.",
    teaches: "module-04.md#unit-leasing-real-estate",
    source: "Texas Occupations Code § 1101.005(9)(C), (10), (11); § 1101.002(1)(A)",
  }),

  item("PRINS2-F052", {
    topic: "T04", unit: "T04U2",
    prompt: "A sponsored Texas sales agent does no marketing and no showing on a landlord client's vacancy; she only negotiates the renewal terms and prepares the lease on the form the parties have agreed to use, for a fee. Is that brokerage?",
    choices: [
      "Yes — § 1101.004(a) provides that a person is engaged in real estate brokerage by performing an act described by § 1101.002(1) for another with the expectation of valuable consideration 'as a part of a transaction or as an entire transaction,' and negotiating a lease is a listed act; she must be acting for her sponsoring broker under § 1101.351(c).",
      "No — brokerage requires performing an entire transaction, and preparing paperwork on a form the parties selected is a clerical service.",
      "No — a lease is not real estate for licensing purposes, so no act relating to one can be brokerage.",
      "Yes, but only because she was paid; had she performed the same work without discussing payment, no act of a broker would have occurred.",
    ],
    rationale: "Section 1101.004(a) settles it with the phrase 'as a part of a transaction or as an entire transaction' — doing one piece of a lease deal for pay is enough — and § 1101.002(1)(A)(iii) lists negotiating or attempting to negotiate a lease among the acts of a broker, while § 1101.002(5) makes a leasehold real estate. The fourth choice is the near-miss because the compensation trigger is forward-looking: the definition catches a person acting with the EXPECTATION of receiving a commission or other valuable consideration, so an unpaid arrangement made on the promise of later payment is already inside it.",
    teaches: "module-04.md#unit-leasing-real-estate",
    source: "Texas Occupations Code § 1101.004(a); § 1101.002(1)(A)(iii), (5); § 1101.351(c)",
  }),

  item("PRINS2-F053", {
    topic: "T04", unit: "T04U3",
    prompt: "A Texas landlord of a three-bedroom dwelling wants an occupancy clause. Under Property Code § 92.010, what is the maximum number of adults the landlord may allow to occupy it, and how are the terms defined?",
    choices: [
      "Nine — the maximum is three times the number of bedrooms; an adult is a person 18 or older, and a bedroom is an area of a dwelling intended as sleeping quarters, excluding kitchens, dining rooms, bathrooms, living rooms, utility rooms and closets.",
      "Six — the maximum is two times the number of bedrooms, with the same definitions.",
      "Nine — the maximum is three times the number of rooms in the dwelling that could be used for sleeping, including a converted dining room or a finished utility room.",
      "There is no statutory maximum; occupancy limits are set entirely by the lease, subject only to local ordinance.",
    ],
    rationale: "Section 92.010(a) sets the maximum adults a landlord may allow at three times the number of bedrooms, with 'adult' meaning 18 or older and 'bedroom' meaning an area intended as sleeping quarters, expressly excluding kitchens, dining rooms, bathrooms, living rooms, utility rooms and closets. The third choice is the near-miss because it reaches the same number by counting rooms the definition excludes, which would produce a different answer on a differently laid-out dwelling. Section 92.010(b) also requires a higher rate where a fair housing law requires one, and permits one for an adult seeking temporary sanctuary from family violence for up to one month.",
    teaches: "module-04.md#unit-common-lease-provisions",
    source: "Texas Property Code § 92.010(a), (b)",
  }),

  item("PRINS2-F054", {
    topic: "T04", unit: "T04U3",
    prompt: "A parent guarantees a Texas residential lease. The guaranty form recites that the guarantor will remain liable through any renewal. Under Property Code § 92.021, when does that recital actually reach a renewal term?",
    choices: [
      "Only where the original lease states the last date, specified by the guarantor, on which a renewal will renew the obligation; that the guarantor is liable under a renewal occurring on or before that date; and that the guarantor is liable only if the renewal involves the same parties as the original lease and does not increase the guarantor's potential financial obligation for rent that existed under the original lease.",
      "Whenever the guaranty form itself says so, because a guaranty is a contract between the guarantor and the landlord and § 92.021 does not limit its terms.",
      "Never — a person other than a tenant who guarantees a lease is liable only for the original lease term, with no exception.",
      "Only where the guarantor signs a fresh guaranty at each renewal, because a guaranty cannot bind a person to a term that has not yet been negotiated.",
    ],
    rationale: "Section 92.021(a) limits a non-tenant guarantor to the original lease term except as subsection (b) permits, and § 92.021(b) is the exception with its own conditions: the ORIGINAL lease must state the guarantor-specified last date on which a renewal renews the obligation, must state that the guarantor is liable under a renewal occurring on or before that date, and must state that liability attaches only if the renewal involves the same parties and does not increase the guarantor's potential rent obligation. The second choice is the near-miss because it treats the form's recital as self-executing, which is exactly what § 92.021(b) refuses.",
    teaches: "module-04.md#unit-common-lease-provisions",
    source: "Texas Property Code § 92.021(a), (b)",
  }),

  item("PRINS2-F055", {
    topic: "T04", unit: "T04U4",
    prompt: "A Texas residential tenant stops paying rent, then a week later delivers a written notice to the management office complaining that a bathroom exhaust fan is noisy. Does Property Code § 92.052 impose a duty to repair?",
    choices: [
      "No, on two independent grounds: the tenant was delinquent in rent at the time the notice was given, and a noisy exhaust fan is not a condition that materially affects the physical health or safety of an ordinary tenant or a failure to maintain a device supplying hot water of at least 120 degrees Fahrenheit.",
      "Yes — the notice went to the place where rent is normally paid, which is the only condition § 92.052 imposes.",
      "No, but only because the condition is trivial; a delinquent tenant may still invoke § 92.052 for a serious condition, since the statute conditions only the landlord's liability and not the duty itself.",
      "Yes — delinquency suspends the tenant's remedies but not the landlord's duty, and the duty attaches to any condition the tenant specifies in a written notice.",
    ],
    rationale: "Section 92.052(a) states three conditions together: the tenant specifies the condition in a notice to the person or place where rent is normally paid; the tenant is not delinquent in the payment of rent at the time notice is given; and the condition materially affects the physical health or safety of an ordinary tenant or arises from a failure to keep a device supplying hot water of a minimum temperature of 120 degrees Fahrenheit in good operating condition. Both the delinquency and the severity conditions fail here. The third and fourth choices are the near-misses: currency in rent is written into the duty itself, not merely into the remedy, and a tenant who withholds rent first and complains second has forfeited the statute.",
    teaches: "module-04.md#unit-texas-landlord--tenant-statutes",
    source: "Texas Property Code § 92.052(a), (b), (d); § 92.060",
  }),

  item("PRINS2-F056", {
    topic: "T04", unit: "T04U4",
    prompt: "A prospective Texas tenant submits a completed rental application on the landlord's form together with an application deposit and a separate application fee. Eight days pass with no word. Under Property Code chapter 92, subchapter I, where does that leave her?",
    choices: [
      "She is deemed rejected — an applicant is deemed rejected if the landlord does not give notice of acceptance on or before the seventh day after the completed application is submitted on the landlord's form — so the refundable application deposit must come back; the application fee is a nonrefundable sum given to offset the costs of screening and does not, and a landlord who in bad faith fails to refund owes $100, three times the amount wrongfully retained, and the applicant's reasonable attorney's fees.",
      "She is deemed rejected on the seventh day, and both the application deposit and the application fee must be refunded, because a rejected applicant received no service.",
      "She remains under consideration until the landlord acts, because subchapter I sets no deadline and the deposit secures the unit until the applicant withdraws.",
      "She is deemed accepted on the eighth day, because silence past the statutory period operates as acceptance of the application on the terms offered.",
    ],
    rationale: "Section 92.352(a) deems an applicant rejected if the landlord does not give notice of acceptance on or before the seventh day after the completed application is submitted on the landlord's form, and § 92.354 supplies the bad-faith penalty of $100, three times the amount wrongfully retained, and reasonable attorney's fees. The distinction the second choice misses is definitional: § 92.351 defines an application deposit as refundable if the applicant is rejected, while an application fee is 'a nonrefundable sum of money ... given to the landlord to offset the costs of screening an applicant.' Silence produces rejection, not acceptance.",
    teaches: "module-04.md#unit-texas-landlord--tenant-statutes",
    source: "Texas Property Code § 92.351(1), (1-a); § 92.352(a); § 92.354",
  }),

  item("PRINS2-F057", {
    topic: "T04", unit: "T04U4",
    prompt: "A Texas landlord whose written lease permits it changes the locks on a delinquent tenant's unit after giving the notice Property Code § 92.0081(d) requires. The tenant appears that evening without the rent and asks for a key. What must the landlord do?",
    choices: [
      "Provide a key to the changed lock without regard to whether the tenant pays the delinquent rent; the notice on the door must give a 24-hour on-site key location or a 24-hour telephone number with a key delivered within two hours, and the landlord may not change the locks more than once during a rental payment period or while a legal occupant is in the dwelling.",
      "Refuse the key until the delinquency is cured, since the lockout right exists precisely to secure payment and would be meaningless otherwise.",
      "Provide a key only after the tenant signs a payment plan, because the statutory key right is conditioned on the tenant re-establishing the tenancy.",
      "Provide a key within 24 hours of the request, since the statute allows the landlord a full day to arrange access.",
    ],
    rationale: "Section 92.0081(f) is unconditional: the landlord must provide the tenant with a key to the changed lock without regard to whether the tenant pays the delinquent rent, and § 92.0081(c) requires a 24-hour on-site key location or a 24-hour telephone number with delivery within two hours. The second choice is the near-miss and states the commercial intuition most landlords have; the statute deliberately refuses it, and violation costs possession or termination at the tenant's election plus a civil penalty of one month's rent plus $1,000, actual damages, costs and fees, with an additional month's rent for refusing the key.",
    teaches: "module-04.md#unit-texas-landlord--tenant-statutes",
    source: "Texas Property Code § 92.0081(b), (c), (d), (f), (h)",
  }),

  item("PRINS2-F058", {
    topic: "T04", unit: "T04U5",
    prompt: "A Texas landlord is comparing a modified gross offer with a triple net offer on the same commercial space. Which statement about the net-lease family is accurate?",
    choices: [
      "Under a triple net lease the tenant pays base rent plus taxes, insurance and maintenance directly, leaving the landlord structural and capital items — and the further along the single-net to absolute-net scale a lease sits, the lower the base rent a landlord can command, because the tenant is absorbing both the costs and the risk that they rise.",
      "Under a triple net lease the tenant pays base rent plus taxes, insurance and maintenance, and the landlord can command a higher base rent because the tenant is receiving a more complete set of services.",
      "The categories are defined by Texas statute, so a landlord and tenant using the term 'triple net' have agreed to a fixed statutory allocation of taxes, insurance and maintenance.",
      "A modified gross lease is a triple net lease with a cap on the tenant's expense reimbursement, and the two terms are interchangeable in Texas commercial practice.",
    ],
    rationale: "The economic logic of the net-lease scale is that the tenant absorbing more cost and more risk is compensated by a lower base rent; a triple net lease adds taxes, insurance and maintenance to the tenant's side, and an absolute net or bondable lease pushes even structure and casualty risk across. The third choice is the near-miss and matters practically: module-04 states that no held Texas source defines 'triple net' or 'percentage lease,' that these are customary commercial terms whose meaning comes from the lease document, and that two landlords in the same market can use 'net lease' to mean two different cost splits — always read the expense clauses.",
    teaches: "module-04.md#unit-types-of-leases",
    source: "No statutory source — module-04 states that these lease categories are commercial practice and market vocabulary rather than Texas statutory definitions.",
  }),

  item("PRINS2-F059", {
    topic: "T04", unit: "T04U5",
    prompt: "A Texas investor is considering a ground lease under which the tenant will build a building at the tenant's own expense. What is the central negotiating issue, and why are these terms long?",
    choices: [
      "What happens to the improvements at the end of the term — ordinarily they revert to the landowner with the land — which is why terms run long enough to amortize a building and why lenders financing leasehold improvements scrutinize the remaining term; the tenant's leasehold is itself real estate under Occupations Code § 1101.002(5), so it can be mortgaged, assigned and brokered.",
      "Whether the lease is gross or net, because a ground lease is by definition a gross lease and the landowner therefore bears the operating cost of the tenant's building.",
      "Whether the tenant may sublease, because Property Code § 91.005 makes a ground lease the only tenancy in which subletting is permitted without the landlord's consent.",
      "What rent the landowner may charge, because a ground lease must be an index lease so that ground rent tracks the value of the land over a long term.",
    ],
    rationale: "In a ground lease the tenant leases land only and builds at its own expense; the improvements ordinarily revert to the landowner at the end of the term, which is what makes the reversion the central negotiating issue and drives both long terms and lender scrutiny of remaining term. The second choice is the near-miss and inverts the structure: ground leases are usually net, not gross. The third choice also misstates § 91.005, which provides that during the term of a lease a tenant may not rent the leasehold to another without the landlord's prior consent.",
    teaches: "module-04.md#unit-types-of-leases",
    source: "Texas Occupations Code § 1101.002(5); Texas Property Code § 91.005; the ground-lease structure itself is commercial practice, which module-04 states without citation.",
  }),

  /* ══ T05 Control of Land Use — 110 prescribed minutes ═════════════════════════════════════ */

  item("PRINS2-F060", {
    topic: "T05", unit: "T05U1",
    prompt: "A buyer is purchasing a tract in a Texas municipality's extraterritorial jurisdiction and asks what the city can regulate there. Under Local Government Code § 212.003, what is the accurate answer?",
    choices: [
      "Expect platting and subdivision regulation; unless otherwise authorized by state law, in its extraterritorial jurisdiction a municipality may not regulate the use of buildings or property for business, industrial, residential or other purposes, the bulk, height or number of buildings on a tract, the size of a building including any floor-area-ratio restriction, or the number of residential units per acre — and § 212.049 adds that the development-plat subchapter does not authorize municipal building permits or building-code enforcement in the ETJ.",
      "Expect the full zoning ordinance to apply, because a municipality's extraterritorial jurisdiction is treated as within its limits for all regulatory purposes.",
      "Expect no municipal regulation at all, because chapter 211 grants zoning power only to municipalities and the ETJ lies outside the municipal limits.",
      "Expect use and density regulation but not platting, because platting authority is reserved to the county in the extraterritorial jurisdiction.",
    ],
    rationale: "Section 212.003(a) lets a municipality extend its subdivision ordinances into the ETJ and then lists what it may not regulate there — use, bulk, height, number of buildings, building size including floor-area ratio, and residential density — subject to the opening words 'unless otherwise authorized by state law,' which make the prohibition a default rather than an absolute bar. The fourth choice is the near-miss and reverses the rule exactly, which module-05 identifies as the most misdescribed piece of Texas land-use law in ordinary conversation.",
    teaches: "module-05.md#unit-land-use-controls",
    source: "Texas Local Government Code § 212.003(a); § 212.049; § 212.001(1)",
  }),

  item("PRINS2-F061", {
    topic: "T05", unit: "T05U1",
    prompt: "A buyer's plan for a lot inside a Texas municipality is a use the zoning district permits, but the building will not fit inside the required yards. Under Local Government Code § 211.003, why can the plan still fail?",
    choices: [
      "Because use regulation is one item among six: the governing body may regulate the height, number of stories and size of buildings and other structures; the percentage of a lot that may be occupied; the size of yards, courts and other open spaces; population density; the location and use of buildings and land for business, industrial, residential or other purposes; and, on the stated public-health terms, the pumping, extraction and use of groundwater — so a plan can be defeated by the bulk, height and area regulations even where the use is permitted.",
      "Because a permitted use in a district is only presumptively permitted, and the governing body must approve each building individually before it may be constructed.",
      "Because § 211.003 authorizes a municipality to regulate use alone, and yard requirements are private restrictions found in the subdivision declaration rather than in the ordinance.",
      "Because § 211.005(b) requires zoning regulations to be uniform for each class or kind of building in a district, so a building that differs from others in the district is not permitted regardless of its use.",
    ],
    rationale: "Section 211.003(a) lists six categories a municipality may regulate, of which use is one; the rest are bulk, height and area regulations, and either can defeat a buyer's plan. Subsection (b) adds authority over places of historical, cultural or architectural significance and subsection (c) permits a home-rule municipality to regulate the bulk of buildings. The fourth choice is the near-miss because § 211.005(b) is real — regulations must be uniform for each class or kind of building in a district, though they may vary from district to district — but uniformity is a constraint on how the municipality writes its rules, not a bar on a building that differs from its neighbours.",
    teaches: "module-05.md#unit-land-use-controls",
    source: "Texas Local Government Code § 211.001; § 211.003(a)-(c); § 211.004(a); § 211.005(a), (b)",
  }),

  item("PRINS2-F062", {
    topic: "T05", unit: "T05U1",
    prompt: "A buyer in a deed-restricted Texas subdivision asks whether the association can stop her from putting solar panels on the roof. What is the accurate answer, and what other categories does the Legislature treat the same way?",
    choices: [
      "The association generally cannot prohibit a solar energy device outright but can regulate how and where it is installed; the Legislature has carved out other categories the same way, including water-conserving landscaping and rainwater harvesting, certain durable or solar-generating shingles that match the surrounding property, flag display, permanently installed standby electric generators, lawful firearm possession, conforming pool enclosures, security measures including cameras and perimeter fencing, and renting based on the tenant's method of payment, which includes a housing choice voucher.",
      "The association may prohibit a solar energy device outright if the declaration was recorded before the statute was enacted, because Property Code chapter 202 applies only to restrictive covenants created after its effective date.",
      "The association may prohibit a solar energy device outright, because an exercise of discretionary authority by a property owners' association is presumed reasonable.",
      "The association has no authority over the installation at all, because the Legislature has removed solar energy devices from the reach of restrictive covenants entirely.",
    ],
    rationale: "The pattern in Property Code §§ 202.007 to 202.024 is that the association may not prohibit the listed categories outright but may regulate appearance and location, and the listed categories include solar energy devices, water-conserving landscaping and rainwater harvesting, qualifying shingles, flags, standby generators, firearms, conforming pool enclosures, security measures and renting based on method of payment including a housing choice voucher. The third choice is the near-miss because the presumption in § 202.004(a) is real — an exercise of discretionary authority is presumed reasonable unless shown arbitrary, capricious or discriminatory — but a presumption about how discretion is exercised does not create authority the carve-outs withdraw. Note that § 202.002(a) applies the chapter to all restrictive covenants regardless of when they were created.",
    teaches: "module-05.md#unit-land-use-controls",
    source: "Texas Property Code §§ 202.007, 202.010, 202.011, 202.012, 202.019, 202.021, 202.022, 202.023, 202.024; § 202.002(a); § 202.004(a)",
  }),

  item("PRINS2-F063", {
    topic: "T05", unit: "T05U1",
    prompt: "A Texas owner inside a municipality's limits divides a tract into three parts and conveys them by metes and bounds descriptions in deeds, laying out a shared private drive. He says no plat is needed because he never filed a subdivision. Under Local Government Code § 212.004, is he right?",
    choices: [
      "No — a plat is required when an owner divides a tract into two or more parts to lay out a subdivision, lots, streets, alleys, squares, parks or other parts intended to be dedicated to public use, and the division counts however accomplished, including by a metes and bounds description in a deed of conveyance or in a contract for a deed, by a contract of sale or other executory contract to convey, or by any other method; the plat must be filed and recorded with the county clerk.",
      "Yes — the platting requirement attaches only where the owner files a subdivision plat or records a declaration, so conveying by metes and bounds avoids it.",
      "No — but only because the shared drive is a street; had he divided the tract without laying out any drive, metes and bounds conveyances would have been outside § 212.004.",
      "Yes — § 212.004 excludes any division of land into parts, however small, where each part has access, so access alone removes the tract from the subchapter.",
    ],
    rationale: "The words 'however accomplished' are what defeat the metes-and-bounds workaround: § 212.004(a) lists the methods expressly, and § 212.004(d) requires the plat to be filed and recorded with the county clerk. The fourth choice is the near-miss because the subsection does contain an exclusion — a division of land into parts GREATER THAN FIVE ACRES, where each part has access and no public improvement is being dedicated — and access alone is only one of its three elements. The requirement also reaches the municipality's extraterritorial jurisdiction.",
    teaches: "module-05.md#unit-land-use-controls",
    source: "Texas Local Government Code § 212.004(a), (b), (d); § 212.002",
  }),

  item("PRINS2-F064", {
    topic: "T05", unit: "T05U1",
    prompt: "A conforming plat is filed with the responsible municipal authority in Texas. Thirty-five days pass with no action, and on day 40 the authority issues a one-line disapproval reading only that the plat 'does not meet city standards.' What is the plat's status?",
    choices: [
      "Approved by the authority's inaction — § 212.009(a) provides that the plat is approved unless it is disapproved within 30 days AND in accordance with § 212.0091, which requires a written statement clearly articulating each condition or reason, directly related to the subchapter's requirements, citing the law relied on where applicable, and not arbitrary; this disapproval fails both halves.",
      "Disapproved — the 30-day period is directory rather than mandatory, and a late disapproval is effective when issued.",
      "Neither approved nor disapproved — the clock is tolled until the authority states adequate reasons, and the applicant's remedy is to resubmit.",
      "Approved, but only because the disapproval was late; a timely disapproval in the same words would have stopped the clock, since § 212.0091 governs the content of conditions rather than of disapprovals.",
    ],
    rationale: "Section 212.005(a) makes approval of a conforming plat mandatory, and § 212.009(a) provides that a plat is approved unless disapproved within 30 days and in accordance with § 212.0091 — both halves of that condition matter. The fourth choice is the near-miss because it reads the two requirements as alternatives; § 212.0091 requires a written statement clearly articulating each condition OR REASON for the disapproval, directly related to the subchapter's requirements, and it may not be arbitrary. An owner whose conforming plat is refused has an action for a writ of mandamus with reasonable attorney's fees under § 212.010(e).",
    teaches: "module-05.md#unit-land-use-controls",
    source: "Texas Local Government Code § 212.009(a); § 212.0091; § 212.005(a); § 212.010(e)",
  }),

  item("PRINS2-F065", {
    topic: "T05", unit: "T05U2",
    prompt: "A Texas water district proposes to acquire a right-of-way across a private tract. A client asks the difference between eminent domain and condemnation, and what the district must be able to point to.",
    choices: [
      "Eminent domain is the power of a governmental entity to take private property; condemnation is the procedure by which that power is exercised. The entity must point to a delegation — Water Code § 11.033 delegates the power to political subdivisions and constitutional governmental agencies exercising delegated legislative powers for stated purposes — and Water Code § 11.035(b) provides that the party obtaining private property by condemnation shall cause damages to be assessed and paid as the state's eminent domain statutes provide.",
      "The two terms are interchangeable names for the same governmental act, and any public body may exercise the power because it is public.",
      "Eminent domain is the procedure and condemnation is the power; the entity must point to a comprehensive plan adopted under Local Government Code § 211.004.",
      "Eminent domain applies to a fee taking and condemnation to a taking of an easement; a governmental entity needs no delegation for either, because the power is inherent in a public body.",
    ],
    rationale: "Using the two terms interchangeably is the common error module-05 flags: eminent domain is the power, condemnation is the procedure. Eminent domain is not held by every public body simply because it is public — Water Code § 11.033 states the delegation for water-related purposes, and a condemning authority must point to a delegation and show the taking falls within it, with damages assessed and paid under § 11.035(b). Note that the module states no constitutional text on public use and just compensation, because the constitutional provision was not among the sources read.",
    teaches: "module-05.md#unit-public-ownership",
    source: "Texas Water Code § 11.033; § 11.035(a), (b), (d), (e)",
  }),

  item("PRINS2-F066", {
    topic: "T05", unit: "T05U2",
    prompt: "A buyer of Texas riverfront acreage plans to divert water from the flowing stream to irrigate. What does Water Code chapter 11 tell you about what she bought?",
    choices: [
      "She did not buy the flowing water: the water of the ordinary flow, underflow and tides of every flowing river, natural stream and lake, and the storm water, floodwater and rainwater of every river, natural stream, canyon, ravine, depression and watershed in the state is the property of the state, held in trust for the public, and the right to use state water may be appropriated only as expressly authorized by law — so a plan to divert or impound requires a right acquired under chapter 11.",
      "She bought the water within her boundaries, subject only to the rights of downstream owners, because riparian frontage carries a right of reasonable use.",
      "She bought the water but not the bed, because the bed of a navigable stream belongs to the state while the flow belongs to the abutting owner.",
      "She bought neither, and no appropriation is possible for irrigation, because the statute lists only domestic and municipal supply as authorized purposes.",
    ],
    rationale: "Section 11.021(a) makes the water of the ordinary flow the property of the state, § 11.0235(a) holds the waters of the state in trust for the public and permits appropriation only as expressly authorized by law, and § 11.022 provides that the right to use state water may be acquired by appropriation for the purposes § 11.023 lists — which include agriculture, industry, mining, navigation, recreation and any other beneficial use as well as domestic and municipal supply. The fourth choice is the near-miss because it correctly denies ownership and then wrongly narrows the list of appropriable purposes.",
    teaches: "module-05.md#unit-public-ownership",
    source: "Texas Water Code § 11.021(a); § 11.0235(a); § 11.022; § 11.023",
  }),

  item("PRINS2-F067", {
    topic: "T05", unit: "T05U3",
    prompt: "A Texas brokerage takes a listing on a 1962 house. The seller completes a lead disclosure form and tells the agent to leave the rest to him. What does 42 U.S.C. § 4852d(a)(4) place on the agent, and what does § 4852d(c) say about the consequences of a failure?",
    choices: [
      "Where a seller or lessor has entered into a contract with an agent for the purpose of selling or leasing a unit of target housing, the regulations must require the agent, on behalf of the seller or lessor, to ensure compliance with the section — an affirmative duty not conditioned on the seller's cooperation; and § 4852d(c) provides that nothing in the section affects the validity or enforceability of the sale or contract or of any related loan or lien, nor creates a defect in title.",
      "The agent's duty is to inform the seller of the requirements; once the seller has signed the disclosure the agent has discharged it, and § 4852d(c) makes a contract voidable where the pamphlet was not delivered.",
      "The agent has no duty under the section, which runs only to the seller or lessor, and § 4852d(c) preserves the buyer's right to rescind the contract for a failure to disclose.",
      "The agent must ensure compliance only where the seller has actual knowledge of lead-based paint, and § 4852d(c) makes a knowing failure a defect in title curable by an amended disclosure.",
    ],
    rationale: "Section 4852d(a)(4) is short and its operative words are 'ensure compliance' — not inform the seller, not if the seller asks — and the duty is triggered simply by having a listing or leasing engagement on a unit of target housing. Section 4852d(c) then draws the line the second choice gets wrong: a lead-paint failure is a penalty-and-damages problem, not a title problem, and telling a client the contract is void because the addendum was missed would be wrong. Note also that the purchaser's 10-day risk-assessment or inspection opportunity under § 4852d(a)(1)(C) is a default the parties may change by mutual agreement.",
    teaches: "module-05.md#unit-environmental-protection-legislation",
    source: "42 U.S.C. § 4852d(a)(1), (a)(4), (b)(3), (c)",
  }),

  item("PRINS2-F068", {
    topic: "T05", unit: "T05U3",
    prompt: "A Texas seller is conveying an unimproved lot to be used for residential purposes. A transportation pipeline crosses the tract. Under Property Code § 5.013, what must happen, and what is the purchaser's remedy if it does not?",
    choices: [
      "The seller must give the purchaser written notice disclosing the location of a transportation pipeline, including a pipeline transporting natural gas, natural gas liquids, synthetic gas, liquefied petroleum gas, petroleum or a petroleum product, or a hazardous substance; if the notice is not delivered on or before the effective date of a binding executory contract, the purchaser may terminate the contract for any reason not later than the seventh day after the effective date.",
      "The seller must give the notice at closing, and a failure entitles the purchaser to rescind within two years and recover all payments made.",
      "The seller must give the notice only where the pipeline transports a hazardous substance as that term is defined in CERCLA, 42 U.S.C. § 9601(14), and no remedy attaches to a failure.",
      "No notice is required for unimproved land, because the seller's disclosure obligations under Property Code § 5.008 apply only to residential real property comprising not more than one dwelling unit.",
    ],
    rationale: "Section 5.013(a) requires the pipeline notice on a sale of unimproved real property to be used for residential purposes, and § 5.013(c) gives the purchaser a right to terminate for any reason not later than the seventh day after the effective date of the contract where the notice was not delivered by that date. The third choice is the near-miss on a real trap: § 5.013(e) takes 'hazardous substance' from Health and Safety Code § 361.003, not from CERCLA § 9601(14), and module-05 warns that the two phrases are not interchangeable. The fourth choice is right about § 5.008's scope and wrong to conclude that unimproved land carries no notice duty.",
    teaches: "module-05.md#unit-environmental-protection-legislation",
    source: "Texas Property Code § 5.013(a), (c), (e); see § 5.008(a) for the separate residential disclosure notice",
  }),

  /* ══ T06 Texas Real Estate License Act — 250 prescribed minutes ═══════════════════════════ */

  item("PRINS2-F069", {
    topic: "T06", unit: "T06U1",
    prompt: "Occupations Code § 1101.002(5) defines the 'real estate' a license holder deals in. Which statement matches the definition and its consequences?",
    choices: [
      "Any interest in real property, including a leasehold, located in or outside this state — but not an interest given as security for the performance of an obligation; so leasing activity is brokerage activity, and dealing in a deed-of-trust security interest is not, standing alone, dealing in real estate under the chapter.",
      "Land and permanent improvements located in this state, together with any leasehold of more than one year; interests outside Texas are governed by the law of the state where the property sits.",
      "Any interest in real property including a leasehold and including an interest given as security, since a lien is an interest in the property it encumbers.",
      "Fee simple and life estates located in or outside this state; a leasehold is a contract right rather than an interest in real property for licensing purposes.",
    ],
    rationale: "The licensed commodity is interests, not dirt: the definition reaches any interest in real property including a leasehold, in or outside this state, and expressly excludes an interest given as security for the performance of an obligation. The third choice is the near-miss because it is true as a matter of general property law that a lien is an interest in the encumbered property — and the definition deliberately carves that out, which is why brokering a lease is licensed activity and holding a deed-of-trust lien is not.",
    teaches: "module-06.md#unit-basic-provisions-of-the-texas-real-estate-license-act",
    source: "Texas Occupations Code § 1101.002(5); § 1101.002(6)",
  }),

  item("PRINS2-F070", {
    topic: "T06", unit: "T06U1",
    prompt: "A Texas provider wants to report a student's completion of a 30-hour alternative-delivery qualifying course as soon as the student finishes the material. Occupations Code § 1101.003 constrains that. How?",
    choices: [
      "Completion may not be reported until the elapsed time between the student's registration and the report of completion exceeds twice the number of hours for which credit is claimed — more than 60 hours for a 30-hour course — and a daily course segment for a qualifying course may not exceed 12 hours.",
      "Completion may not be reported until 30 hours of recorded seat time have accumulated, and a daily course segment may not exceed 8 hours.",
      "Completion may be reported as soon as the student passes the course examination, because the elapsed-time rule applies only to classroom delivery.",
      "Completion may not be reported until the elapsed time equals the number of credit hours claimed — 30 hours for a 30-hour course — and there is no daily segment cap for distance delivery.",
    ],
    rationale: "Section 1101.003(e) bars reporting completion of an alternative delivery or correspondence qualifying course until elapsed time from registration exceeds TWICE the credit hours claimed, and § 1101.003(d) caps a daily qualifying-course segment at 12 hours. The fourth choice is the near-miss because it uses the right structure with the wrong multiplier, and the multiplier is the whole point: a self-paced 30-hour course cannot be reported as finished in a day no matter how quickly the student reads.",
    teaches: "module-06.md#unit-basic-provisions-of-the-texas-real-estate-license-act",
    source: "Texas Occupations Code § 1101.003(d), (e)",
  }),

  item("PRINS2-F071", {
    topic: "T06", unit: "T06U1",
    prompt: "A person acting under a power of attorney has closed three real estate transactions for the principal this calendar year and is asked to handle a fourth. Under Occupations Code § 1101.005, where does that leave her?",
    choices: [
      "Outside the exemption for the fourth — the chapter does not apply to an attorney-in-fact under a power of attorney conducting not more than three real estate transactions annually, and the fourth exceeds the stated limit.",
      "Inside the exemption, because the attorney-in-fact exemption is unlimited so long as the power of attorney is validly executed and recorded.",
      "Inside the exemption, because the three-transaction limit counts only transactions in which compensation was received.",
      "Outside the exemption for all four, because exceeding the limit in a year retroactively removes the exemption from the earlier transactions.",
    ],
    rationale: "Section 1101.005 lists the persons and transactions to which the chapter does not apply, and the attorney-in-fact entry is expressly limited to a person conducting 'not more than three real estate transactions annually.' The third choice is the near-miss because compensation is central to the broker definition in § 1101.002(1) — but the attorney-in-fact exemption is written in transactions, not in dollars, and reading a compensation qualifier into it would rewrite the exemption. The section also exempts a Texas-licensed attorney, a public official on official duties, a licensed auctioneer conducting an auction who performs no other act of a broker, and an owner or the owner's employee leasing the owner's real estate, and excludes minerals, standing timber, cemetery lots, and hotel and motel leasing or management from the chapter's subject matter.",
    teaches: "module-06.md#unit-basic-provisions-of-the-texas-real-estate-license-act",
    source: "Texas Occupations Code § 1101.005",
  }),

  item("PRINS2-F072", {
    topic: "T06", unit: "T06U2",
    prompt: "Under Occupations Code subchapter B, how is the Texas Real Estate Commission composed, and how do members serve?",
    choices: [
      "Nine members appointed by the governor with the advice and consent of the senate — six who have been engaged in the brokerage business as licensed brokers as their major occupation for the five years preceding appointment, and three who represent the public — serving staggered six-year terms, with the governor designating a member who is a licensed broker as presiding officer.",
      "Nine members appointed by the governor — five licensed brokers and four public members — serving staggered four-year terms, with the members electing their own presiding officer.",
      "Nine members, six appointed by the governor and three elected by license holders, serving six-year terms.",
      "Seven members appointed by the governor with the advice and consent of the senate — four licensed brokers and three public members — serving staggered six-year terms.",
    ],
    rationale: "Section 1101.051(a) sets nine members appointed by the governor with senate consent, six brokers whose major occupation has been the brokerage business for the five preceding years and three public members; § 1101.055(a) sets staggered six-year terms with the terms of three members expiring January 31 of each odd-numbered year; and § 1101.056(a) has the governor designate a licensed-broker member as presiding officer. The second choice is the near-miss on both the split and the designation of the presiding officer, which the governor makes rather than the members.",
    teaches: "module-06.md#unit-subchapter-a---general-provisions",
    source: "Texas Occupations Code § 1101.051(a); § 1101.055(a); § 1101.056(a); § 1101.052; § 1101.053",
  }),

  item("PRINS2-F073", {
    topic: "T06", unit: "T06U2",
    prompt: "The Texas Real Estate Broker-Lawyer Committee drafts the contract forms a license holder uses daily. How is it composed, and what is its statutory mandate?",
    choices: [
      "Thirteen members — six appointed by the Commission, six members of the State Bar of Texas appointed by the president of the state bar, and one public member appointed by the governor — charged to draft and revise contract forms capable of being standardized to expedite real estate transactions and minimize controversy, with safeguards adequate to protect the principals in the transaction.",
      "Nine members appointed by the Commission from among licensed brokers and Texas attorneys, charged to approve forms the Commission drafts.",
      "Thirteen members appointed by the governor, charged to adopt contract forms and to require license holders to use them.",
      "Six brokers and six attorneys appointed by the Commission, charged to draft forms and to determine when a license holder's completion of a form becomes the unauthorized practice of law.",
    ],
    rationale: "Section 1101.252(a) sets the committee at 13 — six Commission appointees, six State Bar members appointed by the state bar's president, and one public member appointed by the governor — and § 1101.254 states the drafting-and-revising mandate with the safeguards clause. The third choice is the near-miss because it confuses drafting with adoption: the committee drafts (§ 1101.254) and the Commission may require use of the forms it adopts (§ 1101.155(a)), while § 1101.155(b) forbids the Commission to prohibit an owner's own form or an attorney-prepared form the owner requires. The committee's half-lawyer composition is what makes the § 1101.654(b) protection defensible.",
    teaches: "module-06.md#unit-subchapter-a---general-provisions",
    source: "Texas Occupations Code § 1101.252(a); § 1101.253; § 1101.254; § 1101.155(a), (b); § 1101.654(b)",
  }),

  item("PRINS2-F074", {
    topic: "T06", unit: "T06U2",
    prompt: "A Texas property owner insists on using a purchase contract drafted by her own attorney rather than the Commission's promulgated form, and the listing agent tells her that is not permitted. Evaluate that statement under Occupations Code § 1101.155.",
    choices: [
      "It is wrong: subsection (a) permits the Commission to adopt rules requiring license holders to use forms prepared by the Broker-Lawyer Committee and adopted by the Commission, but subsection (b) provides that the Commission may not prohibit a license holder from using a contract form prepared by the property owner, or prepared by an attorney and required by the property owner.",
      "It is right: once the Commission has adopted a form for a type of transaction, § 1101.155(a) makes its use mandatory in every transaction of that type without exception.",
      "It is right unless the owner's attorney is licensed in Texas and files the form with the Commission before it is used.",
      "It is wrong, but only because the owner is a party; a license holder could not accept an attorney-prepared form supplied by the other side's counsel.",
    ],
    rationale: "Section 1101.155(b) states the limit expressly: the Commission may not prohibit a license holder from using a contract form prepared by the property owner, or prepared by an attorney and required by the property owner — and § 1101.654(b) confirms the point from the unauthorized-practice side by protecting completion of exactly those forms. The fourth choice is the near-miss because it reaches the right answer and then invents a party-based restriction the subsection does not contain; the operative fact is that the owner requires the form.",
    teaches: "module-06.md#unit-subchapter-a---general-provisions",
    source: "Texas Occupations Code § 1101.155(a), (b), (c); § 1101.654(b)",
  }),

  item("PRINS2-F075", {
    topic: "T06", unit: "T06U2",
    prompt: "Two matters arrive at the Commission: an unsigned letter alleging that a named license holder mishandled escrow money, and a signed written complaint about an incident that occurred four years and two months ago. Under Occupations Code § 1101.204, what happens to each?",
    choices: [
      "Neither is investigated: an investigation may not be initiated on the basis of an anonymous complaint, and the Commission may not investigate a complaint submitted later than the fourth anniversary of the date of the incident.",
      "Both are investigated, because escrow mishandling is a priority category and the four-year period runs from discovery rather than from the incident.",
      "The anonymous letter is investigated because the allegation is specific, and the four-year-old complaint is dismissed as untimely.",
      "Neither is investigated, because the Commission may act only on a complaint filed by a consumer who was a party to the transaction.",
    ],
    rationale: "Section 1101.204(f) bars initiating an investigation on the basis of an anonymous complaint, and § 1101.204(c) bars investigating a complaint submitted later than the fourth anniversary of the date of the incident. The fourth choice is the near-miss because it reaches the same result on a rule that does not exist: § 1101.204(b) requires investigation where a person submits a signed written complaint providing reasonable cause, and § 1101.204(h) gives consumer complaints priority on a risk-based approach, but nothing limits complaints to parties to the transaction.",
    teaches: "module-06.md#unit-subchapter-a---general-provisions",
    source: "Texas Occupations Code § 1101.204(b), (c), (f), (h), (i)",
  }),

  item("PRINS2-F076", {
    topic: "T06", unit: "T06U2",
    prompt: "A Texas license holder is the subject of an open TREC investigation and asks whether the file is public. Under Occupations Code § 1101.2051, what is the answer?",
    choices: [
      "While the matter is live the investigation material is confidential, with exceptions including the respondent, expert witnesses, other licensing jurisdictions, law enforcement and the State Office of Administrative Hearings, and the Commission must protect the complainant's identity to the extent possible — but on the dismissal or final resolution of the complaint, investigation or audit the material becomes subject to disclosure.",
      "The file is public from the moment a complaint is filed, because the Commission is a state agency subject to public information law without exception.",
      "The file is confidential permanently, because disclosure would discourage consumers from complaining.",
      "The file is confidential until the Commission issues a charge, and public thereafter regardless of the outcome.",
    ],
    rationale: "Section 1101.2051 makes investigation material confidential while a matter is live, lists the exceptions, requires protection of the complainant's identity to the extent possible in subsection (d-1), and then flips the default in subsection (e): on dismissal or final resolution the material becomes subject to disclosure. The fourth choice is the near-miss because it picks the wrong trigger — the default flips on resolution, not on the issuance of a charge, and the practical lesson is that a resolved disciplinary matter is public.",
    teaches: "module-06.md#unit-subchapter-a---general-provisions",
    source: "Texas Occupations Code § 1101.2051(d-1), (e)",
  }),

  item("PRINS2-F077", {
    topic: "T06", unit: "T06U2",
    prompt: "Under Occupations Code subchapter O, what is the ceiling on an administrative penalty, how may it interact with a suspension or revocation proceeding, and where does the money go?",
    choices: [
      "The amount may not exceed $5,000 for each violation, and each day a violation continues or occurs may be considered a separate violation for purposes of imposing a penalty; the Commission may combine a penalty proceeding with a suspension or revocation proceeding; and an administrative penalty collected under subchapter O is deposited to the credit of the real estate recovery trust account.",
      "The amount may not exceed $5,000 for each violation, but a continuing violation is a single violation however long it lasts; the penalty and a suspension are alternatives; and the money goes to the general revenue fund.",
      "The amount may not exceed $25,000 for each violation and is set by the administrative law judge rather than the Commission.",
      "There is no statutory ceiling; the executive director sets the amount by weighing the seriousness of the violation and the amount necessary to deter a future violation.",
    ],
    rationale: "Section 1101.702(a) caps the penalty at $5,000 for each violation and permits each day a violation continues or occurs to be considered a separate violation for purposes of imposing a penalty; § 1101.701(c) permits combining the penalty proceeding with a suspension or revocation proceeding; and § 1101.603(c) directs administrative penalties collected under subchapter O to the trust account. The fourth choice is the near-miss because the executive director does weigh seriousness, prior violations, the amount necessary to deter, efforts to correct and any other matter justice may require under § 1101.702(b) — but those factors operate inside the statutory ceiling, not instead of one.",
    teaches: "module-06.md#unit-subchapter-a---general-provisions",
    source: "Texas Occupations Code § 1101.701(a), (c); § 1101.702(a), (b); § 1101.603(c)",
  }),

  item("PRINS2-F078", {
    topic: "T06", unit: "T06U2",
    prompt: "An unlicensed person in Texas is paid $12,000 for acting as a broker in a transaction, and afterwards sues the client for a further $6,000 he says he is owed. What does subchapter P, with § 1101.806, produce? (Illustrative figures.)",
    choices: [
      "He is liable to the state for a civil penalty of not less than the amount of money received and not more than three times that amount, and liable to the aggrieved person on the same measure; a wilful violation is a Class A misdemeanor; and he may not maintain the action for the additional $6,000, because he cannot allege and prove that he was a license holder when the act was commenced or an attorney licensed in any state.",
      "He is liable to the state for a civil penalty capped at $5,000 per violation, may keep what he was paid, and may maintain the action because the client accepted the benefit of his services.",
      "He is liable to the aggrieved person only; the state's civil penalty applies to a license holder who aids an unlicensed person rather than to the unlicensed person, and the suit for the balance may proceed.",
      "He faces a Class A misdemeanor and nothing else, because the civil penalty provisions apply only where the Commission has first issued a cease and desist order.",
    ],
    rationale: "Section 1101.753(a) makes an unlicensed person who receives compensation for acting as a broker or sales agent liable to the state for a civil penalty of not less than the amount received and not more than three times it, § 1101.754 gives the aggrieved person the same measure, § 1101.758 makes acting without a license a Class A misdemeanor, and § 1101.806(b) bars the action for compensation. The second choice is the near-miss because it borrows the $5,000 administrative-penalty ceiling from subchapter O, which reaches a person who violates the chapter or a Commission rule and is a different tool from the subchapter P civil penalty measured by the money received.",
    teaches: "module-06.md#unit-subchapter-a---general-provisions",
    source: "Texas Occupations Code § 1101.753(a); § 1101.754(a); § 1101.756; § 1101.758; § 1101.759; § 1101.806(b)",
  }),

  item("PRINS2-F079", {
    topic: "T06", unit: "T06U2",
    prompt: "The Commission pays a claim from the real estate recovery trust account on a judgment against a Texas license holder. What must the license holder do, and what happens if he does not?",
    choices: [
      "He must repay the account in full; if he does not do so before the 31st day after the date the Commission provides notice, the Commission shall revoke the license, and he is ineligible for any license until he has repaid in full the amount paid from the account for him, plus interest at the legal rate.",
      "He must repay the account within one year; failure to do so permits but does not require the Commission to revoke, and eligibility for a new license is restored two years after revocation regardless of repayment.",
      "He owes nothing to the account, because the Commission is subrogated to the judgment creditor's rights and must collect from the judgment rather than from the license holder.",
      "He must repay the account before his next renewal; failure to do so bars renewal but does not affect the current license or a later original application.",
    ],
    rationale: "Section 1101.655(a) makes revocation mandatory — 'shall revoke' — if the license holder does not repay the account in full before the 31st day after the Commission provides notice, and subsection (c) bars eligibility for any license until the amount is repaid with interest at the legal rate. The third choice is the near-miss because § 1101.612 does subrogate the Commission to the judgment creditor's rights; subrogation is an additional collection route, not a substitute for the license holder's own repayment obligation.",
    teaches: "module-06.md#unit-subchapter-a---general-provisions",
    source: "Texas Occupations Code § 1101.655(a), (c); § 1101.612; § 1101.610",
  }),

  item("PRINS2-F080", {
    topic: "T06", unit: "T06U2",
    prompt: "Under Occupations Code subchapter G, what does the Commission require of an educational institution that is not an accredited college or university, and what performance measure attaches to a qualifying program's renewal?",
    choices: [
      "The institution must maintain a corporate surety bond or other security acceptable to the Commission of $20,000 for the benefit of a party damaged by the institution's failure; and rules must set an examination passage rate benchmark for each license category, based on the average percentage of examinees that pass the licensing exam on the first attempt, which a program must meet or exceed before renewal, with probationary renewal available.",
      "The institution must maintain a $50,000 surety bond, and a program must show that a majority of its students pass the licensing examination within one year of completion.",
      "No bond is required of a qualifying course provider; the passage rate benchmark is a fixed statutory percentage that a program must exceed before renewal.",
      "The institution must maintain a $20,000 surety bond, and the passage rate benchmark is set by each provider in its own application and approved by the Commission.",
    ],
    rationale: "Section 1101.302 requires the $20,000 corporate surety bond or other acceptable security from an educational institution other than an accredited college or university, and § 1101.301(c) requires rules setting a passage rate benchmark for each license category based on the average percentage of examinees passing on the first attempt, which a program must meet or exceed before renewal, with probationary renewal available under subsection (e) and passage-rate data published on the Commission's website under § 1101.304. The third choice is the near-miss because the benchmark is not a fixed statutory percentage — it is derived from the average first-attempt pass rate, and no source read for this course states a licensing examination passing score at all.",
    teaches: "module-06.md#unit-subchapter-a---general-provisions",
    source: "Texas Occupations Code § 1101.301(a), (c), (e); § 1101.302; § 1101.304",
  }),

  item("PRINS2-F081", {
    topic: "T06", unit: "T06U3",
    prompt: "A Texas license holder supplies sales price and terms information to a nonprofit real estate board to help other members list, sell, lease, finance and appraise property. A party later complains that the disclosure harmed him. What does Occupations Code § 1101.804 provide, and what does it not do?",
    choices: [
      "A license holder or a nonprofit real estate board or association that provides such information for those purposes is not liable to another person for providing it, unless the disclosure of that information is specifically prohibited by statute — and the section neither requires anyone to join such a body, nor regulates its governance, nor delegates any state authority to it.",
      "The section makes the license holder absolutely immune for any information supplied to a board or association, including information a statute forbids disclosing.",
      "The section immunizes the board or association but not the individual license holder, whose exposure is governed by § 1101.652(b)(23) instead.",
      "The section requires a license holder to supply sales data to the nonprofit board serving the license holder's market area, and immunizes the required disclosure.",
    ],
    rationale: "Section 1101.804 is a liability shield for data sharing that acknowledges such boards and associations exist, and its limiting clause is part of the rule: the protection does not extend to a disclosure specifically prohibited by statute. The second choice is the near-miss because it drops that clause. Nothing in the section requires membership in anything: Texas law creates one credential relevant to brokerage — the license issued under chapter 1101 — and nothing in the chapter conditions that status on joining a private association.",
    teaches: "module-06.md#unit-professional-organizations",
    source: "Texas Occupations Code § 1101.804; § 1101.002(4)",
  }),

  item("PRINS2-F082", {
    topic: "T06", unit: "T06U3",
    prompt: "Occupations Code § 1101.053 defines a 'Texas trade association' and then uses the definition for a particular purpose. What is the definition, and what is it used to do?",
    choices: [
      "A cooperative and voluntarily joined statewide association of business or professional competitors in this state designed to assist its members and its industry or profession in dealing with mutual business or professional problems and in promoting their common interest — used to bar an officer, employee or paid consultant of such an association, and the spouses of association officers, managers and paid consultants, from serving on the Commission or in its executive-level positions.",
      "A statewide association whose members hold Texas real estate licenses — used to authorize the Commission to delegate ethics enforcement to it.",
      "A cooperative and voluntarily joined statewide association of business or professional competitors — used to require the Commission to consult it before adopting a rule affecting license holders.",
      "Any organization that operates a multiple listing service in this state — used to subject that service to the Commission's rulemaking authority over advertising.",
    ],
    rationale: "The definition in § 1101.053(a) is the statute's own, and the operative use is a wall between the private association and the public regulator: association officers, employees and paid consultants, and the spouses of officers, managers and paid consultants, may not serve as members or in executive-level positions. The words 'voluntarily joined' in the Legislature's own definition are the cleanest textual demonstration that trade association membership is voluntary. The second choice is the near-miss and inverts the point — an association's ethics procedure is a private process that cannot suspend or revoke a state license, and no state authority is delegated to it.",
    teaches: "module-06.md#unit-professional-organizations",
    source: "Texas Occupations Code § 1101.053(a); § 1101.801",
  }),

  item("PRINS2-F083", {
    topic: "T06", unit: "T06U4",
    prompt: "A Texas sales agent moves to a new brokerage. A commission she earned while sponsored by her former broker has now been collected at closing. Under Occupations Code § 1101.651, who may pay her, and through whom must she pay anyone else?",
    choices: [
      "The former sponsoring broker may pay her, because subsection (b) permits a sales agent to accept compensation for a real estate transaction from the broker that is sponsoring her or was sponsoring her when she earned the compensation; and under subsection (c) she may not pay a commission to a person except through the broker sponsoring her at that time.",
      "Only her current sponsoring broker may pay her, because subsection (b) permits a sales agent to accept compensation only from the broker sponsoring her at the time of payment.",
      "Her new sponsoring broker must first collect the money from the former broker and then pass it through, because a sales agent may be paid only by the broker sponsoring her at the moment of payment.",
      "The seller may pay her directly with the former broker's written consent, because subsection (b) restricts only payments from other license holders.",
    ],
    rationale: "Section 1101.651(b) contains two halves, and the second is the one agents forget: a sales agent may accept compensation from the broker that is sponsoring her OR was sponsoring her when the compensation was earned. Section 1101.651(c) then requires any commission she pays to move through the broker sponsoring her at that time. The second choice is the near-miss because it reads only the first half. The third choice invents a pass-through requirement the section does not impose, and the fourth breaks the closed loop the section creates: a seller cannot hand money to a sponsored sales agent, with or without anyone's consent.",
    teaches: "module-06.md#unit-real-estate---the-business-of-value",
    source: "Texas Occupations Code § 1101.651(a), (b), (c); § 1101.652(b)(11)",
  }),

  item("PRINS2-F084", {
    topic: "T06", unit: "T06U4",
    prompt: "A Texas license holder tells an investor that a property 'will be worth eighty thousand more in three years, guaranteed,' and separately encourages a seller under an existing contract to terminate it and sign a new one with a different buyer the license holder represents. Which grounds for discipline are implicated?",
    choices: [
      "Section 1101.652(b)(17), guaranteeing that future profits will result from a resale of real property, and § 1101.652(b)(21), inducing a party to break a contract for the purpose of substituting a new contract.",
      "Section 1101.652(b)(3), material misrepresentation to a potential buyer concerning a known significant defect, and § 1101.652(b)(22), negotiating with a person known to be under another broker's exclusive written agreement.",
      "Section 1101.652(b)(15), selling by means of a deceptive practice, and § 1101.652(b)(14), selling by means of a lottery.",
      "Neither — a prediction about future value is opinion, and a party is always free to terminate a contract, so neither statement is a ground for discipline.",
    ],
    rationale: "Subsection (b)(17) reaches guaranteeing that future profits will result from a resale, and (b)(21) reaches inducing a party to break a contract for the purpose of substituting a new one; both are aimed exactly where the money pressure in a lumpy commission business points. The fourth choice is the near-miss and states the everyday intuition the statute overrides — a forward-looking guarantee is not sheltered as opinion when the statute names guaranteeing future resale profits as a ground, and a party's freedom to terminate does not license the license holder to induce it.",
    teaches: "module-06.md#unit-real-estate---the-business-of-value",
    source: "Texas Occupations Code § 1101.652(b)(17), (b)(21); see also § 1101.652(b)(5)",
  }),

  item("PRINS2-F085", {
    topic: "T06", unit: "T06U5",
    prompt: "For a fee, an unlicensed Texas consultant advises a distressed owner on negotiating the completion of a short sale with the lienholder, and separately markets a lease-to-purchase option on a second owner's house. Are either of those acts inside the affirmative scope of what a Texas real estate license authorizes?",
    choices: [
      "Both are — § 1101.002(1)(A) lists among the acts of a broker dealing in options, including a lease to purchase, and advising an owner concerning the negotiation or completion of a short sale, so performing either for another person for compensation or with the expectation of compensation is brokerage and requires a license.",
      "Neither is — a short sale is a negotiation with a lienholder rather than with a buyer, and an option is a contract right rather than an interest in real property, so both fall outside the broker definition.",
      "Only the option work is — advising an owner about a short sale is financial counselling, which the Act reaches only when performed by a license holder.",
      "Only the short sale advice is — an option is expressly excluded from 'real estate' by § 1101.002(5), which excludes an interest given as security for the performance of an obligation.",
    ],
    rationale: "The broker definition is a list of acts, and both of these are on it: dealing in options, including a lease to purchase, and advising an owner concerning the negotiation or completion of a short sale. The fourth choice is the near-miss because § 1101.002(5) does contain an exclusion — an interest given as security for the performance of an obligation — but an option to purchase is not security for an obligation, and § 1101.0045 confirms the Act's engagement with options by permitting a person to acquire and assign an option or an interest in a contract to purchase without a license only where the person does not use it to engage in real estate brokerage and discloses the nature of the equitable interest in writing to any seller or potential buyer.",
    teaches: "module-06.md#unit-the-purpose-of-licensing-laws---what-a-license-holder-can-and-cannot-do",
    source: "Texas Occupations Code § 1101.002(1)(A), (5); § 1101.0045(a), (b); § 1101.351(a)",
  }),

  item("PRINS2-F086", {
    topic: "T06", unit: "T06U5",
    prompt: "An unlicensed Texas man has not handled a single transaction, but his public profile headline and his email signature both describe him as a real estate agent and invite inquiries. Has he violated Occupations Code § 1101.351?",
    choices: [
      "Yes — subsection (a) contains two verbs: unless a person holds a license, the person may not act as OR represent that the person is a broker or sales agent, so holding out is itself the violation even if he never touches a transaction.",
      "No — the section is violated only when the person performs one of the acts listed in § 1101.002(1) for another person for compensation.",
      "No — a description of oneself is advertising, and § 1101.156 limits the Commission's authority over advertising to false, misleading or deceptive practices.",
      "Yes, but only if a consumer relied on the description to the consumer's detriment, since the statute protects the public rather than the profession.",
    ],
    rationale: "Section 1101.351(a) prohibits both acting as and representing that the person is a broker or sales agent; telling people you are an agent when you are not is itself the violation. Subsection (a-1) applies the same rule to business entities and subsection (b) forbids an applicant from acting before the license issues. The fourth choice is the near-miss because it adds a reliance element the statute does not contain — the prohibition is on the representation, not on its effect.",
    teaches: "module-06.md#unit-the-purpose-of-licensing-laws---what-a-license-holder-can-and-cannot-do",
    source: "Texas Occupations Code § 1101.351(a), (a-1), (b); § 1101.758",
  }),

  item("PRINS2-F087", {
    topic: "T06", unit: "T06U5",
    prompt: "A Texas brokerage engages an unlicensed 'transaction consultant' as an independent contractor to negotiate repair amendments directly with the other side on the brokerage's listings, for a per-file fee. Which grounds does that arrangement implicate for the license holders involved?",
    choices: [
      "Section 1101.652(b)(26), establishing an association by employment or otherwise with a person other than a license holder if the person is expected or required to act as a license holder, and § 1101.652(b)(27), aiding or abetting another person to circumvent the chapter; § 1101.651(a) separately bars compensating an unlicensed person for performing an act of a broker.",
      "Section 1101.652(b)(12), failing to specify a definite termination date in a service contract, and § 1101.652(b)(24), rendering a materially inaccurate statement of account.",
      "No ground — negotiating a repair amendment is administrative support rather than an act of a broker, so an unlicensed contractor may perform it.",
      "Section 1101.652(b)(11) only, since dividing a fee with an unlicensed person is the sole exposure and the association itself is lawful.",
    ],
    rationale: "Negotiating or attempting to negotiate is a listed act under § 1101.002(1)(A)(iii), so the arrangement puts an unlicensed person into licensed work; (b)(26) reaches the association itself, (b)(27) reaches aiding or abetting circumvention, § 1101.651(a) bars the compensation, and (b)(11) independently reaches paying or dividing a fee with a non-license holder. The fourth choice is the near-miss because it identifies one real exposure and treats it as the only one, which is exactly the misreading that lets a brokerage think restructuring the payment fixes the arrangement.",
    teaches: "module-06.md#unit-the-purpose-of-licensing-laws---what-a-license-holder-can-and-cannot-do",
    source: "Texas Occupations Code § 1101.652(b)(11), (b)(26), (b)(27); § 1101.651(a); § 1101.002(1)(A)(iii)",
  }),

  item("PRINS2-F088", {
    topic: "T06", unit: "T06U6",
    prompt: "A Texas applicant has satisfied the education and examination requirements and the Commission issues her a sales agent license. She has not yet found a brokerage. A neighbour asks her to list his house this weekend. What is her position?",
    choices: [
      "She is licensed but may not practice: § 1101.363(b) permits an inactive sales agent license but provides that the person may not act as a sales agent unless sponsored by a licensed broker who has notified the Commission, and § 1101.351(c) forbids a sales agent to engage or attempt to engage in brokerage without a sponsoring broker to act for; active status returns under § 1101.367(b) when a licensed broker files a request assuming sponsorship with the appropriate fee.",
      "She may take the listing and assign it to a broker when she finds one, because the license itself authorizes the act and sponsorship is an administrative formality.",
      "She may take the listing if she does not accept compensation until she is sponsored, because the prohibition attaches to receiving a commission rather than to performing the act.",
      "She is not licensed at all until a broker sponsors her, because an inactive license is an application rather than a license.",
    ],
    rationale: "Sponsorship is written into what a sales agent credential is: § 1101.002(7) defines a sales agent as a person sponsored by a licensed broker for the purpose of performing an act of a broker, § 1101.363(b) permits the inactive license while barring the practice, and § 1101.351(c) states the prohibition operatively. The third choice is the near-miss because it moves the trigger to payment; § 1101.351(c) forbids engaging or ATTEMPTING to engage in brokerage, and the broker's liability under § 1101.803 is the reason the state will not let a sales agent operate outside a broker's supervision.",
    teaches: "module-06.md#unit-the-texas-real-estate-commission--licensing-requirements",
    source: "Texas Occupations Code § 1101.363(b); § 1101.351(c); § 1101.367(a), (b); § 1101.002(7); § 1101.803",
  }),

  item("PRINS2-F089", {
    topic: "T06", unit: "T06U6",
    prompt: "A prospective Texas applicant has a criminal history and does not want to spend money on coursework she may not be able to use. What does the Act make available to her, and what does it require of every applicant?",
    choices: [
      "She may request a determination of fitness before applying and pay the required fee, and the Commission must determine and notify her; every applicant must disclose a guilty or nolo contendere plea to a felony or a felony conviction where the appeal time has elapsed — required even if an order granted community supervision suspending imposition of the sentence — and must submit a complete and legible set of fingerprints for criminal history record information from the Texas Department of Public Safety and the FBI, with the Commission required to refuse to issue or renew an active license for a person who does not comply.",
      "She may request an advisory opinion from the Commission's general counsel, which is confidential and non-binding; disclosure of a conviction is required only where the sentence was actually imposed.",
      "She must complete the coursework first, because a fitness determination is available only to a person who has satisfied the education requirement; fingerprints are required only of broker applicants.",
      "She may request a determination of fitness at any time, and a favourable determination binds the Commission at renewal as well as at original application, so no later disclosure is required.",
    ],
    rationale: "Section 1101.353 lets a person request a determination of fitness BEFORE applying and pay the required fee, with the Commission's determination and notice to follow; § 1101.352(b)-(c) requires disclosure of a felony plea or conviction even where community supervision suspended imposition of the sentence; and § 1101.3521 requires fingerprints and directs the Commission to refuse to issue or renew an active license for non-compliance. The fourth choice is the near-miss because it treats a fitness determination as permanent: §§ 1101.452 and 1101.4521 attach the felony disclosure and the criminal history check to every renewal.",
    teaches: "module-06.md#unit-the-texas-real-estate-commission--licensing-requirements",
    source: "Texas Occupations Code § 1101.353; § 1101.352(b), (c); § 1101.3521(a), (b); § 1101.452(b); § 1101.4521; § 1101.365",
  }),

  /* ══ T07 Real Estate Brokerage and Law of Agency — 195 prescribed minutes ═════════════════ */

  item("PRINS2-F090", {
    topic: "T07", unit: "T07U1",
    prompt: "A Texas seller conceals from everyone that the septic system has failed. The listing agent repeats the seller's written statement that the system is sound, not knowing it is false, and the buyer sues the agent. What does Occupations Code § 1101.805 provide?",
    choices: [
      "A license holder is not liable for a misrepresentation or concealment of a material fact made by a party unless the license holder knew of the falsity and failed to disclose the license holder's knowledge of the falsity; the section prevails over any other law, including common law, and it preserves the broker's responsibility under § 1101.803 for a sponsored sales agent.",
      "A license holder is strictly liable for repeating a party's statement, because the license holder is the party's agent and the agent's words bind the principal.",
      "A license holder is not liable for a party's misrepresentation in any circumstance, because the party is the source of the statement and the license holder is a conduit.",
      "A license holder is not liable unless the license holder failed to verify the statement independently, because reasonable care requires verification of any statement about a system's condition.",
    ],
    rationale: "Section 1101.805(e) protects a license holder from liability for a party's misrepresentation or concealment unless the license holder knew of the falsity AND failed to disclose that knowledge — knowledge plus silence is what destroys the protection; subsection (b) makes the section prevail over any other law including common law, and subsection (c) preserves the broker's § 1101.803 responsibility. The third choice is the near-miss because it drops the knowledge-plus-silence exception; the fourth invents a verification duty the section does not contain, though § 1101.652(b)(1) independently reaches acting negligently or incompetently.",
    teaches: "module-07.md#unit-the-law-of-agency",
    source: "Texas Occupations Code § 1101.805(b)-(e); § 1101.803",
  }),

  item("PRINS2-F091", {
    topic: "T07", unit: "T07U1",
    prompt: "A Texas license holder holds authority to bind an owner to a lease under a property management agreement and signs a lease on the owner's behalf. What does Occupations Code § 1101.557(c)(1) do to the license holder's status?",
    choices: [
      "The license holder is also a party to the lease or sale, rather than merely the owner's agent in it.",
      "The license holder becomes the landlord for all purposes of Property Code chapter 92, and the owner's duties transfer to the license holder.",
      "The license holder's agency ends on execution, because a person cannot be both agent and signatory.",
      "The license holder must obtain the Commission's written approval of the power before signing, since binding authority exceeds the scope of a license.",
    ],
    rationale: "Section 1101.557(c)(1) provides that a license holder with authority to bind a party to a lease or sale under a power of attorney or a property management agreement is also a party to the lease or sale — a manager with signing authority is not a bystander to the lease. The second choice is the near-miss and confuses two statutes: Property Code § 92.001(2) makes a manager or agent the 'landlord' for chapter 92 purposes only where the manager or agent purports to be the owner, lessor or sublessor in the lease, which is a different question from § 1101.557(c)(1)'s party status.",
    teaches: "module-07.md#unit-the-law-of-agency",
    source: "Texas Occupations Code § 1101.557(c)(1); § 1101.551(2); Texas Property Code § 92.001(2)",
  }),

  item("PRINS2-F092", {
    topic: "T07", unit: "T07U1",
    prompt: "Over three weeks a Texas license holder who represents no one in writing advises a prospective buyer on what to offer, counsels her on negotiating strategy, and argues her position to the seller. Nothing is signed. What is the risk, and where does Chapter 1101 reach it?",
    choices: [
      "Implied agency — an agency arising from conduct rather than words, where the buyer reasonably understands the license holder to be working for her — and § 1101.652(b)(7) makes it a ground for discipline that a license holder fails to make clear to all parties to a real estate transaction the party for whom the license holder is acting.",
      "No risk — Chapter 1101 enumerates the ways an agency may be created, and an unsigned understanding is not among them.",
      "Ratification — the buyer has accepted the benefit of unauthorized acts, which retroactively creates the agency and cures any disclosure failure.",
      "Agency by estoppel — the license holder's own conduct led the buyer to believe an agency existed, and estoppel is a Chapter 1101 doctrine that supplies the buyer's remedy.",
    ],
    rationale: "Implied agency arises from conduct: the license holder advises on price, counsels on strategy, behaves as the buyer's advocate, and the buyer reasonably understands the license holder to be working for her, though nobody signed anything — and § 1101.652(b)(7) punishes the failure to make the representation clear. The fourth choice is the near-miss because estoppel is a real doctrine, but it turns on the PRINCIPAL's conduct leading a third person to believe someone is the principal's agent, and module-07 identifies ratification and estoppel as judicial doctrines rather than Chapter 1101 rules. Section 1101.563, effective January 1, 2026, is built to prevent this drift on the residential buyer side.",
    teaches: "module-07.md#unit-the-law-of-agency",
    source: "Texas Occupations Code § 1101.652(b)(7); § 1101.557(a); § 1101.563; the four routes to agency are common-law concepts that module-07 states are not enumerated in Chapter 1101.",
  }),

  item("PRINS2-F093", {
    topic: "T07", unit: "T07U2",
    prompt: "Occupations Code § 1101.558 carries two obligations that license holders routinely merge. What are they, and how do their triggers and forms differ?",
    choices: [
      "Subsection (b) is the representation disclosure: a license holder who represents a party shall disclose that representation orally or in writing at the time of first contact with another party or another party's license holder. Subsection (b-1) is the written notice: at the time of first substantive communication with a party relating to a proposed transaction regarding specific real property, written notice in at least a 10-point font describing how a broker can represent a party including as an intermediary, the duties owed to a represented party, the obligations owed to an unrepresented one, and identifying information for the license holder and the license holder's supervisor and broker.",
      "Subsection (b) requires the written notice at first contact, and subsection (b-1) requires an oral confirmation of representation at the first substantive communication.",
      "Both require written delivery; the difference is only that subsection (b) runs to another license holder and subsection (b-1) runs to a party.",
      "Subsection (b) applies to residential transactions and subsection (b-1) to commercial ones, which is why the notice is required in one and not the other.",
    ],
    rationale: "The representation disclosure under (b) may be oral and is triggered by first contact with another party or another party's license holder; the written notice under (b-1) is triggered by first substantive communication with a party about specific real property, must be at least 10-point font, and must carry the four described contents. The second choice is the near-miss and transposes the two forms exactly. Section 1101.558(c) then excuses the (b-1) notice for a residential lease of less than one year where a sale is not contemplated, for a meeting with a party known to be represented, and for a communication at an open house about that property.",
    teaches: "module-07.md#unit-agency-positions-and-disclosure",
    source: "Texas Occupations Code § 1101.558(b), (b-1), (b-2), (c)",
  }),

  item("PRINS2-F094", {
    topic: "T07", unit: "T07U2",
    prompt: "A license holder trained in another state tells a Texas client that the brokerage can act as 'dual agent' for both sides. Correct the description using Occupations Code subchapter L.",
    choices: [
      "Texas does not use that arrangement: § 1101.551(1) defines an intermediary as a broker who is employed to negotiate a transaction between the parties and for that purpose may act as an agent of the parties — one broker in a statutorily constrained middle position rather than two full agents owing each side the complete set of fiduciary duties; § 1101.559(c) requires the intermediary to act fairly and impartially, and § 1101.561(a) provides that the intermediary duties supersede the duties of a license holder established under any other law, including common law.",
      "The description is accurate, because an intermediary is simply the Texas name for a dual agent and the duties owed are the same set owed in single agency to each party at once.",
      "The description is accurate for a commercial transaction and inaccurate for a residential one, because § 1101.561 applies only to residential real property as defined by § 1101.563(a).",
      "The description is inaccurate because Texas forbids a broker to represent both parties in any circumstance; a broker holding both sides must withdraw from one of them.",
    ],
    rationale: "The intermediary is not two agents. It is one broker in a defined middle position with statutory constraints — written consent from each party stating the source of any expected compensation, fair and impartial conduct, optional appointments under § 1101.560, and the five prohibitions of § 1101.651(d). The fourth choice is the near-miss because it correctly rejects dual agency and then overshoots: § 1101.561(b) provides that a broker MUST agree to act as an intermediary if the broker agrees to represent both a buyer or tenant and a seller or landlord, so withdrawal is not the answer the statute gives.",
    teaches: "module-07.md#unit-agency-positions-and-disclosure",
    source: "Texas Occupations Code § 1101.551(1); § 1101.559(a), (c); § 1101.560(a)-(c); § 1101.561(a), (b); § 1101.651(d)",
  }),

  item("PRINS2-F095", {
    topic: "T07", unit: "T07U3",
    prompt: "A Texas limited liability company wants to hold listings and receive commissions as a broker. Its designated broker will own none of the company. Under Occupations Code § 1101.355, what must the entity establish?",
    choices: [
      "It must designate one of its managing officers as its broker for purposes of the chapter, and — because the designated broker owns less than 10 percent of the entity — must provide proof that it maintains errors and omissions insurance with a minimum annual limit of $1 million for each occurrence; the entity may not act as a broker unless the designated broker is a licensed individual broker in active status and good standing.",
      "It must designate a managing officer as its broker and provide proof of a $20,000 surety bond, which substitutes for errors and omissions insurance where the designated broker holds no ownership.",
      "It must designate a managing officer as its broker; errors and omissions insurance is required only where the designated broker owns more than 10 percent of the entity.",
      "It need only register with the Commission as a compensation-receiving entity, because an entity that holds listings through its sponsored agents is not itself acting as a broker.",
    ],
    rationale: "Section 1101.355(a) requires the designation of a managing officer as the entity's broker and requires proof of errors and omissions insurance with a minimum annual limit of $1 million for each occurrence if the designated broker owns less than 10 percent of the entity; subsection (b) bars the entity from acting as a broker unless its designated broker is a licensed individual broker in active status and good standing. The third choice is the near-miss and inverts the ownership trigger — the insurance is required where the designated broker's stake is small, precisely because there is then less of the broker's own capital behind the entity. The fourth choice misdescribes the narrow § 1101.355(d)-(e) registration alternative, which is available only to an entity that receives compensation and performs no other acts of a broker.",
    teaches: "module-07.md#unit-brokerage--nature-of-the-brokerage-business",
    source: "Texas Occupations Code § 1101.355(a), (b), (b-1), (c), (d), (e); § 1101.351(a-1)",
  }),

  item("PRINS2-F096", {
    topic: "T07", unit: "T07U3",
    prompt: "A group of sponsored Texas sales agents markets under a team name and wants to run advertising using only that team name and a phone number. Under Occupations Code § 1101.652(b)(23), what is wrong?",
    choices: [
      "The advertising fails to include the name of the broker for whom the license holder acts — which may be the licensed name, assumed name or trade name of the broker as authorized by Texas law and registered with the Commission — and advertising that implies a sales agent is responsible for the operation of the broker's real estate brokerage business is separately a ground for discipline.",
      "Nothing is wrong, because a team name registered with the Commission substitutes for the broker's name in advertising.",
      "The advertising must include each team member's individual license number, which is the item the subdivision requires.",
      "Nothing is wrong under Chapter 1101, because § 1101.156 forbids the Commission to restrict advertising except to prohibit a false, misleading or deceptive practice, and a team name is not deceptive.",
    ],
    rationale: "Subparagraph (D) requires the broker's name and subparagraph (C) forbids advertising that implies a sales agent is responsible for the operation of the brokerage — together they are the statutory basis for how Texas treats team names. The fourth choice is the near-miss because § 1101.156 does restrict the Commission's rulemaking over advertising; what it limits is the Commission's rule-writing, not the statutory disciplinary grounds in § 1101.652(b)(23), which operate on their own terms. Module-07 also notes that the registration requirements for assumed, alternate and team names live in Commission rules that were not among the sources read for this course.",
    teaches: "module-07.md#unit-brokerage--nature-of-the-brokerage-business",
    source: "Texas Occupations Code § 1101.652(b)(23)(A)-(D); § 1101.156",
  }),

  item("PRINS2-F097", {
    topic: "T07", unit: "T07U3",
    prompt: "A Texas resident broker moves his brokerage to a new address, and a broker licensed in another state who has no Texas premises begins cooperating on Texas transactions. What does Occupations Code § 1101.552 require of each?",
    choices: [
      "The resident broker must maintain a fixed office in this state, designated on the broker's license, and must file an application designating the new location not later than the tenth day after moving; the nonresident licensed broker is excused from maintaining a place of business in Texas. Every license holder must keep current contact information on file with the Commission.",
      "Both must maintain a fixed office in Texas, because the section makes a Texas office a condition of performing any brokerage act in this state.",
      "The resident broker must notify the Commission at his next renewal rather than within a fixed period, and the nonresident broker must designate a Texas resident agent for service.",
      "Neither is required to maintain an office; § 1101.552 governs only the display of the license at the place of business.",
    ],
    rationale: "Section 1101.552(a) requires a resident broker to maintain a fixed office in Texas designated on the license, subsection (b) requires an application designating a new location not later than the tenth day after moving, subsection (d) excuses a nonresident licensed broker, and subsections (e) and (f) require every license holder to keep current contact information on file. Subsection (g) separately defines an 'associated broker' as a broker who associates with and is paid through another broker under a relationship intended to be continuous, including as an employee or ongoing independent contractor. The third choice is the near-miss because it substitutes a renewal-cycle notification for the section's ten-day deadline.",
    teaches: "module-07.md#unit-brokerage--nature-of-the-brokerage-business",
    source: "Texas Occupations Code § 1101.552(a), (b), (d), (e), (f), (g)",
  }),

  item("PRINS2-F098", {
    topic: "T07", unit: "T07U3",
    prompt: "A Texas buyer's broker knows the seller is under an exclusive written listing with another broker and wants to put an offer in front of the seller directly. Under Occupations Code § 1101.557(c)(3), when is that not a violation of § 1101.652(b)(22)?",
    choices: [
      "When the party's broker consents, a copy of the offer is sent to that broker unless a sealed-bid governmental process forbids it, and the license holder does nothing else that would violate § 1101.652(b)(22).",
      "When the offer is delivered in writing and the listing broker is copied afterwards, since notice cures the direct contact.",
      "When the listing broker has failed to respond to two prior offers, since the safe harbour exists to protect a seller from a broker who withholds offers.",
      "Never — § 1101.652(b)(22) is absolute, and an offer to a represented party must always pass through that party's broker.",
    ],
    rationale: "Section 1101.652(b)(22) makes it a ground for discipline to negotiate or attempt to negotiate with a person known to be a party to an outstanding written contract granting exclusive agency to another broker, and § 1101.557(c)(3) supplies a narrow safe harbour with three conditions: the party's broker consents, a copy goes to that broker unless a sealed-bid governmental process forbids it, and nothing else violating (b)(22) is done. The second choice is the near-miss because it drops the consent condition, which is the condition that does the work. Section 1101.557(b)(1) separately forbids instructing another broker to violate (b)(22).",
    teaches: "module-07.md#unit-brokerage--nature-of-the-brokerage-business",
    source: "Texas Occupations Code § 1101.557(b)(1), (c)(3); § 1101.652(b)(21), (b)(22)",
  }),

  item("PRINS2-F099", {
    topic: "T07", unit: "T07U3",
    prompt: "A Texas broker performed the work, the sale closed, and the seller now refuses to pay. The engagement was oral. What does Occupations Code § 1101.806 require before the broker can maintain a suit?",
    choices: [
      "The promise or agreement on which the action is based, or a memorandum of it, must be in writing and signed by the party against whom the action is brought or by a person that party authorized to sign; and the broker must also allege and prove that he was a license holder at the time the act was commenced, or an attorney licensed in any state.",
      "Only that the broker was licensed when the act was commenced; an oral agreement is enforceable in a commission action because the services were rendered and accepted.",
      "That the agreement be in writing and filed with the Commission before the services were performed, which is what makes the promise enforceable.",
      "That the broker sue within two years of closing; the writing requirement applies only to a claim against a cooperating broker.",
    ],
    rationale: "Section 1101.806(c) bars an action to recover a commission for the sale or purchase of real estate unless the promise or agreement, or a memorandum of it, is in writing and signed by the party against whom the action is brought or by that party's authorized signer; § 1101.806(b) adds the license-holder-at-the-time requirement, and subsection (a) carves out compensation-sharing agreements among license holders. The second choice is the near-miss because it satisfies one requirement and ignores the other, and the writing requirement is the one that defeats an oral engagement no matter how well the work was performed.",
    teaches: "module-07.md#unit-brokerage--nature-of-the-brokerage-business",
    source: "Texas Occupations Code § 1101.806(a), (b), (c)",
  }),

  item("PRINS2-F100", {
    topic: "T07", unit: "T07U4",
    prompt: "A buyer asks a Texas license holder whether anyone has ever died in the house and whether a former occupant had an HIV-related illness. What do Occupations Code §§ 1101.556 and 1101.802 provide?",
    choices: [
      "The license holder is not required to inquire about, disclose or release information relating to whether an occupant had or may have had AIDS, an HIV-related illness or an HIV infection as defined by the Centers for Disease Control and Prevention, or whether a death occurred on the property by natural causes, suicide or accident unrelated to the condition of the property; and a person is not civilly or criminally liable for failing to disclose the HIV and AIDS matters described.",
      "The license holder must disclose both on request, because a buyer's direct question converts any known fact into a material fact that must be answered truthfully.",
      "The license holder need not disclose the HIV or AIDS matters but must disclose any death on the property, because a death is a physical fact about the premises.",
      "The license holder must disclose both unless the seller instructs otherwise in writing, because the seller controls what may be released about the property's history.",
    ],
    rationale: "Section 1101.556 removes the duty to inquire about or disclose either category, and § 1101.802 removes civil and criminal liability for failing to disclose the HIV and AIDS matters. The third choice is the near-miss because it splits the two and keeps a duty for deaths — but the statutory carve-out expressly reaches a death by natural causes, suicide or accident UNRELATED to the condition of the property, and the qualifier matters: a death arising from a condition of the property is a different question, which runs back into the known-significant-defect provisions of § 1101.652(b)(3) and (4).",
    teaches: "module-07.md#unit-fiduciary-duties",
    source: "Texas Occupations Code § 1101.556; § 1101.802; see § 1101.652(b)(3), (b)(4)",
  }),

  item("PRINS2-F101", {
    topic: "T07", unit: "T07U4",
    prompt: "A Texas listing agent representing the seller knows of a latent structural defect the seller has not disclosed. A prospective buyer — who is a customer, not the agent's client — asks a general question about the house. What does Chapter 1101 require?",
    choices: [
      "Disclosure: § 1101.652(b)(3) reaches a material misrepresentation to a potential buyer concerning a significant defect, including a latent structural defect, known to the license holder that would be a significant factor to a reasonable and prudent buyer, and (b)(4) reaches failing to disclose such a known defect to a potential buyer — the duty runs to a potential buyer, so representing the seller does not license concealing a known significant defect from the person across the table.",
      "Silence: fiduciary loyalty runs to the seller, so the agent may not volunteer information that weakens the seller's position, and the buyer's remedy is an inspection.",
      "Disclosure only if the buyer asks about that specific defect, because (b)(4) reaches a failure to answer rather than a failure to volunteer.",
      "Disclosure only with the seller's written consent, since the information is the client's confidential information under § 1101.651(d)(3).",
    ],
    rationale: "Subsections (b)(3) and (b)(4) both run to a POTENTIAL BUYER — a customer rather than a client — and (b)(4) reaches the failure to disclose, not merely a false answer, so silence is not a defence. The fourth choice is the near-miss because it borrows a real rule from the wrong setting: § 1101.651(d)(3) governs an intermediary's confidentiality, and even there the protection expressly does not cover information that materially relates to the condition of the property. Negotiating posture is confidential; defects in the house are not.",
    teaches: "module-07.md#unit-fiduciary-duties",
    source: "Texas Occupations Code § 1101.652(b)(3), (b)(4); § 1101.651(d)(3)",
  }),

  item("PRINS2-F102", {
    topic: "T07", unit: "T07U4",
    prompt: "Weeks after closing, a Texas seller asks her former listing agent for a copy of an addendum she signed, and separately asks him to return an original survey she supplied. He ignores both requests. Which grounds does Occupations Code § 1101.652 supply?",
    choices: [
      "Subsection (b)(28), refusing on request to furnish a copy of a document relating to the transaction to a person who signed it, and subsection (a)(5), failing to surrender to the owner, without just cause, a document or instrument requested by the owner.",
      "Subsection (b)(24), rendering a materially inaccurate statement of account, and subsection (b)(9), failing within a reasonable time to properly account for money belonging to another.",
      "Subsection (b)(12), failing to specify a definite termination date, and subsection (b)(2), conduct that is dishonest or in bad faith.",
      "No ground — the duties in § 1101.652 attach only during a live agency, and the agency ended at closing.",
    ],
    rationale: "Subsection (b)(28) requires providing, on request, a copy of a transaction document to a person who signed it, and subsection (a)(5) reaches failing to surrender a requested document or instrument to its owner without just cause. The fourth choice is the near-miss and states an intuition module-07 rejects: nothing in these subdivisions is limited to a live agency, and the accounting provisions likewise speak of money 'that belongs to another person' and of the transaction's completion or termination rather than of a continuing relationship.",
    teaches: "module-07.md#unit-fiduciary-duties",
    source: "Texas Occupations Code § 1101.652(b)(28); § 1101.652(a)(5); see § 1101.652(b)(9), (b)(30), (b)(31)",
  }),

  item("PRINS2-F103", {
    topic: "T07", unit: "T07U5",
    prompt: "Before any DTPA analysis can proceed, the complainant must be a 'consumer.' Under Business and Commerce Code § 17.45, is a Texas buyer of a house, or a client engaging a brokerage, a consumer?",
    choices: [
      "Yes to both — a consumer is an individual, partnership, corporation, this state, or a subdivision or agency of this state who seeks or acquires by purchase or lease any goods or services, excluding a business consumer with assets of $25 million or more or one owned or controlled by such an entity; 'goods' means tangible chattels or real property purchased or leased for use, and 'services' means work, labor or service purchased or leased for use.",
      "Yes to the brokerage client and no to the house buyer — the DTPA's definition of goods reaches tangible chattels only, so real property is outside it.",
      "Yes to the house buyer and no to the brokerage client — brokerage is a professional service, and § 17.49(c) removes professional services from the definition of consumer altogether.",
      "No to both — the DTPA reaches only consumer goods sold in the ordinary retail trade, and neither a house nor a brokerage engagement is such a good.",
    ],
    rationale: "The threshold has two elements — the person must SEEK OR ACQUIRE, so an actual or prospective purchaser or lessee rather than a bystander, and what is sought must be goods or services — and both terms reach real estate on their own text: goods means tangible chattels OR REAL PROPERTY purchased or leased for use, and services means work, labor or service purchased or leased for use. The third choice is the near-miss because § 17.49(c) is real but does different work: it exempts a claim for damages based on the rendering of a professional service the essence of which is advice, judgment or opinion, subject to its own exceptions — an exemption from liability, not a hole in the definition of consumer.",
    teaches: "module-07.md#unit-texas-deceptive-trade-practices---consumer-protection-act",
    source: "Texas Business and Commerce Code § 17.45(1), (2), (4), (6), (10), (12); § 17.49(c)",
  }),

  item("PRINS2-F104", {
    topic: "T07", unit: "T07U5",
    prompt: "A Texas brokerage adds a clause to its own buyer representation agreement by which the client waives all rights under the DTPA. Under Business and Commerce Code § 17.42, is it effective?",
    choices: [
      "No — a waiver by a consumer is contrary to public policy and unenforceable and void unless it is in writing and signed by the consumer, the consumer is not in a significantly disparate bargaining position, and the consumer is represented in seeking or acquiring the goods or services by legal counsel; the waiver is also void if that counsel was identified, suggested or selected by a defendant, and it must be conspicuous, in boldface type of at least 10 points, headed 'Waiver of Consumer Rights' or words of similar meaning.",
      "Yes — a signed written waiver in a negotiated agreement is enforceable, because the DTPA's remedies are cumulative rather than mandatory.",
      "Yes, if the clause is conspicuous and in boldface type of at least 10 points, which is the only formality § 17.42 imposes.",
      "No — the DTPA may never be waived under any circumstances, so the formalities in § 17.42(c) apply only to a settlement release.",
    ],
    rationale: "Section 17.42(a) makes a consumer waiver contrary to public policy and void unless three conditions are met together — writing and signature, no significantly disparate bargaining position, and representation by legal counsel in seeking or acquiring the goods or services — with § 17.42(b) voiding it if the defendant identified, suggested or selected that counsel and § 17.42(c) adding the conspicuousness, type-size and heading requirements. The third choice is the near-miss because it takes the formality and drops the substantive conditions; you cannot paper your way out of the DTPA with a clause in your own agreement.",
    teaches: "module-07.md#unit-texas-deceptive-trade-practices---consumer-protection-act",
    source: "Texas Business and Commerce Code § 17.42(a), (b), (c); § 17.43",
  }),

  item("PRINS2-F105", {
    topic: "T07", unit: "T07U5",
    prompt: "A DTPA defendant insists that no finding of 'knowingly' or 'intentionally' can be made because he never admitted awareness of anything. How do Business and Commerce Code § 17.45(9) and (13) answer that?",
    choices: [
      "Neither state requires an admission. 'Knowingly' means actual awareness, at the time of the act or practice complained of, of the falsity, deception or unfairness giving rise to the claim, but actual awareness may be inferred where objective manifestations indicate that a person acted with actual awareness; 'intentionally' means that actual awareness coupled with the specific intent that the consumer act in detrimental reliance on the falsity or deception or in detrimental ignorance of the unfairness, and intent may be inferred from objective manifestations or from facts showing that the defendant acted with flagrant disregard of prudent and fair business practices to the extent that the defendant should be treated as having acted intentionally.",
      "Both states require direct proof of the defendant's subjective awareness, which is why the multipliers in § 17.50(b)(1) are rarely reached in practice.",
      "'Knowingly' may be inferred from the circumstances, but 'intentionally' requires an admission or a writing, because specific intent cannot be established circumstantially.",
      "Flagrant disregard of prudent and fair business practices is itself intent under § 17.45(13), so a showing of careless business conduct establishes the intentional finding without more.",
    ],
    rationale: "Both definitions expressly allow inference: actual awareness may be inferred where objective manifestations indicate it, and intent may be inferred from objective manifestations or from facts showing flagrant disregard of prudent and fair business practices. The fourth choice is the near-miss and is the misreading the statute's own closing words guard against: flagrant disregard is not itself intent, it is evidence from which intent MAY be inferred, and only where it rises to the level at which the defendant should be treated as having acted intentionally.",
    teaches: "module-07.md#unit-texas-deceptive-trade-practices---consumer-protection-act",
    source: "Texas Business and Commerce Code § 17.45(9), (13); § 17.50(b)(1)",
  }),

  item("PRINS2-F106", {
    topic: "T07", unit: "T07U5",
    prompt: "Two Texas transactions each involve total consideration of $650,000 by the consumer under a written contract negotiated with independent counsel the defendant did not identify, suggest or select: one is an office building, the other is the consumer's own house. How do the DTPA's transaction-size exemptions treat them?",
    choices: [
      "The office building may fall within the exemptions — § 17.49(f) covers a claim arising out of a written contract where the transaction involves total consideration by the consumer of more than $100,000, the consumer was represented by such counsel, and the contract does not involve the consumer's residence, and § 17.49(g) covers a cause of action arising from a transaction involving more than $500,000 other than one involving a consumer's residence — while the house is outside both, because each carries a residence carve-out.",
      "Both are exempt, because both exceed the $500,000 threshold in § 17.49(g) and the residence carve-out applies only to leases.",
      "Neither is exempt, because the exemptions require the consumer to be a business consumer with assets of $25 million or more.",
      "The house is exempt and the office building is not, because § 17.49(g)'s threshold is measured against the consumer's total assets rather than the transaction.",
    ],
    rationale: "Both exemptions turn on transaction size and both carve out the consumer's residence: § 17.49(f) requires a written contract, more than $100,000 of consideration, representation by counsel the defendant did not identify, suggest or select, and that the contract not involve the consumer's residence; § 17.49(g) exempts a cause of action arising from a transaction of more than $500,000 other than one involving a consumer's residence. The statute is most protective exactly where an individual's home is concerned. The second choice is the near-miss because it identifies the right threshold and then narrows the carve-out to leases, which the text does not do; the third choice confuses the exemptions with the $25 million business-consumer ceiling in the § 17.45(4) definition of consumer.",
    teaches: "module-07.md#unit-texas-deceptive-trade-practices---consumer-protection-act",
    source: "Texas Business and Commerce Code § 17.49(f), (g); § 17.45(4), (12); § 17.49(c), (i)",
  }),

  /* ══ T08 Fair Housing Laws — 170 prescribed minutes ═══════════════════════════════════════ */

  item("PRINS2-F107", {
    topic: "T08", unit: "T08U1",
    prompt: "A Texas seller lists a vacant lot offered for the construction of a house. She asks whether the federal Fair Housing Act reaches raw land at all, and whether § 3604 applies only to the federally connected housing categories § 3603(a)(1) names.",
    choices: [
      "It reaches the lot, and § 3604 applies to all dwellings: 'dwelling' means any building, structure or portion thereof occupied as, or designed or intended for occupancy as, a residence by one or more families, AND any vacant land offered for sale or lease for the construction or location thereon of any such building — and § 3603(a)(2) applies § 3604, after December 31, 1968, to all dwellings covered by paragraph (1) and to all other dwellings except as exempted by § 3603(b).",
      "It does not reach the lot, because a dwelling must be a structure occupied or intended for occupancy as a residence, and vacant land is neither.",
      "It reaches the lot, but § 3604 applies only to the four categories of federally connected housing listed in § 3603(a)(1), so a privately financed lot sale is outside the Act.",
      "It reaches the lot only once construction begins, because the definition turns on a structure designed or intended for occupancy and there is none until the foundation is poured.",
    ],
    rationale: "Two consequences fall out of § 3602(b): a PORTION of a building is a dwelling, so a single rented room counts, and vacant land offered for sale or lease for residential construction is a dwelling — which matters in a state with as much lot inventory as Texas. Property Code § 301.003(8) defines dwelling to the same effect. The third choice is the near-miss because § 3603(a)(1)'s federally connected categories are real but are spent history: they record which housing was covered first, and § 3603(a)(2) is the operative sentence today. Texas Property Code § 301.041 and § 3607 supply the only exemptions.",
    teaches: "module-08.md#unit-equal-opportunity-in-housing",
    source: "42 U.S.C. § 3602(b), (c), (d), (e); § 3603(a)(1), (a)(2); Texas Property Code § 301.003(8)",
  }),

  item("PRINS2-F108", {
    topic: "T08", unit: "T08U1",
    prompt: "The § 3603(b)(1) exemption is unavailable to an owner who uses the facilities or services of 'any person in the business of selling or renting dwellings.' Under 42 U.S.C. § 3603(c), when is a person in that business?",
    choices: [
      "If, within the preceding twelve months, the person participated as principal in three or more transactions involving the sale or rental of any dwelling or any interest therein; or, within the preceding twelve months, participated as agent — other than in the sale of the person's own personal residence — in providing sales or rental facilities or services in two or more such transactions; or the person owns any dwelling designed or intended for occupancy by, or occupied by, five or more families.",
      "Only if the person holds a real estate license issued by the state in which the dwelling is located, since the exemption is aimed at licensed practitioners.",
      "If, within the preceding twelve months, the person participated as principal in five or more transactions, or as agent in three or more, or owns a dwelling for ten or more families.",
      "If the person derives a majority of income from the sale or rental of dwellings, measured over the preceding calendar year.",
    ],
    rationale: "Section 3603(c) supplies three alternative tests — three transactions as principal, two as agent (excluding the sale of the person's own personal residence), or ownership of a dwelling for five or more families — thresholds low enough that almost anyone working in this field clears them. The third choice is the near-miss because it keeps the structure and raises every number. Note that the § 3603(b)(1) exemption is lost the moment an owner uses a broker's, agent's or salesman's facilities or services 'in any manner,' and that neither § 3603(b) nor Texas Property Code § 301.041 exempts brokers, agents or salespersons at all.",
    teaches: "module-08.md#unit-equal-opportunity-in-housing",
    source: "42 U.S.C. § 3603(b)(1), (c)(1)-(3); Texas Property Code § 301.041(a)(1)(B)(i)",
  }),

  item("PRINS2-F109", {
    topic: "T08", unit: "T08U1",
    prompt: "A Texas religious organization owns housing it operates for other than a commercial purpose and prefers members of its own religion; a nearby club that provides lodging incident to its primary purpose limits that lodging to its members. What does 42 U.S.C. § 3607(a) permit, and what limits are built into it?",
    choices: [
      "Both preferences are permitted, on conditions written into the subsection: the dwellings must be owned or operated by the organization or the club, must be operated for other than a commercial purpose, the religious preference collapses if membership in the religion is restricted on account of race, color or national origin, and the club must be one 'not in fact open to the public' whose lodging is provided 'as an incident to its primary purpose or purposes.'",
      "Both are permitted without condition, because § 3607(a) removes religious organizations and private clubs from the subchapter entirely.",
      "Neither is permitted, because § 3602(d) defines 'person' to include associations and organizations, and no provider of housing may prefer one group over another.",
      "Both are permitted, and the exemptions also answer a claim that the organization or the club denied someone access to a multiple-listing service or a brokers' organization, because § 3607(a) is phrased subchapter-wide.",
    ],
    rationale: "Three limits sit inside the religious exemption — owned or operated by the organization, operated for other than a commercial purpose, and no religious membership restricted on account of race, color or national origin, a proviso that stops the exemption being used as a proxy for a racial one — and the club exemption turns on 'not in fact open to the public' and lodging provided 'as an incident to its primary purpose,' so a club whose primary business is lodging or whose exclusivity is nominal is not described. The fourth choice is the near-miss: § 3607(a) is phrased subchapter-wide in form, but what it is ABOUT is limiting the sale, rental or occupancy of dwellings the organization or club owns or operates — nothing in it describes who may join a multiple-listing service or a brokers' organization under § 3606. Texas Property Code § 301.042 mirrors both exemptions.",
    teaches: "module-08.md#unit-equal-opportunity-in-housing",
    source: "42 U.S.C. § 3607(a); § 3606; Texas Property Code § 301.042(a), (a-1)",
  }),

  item("PRINS2-F110", {
    topic: "T08", unit: "T08U1",
    prompt: "A Texas landlord refuses an applicant because he believes the applicant has a mental impairment. The applicant does not in fact have one. Under 42 U.S.C. § 3602(h), does the Fair Housing Act reach the refusal?",
    choices: [
      "Yes — handicap means a physical or mental impairment that substantially limits one or more major life activities, a record of having such an impairment, or BEING REGARDED AS having such an impairment, so a landlord who acts on an impairment he wrongly believes an applicant has is inside the definition and being wrong about the facts is no defence.",
      "No — the definition reaches only a person who actually has an impairment or has a record of one, so a mistaken belief cannot support a claim.",
      "Yes — but only if the applicant can show the landlord's belief was unreasonable, since the third prong turns on the reasonableness of the perception.",
      "No — the refusal is instead reached by § 3604(f)(9), which permits refusal only where the tenancy would constitute a direct threat, so the landlord's error is evaluated under that subsection.",
    ],
    rationale: "The third prong — 'being regarded as having such an impairment' — is what makes a mistaken perception actionable; the definition also excludes current, illegal use of or addiction to a controlled substance. The fourth choice is the near-miss because § 3604(f)(9) is real but does different work: it provides that nothing in the subsection requires a dwelling to be made available to an individual whose tenancy would constitute a direct threat to others' health or safety or would result in substantial physical damage to others' property, and module-08 describes it as a narrow, evidence-based provision about THIS individual's tenancy rather than a licence to act on assumptions about a category of people.",
    teaches: "module-08.md#unit-equal-opportunity-in-housing",
    source: "42 U.S.C. § 3602(h); § 3604(f)(9); Texas Property Code § 301.003(6)",
  }),

  item("PRINS2-F111", {
    topic: "T08", unit: "T08U1",
    prompt: "A Texas seller rejects an offer because the buyer's adult son, who will live in the home, uses a wheelchair. In a second transaction a landlord rejects an applicant because the applicant's regular caregiver has a disability. Does 42 U.S.C. § 3604(f)(1) reach either?",
    choices: [
      "Both — (f)(1) makes it unlawful to discriminate in the sale or rental, or otherwise make unavailable or deny, a dwelling to any buyer or renter because of a handicap of that buyer or renter, of a person residing in or intending to reside in that dwelling after it is sold, rented or made available, or of any person associated with that buyer or renter.",
      "Neither — the subsection protects the buyer or renter only, so a handicap of another person is outside it.",
      "Only the first — a person who will reside in the dwelling is protected, but 'associated with' reaches only a co-applicant or a family member on the lease.",
      "Only the second — association is protected, but a person who will merely reside in the dwelling has no independent standing until the tenancy begins.",
    ],
    rationale: "Paragraph (f)(1) reaches three people: the buyer or renter (subparagraph A), a person residing in or intending to reside in the dwelling after it is sold, rented or made available (B), and any person associated with that buyer or renter (C) — and (f)(2) does the same for terms, conditions and privileges and for the provision of services or facilities. The third choice is the near-miss because it narrows 'associated with' to a co-applicant or lease signatory, a limit the text does not contain. Handicap is absent from the lists in § 3604(a) and (b) precisely because (f)(1) and (f)(2) are their disability analogues.",
    teaches: "module-08.md#unit-equal-opportunity-in-housing",
    source: "42 U.S.C. § 3604(f)(1)(A)-(C), (f)(2)",
  }),

  item("PRINS2-F112", {
    topic: "T08", unit: "T08U2",
    prompt: "Property Code chapter 301 refers throughout to 'the commission.' Which body is it, and what is TREC's role in Texas fair housing?",
    choices: [
      "Every reference is to the Texas Workforce Commission, to which the powers of the former Commission on Human Rights were transferred by § 301.0015; TREC's fair housing role is licence discipline under Occupations Code chapter 1101, and § 301.114 requires the commission, within 30 days of issuing an order about a discriminatory housing practice occurring in a licensed business, to send copies of the findings and order to the agency that licenses the business and to recommend appropriate disciplinary action.",
      "Every reference is to the Texas Real Estate Commission, which administers chapter 301 as to license holders and refers other complaints to the Texas Workforce Commission.",
      "Every reference is to the Texas Commission on Human Rights, which still exists as a separate agency and shares jurisdiction with the Texas Workforce Commission.",
      "Every reference is to the United States Department of Housing and Urban Development, because chapter 301 was enacted to be substantially equivalent to federal law and is administered federally.",
    ],
    rationale: "Section 301.0015 transfers the former Commission on Human Rights' powers to the Texas Workforce Commission and provides that a reference in the chapter to 'the commission' means that body; TREC's fair housing role is licence discipline under chapter 1101, and § 301.114 is the bridge that carries a Texas Workforce Commission order to the licensing agency with a recommendation. The second choice is the near-miss and is the assumption a real estate student naturally makes, which is exactly why the point is worth fixing.",
    teaches: "module-08.md#unit-texas-fair-housing-laws",
    source: "Texas Property Code § 301.0015; § 301.114; § 301.002; Texas Occupations Code § 1101.652(b)(32); § 1101.801",
  }),

  item("PRINS2-F113", {
    topic: "T08", unit: "T08U2",
    prompt: "The Texas Workforce Commission issues a charge on a discriminatory housing practice complaint. What choice does Property Code chapter 301 give the parties, on what deadline, and what happens on each branch?",
    choices: [
      "A complainant, a respondent or an aggrieved person may elect to have the claims asserted in the charge decided in a civil action, and must elect not later than the 20th day after service of the charge; if no timely election is made there is an administrative hearing under § 301.111 governed by Government Code chapter 2001, and if a timely election is made § 301.131 directs the attorney general within 30 days to file a civil action in district court on the aggrieved person's behalf.",
      "Only the complainant may elect a civil action, and the election must be made not later than the 60th day after service of the charge.",
      "There is no election; every charge proceeds to an administrative hearing, and a party dissatisfied with the order may then seek judicial review.",
      "A complainant or respondent may elect a civil action within 20 days, and on election the aggrieved person must file the suit personally, because the attorney general appears only in a pattern-or-practice action.",
    ],
    rationale: "Section 301.093 gives the election to a complainant, a respondent or an aggrieved person and fixes it at not later than the 20th day after service of the charge; § 301.111 supplies the administrative hearing where no timely election is made, with § 301.112(b) civil penalties to vindicate the public's interest; and § 301.131 directs the attorney general to file the civil action within 30 days on election. The fourth choice is the near-miss because it identifies the election correctly and then misassigns the filing: § 301.132's pattern-or-practice action is a separate and additional attorney general power, not the only one.",
    teaches: "module-08.md#unit-texas-fair-housing-laws",
    source: "Texas Property Code § 301.093; § 301.111; § 301.112(b); § 301.131; § 301.132; § 301.151",
  }),

  item("PRINS2-F114", {
    topic: "T08", unit: "T08U3",
    prompt: "A Texas agent farms a neighborhood with mailers reading 'the area is changing — list now before values drop,' whose surrounding messaging makes clear what 'changing' refers to. No one lists and no values fall. Is 42 U.S.C. § 3604(e) violated?",
    choices: [
      "Yes — the elements are for profit, to induce OR ATTEMPT TO INDUCE a sale or rental, and representations regarding the entry or prospective entry into the neighborhood of persons of a protected class; the attempt alone completes the violation, so nobody has to list, nothing has to sell, and values need not fall.",
      "No — blockbusting requires that at least one owner actually list or sell in response, because the statute reaches inducement rather than solicitation.",
      "No — a prediction about future property values is opinion, and § 3604(e) reaches only statements of existing fact about who has moved into a neighborhood.",
      "Yes — but only if the agent can be shown to have known the prediction was false, since a sincerely held forecast is not a representation.",
    ],
    rationale: "Section 3604(e) reaches conduct 'for profit, to induce or attempt to induce' a sale or rental by representations regarding the entry OR PROSPECTIVE ENTRY of persons of a protected class — so a prediction counts and the attempt completes the offence. The third choice is the near-miss because the word 'prospective' in the statute is precisely what forecloses the opinion-about-the-future defence; the fourth adds a knowledge element the subsection does not contain.",
    teaches: "module-08.md#unit-housing-discrimination",
    source: "42 U.S.C. § 3604(e); Texas Property Code § 301.024",
  }),

  item("PRINS2-F115", {
    topic: "T08", unit: "T08U3",
    prompt: "A Texas real estate brokers' association admits applicants on stated criteria but routes one applicant's file through an extra interview and a sponsorship requirement nobody else faces, and the record shows national origin is why. No consumer was refused a dwelling. Which provision is violated, and can a § 3603(b) exemption answer it?",
    choices: [
      "Section 3606 — it is unlawful to deny any person access to or membership or participation in any multiple-listing service, real estate brokers' organization or other service, organization or facility relating to the business of selling or renting dwellings, OR to discriminate in the terms or conditions of such access, membership or participation, on the seven bases; and § 3603(b) cannot answer it, because by its own opening words that subsection exempts qualifying transactions only from section 3604 other than subsection (c).",
      "Section 3604(a) — the association has otherwise made a dwelling unavailable — and a § 3603(b) exemption could apply if the association's members are owners of three or fewer single-family houses.",
      "No federal provision — § 3606 reaches only outright denial of membership, and this applicant was admitted; his remedy is under the association's own rules.",
      "Section 3617 — the association has interfered with the exercise of a right — and § 3607(a)'s private club exemption answers it, because a brokers' association is a private membership body.",
    ],
    rationale: "Section 3606's prohibited conduct is two-stage, exactly as in § 3604(a) and (b): denying access, membership or participation, and discriminating in the terms or conditions of access, membership or participation — so conditioning participation is inside the section without any denial, which disposes of the third choice. Section 3603(b) exempts only from § 3604 other than subsection (c), and § 3607's exemptions, though phrased subchapter-wide, are about limiting the sale, rental or occupancy of dwellings a religious organization or private club owns or operates and about the familial-status provisions in housing for older persons — none of which describes who may join a brokers' organization. Property Code § 301.027 is the Texas counterpart.",
    teaches: "module-08.md#unit-housing-discrimination",
    source: "42 U.S.C. § 3606; § 3603(b); § 3607(a); § 3602(f); Texas Property Code § 301.027",
  }),

  item("PRINS2-F116", {
    topic: "T08", unit: "T08U3",
    prompt: "A Texas license holder documents a tenant's reasonable-accommodation request and refuses to run listing copy indicating a familial-status preference. A campaign then begins to have her removed from a local board. Does 42 U.S.C. § 3617 reach that campaign?",
    choices: [
      "Yes — § 3617 makes it unlawful to coerce, intimidate, threaten or interfere with any person in the exercise or enjoyment of, or on account of having exercised or enjoyed, or on account of having AIDED OR ENCOURAGED any other person in the exercise or enjoyment of, any right granted or protected by § 3603, § 3604, § 3605 or § 3606 — and it reaches the conduct whether or not the underlying claim ever succeeds, because the section turns on the aiding rather than on the outcome.",
      "No — § 3617 protects only the person whose own housing right was exercised, so a license holder who helped someone else is outside it.",
      "Yes — but only if the underlying accommodation request is ultimately found meritorious, since § 3617 is derivative of the underlying right.",
      "No — § 3617 requires force or the threat of force, so a campaign short of that is not reached.",
    ],
    rationale: "Section 3617 has four verbs, and 'interfere with' is the widest and needs no threat and no force; it has three timings, of which the third — on account of having aided or encouraged any other person — is what protects the license holder here; and its underlying rights are a closed list of §§ 3603, 3604, 3605 and 3606. The fourth choice is the near-miss because force or the threat of force IS the element of the Texas criminal provision, Property Code § 301.171, a Class A misdemeanor — and setting the two side by side is the lesson: a course of conduct far short of the Texas criminal threshold can still be a federal discriminatory housing practice.",
    teaches: "module-08.md#unit-housing-discrimination",
    source: "42 U.S.C. § 3617; § 3602(f); Texas Property Code § 301.171",
  }),

  item("PRINS2-F117", {
    topic: "T08", unit: "T08U4",
    prompt: "A Texas sales agent who in the ordinary course of business regularly refers buyers to two preferred lenders tells a prospective buyer, before any application, that 'people in your situation usually don't get approved around here.' Which Regulation B provisions are engaged?",
    choices: [
      "Both — 12 C.F.R. § 1002.2(l) extends 'creditor' for the purposes of §§ 1002.4(a) and (b) to a person who, in the ordinary course of business, regularly refers applicants or prospective applicants to creditors, and § 1002.4(b) forbids an oral or written statement, in advertising or otherwise, directed at applicants or prospective applicants that the maker knows or should know would cause a reasonable person to believe that credit would be denied or granted on less favorable terms because of a prohibited basis characteristic.",
      "Neither — Regulation B binds creditors, and a real estate license holder who makes no credit decision is not one under any provision of the regulation.",
      "Only § 1002.4(a) — the statement discriminates in an aspect of a credit transaction, but § 1002.4(b) requires that an application have been made.",
      "Only § 1002.4(b) — but it applies to the agent only if she is compensated by the lenders she refers to, since the extended definition of creditor turns on compensation.",
    ],
    rationale: "Section 1002.2(l) is the sentence that puts a regularly referring license holder inside §§ 1002.4(a) and (b), and § 1002.4(b) needs no application at all: it protects prospective applicants, uses an objective 'knows or should know' standard measured by what a reasonable person would believe, and its closing sentence brings visual images such as symbols, photographs and videos inside the rule. The third choice is the near-miss because it inverts the one feature that makes (b) distinctive — the discouragement rule can be complete before anyone applies.",
    teaches: "module-08.md#unit-housing-credit-discrimination",
    source: "12 C.F.R. § 1002.2(l), (n), (z); § 1002.4(a), (b) (Regulation B); 15 U.S.C. § 1691a(g)",
  }),

  item("PRINS2-F118", {
    topic: "T08", unit: "T08U4",
    prompt: "A client asks why a mortgage application asks her race and sex when 12 C.F.R. § 1002.5(b) forbids a creditor to inquire about them. What resolves the tension?",
    choices: [
      "Section 1002.5(a)(2) provides that notwithstanding paragraphs (b) through (d), a creditor SHALL request information for monitoring purposes as required by § 1002.13 for credit secured by the applicant's dwelling — so for dwelling-secured credit the demographic questions are not merely permitted but required, which is why a mortgage application asks what a car loan application may not.",
      "Section 1002.5(b)(2) permits it, because an application form may ask an applicant to designate a title such as Ms., Miss, Mr. or Mrs.",
      "Nothing resolves it — the mortgage application's demographic questions are voluntary and a creditor that includes them is exceeding the regulation.",
      "Section 1002.5(a)(1) resolves it, because a creditor may request any information in connection with a credit transaction and the exceptions in paragraphs (b) through (d) are advisory.",
    ],
    rationale: "Section 1002.5(a)(2) is the counterweight to the § 1002.5(b) prohibition and it uses 'shall': for credit secured by the applicant's dwelling the monitoring information is required. The second choice is the near-miss because § 1002.5(b)(2) is a real exception — an optional title designation on a form that otherwise uses only sex-neutral terms — but it is a narrow formality, not the answer to demographic monitoring. Section 1002.13, which fixes exactly which credit the monitoring requirement covers and how the information is collected, was not among the sources held for this course, so its contents are not stated here.",
    teaches: "module-08.md#unit-housing-credit-discrimination",
    source: "12 C.F.R. § 1002.5(a)(1), (a)(2), (b)(1), (b)(2), (c)(2)(iv), (d)(1), (d)(3) (Regulation B)",
  }),

  item("PRINS2-F119", {
    topic: "T08", unit: "T08U4",
    prompt: "A client's adverse action notice says only, 'Your application did not meet our internal credit standards.' What do 15 U.S.C. § 1691(d) and 12 C.F.R. § 1002.9 say about that letter, and what else must the notification contain?",
    choices: [
      "The letter is insufficient: § 1002.9(b)(2) states that statements that the adverse action was based on the creditor's internal standards or policies, or that the applicant failed to achieve a qualifying score on the creditor's credit scoring system, are insufficient, and § 1691(d)(3) requires the specific reasons. The written notification must also state the action taken, the creditor's name and address, a statement of the provisions of section 701(a) of the Act, and the name and address of the Federal agency that administers compliance with respect to that creditor — and it must give either the specific reasons or a disclosure of the applicant's right to a statement of specific reasons within 30 days if requested within 60 days of the notification, with the name, address and telephone number of the person or office from which it can be obtained.",
      "The letter is sufficient, because § 1691(d)(2) permits a creditor to give a general reason so long as it offers to supply detail on request.",
      "The letter is insufficient, and the creditor must supply the specific reasons within 60 days of the notification without any request from the applicant.",
      "The letter is sufficient if the creditor is a small-volume creditor, and § 1002.9(d) permits oral notification by any creditor that received fewer than 500 applications in the preceding calendar year.",
    ],
    rationale: "Section 1002.9(b)(2) addresses this letter by name, and § 1691(d)(3) provides that a statement of reasons complies only if it contains the specific reasons for the adverse action taken; § 1002.9(a)(2) then lists the required contents and the two permitted routes, with the second route running on a 60-day request window and a 30-day response window. The third choice is the near-miss because it reverses the two clocks and drops the request: the applicant has sixty days from notification to request reasons, and the creditor then has thirty days from the request. The fourth choice also misstates § 1002.9(d), which reaches a creditor that did not receive more than 150 applications during the preceding calendar year.",
    teaches: "module-08.md#unit-housing-credit-discrimination",
    source: "15 U.S.C. § 1691(d)(1)-(3), (6); 12 C.F.R. § 1002.9(a)(1), (a)(2), (b)(1), (b)(2), (c), (d) (Regulation B); § 1002.2(c)(1)(i), (f); 15 U.S.C. § 1691c",
  }),

  item("PRINS2-F120", {
    topic: "T08", unit: "T08U5",
    prompt: "Which institutions actually owe an obligation under the Community Reinvestment Act, and which federal agencies supervise them?",
    choices: [
      "Insured depository institutions — 12 U.S.C. § 2902(2) defines 'regulated financial institution' as an insured depository institution — supervised by three agencies named in § 2902(1): the Comptroller of the Currency, the Board of Governors of the Federal Reserve System, and the Federal Deposit Insurance Corporation, each as to the institutions the paragraph assigns it. A mortgage broker, a mortgage banker, a credit union and a real estate brokerage are not regulated financial institutions.",
      "Every institution that originates residential mortgage loans, supervised by the Bureau of Consumer Financial Protection.",
      "Insured depository institutions and any mortgage banker with a federally related lending business, supervised by the Department of Housing and Urban Development.",
      "Every lender doing business in a metropolitan statistical area with a population of 250,000 or more, supervised by whichever of the three banking agencies charters it.",
    ],
    rationale: "Section 2902(2) defines the covered institution narrowly as an insured depository institution, and § 2902(1) names three supervisors — the Comptroller of the Currency, the Federal Reserve Board and the FDIC — none of which is HUD, the Bureau or TREC. The fourth choice is the near-miss because the 250,000 population figure is real but does other work: § 2906(e) uses it to define 'metropolitan area' for the separate written evaluations a multi-state institution must receive, not to fix who owes the obligation.",
    teaches: "module-08.md#unit-community-reinvestment",
    source: "12 U.S.C. § 2902(1)-(4); § 2903(a); § 2906(e)",
  }),

  item("PRINS2-F121", {
    topic: "T08", unit: "T08U5",
    prompt: "A client wants to look up a bank's CRA rating. Under 12 U.S.C. § 2906, what will she find, and what are the ratings?",
    choices: [
      "A written evaluation with a public section and a confidential section; the public section states the agency's conclusions for each assessment factor in the implementing regulations, discusses the supporting facts and data, and contains the institution's rating and the basis for it. The four statutory ratings are 'outstanding record of meeting community credit needs,' 'satisfactory record of meeting community credit needs,' 'needs to improve record of meeting community credit needs,' and 'substantial noncompliance in meeting community credit needs.'",
      "A written evaluation that is confidential in its entirety and available only to the institution and its supervisor, with ratings of outstanding, satisfactory, needs to improve and unsatisfactory.",
      "A public written evaluation with five rating levels, the lowest of which is 'failing,' published annually by the Bureau of Consumer Financial Protection.",
      "A public written evaluation containing a numeric score from one to four, which the agency converts into a letter grade published on the institution's own website.",
    ],
    rationale: "Section 2906(a)(2) requires a public section and a confidential section; § 2906(b)(1)(A) sets out what the public section must contain, presented separately for each metropolitan area in which the institution maintains domestic branch offices under (b)(1)(B); and § 2906(b)(2) lists exactly four ratings in the statute's own words, closing with the provision that they shall be disclosed to the public on and after July 1, 1990. The second choice is the near-miss on two counts — it makes the whole evaluation confidential when only one section is, and it renames the fourth rating; the statute's word is 'substantial noncompliance,' not 'unsatisfactory' or 'failing.'",
    teaches: "module-08.md#unit-community-reinvestment",
    source: "12 U.S.C. § 2906(a)(1), (a)(2), (b)(1), (b)(2), (c), (d), (e); § 2903(c)",
  }),

  /* ══ T09 Property Management — 120 prescribed minutes ═════════════════════════════════════ */

  item("PRINS2-F122", {
    topic: "T09", unit: "T09U1",
    prompt: "A Texas management firm signs residential leases in its own name as 'Lessor' rather than as agent for a disclosed owner. What does Property Code § 92.001(2) make of that?",
    choices: [
      "It has made itself the landlord for chapter 92 purposes: the definition excludes a manager or agent of the landlord UNLESS the manager or agent purports to be the owner, lessor or sublessor in an oral or written lease — so chapter 92's landlord duties and exposures now run against the firm.",
      "Nothing — the definition looks to record title, so the owner remains the landlord whatever the signature block says.",
      "It has made itself a co-landlord jointly with the owner, so the duties are shared and either may be pursued for a violation.",
      "It has made itself the landlord only for the security deposit provisions, because those are the only chapter 92 duties tied to the party who signs the lease.",
    ],
    rationale: "Section 92.001(2) defines landlord as the owner, lessor or sublessor of a dwelling and expressly excludes a manager or agent unless that person purports to be the owner, lessor or sublessor in an oral or written lease — which is why the signature block is not clerical: it decides who the statute is talking about. The second choice is the near-miss because record title IS what § 92.201(a) makes the landlord disclose, but the § 92.001(2) definition turns on how the person held themselves out in the lease, not on the deed records.",
    teaches: "module-09.md#unit-property-management",
    source: "Texas Property Code § 92.001(2); § 92.201(a)",
  }),

  item("PRINS2-F123", {
    topic: "T09", unit: "T09U1",
    prompt: "A tenant asks in writing who owns her Texas apartment and who manages it. Under Property Code § 92.201, what must be disclosed, how, and what happens if the landlord ignores the request?",
    choices: [
      "The name and street or post office box address of the holder of record title according to the county deed records, and, where an entity located off-site is primarily responsible for managing the dwelling, that management company's name and street address — disclosed in writing on or before the seventh day after the request, by continuously posting the information conspicuously in the dwelling or at the on-site manager's office within that same period, or by including it in a copy of the lease or written rules given before the request; and § 92.205(a) gives the tenant a disclosure order, the tenant's actual costs of discovering the information, a judgment for one month's rent plus $100, costs and fees, and unilateral termination of the lease without a court proceeding.",
      "Only the management company's name and address; a landlord may withhold the owner's identity for privacy reasons, and the tenant's sole remedy is a court order compelling disclosure.",
      "The owner's name and address, disclosed within thirty days of the request; the duty may be waived by a written lease provision in which the tenant agrees to deal exclusively with the management company.",
      "The owner's name and address and the management company's name and address, disclosed within seven days; the tenant's only remedy is actual damages, because the statutory penalty applies to security deposit violations rather than to disclosure failures.",
    ],
    rationale: "Section 92.201(a) requires both the record title holder's name and street or post office box address and, where off-site management is primarily responsible, the management company's name and street address; § 92.201(b) supplies the three permitted methods and the seven-day period; § 92.006(a) makes the duty non-waivable; and § 92.205(a) supplies the remedies including the one month's rent plus $100 judgment and unilateral termination without a court proceeding. The fourth choice is the near-miss because it gets the content and the deadline right and then understates the remedy, which is the part that makes off-site fee management a live compliance matter.",
    teaches: "module-09.md#unit-property-management",
    source: "Texas Property Code § 92.201(a), (b); § 92.205(a); § 92.006(a)",
  }),

  item("PRINS2-F124", {
    topic: "T09", unit: "T09U1",
    prompt: "An unlicensed Texas firm has managed an owner's rent houses for two years, leasing them and collecting the rent for a percentage fee. The owner refuses to pay the last four months of fees and the firm sues. What does Occupations Code § 1101.806(b) produce?",
    choices: [
      "The firm may not maintain the action: a person may not maintain an action to collect compensation for an act as a broker or sales agent performed in this state unless the person alleges and proves that the person was a license holder at the time the act was commenced, or an attorney licensed in any state.",
      "The firm may maintain the action for the fees already earned, because the owner accepted the services and cannot use the licensing statute to avoid payment.",
      "The firm may maintain the action but the court must reduce the recovery by the civil penalty the state could impose under § 1101.753.",
      "The firm may maintain the action if it obtains a license before judgment, because the bar is procedural and is cured by licensure.",
    ],
    rationale: "Section 1101.806(b) is a hard commercial consequence of the licensing requirement, and it turns on status at the time the act was commenced — a later licence does not cure it, which disposes of the fourth choice. The second choice is the near-miss because acceptance of services is the ordinary equitable answer, and the statute overrides it. Leasing and rent collection for another for compensation are acts of a broker under § 1101.002(1)(A)(i), (iii), (iv) and (x), and the firm is neither an owner nor an owner's employee under § 1101.005(8).",
    teaches: "module-09.md#unit-property-management",
    source: "Texas Occupations Code § 1101.806(b); § 1101.002(1)(A)(i), (iii), (iv), (x); § 1101.005(7), (8); § 1101.351(a)",
  }),

  item("PRINS2-F125", {
    topic: "T09", unit: "T09U1",
    prompt: "A Texas brokerage is opening a property management department and asks which credential its managers need and who answers for the department's mistakes.",
    choices: [
      "Chapter 1101 as read for this course creates no separate property manager license — management activity falls under the broker and sales agent licenses defined by § 1101.002(4) — and § 1101.803 provides that a licensed broker is liable to the commission, the public, and the broker's clients for any conduct engaged in under the chapter by the broker or by a sales agent associated with or acting for the broker, so the broker owns the department's mistakes.",
      "A separate property manager license is required under Chapter 1101, and a broker who holds one is liable only for conduct the broker personally directed.",
      "No separate license is required and none of the ordinary licenses is either, because management is an operating function rather than a brokerage act; liability runs to the owner under the management agreement.",
      "No separate license is required, but liability runs to each sponsored sales agent individually, because § 1101.803 makes a license holder answerable for the license holder's own conduct.",
    ],
    rationale: "Management activity is brokerage activity performed under the ordinary credentials: § 1101.002(4) defines a license holder as a broker or sales agent licensed under the chapter, and no separate property manager license appears in the chapter as read for this course. Section 1101.803 then places liability on the broker to the commission, the public and the broker's clients for conduct by the broker or by any sales agent associated with or acting for the broker. The fourth choice is the near-miss because it reads § 1101.803 backwards — the section's whole point is that responsibility travels UP to the broker, which is why a broker supervises and why § 1101.458 requires a broker, and a sales agent who supervises another license holder, to attend the broker responsibility course.",
    teaches: "module-09.md#unit-property-management",
    source: "Texas Occupations Code § 1101.002(4); § 1101.803; § 1101.351(a), (c); § 1101.458(a)",
  }),

  item("PRINS2-F126", {
    topic: "T09", unit: "T09U2",
    prompt: "Occupations Code § 1101.652(b)(12) requires a definite termination date not subject to prior notice in a contract in which a license holder agrees to perform services requiring a licence — other than a contract to perform property management services. What does that carve-out mean, and what does it not mean?",
    choices: [
      "It means the statutory definite-date requirement does not apply to a property management contract, so an evergreen term ending on notice is permitted; it does not mean the agreement needs no termination provision — it should still say how it ends, who may end it, what notice is required, and what happens to funds, files, keys and pending leases.",
      "It means a property management contract may not state a termination date at all, because the carve-out converts the relationship into an at-will arrangement by operation of law.",
      "It means a property management contract is exempt from every requirement in § 1101.652, because the carve-out removes management services from the subsection.",
      "It means the definite-date requirement applies to a property management contract only where the manager also holds a listing on the property, since the listing is what triggers the subdivision.",
    ],
    rationale: "The reason for the carve-out is structural: management is an open-ended operating relationship rather than a finite assignment to produce one transaction, so the Legislature does not force a fixed end date on it. The near-miss is the second choice, which pushes the carve-out too far in the same direction — permitting an evergreen term is not forbidding a stated one. Module-09 flags the common error directly: the provision says only that the statutory definite-date requirement does not apply, and a management agreement that says nothing about how it ends is bad drafting, not compliance.",
    teaches: "module-09.md#unit-management-considerations",
    source: "Texas Occupations Code § 1101.652(b)(12); § 1101.557(c)(1)",
  }),

  item("PRINS2-F127", {
    topic: "T09", unit: "T09U2",
    prompt: "A competing Texas property advertises $1,440 a month with one month free on a twelve-month lease. What is the effective rent, and why does the conversion matter before the figure is used as a comparable? (Illustrative figures.)",
    choices: [
      "$1,320 — 1,440 multiplied by 11 and divided by 12 — and the conversion matters because comparing an advertised rate against an effective rate is the most common analytical error in leasing.",
      "$1,440 — the concession is a one-time inducement rather than a rent reduction, so the advertised rate is the effective rate for comparison purposes.",
      "$1,200 — the concession reduces the rent by one month out of twelve, so the effective rent is 1,440 less one-twelfth of the annual total divided by twelve.",
      "$1,560 — the concession must be added back, because the landlord will recover it in the renewal term.",
    ],
    rationale: "One month free on a twelve-month lease means the tenant pays eleven months of rent over twelve months of occupancy: 1,440 multiplied by 11 = 15,840, divided by 12 = $1,320. The second choice is the near-miss because it is the way concessions are usually quoted in the market and it is exactly the comparison error the conversion exists to prevent. Note that vacancy is the more expensive pricing error of the two: a unit vacant one month at $1,250 costs $1,250 that is never recovered, while a unit leased $25 below market costs $300 over a twelve-month term.",
    teaches: "module-09.md#unit-management-considerations",
    source: "No statutory source — module-09 labels every dollar figure in its worked examples an illustration and states that none is a required, customary or standard figure.",
  }),

  item("PRINS2-F128", {
    topic: "T09", unit: "T09U2",
    prompt: "A Texas manager can sign a twelve-month lease today at $1,175 a month, $25 under the $1,200 market rent, or hold for market and expect the unit to sit vacant one more month before leasing at $1,200 for the remaining eleven. Which is better for the owner over the year, and by how much? (Illustrative figures.)",
    choices: [
      "Leasing today, by $900 — twelve months at $1,175 is $14,100 against eleven months at $1,200, which is $13,200; the concession costs $25 multiplied by 12, or $300 over the term, while the vacant month costs a full $1,200 that is never recovered.",
      "Holding for market, by $300 — the $25 concession compounds across the term while the vacant month is recovered when the unit leases at the higher rate.",
      "The two are equivalent, because the concession over twelve months and the single vacant month both amount to roughly one month's rent.",
      "Leasing today, by $25 — the only difference between the two outcomes is the monthly rent the owner forgoes.",
    ],
    rationale: "Twelve months at $1,175 produces $14,100 and eleven months at $1,200 produces $13,200, so leasing today is $900 better over the year. The underlying point is the one module-09 makes about pricing errors: vacancy is the more expensive of the two, because a below-market rent costs $25 multiplied by twelve months, or $300 across the term, while a month of vacancy costs a full month's rent that is never recovered. The second choice is the near-miss because it treats a vacant month as recoverable at a higher rate, which is exactly what a vacant month is not.",
    teaches: "module-09.md#unit-management-considerations",
    source: "No statutory source — module-09 states that every dollar figure and percentage in its worked examples is an illustration chosen to make the arithmetic visible and that none is required, customary or standard.",
  }),

  item("PRINS2-F129", {
    topic: "T09", unit: "T09U2",
    prompt: "Property Code § 92.056(d) supplies the number that drives a Texas maintenance program. What is it, and what may rebut it?",
    choices: [
      "There is a rebuttable presumption that seven days is a reasonable time to repair or remedy; to rebut it, the date on which the landlord received the tenant's notice, the severity and nature of the condition, and the reasonable availability of materials and labor and of utilities from a utility company must be considered.",
      "Seven days is a hard deadline; only a natural disaster extends it, and then only by the fifteen days § 92.0562 allows.",
      "There is a rebuttable presumption that thirty days is a reasonable time, rebuttable by the severity of the condition alone.",
      "There is a rebuttable presumption that seven days is a reasonable time, rebuttable only by proof that the tenant refused access to the dwelling.",
    ],
    rationale: "Section 92.056(d) states the seven-day rebuttable presumption and names the three considerations that rebut it, of which the availability of utility service from a utility company is the one most often forgotten. The second choice is the near-miss because it converts a presumption into a deadline — a burst sewer line and a slow-closing window are not on the same clock — and because it misdescribes § 92.0562, which lets a landlord who is genuinely stuck deliver a sworn affidavit for delay buying 15 days where parts cannot be obtained without the landlord's fault or 30 days after a natural disaster. Section 92.053(b) adds pressure: a landlord who gives no written explanation for delay on or before the fifth day after receiving a written demand for one carries the burden of proving diligence.",
    teaches: "module-09.md#unit-management-considerations",
    source: "Texas Property Code § 92.056(b), (d); § 92.053(b); § 92.0562",
  }),

  item("PRINS2-F130", {
    topic: "T09", unit: "T09U3",
    prompt: "A Texas property manager is told she must earn a professional designation and join a national management institute before she can manage commercial property. What is the accurate legal position?",
    choices: [
      "No Texas statute read for this course requires a property manager to hold any professional designation or to belong to any trade organization; Occupations Code § 1101.351 requires a licence — a broker or sales agent licence — of a person performing the acts of a broker, and § 1101.002(4) defines a license holder as a broker or sales agent licensed under the chapter. Designations are private and voluntary and confer no authority a license holder does not already have.",
      "A designation is required for commercial management but not for residential, because commercial leases fall outside Property Code chapter 92 and the designation substitutes for that statutory framework.",
      "A designation is not required, but membership in a trade organization is, because access to commercial listing data is conditioned on it by Occupations Code § 1101.804.",
      "Both are required for a manager who is not the designated broker of the firm, because § 1101.458's broker responsibility course may be satisfied only through an approved institute.",
    ],
    rationale: "The legal credential is the licence; designations are conferred by private organizations under their own rules and confer no authority the licence does not already give. Structured education makes managers better at a job whose failures are expensive and often invisible until they are catastrophic, which is a good reason to pursue a designation — 'it is required' is not. The third choice is the near-miss because it invokes a real section for an invented purpose: § 1101.804 is a liability shield for a license holder or nonprofit real estate board or association that provides sales price or terms information, not a membership requirement.",
    teaches: "module-09.md#unit-the-management-profession",
    source: "Texas Occupations Code § 1101.351; § 1101.002(4); § 1101.804",
  }),

  item("PRINS2-F131", {
    topic: "T09", unit: "T09U3",
    prompt: "A Texas license holder whose practice is entirely property management asks what continuing education Occupations Code § 1101.455 requires of her, and why the listed topics matter to her work.",
    choices: [
      "The Commission prescribes the classroom hours by rule, which must be at least 15 classroom hours, and at least eight of them must provide current information on enumerated legal topics — including Commission rules, fair housing laws, Property Code issues including landlord-tenant law, agency law, disclosures to buyers, landlords, tenants and sellers, and the ethical requirements of engaging in real estate brokerage — which reads like a property manager's job description.",
      "She is exempt from continuing education because property management is carved out of the Act by § 1101.652(b)(12), which excludes property management contracts from the licensed-services requirement.",
      "The Commission prescribes at least 8 classroom hours, of which at least 15 must cover legal topics, and a property manager may substitute a trade association's own course for the legal-topic hours.",
      "She must instead attend the broker responsibility course under § 1101.458, which replaces continuing education for a license holder whose practice is management.",
    ],
    rationale: "Section 1101.455(b) requires continuing education courses approved by the Commission during the term of the current licence, in a number of classroom hours the Commission prescribes by rule which must be at least 15, and § 1101.455(e) requires at least eight of those hours to cover the enumerated legal topics. The fourth choice is the near-miss because § 1101.458 is real — it requires a broker, and a sales agent who supervises another license holder, to attend a Commission-approved broker responsibility course capped at six classroom hours — but it is additional to continuing education, and § 1101.458(c) lets those hours count toward the hours described by § 1101.455(f) rather than replacing the requirement. The second choice misreads § 1101.652(b)(12), which carves property management contracts out of a definite-termination-date requirement only.",
    teaches: "module-09.md#unit-the-management-profession",
    source: "Texas Occupations Code § 1101.455(b), (e), (f); § 1101.458(a)-(d); § 1101.652(b)(12)",
  }),

  item("PRINS2-F132", {
    topic: "T09", unit: "T09U3",
    prompt: "A Texas manager takes on an office building. The commercial tenant wants to sublet part of its space, and the manager reaches for the Property Code chapter she uses on the residential side. What governs?",
    choices: [
      "Not chapter 92 — § 92.002 applies that chapter only to the relationship between landlords and tenants of residential rental property — but chapter 91, which supplies rules applicable to landlords and tenants generally, and § 91.005 provides that during the term of a lease the tenant may not rent the leasehold to any other person without the prior consent of the landlord.",
      "Chapter 92, because its subletting provisions apply to any Texas tenancy and are non-waivable under § 92.006(a).",
      "Neither chapter — subletting in a commercial lease is governed entirely by the lease document, and Texas supplies no default rule.",
      "Chapter 91, and § 91.005 permits subletting unless the lease forbids it, which is why commercial leases carry an express anti-assignment clause.",
    ],
    rationale: "Section 92.002 confines chapter 92 to residential rental property, so a commercial tenancy runs on the lease and on chapter 91, which supplies rules applicable to landlords and tenants generally — including § 91.001 on terminating a month-to-month tenancy, § 91.004 on a landlord's failure to comply with the lease, and § 91.006's non-waivable duty to mitigate. The fourth choice is the near-miss because it identifies the right chapter and inverts the default: § 91.005 is a restrictive default, providing that the tenant may NOT rent the leasehold to another without the landlord's prior consent, which is the opposite of what many students assume.",
    teaches: "module-09.md#unit-the-management-profession",
    source: "Texas Property Code § 92.002; § 91.001; § 91.004; § 91.005; § 91.006",
  }),
]);

/* ── The blueprint the bank was authored to: items per topic, allocated proportionally to the
      PRINS2-1 form's own prescribed minutes, with a floor of six per topic so that every topic can
      be sampled in every one of the four versions. T01 sits above its strictly proportional share
      (30 of 1,500 minutes would be under three items) because the floor governs; the remaining
      topics absorb the difference and are checked against their proportional share below. ───── */
export const TOPIC_BLUEPRINT = Object.freeze({
  T01: 6, T02: 23, T03: 19, T04: 11, T05: 9, T06: 21, T07: 17, T08: 15, T09: 11,
});

export const BANK_SIZE = FINAL_EXAM_BANK.length;

/* Aliases the repository's existing PRINS2 tooling reads — scripts/validate-prins2-assessments.mjs,
   scripts/prins2-acceptance-report.mjs and scripts/report-prins2-traceability.mjs each resolve the
   bank as `ITEMS || BANK`. Same frozen array under three names; nothing here is a second copy. */
export const ITEMS = FINAL_EXAM_BANK;
export const BANK = FINAL_EXAM_BANK;

/* ── Load-time invariants. The bank refuses to load in any inconsistent state rather than
      exporting something broken. ─────────────────────────────────────────────────────────── */

const topicCodes = new Set(TOPICS.map((topic) => topic.code));
const unitCodes = new Map(ALL_UNITS.map((unit) => [unit.code, unit.topicCode]));
const anchorShape = /^module-0[1-9]\.md#[a-z0-9-]+$/;
const trueFalseWords = new Set(["true", "false", "t", "f", "yes", "no"]);

const seenIds = new Set();
const seenPrompts = new Map();
const perTopic = new Map();

for (const entry of FINAL_EXAM_BANK) {
  if (seenIds.has(entry.id)) throw new Error(`final exam bank: duplicate item id ${entry.id}`);
  seenIds.add(entry.id);

  if (!topicCodes.has(entry.topic)) {
    throw new Error(`final exam bank: ${entry.id} names unknown PRINS2-1 topic ${entry.topic}`);
  }
  if (!unitCodes.has(entry.unit)) {
    throw new Error(`final exam bank: ${entry.id} names unknown PRINS2-1 unit ${entry.unit}`);
  }
  if (unitCodes.get(entry.unit) !== entry.topic) {
    throw new Error(`final exam bank: ${entry.id} places unit ${entry.unit} under topic ${entry.topic}`);
  }

  if (!Array.isArray(entry.choices) || entry.choices.length !== 4) {
    throw new Error(`final exam bank: ${entry.id} must offer exactly four choices, not ${entry.choices?.length}`);
  }
  if (entry.correctChoice !== 0) {
    throw new Error(`final exam bank: ${entry.id} must author the correct answer first (correctChoice 0)`);
  }
  if (new Set(entry.choices).size !== entry.choices.length) {
    throw new Error(`final exam bank: ${entry.id} repeats a choice`);
  }
  for (const choice of entry.choices) {
    if (typeof choice !== "string" || choice.trim().length < 12) {
      throw new Error(`final exam bank: ${entry.id} has a choice too short to be a real distractor`);
    }
    const bare = choice.trim().toLowerCase().replace(/[.,;:!?"'()]/g, "");
    if (trueFalseWords.has(bare)) {
      throw new Error(`final exam bank: ${entry.id} is true/false-shaped — a choice reads "${choice}"`);
    }
  }

  if (!entry.prompt || entry.prompt.trim().length < 24) {
    throw new Error(`final exam bank: ${entry.id} lacks a usable prompt`);
  }
  if (/\btrue or false\b/i.test(entry.prompt)) {
    throw new Error(`final exam bank: ${entry.id} is a true/false item; § 535.62(b)(7)(H)(ii) forbids them`);
  }
  if (!entry.rationale || entry.rationale.trim().length < 40) {
    throw new Error(`final exam bank: ${entry.id} lacks a rationale`);
  }
  if (!entry.source || entry.source.trim().length < 8) {
    throw new Error(`final exam bank: ${entry.id} lacks a controlling source`);
  }

  if (!entry.teaches) throw new Error(`final exam bank: ${entry.id} lacks a teaches anchor`);
  if (!anchorShape.test(entry.teaches)) {
    throw new Error(`final exam bank: ${entry.id} has a malformed teaches anchor "${entry.teaches}"`);
  }
  if (entry.teaches !== UNIT_ANCHORS[entry.unit]) {
    throw new Error(
      `final exam bank: ${entry.id} teaches "${entry.teaches}" but unit ${entry.unit} is taught at "${UNIT_ANCHORS[entry.unit]}"`,
    );
  }

  const promptKey = entry.prompt.trim().toLowerCase().replace(/\s+/g, " ");
  if (seenPrompts.has(promptKey)) {
    throw new Error(`final exam bank: ${entry.id} duplicates the prompt of ${seenPrompts.get(promptKey)}`);
  }
  seenPrompts.set(promptKey, entry.id);

  perTopic.set(entry.topic, (perTopic.get(entry.topic) ?? 0) + 1);
}

if (BANK_SIZE < ASSESSMENT_REQUIREMENTS.minExamBankQuestions) {
  throw new Error(
    `final exam bank: ${BANK_SIZE} items against the § 535.62(b)(7) floor of ${ASSESSMENT_REQUIREMENTS.minExamBankQuestions}`,
  );
}

for (const topic of TOPICS) {
  const count = perTopic.get(topic.code) ?? 0;
  if (count < MIN_ITEMS_PER_TOPIC) {
    throw new Error(`final exam bank: topic ${topic.code} carries ${count} items against a minimum of ${MIN_ITEMS_PER_TOPIC}`);
  }
  if (count !== TOPIC_BLUEPRINT[topic.code]) {
    throw new Error(`final exam bank: topic ${topic.code} carries ${count} items against a blueprint of ${TOPIC_BLUEPRINT[topic.code]}`);
  }
}
if (Object.values(TOPIC_BLUEPRINT).reduce((sum, n) => sum + n, 0) !== BANK_SIZE) {
  throw new Error("final exam bank: the topic blueprint does not total the bank size");
}
for (const code of Object.keys(TOPIC_BLUEPRINT)) {
  if (!topicCodes.has(code)) throw new Error(`final exam bank: blueprint names unknown topic ${code}`);
}
for (const code of Object.keys(UNIT_ANCHORS)) {
  if (!unitCodes.has(code)) throw new Error(`final exam bank: UNIT_ANCHORS names unknown unit ${code}`);
}
for (const unit of ALL_UNITS) {
  if (!UNIT_ANCHORS[unit.code]) throw new Error(`final exam bank: UNIT_ANCHORS is missing unit ${unit.code}`);
}

/* Proportionality against the form's prescribed minutes, recorded rather than asserted. Two
   figures are reported for each topic. `rawProportionalItems` is the topic's share of the full
   1,500 prescribed minutes applied to the whole bank — the naive figure. `adjustedProportionalItems`
   is the figure the blueprint was actually built to: T01 is raised to MIN_ITEMS_PER_TOPIC because
   30 prescribed minutes would otherwise buy fewer than three items and a topic below the floor
   could not appear in every version, and the remaining 126 items are then distributed across the
   remaining 1,470 prescribed minutes in proportion. The assertion below is against the adjusted
   figure, with a tolerance of one item, which is what integer rounding needs. */
const totalMinutes = TOPICS.reduce((sum, topic) => sum + topic.subtotalMinutes, 0);
const floorTopics = TOPICS.filter((topic) => (topic.subtotalMinutes / totalMinutes) * BANK_SIZE < MIN_ITEMS_PER_TOPIC);
const floorTopicCodes = new Set(floorTopics.map((topic) => topic.code));
const floorItems = floorTopics.length * MIN_ITEMS_PER_TOPIC;
const floorMinutes = floorTopics.reduce((sum, topic) => sum + topic.subtotalMinutes, 0);
const remainingItems = BANK_SIZE - floorItems;
const remainingMinutes = totalMinutes - floorMinutes;

const round2 = (n) => Math.round(n * 100) / 100;

export const TOPIC_PROPORTIONALITY = Object.freeze(
  Object.fromEntries(
    TOPICS.map((topic) => {
      const raw = (topic.subtotalMinutes / totalMinutes) * BANK_SIZE;
      const adjusted = floorTopicCodes.has(topic.code)
        ? MIN_ITEMS_PER_TOPIC
        : (topic.subtotalMinutes / remainingMinutes) * remainingItems;
      return [
        topic.code,
        Object.freeze({
          prescribedMinutes: topic.subtotalMinutes,
          rawProportionalItems: round2(raw),
          adjustedProportionalItems: round2(adjusted),
          actualItems: TOPIC_BLUEPRINT[topic.code],
          floorGoverns: floorTopicCodes.has(topic.code),
        }),
      ];
    }),
  ),
);
for (const [code, row] of Object.entries(TOPIC_PROPORTIONALITY)) {
  if (Math.abs(row.actualItems - row.adjustedProportionalItems) > 1) {
    throw new Error(
      `final exam bank: topic ${code} carries ${row.actualItems} items against an adjusted proportional share of ${row.adjustedProportionalItems}`,
    );
  }
}

/* ── The version-assembly design, computed here so the bank's own export is self-contained. ──
   The topic-ordered bank is dealt into 22 cells of six items each by cell(i) = (3i mod 22) + 1.
   Three is coprime with 22, so the map is a bijection on residues and every cell receives exactly
   six items; the stride of three also spreads each topic's consecutive items across cells that sit
   on different versions, which is what lets the smallest topic reach all four versions. Each
   version is ten cells — sixty items — chosen so that each PAIR of versions shares exactly three
   cells, or eighteen items, which is 30 percent of a sixty-item version and therefore strictly
   under the § 535.62(b)(7)(H)(iii) one-third cap. Four cells sit on one version only. The forms
   file recomputes and re-verifies all of this rather than trusting it. */
export const CELL_COUNT = 22;
export const CELL_STRIDE = 3;

export const ITEM_CELLS = Object.freeze(
  FINAL_EXAM_BANK.map((entry, index) => Object.freeze({ id: entry.id, cell: ((CELL_STRIDE * index) % CELL_COUNT) + 1 })),
);

export const FORM_CELLS = Object.freeze({
  A: Object.freeze([1, 2, 3, 4, 5, 6, 7, 8, 9, 19]),
  B: Object.freeze([1, 2, 3, 10, 11, 12, 13, 14, 15, 20]),
  C: Object.freeze([4, 5, 6, 10, 11, 12, 16, 17, 18, 21]),
  D: Object.freeze([7, 8, 9, 13, 14, 15, 16, 17, 18, 22]),
});

const cellSizes = new Map();
for (const row of ITEM_CELLS) cellSizes.set(row.cell, (cellSizes.get(row.cell) ?? 0) + 1);
if (cellSizes.size !== CELL_COUNT) {
  throw new Error(`final exam bank: the cell map produced ${cellSizes.size} cells rather than ${CELL_COUNT}`);
}
const expectedCellSize = BANK_SIZE / CELL_COUNT;
if (!Number.isInteger(expectedCellSize)) {
  throw new Error(`final exam bank: ${BANK_SIZE} items do not divide evenly into ${CELL_COUNT} cells`);
}
for (const [cell, size] of cellSizes) {
  if (size !== expectedCellSize) {
    throw new Error(`final exam bank: cell ${cell} holds ${size} items rather than ${expectedCellSize}`);
  }
}

export default Object.freeze({
  FINAL_EXAM_BANK,
  ITEMS,
  BANK,
  BANK_SIZE,
  TOPIC_BLUEPRINT,
  TOPIC_PROPORTIONALITY,
  UNIT_ANCHORS,
  ITEM_CELLS,
  FORM_CELLS,
  CELL_COUNT,
  CELL_STRIDE,
  MIN_ITEMS_PER_TOPIC,
});
