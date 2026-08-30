/**
 * Texas Law of Agency — the seven required misconception checks, inventoried.
 *
 * WHY THEY EXIST. After the reduction passes, exact-seconds arithmetic showed six topics sitting a
 * fraction below their own LOA-1 allocation, and LOA-1's topic subtotals are topic-specific minima —
 * a surplus in one topic may not cure a shortfall in another. Restoring deleted repetition to close
 * those gaps would have been padding under a different name. A misconception check is work a student
 * actually does: it names an error licence holders genuinely make in that topic, asks for a
 * decision, and then explains why the intuition fails, citing the provision that settles it.
 *
 * WHAT THEY ARE NOT. They are FORMATIVE INSTRUCTIONAL ACTIVITY, not topic-quiz items. None of them
 * satisfies every rule applicable to a formal topic quiz — they are not drawn from the secure bank,
 * they carry no replacement item, and passing one is not a progression gate. They are therefore
 * counted once, as instruction, and never again as assessment. The time evidence budgets them under
 * "required misconception checks" and the quiz segment counts only the 58 primary quiz items.
 *
 * THE THREE MINUTES. Read the scenario and the stated misconception, choose among options, read the
 * rationale. Each check below carries enough prompt, decision and feedback to occupy that; a check
 * that were only a single sentence and a yes/no would not, and the load-time invariants enforce a
 * floor on each part rather than trusting the author.
 *
 * NO WRITING GATES. Every check is an objective selection. None asks for free text, and none states
 * a length requirement — the work order forbids requiring a student to type a quota of characters to
 * reveal an answer, and that prohibition is enforced mechanically below.
 *
 * ONE GENUINE ATTEMPT. A check completes after the student answers once and reads the feedback.
 * It does not loop until correct; guessing repeatedly teaches nothing and inflates time.
 */

import { TOPICS } from "./law-of-agency-course-form.mjs";
import { BUDGET, RATES } from "./law-of-agency-time-budget.mjs";

const check = (o) => Object.freeze({ ...o, format: "SELECTION", singleAttempt: true,
  classification: "FORMATIVE_INSTRUCTIONAL", countsAsAssessment: false,
  minutes: RATES.activityMinutes.misconceptionCheck });

export const MISCONCEPTION_CHECKS = Object.freeze([
  check({
    id: "MC-T01",
    topicCode: "T01", unitCode: "T01U3",
    unit: "Roles People Play in Agency Relationships - Client or Customer?",
    misconception: "The person who pays me is my client.",
    whyItIsHeld: "Compensation is the most visible fact in a transaction and the one a new licence holder is most conscious of, so it is the fact they reach for when asked who they represent.",
    prompt: "A buyer asks you to show a listed house. You show it, the buyer makes an offer through you, and at closing the listing broker's office pays your broker a share of the commission. No representation agreement was ever signed with the buyer. Who did you represent?",
    options: Object.freeze([
      "The buyer, because the buyer's purchase is what generated the payment.",
      "The seller, because the seller's side paid the compensation.",
      "Nobody, unless an agreement created the representation — the source of payment does not decide it.",
      "Both parties, because you acted for the buyer and were paid by the seller's side.",
    ]),
    correctChoice: 2,
    rationale: "Section 1101.557 sets out what a licence holder representing a party must do and mentions compensation nowhere. Representation arises from an agreement, and for a prospective buyer of residential real property § 1101.563(b) now requires that agreement to be in writing before the property is shown. Payment is a separate question, governed by § 1101.651 and § 535.3 — which is why a broker can be paid by one side while representing the other, and why being paid by nobody does not mean you represented nobody.",
    sources: Object.freeze(["Occ. Code § 1101.557", "Occ. Code § 1101.563(b)", "Occ. Code § 1101.651", "22 TAC § 535.3"]),
  }),
  check({
    id: "MC-T02",
    topicCode: "T02", unitCode: "T02U5",
    unit: "Information About Brokerage Services - Disclosure of Representation",
    misconception: "Handing someone the IABS notice establishes that I represent them.",
    whyItIsHeld: "The notice is titled Information About Brokerage Services and is delivered at the first substantive moment of a relationship, so it feels like the document that starts one.",
    prompt: "At an open house you give a visitor the IABS notice and your card. The visitor later says you are their agent because you gave them 'the agency form'. What did delivering the notice actually do?",
    options: Object.freeze([
      "It created a representation relationship, which is what the notice is for.",
      "It disclosed what brokerage services are and whom you represent; it created nothing.",
      "It created representation only if the visitor kept the notice.",
      "It made the visitor a customer rather than a client, which is a form of representation.",
    ]),
    correctChoice: 1,
    rationale: "Section 1101.558(b) requires a licence holder to disclose whom the licence holder represents at first contact, and (b-1) requires the written notice adopted by 22 TAC § 531.20. Both are disclosure obligations. Neither creates a relationship, and the notice's own function is to tell a person what the broker's role is — including that the broker may not represent them at all.",
    sources: Object.freeze(["Occ. Code § 1101.558(b)", "Occ. Code § 1101.558(b-1)", "22 TAC § 531.20"]),
  }),
  check({
    id: "MC-T05",
    topicCode: "T05", unitCode: "T05U3",
    unit: "The Creation of Buyer Agency",
    misconception: "I can show the house first and paper the agreement afterwards.",
    whyItIsHeld: "It was ordinary practice before 1 January 2026, and habits formed under the old rule survive the rule that ended them.",
    prompt: "A prospective buyer calls on Saturday morning about a single-family house listed for sale. Nothing is signed. What must happen before you show it?",
    options: Object.freeze([
      "Nothing — a written agreement is due before an offer is presented, not before a showing.",
      "A written representation agreement, or a written showing-only agreement, must be in place before the property is shown.",
      "An oral agreement is enough for the showing if it is confirmed in writing within fourteen days.",
      "The IABS notice alone satisfies the requirement.",
    ]),
    correctChoice: 1,
    rationale: "Section 1101.563(b), effective 1 January 2026, requires a written agreement before a broker shows residential real property to a prospective buyer, and again before presenting an offer — two triggers, not one. Section 1101.562 permits a showing without representation, but on four conjunctive conditions and with its own written agreement, which § 1101.563(e) limits to a term of fourteen days and forbids to be exclusive. The IABS notice is a disclosure and satisfies neither.",
    sources: Object.freeze(["Occ. Code § 1101.563(b)", "Occ. Code § 1101.563(e)", "Occ. Code § 1101.562"]),
  }),
  check({
    id: "MC-T06",
    topicCode: "T06", unitCode: "T06U5",
    unit: "Intentional versus Unintended Dual Representation",
    misconception: "Texas permits dual agency when both parties consent in writing.",
    whyItIsHeld: "National study material and licensing courses in other states teach dual agency as the standard answer to a two-sided transaction, and students arrive carrying it.",
    prompt: "Your broker has the listing and you have brought the buyer. Both parties are willing to sign whatever is needed. What capacity may the broker occupy?",
    options: Object.freeze([
      "Dual agent, since both parties have consented in writing.",
      "Intermediary, on written consent, with or without appointments.",
      "Dual agent for the negotiation and intermediary for the closing.",
      "Neither — the broker must withdraw from one side.",
    ]),
    correctChoice: 1,
    rationale: "The words dual agent and dual agency appear nowhere in Chapter 1101 or in any Commission rule held for this course. Texas did not permit the capacity and then regulate it; the capacity does not exist here. Section 1101.559 lets a broker act as an intermediary on the parties' written consent, § 1101.560 allows appointment of associated licence holders, and § 1101.561(b) makes the intermediary posture mandatory when the broker acts for both. Withdrawal is not required.",
    sources: Object.freeze(["Occ. Code § 1101.559", "Occ. Code § 1101.560", "Occ. Code § 1101.561(b)"]),
  }),
  check({
    id: "MC-T07",
    topicCode: "T07", unitCode: "T07U3",
    unit: "Duties of Agency that Survive Termination",
    misconception: "Once the listing expires, what the seller told me is no longer confidential.",
    whyItIsHeld: "Every other obligation in the agreement ends with it, so confidentiality is assumed to end with it too.",
    prompt: "A listing you held expired three months ago and the seller did not relist with you. During the listing the seller told you privately that they would have taken $12,000 under the asking price to close before the school year. A buyer's agent working the same street now asks you, in conversation, what the seller would have accepted. May you answer?",
    options: Object.freeze([
      "Yes — the agreement ended, and with it the duty.",
      "Yes, if the seller has since listed with another broker.",
      "No. The prohibition on disclosing what a party would accept states no expiry.",
      "Only the price, not the seller's reasons.",
    ]),
    correctChoice: 2,
    rationale: "Section 1101.651(d) forbids disclosing that a party will accept a price other than the one submitted, and its own text fixes no period after which the prohibition lapses. No held source states a duration for the confidentiality obligation, and that absence is recorded in this course rather than filled by assumption. The safe reading, and the one the statute's silence supports, is that the duty does not expire with the agreement.",
    sources: Object.freeze(["Occ. Code § 1101.651(d)", "22 TAC § 531.2", "22 TAC § 535.156"]),
  }),
  check({
    id: "MC-T10",
    topicCode: "T10", unitCode: "T10U2",
    unit: "Federal and State Law Relating to Conduct",
    misconception: "Steering is only a violation if I say something explicitly discriminatory.",
    whyItIsHeld: "Discrimination is imagined as a statement, so conduct that never states anything feels safe.",
    prompt: "A buyer asks you which neighbourhoods have 'families like ours' and names a protected characteristic. You say nothing in reply and simply send listings in two areas. Where is the risk?",
    options: Object.freeze([
      "Nowhere — you made no statement about the characteristic.",
      "Only if the buyer can show you intended to discriminate.",
      "In responding to and facilitating the inquiry at all, and in letting it shape the listings you sent.",
      "Only in the listings, since sending them is the act with an effect.",
    ]),
    correctChoice: 2,
    rationale: "22 TAC § 531.19 reaches a licence holder who inquires about, responds to, facilitates inquiries about, or discloses a preference based on the listed characteristics. Responding and facilitating are named alongside disclosing, so silence about the characteristic while acting on it is within the rule. 42 U.S.C. § 3604(a)-(c) and Property Code §§ 301.021-301.027 reach the underlying conduct, and Occ. Code § 1101.652(b)(32) makes it a ground for discipline.",
    sources: Object.freeze(["22 TAC § 531.19", "42 U.S.C. § 3604", "Property Code § 301.021", "Occ. Code § 1101.652(b)(32)"]),
  }),
  check({
    id: "MC-T12",
    topicCode: "T12", unitCode: "T12U4",
    unit: "Other Considerations",
    misconception: "A team name is fine in my advertising as long as my broker knows about it.",
    whyItIsHeld: "The broker's knowledge feels like the thing the rule is protecting, so telling the broker feels like compliance.",
    prompt: "You and two colleagues start calling yourselves a team and put the name on signs and a website. Your sponsoring broker approves. What else does the rule require?",
    options: Object.freeze([
      "Nothing further; the broker's approval is the requirement.",
      "The name must be registered with the Commission, and the broker's name must appear with it.",
      "Registration only if the team advertises outside its own county.",
      "A separate business entity licence for the team.",
    ]),
    correctChoice: 1,
    rationale: "22 TAC § 535.154 requires an alternate, team or assumed business name used in advertising to be registered with the Commission before use, and § 535.155 requires advertising to include the name of the broker. A broker's approval is necessary and is not sufficient. No separate entity licence is created by using a team name.",
    sources: Object.freeze(["22 TAC § 535.154", "22 TAC § 535.155"]),
  }),
]);

/* ── load-time invariants ───────────────────────────────────────────────────────────────────── */

const LENGTH_PHRASE = /\b(?:at least|minimum of|no fewer than)\s+\d+\s*(?:words?|characters?|sentences?)\b/i;
const codes = new Set(TOPICS.map((t) => t.code));

for (const c of MISCONCEPTION_CHECKS) {
  if (!codes.has(c.topicCode)) throw new Error(`misconception check ${c.id}: ${c.topicCode} is not an LOA-1 topic`);
  const topic = TOPICS.find((t) => t.code === c.topicCode);
  const unit = topic.units.find((u) => u.code === c.unitCode);
  if (!unit) throw new Error(`misconception check ${c.id}: ${c.unitCode} is not a unit of ${c.topicCode}`);
  if (unit.unit !== c.unit) throw new Error(`misconception check ${c.id}: unit title does not match the form — form says ${JSON.stringify(unit.unit)}`);
  /* Enough prompt, decision and feedback to occupy the three minutes claimed. */
  if (c.misconception.length < 25) throw new Error(`misconception check ${c.id}: no misconception stated`);
  if (c.whyItIsHeld.length < 60) throw new Error(`misconception check ${c.id}: does not record why the misconception is genuinely held`);
  if (c.prompt.length < 120) throw new Error(`misconception check ${c.id}: prompt too thin to justify its allowance`);
  if (c.options.length < 3) throw new Error(`misconception check ${c.id}: ${c.options.length} options — a decision needs real alternatives`);
  if (c.rationale.length < 250) throw new Error(`misconception check ${c.id}: rationale too thin to justify its allowance`);
  if (!Number.isInteger(c.correctChoice) || c.correctChoice < 0 || c.correctChoice >= c.options.length) {
    throw new Error(`misconception check ${c.id}: correctChoice does not address an option`);
  }
  if (!c.sources.length) throw new Error(`misconception check ${c.id}: cites no source`);
  /* Objective selection only. No free text, and no character or word quota anywhere. */
  if (c.format !== "SELECTION") throw new Error(`misconception check ${c.id}: must be an objective selection`);
  for (const field of [c.prompt, c.rationale, ...c.options]) {
    if (LENGTH_PHRASE.test(field)) throw new Error(`misconception check ${c.id}: states a length requirement`);
  }
  /* Counted once, as instruction. Never also as assessment. */
  if (c.countsAsAssessment !== false) throw new Error(`misconception check ${c.id}: would be counted twice`);
  if (c.classification !== "FORMATIVE_INSTRUCTIONAL") throw new Error(`misconception check ${c.id}: misclassified`);
  if (c.singleAttempt !== true) throw new Error(`misconception check ${c.id}: must complete after one genuine attempt and its feedback`);
}

/* The inventory and the time budget must agree, per topic, or one of them is fiction. */
for (const b of BUDGET) {
  const authored = MISCONCEPTION_CHECKS.filter((c) => c.topicCode === b.topicCode).length;
  if (authored !== b.misconceptionChecks) {
    throw new Error(`misconception checks: ${b.topicCode} budgets ${b.misconceptionChecks} but ${authored} are authored`);
  }
}

export const TOTAL_MINUTES = MISCONCEPTION_CHECKS.reduce((s, c) => s + c.minutes, 0);

export default { MISCONCEPTION_CHECKS, TOTAL_MINUTES };
