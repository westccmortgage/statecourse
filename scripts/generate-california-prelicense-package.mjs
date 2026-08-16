import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const out = path.join(root, "california");
const pub = path.join(root, "public/statecourse");
const write = (file, body) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body.trimEnd() + "\n");
};
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const writeJson = (file, value) => write(file, JSON.stringify(value, null, 2));
const esc = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

const sources = [
  ["California DRE Course Provider Handbook, Rev. 01/2026", "https://www.dre.ca.gov/files/pdf/faqs/Course%20Provider%20Handbook.pdf", "Controlling application and correspondence-delivery handbook."],
  ["RE 303 Statutory/Pre-License Course Checklist and Instructions, Rev. 01/2026", "https://www.dre.ca.gov/files/pdf/forms/re303.pdf", "Separate package, 15 lessons, timing, final exam, proctor, login, certificate, and filing instructions."],
  ["RE 306 Statutory/Pre-License Course Approval Application, Rev. 01/2026", "https://www.dre.ca.gov/files/pdf/forms/re306.pdf", "Current application form; one filing per course and delivery method."],
  ["RE 307 Regulation Excerpts (Private Vocational Schools)", "https://www.dre.ca.gov/files/pdf/forms/re307.pdf", "Commissioner's Regulations Article 24 excerpts."],
  ["RE 311 Statutory/Pre-License Course Completion Certificate, Rev. 01/2026", "https://www.dre.ca.gov/files/pdf/forms/re311.pdf", "Certificate fields and completion statement."],
  ["RE 313 Statutory/Pre-License General Information Page, Rev. 01/2026", "https://www.dre.ca.gov/files/word/re313.doc", "Pre-enrollment disclosure template."],
  ["RE 336 Pre-License Instructor Certification, Rev. 02/2023", "https://www.dre.ca.gov/files/pdf/forms/re336.pdf", "Instructor qualification certification and criteria."],
  ["RE 423 Examination Qualification Requirements, Rev. 01/2026", "https://www.dre.ca.gov/files/pdf/forms/re423.pdf", "Salesperson statutory course pathway and SB 1495 note."],
  ["RE 206E Education Fees, Rev. 07/2026", "https://www.dre.ca.gov/files/pdf/forms/re206E.pdf", "$500 current prelicense course application fee."],
  ["DRE Education Course Availability", "https://www.dre.ca.gov/examinees/EducationCourses.html", "Correspondence timing and approved-course verification notice."],
  ["DRE Public License Lookup - Anatoliy Kanevsky", "https://www2.dre.ca.gov/PublicASP/pplinfo.asp?License_id=01385024", "Official public license facts used in the RE 336 evidence schedule."],
];

const courses = [
  {
    id: "ca-real-estate-principles-45-v1",
    paymentId: "ca-real-estate-principles-45",
    short: "principles",
    title: "Real Estate Principles",
    description: "A college-equivalent introduction to California real property, ownership, agency, contracts, finance, transfer, valuation, land use, fair housing, and license law.",
    lessons: [
      ["The real estate profession and California regulatory structure", ["real property as an economic and legal asset", "DRE jurisdiction and consumer protection", "broker and salesperson license relationships", "professional scope and unauthorized legal practice", "sources of California real estate law", "transaction participants and accountability"]],
      ["Real property, personal property, and fixtures", ["real versus personal property", "fixtures and the fixture tests", "trade fixtures", "natural and artificial attachments", "water and mineral interests", "fixture disputes in a sale"]],
      ["Estates, ownership, and common interests", ["freehold and leasehold estates", "fee simple and life estates", "joint tenancy and tenancy in common", "community property orientation", "condominiums and common interest developments", "trust and entity ownership basics"]],
      ["Land description, measurement, and boundaries", ["metes and bounds", "government survey system", "lot and block descriptions", "recorded maps and assessor parcels", "survey and boundary evidence", "area and linear measurement"]],
      ["Encumbrances, liens, easements, and restrictions", ["voluntary and involuntary liens", "easements and licenses", "deed restrictions and covenants", "encroachments and boundary conflicts", "priority and recording", "title exceptions and risk allocation"]],
      ["Government powers, land use, and environmental controls", ["taxation eminent domain police power and escheat", "zoning and general plans", "subdivision and building controls", "environmental hazards and disclosure", "water conservation and natural-hazard context", "public and private land-use due diligence"]],
      ["Agency and brokerage relationships", ["creation of agency", "fiduciary duties", "seller buyer and dual agency", "California agency disclosure", "broker supervision and salesperson authority", "compensation conflicts and termination"]],
      ["Contracts and transaction formation", ["contract elements", "offer acceptance and counteroffer", "consideration capacity and legality", "Statute of Frauds", "contingencies and performance", "breach rescission and remedies"]],
      ["Transfer, deeds, title, and recording", ["deed requirements", "grant deed and quitclaim deed", "delivery and acceptance", "recording and constructive notice", "title insurance and preliminary reports", "voluntary and involuntary transfer"]],
      ["Escrow, settlement, and transaction chronology", ["escrow holder role", "escrow instructions", "deposit and document handling", "proration and closing statements", "recording and disbursement", "post-closing records"]],
      ["Real estate finance foundations", ["promissory notes", "deeds of trust and mortgages", "loan markets and sources", "interest amortization and points", "loan-to-value and qualifying ratios", "default foreclosure and deficiency orientation"]],
      ["Valuation and appraisal foundations", ["value price and cost", "highest and best use", "sales comparison approach", "cost approach", "income capitalization approach", "appraisal independence and CMA limits"]],
      ["Taxation, investment, and real estate mathematics", ["property taxation and assessments", "transfer and income tax orientation", "cash flow and return", "leverage and risk", "commissions prorations and area math", "investment comparison and documentation"]],
      ["Fair housing, civil rights, and consumer protection", ["federal protected classes", "California fair housing protections", "prohibited conduct and advertising", "reasonable accommodations and modifications", "fair lending and appraisal bias", "complaints documentation and professional response"]],
      ["Leasing, property management, license law, and integrated transaction", ["lease formation and tenant interests", "property management agreements", "trust funds and records", "California licensing and discipline", "material fact disclosure", "integrated California transaction audit"]],
    ],
  },
  {
    id: "ca-real-estate-practice-45-v1",
    paymentId: "ca-real-estate-practice-45",
    short: "practice",
    title: "Real Estate Practice",
    description: "A California transaction-practice course including agency, listings, buyer representation, contracts, disclosures, finance, closing, risk management, fair housing, implicit bias, and the SB 1495 participatory component.",
    sb1495: true,
    lessons: [
      ["California practice standards and the regulated professional", ["DRE authority and license categories", "broker supervision", "professional competence and scope", "office policies and delegation", "consumer-first communication", "transaction file accountability"]],
      ["Building a lawful real estate practice", ["business planning", "prospecting and solicitation", "advertising identification", "antitrust and competition", "privacy and information security", "records and retention workflow"]],
      ["Agency disclosure and fiduciary performance", ["seller and buyer agency", "dual agency consent", "California disclosure sequence", "fiduciary duties in practice", "compensation and conflicts", "agency documentation case"]],
      ["Seller counseling and listing agreements", ["property and client intake", "listing agreement structure", "pricing discussion", "seller disclosures", "showing and access controls", "listing cancellation expiration and protection"]],
      ["Market analysis and pricing strategy", ["market selection", "comparable adjustment reasoning", "active pending and sold evidence", "seller net and pricing consequences", "appraisal versus CMA", "pricing presentation and file support"]],
      ["Marketing, advertising, and fair access", ["truthful property advertising", "digital and social media compliance", "fair housing advertising", "accessibility and accommodations", "open house and showing practices", "marketing approval and archive"]],
      ["Buyer representation and property selection", ["buyer consultation", "representation agreement", "financial readiness", "property search and steering avoidance", "investigation and inspections", "offer strategy and documentation"]],
      ["Purchase agreements, counteroffers, and contingencies", ["California purchase agreement architecture", "offer presentation", "counteroffers and multiple offers", "financing appraisal and inspection contingencies", "deadlines notices and removal", "amendment cancellation and dispute prevention"]],
      ["Disclosures and property-condition risk", ["transfer disclosure framework", "agent visual inspection duties", "natural hazard and environmental disclosure", "lead-based paint", "material facts and stigma limits", "disclosure delivery and rescission timing"]],
      ["Financing the transaction", ["preapproval and loan terms", "conventional government and alternative financing", "financing disclosures", "appraisal and underwriting", "closing cost and seller credit", "financing failure and contingency response"]],
      ["Escrow, title, closing, and possession", ["opening escrow", "title and vesting review", "transaction coordination", "final verification and closing", "recording disbursement and possession", "post-closing file audit"]],
      ["Property management and leasing practice", ["management agreement", "tenant selection and fair housing", "rents deposits and accounting", "maintenance habitability and access", "lease enforcement and termination", "owner reporting and risk controls"]],
      ["Ethics, risk management, and dispute prevention", ["honesty and fair dealing", "errors omissions and supervision", "fraud warning signs", "conflict and referral disclosure", "complaint response", "documentation escalation and legal referral"]],
      ["Implicit bias and fair housing participatory practicum", ["implicit explicit and systemic bias", "historical and social impacts", "recognition and interruption strategies", "consumer role-play experience", "real estate professional role-play response", "fair housing action plan and reflection"]],
      ["Integrated California residential transaction", ["intake and agency", "listing and marketing", "offer and negotiation", "disclosure and investigation", "escrow finance and closing", "complete file compliance audit"]],
    ],
  },
  {
    id: "ca-mortgage-loan-brokering-lending-45-v1",
    paymentId: "ca-mortgage-loan-brokering-lending-45",
    short: "mortgage-loan-brokering-and-lending",
    title: "Mortgage Loan Brokering and Lending",
    description: "A California statutory elective covering mortgage instruments, origination, underwriting, disclosure, brokering, trust funds, private and institutional lending, servicing, default, fair lending, fraud prevention, and integrated loan practice.",
    lessons: [
      ["California mortgage brokerage and regulatory structure", ["DRE real estate broker mortgage authority", "MLO endorsement orientation", "DRE and other regulator boundaries", "licensed and exempt activity", "broker supervision", "consumer complaint and enforcement context"]],
      ["Money, interest, notes, and loan mathematics", ["principal interest and term", "simple interest and amortization", "promissory note terms", "points fees and annual percentage rate", "loan-to-value and combined loan-to-value", "payment and yield calculations"]],
      ["Security instruments and lien priority", ["deed of trust structure", "mortgage comparison", "trustor beneficiary and trustee", "recording and priority", "subordination and reconveyance", "default remedies and security risk"]],
      ["Mortgage markets, sources, and loan products", ["primary and secondary markets", "depository and nondepository sources", "conventional FHA and VA orientation", "fixed adjustable and balloon structures", "owner-occupied and business-purpose distinctions", "product suitability and documentation"]],
      ["Application, borrower information, and qualification", ["loan application workflow", "income asset and liability information", "credit history and capacity", "occupancy and property purpose", "debt-to-income analysis", "adverse information and accurate records"]],
      ["Underwriting, collateral, and approval conditions", ["ability-to-repay orientation", "automated and manual underwriting", "appraisal and collateral review", "title insurance and hazard insurance", "conditions and verification", "approval denial and adverse action workflow"]],
      ["Federal consumer mortgage law", ["Truth in Lending and Regulation Z", "RESPA and Regulation X", "ECOA and Regulation B", "HMDA and Regulation C", "FCRA and credit reporting", "SAFE Act and federal registration context"]],
      ["California broker law, trust funds, and records", ["California broker mortgage activities", "advance fees and compensation", "trust fund handling", "broker records and retention", "advertising and license identification", "DRE audit and enforcement risk"]],
      ["Mortgage disclosures, compensation, and closing costs", ["Loan Estimate and Closing Disclosure orientation", "broker compensation disclosure", "affiliated business and referral risk", "fee tolerance and change circumstances", "prepayment balloon and adjustable-rate disclosure", "consumer comparison and acknowledgment"]],
      ["Origination, processing, and closing workflow", ["inquiry and prequalification", "application and disclosures", "document collection and verification", "submission and condition management", "clear-to-close and settlement", "post-closing quality control"]],
      ["Appraisal, title, escrow, and settlement", ["appraisal independence", "valuation review", "title exceptions and liens", "escrow instructions and funds", "settlement statements", "recording funding and document custody"]],
      ["Private money, seller financing, and nontraditional transactions", ["private investor loans", "business-purpose lending", "seller carryback financing", "hard-money risk and suitability", "broker-arranged loan documentation", "usury exemptions and legal referral"]],
      ["Servicing, payoff, default, and foreclosure", ["payment processing and servicing records", "escrow accounts", "payoff demand and reconveyance", "delinquency and loss mitigation", "nonjudicial foreclosure orientation", "borrower communication and complaint handling"]],
      ["Fair lending, fraud prevention, and ethical mortgage practice", ["ECOA and fair housing lending protections", "redlining and pricing disparities", "occupancy income and appraisal fraud", "identity and cyber fraud", "suspicious facts and escalation", "ethical product presentation and documentation"]],
      ["Integrated California mortgage brokerage file", ["consumer inquiry and scope", "application and identity", "product comparison and disclosures", "underwriting and conditions", "closing and compensation", "post-closing audit and regulator-ready file"]],
    ],
  },
];

const lenses = [
  ["Concept and purpose", (t, l) => `${t} is studied as an operating concept, not as a vocabulary label. The learner identifies the legal or transactional purpose of the concept, the people whose rights may be affected, and the point in a California real estate matter when the concept becomes important. In ${l}, the correct professional response begins by separating verified facts from assumptions. A licensee should avoid promising a legal result, use the approved or authorized process, and preserve enough evidence for a broker, instructor, regulator, or later reviewer to reconstruct the decision.`],
  ["Essential elements", (t) => `The essential elements of ${t} are the parties, property or obligation involved, the source of authority, required disclosures or documents, relevant timing, and the consequence of noncompliance. Students should ask what must exist, who must act, when action must occur, and what record proves completion. A label alone is insufficient. The same phrase can produce different results when ownership, occupancy, agency, loan purpose, or written consent changes. The lesson therefore uses a structured issue-fact-rule-application-conclusion method and requires the learner to identify missing facts before choosing a response.`],
  ["Roles and duties", (t) => `Responsibility for ${t} may be divided among the principal, broker, salesperson, lender, escrow holder, title company, appraiser, property manager, attorney, public agency, or other specialist. A real estate professional must know the boundary of the license and the limits of delegated authority. The professional explains process accurately, makes required disclosures, follows supervision, and refers questions requiring legal, tax, engineering, appraisal, or other licensed judgment. Students practice naming the responsible party and documenting the referral instead of silently assuming another participant will perform the task.`],
  ["Workflow", (t) => `A defensible workflow for ${t} starts with intake and identity, continues through fact collection and document review, and ends with confirmation, communication, and retention. The learner creates a chronology: when the issue was discovered, what source was consulted, what was disclosed, who received it, what decision followed, and how that decision was confirmed. Checklists support consistency but do not replace judgment. If facts conflict, the workflow pauses at the conflict; the student is trained to obtain clarification and broker or professional guidance before an irreversible deadline passes.`],
  ["Documents and evidence", (t) => `Documents connected with ${t} must be read for content, not merely collected. Names, dates, property descriptions, signatures, amounts, attachments, delivery evidence, and version identifiers should reconcile across the file. Students distinguish a draft, an executed instrument, a disclosure acknowledgment, a receipt, and independent evidence. Electronic records require the same integrity as paper records. The course model preserves the submitted version, timestamp, actor, and any later amendment so that correction does not erase history. Missing or inconsistent evidence becomes a visible exception requiring resolution.`],
  ["Quantitative and factual analysis", (t) => `Where ${t} involves money, time, area, ratios, or comparisons, the student states the known values, selects the correct unit, shows the calculation, and tests whether the result is reasonable. Where the issue is qualitative, the student creates the same discipline by distinguishing direct evidence, reported information, professional opinion, and inference. A correct number built on an unsupported assumption is not a compliant conclusion. The applied exercise requires a written explanation that another person could reproduce and a note identifying any fact that still requires verification.`],
  ["California law and professional boundary", (t) => `California law controls the licensed activity associated with ${t}; however, course discussion is education rather than legal advice for a particular transaction. Statutes, Commissioner's Regulations, DRE forms and publications, contract language, and broker policy perform different functions. Students are trained to identify which source is controlling and to check the current version before action. When an answer depends on facts or authority outside the licensee's competence, the compliant response is disclosure, supervision, and referral - not improvisation or concealment.`],
  ["Consumer protection and fair access", (t) => `Consumer protection requires that ${t} be handled consistently, honestly, and without discrimination. The professional avoids steering, selective service, unsupported urgency, hidden conflicts, and explanations that obscure material costs or risks. Equal service does not mean ignoring disability-related accommodation or other legally relevant needs. Students compare treatment across similarly situated consumers, identify where discretion can introduce bias, and build objective criteria and written records. A consumer should be able to understand the material choice and the source of the professional's recommendation.`],
  ["Applied scenario", (t, l) => `Scenario: during ${l.toLowerCase()}, the file raises a question about ${t}. One participant asks the licensee to proceed immediately and promises that a missing item will be corrected later. The learner must resist speed as a substitute for verification. The correct analysis identifies the missing fact, the affected party, the deadline, the source to consult, and the record to preserve. The student then drafts a neutral communication that describes what is known, what remains unresolved, and the next authorized step without accusing a party or predicting a legal outcome.`],
  ["Decision checklist", (t) => `Before treating ${t} as resolved, the student checks: identity and authority; complete and consistent facts; current governing source; required disclosure or consent; timing; objective calculation when applicable; delivery and receipt; broker or specialist escalation; and retention of the final record. If any item is absent, the issue remains open. Completion in the learning platform therefore requires both the instructional segment and the applied assignment. The checklist is a risk-control tool and a study aid, but the learner must still explain why each item matters in the particular scenario.`],
];

function lessonMarkdown(course, lesson, index) {
  const [title, topics] = lesson;
  const number = String(index + 1).padStart(2, "0");
  const sections = topics.map((topic, topicIndex) => {
    const content = lenses.map(([heading, fn]) => `### ${topicIndex + 1}.${lenses.findIndex((entry) => entry[0] === heading) + 1} ${heading}\n\n${fn(topic, title)}`).join("\n\n");
    return `## ${topicIndex + 1}. ${topic}\n\n${content}`;
  }).join("\n\n");
  const sb = course.sb1495 && index === 13 ? `\n\n## Required SB 1495 participatory activity\n\nThe learner completes two recorded role-play passes using the same housing scenario. In Pass A, the learner acts as a consumer who encounters a potentially biased service pattern and explains the effect, information need, and requested corrective action. In Pass B, the learner acts as the real estate professional, identifies implicit, explicit, and systemic bias risks, applies federal and California fair housing duties, offers an objective and lawful service response, and documents actionable steps to interrupt bias. Both submissions and the learner's reflection are required before this assignment is complete.\n` : "";
  return `# ${course.title} - Lesson Assignment ${number}\n\n## ${title}\n\n**Course version:** 1.0 development draft  \n**Assignment time:** 180 instructional minutes  \n**Regulatory status:** Not approved; no California credit is available.\n\n## Learning objectives\n\n${topics.map((topic) => `- Analyze ${topic} using verified facts, current authority, and a documented professional workflow.`).join("\n")}\n\n## Timed sequence\n\n| Activity | Minutes | Evidence |\n|---|---:|---|\n| Guided reading: concepts and elements | 55 | Sections 1-2 viewed and notes saved |\n| Guided reading: roles, workflow, and documents | 50 | Sections 3-5 viewed |\n| Guided reading: analysis, California boundary, and consumer protection | 45 | Sections 6-8 viewed |\n| Applied scenario and decision checklist | 20 | Written response submitted |\n| Lesson assessment | 10 | Five scored items submitted |\n| **Total** | **180** | **One of 15 separate lesson assignments** |\n\n${sections}${sb}\n\n## Required applied assignment\n\nPrepare a one-page file memorandum for the applied scenario. Identify the issue, controlling source category, missing facts, affected parties, required action, deadline, communication, escalation, and retained evidence. The instructor version contains a scoring rubric.\n\n## Knowledge check and remediation\n\nComplete the five-item lesson quiz in the secure LMS. An incorrect response opens targeted remediation: an alternate explanation, a parallel example, and a new item on the same concept. The 80% lesson mastery threshold is a StateCourse instructional policy proposed for DRE review; it is not represented as a DRE-mandated score.\n\n## Assignment completion\n\nCompletion requires all instructional segments, the applied memorandum, the quiz submission, and any triggered remediation. Assignment completion does not waive the separate final examination, minimum elapsed-time, identity, proctor, or approval requirements.\n`;
}

function describeTopic(topic) {
  const t = topic.toLowerCase();
  const rules = [
    [/real versus personal property|real property as an economic/, "Real property includes land and things treated as part of the land; personal property is generally movable and may be transferred by different instruments."],
    [/fixtures and the fixture tests|fixture disputes|trade fixtures|attachments/, "Fixture analysis considers attachment, adaptation, intention, relationship of the parties, and any governing agreement; trade fixtures receive special treatment in a tenancy."],
    [/water and mineral/, "Water and mineral interests can be severed or limited and require examination of title, location, use rights, and controlling law."],
    [/freehold and leasehold/, "Freehold estates are ownership interests of uncertain duration, while leasehold estates give possession for a defined or determinable term."],
    [/fee simple and life/, "Fee simple is the broadest private estate; a life estate ends on the measuring life and is followed by a reversion or remainder."],
    [/joint tenancy/, "Joint tenancy includes equal interests acquired under the required unities and ordinarily carries a right of survivorship unless severed."],
    [/tenancy in common/, "Tenants in common may hold unequal undivided shares without a right of survivorship and each has a right to possess the whole subject to co-owner rights."],
    [/community property/, "California community-property analysis starts with acquisition during marriage, source of funds, title, agreements, and statutory presumptions rather than title alone."],
    [/condominium|common interest/, "A condominium combines separate ownership of a unit with an undivided interest in common areas and is governed by recorded common-interest documents."],
    [/trust and entity ownership/, "Trust or entity ownership requires verification of the legal owner, signing authority, governing documents, and limits on the representative's power."],
    [/metes and bounds/, "A metes-and-bounds description traces directions and distances from a point of beginning and may rely on monuments to close the parcel."],
    [/government survey/, "The government survey system organizes land by principal meridians and baselines into townships, ranges, sections, and fractions of sections."],
    [/lot and block/, "A lot-and-block description identifies a parcel by lot, block, tract, and the recorded subdivision map in the named public record."],
    [/recorded maps|assessor parcels/, "An assessor parcel number supports taxation and indexing but should not be substituted automatically for a complete legal description."],
    [/survey and boundary|encroachments/, "A boundary or encroachment question requires survey or title evidence and qualified advice; a licensee should not decide disputed ownership by visual estimate."],
    [/area and linear|commissions prorations and area/, "Real-estate calculations require stated units, shown work, correct time or area conventions, and a reasonableness check before the result is communicated."],
    [/voluntary and involuntary liens|title exceptions|liens and priority|title exceptions and liens/, "A lien is a monetary claim against property; priority depends on the lien type, law, recording, and agreed subordination, not simply on which debt is largest."],
    [/easements and licenses/, "An easement is a nonpossessory right to use land, while a license is generally revocable permission and does not create the same property interest."],
    [/deed restrictions|covenants/, "Private covenants and deed restrictions can limit land use but must be read with amendment, expiration, enforcement, and public-law limitations."],
    [/priority and recording|recording and constructive/, "Recording can provide constructive notice and affect priority, but it does not cure a defective instrument or create rights the grantor did not possess."],
    [/taxation eminent domain police power and escheat/, "Government powers include taxation, eminent domain with compensation, police power for regulation, and escheat when an owner dies without lawful successors."],
    [/zoning and general plans|subdivision and building|land-use due diligence/, "Land-use analysis compares the proposed use with zoning, planning, subdivision, building, environmental, and private controls before reliance."],
    [/environmental hazards|natural-hazard|water conservation/, "Environmental and natural-hazard matters require current statutory disclosures, competent inspection or reports, and careful delivery records rather than informal reassurance."],
    [/creation of agency|seller and buyer agency|seller buyer and dual agency/, "Agency arises through consent and authority; the file must identify whom the broker represents and the duties owed to clients and other parties."],
    [/fiduciary duties/, "Fiduciary performance includes loyalty, disclosure, confidentiality, obedience to lawful instructions, reasonable care, and accounting within the agency's scope."],
    [/dual agency/, "California dual agency requires disclosure and informed consent and limits the agent's ability to disclose either principal's confidential bargaining information."],
    [/agency disclosure|disclosure sequence/, "California agency disclosures must be delivered at the required stage, accurately identify relationships, and be retained with proof of delivery and acknowledgment."],
    [/broker supervision|salesperson authority|office policies and delegation/, "A salesperson acts under the responsible broker, and delegated tasks do not remove the broker's supervision duty or enlarge the salesperson's authority."],
    [/compensation and conflicts|compensation conflicts|referral disclosure/, "Compensation and referral relationships require lawful structure, timely conflict disclosure, and no payment for licensed activity to an unlicensed person."],
    [/contract elements/, "An enforceable contract generally requires capable parties, mutual consent, lawful object, and consideration, with required writing and signatures when the Statute of Frauds applies."],
    [/offer acceptance and counteroffer|offer presentation|counteroffers and multiple/, "Acceptance must mirror the offer and be communicated as required; a counteroffer rejects or changes the original offer unless structured otherwise."],
    [/consideration capacity and legality|statute of frauds/, "Consideration supports the exchange, capacity affects the parties' ability to contract, legality is essential, and covered real-estate agreements ordinarily must be written."],
    [/contingencies and performance|deadlines notices and removal|financing appraisal and inspection/, "A contingency allocates a stated risk and must be monitored by its language, deadlines, notice requirements, and documented satisfaction or removal."],
    [/breach rescission and remedies|amendment cancellation/, "Breach and cancellation analysis depends on contract language, performance, notice, cure rights, damages, rescission grounds, and qualified legal advice."],
    [/purchase agreement architecture|california purchase agreement/, "A purchase agreement coordinates parties, property, price, financing, deposits, disclosures, investigations, allocation of costs, closing, possession, defaults, and signatures."],
    [/deed requirements|grant deed and quitclaim/, "A valid deed identifies grantor and grantee, contains an adequate property description and operative grant, is executed, and must be delivered and accepted; deed type affects warranties."],
    [/delivery and acceptance/, "A deed transfers title only when delivered with present intent and accepted, not merely when it is signed or stored."],
    [/title insurance|preliminary reports|title and vesting/, "A preliminary title report is an offer to insure subject to listed exceptions; it is not a guarantee that every physical or legal issue has been investigated."],
    [/voluntary and involuntary transfer/, "Voluntary transfer follows an owner's intentional conveyance; involuntary transfer can result from foreclosure, eminent domain, court order, or operation of law."],
    [/escrow holder role|opening escrow|escrow instructions/, "An escrow holder is a neutral stakeholder who follows mutual written instructions and does not act as an advocate for either principal."],
    [/deposit and document|earnest money|escrow evidence/, "Deposits and transaction documents require authorized custody, timely delivery, accurate receipts, reconciliation, and no commingling or undocumented release."],
    [/proration and closing|settlement statements|closing cost/, "Prorations allocate periodic items as of the agreed closing date and must use the contract's conventions and verified amounts."],
    [/recording and disbursement|recording funding|final verification/, "Closing follows satisfaction of instructions, final verification, authorized funding, recording, disbursement, possession, and a complete retained file."],
    [/promissory note/, "The promissory note is the borrower's evidence of debt and states principal, interest, payment, maturity, default, and other repayment terms."],
    [/deed of trust|mortgage comparison|security instruments/, "A deed of trust secures a note with real property and names trustor, beneficiary, and trustee; the debt and security instrument perform different functions."],
    [/loan markets|primary and secondary/, "The primary market originates loans; the secondary market purchases, pools, or securitizes loans and influences capital and underwriting standards."],
    [/interest amortization|simple interest|principal interest/, "Interest is the cost of borrowed principal; amortization applies periodic payments to interest and principal over the loan term."],
    [/loan-to-value|combined loan-to-value|debt-to-income/, "Loan-to-value compares secured debt with property value, while debt-to-income compares recurring obligations with qualifying income; each measures a different risk."],
    [/default foreclosure|nonjudicial foreclosure/, "California deed-of-trust default may lead to statutory nonjudicial foreclosure, but notices, timing, reinstatement, payoff, and borrower protections require current-law review."],
    [/value price and cost|value principles/, "Value is an opinion under stated conditions, price is the amount paid, and cost is the expenditure to create or acquire; the terms are not interchangeable."],
    [/highest and best use/, "Highest and best use is the reasonably probable use that is legally permissible, physically possible, financially feasible, and maximally productive."],
    [/sales comparison/, "The sales comparison approach analyzes comparable transactions and adjusts for material differences to indicate subject value."],
    [/cost approach/, "The cost approach combines land value with current improvement cost less depreciation and is especially useful for newer or special-purpose property."],
    [/income capitalization/, "The income approach converts anticipated property income into value using market-supported capitalization or discounted-cash-flow reasoning."],
    [/appraisal independence|appraisal versus cma|cma limits/, "A broker price opinion or CMA supports brokerage advice but is not an appraisal; valuation pressure or bias must not influence an independent appraiser."],
    [/property taxation|assessments/, "Property tax begins with assessed value and applicable rates and must account for California assessment rules, exemptions, special assessments, and verified tax records."],
    [/cash flow and return|leverage and risk|investment comparison/, "Investment analysis separates income, operating expenses, debt service, taxes, cash flow, return measures, leverage, liquidity, and risk."],
    [/federal protected classes/, "Federal fair housing law protects race, color, religion, sex, familial status, national origin, and disability in covered housing activity."],
    [/california fair housing|fair access|fair housing advertising/, "California protections extend beyond the federal list, and service, advertising, property selection, terms, and negotiation must use lawful objective criteria."],
    [/reasonable accommodations|accessibility/, "A reasonable accommodation changes a rule or practice for a disability-related need; a reasonable modification is a physical change, subject to distinct requirements."],
    [/steering avoidance|property search/, "Steering includes channeling people toward or away from areas because of protected characteristics; objective client criteria must drive the search."],
    [/fair lending|redlining|pricing disparities/, "Fair-lending review compares access, pricing, underwriting, and service for similarly situated applicants and investigates disparities rather than accepting intuition."],
    [/lease formation|lease terms|tenant interests/, "A lease transfers possession for a term under agreed conditions while the landlord retains a reversionary ownership interest."],
    [/property management agreement|management agreement/, "A management agreement defines authority, duties, compensation, accounting, maintenance, leasing, reporting, and termination."],
    [/trust funds and records|rents deposits and accounting|trust fund handling/, "Trust funds require designated handling, prompt deposit, accurate beneficiary records, reconciliation, and no unauthorized commingling or conversion."],
    [/material fact disclosure|seller disclosures|transfer disclosure/, "A known material fact affecting value or desirability must be handled through the applicable disclosure duty and documented delivery, not concealed by silence."],
    [/visual inspection/, "California residential practice can require a reasonably competent and diligent visual inspection by the agent and disclosure of material facts revealed by it."],
    [/license categories|licensing and discipline|dre authority/, "DRE licenses and regulates brokers and salespersons; education completion is not a license and does not authorize brokerage activity."],
    [/professional scope|unauthorized legal/, "A licensee may explain transaction process and approved forms but should not draft legal instruments or give legal conclusions beyond authorized practice."],
    [/prospecting and solicitation|business planning/, "A lawful practice plan uses truthful communications, required identification, consent and contact rules, fair access, measurable service standards, and retained advertising records."],
    [/advertising identification|truthful property|digital and social/, "Advertising must be truthful, identify the responsible licensee or brokerage as required, avoid material omissions, and be archived in the approved version."],
    [/antitrust|competition/, "Competitors must make independent decisions and may not agree to fix commissions, divide markets, boycott firms, or restrain lawful competition."],
    [/privacy and information security|identity and cyber/, "Sensitive applicant and transaction information should be collected only as needed, protected by access controls, verified through trusted channels, and disposed of securely."],
    [/listing agreement/, "A listing agreement establishes the broker's employment, property, term, duties, compensation, authority, and required signatures and disclosures."],
    [/market selection|comparable adjustment|active pending and sold/, "A market analysis selects genuinely comparable evidence, distinguishes listing status from closed price, explains adjustments, and states its limitations."],
    [/seller net/, "A seller net estimate starts with anticipated price and subtracts verified loan payoffs, costs, credits, taxes, commissions, and other agreed charges."],
    [/buyer consultation|representation agreement/, "Buyer representation begins with needs, lawful search criteria, agency and compensation disclosure, financial readiness, investigation duties, and written expectations."],
    [/preapproval|financial readiness|prequalification/, "Prequalification is preliminary, while preapproval generally reflects a more developed credit review; neither guarantees final underwriting or funding."],
    [/multiple offers|offer strategy/, "Multiple-offer handling follows seller instructions, truthful communication, equal compliance, confidentiality, and careful records without inventing competing terms."],
    [/lead-based paint/, "Federal lead-based-paint rules for covered pre-1978 housing require prescribed disclosure, records, and the buyer's opportunity for evaluation unless lawfully waived."],
    [/natural hazard/, "California natural-hazard disclosure uses the current statutory process and qualified report information; it does not replace property-specific investigation."],
    [/conventional government|fha and va/, "Conventional, FHA, and VA financing differ in insurance or guaranty, eligibility, underwriting, appraisal, cost, and property requirements."],
    [/ethics|honesty and fair dealing/, "Ethical practice requires truthful material communication, fair dealing, competent performance, supervision, conflict disclosure, and refusal to conceal or falsify facts."],
    [/fraud warning|occupancy income and appraisal fraud/, "A professional must not create, alter, or ignore false income, occupancy, asset, identity, appraisal, or transaction information and must escalate suspicious inconsistencies."],
    [/implicit explicit and systemic bias/, "Implicit bias can operate without conscious intent, explicit bias is conscious, and systemic bias can be embedded in policies or outcomes; each requires recognition and action."],
    [/historical and social impacts/, "Housing discrimination has cumulative effects on access, wealth, neighborhood opportunity, appraisal, credit, and trust that current practice must understand and avoid reproducing."],
    [/recognition and interruption|action plan/, "Bias interruption uses objective criteria, structured decision points, comparison across consumers, documentation, reflection, and corrective action."],
    [/consumer role-play|professional role-play/, "SB 1495 participation requires the learner to role-play both the consumer experience and the real-estate professional's lawful response."],
    [/dre real estate broker mortgage authority|california broker mortgage activities/, "A California real estate broker may conduct covered mortgage-broker activities within DRE authority, subject to licensing, endorsement, supervision, disclosure, trust-fund, and record rules."],
    [/mlo endorsement|safe act/, "An individual who performs residential mortgage-loan origination requiring an endorsement must satisfy applicable SAFE Act and California DRE endorsement requirements."],
    [/regulator boundaries/, "DRE, DFPI, federal agencies, and other regulators have different jurisdiction; license status and product structure must be identified before assigning a rule."],
    [/licensed and exempt/, "An exemption must be supported by the exact activity, actor, statute, and facts; it should never be assumed from a job title or business label."],
    [/points fees and annual percentage/, "Points and fees affect loan cost, while APR is a standardized credit-cost measure; neither should be represented as identical to the note interest rate."],
    [/trustor beneficiary and trustee/, "In a deed of trust, the trustor gives security, the beneficiary holds the secured interest, and the trustee performs authorized statutory functions."],
    [/subordination and reconveyance/, "Subordination changes lien priority by agreement; reconveyance releases the deed of trust after the secured obligation is satisfied."],
    [/fixed adjustable and balloon/, "Fixed-rate loans keep the note rate stable, adjustable-rate loans change under stated index and margin rules, and balloon loans require a large unpaid balance at maturity."],
    [/owner-occupied and business-purpose/, "Occupancy and loan purpose affect consumer-law coverage, underwriting, disclosures, and licensing; classification must follow actual documented facts."],
    [/loan application workflow|application and disclosures/, "A complete loan application triggers defined processing and disclosure duties; the file must preserve the information received and timing of each disclosure."],
    [/income asset and liability|document collection/, "Qualification evidence must be authentic, current, consistent, and sufficient to support income, assets, liabilities, source of funds, and repayment analysis."],
    [/credit history and capacity|ability-to-repay/, "Repayment analysis evaluates verified income or assets, obligations, credit history, loan terms, and other required factors rather than collateral value alone."],
    [/automated and manual underwriting/, "Automated underwriting provides a recommendation based on entered data; the originator and underwriter remain responsible for accuracy, conditions, and applicable manual review."],
    [/conditions and verification|condition management/, "Approval conditions must be satisfied with verified documents and cleared by authorized underwriting before closing; fabricated or stale evidence is unacceptable."],
    [/truth in lending|regulation z/, "TILA and Regulation Z require standardized credit-cost and transaction disclosures and impose substantive rules for covered consumer credit."],
    [/respa|regulation x/, "RESPA and Regulation X address settlement-service disclosures, servicing, escrow, referral-fee restrictions, and affiliated-business arrangements for covered loans."],
    [/ecoa|regulation b/, "ECOA and Regulation B prohibit discrimination in credit and regulate application notices, evaluation, adverse action, and appraisal-related rights."],
    [/hmda|regulation c/, "HMDA and Regulation C require covered institutions to collect, report, and disclose specified mortgage data that supports fair-lending analysis."],
    [/fcra|credit reporting/, "FCRA governs permissible access, accuracy, adverse-action information, disputes, and duties involving consumer reports."],
    [/advance fees and compensation|broker compensation disclosure/, "Mortgage compensation and advance-fee arrangements require lawful authority, accurate written disclosure, no prohibited steering, and complete accounting."],
    [/broker records and retention|dre audit/, "A DRE mortgage file must preserve required agreements, disclosures, receipts, trust records, advertising, communications, and transaction evidence for audit."],
    [/loan estimate|closing disclosure/, "The Loan Estimate and Closing Disclosure present standardized terms and settlement costs at prescribed stages for covered transactions and must be reconciled with the final loan."],
    [/affiliated business|referral risk/, "An affiliated-business arrangement requires prescribed disclosure and no required use except as law permits; referral compensation must be analyzed under RESPA and state law."],
    [/fee tolerance|changed circumstance/, "A revised estimate requires a valid changed circumstance or other permitted basis, timely redisclosure, and documentation linking the change to affected charges."],
    [/prepayment balloon|adjustable-rate disclosure/, "Material prepayment, balloon, and adjustable-rate features must be clearly disclosed so the consumer can understand timing, payment change, and refinance risk."],
    [/appraisal independence|valuation review/, "Mortgage participants must not coerce an appraiser to reach a target value; review should address support, consistency, errors, and permitted reconsideration channels."],
    [/private investor loans|hard-money/, "Private or hard-money lending requires verified investor and borrower facts, lawful broker authority, transparent cost and risk disclosure, suitability analysis, and complete documentation."],
    [/seller carryback/, "Seller financing creates a credit relationship documented by the sale contract, note, security instrument, disclosures, priority, servicing, and default terms."],
    [/usury exemptions/, "California usury analysis is fact-specific and may depend on a licensed broker's qualifying participation; a licensee should not promise an exemption without legal review."],
    [/servicing records|payment processing/, "Servicing requires accurate payment application, balances, escrow accounting, notices, consumer inquiries, and a complete history that can be reproduced."],
    [/payoff demand|reconveyance/, "A payoff demand states the amount required through a date; after satisfaction, release or reconveyance must follow the applicable process and timing."],
    [/delinquency and loss mitigation/, "Delinquency handling requires accurate borrower communication, current servicing and foreclosure rules, documented alternatives, and no guarantee of modification."],
    [/suspicious facts and escalation/, "Suspicious inconsistencies should be preserved and escalated through legal and compliance channels without coaching a party to change facts or tipping off prohibited information."],
    [/dre jurisdiction and consumer protection/, "DRE regulates California real-estate licensees and approved statutory education; a compliant practitioner identifies the licensed activity, the responsible broker, the applicable rule, and the consumer-protection record before acting."],
    [/broker and salesperson license relationships/, "A salesperson performs licensed acts only under the supervision of the responsible broker, while the broker remains accountable for policies, delegation, review, and correction."],
    [/sources of california real estate law/, "California real-estate duties can arise from statutes, Commissioner's Regulations, case law, approved forms, contracts, and broker policy; the controlling current authority must be distinguished from guidance or custom."],
    [/transaction participants and accountability/, "A transaction file should identify each participant, role, authority, duty, communication path, decision, and retained record so responsibility is not blurred among broker, salesperson, escrow, lender, inspector, and principal."],
    [/professional competence and scope/, "A licensee should accept only work the licensee can perform competently, disclose limitations, obtain supervision or qualified assistance, and avoid legal, tax, appraisal, or technical conclusions outside the authorized role."],
    [/property and client intake/, "Property and client intake requires verified identity and authority, lawful agency disclosure, objective client criteria, property facts, conflicts, deadlines, and a documented scope of representation before marketing or advising."],
    [/transaction file accountability/, "A defensible transaction file preserves executed agreements, disclosures, delivery evidence, instructions, material communications, receipts, changes, supervision, and closing records in a chronology that can be audited."],
    [/records and retention workflow/, "Records should be captured in their final executed version, indexed to the transaction and actor, protected against silent alteration, retained for the applicable period, and produced with an audit trail when requested."],
    [/marketing approval and archive/, "Marketing must be approved under broker policy before publication and archived with its exact content, date, channel, audience, license identification, approvals, and later corrections."],
    [/advertising and license identification|prohibited conduct and advertising/, "California real-estate advertising must be truthful, avoid material omission and unlawful discrimination, use required license and responsible-broker identification, and never imply unearned approval or expertise."],
    [/consumer inquiry and scope/, "At first inquiry, the professional identifies the consumer's request, explains the limited current relationship, avoids premature advice or agency assumptions, protects sensitive information, and routes the matter to an authorized licensee."],
    [/consumer-first communication/, "Consumer-first communication states material facts, costs, risks, choices, deadlines, conflicts, and uncertainty in plain language without pressure, concealment, discriminatory assumptions, or a guarantee of outcome."],
    [/consumer comparison and acknowledgment/, "A product or service comparison should use consistent verified criteria and disclose material differences; acknowledgment proves delivery or receipt, not necessarily understanding, consent to an unlawful term, or waiver of a duty."],
    [/complaint response|complaints documentation and professional response|borrower communication and complaint handling/, "A complaint should be logged promptly, preserved verbatim, acknowledged without retaliation, investigated against the record, escalated under policy, answered accurately, and closed with the response and corrective action retained."],
    [/consumer complaint and enforcement context/, "Complaint and enforcement review focuses on the actor's license authority, supervision, representations, documents, consumer harm, corrective response, and whether the file demonstrates compliance rather than after-the-fact reconstruction."],
    [/application and identity/, "An application file must connect the verified applicant to the information, authorization, disclosures, documents, and decisions without retaining more identity data than necessary or permitting substitution by another person."],
    [/intake and agency/, "Before substantive representation, intake should establish identity, property or transaction objective, lawful service criteria, agency status, compensation disclosures, conflicts, communication authority, and the record of consent."],
    [/listing and marketing/, "Listing and marketing begin only after authority is documented and require accurate property information, approved advertising, fair access, disclosure of known material facts, showing controls, and retention of the published versions."],
    [/listing cancellation expiration and protection/, "Listing cancellation, expiration, withdrawal, and protection rights depend on the written agreement, notice, broker authority, pending negotiations, protected prospects, compensation terms, and a documented handoff."],
    [/showing and access controls|open house and showing practices/, "Showing access requires owner authorization, secure key and visitor procedures, fair and objective scheduling, property-safety instructions, incident reporting, and no undisclosed surveillance or discriminatory screening."],
    [/offer and negotiation/, "Offers and negotiations require prompt objective presentation, client instructions, truthful communication, confidentiality, documented counteroffers, deadline control, and no invention or disclosure of competing terms without authority."],
    [/pricing discussion|pricing presentation and file support/, "Pricing advice should distinguish list price, market evidence, opinion, appraisal, seller objective, and actual sale price and should preserve the comparable data, adjustments, limitations, and client decision."],
    [/material facts and stigma limits/, "Known facts materially affecting value or desirability require analysis and disclosure under California law, while legally protected or nonmaterial stigma information must not be used to discriminate or mislead."],
    [/disclosure and investigation|investigation and inspections/, "The agent's disclosure and inspection duties require a reasonably competent visual review where applicable, identification of red flags, accurate transfer of known facts, recommendation of qualified inspection, and proof of timely delivery."],
    [/disclosure delivery and rescission timing/, "A disclosure is operationally complete only when the correct version reaches the required recipient at the required time with delivery evidence; late delivery can affect statutory cancellation or rescission rights."],
    [/financing disclosures/, "Financing discussion must separate estimates from commitments and disclose material loan terms, costs, assumptions, compensation, conflicts, contingencies, deadlines, and the risk that approval or funding may change."],
    [/financing failure and contingency response/, "When financing fails or changes, the agent should obtain reliable written information, calendar the contingency and notice terms, explain contractual choices without legal conclusions, document instructions, and protect deposit and cancellation rights."],
    [/transaction coordination/, "Transaction coordination tracks documents and deadlines, confirms authorized delivery and signatures, reports exceptions to the responsible broker and parties, and never converts clerical assistance into unlicensed advice or independent judgment."],
    [/escrow finance and closing|recording disbursement and possession/, "Closing coordination verifies escrow instructions, lender conditions, funds, title, signatures, recording, authorized disbursement, possession, keys, and final statements before representing that the transaction is complete."],
    [/post-closing file audit|post-closing audit and regulator-ready file|post-closing quality control|post-closing records/, "A post-closing audit reconciles the agreement, amendments, disclosures, receipts, trust entries, settlement statement, recording, possession, compensation, communications, and exceptions while preserving the locked historical file."],
    [/integrated california transaction audit|complete file compliance audit/, "An integrated compliance audit tests authority, agency, fair housing, disclosures, investigation, contract changes, funds, financing, escrow, advertising, supervision, closing, and retention against a single dated chronology."],
    [/errors omissions and supervision/, "An error or omission should be preserved, reported immediately to the responsible broker, assessed for consumer impact and deadlines, corrected transparently when authorized, and never hidden by altering the historical record."],
    [/documentation escalation and legal referral/, "Escalation is required when facts conflict, authority is unclear, a deadline or consumer right is at risk, or the issue exceeds licensed competence; the file should record the question, referral, instruction, and resulting action."],
    [/tenant selection and fair housing/, "Tenant selection must apply published objective criteria consistently, provide lawful accommodation handling, protect applicant data, document adverse decisions, and avoid steering, protected-class proxies, or selective screening."],
    [/maintenance habitability and access/, "Property management should document repair notices, urgency, owner instructions, lawful entry notice, vendor access, completion, habitability risk, and escalation without retaliatory or discriminatory treatment."],
    [/lease enforcement and termination/, "Lease enforcement and termination require the current agreement, accurate ledger, proper ground, statutory notice and timing, consistent treatment, protected-right review, and legal escalation rather than self-help."],
    [/owner reporting and risk controls/, "Owner reporting should reconcile income, expenses, deposits, work orders, delinquencies, trust balances, incidents, authorizations, and unresolved compliance risks without concealing material exceptions."],
    [/escrow accounts/, "Mortgage or property-management escrow accounts require accurate authorized deposits and disbursements, beneficiary ledgers, periodic reconciliation, required statements, and separation from operating funds."],
    [/transfer and income tax orientation/, "A licensee may explain that transfer, property, withholding, and income-tax issues can affect a transaction, but should use current official information and refer fact-specific tax conclusions to a qualified adviser."],
    [/deeds of trust and mortgages/, "A deed of trust or mortgage is a security instrument separate from the promissory note; parties, lien priority, default remedies, assignment, payoff, and release depend on the instrument and governing law."],
    [/recording and priority/, "Recording can establish constructive notice and affect competing lien or ownership priority, but priority also depends on instrument type, execution, notice, statute, subordination, and other facts."],
    [/default remedies and security risk/, "Default remedies depend on the note, security instrument, lien position, notices, cure and reinstatement rights, foreclosure law, bankruptcy or servicing constraints, and verified collateral risk."],
    [/depository and nondepository sources/, "Depository banks and credit unions and nondepository mortgage lenders or brokers operate under different charters, funding models, licenses, regulators, compensation structures, and product authority."],
    [/payment and yield calculations/, "Loan payment and yield calculations must identify principal, rate convention, term, payment frequency, points, fees, amortization, balloon amount, cash flows, and the difference between note rate, APR, and investor return."],
    [/occupancy and property purpose|business-purpose lending/, "Loan purpose and occupancy must follow documented facts because consumer protections, disclosures, underwriting, pricing, licensing, and remedies can differ for owner-occupied consumer and business-purpose credit."],
    [/application and identity/, "A mortgage application must preserve the applicant's verified identity, information actually received, authorization, declarations, signatures, and disclosure-trigger date without coaching or unsupported alteration."],
    [/underwriting and conditions|appraisal and underwriting|appraisal and collateral review/, "Underwriting evaluates verified borrower, credit, income, assets, liabilities, property, appraisal, title, program, and fraud information; every condition must be cleared by authorized decision-makers before funding."],
    [/approval denial and adverse action workflow|adverse information and accurate records/, "Approval, counteroffer, withdrawal, incompleteness, and adverse action must be classified from the actual decision, communicated within the applicable rule, supported by accurate reasons, and retained with the application record."],
    [/broker-arranged loan documentation/, "A broker-arranged loan file should connect authority, borrower request, investor or lender, compensation, disclosures, underwriting evidence, note and security instrument, trust funds, closing, servicing, and retained communications."],
    [/product comparison and disclosures|product suitability and documentation|ethical product presentation and documentation/, "Loan comparison uses the consumer's documented objectives and verified terms to compare rate, APR, payment, fees, risks, prepayment or balloon features, compensation, and alternatives without steering to increase pay."],
    [/clear-to-close and settlement|closing and compensation/, "Clear-to-close is not closing: final conditions, disclosure timing, settlement figures, funding authority, signatures, compensation, recording, disbursement, and post-closing delivery must each be verified."],
    [/agency documentation case/, "An agency case is resolved by tracing consent, disclosure delivery, representation, compensation, conflicts, communications, client instructions, and any dual-agency limitation through the actual documents and timeline."],
  ];
  for (const [pattern, description] of rules) if (pattern.test(t)) return description;
  return `The professional must analyze ${topic} using complete facts, the current governing source, required disclosures and timing, and a retained record of the authorized action.`;
}

function quizItems(course, lesson, lessonIndex) {
  const topics = lesson[1];
  return topics.slice(0, 5).map((topic, index) => {
    const distractorTopics = [topics[(index + 1) % topics.length], topics[(index + 2) % topics.length], topics[(index + 3) % topics.length]];
    const choices = [describeTopic(topic), ...distractorTopics.map(describeTopic)];
    return { id: `${course.id}-L${lessonIndex + 1}-Q${index + 1}`, topic, stem: `Which statement best explains ${topic}?`, choices, answer: "A", rationale: describeTopic(topic), reference: `Lesson ${lessonIndex + 1}, section ${index + 1}.` };
  });
}

function examItems(course, form) {
  const topicPool = course.lessons.flatMap((lesson, lessonIndex) => lesson[1].map((topic, topicIndex) => ({ topic, lessonIndex, topicIndex, lesson: lesson[0] })));
  const items = [];
  for (let i = 0; i < 100; i += 1) {
    const fact = topicPool[i % topicPool.length];
    const variant = i >= topicPool.length ? 2 : 1;
    const correct = describeTopic(fact.topic);
    const distractors = [1, 2, 3].map((offset) => describeTopic(topicPool[(i + 13 * offset) % topicPool.length].topic));
    const rotate = i % 4;
    const base = [correct, ...distractors];
    const choices = [...base.slice(rotate), ...base.slice(0, rotate)];
    const answer = "ABCD"[(4 - rotate) % 4];
    const context = form === "A" && variant === 1 ? `Which statement best explains ${fact.topic}?` : form === "A" ? `A California file raises ${fact.topic}. Which governing principle is most directly applicable?` : `A learner must advise a broker about ${fact.topic}. Which statement should anchor the analysis?`;
    items.push({ id: `${course.id}-${form}-${String(i + 1).padStart(3, "0")}`, stem: context, choices, answer, rationale: correct, reference: `Lesson ${fact.lessonIndex + 1}, topic ${fact.topicIndex + 1} (${fact.lesson}).` });
  }
  return items;
}

function itemsMarkdown(items, includeAnswers) {
  return items.map((item, index) => `${index + 1}. ${item.stem}\n\n${item.choices.map((choice, i) => `   ${"ABCD"[i]}. ${choice}`).join("\n")}\n${includeAnswers ? `\n   **Answer:** ${item.answer}  \n   **Rationale:** ${item.rationale}  \n   **Course reference:** ${item.reference}` : ""}`).join("\n\n");
}

function gip(course) {
  return `# Statutory/Pre-License General Information Page\n\n**Provide to the participant before registration/enrollment.**\n\n| Required item | StateCourse disclosure |\n|---|---|\n| School | StateCourse LLC - legal name confirmed; filing/mailing address and public telephone pending final execution |\n| Website / email | https://statecourse.com / public student-support email pending activation |\n| DRE sponsor ID | Pending first DRE course approval; StateCourse must not display an invented sponsor number |\n| Course | ${course.title} |\n| Description | ${course.description} |\n| Presentation | Correspondence/Internet; 15 sequential lesson assignments |\n| Hours | 45 hours |\n| Final | Internet-delivered, closed-book, remotely proctored; secure 100-item multiple-choice Form A, 180 minutes |\n| Course fees | PENDING BUSINESS DECISION - exact tuition, shipping, package discounts, and all other charges must be inserted and reconciled before filing |\n| Instructional materials | StateCourse ${course.title} Student Text and Workbook, v1.0; online lesson assignments; no separate textbook charge proposed |\n| Refund/cancellation | PENDING CALIFORNIA COUNSEL/BPPE REVIEW - final version must be inserted before filing and must match the website and enrollment agreement |\n\n## Final examination criteria\n\n- 100 multiple-choice questions; closed book; 180 minutes.\n- Passing score: 60%.\n- Two total attempts maximum. Form B contains different questions and is used only after a failed Form A.\n- A second failure earns no course credit. Re-enrollment and complete repetition of the course are required before another final.\n- The final is never printable or downloadable, times out at 180 minutes, and is delivered only through the proctor-controlled session.\n\n## California correspondence timing\n\n- A single course may not be completed in less than 2.5 weeks (420 elapsed hours) from the date the student receives course access to the date the final is successfully passed.\n- No more than two courses may be completed in any five-week period.\n- The course must be completed within one year after registration; otherwise the student must re-enroll and repeat the requirements.\n- Sequential segment controls require completion of each lesson assignment before the next lesson opens.\n\n## Identity\n\nImmediately before the final, the participant presents government-issued photo identification or current identification from a recognized real-estate-related trade organization issued within the preceding five years bearing photograph, signature, and identification number. The proctor records only the minimum verification metadata; a raw identity document is not placed in general student content storage.\n\n## Required notices\n\n**Development notice:** This course is not yet approved. Enrollment, payment, California credit, final administration, and certificates remain disabled until DRE approval is recorded.\n\n**DRE disclaimer to activate only after approval:** This course is approved for statutory/pre-license education credit by the California Department of Real Estate. However, this approval does not constitute an endorsement of the views or opinions which are expressed by the course sponsor, instructors, authors, or lecturers.\n\nThe Course and Instructor Evaluation form RE 318A and Course Provider Complaint forms RE 340/RE 340A are available at www.dre.ca.gov. StateCourse gives the links in the pre-enrollment disclosure, course orientation, and completion notice.\n${course.sb1495 ? "\n## SB 1495\n\nThis Real Estate Practice course includes implicit, explicit, and systemic bias instruction, actionable bias-interruption strategies, federal and California fair housing instruction, and a required participatory role-play in which the learner acts as both consumer and real estate professional. The completion certificate will state \"Compliant with SB 1495\" after approval.\n" : ""}`;
}

function timedOutline(course) {
  return `# Timed Course Outline - ${course.title}\n\n**Method:** Correspondence/Internet  \n**Total:** 45 instructional hours  \n**Assignments:** 15 separate lesson assignments x 3 hours\n\n| Assignment | Topic | Reading | Applied work | Assessment | Total |\n|---:|---|---:|---:|---:|---:|\n${course.lessons.map((lesson, i) => `| ${i + 1} | ${lesson[0]} | 150 min | 20 min | 10 min | 180 min |`).join("\n")}\n|  | **Total** | **2,250 min** | **300 min** | **150 min** | **2,700 min / 45 hours** |\n\nThe 100-item final examination is a separate secure, proctored event with a provider-proposed 180-minute limit. It is not used to reduce the 45 instructional hours.\n`;
}

function studentInstructions(course) {
  return `# Student Instructions - ${course.title}\n\n1. Review the General Information Page before registration. Do not enroll while the public status is In Development.\n2. After approval and enrollment, access starts when the LMS records delivery of the course materials. That timestamp starts the 420-hour minimum elapsed period.\n3. Complete all 15 lesson assignments in sequence. Each assignment includes reading, applied work, a five-item assessment, and targeted remediation when required.\n4. Instructor support remains available even though the course is self-guided. Use the help control for a course question; legal or transaction-specific advice is outside the course.\n5. The final unlocks only after all 15 assignments, remediation, identity/proctor scheduling, the 420-hour minimum, the cross-course five-week rule, and all compliance exceptions are satisfied.\n6. Present acceptable photo identification to the proctor. Do not receive, print, download, copy, photograph, or retain final-exam content.\n7. Form A contains 100 multiple-choice questions, is closed book, has a 180-minute limit, and requires 60%. If failed, one different Form B may be taken under a new proctored session.\n8. A second failure earns no credit. Re-enrollment and completion of the entire course are required before another examination.\n9. A certificate is issued within 15 days only after approval is valid and every completion condition is verified.\n`;
}

function proctorInstructions(course) {
  return `# Exam Proctor/Monitor Instructions - ${course.title}\n\n## Eligibility and independence\n\nThe proctor is designated by StateCourse and may not be related to the student by blood, marriage, or domestic partnership and may not have another relationship - including a prospective responsible-broker relationship - that could reasonably influence administration. The proctor must not be selected solely by the student without StateCourse approval.\n\n## Before the examination\n\n1. Confirm the secure appointment, course, form, student, and authorized attempt.\n2. Inspect acceptable current photo identification and match the person, name, photograph, signature, and identification number. Record document type, issuing authority, last four characters, verification result, and timestamp; do not retain an unnecessary full image.\n3. Inspect the testing space and confirm the closed-book rule, no second device, no notes, no recording, no assistance, and no other person present.\n4. Open the secure proctor session. The exam is never sent directly to the student and is not printable or downloadable.\n\n## During the examination\n\nMaintain supervision for the 180-minute session. The system records start, timeout, reconnection, submission, and incident events. Do not interpret questions, identify answers, permit copying, or extend time except under an approved accommodation. End and report a material security event.\n\n## After the examination\n\nSubmit the secure exam, confirm that no exam content remains with the student, and complete the certification below. The LMS returns the completed exam to StateCourse and preserves the attempt; the student does not transmit the final.\n\n## Certification\n\nI certify that I verified the participant's identity, was independent under the above standard, supervised the complete examination, enforced the stated rules, provided no assistance, and returned the examination only through the StateCourse secure proctor process.\n\nProctor name: ____________________  Signature: ____________________  Date/time: ____________________\n\nStudent: ____________________  Course: ${course.title}  Form: ______  Incident report ID (if any): ______\n`;
}

function regulatorInstructions(course) {
  return `# California DRE Reviewer Access - ${course.title}\n\nStateCourse provisions two distinct accounts for this correspondence/Internet method when the RE 306 package is filed. Credentials are transmitted to DRE through the filing channel or a separate secure message and are never committed to source control.\n\n- **Student login:** shows the course and final-exam information exactly as a student sees it, including sequential controls and timing messages. It cannot receive official credit because it is a reviewer fixture.\n- **Regulator login:** shows every lesson, assessment, remediation path, Form A and Form B, and audit view while bypassing study-time restrictions. A permanent banner states: \"California DRE Regulatory Review Mode - study-time restrictions bypassed; no student credit generated.\"\n- Reviewer events use isolated account IDs, cannot create a paid enrollment or certificate, and are excluded from completion and reporting.\n- Filing cover sheet fields: student username [PROVISION AT FILING], regulator username [PROVISION AT FILING], passwords [DELIVER SEPARATELY], environment URL [PRODUCTION REVIEW URL AFTER SECURITY QA].\n`;
}

function certificate(course) {
  return `# Course Completion Certificate Template - ${course.title}\n\n**STATECOURSE LLC**  \nFiling address and public telephone: [CONFIRM BEFORE SUBMISSION]\n\nThis certifies that **[Student legal name]** successfully completed the correspondence/home study course and passed the final exam with a score of 60% or better.\n\n| Field | Value |\n|---|---|\n| Course title | ${course.title}${course.sb1495 ? " - Compliant with SB 1495" : ""} |\n| Course type | Correspondence/Internet |\n| Credit hours | 45 |\n| DRE six-digit approval number | [PENDING DRE APPROVAL] |\n| Registration/access date | [DATE] |\n| Successful completion date | [DATE] |\n| Student mailing address | [ADDRESS] |\n| Student DRE license number, if any | [OPTIONAL/APPLICABLE] |\n| Verifier printed name | [NAME] |\n| Verifier signature and phone | [SIGNATURE / PHONE] |\n\nNo certificate may be generated while the course approval number is pending, expired, suspended, or does not match the student's exact course version. Delivery must occur within 15 days after verified successful completion.\n`;
}

function submissionIndex(course) {
  return `# RE 306 Submission Package Index - ${course.title}\n\n**Filing status:** Prepared development draft; not submitted and not approved.\n\n1. Official RE 306 form - populated draft; filing addresses, BPPE determination, fees/policies, signatures, and dates remain execution gates.\n2. $500 course application fee using current RE 206E (verify again on filing day).\n3. StateCourse LLC entity document and good-standing exhibit - attach current filed copy to this and every course package.\n4. FBNS exhibit, if StateCourse uses a fictitious business name; otherwise mark not applicable.\n5. RE 304 only if the sponsor is out of state under the DRE rule.\n6. Complete student instructional material: 15 lesson assignments, workbook tasks, assessments, and remediation.\n7. Copyright schedule: StateCourse original manuscript; no third-party textbook incorporated. Official DRE sources are cited rather than republished as altered content.\n8. College/university professor textbook-equivalency certification on official institution letterhead - external signature required for this original manuscript.\n9. RE 336 for Anatoliy Kanevsky plus supporting experience evidence - Commissioner determination pending; no instructor approval claim.\n10. General Information Page.\n11. Timed Course Outline (45 hours).\n12. Student Final Exam Instructions.\n13. Instructor and Proctor/Monitor Instructions.\n14. Student versions, Form A and alternate Form B - 100 questions each.\n15. Instructor versions, Form A and Form B, with answer keys and course references.\n16. Student and regulator login cover sheet; live credentials delivered securely at filing.\n17. Course completion certificate sample.\n18. Course and Instructor Evaluation / complaint notification procedure.\n19. RE 306 consistency audit and filing-readiness gate sheet.\n\nDRE's RE 303 suggests first-time applicants send one course application first to avoid repeating deficiencies. StateCourse's proposed order is Real Estate Principles first, followed by the separately prepared Real Estate Practice and Mortgage Loan Brokering and Lending packages after the initial format review.\n`;
}

function buildCourse(course) {
  const dir = path.join(out, course.id);
  const lmsConfig = {
    schema_version: "1.0",
    state: "CA",
    regulator: "California Department of Real Estate",
    course_id: course.id,
    payment_product_id: course.paymentId,
    title: course.title,
    version: "1.0",
    status: "development",
    approved: false,
    enrollment_enabled: false,
    credit_enabled: false,
    approval_number: null,
    required_hours: 45,
    delivery: "correspondence_internet",
    lesson_assignments: 15,
    lesson_minutes: 180,
    sequential_segments: true,
    minimum_elapsed_hours: 420,
    maximum_completion_days: 365,
    cross_course_completion_rule: { maximum_courses: 2, window_days: 35, student_attestation_of_other_school_completions: true },
    lesson_mastery: { passing_percent: 80, source: "StateCourse provider policy proposed for DRE review", remediation_required: true },
    final_exam: { forms: 2, questions_per_form: 100, passing_percent: 60, time_minutes: 180, closed_book: true, proctored: true, max_attempts: 2, form_b_only_after_failed_form_a: true, printable: false, downloadable: false, timeout_required: true },
    identity: { verified_immediately_before_final: true, accepted_id_rule: "RE 303 Rev. 1/26" },
    reviewer_access: { student_login: true, regulator_login: true, bypass_time_only_for_regulator: true, reviewer_credit_disabled: true },
    certificate: { enabled: false, deliver_within_days: 15, requires_current_approval: true, approval_number_required: true, sb1495_statement: Boolean(course.sb1495) },
    records: { duplicate_certificate_records_for_life_of_school: true, version_locked: true, audit_log: true },
    material_change_requires_dre_review_before_use: true,
  };
  writeJson(path.join(dir, "lms-config.json"), lmsConfig);
  write(path.join(dir, "general-information-page.md"), gip(course));
  write(path.join(dir, "timed-course-outline.md"), timedOutline(course));
  write(path.join(dir, "student-instructions.md"), studentInstructions(course));
  write(path.join(dir, "proctor-instructions.md"), proctorInstructions(course));
  write(path.join(dir, "regulator-login-requirements.md"), regulatorInstructions(course));
  write(path.join(dir, "completion-certificate-template.md"), certificate(course));
  write(path.join(dir, "re306-submission-index.md"), submissionIndex(course));
  write(path.join(dir, "instructor-exam-instructions.md"), proctorInstructions(course).replace("Exam Proctor/Monitor", "Instructor and Exam Administrator"));
  write(path.join(dir, "college-equivalency-certification-template.md"), `# College/University Professor Certification Template - ${course.title}\n\n[Official institution letterhead required]\n\nI have reviewed the complete StateCourse LLC manuscript, lesson assignments, learning objectives, timed outline, assessments, and examinations for ${course.title}. In my professional judgment as a college/university instructor in the field of real estate, this content is equivalent in quality and scope to course material used in a three-semester-unit or four-quarter-unit college or university course in ${course.title}.\n\nThe signer must describe current institution, title, field, and basis for evaluation, identify the exact manuscript version reviewed, sign, and date. This template is not evidence until completed on official letterhead by a qualified external professor.\n`);
  course.lessons.forEach((lesson, index) => write(path.join(dir, "curriculum", `lesson-${String(index + 1).padStart(2, "0")}.md`), lessonMarkdown(course, lesson, index)));
  const quizzes = course.lessons.flatMap((lesson, index) => quizItems(course, lesson, index));
  write(path.join(dir, "assessments", "lesson-quizzes-student.md"), `# ${course.title} - Lesson Quizzes (Student Version)\n\n${itemsMarkdown(quizzes, false)}`);
  write(path.join(dir, "assessments", "lesson-quizzes-instructor-key.md"), `# ${course.title} - Lesson Quizzes (Instructor Version)\n\n${itemsMarkdown(quizzes, true)}`);
  write(path.join(dir, "assessments", "remediation-plan.md"), `# Remediation Plan - ${course.title}\n\nEvery missed lesson item maps to its topic and course reference. The LMS presents: (1) an alternate explanation, (2) a new California scenario, (3) a parallel scored question, and (4) instructor-support escalation after three unsuccessful attempts on the same concept. Remediation results are version-locked and auditable. DRE does not prescribe the 80% lesson threshold; this is StateCourse's proposed academic control and remains subject to course approval.\n`);
  for (const form of ["A", "B"]) {
    const items = examItems(course, form);
    write(path.join(dir, "secure-final-exam", `form-${form.toLowerCase()}-student-version.md`), `# ${course.title} - Final Examination Form ${form}\n\n## Student Version - Secure / Not for student download\n\n100 multiple-choice questions · 180 minutes · Closed book · Passing score 60%\n\n${itemsMarkdown(items, false)}`);
    write(path.join(dir, "secure-final-exam", `form-${form.toLowerCase()}-instructor-version.md`), `# ${course.title} - Final Examination Form ${form}\n\n## Instructor Version - Confidential\n\n${itemsMarkdown(items, true)}`);
  }
  const words = course.lessons.reduce((sum, lesson, index) => sum + lessonMarkdown(course, lesson, index).split(/\s+/).length, 0);
  write(path.join(dir, "manuscript-density-report.md"), `# Manuscript Density Report - ${course.title}\n\nGenerated student instructional manuscript word count: **${words.toLocaleString()} words** across 15 assignments. At the DRE handbook's discussion of approximately 200 words per page, this is approximately **${Math.floor(words / 200)} text-equivalent pages** before workbook, quizzes, forms, and examinations. DRE describes approximately 450 pages as a general college-equivalency indicator, not an automatic safe harbor. Independent professor certification and editorial review of the exact filing version remain mandatory gates.\n`);
  return { ...course, words };
}

const built = courses.map(buildCourse);

write(path.join(out, "official-sources.md"), `# California Official Source Register\n\n**Last verified:** 2026-08-16  \n**Controlling regulator:** California Department of Real Estate\n\n${sources.map(([name, url, use]) => `- [${name}](${url}) - ${use}`).join("\n")}\n\nNo Virginia, Maine, Wisconsin, Missouri, Oklahoma, Arizona, Washington, Pennsylvania, North Carolina, or Colorado rule is imported into California. Provider-selected academic controls are labeled as proposals pending DRE approval.\n`);

write(path.join(out, "regulatory-compliance-matrix.md"), `# California Statutory/Pre-License Compliance Matrix\n\n| Official requirement | StateCourse control/evidence | Status |\n|---|---|---|\n| DRE approves individual courses, not the provider | Three separate course and RE 306 records; sponsor ID remains pending | Built / approval pending |\n| Course equivalent to accredited college/university quality | 45-hour manuscripts, timed outlines, 15 assignments, exams; professor certification templates | External professor certification pending |\n| Minimum 45 hours | 2,700 instructional minutes per course | Built |\n| Correspondence course has at least 15 separate lesson assignments | Exactly 15 sequential assignments per course | Built |\n| Instructor available to self-guided students | Instructor support workflow and queue | Built / named instructor determination pending |\n| Qualified instructor and RE 336 evidence | Anatoliy Kanevsky alternative-experience package | Prepared / DRE determination pending |\n| Final exam administered/supervised by designated independent proctor | Secure proctor workflow and certification | Built |\n| 100+ multiple-choice/fill-in questions; 60%+ | Two 100-item forms, 60%, 180-minute closed-book policy | Built / provider choices pending approval |\n| One optional retake uses different questions | Form B only after failed Form A; second failure requires reenrollment | Built |\n| Student never handles delivery/return of exam | Proctor-controlled nonprintable/nondownloadable session | Built |\n| Identity immediately before correspondence final | Approved photo ID verification and minimum-data log | Built |\n| Internet course segments sequential | Server-authoritative segment completion state | Built |\n| Internet final assures enrolled person is examinee and times out | Identity + proctor + 180-minute timeout | Built |\n| Student and regulator logins | Separate role fixtures; regulator bypasses time with no credit | Built / credentials provisioned at filing |\n| GIP before enrollment | Versioned pre-enrollment disclosure and acceptance | Built / address, fees, refund terms pending |\n| Single course not completed under 2.5 weeks | 420 elapsed-hour final-pass gate from course access | Built |\n| No more than two courses completed in five weeks | 35-day portfolio rule plus outside-school attestation | Built |\n| Complete within one year | 365-day expiration and reenrollment | Built |\n| Certificate within 15 days; required fields | Separate certificate template per course | Built / disabled before approval |\n| Practice course SB 1495 content and role-play | Lesson 14 dual-role participatory activity and certificate label | Built |\n| Student records support duplicate certificate while school operates | Durable certificate ledger and immutable course version | Architecture built |\n| Evaluation and complaint notices | RE 318A, RE 340, RE 340A links in GIP/orientation/completion | Built |\n| Material change submitted before use | Version lifecycle blocks unapproved material changes | Built |\n| $500 current application fee per course | Three separate filing checklists; $1,500 total current fees | Budgeted / verify filing day |\n| BPPE status disclosed | Explicit legal determination gate on each RE 306 | Pending counsel/BPPE determination |\n`);

write(path.join(out, "course-administration-policy.md"), `# California Correspondence Course Administration Policy\n\n## Course independence\n\nEach 45-hour course is a separate DRE approval, course version, enrollment, 15-assignment record, exam pair, certificate, and completion event. A commercial bundle never merges regulatory records.\n\n## Time and sequence\n\nThe access-granted timestamp starts the 420-hour minimum. A successful final before the timestamp is technically impossible. The portfolio service also prevents more than two StateCourse California correspondence completions in 35 days and requires a truthful disclosure of outside-school course completions. All 15 assignments are sequential. Course access expires after 365 days. These controls implement the California timing rules; they do not import Virginia-style per-hour active timers.\n\n## Assessment and final\n\nLesson quizzes and remediation are provider-selected academic controls. The DRE final is separate: 100 questions, 60%, two forms maximum, one retake, designated independent proctor, identity check, no student custody, no printing/download, and automatic timeout.\n\n## Approval gate\n\nCheckout, enrollment, final administration, completion credit, and certificates remain disabled until the exact course and delivery approval is recorded. Reviewer accounts generate no student credit. Material changes create a new development version and cannot replace an approved version without DRE review.\n`);

write(path.join(out, "submission-master-checklist.md"), `# California First-Priority Submission Master Checklist\n\n## Proposed filing order\n\n1. Real Estate Principles - first filing, consistent with RE 303's advice that a first-time applicant submit one course before multiple courses.\n2. Real Estate Practice - separately filed after initial format feedback; includes SB 1495 evidence.\n3. Mortgage Loan Brokering and Lending - separately filed after initial format feedback.\n\n## Release gates common to every package\n\n- Confirm StateCourse LLC filing/mailing address, public phone, public support email, website, California/out-of-state entity status, and attach current Secretary of State evidence.\n- Obtain written BPPE applicability/exemption determination and insert the exact basis.\n- Insert exact tuition, all charges, cancellation, and refund terms; reconcile with website and enrollment agreement.\n- Obtain independent college professor certification on official letterhead for each exact manuscript.\n- Complete and sign RE 336; attach qualification evidence; await DRE instructor determination.\n- Provision secure student/regulator accounts and transmit passwords separately.\n- Perform legal, editorial, accessibility, exam-item, security, and cross-document consistency QA.\n- Verify the current RE 206E fee on filing day.\n- Obtain original or compliant electronic signatures; no rubber-stamp/digital image signature.\n\nNo item labeled pending may be converted to a favorable claim without documentary evidence.\n`);

write(path.join(out, "instructor", "anatoliy-kanevsky-re336-qualification-narrative.md"), `# Anatoliy Kanevsky - RE 336 Qualification Narrative\n\n**Status:** Candidate instructor; DRE approval/determination not granted.\n\n## Officially verifiable California experience\n\nCalifornia DRE's public record for license 01385024, retrieved for this package, identifies Kanevsky, Anatoliy as a LICENSED real estate broker with expiration 11/15/2029, salesperson license issued 10/06/2003, broker license issued 07/16/2009, MLO endorsement record NMLS ID 2775380, current affiliated licensed corporation West Coast Capital Mortgage (02440065), and no disciplinary action/public comments shown on the retrieved record. The filing must include a fresh license printout generated on or immediately before filing day.\n\nThe official dates establish more than twenty-two years of California licensure and more than seventeen years as a California broker by August 2026. They do not, without supporting records, prove continuous full-time performance in every subject taught.\n\n## Experience-based request\n\nStateCourse requests Commissioner consideration under the RE 336/Article 24 path allowing education or experience, or a combination, to evidence teaching qualifications. The proposed supporting résumé describes long-term California brokerage, mortgage origination/brokerage, broker supervision, residential development and construction-related transaction work, investor finance, private-capital transactions, property analysis, contract/escrow coordination, and regulatory file review. Course-specific matrices connect that experience to Real Estate Principles, Real Estate Practice, and Mortgage Loan Brokering and Lending.\n\n## Evidence limits\n\nThe package does not claim a college degree, California teaching credential, or DRE instructor approval. A retrieved education affidavit establishes high-school completion only and is not used to imply the listed bachelor's/associate-degree qualification. Development projects, employer dates, volumes, and mortgage activity must be supported by signed résumé detail, company records, transaction examples with consumer information redacted, licenses, and references. NMLS 2775380 is used because it appears on the official DRE license record; conflicting 2817729 signatures are excluded unless independently resolved.\n`);

write(path.join(out, "instructor", "re336-evidence-matrix.md"), `# RE 336 Supporting Evidence Matrix - Anatoliy Kanevsky\n\n| Evidence | Qualification supported | Filing treatment |\n|---|---|---|\n| Current DRE public license printout 01385024 | Licensed since 10/06/2003; broker since 07/16/2009; current licensed status; no displayed discipline | Attach fresh official printout |\n| DRE MLO endorsement listing, NMLS 2775380 | Mortgage subject-matter nexus | Attach DRE printout and current NMLS Consumer Access record; do not use 2817729 without resolution |\n| West Coast Capital Mortgage corporation/officer record | Brokerage and supervision nexus | Attach current corporation/license evidence |\n| Signed chronological résumé | Full-time/part-time dates, duties, broker supervision, mortgage, development, transaction practice | Candidate to complete and sign |\n| Redacted representative transaction list | Practical experience by course topic | Prepare 8-12 examples without consumer NPI |\n| Residential development evidence | Land, construction, feasibility, finance, entitlement, sale/lease experience | Attach entity/project records and role description |\n| Professional references | Independent corroboration of experience and instructional capacity | Obtain 2-3 signed letters |\n| Teaching/presentation evidence, if any | Ability to organize and explain subject matter | Attach only verified examples |\n| Course-specific instructor matrices | Connection between experience and each course | Included |\n| RE 336 signed certifications | Required formal certification | Sign only after every statement and exhibit is verified |\n\n**Decision gate:** StateCourse cannot list Anatoliy Kanevsky as DRE-approved or permit regulated instruction until DRE accepts the RE 336 evidence for the applicable course(s).\n`);

for (const course of courses) {
  write(path.join(out, "instructor", `re336-course-matrix-${course.short}.md`), `# RE 336 Course Matrix - ${course.title}\n\nInstructor candidate: Anatoliy Kanevsky, California broker 01385024.\n\n${course.lessons.map((lesson, index) => `- **Assignment ${index + 1}: ${lesson[0]}** - candidate résumé/evidence must demonstrate direct education or experience with ${lesson[1].join(", ")}.`).join("\n")}\n\nThis mapping supports review; it is not DRE approval and does not replace documentary substantiation.\n`);
}

write(path.join(out, "instructor", "re336-filing-checklist.md"), `# RE 336 Filing Checklist - Anatoliy Kanevsky\n\n- Prepare one RE 336 for each course title unless DRE directs a consolidated filing.\n- Primary contact completes provider/course fields and signs under penalty of perjury after evidence review.\n- Instructor signs, answers license-history question YES, and enters 01385024.\n- Attach current DRE record and evidence matrix exhibits.\n- Resolve NMLS conflict; use 2775380 only because the DRE public record presently displays it.\n- Confirm all employment/project dates, full-time equivalency, duties, and references.\n- Do not claim listed degree/credential qualifications absent documentary proof.\n- Request Commissioner evaluation based on extensive education/experience combination.\n- Record DRE decision per course. Until accepted, instructor_status = pending_submission/pending_dre_review and teaching_access = false.\n`);

// Public and platform integration.
const registryPath = path.join(pub, "data/state-registry.json");
const registry = readJson(registryPath);
const ca = registry.states.find((state) => state.state_code === "CA");
Object.assign(ca, {
  regulator_name: "California Department of Real Estate",
  regulator_url: "https://www.dre.ca.gov/licensees/courseproviders.html",
  provider_status: "In Development",
  allowed_delivery_methods: ["Correspondence", "Correspondence/Internet", "Other separately approved delivery methods"],
  asynchronous_online_allowed: true,
  live_online_allowed: true,
  classroom_allowed: true,
  ARELLO_required: false,
  ARELLO_status: "Not identified as a California DRE statutory-course requirement",
  instructor_approval_required: true,
  prelicense_hours: 135,
  course_approval_required: true,
  reporting_requirements: "DRE inspection/monitoring, student and regulator accounts, completion records, duplicate certificate capability, material-change control.",
  record_retention_period: "Student records sufficient to prepare duplicate certificates for as long as the school remains in business.",
  refund_policy_rules: "Course-specific GIP and enrollment terms; exact StateCourse policy pending BPPE/counsel and business approval.",
  enrollment_period: "Minimum 2.5 weeks per 45-hour correspondence course; no more than two completed in five weeks; one-year maximum from registration.",
  final_exam_rules: "Each course: 100+ questions, 60% minimum, one different retake maximum, designated proctor, identity control, nonprintable/nondownloadable online exam with timeout.",
  proctoring_rules: "Independent school-designated proctor; student never handles exam delivery/return; photo ID immediately before exam.",
  certificate_rules: "Within 15 days; required RE 311 fields and correspondence completion statement; Practice certificate states Compliant with SB 1495 after approval.",
  notes: "Three separate 45-hour correspondence/Internet course records. DRE approves courses, not providers. Not approved; enrollment and credit disabled.",
  public_status: "In Development",
  course_ids: courses.map((course) => course.paymentId),
});
writeJson(registryPath, registry);

const catalogPath = path.join(pub, "data/course-catalog.json");
const catalog = readJson(catalogPath);
catalog.categories[0].programs = catalog.categories[0].programs.filter((program) => program.state_code !== "CA");
catalog.categories[0].programs.push({
  program_id: "ca-salesperson-prelicense",
  state_code: "CA",
  program_type: "Salesperson Statutory/Pre-License",
  courses: courses.map((course) => ({
    approved_hours: null,
    approval_status: "In Development",
    approval_number: null,
    approval_date: null,
    expiration_date: null,
    instructor_id: "anatoliy-kanevsky-candidate",
    instructor_status: "qualification_package_prepared_not_approved",
    price: null,
    enrollment_enabled: false,
    refund_policy_version: "ca-pending-bppe-counsel-business-review",
    disclosures_version: `${course.paymentId}-gip-v1-draft`,
    course_version: "1.0",
    course_id: course.paymentId,
    state_id: "CA",
    program_type: "Statutory/Pre-License Correspondence",
    course_title: course.title,
    regulator: "California Department of Real Estate",
    required_hours: 45,
    delivery_method: "Correspondence/Internet - proposed",
    final_exam_rules: "100 questions, 60%, proctored, one different retake, 180-minute provider-proposed limit.",
    certificate_template: `${course.paymentId}-draft`,
    reporting_rules: "DRE inspection/reviewer access, lifelong duplicate-certificate record, material-change control.",
    route: `/real-estate/california/pre-license/${course.short}/`,
  })),
});
writeJson(catalogPath, catalog);

const frameworksPath = path.join(pub, "data/launch-course-frameworks.json");
const frameworks = readJson(frameworksPath);
frameworks.courses = frameworks.courses.filter((course) => !course.course_id.startsWith("ca-"));
for (const course of courses) {
  frameworks.courses.push({
    course_id: course.id,
    state: "CA",
    state_name: "California",
    title: course.title,
    version: "1.0",
    required_hours: 45,
    status: "In Development",
    approval_number: null,
    enrollment_enabled: false,
    route: `/real-estate/california/pre-license/${course.short}/`,
    regulator: "California Department of Real Estate",
    delivery: "Correspondence/Internet - proposed; approval pending",
    modules: course.lessons.map((lesson, index) => ({ id: `CA-${course.short.slice(0, 3).toUpperCase()}-${String(index + 1).padStart(2, "0")}`, title: lesson[0], hours: 3 })),
    public_notice: "Course in development. Not approved; enrollment, credit, final administration, and certificates unavailable.",
  });
}
writeJson(frameworksPath, frameworks);

const controlsPath = path.join(root, "config/state-regulatory-controls.json");
const controls = readJson(controlsPath);
for (const course of courses) controls.states[course.id] = readJson(path.join(out, course.id, "lms-config.json"));
writeJson(controlsPath, controls);

const versionsPath = path.join(root, "config/regulatory-course-versions.json");
const versions = readJson(versionsPath);
versions.courses = versions.courses.filter((course) => !course.course_id.startsWith("ca-"));
for (const course of courses) versions.courses.push({ course_id: course.id, title: `${course.title} v1.0`, state: "CA", version: "1.0", status: "development", submitted_at: null, regulator_correction_at: null, approved_at: null, effective_date: null, expiration_date: null, course_approval_number: null, instructor_id: "anatoliy-kanevsky-candidate", instructor_status: "not_approved", enrollment_enabled: false });
writeJson(versionsPath, versions);

const approvalPath = path.join(root, "config/state-approval-records.json");
const approvals = readJson(approvalPath);
approvals.states.CA = {
  state: "CA",
  regulator: "California Department of Real Estate",
  reviewed: "2026-08-16",
  public_status: "In Development",
  enrollment_enabled: false,
  approval_model: "individual_course_approval_not_provider_approval",
  sponsor_id: null,
  bppe_determination: null,
  approval_records: {
    instructor: { status: "development", approval_number: null, effective_date: null, expiration_date: null, communications: [] },
    real_estate_principles: { status: "development", approval_number: null, effective_date: null, expiration_date: null, communications: [] },
    real_estate_practice: { status: "development", approval_number: null, effective_date: null, expiration_date: null, communications: [] },
    mortgage_loan_brokering_and_lending: { status: "development", approval_number: null, effective_date: null, expiration_date: null, communications: [] },
  },
  courses: Object.fromEntries(courses.map((course) => [course.id, { status: "development", application: "RE 306 Rev. 1/26", fee_current: 500, submitted_at: null, approved_at: null, approval_number: null, expiration_date: null, enrollment_enabled: false }])),
  instructor: { name: "Anatoliy Kanevsky", dre_license: "01385024", status: "qualification_package_prepared_not_approved", re336_signed: false, dre_determination: null, teaching_enabled: false },
  release_gates: ["RE 306 approval for exact course/method", "RE 336 instructor determination", "BPPE determination", "complete filing data and policy versions", "secure reviewer credentials", "administrator approval record"],
  sources: sources.map(([name, url]) => ({ name, url })),
};
writeJson(approvalPath, approvals);

const genericPage = (course) => {
  const rel = "../../../../";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${esc(course.title)} 45-hour California correspondence course development record."><title>${esc(course.title)} | California StateCourse</title><link rel="icon" href="${rel}favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="${rel}styles.css"><link rel="stylesheet" href="${rel}institutional-v2.css"><link rel="stylesheet" href="${rel}state-course.css"></head><body class="framework-page" data-course-id="${course.id}"><a class="skip-link" href="#curriculum">Skip to curriculum</a><header class="site-header"><div class="header-inner"><a class="brand" href="${rel}index.html"><span class="brand-seal">SC</span><span><strong>StateCourse</strong><small>Professional Licensing Education</small></span></a><nav class="primary-nav"><a href="../">California</a><a href="#curriculum">Assignments</a><a href="#requirements">Requirements</a></nav><a class="header-action" href="#curriculum">Review course</a></div></header><main><section class="framework-masthead"><div class="framework-title-grid"><div><p class="framework-breadcrumb">Real Estate / California / Statutory Pre-License</p><h1>${esc(course.title)}</h1><p class="framework-deck">45-hour correspondence/Internet course · 15 separate lesson assignments · Course v1.0</p></div><aside class="framework-status"><span>California DRE status</span><strong>In Development</strong><p>Not approved. Enrollment, payment, credit, examination, and certificates are disabled.</p></aside></div><dl class="framework-facts"><div><dt>Required instruction</dt><dd>45 hours</dd></div><div><dt>Minimum completion</dt><dd>2.5 weeks</dd></div><div><dt>Final exam</dt><dd>100 questions · 60%</dd></div><div><dt>Instructor candidate</dt><dd>Anatoliy Kanevsky · not DRE-approved</dd></div></dl></section><div class="framework-body"><section class="framework-intro" id="overview"><h2>A separate California course record.</h2><div class="framework-intro-copy"><p>${esc(course.description)}</p><div class="framework-callout"><strong>Correspondence control:</strong> all 15 assignments are sequential. The final cannot be passed earlier than 420 hours after access, and no more than two courses may be completed in five weeks.</div></div></section><section class="framework-curriculum" id="curriculum"><div class="framework-heading"><h2>Fifteen lesson assignments</h2><p>Three hours each · exactly 45 instructional hours.</p></div><div data-module-list></div></section><section class="framework-bottom" id="requirements"><article><h3>Secure final examination</h3><p>Two confidential 100-item forms, 60% passing, one different retake, school-designated independent proctor, identity verification, no printing/download, and 180-minute timeout proposed.</p></article><article><h3>Reviewer access</h3><p>California DRE receives a true student account and an isolated regulator account that shows every assessment and bypasses study time without generating student credit.</p></article><article><h3>Instructor status</h3><p>Anatoliy Kanevsky's RE 336 experience package is prepared. DRE has not granted instructor approval or made a qualification determination.</p></article></section></div></main><footer class="site-footer"><div><a class="brand footer-brand" href="${rel}index.html"><span class="brand-seal">SC</span><span><strong>StateCourse</strong><small>Professional Licensing Education</small></span></a></div><p>California v1.0 · Development draft · Enrollment disabled</p></footer><script src="${rel}state-course.js" defer></script></body></html>`;
};

for (const course of courses) write(path.join(pub, "real-estate/california/pre-license", course.short, "index.html"), genericPage(course));

write(path.join(pub, "real-estate/california/pre-license/index.html"), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>California Real Estate Pre-License | StateCourse</title><link rel="icon" href="../../../favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="../../../styles.css"><link rel="stylesheet" href="../../../institutional-v2.css"><link rel="stylesheet" href="../../../state-course.css"></head><body class="framework-page"><header class="site-header"><div class="header-inner"><a class="brand" href="../../../index.html"><span class="brand-seal">SC</span><span><strong>StateCourse</strong><small>Professional Licensing Education</small></span></a><nav class="primary-nav"><a href="#courses">Courses</a><a href="#requirements">California requirements</a><a href="../../../downloads/california/">Submission downloads</a></nav></div></header><main><section class="framework-masthead"><div class="framework-title-grid"><div><p class="framework-breadcrumb">Real Estate / California</p><h1>California statutory pre-license education</h1><p class="framework-deck">Three separate 45-hour correspondence courses prepared under the California DRE January 2026 Course Provider Handbook.</p></div><aside class="framework-status"><span>Public status</span><strong>In Development</strong><p>Not DRE-approved. Enrollment and credit are unavailable.</p></aside></div><dl class="framework-facts"><div><dt>Courses</dt><dd>3 separate approvals</dd></div><div><dt>Total pathway</dt><dd>135 hours</dd></div><div><dt>Assignments</dt><dd>45 total</dd></div><div><dt>Current filing fee</dt><dd>$500 each</dd></div></dl></section><div class="framework-body"><section class="framework-curriculum" id="courses"><div class="framework-heading"><h2>California course records</h2><p>Principles and Practice are required; Mortgage Loan Brokering and Lending is the selected third statutory course.</p></div><div>${courses.map((course, index) => `<article class="framework-module"><span>${String(index + 1).padStart(2, "0")}</span><div><p>45-hour correspondence course</p><h3><a href="${course.short}/">${esc(course.title)}</a></h3></div><strong>15 assignments</strong></article>`).join("")}</div></section><section class="framework-bottom" id="requirements"><article><h3>California time rule</h3><p>Each course has a 420-hour minimum from access to successful final, with no more than two course completions in five weeks and a one-year completion deadline.</p></article><article><h3>Submission status</h3><p>All three RE 306 binders are prepared as development drafts. DRE course approval, BPPE determination, professor certifications, policies, signatures, and instructor determination remain filing gates.</p><p><a href="../../../downloads/california/">Download the California applications and submission binders.</a></p></article></section></div></main><footer class="site-footer"><div><a class="brand footer-brand" href="../../../index.html"><span class="brand-seal">SC</span><span><strong>StateCourse</strong><small>Professional Licensing Education</small></span></a></div><p>California submission priority · Development</p></footer></body></html>`);

const catalogJs = path.join(pub, "catalog.js");
let catalogSource = fs.readFileSync(catalogJs, "utf8");
catalogSource = catalogSource.replace('if (state.state_code === "CO") return "real-estate/colorado/qualifying/law-and-practice/";', 'if (state.state_code === "CO") return "real-estate/colorado/qualifying/law-and-practice/";\n  if (state.state_code === "CA") return "real-estate/california/pre-license/";');
catalogSource = catalogSource.replace('["VA", "ME", "WI", "MO", "OK", "AZ", "WA", "PA", "NC", "CO"]', '["VA", "ME", "WI", "MO", "OK", "AZ", "WA", "PA", "NC", "CO", "CA"]');
catalogSource = catalogSource.replace('CO: "Six qualifying courses · 168 hours total",', 'CO: "Six qualifying courses · 168 hours total",\n      CA: "Principles + Practice + Mortgage Lending · three 45h approvals",');
write(catalogJs, catalogSource);

const homepagePath = path.join(pub, "index.html");
let home = fs.readFileSync(homepagePath, "utf8");
home = home.replaceAll("Ten state course frameworks", "Eleven state course frameworks").replaceAll("Ten state frameworks", "Eleven state frameworks");
home = home.replace("Virginia, Maine, Wisconsin, Missouri, Oklahoma, Arizona, Washington, Pennsylvania, North Carolina, and Colorado.", "Virginia, Maine, Wisconsin, Missouri, Oklahoma, Arizona, Washington, Pennsylvania, North Carolina, Colorado, and California.");
if (!home.includes('finder-code">CA')) home = home.replace('<a class="all-states-option"', '<a href="real-estate/california/pre-license/"><span class="finder-code">CA</span><span><strong>California</strong><small>Three separate 45-hour correspondence courses</small></span><em>View programs <span aria-hidden="true">→</span></em></a>\n          <a class="all-states-option"');
const caProgram = `          <article class="program-record">\n            <div class="program-state"><span>California</span><strong>CA</strong></div>\n            <div class="program-main"><p class="program-status"><i></i> First submission priority</p><h3>Three Statutory Pre-License Courses</h3><p>Principles · Practice · Mortgage Loan Brokering and Lending</p><a href="real-estate/california/pre-license/">Review the California programs <span aria-hidden="true">→</span></a></div>\n            <dl class="program-facts"><div><dt>Each course</dt><dd>45 required hours</dd></div><div><dt>Assignments</dt><dd>15 per course</dd></div><div><dt>Approval</dt><dd>Not yet approved</dd></div><div><dt>Enrollment</dt><dd>Closed</dd></div></dl>\n          </article>\n`;
if (!home.includes("First submission priority")) home = home.replace('        </div>\n      </section>\n\n      <section class="student-path-section"', `${caProgram}        </div>\n      </section>\n\n      <section class="student-path-section"`);
write(homepagePath, home);

let paymentCatalog = fs.readFileSync(path.join(root, "config/course-catalog.mjs"), "utf8");
if (!paymentCatalog.includes('"ca-real-estate-principles-45"')) {
  const defs = courses.map((course) => `  ["${course.paymentId}", "CA", "California ${course.title} - 45 Hours"],`).join("\n");
  paymentCatalog = paymentCatalog.replace("const nextFiveCourseDefinitions = [", `const nextFiveCourseDefinitions = [\n${defs}`);
  write(path.join(root, "config/course-catalog.mjs"), paymentCatalog);
}

write(path.join(root, "database/004_california_prelicense.sql"), `-- California statutory/pre-license implementation. Apply after 001-003.\n-- Three course approvals remain independent even when sold together.\n\ninsert into regulatory_courses (course_id, state, title, version, status, approval_number, enrollment_enabled) values\n  ('ca-real-estate-principles-45-v1', 'CA', 'Real Estate Principles', '1.0', 'development', null, false),\n  ('ca-real-estate-practice-45-v1', 'CA', 'Real Estate Practice', '1.0', 'development', null, false),\n  ('ca-mortgage-loan-brokering-lending-45-v1', 'CA', 'Mortgage Loan Brokering and Lending', '1.0', 'development', null, false)\n  on conflict (course_id) do nothing;\n\n-- Application code must require approval + enrollment-enabled gates and enforce:\n-- 15 sequential assignments, 420 elapsed hours, max 2 CA correspondence completions/35 days,\n-- 365-day expiration, secure proctored 100-item final, 60% pass, one alternate retake.\n`);

write(path.join(root, "tests/california-prelicense.test.mjs"), `import test from "node:test";\nimport assert from "node:assert/strict";\nimport fs from "node:fs";\n\nconst read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));\nconst courses = ["ca-real-estate-principles-45-v1", "ca-real-estate-practice-45-v1", "ca-mortgage-loan-brokering-lending-45-v1"];\n\ntest("California is the eleventh in-development state with three separate courses", () => {\n  const registry = read("public/statecourse/data/state-registry.json");\n  assert.equal(registry.states.filter((s) => s.public_status === "In Development").length, 11);\n  const ca = registry.states.find((s) => s.state_code === "CA");\n  assert.equal(ca.course_ids.length, 3);\n  assert.equal(ca.provider_status, "In Development");\n});\n\nfor (const id of courses) test(id + " has California correspondence controls and complete package", () => {\n  const c = read("california/" + id + "/lms-config.json");\n  assert.equal(c.required_hours, 45);\n  assert.equal(c.lesson_assignments, 15);\n  assert.equal(c.minimum_elapsed_hours, 420);\n  assert.equal(c.maximum_completion_days, 365);\n  assert.deepEqual(c.cross_course_completion_rule, { maximum_courses: 2, window_days: 35, student_attestation_of_other_school_completions: true });\n  assert.equal(c.final_exam.questions_per_form, 100);\n  assert.equal(c.final_exam.forms, 2);\n  assert.equal(c.final_exam.passing_percent, 60);\n  assert.equal(c.approved, false);\n  assert.equal(c.enrollment_enabled, false);\n  for (let i = 1; i <= 15; i++) assert.ok(fs.existsSync("california/" + id + "/curriculum/lesson-" + String(i).padStart(2, "0") + ".md"));\n  for (const form of ["a", "b"]) for (const version of ["student", "instructor"]) assert.ok(fs.existsSync("california/" + id + "/secure-final-exam/form-" + form + "-" + version + "-version.md"));\n});\n\ntest("Anatoliy Kanevsky is not represented as DRE-approved", () => {\n  const approvals = read("config/state-approval-records.json").states.CA;\n  assert.equal(approvals.instructor.status, "qualification_package_prepared_not_approved");\n  assert.equal(approvals.instructor.teaching_enabled, false);\n  assert.equal(approvals.instructor.dre_license, "01385024");\n});\n`);

console.log(JSON.stringify({ courses: built.map(({ id, title, words }) => ({ id, title, lessons: 15, words })), officialSources: sources.length }, null, 2));
