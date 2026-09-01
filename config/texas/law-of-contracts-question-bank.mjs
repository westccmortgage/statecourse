/** Authored Texas Law of Contracts topic quizzes. Formative only; not a final exam. */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { TOPICS } from "./law-of-contracts-course-form.mjs";
import { MODULE_1_SOURCES } from "./law-of-contracts-module-1-sources.mjs";
import { MODULE_2_SOURCES, MODULE_2_PROVIDER_METHODS } from "./law-of-contracts-module-2-sources.mjs";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CURRICULUM_DIR = "texas/tx-law-of-contracts-30-v1/curriculum";

const slug = (heading) =>
  heading
    .replace(/^#+\s+/u, "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[“”'\u2018\u2019]/gu, "")
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "");

const item = (record) => {
  const module = record.module ?? "module-01";
  const traced = (contentAnchor, refs) => {
    const sourceRefs = Object.freeze(refs.map((entry) => Object.freeze(entry)));
    return Object.freeze({
      module,
      contentAnchor,
      remediation: `${module}.md#${slug(contentAnchor)}`,
      sourceRefs,
      source: sourceRefs.map((entry) => entry.sourceId).join("; "),
      section: sourceRefs.map((entry) => entry.section).join("; "),
    });
  };
  const primaryTrace = traced(record.contentAnchor, record.sourceRefs);
  const replacementTrace = traced(
    record.replacement.contentAnchor ?? record.contentAnchor,
    record.replacement.sourceRefs ?? record.sourceRefs,
  );
  const { replacement, ...primary } = record;
  return Object.freeze({
    ...primary,
    unit: record.unit,
    tests: record.unit,
    ...primaryTrace,
    correctChoice: 0,
    choices: Object.freeze(record.choices),
    replacement: Object.freeze({
      ...replacement,
      unit: record.unit,
      tests: record.unit,
      ...replacementTrace,
      id: `${record.id}-R`,
      correctChoice: 0,
      choices: Object.freeze(replacement.choices),
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
      { sourceId: "loc-oc-1101", section: "1101.253" },
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
      sourceRefs: [
        { sourceId: "loc-oc-1101", section: "1101.254" },
        { sourceId: "loc-oc-1101", section: "1101.155" },
      ],
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
      contentAnchor: "### Never use a blank in place of an approved addendum",
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
      { sourceId: "loc-bc-17", section: "17.45" },
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
      contentAnchor: "### Gate two: identify actionable conduct",
      sourceRefs: [
        { sourceId: "loc-bc-17", section: "17.45" },
        { sourceId: "loc-bc-17", section: "17.50" },
      ],
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

export const TOPIC_2_QUIZ = Object.freeze([
  item({
    id: "LOC-T02-Q01",
    module: "module-02",
    unit: "T02U1",
    contentAnchor: "### The estate conveyed is a legal question",
    sourceRefs: [
      { sourceId: "loc2-pr-5", section: "5.001" },
      { sourceId: "loc2-pr-5", section: "5.041" },
    ],
    judgement: "Apply the fee-simple presumption without treating it as a cure for title or divided interests.",
    prompt: "A deed conveys land without old words of inheritance, while a prior recorded instrument appears to reserve a future interest. Which analysis best follows the held Texas sources?",
    choices: [
      "Apply the fee-simple presumption to the estate conveyed unless limited, but investigate the recorded future interest because the presumption does not erase another valid interest.",
      "Declare the deed void because it omits the phrase and his heirs forever.",
      "Ignore every prior instrument because a fee-simple presumption guarantees unencumbered title.",
      "Treat the buyer's signed sales contract as immediate delivery of the deeded estate.",
    ],
    rationale: "Property Code § 5.001 supplies a presumption about the quantum of the estate conveyed; it is not a title guarantee. Section 5.041 confirms that a future freehold or inheritance estate can be conveyed during life, so the earlier instrument cannot be ignored.",
    replacement: {
      contentAnchor: "### Property, interests, and instruments",
      sourceRefs: [{ sourceId: "loc2-oc-1101", section: "1101.002" }],
      judgement: "Separate a scoped statutory definition of real estate from the physical parcel and security interest.",
      prompt: "Why is the licensing chapter's definition of real estate not a universal answer to every title and financing question?",
      choices: [
        "It is scoped to Chapter 1101, includes interests such as leaseholds, and excludes an interest given as security for the performance of an obligation, so other decisions require their own sources.",
        "It defines only buildings and never reaches an interest in land.",
        "It automatically controls every tax, title, zoning, and private-contract definition.",
        "It makes a survey and a deed legally interchangeable documents.",
      ],
      rationale: "A statutory definition must be read within its stated scope. The licensing definition demonstrates interest-based analysis but does not decide the estate held, the validity of title, or the rules governing a security instrument.",
    },
  }),
  item({
    id: "LOC-T02-Q02",
    module: "module-02",
    unit: "T02U2",
    contentAnchor: "### Improvements and accessories are transaction categories",
    sourceRefs: [
      { sourceId: "loc2-oc-1101", section: "1101.002" },
      { sourceId: "loc2-form-20-19", section: "page 1" },
    ],
    judgement: "Reconcile a form's property allocation with ownership evidence and the precise interest being brokered.",
    prompt: "A resale form includes installed solar equipment, but the seller discloses a third-party solar lease. What is the strongest property-classification response?",
    choices: [
      "Treat form inclusion and transferable ownership as separate questions, obtain the lease and transfer facts, and escalate any conflict rather than promising that inclusion conveys third-party equipment.",
      "Assume every visible improvement is owned free and clear by the seller.",
      "Delete the equipment from the property paragraph without the principal's instruction.",
      "Tell the buyer the street address automatically includes every item located there.",
    ],
    rationale: "The form allocates listed improvements and accessories between the parties, while the licensing definition concerns an interest in real property. Neither source proves that a seller owns a third party's equipment or can transfer it without satisfying the lease.",
    replacement: {
      contentAnchor: "### Reading a property paragraph without inventing facts",
      judgement: "Use the legal description and form allocation without treating a street address as complete evidence.",
      prompt: "Which sequence best handles a listing identified only by a street address and the phrase everything stays?",
      choices: [
        "Verify the legal description, read the current property paragraph and exclusions, compare observations and third-party documents, and flag inconsistencies before promising the transfer.",
        "Use the address as the legal description because postal delivery proves the boundaries.",
        "Assume everything on the premises is real property owned by the seller.",
        "Draft a broad warranty that cures any missing title or lease information.",
      ],
      rationale: "The instrument's categories and the exact interest are only part of the evidence. A sound workflow reconciles description, allocation, observation, ownership, and competing claims instead of converting a party's slogan into a legal conclusion.",
    },
  }),
  item({
    id: "LOC-T02-Q03",
    module: "module-02",
    unit: "T02U3",
    contentAnchor: "### Article 9 supplies a bounded fixture rule",
    sourceRefs: [
      { sourceId: "loc2-bc-9", section: "9.334" },
      { sourceId: "loc2-form-20-19", section: "page 1" },
    ],
    judgement: "Keep contract allocation, ownership, and secured-priority analysis distinct for a possible fixture.",
    prompt: "A financed generator is connected through a transfer switch and listed as an included accessory. Which conclusion is supported by Topic 02?",
    choices: [
      "The form allocation, physical connection, ownership documents, and any secured claim must be reviewed separately; inclusion alone does not prove title free of a fixture security interest.",
      "Connection by wire automatically extinguishes every creditor's interest.",
      "Article 9 says every attached item is ordinary building material and can never be financed.",
      "The buyer owns the generator immediately when the listing is published.",
    ],
    rationale: "Section 9.334 recognizes goods that are or become fixtures and supplies priority rules, while the form allocates identified items in the sale. Neither physical connection nor a contract list alone resolves ownership and a third-party security claim.",
    replacement: {
      contentAnchor: "### A five-question item screen",
      sourceRefs: [{ sourceId: "loc2-bc-9", section: "9.334" }],
      judgement: "Refuse to extend Article 9's ordinary-building-material rule into a universal fixture slogan.",
      prompt: "Which statement correctly limits the held fixture statute's treatment of drywall incorporated into a building?",
      choices: [
        "Article 9 does not create a security interest in ordinary building materials after incorporation, but that rule does not answer every construction, lien, title, or contract question.",
        "Drywall always remains separately removable personal property after installation.",
        "The statute proves the seller owns every material used by a contractor.",
        "The statute eliminates all other real-property and construction law.",
      ],
      rationale: "The held section expressly excludes an Article 9 security interest in ordinary building materials incorporated into an improvement. The course confines that proposition to its source and does not turn it into a universal ownership rule.",
    },
  }),
  item({
    id: "LOC-T02-Q04",
    module: "module-02",
    unit: "T02U4",
    contentAnchor: "### The characteristics worksheet",
    sourceRefs: [{ sourceId: "loc2-provider-property-characteristics", section: "provider framework" }],
    judgement: "Convert a provider taxonomy into evidence requests rather than value or safety promises.",
    prompt: "A buyer likes a hillside parcel near a proposed road, and the agent says its uniqueness guarantees appreciation. What is the correct use of the Topic 02 framework?",
    choices: [
      "Record location, physical vulnerability, parcel-specific facts, and surrounding investment as diligence prompts, then obtain evidence without promising value or safety.",
      "Guarantee appreciation because every parcel is unique and land is finite.",
      "Treat the proposed road as completed because a public map mentions it.",
      "Replace inspection and appraisal with the label indestructible land.",
    ],
    rationale: "The StateCourse taxonomy is disclosed provider methodology. It organizes neutral questions about location, durability, uniqueness, scarcity, investment, and preference; it does not produce an appraisal, engineering finding, or forecast.",
    replacement: {
      contentAnchor: "### Economic observation: location preference is contextual",
      judgement: "Translate a subjective neighborhood request into objective client criteria under the disclosed provider method.",
      prompt: "A client asks for the best neighborhood for families like us. Which response follows the StateCourse provider framework?",
      choices: [
        "Ask the client to define objective property and location criteria, provide neutral sources consistently, and avoid demographic judgments.",
        "Select areas by protected-class composition but do not write the reason down.",
        "Promise that one school attendance zone will never change.",
        "Use coded neighborhood labels because they are not explicit demographic statistics.",
      ],
      rationale: "Area preference is contextual. Objective client-selected criteria and consistent neutral resources provide useful service without turning a provider concept into a demographic judgment; the separate fair-housing unit supplies the legal rules.",
    },
  }),
  item({
    id: "LOC-T02-Q05",
    module: "module-02",
    unit: "T02U5",
    contentAnchor: "### Concurrent ownership: share and survivorship are different questions",
    sourceRefs: [
      { sourceId: "loc2-es-101", section: "101.002" },
      { sourceId: "loc2-es-111", section: "111.001" },
    ],
    judgement: "Require a written survivorship agreement instead of inferring survivorship from joint title.",
    prompt: "A deed names two unmarried owners, and one says the survivor automatically receives the other's share. Which Texas-source response is strongest?",
    choices: [
      "Joint ownership alone does not create survivorship under the held default; locate and review a qualifying written survivorship agreement before asserting that result.",
      "Two names on any deed always create automatic survivorship in Texas.",
      "The sales agent may add survivorship language to a new deed without attorney review.",
      "The surviving owner receives the share only if both owners contributed equal cash.",
    ],
    rationale: "Estates Code § 101.002 rejects automatic survivorship as the default, and § 111.001 permits joint owners to agree in writing while barring inference from joint ownership alone. The actual instrument and qualified review are required.",
    replacement: {
      contentAnchor: "### Trust ownership requires identifying the trust relationship",
      sourceRefs: [
        { sourceId: "loc2-pr-111", section: "111.003" },
        { sourceId: "loc2-pr-111", section: "111.004" },
      ],
      judgement: "Distinguish an express trust from a deed of trust and identify the title-holding fiduciary role.",
      prompt: "Why may a deed of trust securing a loan not be treated as the same ownership structure as an express trust for beneficiaries?",
      choices: [
        "The Trust Code definition excludes a deed of trust or other security instrument, while an express trust places title with a person who has equitable duties for a beneficiary or purpose.",
        "Every document containing the word trust creates identical beneficiary ownership.",
        "A beneficiary always signs a deed personally even when a trustee holds title.",
        "A mortgage transfers fee-simple ownership to every lender employee.",
      ],
      rationale: "Property Code §§ 111.003 and 111.004 separate security instruments from an express fiduciary relationship. The transaction must identify who holds title, the capacity used, and the authority supplied by the actual trust documents.",
    },
  }),
  item({
    id: "LOC-T02-Q06",
    module: "module-02",
    unit: "T02U6",
    contentAnchor: "### LLC ownership illustrates entity-asset separation",
    sourceRefs: [
      { sourceId: "loc2-bo-1", section: "1.002" },
      { sourceId: "loc2-bo-2", section: "2.101" },
      { sourceId: "loc2-bo-101", section: "101.106" },
    ],
    judgement: "Name the entity owner and verify the human signer's authority instead of substituting a member personally.",
    prompt: "The deed names Oak Trail LLC, whose sole member wants to sign the resale contract only in her individual name. What is the correct first response?",
    choices: [
      "Keep the entity and member distinct, verify the entity's title and the member's authority and capacity, and follow title or counsel requirements for execution.",
      "Name the member individually because sole membership transfers every company asset to her.",
      "Assume any employee can bind the LLC because entities have general property powers.",
      "Sell the membership interest on the residential form as though it were the deeded parcel.",
    ],
    rationale: "An LLC has power to own and convey property, but § 101.106 classifies membership as personal property and denies a member an interest in specific company property. Authority and execution must be proved separately.",
    replacement: {
      contentAnchor: "### Partnership property follows statutory acquisition rules",
      sourceRefs: [
        { sourceId: "loc2-bo-152", section: "152.101" },
        { sourceId: "loc2-bo-152", section: "152.102" },
      ],
      judgement: "Classify partnership property from the acquisition instrument and statutory presumptions rather than use alone.",
      prompt: "Partners use a warehouse for partnership business, but the deed names them individually without partner capacity and no partnership funds were used. What should the license holder do?",
      choices: [
        "Obtain the deed and partnership evidence and route the classification to qualified review because use alone does not override the statutory acquisition presumptions.",
        "Declare the partnership owner solely because the business operates there.",
        "Declare each spouse an owner because partnership property belongs directly to partners and spouses.",
        "Rewrite the deed description in special provisions to create partnership title.",
      ],
      rationale: "Sections 152.101 and 152.102 separate partnership assets from partners and classify property from the acquisition name, disclosed capacity, and funds. Business use is relevant context but not the statutory ownership shortcut.",
    },
  }),
  item({
    id: "LOC-T02-Q07",
    module: "module-02",
    unit: "T02U7",
    contentAnchor: "### Condominiums: the creating instrument and date control",
    sourceRefs: [
      { sourceId: "loc2-pr-81", section: "81.0011" },
      { sourceId: "loc2-pr-81", section: "81.101" },
      { sourceId: "loc2-pr-82", section: "82.002" },
      { sourceId: "loc2-pr-82", section: "82.051" },
    ],
    judgement: "Use the applicable creating-instrument date and instrument type to identify the condominium regime.",
    prompt: "A multi-unit building is marketed as condos, but no recorded creating instrument has been produced. What must be established before relying on that label?",
    choices: [
      "Identify the applicable date and recorded creating instrument: a Chapter 81 master deed, master lease, or declaration, or a Chapter 82 declaration; marketing and separate occupancy do not create the regime.",
      "Assume a condominium exists whenever unit doors have different numbers.",
      "Use Chapter 82 only if every resident signed the listing agreement.",
      "Treat each occupant as a fee-simple lot owner without reading a legal description.",
    ],
    rationale: "Chapter 81 permits creation through a recorded master deed, master lease, or declaration, while § 82.051 requires a recorded declaration for a Chapter 82 condominium. The applicable date and creating instrument—not marketing—control the starting analysis.",
    replacement: {
      contentAnchor: "### Timeshares: recurring use plus nonwaivable consumer protections",
      sourceRefs: [
        { sourceId: "loc2-pr-221", section: "221.002" },
        { sourceId: "loc2-pr-221", section: "221.041" },
      ],
      judgement: "Calculate the timeshare cancellation period from the later triggering event and preserve its nonwaivable status.",
      prompt: "A purchaser signs a timeshare contract Monday and receives the disclosure statement Wednesday. Which timing instruction is accurate?",
      choices: [
        "Measure the statutory period from the later delivery event and do not treat the purchaser's contract waiver as effective; preserve the actual receipt evidence.",
        "Start only from the sales presentation even if no contract or disclosure was delivered.",
        "Allow the developer to shorten the period orally when the price is discounted.",
        "Apply an ordinary residential option-period assumption instead of the Timeshare Act.",
      ],
      rationale: "Section 221.041 uses the later of signing and receiving the contract or receipt of the disclosure statement and makes the cancellation right nonwaivable. Exact event dates matter more than an imprecise day-count slogan.",
    },
  }),
  item({
    id: "LOC-T02-Q08",
    module: "module-02",
    unit: "T02U8",
    contentAnchor: "### Fair housing governs conduct and communication",
    sourceRefs: [
      { sourceId: "loc2-pr-301", section: "301.021" },
      { sourceId: "loc2-pr-301", section: "301.022" },
      { sourceId: "loc2-usc-42-3604", section: "3604" },
    ],
    judgement: "Apply fair-housing rules to advertising and service before a final sale or rental decision occurs.",
    prompt: "A brokerage targets a dwelling advertisement to exclude users identified as men and writes ideal for women. What is the best Topic 02 response?",
    choices: [
      "Stop and review both the message and audience selection under federal, Texas, and any applicable local fair-housing rules; advertising can be unlawful before anyone is denied housing.",
      "Keep the targeting because fair housing applies only after a signed offer is rejected.",
      "Keep the phrase ideal for women but remove the audience filter because only targeting settings matter.",
      "Publish the ad if the owner verbally accepts responsibility for it.",
    ],
    rationale: "Texas § 301.022 and federal § 3604 reach discriminatory housing statements or advertisements, while the broader sale and rental provisions also regulate availability and terms. An owner instruction does not erase a license holder's obligations.",
    replacement: {
      contentAnchor: "### A layered-use analysis",
      sourceRefs: [
        { sourceId: "loc2-lg-211", section: "211.003" },
        { sourceId: "loc2-pr-202", section: "202.001" },
        { sourceId: "loc2-pr-202", section: "202.006" },
      ],
      judgement: "Run municipal and recorded private restrictions as independent permission layers.",
      prompt: "The zoning map appears to allow a home office, but an association email says recorded restrictions may prohibit customer visits. What conclusion is justified?",
      choices: [
        "Verify the ordinance and site approvals and separately obtain the recorded dedicatory instruments; one public permission does not override a private restriction or prove its enforceability.",
        "Municipal zoning automatically cancels every recorded covenant.",
        "The association email alone proves the complete restriction and every amendment.",
        "A listing agent may promise the use because staff said it is probably acceptable.",
      ],
      rationale: "Municipal authority and recorded private instruments are distinct layers. Sections 202.001 and 202.006 direct attention to the actual filed instruments, while the zoning statute authorizes municipal regulation rather than answering a parcel-specific use question.",
    },
  }),
]);

const tokens = (text) => new Set(text.toLowerCase().match(/[a-z0-9§]+/gu) ?? []);
const similarity = (left, right) => {
  const a = tokens(left);
  const b = tokens(right);
  const intersection = [...a].filter((token) => b.has(token)).length;
  return intersection / new Set([...a, ...b]).size;
};

const validateTopicQuiz = ({ quiz, topicCode, module, sources, providerMethods = [] }) => {
  const topic = TOPICS.find((entry) => entry.code === topicCode);
  const moduleText = readFileSync(join(REPO_ROOT, CURRICULUM_DIR, `${module}.md`), "utf8");
  const sourceById = new Map(sources.map((sourceRecord) => [sourceRecord.id, sourceRecord]));
  for (const method of providerMethods) {
    sourceById.set(
      method.id,
      Object.freeze({
        id: method.id,
        sectionsRead: Object.freeze([
          Object.freeze({ section: "provider framework", reliedOnByUnits: method.affectedUnits }),
        ]),
      }),
    );
  }

  if (quiz.length !== topic.units.length) throw new Error(`LOC ${topicCode} bank must carry one primary per LOC-0 unit`);
  if (JSON.stringify(quiz.map((entry) => entry.unit)) !== JSON.stringify(topic.units.map((entry) => entry.code))) {
    throw new Error(`LOC ${topicCode} bank repeats, omits, or reorders a unit`);
  }
  if (new Set(quiz.flatMap((entry) => [entry.id, entry.replacement.id])).size !== quiz.length * 2) {
    throw new Error(`LOC ${topicCode} bank contains duplicate primary or replacement ids`);
  }

  for (const quizItem of quiz) {
    const unit = topic.units.find((entry) => entry.code === quizItem.unit);
    const unitIndex = topic.units.indexOf(unit);
    const unitStart = moduleText.indexOf(`## Unit: ${unit?.unit}`);
    const nextUnit = topic.units[unitIndex + 1];
    const recapStart = moduleText.indexOf("### Module recap", unitStart);
    const unitEnd = nextUnit ? moduleText.indexOf(`## Unit: ${nextUnit.unit}`) : recapStart;
    const unitText = unitStart < 0 || unitEnd < unitStart ? "" : moduleText.slice(unitStart, unitEnd);

    for (const candidate of [quizItem, quizItem.replacement]) {
      if (candidate.correctChoice !== 0) throw new Error(`${candidate.id}: correct answer must be authored first`);
      if (candidate.module !== module || candidate.unit !== quizItem.unit || candidate.tests !== quizItem.unit) {
        throw new Error(`${candidate.id}: module, unit, or tested-unit trace differs from its primary record`);
      }
      if (candidate.choices.length !== 4 || new Set(candidate.choices).size !== 4) throw new Error(`${candidate.id}: exactly four unique choices required`);
      if (candidate.rationale.length < 100) throw new Error(`${candidate.id}: rationale is too short`);
      if (!candidate.judgement || !candidate.remediation || !candidate.sourceRefs.length) throw new Error(`${candidate.id}: judgement, remediation, or source trace is absent`);
      if (!unitText.includes(candidate.contentAnchor)) throw new Error(`${candidate.id}: content anchor is absent from its required unit`);
      if (candidate.remediation !== `${module}.md#${slug(candidate.contentAnchor)}`) throw new Error(`${candidate.id}: remediation anchor is not resolvable`);
      if (candidate.source !== candidate.sourceRefs.map((entry) => entry.sourceId).join("; ")) throw new Error(`${candidate.id}: flattened source trace differs from source refs`);
      if (candidate.section !== candidate.sourceRefs.map((entry) => entry.section).join("; ")) throw new Error(`${candidate.id}: flattened section trace differs from source refs`);
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
};

validateTopicQuiz({ quiz: TOPIC_1_QUIZ, topicCode: "T01", module: "module-01", sources: MODULE_1_SOURCES });
validateTopicQuiz({
  quiz: TOPIC_2_QUIZ,
  topicCode: "T02",
  module: "module-02",
  sources: MODULE_2_SOURCES,
  providerMethods: MODULE_2_PROVIDER_METHODS,
});

const allItems = [...TOPIC_1_QUIZ, ...TOPIC_2_QUIZ];
if (new Set(allItems.flatMap((entry) => [entry.id, entry.replacement.id])).size !== allItems.length * 2) {
  throw new Error("LOC authored topic banks share a primary or replacement id");
}
