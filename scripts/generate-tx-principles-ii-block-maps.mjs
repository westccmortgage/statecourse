/**
 * TX-BLOCK — generate learning-block maps for Texas Principles of Real Estate II.
 *
 * Same generator core as Principles I (scripts/lib/generate-tx-block-maps.mjs): screen ranges are
 * derived from each frozen module's own headings, never by copying text. The unit codes are the
 * PRINS2-1 form's own T<topic>U<unit> codes, transcribed in config/texas/principles-ii-course-form.mjs
 * from the form 22 TAC 535.64(a)(2) adopts by reference.
 *
 * Learning objectives are the ones each module states in its own front matter, split one per unit —
 * verified 1:1 against every module's "## Unit:" count before this file was written. They are held
 * here rather than re-derived at generate time so that editing a module's prose cannot silently
 * change a generated objective without someone noticing the diff.
 *
 * Regenerate with:  node scripts/generate-tx-principles-ii-block-maps.mjs
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { TOPICS } from "../config/texas/principles-ii-course-form.mjs";
import { generateModuleBlocks } from "./lib/generate-tx-block-maps.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const UNIT_OBJECTIVES = Object.freeze({
  T01U1: "State the order of operations a calculation must follow, use a calculator's memory and percent functions without introducing error, and apply a rounding rule that keeps a commission or proration accurate to the cent.",
  T01U2: "Convert among fractions, decimals and percentages, compute any one of part, whole or rate from the other two, and distinguish a percentage increase from a percentage decrease when applying either to commission splits, list-to-sale price ratios and fractional ownership shares.",
  T02U1: "Distinguish depository from non-depository sources of mortgage money and identify which party originates, funds, and services a loan.",
  T02U2: "Explain why a secondary mortgage market exists and describe the standardizing function the statutes themselves acknowledge.",
  T02U3: "Identify the disclosures a Texas home loan applicant must receive at application and state what the Equal Credit Opportunity Act forbids a creditor to consider.",
  T02U4: "Compute a fully amortizing monthly payment and the first months of its amortization schedule, and explain how negative amortization arises.",
  T02U5: "Distinguish the structural difference between a conventional loan, an FHA-insured loan, and a VA-guaranteed loan without misstating program figures.",
  T02U6: "State what Texas Finance Code chapter 343 requires and prohibits for home loans and high-cost home loans.",
  T02U7: "Explain in economic terms how central bank policy and government-sponsored enterprise activity influence mortgage rates and credit availability.",
  T02U8: "Identify the notice, disclosure, recording, and equity-protection duties Texas Property Code chapter 5, subchapter D imposes on a seller who finances by executory contract.",
  T02U9: "Apply 12 U.S.C. \u00a7 2607 to a proposed referral-fee arrangement involving a Texas license holder.",
  T03U1: "State, from Chapter 1103 of the Texas Occupations Code, who regulates appraisers in Texas, what credential categories the statute authorizes, and how the statute structures the education, experience and examination requirements.",
  T03U2: "Define the core vocabulary of appraisal \u2014 market value, price, cost, highest and best use, the four characteristics of value, the three forms of depreciation, gross living area, comparable, and adjustment \u2014 and distinguish the terms that are commonly confused.",
  T03U3: "List the steps of the appraisal process in order and describe what the appraiser does at each step.",
  T03U4: "Explain the economic principles that drive value and identify each one at work in a Texas example.",
  T03U5: "Compute an indication of value under the sales comparison, cost and income approaches and explain which approach dominates in which assignment.",
  T03U6: "Prepare and communicate a price opinion for a seller within the boundary Occupations Code \u00a7 1101.002(1) draws between brokerage and appraisal.",
  T04U1: "Distinguish the four leasehold estates and state how each is created and how each terminates.",
  T04U2: "Identify which acts in a lease transaction require a Texas real estate license and which fall inside a statutory exemption.",
  T04U3: "Explain the function of each common lease provision and identify the party each one protects.",
  T04U4: "State the landlord's statutory repair duty, the tenant's notice obligations, the security deposit deadlines, and the penalties for bad faith under Texas Property Code chapter 92.",
  T04U5: "Compute rent under a percentage lease and classify a lease as gross, net, ground, index, or sale-leaseback.",
  T05U1: "Identify the statutory sources of public and private land-use control in Texas, distinguish a zoning restriction from a recorded restrictive covenant, and state where each is found.",
  T05U2: "Explain the framework by which government acquires and holds interests in private land, including condemnation, dedication, and the state's interest in water and navigable streams.",
  T05U3: "Identify the environmental conditions a Texas seller's disclosure notice puts in issue and state the license holder's duty when a known condition affects a property.",
  T06U1: "State what The Real Estate License Act is, identify the statutory definitions of \"broker,\" \"sales agent,\" \"license holder\" and \"real estate,\" and explain the consumer-protection purpose the Act serves.",
  T06U2: "Identify each of the seventeen subchapters of Occupations Code chapter 1101 by the subject it governs and state at least one operative proposition from each.",
  T06U3: "Distinguish a state-issued real estate license from voluntary membership in a private trade association such as the National Association of REALTORS\u00ae, Texas REALTORS\u00ae or a local board, and explain that no held source makes such membership a condition of licensure.",
  T06U4: "Explain how value is created, measured and captured in a real estate transaction and describe the license holder's economic role in that process.",
  T06U5: "List the acts a license holder may perform under \u00a7 1101.002(1) and identify the boundaries of that authority, including the unauthorized practice of law, the line between an appraisal and a broker's price opinion, and the conduct prohibited by \u00a7 1101.652.",
  T06U6: "State the composition and powers of the Texas Real Estate Commission and describe the education, examination, sponsorship and fitness requirements a person must satisfy to be licensed as a sales agent in Texas.",
  T07U1: "Define agency and identify the principal, agent, client and customer in a Texas transaction, distinguish express, implied, ratified and estoppel-based agency, and distinguish actual from apparent authority.",
  T07U2: "Identify which agency position a Texas license holder occupies in a given transaction \u2014 seller representation, buyer representation, intermediary, or a non-representation showing \u2014 and state the written consent, appointment, notice and written-agreement requirements that attach to each.",
  T07U3: "Explain how a Texas brokerage is organized, how a sales agent's authority flows through a sponsoring broker, and how compensation is earned, paid and disclosed.",
  T07U4: "State each fiduciary duty and identify the subsection of Occupations Code \u00a7 1101.652 that turns a breach of it into a ground for discipline.",
  T07U5: "Apply the Texas Deceptive Trade Practices\u2013Consumer Protection Act to a real estate misrepresentation by identifying whether the complainant is a \"consumer,\" which enumerated practice is implicated, and what the \"knowingly\" and \"intentionally\" findings do to the damages available.",
  T08U1: "State the protected classes listed in each subsection of 42 U.S.C. \u00a7 3604 and distinguish a reasonable accommodation from a reasonable modification under \u00a7 3604(f)(3).",
  T08U2: "Identify the protected classes, prohibited practices, exemptions and enforcement path of the Texas Fair Housing Act, Property Code ch. 301, and name the agency that administers it.",
  T08U3: "Define steering, blockbusting and discriminatory advertising and identify the provision each violates, including the licence-discipline ground in Occupations Code \u00a7 1101.652(b)(32).",
  T08U4: "State the prohibited bases and permitted inquiries under the Equal Credit Opportunity Act, 15 U.S.C. \u00a7 1691(a) and (b), and explain the adverse-action notification owed under \u00a7 1691(d).",
  T08U5: "Explain the congressional findings and purpose of the Community Reinvestment Act, 12 U.S.C. \u00a7 2901, and distinguish that affirmative community-credit obligation from an individual anti-discrimination claim.",
  T09U1: "Identify the functions a Texas property manager performs, state from Occupations Code \u00a7 1101.002(1) which management acts are acts of a broker, apply the exemptions in \u00a7 1101.005 to decide whether a particular person managing a particular Texas property needs a license, and state the four trust-money grounds for discipline in \u00a7 1101.652(b)(9), (10), (30) and (31).",
  T09U2: "Identify the terms a management agreement must settle, explain why \u00a7 1101.652(b)(12) carves property management contracts out of the definite-termination-date requirement, compute effective gross income and net operating income from gross potential rent, vacancy and collection loss and operating expenses, and connect the Property Code ch. 92 repair duty to the design of a maintenance program.",
  T09U3: "Distinguish the manager's fiduciary obligation to the owner from the statutory duties that ch. 92 owes the tenant, describe the asset types and career paths inside the management profession, and distinguish a voluntary professional designation from a legal requirement.",
});

const course = {
  root,
  curriculumDir: path.join(root, "texas/tx-principles-real-estate-ii-30-v1/curriculum"),
  courseId: "tx-principles-real-estate-ii-30-v1",
  unitObjectives: UNIT_OBJECTIVES,
  outFile: (moduleNumber) => path.join(root, `config/texas/principles-ii-module-${moduleNumber}-blocks.mjs`),
};

for (const [index, topic] of TOPICS.entries()) {
  const moduleNumber = index + 1;
  const unitCodes = topic.units.map((unit) => unit.code);
  const outPath = generateModuleBlocks({ ...course, unitCodes }, moduleNumber);
  console.log("generated", path.relative(root, outPath), `(${unitCodes.length} units)`);
}
