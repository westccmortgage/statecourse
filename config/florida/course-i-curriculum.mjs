/**
 * Florida FREC Course I — authored curriculum layer.
 *
 * The Commission prescribes order and objectives but not section hours. These allocations are a
 * StateCourse design baseline, not a Florida minimum and not the objective study required by Rule
 * 61J2-3.008(4)(b)3.e. They total the required 3,000 instructional minutes; the separate 150-minute
 * end-of-course examination completes the 63-hour course. Publication remains disabled.
 */

import { SECTIONS } from "./frec-course-i-syllabus.mjs";

export const COURSE_STATUS = Object.freeze({
  curriculumAuthoringAuthorized: true,
  curriculumDrafted: true,
  regulatorApproved: false,
  schoolPermitHeld: false,
  instructorPermitHeld: false,
  enrolmentEnabled: false,
  publicationEnabled: false,
});

const minutes = Object.freeze([100, 170, 110, 170, 170, 140, 170, 170, 140, 170, 170, 170, 170, 200, 110, 250, 140, 140, 140]);

const profiles = Object.freeze([
  {
    slug: "course-overview-real-estate-business",
    authorities: ["FREC Course I syllabus pp. 3–5", "s. 475.01, Fla. Stat."],
    lesson: `Real estate work is a collection of specialties, not one sales job. Brokerage connects parties and protects the transaction process; property management preserves an owner's income-producing asset; appraisal develops an independent opinion of value; mortgage professionals originate or arrange credit; developers move land through acquisition, entitlement, construction and disposition. A sales associate must know where one role ends and a separately regulated role begins.

Residential, commercial, industrial, agricultural and business-opportunity brokerage use the same basic transaction skills but different data and risk questions. A market analysis or broker price opinion supports a brokerage decision; an appraisal is a separately regulated valuation service. Development moves through land acquisition and planning, construction, and marketing or occupancy. Speculative, custom and tract construction differ principally in who selects the site and design and who bears the inventory risk.

The practical discipline for this section is classification. Given a requested service, identify the specialty, the professional primarily responsible, the information needed, and whether the request crosses a licensing boundary.`,
  },
  {
    slug: "license-law-qualifications",
    authorities: ["ss. 475.01, 475.011, 475.17 and 475.175, Fla. Stat.", "Rules 61J2-3.008, 61J2-3.009 and 61J2-3.010, F.A.C."],
    lesson: `Florida regulates acts, not job titles. A person who performs a service defined as brokerage for another and for compensation or the expectation of compensation must be licensed unless a statutory exemption applies. The analysis is always: what act occurred, for whom, for what expected benefit, and does a stated exemption fit every fact?

The sales-associate path combines general applicant qualifications, the Commission-prescribed Course I, application and background review, a state examination and activation under a registered broker. A course-completion document is not a license, and passing an examination is not authority to practice. Prelicense, postlicense and continuing education solve different regulatory problems and must not be substituted for one another.

Nonresident applicants are not treated as unregulated applicants. Florida's mutual-recognition arrangements are limited instruments whose current parties and terms must be verified with DBPR when used. Background questions must be answered completely; an omission can become a separate problem even where the underlying event might not have defeated the application.`,
  },
  {
    slug: "license-law-commission-rules",
    authorities: ["ss. 475.02–475.05, Fla. Stat.", "Ch. 61J2, F.A.C."],
    lesson: `The Florida Real Estate Commission is the policy and rulemaking body within the Department of Business and Professional Regulation. The Division of Real Estate performs administrative, licensing and investigative work. Students must distinguish the Legislature's statute, the Commission's properly authorized rules, and Department forms or guidance; they do not have equal authority.

License status determines whether licensed activity may be performed. Active, voluntarily inactive, involuntarily inactive, suspended, revoked and null-and-void are not synonyms. A sales associate's ability to work also depends on registration with an employer. Multiple and group licensing address distinct business arrangements and must be applied only to the facts described in the governing provisions.

Use an authority-first method: identify the decision maker, locate the statute, locate the implementing rule, then verify the current administrative procedure. Do not convert a form instruction into a new statutory requirement or let a defective rule citation erase an express statutory alternative.`,
  },
  {
    slug: "authorized-relationships-duties-disclosure",
    authorities: ["ss. 475.272–475.2801, Fla. Stat."],
    lesson: `Florida recognizes single agency, transaction brokerage and no-brokerage relationships. Transaction brokerage is presumed unless a single-agent or no-brokerage relationship is established in writing. The label does not decide the duties; the statute does. A single agent owes fiduciary duties including loyalty, confidentiality, obedience and full disclosure, while a transaction broker provides limited representation and must deal honestly and fairly, account for funds, use skill and care, and disclose known material facts affecting residential property value that are not readily observable.

Disclosure timing matters. A correct notice delivered after the customer has already relied on the relationship can be ineffective for the purpose the statute serves. Required wording and format are part of the compliance question. Transition from single agent to transaction broker requires the principal's prior written consent; it is not an internal brokerage choice.

For every scenario, identify the property and transaction type, the relationship with each party, duties owed, the disclosure required, its timing, and any consent needed. Keep confidential information separate from facts the law requires to be disclosed.`,
  },
  {
    slug: "brokerage-activities-procedures",
    authorities: ["ss. 475.22, 475.25 and 475.42, Fla. Stat.", "Rules 61J2-10.025, 61J2-10.026 and 61J2-14.008, F.A.C."],
    lesson: `A brokerage office must be registered and identifiable, and business entities must be registered in the form the law permits. Whether a temporary location becomes a branch office depends on its actual use, permanence and representations, not on the label placed on it. Advertising must identify the brokerage and may not be false, misleading or blind.

Escrow analysis begins with custody: who received the deposit, when, and under what written agreement? The broker must follow the applicable deposit deadline and keep funds in an authorized account. When demands conflict or the broker has a good-faith doubt, the four settlement procedures are mediation, arbitration, litigation and an escrow disbursement order. The correct procedure depends on the parties' agreement and the dispute; the broker does not simply choose the preferred claimant.

Sales associates report changes through their employer and may not independently take records or funds when changing brokers. Commission liens and business-entity rules are specialized statutory tools, not general permission to cloud a consumer's title.`,
  },
  {
    slug: "violations-penalties-procedures",
    authorities: ["ss. 455.225 and 475.25, Fla. Stat.", "ss. 475.482–475.486, Fla. Stat."],
    lesson: `A disciplinary matter moves through complaint intake, legal sufficiency, investigation, probable cause, notice, hearing or settlement, final agency action and possible judicial review. A valid complaint must allege facts within the agency's jurisdiction and provide a sufficient basis to investigate. A probable-cause panel does not conduct the final hearing or impose the final penalty.

Denial of an application, discipline of an existing license and criminal prosecution are different proceedings with different consequences. The Commission may impose authorized administrative sanctions; courts impose civil or criminal remedies. Unlicensed activity can trigger separate enforcement.

The Real Estate Recovery Fund is limited consumer protection, not insurance for every loss. Eligibility, exclusions, procedural prerequisites and statutory caps must all be tested. Never promise recovery; identify the claimant, judgment, licensee conduct, transaction and statutory limit.`,
  },
  {
    slug: "federal-state-laws",
    authorities: ["42 U.S.C. §§ 1981–1982", "42 U.S.C. §§ 3601–3619", "42 U.S.C. §§ 12101 et seq.", "Part II, Ch. 83, Fla. Stat."],
    lesson: `Fair-housing analysis starts by identifying the transaction, the actor, the protected characteristic and the challenged conduct. The Civil Rights Act of 1866 protects against racial discrimination in property transactions. The federal Fair Housing Act covers specified dwellings and protected classes, prohibits discriminatory terms, advertising, steering, blockbusting and other conduct, and contains narrow exemptions that must not be generalized. The 1988 amendments added disability and familial status and expanded enforcement.

The Americans with Disabilities Act addresses access and nondiscrimination in covered public accommodations and services; it is not interchangeable with the Fair Housing Act's housing-design and reasonable-accommodation framework. A request for an accommodation or modification requires a fact-specific response, not a diagnosis demand or automatic refusal.

Florida landlord-tenant law assigns duties to landlord and tenant and regulates deposits, notices, access and remedies. Interstate land-sales law addresses covered subdivisions and disclosures. For each, identify coverage before stating a duty or exemption.`,
  },
  {
    slug: "property-rights",
    authorities: ["s. 475.01, Fla. Stat.", "Art. VII, §§ 4 and 6 and Art. X, § 4, Fla. Const.", "Chs. 196, 222, 732, 718, 719 and 720, Fla. Stat."],
    lesson: `Land is the physical earth; real estate adds improvements; real property adds the legal interests held in them. Fixtures are resolved from annexation, adaptation, relationship, intent and agreement, with the written agreement carrying special weight. The bundle of rights can be divided by time, use, space and ownership form.

Freehold estates include fee interests and life estates; leasehold estates grant possession for a term without transferring ownership. Concurrent ownership determines possession, transfer and survivorship. Condominiums divide units and common elements, cooperatives use an entity ownership structure with proprietary occupancy rights, and homeowners' associations ordinarily govern separately owned lots. Time-share and community-development-district interests carry different documents and obligations.

Florida homestead is not one rule. Article VII, Chapters 193 and 196 govern tax exemption and assessment; Article X section 4, Chapter 222 and section 732.4015 address forced-sale protection and devise questions. For tax homestead, verify permanent-residence facts, application requirements, exemption slices, taxing-authority treatment, Save Our Homes assessment limits and the effect of renting or changing ownership.`,
  },
  {
    slug: "title-deeds-ownership-restrictions",
    authorities: ["Chs. 95, 695 and 689, Fla. Stat."],
    lesson: `Title may pass voluntarily by deed or will and involuntarily through processes such as foreclosure, tax sale, escheat or adverse possession. Actual notice is direct knowledge; constructive notice is knowledge the law charges from properly recorded instruments or possession. A chain of title traces successive interests; an abstract summarizes recorded instruments; title insurance allocates covered title risk under its policy terms.

A valid deed identifies grantor and grantee, expresses intent to convey, describes the property, is executed with the required formalities, and is delivered and accepted. Deed types differ in the promises made, not in the size of the estate automatically conveyed. Recording protects priority and notice but should not be confused with the requirements of delivery between parties.

Ownership is limited publicly through police power, taxation, eminent domain and escheat, and privately through easements, covenants, leases and liens. Resolve each restriction by source, affected parcel, beneficiary, duration, enforcement and priority.`,
  },
  {
    slug: "legal-descriptions",
    authorities: ["FREC Course I syllabus pp. 31–32", "official county plat and public-land records used only in guided exercises"],
    lesson: `A street address helps people find property but is not a legal description. Metes and bounds begins at an identifiable point of beginning, follows calls by direction and distance, and returns to close. Lot-and-block descriptions depend on a recorded plat. The rectangular survey system locates land through principal meridians, baselines, townships, ranges and numbered sections.

A township contains thirty-six nominal one-square-mile sections. A section contains 640 acres; halves and quarters divide by area, so the southwest quarter of the northeast quarter is 40 acres. One acre is 43,560 square feet. Government lots and irregular boundaries warn against assuming every mapped parcel is exact.

The practice method is spatial: trace the description, mark each boundary, test closure, identify the referenced record, then calculate area. Never substitute a tax parcel number or marketing description for the legal description in an instrument.`,
  },
  {
    slug: "real-estate-contracts",
    authorities: ["Chs. 672 and 725, Fla. Stat.", "Florida Bar/Florida Realtors forms treated as forms, not law"],
    lesson: `A contract requires competent parties, mutual assent, lawful purpose and consideration. A valid contract satisfies the requirements; a void agreement never had legal effect; a voidable agreement may be avoided by a protected party; an unenforceable agreement may be valid but unavailable as a judicial remedy. Express and implied, bilateral and unilateral, executory and executed classifications answer different questions.

Offer and acceptance are tested objectively. A counteroffer rejects the original unless preserved; revocation must be effective before acceptance; an option requires its own consideration to keep an offer open. The Statute of Frauds requires specified agreements concerning land to be in writing and signed by the party against whom enforcement is sought.

Listing agreements employ a broker; purchase contracts transfer contractual rights toward a closing. Remedies can include damages, rescission, specific performance or liquidated damages when legally available. Licensees use approved forms within authority and refer legal drafting or interpretation beyond that authority.`,
  },
  {
    slug: "residential-mortgages",
    authorities: ["12 U.S.C. §§ 2601 et seq.", "15 U.S.C. §§ 1601 et seq.", "CFPB Regulations X and Z"],
    lesson: `A promissory note is the borrower's promise to repay; a mortgage secures that obligation with real property. The mortgagor gives the security interest and the mortgagee receives it. Title, lien theory and foreclosure procedure should be stated for Florida rather than borrowed from another jurisdiction.

Mortgage clauses allocate risk: acceleration makes the balance due after a defined default; due-on-sale addresses transfer; defeasance releases the lien after performance; prepayment terms govern early payoff; escrow provisions collect taxes and insurance. Default does not instantly transfer ownership; the lender must use the applicable enforcement process.

Loan mathematics connects principal, rate, time and payment. Students calculate simple interest, loan-to-value and equity, distinguish interest from principal, and read an amortization schedule. Consumer-protection disclosures describe credit cost and settlement servicing; a licensee explains process and refers underwriting or legal advice to the responsible professional.`,
  },
  {
    slug: "mortgage-types-financing-sources",
    authorities: ["CFPB official mortgage resources", "HUD/FHA, VA and USDA official program materials"],
    lesson: `Conventional loans are not government-insured or guaranteed; FHA insurance and VA or USDA guaranty programs shift specified lender risk under program rules but do not make the borrower debt-free. Fixed-rate loans stabilize the rate; adjustable-rate loans use an index, margin and caps. Balloon, interest-only, construction, bridge, reverse-mortgage and home-equity products alter payment timing and risk.

Primary-market participants originate loans; secondary-market participants purchase and securitize them, returning capital to originators. Depositories, mortgage companies, credit unions, private lenders and public programs occupy different roles. Seller financing and other creative structures remain contracts and credit transactions subject to applicable law.

Qualification examines income, assets, debts, credit, collateral and program rules. Students calculate housing and total-debt ratios when assumptions are supplied, points as a percentage of principal, and maximum loan from an LTV. Avoid promising approval or quoting a program rule without current official verification.`,
  },
  {
    slug: "computations-and-closing",
    authorities: ["12 C.F.R. pt. 1026 app. H", "CFPB H-25(A) blank model form", "CFPB H-25(B) completed fixed-rate sample", "FREC Instructor CIB-linked 201311 specimen", "FREC Course I syllabus pp. 44–45"],
    lesson: `Closing converts contract obligations into money, documents and title transfer. Before computing, write the convention: closing date, which party owns the day, 365-day or 360-day method, advance or arrears, and the period covered. A proration is a division of an existing expense or income between parties; a debit increases what a party brings or reduces what that party receives, while a credit does the opposite.

Brokerage commission equals the agreed rate times the applicable base. Documentary-stamp, intangible-tax, recording and title charges must be allocated from current law and contract facts rather than memory. Each calculation must show the formula, period and party.

Appendix H identifies H-25(A) as the blank model form and H-25(B) as the completed fixed-rate sample. Use both to separate form structure from worked figures. The older 201311 CFPB specimen is retained as well because the February 2025 FREC instructor CIB prints that exact URL for closing-related exam preparation. The Closing Disclosure itself has five pages. Audit it horizontally and vertically: confirm identities and loan terms; reconcile Loan Costs and Other Costs; trace Cash to Close; compare borrower and seller summaries; review loan disclosures; and confirm contact and signature information. A form is checked by reconciling related figures, not by reading one box in isolation.`,
  },
  {
    slug: "markets-analysis",
    authorities: ["FREC Course I syllabus pp. 46–47", "U.S. Census and BLS official data used in exercises"],
    lesson: `A real estate market is local because land is immobile and improvements respond slowly. Demand shifts with population, household formation, employment, income, credit cost and preferences. Supply shifts with construction cost, land availability, regulation, inventory and development time. Price and vacancy signal the interaction, not one side alone.

Market analysis defines the property, competitive area, time period and user question before collecting data. Leading, coincident and lagging indicators must not be mixed without explaining timing. Absorption measures the pace at which available units are taken; inventory and months' supply describe balance only under stated assumptions.

Students distinguish a market analysis from an appraisal and a feasibility study. The deliverable is a supported conclusion with source dates, limitations and a sensitivity test, not a prediction stated as certainty.`,
  },
  {
    slug: "real-estate-appraisal",
    authorities: ["Ch. 475, Part II, Fla. Stat.", "USPAP referenced only through current official Appraisal Foundation materials"],
    lesson: `An appraisal is a supported opinion of value developed for an identified problem. Market value depends on stated conditions and an effective date; price is what a party paid or asks; cost is the expenditure to create; investment value is specific to an investor. Highest and best use must be legally permissible, physically possible, financially feasible and maximally productive.

The sales-comparison approach adjusts comparable transactions toward the subject. The cost approach estimates land value plus replacement or reproduction cost less depreciation. The income approach converts anticipated benefits through capitalization. Reconciliation weighs the relevance and reliability of each approach rather than averaging them.

Principles of substitution, anticipation, contribution, conformity, competition, change and externalities explain observed market behavior. Gross-rent multipliers, capitalization rates, net operating income and depreciation calculations must state their inputs. A broker's CMA or BPO serves a brokerage purpose and must not be misrepresented as an appraisal.`,
  },
  {
    slug: "investments-business-opportunity",
    authorities: ["s. 475.01, Fla. Stat.", "FREC Course I syllabus pp. 51–52"],
    lesson: `Investment returns may come from cash flow, appreciation, principal reduction and tax treatment. Each return carries risk: vacancy, operating cost, financing, liquidity, physical loss, regulation and concentration. Leverage magnifies favorable and unfavorable outcomes; compare property yield with debt cost rather than assuming borrowing improves return.

Potential gross income less vacancy and collection loss plus other income produces effective gross income; subtract operating expenses to obtain net operating income. Debt service is not an operating expense in this framework. Capitalization rate relates NOI to value; cash-on-cash return relates before-tax cash flow to invested cash. Sensitivity analysis changes rent, vacancy, expenses, rate and exit value to reveal dependence on assumptions.

Business-opportunity brokerage can combine tangible assets, real property interests and intangible going-concern value. Inventory, equipment, contracts, goodwill, liabilities and financial statements require separate verification. A real estate license does not make the licensee an accountant, attorney or securities adviser.`,
  },
  {
    slug: "taxes-affecting-real-estate",
    authorities: ["Art. VII, §§ 4 and 6, Fla. Const.", "Chs. 193 and 196, Fla. Stat.", "Florida DOR 2026 NAL exemption codes", "Florida DOR Additional Homestead Exemption Adjustment (Jan. 2026)", "IRS primary materials for federal examples"],
    lesson: `Ad valorem tax begins with just value, classified or assessed value, exemptions and the rates of each taxing authority. One mill is one dollar per thousand dollars of taxable value. Because an exemption may apply differently to school and non-school levies, compute taxable value separately for each authority before multiplying by mills.

Florida homestead requires current constitutional and statutory treatment. For the 2026 roll, DOR lists the first $25,000 slice for school, county and municipal levies and the CPI-adjusted additional $26,411 slice for county and municipal, but not school, levies. Do not collapse them into one flat subtraction. Save Our Homes limits annual assessment growth on qualifying homestead, while a change of ownership can reset assessment subject to portability rules. Application, permanent residence and rental facts matter.

Federal income-tax questions distinguish basis, adjusted basis, amount realized, gain, exclusions and deferral provisions. Documentary stamp and intangible taxes are transaction-specific Florida taxes. Use current official rates at calculation time and label every worked figure with an as-of date.`,
  },
  {
    slug: "planning-zoning-environmental-hazards",
    authorities: ["Ch. 163, Fla. Stat.", "EPA official materials", "FREC Course I syllabus pp. 56–59"],
    lesson: `Police power supports comprehensive planning, zoning, building and environmental regulation. A comprehensive plan states long-range policy; zoning implements permitted uses and development standards. A variance relieves a dimensional requirement based on legally sufficient property hardship; a special or conditional use permits a use the ordinance already contemplates under conditions. A nonconforming use was lawful when established but no longer conforms.

Subdivision controls address plats, streets, utilities, dedications and development review. Concurrency, impact fees, development orders and community development districts solve different infrastructure questions. Eminent domain requires public use and compensation; regulation under police power is not automatically a compensable taking.

Environmental due diligence identifies a condition, governing program and responsible specialist. Flood risk, wetlands, lead-based paint, asbestos, radon, mold, underground tanks and hazardous substances require different evidence. CERCLA liability and defenses are specialized federal questions. A licensee discloses known material facts, recommends qualified inspection and avoids diagnosing a condition beyond competence.`,
  },
]);

if (profiles.length !== SECTIONS.length || minutes.length !== SECTIONS.length) {
  throw new Error("Florida curriculum profiles must match all 19 syllabus sections");
}

const componentMinutes = (total) => {
  const reading = Math.round(total * 0.4);
  const sourceWork = Math.round(total * 0.2);
  const application = Math.round(total * 0.25);
  const assessment = total - reading - sourceWork - application;
  return Object.freeze({ reading, sourceWork, application, assessment, total });
};

export const SECTION_PLANS = Object.freeze(SECTIONS.map((s, i) => Object.freeze({
  ...profiles[i],
  number: s.number,
  title: s.title,
  syllabusPage: s.startPage,
  learningObjectives: s.learningObjectives,
  plannedMinutes: minutes[i],
  components: componentMinutes(minutes[i]),
  allocationStatus: "STATECOURSE DESIGN BASELINE — requires objective study before submission",
})));

export const TOTALS = Object.freeze({
  sections: SECTION_PLANS.length,
  objectives: SECTION_PLANS.reduce((n, s) => n + s.learningObjectives.length, 0),
  instructionMinutes: SECTION_PLANS.reduce((n, s) => n + s.plannedMinutes, 0),
  examinationMinutes: 150,
  courseMinutes: SECTION_PLANS.reduce((n, s) => n + s.plannedMinutes, 0) + 150,
});

export function verifyCurriculumPlan() {
  const failures = [];
  if (TOTALS.sections !== 19) failures.push(`expected 19 sections, found ${TOTALS.sections}`);
  if (TOTALS.objectives !== 180) failures.push(`expected 180 objectives, found ${TOTALS.objectives}`);
  if (TOTALS.instructionMinutes !== 3000) failures.push(`instruction minutes ${TOTALS.instructionMinutes} != 3000`);
  if (TOTALS.courseMinutes !== 3150) failures.push(`course minutes ${TOTALS.courseMinutes} != 3150`);
  for (const s of SECTION_PLANS) {
    const sum = s.components.reading + s.components.sourceWork + s.components.application + s.components.assessment;
    if (sum !== s.plannedMinutes) failures.push(`section ${s.number} components ${sum} != ${s.plannedMinutes}`);
    if (!s.lesson || s.lesson.length < 500) failures.push(`section ${s.number} lacks substantive authored lesson text`);
  }
  return Object.freeze({ ok: failures.length === 0, failures: Object.freeze(failures) });
}

export default Object.freeze({ COURSE_STATUS, SECTION_PLANS, TOTALS, verifyCurriculumPlan });
