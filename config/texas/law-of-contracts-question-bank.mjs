/** Topic-quiz checkpoint for Texas Law of Contracts Topic 01. Formative only; not a final exam. */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { TOPICS } from "./law-of-contracts-course-form.mjs";
import { MODULE_1_SOURCES } from "./law-of-contracts-module-1-sources.mjs";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const MODULE_PATH = "texas/tx-law-of-contracts-30-v1/curriculum/module-01.md";

const slug = (heading) =>
  heading
    .replace(/^#+\s+/u, "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[“”'\u2018\u2019]/gu, "")
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "");

const item = (record) => {
  const sourceRefs = Object.freeze(record.sourceRefs.map((entry) => Object.freeze(entry)));
  const source = sourceRefs.map((entry) => entry.sourceId).join("; ");
  const section = sourceRefs.map((entry) => entry.section).join("; ");
  const shared = Object.freeze({
    unit: record.unit,
    tests: record.unit,
    module: "module-01",
    contentAnchor: record.contentAnchor,
    remediation: `module-01.md#${slug(record.contentAnchor)}`,
    sourceRefs,
    source,
    section,
  });
  return Object.freeze({
    ...record,
    ...shared,
    correctChoice: 0,
    choices: Object.freeze(record.choices),
    replacement: Object.freeze({
      ...record.replacement,
      ...shared,
      id: `${record.id}-R`,
      correctChoice: 0,
      choices: Object.freeze(record.replacement.choices),
    }),
  });
};

export const TOPIC_1_QUIZ = Object.freeze([
  item({
    id: "LOC-T01-Q01",
    unit: "T01U1",
    contentAnchor: "### Statutory people and activities",
    sourceRefs: [
      { sourceId: "loc-oc-1101", section: "1101.002" },
      { sourceId: "loc-oc-1101", section: "1101.004" },
    ],
    judgement: "Apply the functional brokerage definition instead of a job title.",
    prompt: "A paid transaction coordinator calls herself a consultant but negotiates lease terms for another person while expecting a fee. Which source-based conclusion is strongest?",
    choices: [
      "The title does not control; the conduct and expected consideration must be tested against Occupations Code §§ 1101.002 and 1101.004.",
      "The title consultant excludes the activity from TRELA without any further analysis.",
      "Only collection of the fee can make the activity brokerage.",
      "Any work involving real property is automatically brokerage, even construction and repair alone.",
    ],
    rationale: "TRELA uses a functional definition. Expected consideration can suffice, and performing or attempting an enumerated act for another may be brokerage. A job title is not the statutory test, while § 1101.004 also preserves activities that do not alone create brokerage.",
    replacement: {
      judgement: "Distinguish acting as principal from performing brokerage for another.",
      prompt: "An unlicensed co-owner sells only her own interest in a property and receives the sale proceeds. What must be decided before calling her a broker?",
      choices: [
        "Whether she performed a § 1101.002 broker act for another with the required expectation of consideration, rather than merely dealing as principal with her own interest.",
        "Whether the property is located in a county with more than 100,000 residents.",
        "Whether the deed uses a TREC logo.",
        "Whether she earned a profit, because every profitable real-estate transaction is brokerage.",
      ],
      rationale: "The functional broker definition requires conduct for another plus the statutory consideration threshold. Acting as principal with one's own interest is analytically different from negotiating another person's interest for compensation.",
    },
  }),
  item({
    id: "LOC-T01-Q02",
    unit: "T01U2",
    contentAnchor: "### Discipline gives the form rules consequences",
    sourceRefs: [
      { sourceId: "loc-oc-1101", section: "1101.151" },
      { sourceId: "loc-oc-1101", section: "1101.155" },
      { sourceId: "loc-oc-1101", section: "1101.652" },
      { sourceId: "loc-tac-537-11", section: "537.11" },
    ],
    judgement: "Trace a form-use obligation across statute, delegated rule, and discipline.",
    prompt: "Which statement accurately traces a Texas contract-form obligation through the authority layers taught in Topic 01?",
    choices: [
      "Occupations Code § 1101.151 delegates rulemaking, § 1101.155 addresses required forms, the held TREC reproduction of § 537.11 supplies detailed use rules, and § 1101.652 provides a disciplinary hook.",
      "The Broker-Lawyer Committee independently licenses brokers and disciplines anyone who uses an old form.",
      "A TREC guidance webpage is the statute that creates the mandatory-form obligation.",
      "The parties' private contract is the only authority that can regulate a sales agent's conduct.",
    ],
    rationale: "The Legislature created the Commission's authority and statutory form framework, the Commission's rule supplies operational detail, and the discipline provision gives a defined failure consequences. A private contract and a guidance page have different functions.",
    replacement: {
      judgement: "Classify a cited proposition by its authority layer before relying on it.",
      prompt: "A student says, ‘TREC law requires this, but I cannot identify whether it is a statute, rule, or form paragraph.’ What is the best correction?",
      choices: [
        "Identify the exact source layer and citation because a statute, rule reproduction, form, and guidance page prove different propositions.",
        "Keep the phrase because every TREC-related document has identical legal authority.",
        "Cite the newest-looking PDF without checking its title or revision.",
        "Treat the brokerage's checklist as a Commission rule.",
      ],
      rationale: "Accurate analysis names the authority layer. The provider workflow may help apply law but cannot become the law, and an instrument proves its own terms rather than every external obligation.",
    },
  }),
  item({
    id: "LOC-T01-Q03",
    unit: "T01U3",
    contentAnchor: "### Explanation versus legal advice",
    sourceRefs: [
      { sourceId: "loc-oc-1101", section: "1101.654" },
      { sourceId: "loc-tac-537-11", section: "537.11" },
    ],
    judgement: "Refuse transaction-specific contingency drafting and route unusual legal work to counsel.",
    prompt: "A buyer asks a sales agent to invent a sentence making the contract contingent on the buyer's satisfaction with every neighborhood condition. What is the best response?",
    choices: [
      "Do not draft or recommend the contingency; involve the broker, check for an approved form, and advise the buyer to obtain attorney-prepared or approved language for the unusual matter.",
      "Place the sentence in special provisions because blank space authorizes any clause requested by a principal.",
      "Draft the clause with an AI tool because only handwriting counts as legal drafting.",
      "Tell the buyer the clause is enforceable, then ask for written instruction after signature.",
    ],
    rationale: "The held § 537.11 reproduction expressly includes contingency clauses in the drafting prohibition, and § 1101.654 separates permitted form completion from unauthorized drafting and legal-sufficiency advice. Unusual matters call for independent counsel before execution.",
    replacement: {
      judgement: "Apply the conspicuous-change control to exact principal instructions.",
      prompt: "A principal emails exact language prepared by her Texas attorney and specifically instructs the agent to insert it. Which additional control does the held rule reproduction require?",
      choices: [
        "Make the instructed change conspicuous and preserve its provenance, while still checking that no mandatory form is being bypassed.",
        "Hide the change in a clean retyped copy so the other party cannot tell what changed.",
        "Rewrite the attorney's language in simpler terms without asking anyone.",
        "Guarantee that the language is legally sufficient because an attorney once prepared it.",
      ],
      rationale: "Written instruction does not erase the practice boundary. The held reproduction allows an instructed change when conspicuous; it does not authorize hidden changes, paraphrased legal drafting, or a guarantee of legal effect.",
    },
  }),
  item({
    id: "LOC-T01-Q04",
    unit: "T01U4",
    contentAnchor: "### Drafting and adoption are separate acts",
    sourceRefs: [
      { sourceId: "loc-oc-1101", section: "1101.251" },
      { sourceId: "loc-oc-1101", section: "1101.252" },
      { sourceId: "loc-oc-1101", section: "1101.254" },
      { sourceId: "loc-oc-1101", section: "1101.155" },
    ],
    judgement: "Separate committee drafting from Commission adoption and use status.",
    prompt: "Which description correctly separates the Broker-Lawyer Committee's role from the Commission's role?",
    choices: [
      "The thirteen-member committee drafts and revises standardizable forms with statutory safeguards; the Commission separately adopts or approves forms and determines use through its authority.",
      "The committee is a private brokerage that sells mandatory forms directly to consumers.",
      "The committee has six total members and may revoke a sales agent's license.",
      "The Commission drafts private clauses for each principal while the committee decides court enforceability.",
    ],
    rationale: "Occupations Code §§ 1101.251–1101.254 establish the committee, membership, terms, and drafting mission. Section 1101.155 addresses Commission authority over required forms. Drafting and adoption are related but distinct acts.",
    replacement: {
      judgement: "Reject the inference that a committee draft is already a mandatory Commission form.",
      prompt: "Why does a Broker-Lawyer Committee draft not automatically become a mandatory form the day it is written?",
      choices: [
        "Committee preparation and Commission adoption or approval are separate steps, and use status must be verified for the transaction.",
        "Only a county clerk can approve any real estate form.",
        "Committee forms are always prohibited until a court orders their use.",
        "A broker may declare any committee draft mandatory by office policy.",
      ],
      rationale: "The Legislature assigns form drafting to the committee and gives the Commission its own adoption and rule authority. Office policy may be stricter operationally but cannot create Commission mandatory-use status.",
    },
  }),
  item({
    id: "LOC-T01-Q05",
    unit: "T01U5",
    contentAnchor: "### When no mandatory form exists",
    sourceRefs: [{ sourceId: "loc-tac-537-11", section: "537.11" }],
    judgement: "Select only a qualifying alternative form when no mandatory Commission form exists.",
    prompt: "No Commission form is approved for mandatory use for a transaction. Which alternative most closely follows the held § 537.11 reproduction?",
    choices: [
      "Use a qualifying Texas-attorney or attorney-consulted trade-association form carrying the required provenance, transaction approval, restrictions, and applicable change warning, or an approved voluntary committee form.",
      "Download any form with a professional design and remove the preparer's restrictions.",
      "Write a new contract from prior deals because no mandatory form exists.",
      "Use an obsolete mandatory form from a different property type because TREC once published it.",
    ],
    rationale: "Absence of a mandatory form does not authorize improvisation. The held reproduction supplies detailed alternative-form conditions and also recognizes committee-prepared forms approved for voluntary use.",
    replacement: {
      judgement: "Use the mandatory addendum instead of substituting an informational entry.",
      prompt: "A current mandatory addendum exists for a financing condition, but an agent prefers one sentence in special provisions. What is the primary compliance defect?",
      choices: [
        "The held rule reproduction bars using an informational entry in place of another Commission form approved for mandatory use for that purpose.",
        "Special provisions may never contain a factual statement under any circumstances.",
        "Financing terms can be omitted whenever the buyer agrees orally.",
        "The addendum is optional because it has more than one page.",
      ],
      rationale: "The form system uses coordinated addenda. Free text cannot replace another mandatory form for the subject, and drafting a substitute condition also creates unauthorized-practice risk.",
    },
  }),
  item({
    id: "LOC-T01-Q06",
    unit: "T01U6",
    contentAnchor: "### Gate three: test the broker exemption and its exceptions",
    sourceRefs: [
      { sourceId: "loc-bc-17", section: "17.46" },
      { sourceId: "loc-bc-17", section: "17.49" },
      { sourceId: "loc-bc-17", section: "17.50" },
    ],
    judgement: "Run the DTPA broker-exemption exceptions before reaching causation and remedy.",
    prompt: "A broker knowingly hides repeated flood reports and expressly tells a residential buyer that the garage has never flooded to induce signing. Which DTPA analysis is most accurate?",
    choices: [
      "Test consumer status, §§ 17.46(b)(24) and any express factual misrepresentation, the three § 17.49(i) exceptions, producing cause and reliance, then the § 17.50 remedy tier.",
      "Stop at the broker exemption because it has no exceptions.",
      "Award automatic treble damages without proving causation, reliance, or mental state.",
      "Treat the statement only as protected opinion because it concerns real property.",
    ],
    rationale: "Section 17.49(i) has express exceptions for material factual misrepresentation, prohibited nondisclosure, and unconscionability. A private laundry-list claim also requires the applicable § 17.50 elements; remedies are tiered rather than automatic.",
    replacement: {
      judgement: "Require an actionable statutory category and causal facts rather than economic disappointment alone.",
      prompt: "A consumer dislikes a negotiated price after market values fall but identifies no representation, warranty, unconscionable conduct, or Insurance Code act. What is missing from the Topic 01 DTPA analysis?",
      choices: [
        "An actionable § 17.50 category and facts connecting that conduct to covered damages; economic disappointment alone does not supply them.",
        "A TREC form number, because every signed TREC form creates a DTPA claim.",
        "A broker license, because only license holders can be consumers.",
        "A closing date more than thirty days away.",
      ],
      rationale: "DTPA analysis requires defined consumer status and an actionable statutory category that produces covered damages, with detrimental reliance for an enumerated laundry-list claim. A bad economic result is not itself the missing conduct.",
    },
  }),
]);

const moduleText = readFileSync(join(REPO_ROOT, MODULE_PATH), "utf8");
const topic1Units = TOPICS.find((topic) => topic.code === "T01").units;
const sourceById = new Map(MODULE_1_SOURCES.map((sourceRecord) => [sourceRecord.id, sourceRecord]));
const tokens = (text) => new Set(text.toLowerCase().match(/[a-z0-9§]+/gu) ?? []);
const similarity = (left, right) => {
  const a = tokens(left);
  const b = tokens(right);
  const intersection = [...a].filter((token) => b.has(token)).length;
  return intersection / new Set([...a, ...b]).size;
};

if (TOPIC_1_QUIZ.length !== topic1Units.length) throw new Error("LOC Topic 01 bank must carry one primary per LOC-0 unit");
if (new Set(TOPIC_1_QUIZ.map((entry) => entry.unit)).size !== topic1Units.length) throw new Error("LOC Topic 01 bank repeats or omits a unit");
if (new Set(TOPIC_1_QUIZ.flatMap((entry) => [entry.id, entry.replacement.id])).size !== TOPIC_1_QUIZ.length * 2) {
  throw new Error("LOC Topic 01 bank contains duplicate primary or replacement ids");
}

for (const quizItem of TOPIC_1_QUIZ) {
  const unit = topic1Units.find((entry) => entry.code === quizItem.unit);
  const unitStart = moduleText.indexOf(`## Unit: ${unit?.unit}`);
  const nextUnit = topic1Units[topic1Units.indexOf(unit) + 1];
  const unitEnd = nextUnit ? moduleText.indexOf(`## Unit: ${nextUnit.unit}`) : moduleText.length;
  const unitText = unitStart < 0 ? "" : moduleText.slice(unitStart, unitEnd);

  for (const candidate of [quizItem, quizItem.replacement]) {
    if (candidate.correctChoice !== 0) throw new Error(`${candidate.id}: correct answer must be authored first`);
    if (candidate.choices.length !== 4 || new Set(candidate.choices).size !== 4) throw new Error(`${candidate.id}: exactly four unique choices required`);
    if (candidate.rationale.length < 100) throw new Error(`${candidate.id}: rationale is too short`);
    if (!candidate.judgement || !candidate.remediation) throw new Error(`${candidate.id}: judgement or remediation trace is absent`);
    if (!unitText.includes(candidate.contentAnchor)) throw new Error(`${candidate.id}: content anchor is absent from its required unit`);
    if (candidate.remediation !== `module-01.md#${slug(candidate.contentAnchor)}`) throw new Error(`${candidate.id}: remediation anchor is not resolvable`);
    for (const ref of candidate.sourceRefs) {
      const sourceRecord = sourceById.get(ref.sourceId);
      const readRecord = sourceRecord?.sectionsRead.find((entry) => entry.section === ref.section);
      if (!readRecord?.reliedOnByUnits.includes(candidate.unit)) throw new Error(`${candidate.id}: ${ref.sourceId} ${ref.section} is outside its unit trace`);
    }
  }
  if (quizItem.prompt === quizItem.replacement.prompt || quizItem.judgement === quizItem.replacement.judgement) {
    throw new Error(`${quizItem.id}: replacement repeats the primary prompt or judgement`);
  }
  if (similarity(quizItem.prompt, quizItem.replacement.prompt) >= 0.6) throw new Error(`${quizItem.id}: replacement prompt is too similar to primary`);
}
