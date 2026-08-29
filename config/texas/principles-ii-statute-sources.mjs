/**
 * Texas statutes and federal sources for Principles of Real Estate II — the read register.
 *
 * THE RULE THIS FILE ENFORCES BY ITS SHAPE: HELD IS NOT READ. Every source below is a document on
 * disk with a hash taken verbatim from .prins2-drafts/HELD-SOURCE-HASHES.txt. Inside each,
 * `sectionsRead` lists the sections that were actually OPENED AND READ while the nine PRINS2-1
 * modules were authored, each with a note stating the proposition taken from it. A chapter can sit
 * on disk fully hashed and contribute nothing; a unit is only as sourced as the sections read for
 * it. Chapters that are held for this project but that no read record names — Property Code chs. 11,
 * 12, 13, 21, 41, 51, 53 and 111, Estates Code chs. 101/111/112/201/251, Family Code ch. 3,
 * Business and Commerce Code ch. 9, Business Organizations Code ch. 200, Civil Practice and Remedies
 * Code ch. 16, Tax Code chs. 11 and 32, Government Code chs. 4001 and 4005, Local Government Code
 * ch. 232, Insurance Code ch. 2501, 26 U.S.C. §§ 1445 and 860A — are therefore ABSENT from this
 * register entirely. They were not read for this course, so they are not registered for it.
 *
 * WHERE THE ENTRIES COME FROM. Every entry below is transcribed from the nine per-module read
 * records in .prins2-drafts/read-record-T01.md … read-record-T09.md, written by the agents that
 * authored the modules. `reliedOnByUnits` is the union, across all nine records, of the units each
 * record names as relying on that file. `sectionsRead` lists only sections a record lists, and each
 * note states only a proposition a record states. Where a record enumerated several section numbers
 * against one run-on description, the note says so rather than splitting the description by guess.
 *
 * RETRIEVAL DATES. Sources fetched in the 2026-08-29 authoring session carry that date. The Texas
 * chapters carried over from the Principles I build (OC.1101, PR.5, FI.343, NR.21, WA.11, BC.26) and
 * the four RESPA files whose hashes match the Principles I register byte for byte (12 U.S.C.
 * §§ 2601, 2603, 2607 and the Regulation X excerpt) carry their recorded retrieval date of
 * 2026-08-27. No date here was guessed and no hash was recomputed.
 *
 * WHAT THIS REGISTER DELIBERATELY DOES NOT CARRY. Three things a read record names as read are not
 * registered as sources, because HELD-SOURCE-HASHES.txt carries no hash for them and this file may
 * not invent one: the TREC rule extracts 22 TAC §§ 535.55 and 535.64 (T03 and T06 read them; T03
 * read § 535.65 for scoping), and the TREC explanatory article on 2026 buyer/tenant representation
 * (T07). Every unit those records tie to them is independently held through Occupations Code
 * ch. 1101, so nothing here depends on them. They are recorded in GAPS instead of being registered
 * with a fabricated hash. Likewise 42 U.S.C. § 3606, 42 U.S.C. § 3617, 12 U.S.C. §§ 2902–2906 and
 * 15 U.S.C. §§ 1691a–1691f are NOT held and appear nowhere in `sectionsRead`; the read records name
 * them only as gaps, and that is where they appear here.
 *
 * This file imports nothing. The course config imports it, not the other way round.
 */

const chapter = (record) =>
  Object.freeze({
    ...record,
    id: `${record.code.toLowerCase()}-${record.chapter}`,
    citation: `Tex. ${record.codeName} ch. ${record.chapter}`,
    publisher: "Texas Legislative Council",
    sourceLayer: "tcss.legis.texas.gov static resources",
    jurisdiction: "texas",
    reliedOnByUnits: Object.freeze(record.reliedOnByUnits),
    sectionsRead: Object.freeze(record.sectionsRead),
  });

const federal = (record) =>
  Object.freeze({
    ...record,
    id: record.citation.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    jurisdiction: "federal",
    reliedOnByUnits: Object.freeze(record.reliedOnByUnits),
    sectionsRead: Object.freeze(record.sectionsRead),
  });

const OC_1101 = chapter({
  code: "OC", codeName: "Occupations Code", chapter: "1101", title: "Real Estate Brokers and Sales Agents (The Real Estate License Act)",
  url: "https://tcss.legis.texas.gov/resources/OC/htm/OC.1101.htm",
  localCopy: "texas/trec-sources/statutes/OC.1101.htm",
  sha256: "8c40aa399cf717901540150ae6acaf3d847305f7fefcf7dd7ec4c3068a418858", bytes: 308708, retrievedOn: "2026-08-27",
  reliedOnByUnits: [
    "T02U1", "T02U8", "T02U9",
    "T03U3", "T03U6",
    "T04U1", "T04U2", "T04U5",
    "T05U3",
    "T06U1", "T06U2", "T06U3", "T06U4", "T06U5", "T06U6",
    "T07U1", "T07U2", "T07U3", "T07U4", "T07U5",
    "T08U3", "T08U4",
    "T09U1", "T09U2", "T09U3",
  ],
  sectionsRead: [
    Object.freeze({ section: "1101.001", note: "Short title - the chapter may be cited as The Real Estate License Act; the source of the name TRELA used throughout the course." }),
    Object.freeze({ section: "1101.002", note: "Definitions. (1)(A)(i)-(xii) the twelve acts of a broker performed for another for a commission or other valuable consideration or with the expectation of one - including (i) selling, exchanging, purchasing or leasing, (iii) negotiating a lease, (iv) listing for lease, (vii)-(viii), (x) controlling the acceptance or deposit of rent from a resident of a single-family residential unit, and (xi) providing a written analysis, opinion or conclusion relating to the estimated price of real property where it is not referred to as an appraisal, is given in the ordinary course of business, and relates to actual or potential management, acquisition, disposition or encumbrance of an interest in real property; (1)(B) persons employed by an owner to sell, and advance-fee listing and referral businesses; (3) 'Commission' means TREC; (3-a) easement or right-of-way agent; (4) 'license holder' means a broker or sales agent; (5) 'real estate' means any interest in real property including a leasehold, excluding an interest given as security; (6) 'residential rental locator', excluding an owner locating a unit in the owner's own complex; (7) 'sales agent' means a person sponsored by a licensed broker. Subdivision (8) noted as repealed effective January 1, 2026." }),
    Object.freeze({ section: "1101.003", note: "Qualifying real estate courses - the eleven statutory subjects in (a); the Commission's power to prescribe content in (c); the 12-hour cap on a daily course segment in (d); and the elapsed-time rule in (e), under which completion may not be reported until more than twice the credit hours claimed have elapsed since registration." }),
    Object.freeze({ section: "1101.004", note: "A person is engaged in real estate brokerage by performing a § 1101.002(1) act for another with the expectation of consideration, as part of or as an entire transaction; (b) construction, participation in an investment, and secured obligations do not by themselves make a person a broker." }),
    Object.freeze({ section: "1101.0045", note: "Equitable interests - a person selling an option or assigning an interest in a contract to purchase without a license must disclose the nature of that interest in writing to a potential buyer; failure to disclose makes the act brokerage." }),
    Object.freeze({ section: "1101.005", note: "Applicability - the chapter does not apply to attorneys; attorneys-in-fact for not more than three transactions annually; public officials on official duty; licensed auctioneers calling the sale; transactions under court order, will or trust; owner-builders' sales employees; (7) on-site managers of an apartment complex; (8) an owner or the owner's employee leasing the owner's improved or unimproved real estate; (9) excluded subject matter including minerals, timber, other energy sources, cemetery lots and (9)(C) the lease or management of a hotel or motel; sales under a power of sale in a deed of trust; and (10)-(12) limited partnership and limited liability company personnel. Read in T03 to confirm that no exclusion in this section bears on price opinions, so the price-opinion authority rests on § 1101.002(1)(A)(xi) and not on an exemption." }),
    Object.freeze({ section: "1101.006", note: "Sunset Act applicability and the September 1, 2033 expiration date for the chapter." }),
    Object.freeze({ section: "1101.051", note: "Commission membership - nine members appointed by the governor with senate consent: six licensed brokers whose major occupation for the five preceding years was brokerage, and three public members." }),
    Object.freeze({ section: "1101.052", note: "Public member eligibility screens - licensure, management position, and 10 percent ownership disqualifiers." }),
    Object.freeze({ section: "1101.053", note: "Defines a 'Texas trade association' as an association 'voluntarily joined' and bars a trade association officer, employee or paid consultant, and that person's spouse, from serving on the Commission. Used in T06U3 as the statute's own separation of private associations from the regulator." }),
    Object.freeze({ section: "1101.055", note: "Staggered six-year terms, with the terms of three members expiring January 31 of each odd-numbered year." }),
    Object.freeze({ section: "1101.056", note: "The governor designates a broker member as presiding officer; executive committee." }),
    Object.freeze({ section: "1101.057", note: "Grounds for removal of a commission member. Read; not separately taught." }),
    Object.freeze({ section: "1101.058", note: "Per diem of $75 and expense reimbursement. Read; the figure was cut in editing and is not stated in the module." }),
    Object.freeze({ section: "1101.059", note: "Member training requirements, including training on rules with antitrust implications and on the limits of the Commission's rulemaking authority." }),
    Object.freeze({ section: "1101.060", note: "Quasi-judicial immunity for commission members. Read; not separately taught." }),
    Object.freeze({ section: "1101.101", note: "Appointment of the executive director and authority to employ general counsel, attorneys, investigators and support staff." }),
    Object.freeze({ section: "1101.102", note: "Separation of policymaking from management functions." }),
    Object.freeze({ section: "1101.103", note: "Code of ethics for commission personnel under Government Code ch. 572." }),
    Object.freeze({ section: "1101.151", note: "General powers and duties - (b)(1) the rulemaking authority that is the legal foundation of the 22 TAC ch. 535 rules, and (b)(2) the power to establish standards of conduct and ethics." }),
    Object.freeze({ section: "1101.152", note: "Fees are set by Commission rule 'in amounts reasonable and necessary' across fifteen fee categories. Relied on for the module's statement that no fee dollar amount appears in the statute." }),
    Object.freeze({ section: "1101.154", note: "Statutory additional fee of $70 per year of the term for a broker and $20 for a sales agent or certificate holder, remitted to Texas A&M University for the Texas Real Estate Research Center." }),
    Object.freeze({ section: "1101.155", note: "Rules relating to contract forms - the Commission may require license holders to use forms prepared by the Broker-Lawyer Committee; (b) the owner-prepared and attorney-prepared form protection; (c)(1) the provision requiring adopted listing forms to state that commissions are negotiable. Cross-referenced by § 1101.654(b) in T07." }),
    Object.freeze({ section: "1101.156", note: "Limits on Commission rules restricting advertising or competitive bidding." }),
    Object.freeze({ section: "1101.157", note: "Subpoena authority." }),
    Object.freeze({ section: "1101.158", note: "Advisory committees - uncompensated service, reimbursement under Government Code § 2110.004, and meetings subject to the open-meetings law, Government Code ch. 551." }),
    Object.freeze({ section: "1101.159", note: "Technology policy. Read; summarized only in passing or omitted after trimming." }),
    Object.freeze({ section: "1101.160", note: "Negotiated rulemaking and alternative dispute resolution. Read; summarized only in passing or omitted after trimming." }),
    Object.freeze({ section: "1101.161", note: "Gifts and grants. Read; summarized only in passing or omitted after trimming." }),
    Object.freeze({ section: "1101.201", note: "Public interest information prepared and made available by the Commission." }),
    Object.freeze({ section: "1101.202", note: "The prescribed complaint notice and how it reaches consumers." }),
    Object.freeze({ section: "1101.203", note: "Complaint files and the duty to notify parties of complaint status." }),
    Object.freeze({ section: "1101.204", note: "Complaints and investigations - (b) a signed written complaint and reasonable cause; (c) the four-year limitations period; (f) no investigation on an anonymous complaint; (h) consumer-complaint priority and the risk-based approach; (i) dismissal of meritless complaints." }),
    Object.freeze({ section: "1101.205", note: "Complaints against certificate holders. Read." }),
    Object.freeze({ section: "1101.2051", note: "Confidentiality of investigation material and the enumerated disclosure exceptions; (d-1) protection of the complainant's identity; (e) disclosure on dismissal or final resolution." }),
    Object.freeze({ section: "1101.206", note: "Public participation. Read." }),
    Object.freeze({ section: "1101.251", note: "Definition of 'committee' for the Texas Real Estate Broker-Lawyer Committee subchapter." }),
    Object.freeze({ section: "1101.252", note: "Thirteen committee members - six appointed by the Commission, six by the State Bar, and one public member appointed by the governor." }),
    Object.freeze({ section: "1101.253", note: "Staggered six-year committee terms." }),
    Object.freeze({ section: "1101.254", note: "The committee's mandate to draft and revise contract forms capable of standardization, containing 'safeguards adequate to protect the principals in the transaction'." }),
    Object.freeze({ section: "1101.301", note: "Approval of programs and courses of study - (a) standards for approving programs and instructor requirements, excluding public high schools and accredited colleges and universities; (c) the examination passage rate benchmark based on first-attempt pass rates; (e) probationary renewal." }),
    Object.freeze({ section: "1101.3015", note: "A single fee for a program offered in multiple formats. Read." }),
    Object.freeze({ section: "1101.302", note: "A $20,000 surety bond or equivalent security required of an educational institution." }),
    Object.freeze({ section: "1101.303", note: "Approval of continuing education providers and courses for two-year periods." }),
    Object.freeze({ section: "1101.304", note: "Publication of examination passage rate data." }),
    Object.freeze({ section: "1101.305", note: "Review committee for underperforming programs; the review committee may not revoke approval." }),
    Object.freeze({ section: "1101.351", note: "Licence required - (a) a person may not act as or represent being a broker or sales agent, or act as a residential rental locator, without a licence; (a-1) a business entity may not act as a broker unlicensed; (b) no acting before issuance; (c) a sales agent may not engage in brokerage unless sponsored by and acting for a licensed broker." }),
    Object.freeze({ section: "1101.352", note: "Application form; disclosure of a felony plea or conviction is required notwithstanding community supervision." }),
    Object.freeze({ section: "1101.3521", note: "Fingerprint and criminal history record requirement; the Commission may refuse to issue or renew for noncompliance." }),
    Object.freeze({ section: "1101.353", note: "Pre-application determination of fitness; 30-day notice of the determination." }),
    Object.freeze({ section: "1101.354", note: "General eligibility - 18 years of age; United States citizen or lawfully admitted alien; honesty, trustworthiness and integrity; competence demonstrated by examination; completion of the required courses." }),
    Object.freeze({ section: "1101.355", note: "Business entity requirements - a designated broker; $1 million per-occurrence errors and omissions coverage where the designated broker owns less than 10 percent of the entity; the designated broker must be in active status and good standing; (c)-(e) the narrow registration alternative for a 51-percent-owned limited liability company or S corporation that only receives compensation." }),
    Object.freeze({ section: "1101.356", note: "Broker licence - four years of active experience as a license holder in the 60 months preceding the application; qualifying coursework not to exceed 60 semester hours or the equivalent; a broker responsibility course." }),
    Object.freeze({ section: "1101.358", note: "Sales agent education - at least 12 semester hours or the equivalent in classroom hours of qualifying courses required by Commission rule; six-month waiver." }),
    Object.freeze({ section: "1101.359", note: "Alternate education requirements. Read." }),
    Object.freeze({ section: "1101.360", note: "Nonresident applicants. Read." }),
    Object.freeze({ section: "1101.362", note: "Waiver for a recent former license holder. Read." }),
    Object.freeze({ section: "1101.363", note: "Issuance of a licence; (b) the inactive sales agent licence and the sponsorship condition on practice." }),
    Object.freeze({ section: "1101.364", note: "Denial of a licence - written notice and the hearing right under § 1101.657." }),
    Object.freeze({ section: "1101.365", note: "Probationary licence." }),
    Object.freeze({ section: "1101.366", note: "Inactive broker licence - the holder may not engage in regulated activity but renewal fees remain payable." }),
    Object.freeze({ section: "1101.367", note: "(a) On termination of sponsorship the terminating party must give immediate written notice to the other party and to the Commission and the sales agent is placed on inactive status; (b) return to active status on a broker's request assuming sponsorship." }),
    Object.freeze({ section: "1101.401", note: "Examinations - (a) the examination establishes the § 1101.354(3) competency requirement; (c) scope sufficient to determine competence 'in a manner that will protect the public'; (d) the sales agent examination must be less exacting and less stringent than the broker examination; (e) study material; (f) the one-year deadline after the application is filed." }),
    Object.freeze({ section: "1101.402", note: "Examination waiver for a person previously licensed in Texas who applies before the second anniversary of expiration." }),
    Object.freeze({ section: "1101.403", note: "Testing service agreements; the Commission retains authority over the scope and type of the examination." }),
    Object.freeze({ section: "1101.404", note: "Examination results within 10 days; confidentiality; a written performance analysis on request." }),
    Object.freeze({ section: "1101.405", note: "Reexamination; additional education required after three consecutive failures. Read to confirm that no passing score appears anywhere in the statute - the module states none." }),
    Object.freeze({ section: "1101.451", note: "Licence renewal - (a) the 24-month term; (e) the 1-1/2x and 2x late renewal fee multipliers; (f) the six-month cliff after which only an original application will do." }),
    Object.freeze({ section: "1101.452", note: "Proof of continuing education and felony disclosure on renewal." }),
    Object.freeze({ section: "1101.4521", note: "Criminal history check on renewal." }),
    Object.freeze({ section: "1101.453", note: "Business entity renewal requirements. Read." }),
    Object.freeze({ section: "1101.454", note: "First sales agent renewal - at least 18 semester hours or the equivalent in classroom hours of qualifying courses; (d) the Commission may not waive this requirement." }),
    Object.freeze({ section: "1101.455", note: "Continuing education - (b) at least 15 classroom hours prescribed by rule and the three-hour increase cap; (e) at least eight hours on the enumerated legal topics, including fair housing laws, Property Code issues including landlord-tenant law, agency law, disclosures, and the ethical requirements of engaging in real estate brokerage; (f); (j) one-to-ten hour daily segments; (l) the continuing-education elapsed-time rule." }),
    Object.freeze({ section: "1101.456", note: "Continuing education exemption for certain brokers licensed before 1991." }),
    Object.freeze({ section: "1101.457", note: "Deferral of continuing education with a fee not to exceed $200 and completion within 60 days." }),
    Object.freeze({ section: "1101.458", note: "Broker responsibility course required of brokers and of sales agents who supervise another license holder; the course may not exceed six classroom hours; exemption cross-reference to § 1101.456." }),
    Object.freeze({ section: "1101.459", note: "Denial of renewal for violating a Commission order. Read." }),
    Object.freeze({ section: "1101.501", note: "A certificate of registration or a licence is required to act as an easement or right-of-way agent." }),
    Object.freeze({ section: "1101.502", note: "Certificate eligibility." }),
    Object.freeze({ section: "1101.503", note: "Issuance of a certificate of registration. Read as one of the six certificate-mechanics sections listed together in the T06 record (§§ 1101.503, 1101.504, 1101.5041, 1101.505, 1101.506, 1101.508 - issuance, expiration, criminal history, denial, change of address, probationary certificate)." }),
    Object.freeze({ section: "1101.504", note: "Expiration of a certificate of registration. Read with §§ 1101.503, 1101.5041, 1101.505, 1101.506 and 1101.508 as the certificate-mechanics group." }),
    Object.freeze({ section: "1101.5041", note: "Criminal history record information for a certificate holder. Read with the certificate-mechanics group." }),
    Object.freeze({ section: "1101.505", note: "Denial of a certificate. Read with the certificate-mechanics group." }),
    Object.freeze({ section: "1101.506", note: "Change of address by a certificate holder. Read with the certificate-mechanics group." }),
    Object.freeze({ section: "1101.507", note: "Prominent display of the certificate at the holder's place of business." }),
    Object.freeze({ section: "1101.508", note: "Probationary certificate. Read with the certificate-mechanics group." }),
    Object.freeze({ section: "1101.509", note: "Sixteen classroom hours in eminent domain law, professionalism in owner negotiations, and the ethics of right-of-way acquisition, required for issuance and for renewal of a certificate." }),
    Object.freeze({ section: "1101.551", note: "Subchapter L definitions - (1) 'intermediary'; (2) 'party', which excludes a license holder who represents a party." }),
    Object.freeze({ section: "1101.552", note: "A resident broker must maintain a fixed office in Texas; 10-day corrected licence and address change; the nonresident broker exception; current contact information on file with the Commission; (g) the definition of 'associated broker'." }),
    Object.freeze({ section: "1101.553", note: "Display of a residential rental locator's licence." }),
    Object.freeze({ section: "1101.554", note: "The Commission delivers a copy of each sales agent licence to the sponsoring broker." }),
    Object.freeze({ section: "1101.555", note: "When an offer is signed, the license holder must advise each buyer in writing to have the abstract covering the property examined by an attorney of the buyer's choosing or to obtain a title insurance policy. Tied to § 1101.652(b)(29) and § 1101.806(d)." }),
    Object.freeze({ section: "1101.556", note: "A license holder has no duty to inquire about or disclose whether a previous or current occupant had or has HIV or AIDS, or that a death occurred by natural causes, suicide or an accident unrelated to the condition of the property." }),
    Object.freeze({ section: "1101.557", note: "(a) A broker who represents a party or who lists under an exclusive agreement is that party's agent; (b) the minimum duties - convey material information, answer the party's questions and present offers; (c)(1) a license holder with authority to bind a party to a lease or sale, including under a property management agreement, is also a party to that lease or sale; (c)(3) the three conditions for sole delivery of an offer without violating § 1101.652(b)(22). Read for context in T05." }),
    Object.freeze({ section: "1101.558", note: "Disclosure of representation - (b) orally or in writing at first contact; (b-1) the written notice at the first substantive communication about specific real property, in at least 10-point font, with its four required contents; (b-2) the Commission prescribes the text and delivery methods; (c)(1)-(3) the three exceptions, including the open-house exception. Read for context in T05." }),
    Object.freeze({ section: "1101.559", note: "Broker acting as intermediary - (a) written consent from each party stating the source of the expected compensation; (b) the conspicuous bold or underlined recitation of the § 1101.651(d) conduct in the listing or representation agreement as the route to consent; (c) the duty to act fairly and impartially, with an appointment under § 1101.560 declared a fair and impartial act." }),
    Object.freeze({ section: "1101.560", note: "Appointment of associated license holders - the two appointments; consent must authorize the appointment and written notice must go to all parties; an appointed license holder may give opinions and advice to the party to whom the license holder is appointed." }),
    Object.freeze({ section: "1101.561", note: "(a) The intermediary provisions supersede other law, including the common law; (b) a broker who agrees to represent both parties must agree to act as an intermediary." }),
    Object.freeze({ section: "1101.562", note: "Real property showings without representation (effective January 1, 2026) - the four conditions in (a), the disclosure and written-notice precondition in (b), and the (c) allowance to confirm the size, price and terms of the property." }),
    Object.freeze({ section: "1101.563", note: "Written agreement required with a prospective residential buyer or tenant (effective January 1, 2026) - (a) the definition of residential real property; (b) the trigger, before showing the property or presenting an offer; (c) the six required contents, including the conspicuous statement that broker compensation 'is not set by law and is fully negotiable'; (d) a separate agreement for further brokerage acts; (e) a showing-only agreement may not be exclusive and may not run more than fourteen days." }),
    Object.freeze({ section: "1101.601", note: "The Real Estate Recovery Trust Account and who its payments cover, including unlicensed employees or agents of a license holder; the licence must have been held when the act was committed." }),
    Object.freeze({ section: "1101.6011", note: "A claim against a business entity is also a claim against its designated broker." }),
    Object.freeze({ section: "1101.602", note: "Entitlement to reimbursement from the account, defined by cross-reference to § 1101.652(a-1)(1) or (b)." }),
    Object.freeze({ section: "1101.603", note: "(c) Administrative penalties collected under Subchapter O are deposited to the account; (f) fees or assessments may be collected by rule." }),
    Object.freeze({ section: "1101.604", note: "Management and investment of the account. Read." }),
    Object.freeze({ section: "1101.605", note: "Two-year deadline for bringing the underlying action; notice to the Commission before an agreed judgment." }),
    Object.freeze({ section: "1101.606", note: "Final judgment, execution returned nulla bona, a perfected judgment lien, the verified claim, and the 20-day notice." }),
    Object.freeze({ section: "1101.607", note: "The five showings required at the hearing, including the spouse and consanguinity exclusion and the exclusion of a license holder's claim for a commission." }),
    Object.freeze({ section: "1101.608", note: "Commission response to a claim; protection of the account from 'spurious or unjust claims'; relitigation of material issues." }),
    Object.freeze({ section: "1101.609", note: "Court order directing payment from the account." }),
    Object.freeze({ section: "1101.610", note: "The $125,000 per-transaction cap and the $250,000 per-license-holder cap; proportionate reduction among claimants; attorney's fees counted within the caps." }),
    Object.freeze({ section: "1101.611", note: "Application of a recovery to the claimant's actual damages." }),
    Object.freeze({ section: "1101.612", note: "Subrogation and priority of the Commission's claim." }),
    Object.freeze({ section: "1101.613", note: "Payment from the account does not limit the Commission's disciplinary authority." }),
    Object.freeze({ section: "1101.614", note: "Waiver of rights for noncompliance with the subchapter." }),
    Object.freeze({ section: "1101.615", note: "Commission-prescribed notice to consumers about the availability of payment from the trust account." }),
    Object.freeze({ section: "1101.651", note: "(a) A licensed broker may not pay a commission to or otherwise compensate a person for performing an act of a broker unless that person is a license holder or an out-of-state broker who conducts no negotiations in Texas; (b) a sales agent may not accept compensation from anyone other than the sponsoring broker; (c) a sales agent may pay a commission only through the sponsoring broker; (d)(1)-(5) the five prohibitions on an intermediary and on appointed license holders, including the separate-writing requirement for price disclosures and the carve-out for information that 'materially relates to the condition of the property'." }),
    Object.freeze({ section: "1101.652", note: "Grounds for suspension or revocation, read in full for T06, T07 and T09 and relied on across the course. (a)(1)-(8) including a felony or fraud conviction, procuring a licence by fraud, failure to provide information requested in a complaint investigation, (a)(5) failure to surrender a document belonging to an owner, (a)(6) failure to consider market conditions for the specific geographic area in which the license holder provides a service, and the 30-day conviction notice. (a-1)(1) misrepresentation in the license holder's own or a close relative's transaction and (a-1)(3) failure to use a contract form required under § 1101.155. (b)(1)-(34), of which the course relies on: (1) negligence or incompetence; (2) conduct that is dishonest or in bad faith or that demonstrates untrustworthiness; (3) material misrepresentation to a potential buyer of a significant defect known to the license holder and (4) failure to disclose such a defect; (5) a false promise likely to influence a person to enter an agreement; (6) a continued and flagrant course of misrepresentation; (7) failure to make clear the party for whom the license holder acts; (8) receiving compensation from more than one party without the full knowledge and consent of all parties; (9) failure within a reasonable time to properly account for or remit money belonging to another; (10) commingling; (11) paying or dividing a commission or fee with a person other than a license holder or a broker or sales agent licensed in another state; (12) failure to include a definite termination date, with its express carve-out for 'a contract to perform property management services'; (13) accepting, receiving or charging an undisclosed commission, rebate or direct profit on an expenditure made for a principal; (14) lottery; (15) deceptive practice; (16) acting in a dual capacity as broker and undisclosed principal; (17) guaranteeing resale profits; (18)-(20) owner consent for signs, offers and terms; (21) inducing a party to break a contract; (22) negotiating around an exclusive agency; (23)(A)-(D) misleading advertising, including the requirement to include the broker's name and the bar on implying that a sales agent is responsible for the operation of the brokerage; (24) a materially inaccurate statement of account or invoice; (26) association with a person expected to act as a license holder without a licence; (28) refusing to give a signer a copy of a signed document; (29) failure to give the § 1101.555 advice; (30) failure to deposit escrow or trust funds within a reasonable time with an authorised Texas title company or in a custodial, trust or escrow account at an authorised Texas banking institution; (31) disbursing from such an account before completion or termination of the transaction; (32) discriminating against an owner, potential buyer, landlord or potential tenant on the basis of race, color, religion, sex, disability, familial status, national origin or ancestry, including directing a prospective buyer or tenant interested in equivalent properties to a different area on those bases; (33) violating the chapter; and (34) failure to enter into the written agreement required by § 1101.563. The T07 record notes that the buyer-agreement ground sits in subsection (b), not (a), as read." }),
    Object.freeze({ section: "1101.653", note: "Grounds for suspension or revocation of a certificate of registration. Read for the § 1101.602 cross-reference and for context on right-of-way agents; no separate proposition taken." }),
    Object.freeze({ section: "1101.654", note: "Unauthorized practice of law - (a) mandatory suspension or revocation where a non-attorney license holder drafts an instrument or advises on the validity or legal sufficiency of an instrument or on the status of title; (b) the safe harbour for completing a Commission-adopted, attorney-prepared or owner-required form incidental to acting as a broker." }),
    Object.freeze({ section: "1101.655", note: "Mandatory revocation on failure to repay the recovery trust account within 30 days of notice; ineligibility until the amount is repaid with interest." }),
    Object.freeze({ section: "1101.656", note: "Additional disciplinary authority, including probation and its conditions." }),
    Object.freeze({ section: "1101.6561", note: "Suspension or revocation of an educational program's approval. Read." }),
    Object.freeze({ section: "1101.657", note: "Hearing before the State Office of Administrative Hearings under Government Code ch. 2001." }),
    Object.freeze({ section: "1101.658", note: "Appeal to district court in the county in which the hearing was held." }),
    Object.freeze({ section: "1101.659", note: "A refund order is capped at the amount the consumer paid; no other damages may be ordered." }),
    Object.freeze({ section: "1101.660", note: "Informal proceedings. Read." }),
    Object.freeze({ section: "1101.661", note: "Final orders for expired licences. Read." }),
    Object.freeze({ section: "1101.662", note: "Temporary suspension by a three-member disciplinary panel where continued practice would be a continuing and imminent threat to the public welfare." }),
    Object.freeze({ section: "1101.663", note: "Two-year bar on reapplying after revocation, surrender, or denial after a hearing." }),
    Object.freeze({ section: "1101.664", note: "Failure to appear; costs. Read." }),
    Object.freeze({ section: "1101.701", note: "(a) The Commission may impose an administrative penalty for a violation of the chapter or a rule or order adopted under it; (c) it may combine that proceeding with a suspension or revocation proceeding." }),
    Object.freeze({ section: "1101.7015", note: "Delegation of the executive director's authority. Read." }),
    Object.freeze({ section: "1101.702", note: "(a) The administrative penalty may not exceed $5,000 for each violation and each day of a continuing violation may be a separate violation; the five factors the Commission must consider; the penalty schedule adopted by rule." }),
    Object.freeze({ section: "1101.703", note: "Notice of violation. Read as one of the six administrative-penalty procedure sections the T06 record lists together (§§ 1101.703-1101.708: notice of violation; 20 days to accept the determination or request a hearing; SOAH hearing and proposal for decision; Commission order; 30 days to pay or seek judicial review with escrow, supersedeas bond or affidavit of inability; referral to the attorney general for collection)." }),
    Object.freeze({ section: "1101.704", note: "Twenty days to accept the determination or request a hearing. Read with the §§ 1101.703-1101.708 administrative-penalty procedure group." }),
    Object.freeze({ section: "1101.705", note: "SOAH hearing and proposal for decision. Read with the §§ 1101.703-1101.708 administrative-penalty procedure group." }),
    Object.freeze({ section: "1101.706", note: "Commission order on the administrative penalty. Read with the §§ 1101.703-1101.708 administrative-penalty procedure group." }),
    Object.freeze({ section: "1101.707", note: "Thirty days to pay or seek judicial review, with escrow, supersedeas bond or affidavit of inability. Read with the §§ 1101.703-1101.708 administrative-penalty procedure group." }),
    Object.freeze({ section: "1101.708", note: "Referral to the attorney general for collection. Read with the §§ 1101.703-1101.708 administrative-penalty procedure group." }),
    Object.freeze({ section: "1101.7085", note: "Determination by court. Read; no separate proposition taken." }),
    Object.freeze({ section: "1101.709", note: "Remittance of the penalty with interest. Read; no separate proposition taken." }),
    Object.freeze({ section: "1101.710", note: "Administrative Procedure Act applicability. Read; no separate proposition taken." }),
    Object.freeze({ section: "1101.751", note: "Injunctive action by the Commission, without proving the absence of an adequate remedy at law." }),
    Object.freeze({ section: "1101.752", note: "Injunctive action brought through the attorney general, without proving the absence of an adequate remedy at law." }),
    Object.freeze({ section: "1101.753", note: "Civil penalty to the state of not less than the amount received or more than three times the amount received, for receiving compensation for unlicensed brokerage." }),
    Object.freeze({ section: "1101.754", note: "The same measure available as a private cause of action to the aggrieved person." }),
    Object.freeze({ section: "1101.755", note: "Appeal bond exemption. Read." }),
    Object.freeze({ section: "1101.756", note: "Wilful violation of the chapter or of a Commission order is a Class A misdemeanor." }),
    Object.freeze({ section: "1101.757", note: "Acting as a residential rental locator without a licence is a Class A misdemeanor." }),
    Object.freeze({ section: "1101.758", note: "Acting as a broker or sales agent without a licence is a Class A misdemeanor." }),
    Object.freeze({ section: "1101.759", note: "Cease and desist orders after notice and hearing; violation of the order grounds an administrative penalty. Read in T09; not cited there." }),
    Object.freeze({ section: "1101.801", note: "Disciplinary action under § 1101.652 does not relieve a person from civil or criminal liability." }),
    Object.freeze({ section: "1101.802", note: "No civil or criminal liability for failing to inquire about or disclose HIV/AIDS information about an occupant." }),
    Object.freeze({ section: "1101.803", note: "A licensed broker is liable to the Commission, to the public and to the broker's clients for conduct engaged in under the chapter by the broker or by a sales agent associated with or acting for the broker." }),
    Object.freeze({ section: "1101.804", note: "No liability for a license holder 'or nonprofit real estate board or association' that provides information about the sales price or terms of a transaction to facilitate listing, selling, leasing, financing or appraising, unless disclosure is specifically prohibited by statute. Used in T06U3 as the only place the Act touches boards and associations, and expressly not as a membership requirement." }),
    Object.freeze({ section: "1101.805", note: "Liability for misrepresentation or concealment - (b) the section prevails over other law including the common law; (c) broker responsibility for the sponsored sales agent is preserved; (d)-(e) a party is not liable for a license holder's misrepresentation or concealment, and a license holder is not liable for a party's, unless the person knew of the falsity and failed to disclose that knowledge. Subsection (f) noted as repealed effective January 1, 2026." }),
    Object.freeze({ section: "1101.806", note: "(a) Carve-outs; (b) a person may not maintain an action to collect compensation for an act as a broker or sales agent performed in this state without alleging and proving that the person was a license holder when the act was commenced, or a licensed attorney; (c) an action for a commission requires a written, signed promise or memorandum; (d) forfeiture of the commission for failing to give the § 1101.555 advice." }),
  ],
});

const OC_1103 = chapter({
  code: "OC", codeName: "Occupations Code", chapter: "1103", title: "Real Estate Appraisers (Texas Appraiser Licensing and Certification Act)",
  url: "https://tcss.legis.texas.gov/resources/OC/htm/OC.1103.htm",
  localCopy: "texas/trec-sources/statutes/OC.1103.htm",
  sha256: "33753eb747d1f61333ee1e67f5879e1d341eef3381150667bac1a05f4dd3d9c7", bytes: 192684, retrievedOn: "2026-08-29",
  reliedOnByUnits: ["T03U1", "T03U2", "T03U3", "T03U6", "T06U5"],
  sectionsRead: [
    Object.freeze({ section: "1103.001", note: "Short title - the chapter may be cited as the Texas Appraiser Licensing and Certification Act." }),
    Object.freeze({ section: "1103.002", note: "Purpose - to conform state law to the Title XI FIRREA requirements and to enforce appraisal standards; used to explain why ch. 1103 delegates the detail to national bodies." }),
    Object.freeze({ section: "1103.003", note: "Definitions - (1) 'appraisal' means an opinion of value or the act or process of developing an opinion of value, regardless of whether prepared for a federally related transaction; (4) Appraiser Qualifications Board; (4-a) appraiser trainee; (4-b) automated valuation model; (5) 'Board' means the Texas Appraiser Licensing and Certification Board; (5-a) certified appraiser, meaning certified general or certified residential; (6-a) federally related transaction; (7) licensed appraiser, meaning a state licensed residential real estate appraiser; (8) supervisory appraiser as defined by the AQB. Supplies the credential tiers, the statutory definition of appraisal, and the AVM discussion." }),
    Object.freeze({ section: "1103.004", note: "Applicability exclusions - (a)(2) excludes a ch. 1101 broker or a sponsored sales agent who provides a written analysis, opinion or conclusion on estimated price that is not referred to as an appraisal, is given in the ordinary course of the broker's business, and relates to actual or potential acquisition, disposition, encumbrance or management of an interest in real property; (a)(6) excludes the procurement or use of an automated valuation model. Core of the CMA/BPO boundary." }),
    Object.freeze({ section: "1103.051", note: "The Board is an independent subdivision of the Texas Real Estate Commission." }),
    Object.freeze({ section: "1103.052", note: "Board membership - nine members: the Veterans' Land Board executive secretary or designee as a voting member plus eight gubernatorial appointees (four active appraisers and four public members), with anti-overrepresentation and geographic and discipline diversity directives." }),
    Object.freeze({ section: "1103.053", note: "Appointed members must be qualified voters; the oath must be taken within 15 days of appointment." }),
    Object.freeze({ section: "1103.054", note: "Public-member ineligibility grounds." }),
    Object.freeze({ section: "1103.055", note: "Appointed members serve staggered six-year terms." }),
    Object.freeze({ section: "1103.151", note: "The Board may adopt rules for certifying and licensing appraisers and for qualifying education and experience consistent with AQB guidelines." }),
    Object.freeze({ section: "1103.152", note: "The Board may establish certificate and license categories consistent with AQB categories and prescribe qualifications consistent with the AQB - the delegation that keeps hour counts out of the statute." }),
    Object.freeze({ section: "1103.153", note: "Board rulemaking on continuing education and on provider and course approval." }),
    Object.freeze({ section: "1103.154", note: "Board rulemaking to conform to the Appraisal Standards Board's minimum standards by incorporating USPAP." }),
    Object.freeze({ section: "1103.201", note: "(a) A certificate or licence is required to perform an appraisal, or temporary out-of-state registration, or trainee status under supervision; (b) title and reference restrictions." }),
    Object.freeze({ section: "1103.202", note: "Eligibility - pass the examination; complete the number and type of classroom hours required by the AQB; the minimum experience hours over the calendar years required by the AQB; honesty, trustworthiness and integrity; compliance with §§ 1103.203 and 1103.2031. Quoted in full as the basis for the module's statement that ch. 1103 itself states no hour counts. Read for context in T06U5." }),
    Object.freeze({ section: "1103.203", note: "Application form; felony plea or conviction disclosure; address and e-mail requirements." }),
    Object.freeze({ section: "1103.2031", note: "The Board may require fingerprints and a criminal history record check." }),
    Object.freeze({ section: "1103.204", note: "No time limit on satisfying the education requirements; the Board must credit classroom hours taken in becoming a broker or sales agent where they satisfy AQB guidelines." }),
    Object.freeze({ section: "1103.205", note: "No time limit on experience; acceptable experience is any AQB-recognized category; an hour of experience is 60 minutes and must be based solely on actual hours." }),
    Object.freeze({ section: "1103.206", note: "The Board must adopt reliable verification methods; experience is reviewed for all certification applicants; the applicant has at least 60 days to submit requested records." }),
    Object.freeze({ section: "1103.207", note: "The Board may require additional documentation - county, property type, approach to value used, actual hours - on a reasonable complaint of fraud, incompetency or malpractice or for other just cause." }),
    Object.freeze({ section: "1103.209", note: "Reciprocal certificate or licence conditions, including that the other state's program comply with 12 U.S.C. § 3331 et seq." }),
    Object.freeze({ section: "1103.211", note: "A certificate or licence expires on the second anniversary of issuance; renewal requirements including AQB-compliant continuing education." }),
    Object.freeze({ section: "1103.2111", note: "Late renewal - 1-1/2 times the fee if expired 90 days or less; twice the fee if more than 90 days but less than six months; no renewal at six months or longer; no appraisal in a federally related transaction while not actively credentialed." }),
    Object.freeze({ section: "1103.213", note: "Inactive status - the holder may not perform any activity regulated under the chapter but must pay annual renewal fees." }),
    Object.freeze({ section: "1103.251", note: "The Board prescribes a written examination approved by the AQB." }),
    Object.freeze({ section: "1103.253", note: "The examination is offered at least once each month in Austin and at other locations and times the Board determines." }),
    Object.freeze({ section: "1103.254", note: "An examination application is active for one year." }),
    Object.freeze({ section: "1103.255", note: "The applicant must fulfil the applicable experience requirement before taking the examination - the sequencing point taught in T03U1." }),
    Object.freeze({ section: "1103.256", note: "The passing standard is the minimum score required by the AQB; no number appears in the Texas statute." }),
    Object.freeze({ section: "1103.257", note: "Notice of results not later than the 10th day; results are confidential." }),
    Object.freeze({ section: "1103.258", note: "Reexamination; three consecutive failures require additional Board-prescribed education." }),
    Object.freeze({ section: "1103.301", note: "An out-of-state certified or licensed appraiser may appraise in Texas on registration with the Board." }),
    Object.freeze({ section: "1103.303", note: "Temporary registration eligibility - the other state's program must not be disapproved by the Appraisal Subcommittee, and the Texas appraisal business must not exceed six months." }),
    Object.freeze({ section: "1103.304", note: "One 90-day extension of a temporary registration." }),
    Object.freeze({ section: "1103.351", note: "The Board may authorize a certified appraiser to act as a supervisory appraiser; a trainee may have more than one." }),
    Object.freeze({ section: "1103.353", note: "Trainee eligibility - at least 18 years old; United States citizen or lawfully admitted alien; honesty, trustworthiness and integrity; compliance with §§ 1103.203 and 1103.2031; other Board qualifications." }),
    Object.freeze({ section: "1103.354", note: "A trainee may appraise under a supervisory appraiser's direction; the supervisor signs each report and is responsible to the public and the Board; the trainee may co-sign." }),
    Object.freeze({ section: "1103.356", note: "Trainee licence renewal requirements." }),
    Object.freeze({ section: "1103.401", note: "No use of a title, designation, initials or insignia that would mislead the public as to credentials, qualifications or competency." }),
    Object.freeze({ section: "1103.402", note: "A person may not sign or endorse an appraisal unless it was substantially produced by that person; 'substantially produced' means a material and verifiable contribution to the research or analysis producing the final opinion of value." }),
    Object.freeze({ section: "1103.403", note: "A Texas-resident credentialed appraiser must maintain a fixed office in this state; 10-day notice of address changes." }),
    Object.freeze({ section: "1103.404", note: "Business records for each appraisal must be retained until at least the fifth anniversary of the date of the appraisal." }),
    Object.freeze({ section: "1103.405", note: "An appraiser must comply with the most current USPAP edition or Board standards at least as stringent; (c) requires the notice 'This is not an appraisal performed in accordance with the Uniform Standards of Professional Appraisal Practice' on documents provided under § 1103.004(4) or (5). The module says expressly that this notice provision does not itself impose that requirement on a license holder's CMA." }),
    Object.freeze({ section: "1103.451", note: "Complaint initiation and the Board's own-motion authority, including against unlicensed persons. Read for context on the Board's enforcement reach; not separately cited in the module." }),
    Object.freeze({ section: "1103.5535", note: "Civil penalty for engaging in activity requiring a credential without one - not less than the consideration received and not more than three times it." }),
    Object.freeze({ section: "1103.554", note: "A knowing violation of § 1103.401 is a Class B misdemeanor." }),
    Object.freeze({ section: "1103.5545", note: "Engaging in activity requiring a certificate or licence without holding one is a Class A misdemeanor." }),
  ],
});

const PR_5 = chapter({
  code: "PR", codeName: "Property Code", chapter: "5", title: "Conveyances",
  url: "https://tcss.legis.texas.gov/resources/PR/htm/PR.5.htm",
  localCopy: "texas/trec-sources/statutes/PR.5.htm",
  sha256: "8d2de95ab891d16cb19dd73f4ac8f46c2cb349f49b7ed6f59d9e5a98c80ca9d7", bytes: 273766, retrievedOn: "2026-08-27",
  reliedOnByUnits: ["T02U5", "T02U6", "T02U8", "T05U1", "T05U2", "T05U3"],
  sectionsRead: [
    Object.freeze({ section: "5.006", note: "A court 'shall allow' reasonable attorney's fees to a prevailing party who asserted an action for breach of a restrictive covenant." }),
    Object.freeze({ section: "5.008", note: "Seller's disclosure of property condition - the full statutory notice text, including item 4 (hazardous or toxic waste, asbestos, urea formaldehyde, radon, lead-based paint, improper drainage, landfill, settling, soil movement, fault lines, subsurface structure or pits, methamphetamine manufacture), item 6 (flood insurance, prior flooding, floodplain, floodway, flood pool or reservoir, with the notice's own definitions of the 100-year and 500-year floodplain), items 7-8 (flood claims; FEMA and SBA assistance), item 9 (unpermitted alterations, deed-restriction and ordinance violation notices, health or safety conditions, groundwater conservation or subsidence district), item 10 (the Open Beaches Act and Dune Protection Act reference for coastal property), item 11 (military installation), plus (c) the death and HIV non-disclosure rule, (d) the best-belief-and-knowledge standard, and (e) the exempt transfers. Backbone of T05U3." }),
    Object.freeze({ section: "5.012", note: "Notice of obligations related to membership in a property owners' association - it tells the purchaser that the covenants and dedicatory instruments are recorded in the county real property records and that copies may be obtained from the county clerk." }),
    Object.freeze({ section: "5.013", note: "Seller's disclosure of transportation pipelines under unimproved residential property; 'hazardous substance' takes the meaning given by Health and Safety Code § 361.003; a seven-day termination right if the notice is late. The module cites § 361.003 only as the cross-reference § 5.013(e) itself makes and states nothing about its contents." }),
    Object.freeze({ section: "5.014", note: "Notice of obligations related to a public improvement district, including the capitalised assessment and foreclosure warning in the prescribed form." }),
    Object.freeze({ section: "5.016", note: "Conveyance of residential property encumbered by a recorded lien - a separate written disclosure in at least 12-point type on or before the seventh day before the earlier of the conveyance or the execution of an executory, option or other binding contract; the seven required content items, including whether the lienholder has consented to the transfer; the required all-capitals WARNING text; a violation does not invalidate the conveyance but gives a seven-day termination right after notice; the eleven exempt transfers in (c), including title-insured transfers and transfers to a person with four or more transactions in the preceding 12 months; and the (d) safe harbor for liens to be released within 30 days after transfer." }),
    Object.freeze({ section: "5.019", note: "Notice of water level fluctuations for property adjoining an impoundment of at least 5,000 acre-feet under Water Code ch. 11; a misrepresentation action where the notice was omitted and the seller had actual knowledge." }),
    Object.freeze({ section: "5.0205", note: "Equitable interest disclosure - written disclosure is required before selling an option or assigning an interest in a contract to purchase, both to the potential buyer (that only an option or contract interest is being sold and the person does not have legal title) and to the owner (of the intent to sell or assign)." }),
    Object.freeze({ section: "5.026", note: "Discriminatory provisions in restrictions and deeds are void, and a court shall dismiss a suit to enforce them." }),
    Object.freeze({ section: "5.061", note: "Definition of 'default' - failure to make a timely payment or to comply with a term of an executory contract." }),
    Object.freeze({ section: "5.062", note: "Applicability of subchapter D - residential executory contracts, including the one-acre residential presumption and the rule that a purchase option combined with or executed concurrently with a residential lease is, together with the lease, an executory contract; (b) the exclusions for state land and sales by the Veterans' Land Board, the state or a political subdivision, or entities acting on their behalf; (c) the 180-day deed-delivery exclusion; (d) the related-party waiver; and (e)-(g) the limits on which sections apply to lease-option contracts." }),
    Object.freeze({ section: "5.0621", note: "Subchapter D and Property Code ch. 92 both apply to the residential lease portion of a lease-option executory contract; ch. 92 ceases to apply after the option is exercised." }),
    Object.freeze({ section: "5.063", note: "Default notice - registered or certified mail, return receipt requested; conspicuous 14-point boldface or uppercase; the required separate-page NOTICE text; and the content requirements identifying the remedy, itemizing principal, interest and additional charges and the period, or identifying the term violated and the cure action." }),
    Object.freeze({ section: "5.064", note: "A seller may enforce rescission or forfeiture and acceleration only if notice was given of the intent and of the 30-day cure right, the purchaser failed to cure, § 5.066 does not apply, and the contract has not been recorded." }),
    Object.freeze({ section: "5.065", note: "The 30-day cure right, notwithstanding any agreement to the contrary." }),
    Object.freeze({ section: "5.066", note: "Equity protection - a trustee's power of sale arises once the purchaser has paid 40 percent of the amount due or the equivalent of 48 monthly payments, or once the contract is recorded; rescission or forfeiture and acceleration are prohibited after recording; the 60-day cure with the substituted public-auction NOTICE text; notice of sale and conduct of the sale under § 51.002, with a notice of sale invalid unless given after the cure period expires; conveyance of fee simple with warranty against encumbrance; disbursement of surplus proceeds to the purchaser and the deficiency rules; the affidavit and bona fide purchaser provision; and (g) preserving rescission or forfeiture and acceleration below the 40 percent / 48 payment threshold." }),
    Object.freeze({ section: "5.067", note: "A lien for the reasonable value of utility-service improvements is not a default." }),
    Object.freeze({ section: "5.068", note: "Foreign language requirement where negotiations were conducted primarily in a language other than English." }),
    Object.freeze({ section: "5.069", note: "Pre-signing disclosure of property condition - (a)(1) a current survey or plat; (2) legible copies of encumbrance documents; and (3) the attached, jointly executed condition notice with the WARNING heading and the recorded-subdivision, potable water, sewer or septic approval, electric service, and floodplain checkboxes." }),
    Object.freeze({ section: "5.070", note: "Pre-signing disclosure of tax certificates and evidence of insurance; failure is a violation of DTPA § 17.46 and entitles the purchaser to rescind with a full refund." }),
    Object.freeze({ section: "5.071", note: "Pre-signing disclosure of financing terms - (1) purchase price; (2) interest rate; (3) the dollar amount or an estimate of the interest for the term; (4) total principal and interest; (5) late charge; and (6) the fact that no prepayment penalty may be charged." }),
    Object.freeze({ section: "5.072", note: "Oral agreements prohibited; the parties' rights are determined solely from the written contract; the required 14-point final-agreement statement; DTPA consequence and rescission with a full refund." }),
    Object.freeze({ section: "5.073", note: "Prohibited contract terms - (a)(1) a late fee exceeding the lesser of eight percent of the monthly payment or the actual administrative cost; (2) pledging the purchaser's interest for improvement loans; (3) a prepayment penalty; (4) forfeiture of an option fee for a late payment; (5) penalizing a lease-option purchaser for requesting repairs or exercising ch. 92 rights; and (b) the voiding of any waiver of a subchapter right or duty." }),
    Object.freeze({ section: "5.074", note: "Fourteen-day right to cancel without cause; the seller's 10-day obligation to return the contract, the property and payments and to cancel security interests; the required 14-point statement next to the signature block; the notice of cancellation form; and the prohibition on requesting a waiver of receipt." }),
    Object.freeze({ section: "5.075", note: "Purchaser's right to pledge the § 5.066 interest on contracts executed before September 1, 2001, limited to safety-related improvement loans. Read; noted as historically limited." }),
    Object.freeze({ section: "5.076", note: "Recording of the contract and of the § 5.069 disclosure within 30 days of execution; recording of the terminating instrument; filing fee; damages capped at $500 per calendar year of noncompliance." }),
    Object.freeze({ section: "5.077", note: "Annual accounting statement each January, postmarked by January 31 if mailed; the seven content items; $100 per missed statement for sellers with fewer than two transactions in 12 months and $250 per day capped at fair market value for sellers with two or more; attorney's fees; continuation after conversion." }),
    Object.freeze({ section: "5.078", note: "Insurance notification duty and joint issuance of proceeds to purchaser and seller. Read for context in the annual-statement and § 5.077(b)(6) discussion." }),
    Object.freeze({ section: "5.079", note: "A recorded executory contract is equivalent to a deed with a vendor's lien; a general warranty is implied; 30-day title transfer after final payment on unrecorded, unconverted contracts; liquidated damages of $250 per day for days 31-90 and $500 per day thereafter plus attorney's fees; the heirship waiver; and the extended definition of 'seller'." }),
    Object.freeze({ section: "5.080", note: "A disclosure made by the seller's agent is a disclosure made by the seller." }),
    Object.freeze({ section: "5.081", note: "Purchaser's right to convert to recorded legal title at any time without penalty; tender of the balance; the promissory-note-and-deed-of-trust route with matching rate, due dates and late fees; the seller's 10-day duty to justify a refusal or schedule execution; liability mirroring § 5.079; completion and cessation of effect; and the provision that appropriate use of TREC-published forms constitutes compliance." }),
    Object.freeze({ section: "5.082", note: "(a) The purchaser's right, on written request, to the amount owed and to the seller's desired trustee." }),
    Object.freeze({ section: "5.083", note: "Right to cancel for improper platting; the seller's 10-day election to give notice of intent to plat or to refund and reimburse; the 90-day cure; and the bar on terminating possession before payment." }),
    Object.freeze({ section: "5.084", note: "The purchaser's self-help right to deduct amounts the seller owes under the subchapter." }),
    Object.freeze({ section: "5.085", note: "Fee simple title required and maintained free of liens; the narrow purchase-money-lien exception with its three-day separate written disclosure (lienholder identity, loan number and balance, monthly payments and due dates, and the 14-point foreclosure warning), the lien-scope and lienholder-consent conditions, and the three required covenants including the 150 percent deduction remedy; DTPA consequence and full rescission remedy; and the (d) third-party-lien defense." }),
    Object.freeze({ section: "5.087", note: "Additional provisions for counties adopting a § 5.0622 order. Read for context; no proposition taken beyond noting that county-level applicability exists." }),
  ],
});

const PR_91 = chapter({
  code: "PR", codeName: "Property Code", chapter: "91", title: "Provisions Generally Applicable to Landlords and Tenants",
  url: "https://tcss.legis.texas.gov/resources/PR/htm/PR.91.htm",
  localCopy: "texas/trec-sources/statutes/PR.91.htm",
  sha256: "f5255f1dd0558447a555725d4be1f15862f42ad31237ae27dc4efca6c8af69ce", bytes: 7375, retrievedOn: "2026-08-29",
  reliedOnByUnits: ["T04U1", "T04U3", "T04U4", "T09U3"],
  sectionsRead: [
    Object.freeze({ section: "91.001", note: "Notice terminating a monthly or month-to-month tenancy - termination on the later of the date given in the notice or one month after the notice, with shorter rules for shorter rent-paying periods; rent is owed only to the date of termination; the whole scheme yields to a signed agreement setting a different notice period. Chapter read in full; it contains only these five sections." }),
    Object.freeze({ section: "91.003", note: "Termination of a lease after a public indecency conviction. Read; not cited in either module." }),
    Object.freeze({ section: "91.004", note: "A landlord's breach of the lease makes the landlord liable to a non-defaulting tenant for the resulting damages and gives that tenant a lien on the landlord's nonexempt property in the tenant's possession and on rent due to the landlord." }),
    Object.freeze({ section: "91.005", note: "A tenant may not rent the leasehold to another without the landlord's prior consent." }),
    Object.freeze({ section: "91.006", note: "A landlord's duty to mitigate damages when a tenant abandons the premises in violation of the lease; the duty may not be waived." }),
  ],
});

const PR_92 = chapter({
  code: "PR", codeName: "Property Code", chapter: "92", title: "Residential Tenancies",
  url: "https://tcss.legis.texas.gov/resources/PR/htm/PR.92.htm",
  localCopy: "texas/trec-sources/statutes/PR.92.htm",
  sha256: "e4269dac3944639774c143e0d47b65b5bc12f5f3cb02a134f9abe67e05732df7", bytes: 299561, retrievedOn: "2026-08-29",
  reliedOnByUnits: ["T04U1", "T04U3", "T04U4", "T04U5", "T09U1", "T09U2", "T09U3"],
  sectionsRead: [
    Object.freeze({ section: "92.001", note: "Definitions - (2) 'landlord', which excludes a manager or agent unless the manager or agent purports to be the owner, lessor or sublessor in the lease; 'lease', written or oral; 'normal wear and tear'; 'premises'; and 'tenant'." }),
    Object.freeze({ section: "92.002", note: "The chapter applies only to the relationship between landlords and tenants of residential rental property; used to fence ch. 92 off from commercial leasing." }),
    Object.freeze({ section: "92.006", note: "Which duties and remedies may not be waived - security deposits, security devices, disclosure of ownership and management, utility cutoffs, smoke alarms and the jury trial right - and the narrow tenant-repair agreements permitted by (e) and (f) with their underlining and boldface formalities. Read (a)-(h); (a) relied on in T09." }),
    Object.freeze({ section: "92.008", note: "A landlord or a landlord's agent may not interrupt utility service except for bona fide repairs, construction or an emergency; the tenant may recover possession or terminate plus actual damages, one month's rent plus $1,000, attorney's fees and costs; waiver is void; (h) the conditioned submetered or allocated electricity exception." }),
    Object.freeze({ section: "92.0081", note: "Removal of doors, locks and appliances is barred and exclusion is permitted only by judicial process except in three listed situations; the lockout notice mechanics (five days if mailed, three days if hand-delivered or posted), 24-hour key access, a key without regard to payment, no lockout while an occupant is inside or more than once per rental payment period; penalty of one month's rent plus $1,000 plus damages, costs and fees, with an extra month's rent for refusing the key." }),
    Object.freeze({ section: "92.009", note: "The tenant's writ of reentry from the justice court after an unlawful lockout." }),
    Object.freeze({ section: "92.0091", note: "Writ of restoration of utility service after an unlawful disconnection." }),
    Object.freeze({ section: "92.010", note: "Occupancy limit of three adults per bedroom; the definitions of 'adult' and 'bedroom'; the fair-housing and family-violence exceptions." }),
    Object.freeze({ section: "92.011", note: "The landlord must accept timely cash rent unless a written lease requires a traceable instrument; receipt and record-book duties." }),
    Object.freeze({ section: "92.019", note: "A late fee is permitted only on written-lease notice, only if reasonable, and only if rent is unpaid two full days after the due date; the 12 percent / 10 percent reasonableness safe harbor by structure size; liability of $100 plus three times the fee plus attorney's fees; waiver void." }),
    Object.freeze({ section: "92.021", note: "A guarantor is liable only for the original lease term absent the specific renewal-guaranty language." }),
    Object.freeze({ section: "92.024", note: "The landlord must give the tenant a complete copy of the signed lease not later than the third business day after signing. Read; not cited in module 09." }),
    Object.freeze({ section: "92.052", note: "Landlord's duty to repair - notice to the person or place where rent is normally paid, the tenant not delinquent, a condition materially affecting the physical health or safety of an ordinary tenant or a hot-water device below 120 degrees Fahrenheit; the tenant-caused exclusion; writing required only if the written lease requires it." }),
    Object.freeze({ section: "92.053", note: "Burden of proof; the landlord's failure to give a written explanation of delay within five days of a written demand shifts the burden." }),
    Object.freeze({ section: "92.054", note: "Casualty loss; the period for repair does not begin until insurance proceeds are received. Read; used only as background and not cited." }),
    Object.freeze({ section: "92.055", note: "Closing the rental premises. Read; not cited." }),
    Object.freeze({ section: "92.056", note: "The six conditions for landlord liability; the tracked-mail alternative to a second notice; the rebuttable presumption that seven days is a reasonable time; when notice is deemed received; the menu of tenant remedies and the consequences of electing termination; and the required underlined or bold lease notice of remedies." }),
    Object.freeze({ section: "92.0561", note: "Repair and deduct, capped at one month's rent or $500, whichever is greater; the four triggering conditions; the immediate, three-day and seven-day waiting periods, including the accelerated categories for sewage and flooding, cessation of potable water and inadequate heating or cooling; the independent contractor requirement; the bill and receipt with rent." }),
    Object.freeze({ section: "92.0562", note: "Landlord's affidavit for delay - 15 days for parts, 30 days after a natural disaster." }),
    Object.freeze({ section: "92.0563", note: "Tenant's judicial remedies, including a civil penalty of one month's rent plus $500." }),
    Object.freeze({ section: "92.058", note: "The landlord's remedy against a tenant's bad-faith withholding or deduction - one month's rent plus $500 after written warning." }),
    Object.freeze({ section: "92.060", note: "A managing agent, leasing agent or resident manager is the landlord's agent for subchapter B notice." }),
    Object.freeze({ section: "92.061", note: "The subchapter B duties and remedies are in lieu of common-law and other statutory warranties for maintenance, repair, security, habitability and nonretaliation." }),
    Object.freeze({ section: "92.101", note: "Subchapter C applies to all residential leases." }),
    Object.freeze({ section: "92.102", note: "Definition of security deposit, which excludes an application deposit and advance rent." }),
    Object.freeze({ section: "92.103", note: "(a) Refund on or before the 30th day after the tenant surrenders possession; the advance-notice-of-surrender requirement is effective only if underlined or in conspicuous bold print." }),
    Object.freeze({ section: "92.104", note: "Permitted deductions; no retention for normal wear and tear; a written description and itemized list of deductions is required, with the two-part rent-owed exception." }),
    Object.freeze({ section: "92.1041", note: "Mailing-and-postmark presumption of a timely refund or accounting." }),
    Object.freeze({ section: "92.105", note: "A new owner is liable for return of the deposit from the date title is acquired." }),
    Object.freeze({ section: "92.106", note: "The landlord must keep accurate deposit records. Read; folded into the deposit discussion in an earlier draft and trimmed from the final text." }),
    Object.freeze({ section: "92.107", note: "The forwarding address condition, and the rule that failure to give a forwarding address does not forfeit the refund right. Read; not cited in module 09." }),
    Object.freeze({ section: "92.108", note: "A tenant may not withhold the last month's rent against the deposit; liability of three times the rent wrongfully withheld plus the landlord's attorney's fees." }),
    Object.freeze({ section: "92.109", note: "Bad-faith retention - $100 plus three times the portion wrongfully withheld plus attorney's fees; forfeiture for bad-faith failure to itemize; the landlord's burden to show retention was reasonable; the presumption of bad faith after the 30th day." }),
    Object.freeze({ section: "92.110", note: "Notice of claim where no deposit was required. Read; not cited." }),
    Object.freeze({ section: "92.111", note: "Fee in lieu of security deposit. Read; not cited." }),
    Object.freeze({ section: "92.151", note: "Subchapter D definitions - 'security device', 'rekey' and 'tenant turnover date'." }),
    Object.freeze({ section: "92.152", note: "Application of subchapter D - which dwellings the security-device subchapter covers and which it does not (hotel, motel and similar transient housing, accredited college and preparatory housing, and short sale-related tenancies). Read in T04 and not cited there; relied on in T09U2." }),
    Object.freeze({ section: "92.153", note: "Security devices required without a tenant request, installed at the landlord's expense, and operable throughout the tenant's possession." }),
    Object.freeze({ section: "92.154", note: "Keyed dead bolt and keyless bolting device height of 36 to 48 inches and a one-inch throw for devices installed on or after September 1, 1993." }),
    Object.freeze({ section: "92.156", note: "Rekeying at the landlord's expense not later than the seventh day after each tenant turnover date; additional rekeying at the tenant's expense, with unlimited requests." }),
    Object.freeze({ section: "92.157", note: "Devices installed at the tenant's request. Read; not cited." }),
    Object.freeze({ section: "92.158", note: "The landlord's duty to repair or replace a security device on request." }),
    Object.freeze({ section: "92.159", note: "A tenant's request may be oral unless a written lease requires writing in underlined or boldface print." }),
    Object.freeze({ section: "92.161", note: "Presumed reasonable compliance time of seven days, shortened to 72 hours after a recent unauthorized entry or a crime of personal violence in the complex." }),
    Object.freeze({ section: "92.162", note: "Limits on what a landlord may charge for security-device work. Read; not cited." }),
    Object.freeze({ section: "92.163", note: "A security device installed, changed or rekeyed becomes a fixture the tenant may not alter without permission." }),
    Object.freeze({ section: "92.164", note: "Tenant remedies for failure to install or rekey, including install-and-deduct, unilateral termination, and a civil penalty of one month's rent plus $500." }),
    Object.freeze({ section: "92.201", note: "Disclosure of ownership and management - the record title holder and, where an off-site entity is primarily responsible for managing the dwelling, that management company's name and street address; the three permitted delivery methods on a seven-day clock." }),
    Object.freeze({ section: "92.202", note: "Landlord's failure to disclose ownership and management information. Read; underlies the § 92.205 remedies cited, and summarised rather than quoted in module 09." }),
    Object.freeze({ section: "92.203", note: "Landlord's failure to correct information. Read; summarised rather than quoted." }),
    Object.freeze({ section: "92.204", note: "Bad-faith violation of the ownership-and-management disclosure duty. Read; summarised rather than quoted." }),
    Object.freeze({ section: "92.205", note: "Remedies including a court order, actual discovery costs, one month's rent plus $100, costs and fees, and unilateral termination of the lease without a court proceeding." }),
    Object.freeze({ section: "92.251", note: "Smoke alarm subchapter definitions. Read; not cited in the module." }),
    Object.freeze({ section: "92.301", note: "Landlord liability where the utility company cuts off service the landlord agreed to furnish because the landlord did not pay." }),
    Object.freeze({ section: "92.331", note: "Retaliation - the protected tenant acts and the five prohibited landlord responses within six months." }),
    Object.freeze({ section: "92.332", note: "Nonretaliation - an escalation clause for utilities, taxes or insurance and project-wide increases; and the holdover, delinquency, damage and material-breach grounds valid 'in any event'." }),
    Object.freeze({ section: "92.333", note: "The tenant's retaliation remedy - one month's rent plus $500, actual damages, costs and attorney's fees." }),
    Object.freeze({ section: "92.334", note: "Bad-faith retaliation suits; the mirror-image penalty against the tenant." }),
    Object.freeze({ section: "92.335", note: "Retaliation is a defense in an eviction suit." }),
    Object.freeze({ section: "92.351", note: "Definitions of application deposit and application fee." }),
    Object.freeze({ section: "92.3515", note: "Required notice of tenant selection criteria. Read; the refund consequence was in an earlier draft and was trimmed for length." }),
    Object.freeze({ section: "92.352", note: "An applicant is deemed rejected if no notice of acceptance is given on or before the seventh day." }),
    Object.freeze({ section: "92.353", note: "Procedures for notice or refund. Read; not cited." }),
    Object.freeze({ section: "92.354", note: "Bad-faith failure to refund an application deposit - $100, three times the amount retained, plus attorney's fees." }),
    Object.freeze({ section: "92.355", note: "A waiver in a rental application is void. Read; trimmed from the final text." }),
  ],
});

const PR_202 = chapter({
  code: "PR", codeName: "Property Code", chapter: "202", title: "Construction and Enforcement of Restrictive Covenants",
  url: "https://tcss.legis.texas.gov/resources/PR/htm/PR.202.htm",
  localCopy: "texas/trec-sources/statutes/PR.202.htm",
  sha256: "4fa54052c8dda253ef9054508471df619fe680ce0306b0ce432de66b7de87df6", bytes: 56585, retrievedOn: "2026-08-29",
  reliedOnByUnits: ["T05U1"],
  sectionsRead: [
    Object.freeze({ section: "202.001", note: "Definitions of 'dedicatory instrument', 'property owners' association' and 'restrictive covenant'. Whole chapter read." }),
    Object.freeze({ section: "202.002", note: "The chapter applies to all restrictive covenants regardless of the date they were created." }),
    Object.freeze({ section: "202.003", note: "Restrictive covenants are liberally construed to give effect to their purposes and intent; the family-home limitation." }),
    Object.freeze({ section: "202.004", note: "An association's exercise of discretionary authority is presumed reasonable unless arbitrary, capricious or discriminatory; the association may litigate; civil damages of up to $200 for each day of violation - the basis for the module's worked illustration." }),
    Object.freeze({ section: "202.006", note: "Dedicatory instruments must be filed in the county real property records; they have no effect until filed; no regular assessment may be collected while unfiled. Core of the 'two different places' teaching." }),
    Object.freeze({ section: "202.007", note: "Provisions restricting water-conserving landscaping, composting, rain barrels and irrigation are void, with the regulatory allowances the section states." }),
    Object.freeze({ section: "202.010", note: "Solar energy devices." }),
    Object.freeze({ section: "202.011", note: "Protected shingle types." }),
    Object.freeze({ section: "202.012", note: "Flag display." }),
    Object.freeze({ section: "202.019", note: "Standby electric generators." }),
    Object.freeze({ section: "202.021", note: "Firearms and ammunition." }),
    Object.freeze({ section: "202.022", note: "Swimming pool enclosures." }),
    Object.freeze({ section: "202.023", note: "Security measures." }),
    Object.freeze({ section: "202.024", note: "Method of payment, including housing choice vouchers and other assistance." }),
    Object.freeze({ section: "202.005", note: "Read in the whole-chapter pass; not cited in the final module text." }),
    Object.freeze({ section: "202.008", note: "Read in the whole-chapter pass; not cited in the final module text." }),
    Object.freeze({ section: "202.013", note: "Read in the whole-chapter pass; not cited in the final module text." }),
    Object.freeze({ section: "202.018", note: "Read in the whole-chapter pass; not cited in the final module text." }),
    Object.freeze({ section: "202.020", note: "Read in the whole-chapter pass; not cited in the final module text." }),
  ],
});

const PR_301 = chapter({
  code: "PR", codeName: "Property Code", chapter: "301", title: "Texas Fair Housing Act",
  url: "https://tcss.legis.texas.gov/resources/PR/htm/PR.301.htm",
  localCopy: "texas/trec-sources/statutes/PR.301.htm",
  sha256: "925c6a1adcdf66c06b0088da4f7c714d6151cd3bafd436654cafc6c322151a3d", bytes: 71019, retrievedOn: "2026-08-29",
  reliedOnByUnits: ["T08U1", "T08U2", "T08U3", "T08U4", "T08U5", "T09U2"],
  sectionsRead: [
    Object.freeze({ section: "301.001", note: "Short title, quoted - the Texas Fair Housing Act." }),
    Object.freeze({ section: "301.0015", note: "Powers under the chapter are transferred to the Texas Workforce Commission and 'commission' means the TWC. The sole basis for naming the administering agency, and for the module's warning that it is not TREC." }),
    Object.freeze({ section: "301.002", note: "The three purposes, quoted, including the provision of 'rights and remedies substantially equivalent to those granted under federal law'." }),
    Object.freeze({ section: "301.003", note: "Definitions - (6) 'disability', quoted including its exclusions (compared in the module with 42 U.S.C. § 3602(h), which does not carry the two Texas-only exclusions); (8) 'dwelling', including vacant land offered for sale or lease for residential construction; (9) 'family' includes a single individual; (11) 'to rent', which expressly includes leasing, subleasing and letting for consideration the right to occupy premises not owned by the occupant; (12) 'person' includes an individual, used for the license holder's personal exposure." }),
    Object.freeze({ section: "301.004", note: "Familial status - pregnancy, domicile with a minor, and being in the process of obtaining legal custody; the federal and Texas classes match." }),
    Object.freeze({ section: "301.0045", note: "Race includes hair texture and protective hairstyles such as braids, locks and twists. The module's only claim that Texas broadens coverage, framed as coverage inside an existing class." }),
    Object.freeze({ section: "301.005", note: "Remedies under the chapter 'may not be expanded beyond their express statutory terms'; the basis for the module's refusal to assert unlisted protected classes. Read in T09; not cited there." }),
    Object.freeze({ section: "301.021", note: "(a) The sale and rental prohibition - refusing to sell or rent after a bona fide offer, refusing to negotiate, or otherwise making unavailable or denying a dwelling because of race, colour, religion, sex, familial status or national origin; (b) discrimination in the terms, conditions or privileges of a sale or rental and in services or facilities; (c) the controlled-substance conviction proviso, whose federal counterpart sits in 42 U.S.C. § 3607(b)(4)." }),
    Object.freeze({ section: "301.022", note: "The publication and advertising prohibition - a notice, statement or advertisement indicating a preference, limitation or discrimination, or an intention to make one. Noted as not among the sections exempted by § 301.041." }),
    Object.freeze({ section: "301.023", note: "False representation that a dwelling is unavailable for inspection, sale or rental." }),
    Object.freeze({ section: "301.024", note: "Blockbusting - inducing or attempting to induce a sale or rental 'for profit' by representations regarding entry or prospective entry into a neighbourhood of persons of a protected characteristic." }),
    Object.freeze({ section: "301.025", note: "Disability discrimination in sale or rental and in terms and conditions; the three-part definition (refusing a reasonable modification at the disabled person's expense, refusing a reasonable accommodation in rules, policies, practices or services, and the design and construction requirements); the March 13, 1991 first-occupancy cut-off; covered multifamily dwellings; and the direct-threat and substantial-damage exception in (f)-(g)." }),
    Object.freeze({ section: "301.026", note: "(a)-(b) Residential real estate related transactions, defined to include dwelling lending and 'the selling, brokering, or appraising of residential real property'. The Texas parallel to 42 U.S.C. § 3605, taught alongside it for redlining and credit discrimination. Read in T09; not cited there." }),
    Object.freeze({ section: "301.027", note: "Brokerage services, multiple listing services and brokers' organizations. Read in full and used to teach brokerage-access discrimination, since 42 U.S.C. § 3606 is not held." }),
    Object.freeze({ section: "301.041", note: "(a)-(d) The owner sale and rental exemptions - the three-house limit; loss of the exemption on use of a ch. 1101 licensee; loss of the exemption on prohibited advertising; the owner-occupied four-family exemption; and the one-sale-in-24-months limit." }),
    Object.freeze({ section: "301.042", note: "(a), (a-1), (b), (c) - the religious organization exemption, the 25-acre carve-back, the private club exemption, and the appraisal provision." }),
    Object.freeze({ section: "301.043", note: "Housing for the elderly exempted from the familial-status provisions - the 62-and-over, 55-and-over and program routes. The 55-and-over route runs through commission rules that were not held, so the module states the federal figure from 42 U.S.C. § 3607(b)(2)(C)(i) and not a Texas one." }),
    Object.freeze({ section: "301.044", note: "(a) Occupancy limits and health and safety standards; (b) other nondiscrimination law is preserved." }),
    Object.freeze({ section: "301.062", note: "The commission's substantive rules must be 'the same as are provided in federal fair housing regulations'." }),
    Object.freeze({ section: "301.063", note: "The commission receives, investigates, conciliates and acts on complaints." }),
    Object.freeze({ section: "301.068", note: "Deferral and referral to a HUD-certified substantially equivalent municipality; the module's only sourced hook for local fair housing enforcement." }),
    Object.freeze({ section: "301.081", note: "(a)-(f) Complaint in writing and under oath on the commission's form; the one-year deadline; 20-day service on respondents." }),
    Object.freeze({ section: "301.082", note: "Ten-day answer." }),
    Object.freeze({ section: "301.083", note: "(a)-(b) Federal referral and deferral; the 100-day investigation and one-year disposition." }),
    Object.freeze({ section: "301.085", note: "Conciliation and its confidentiality." }),
    Object.freeze({ section: "301.088", note: "Reasonable cause determination at 100 days; a charge is issued on a finding of cause." }),
    Object.freeze({ section: "301.090", note: "Land use matters are referred to the attorney general instead of charged." }),
    Object.freeze({ section: "301.091", note: "Dismissal on a finding of no reasonable cause, publicly disclosed." }),
    Object.freeze({ section: "301.092", note: "No charge may issue after a civil trial on the same practice has begun." }),
    Object.freeze({ section: "301.093", note: "Twenty-day election of a judicial determination." }),
    Object.freeze({ section: "301.111", note: "(a)-(c) Administrative hearing under Government Code ch. 2001 absent a timely election." }),
    Object.freeze({ section: "301.112", note: "(a)-(b) Commission relief and the $10,000 / $25,000 / $50,000 civil penalty tiers, taken from the statute's own words." }),
    Object.freeze({ section: "301.114", note: "Within 30 days the findings and order are sent to the licensing agency with a recommendation of disciplinary action - the bridge from a TWC order to TREC discipline." }),
    Object.freeze({ section: "301.131", note: "The attorney general files suit within 30 days on a timely election; venue." }),
    Object.freeze({ section: "301.132", note: "Pattern or practice action; $50,000 and $100,000 penalties." }),
    Object.freeze({ section: "301.151", note: "(a), (c), (d), (e) The two-year private civil action and its two bars." }),
    Object.freeze({ section: "301.153", note: "Actual and punitive damages, attorney's fees, costs and injunctive relief." }),
    Object.freeze({ section: "301.156", note: "Attorney's fees to the prevailing party." }),
    Object.freeze({ section: "301.171", note: "(a)-(b) Intimidation or interference; a Class A misdemeanor." }),
    Object.freeze({ section: "301.065", note: "Read in the same pass; no proposition in the module rests on it." }),
    Object.freeze({ section: "301.066", note: "Read in the same pass; no proposition in the module rests on it." }),
    Object.freeze({ section: "301.067", note: "Read in the same pass; no proposition in the module rests on it." }),
    Object.freeze({ section: "301.069", note: "Read in the same pass; no proposition in the module rests on it." }),
    Object.freeze({ section: "301.070", note: "Read in the same pass; no proposition in the module rests on it." }),
    Object.freeze({ section: "301.084", note: "Read in the same pass; no proposition in the module rests on it." }),
    Object.freeze({ section: "301.086", note: "Read in the same pass; no proposition in the module rests on it." }),
    Object.freeze({ section: "301.087", note: "Read in the same pass; no proposition in the module rests on it." }),
    Object.freeze({ section: "301.089", note: "Read in the same pass; no proposition in the module rests on it." }),
    Object.freeze({ section: "301.113", note: "Read in the same pass; no proposition in the module rests on it." }),
    Object.freeze({ section: "301.115", note: "Read in the same pass; no proposition in the module rests on it." }),
    Object.freeze({ section: "301.133", note: "Read in the same pass; no proposition in the module rests on it." }),
    Object.freeze({ section: "301.152", note: "Read in the same pass; no proposition in the module rests on it." }),
    Object.freeze({ section: "301.154", note: "Read in the same pass; no proposition in the module rests on it." }),
    Object.freeze({ section: "301.155", note: "Read in the same pass; no proposition in the module rests on it." }),
  ],
});

const LG_211 = chapter({
  code: "LG", codeName: "Local Government Code", chapter: "211", title: "Municipal Zoning Authority",
  url: "https://tcss.legis.texas.gov/resources/LG/htm/LG.211.htm",
  localCopy: "texas/trec-sources/statutes/LG.211.htm",
  sha256: "0f3f17ce5e7776a800074fe061214488c0661d33498caae9d560669e76e77902", bytes: 109897, retrievedOn: "2026-08-29",
  reliedOnByUnits: ["T05U1", "T05U2", "T05U3"],
  sectionsRead: [
    Object.freeze({ section: "211.001", note: "Purpose clause - zoning powers are granted 'for the purpose of promoting the public health, safety, morals, or general welfare' and preserving places of historical, cultural or architectural importance. The police-power basis for public land-use regulation. Whole chapter read." }),
    Object.freeze({ section: "211.003", note: "What a municipality may regulate - height and number of stories, size, percentage of lot occupied, yards and open spaces, population density, and the location and use of buildings and land; (a)(6) groundwater pumping where groundwater presents an actual or potential threat to human health, also used in T05U3 as a Texas environmental land-use tool; (b) historic districts; (c) home-rule bulk regulation." }),
    Object.freeze({ section: "211.004", note: "Zoning regulations 'must be adopted in accordance with a comprehensive plan', and the seven design purposes." }),
    Object.freeze({ section: "211.005", note: "Districts; uniformity within a district; variation between districts." }),
    Object.freeze({ section: "211.006", note: "Adoption procedure - no effect until a public hearing; 15-day published and website notice; (a-1) the 10-day written notice with the bold 14-point warning where a use would become nonconforming; and the permissive phrase 'wishing to exercise the authority', used to show that zoning is optional." }),
    Object.freeze({ section: "211.0061", note: "Protest thresholds of 20 percent and 60 percent of area, and the three-fourths governing-body vote required to adopt over a valid protest." }),
    Object.freeze({ section: "211.007", note: "Zoning commission - a home-rule municipality shall and a general-law municipality may appoint one; preliminary report, public hearing and final report; 10-day written notice to owners within 200 feet." }),
    Object.freeze({ section: "211.008", note: "Board of adjustment - appointment, special-exception authority, at least five members, two-year terms, and 75 percent of the members must hear each case." }),
    Object.freeze({ section: "211.009", note: "Authority of the board - appeals from administrative officials; special exceptions; the variance standard (not contrary to the public interest, special conditions, unnecessary hardship, the spirit of the ordinance observed, substantial justice done); (b-1) the hardship grounds keyed to 50 percent of appraised value and 25 percent of developable area; (c) the 75 percent concurring vote." }),
    Object.freeze({ section: "211.010", note: "Twenty-day deadline to appeal to the board; the board must decide not later than the 60th day." }),
    Object.freeze({ section: "211.011", note: "Judicial review by verified petition to a district or county court, filed within 10 days of the decision being filed in the board's office." }),
    Object.freeze({ section: "211.012", note: "Enforcement - misdemeanor, civil penalties, and suits to restrain, correct or abate." }),
    Object.freeze({ section: "211.013", note: "(a) The stricter-standard conflict rule; (c) the subchapter does not apply to land under the jurisdiction of a state or federal agency; (d) it does apply to privately owned land leased to a state agency. Used in T05U2 for the government-as-landowner point." }),
    Object.freeze({ section: "211.015", note: "The voters of a home-rule municipality may repeal the municipality's zoning regulations in their entirety; used to support the statement that zoning is a municipal option." }),
    Object.freeze({ section: "211.019", note: "Nonconforming land use - continuation as of right unless the municipality requires it to stop; (d) the compensation-or-continued-use remedies; (o) no protection where the use was intentionally abandoned for at least six months." }),
    Object.freeze({ section: "211.056", note: "Read together with § 211.057 in the two separately enacted 2025 Subchapter D's, which carry overlapping section numbers as published: chapter 211's new limits on municipal zoning do not prohibit enforcement of property owners' association rules or deed restrictions. Read but ultimately not cited in the final module text; the overlapping numbering is recorded so a later editor does not treat the omission as an oversight." }),
    Object.freeze({ section: "211.057", note: "Read together with § 211.056 in the two separately enacted 2025 Subchapter D's; see the note on § 211.056. Read but not cited." }),
  ],
});

const LG_212 = chapter({
  code: "LG", codeName: "Local Government Code", chapter: "212", title: "Municipal Regulation of Subdivisions and Property Development",
  url: "https://tcss.legis.texas.gov/resources/LG/htm/LG.212.htm",
  localCopy: "texas/trec-sources/statutes/LG.212.htm",
  sha256: "10a44ec937c71ea104f1627f880749ee888dd709da287a1807f79428b5bfebcf", bytes: 256130, retrievedOn: "2026-08-29",
  reliedOnByUnits: ["T05U1", "T05U2"],
  sectionsRead: [
    Object.freeze({ section: "212.001", note: "Definition of 'extraterritorial jurisdiction' by reference to ch. 42, and 'plat', which includes a preliminary, final and replat. Chapter 42 is not held, so the module defines the ETJ only by the cross-reference this subdivision makes." }),
    Object.freeze({ section: "212.002", note: "A municipality may adopt rules governing plats and subdivisions after a public hearing." }),
    Object.freeze({ section: "212.003", note: "Extension of subdivision rules into the extraterritorial jurisdiction, with the express prohibition on regulating use, bulk, height or number, building size or floor-area ratio, and units per acre in the ETJ; (b) no fine or criminal penalty in the ETJ; (c) injunctive relief preserved. Also read for the extension of groundwater ordinances into the ETJ, used in T05U3." }),
    Object.freeze({ section: "212.004", note: "Plat required on division of a tract into two or more parts, however the division is accomplished; the greater-than-five-acres exception; the plat is filed and recorded with the county clerk; and parts 'intended by the owner… to be dedicated to public use', used for dedication in T05U2." }),
    Object.freeze({ section: "212.0045", note: "A municipality may define and classify divisions and need not require platting for every division. Read; not separately cited." }),
    Object.freeze({ section: "212.005", note: "The municipal authority responsible for approving plats 'must approve' a plat that conforms to the requirements." }),
    Object.freeze({ section: "212.006", note: "The approving authority is the planning commission, or the governing body where there is no commission." }),
    Object.freeze({ section: "212.009", note: "Thirty-day decision deadline; a plat is approved by inaction." }),
    Object.freeze({ section: "212.0091", note: "Written statement of conditions or reasons; it must be directly related to the subchapter, cite the law relied on, and may not be arbitrary." }),
    Object.freeze({ section: "212.0093", note: "Applicant's response to conditional approval or disapproval; no municipal deadline may be set. Read; not separately cited." }),
    Object.freeze({ section: "212.010", note: "(a) Approval standards; (c) no forced dedication of a future street that the owner did not intend and that is not in an adopted capital improvement plan; (e) mandamus plus attorney's fees for refusal of a conforming plat." }),
    Object.freeze({ section: "212.011", note: "Approval of a plat is not acceptance of a dedication until actual appropriation by entry, use or improvement; disapproval is a refusal of the offered dedication. Core of the dedication teaching in T05U2." }),
    Object.freeze({ section: "212.0115", note: "Certificate issued on plat approval." }),
    Object.freeze({ section: "212.012", note: "Utility providers may not serve or connect land without that certificate, subject to the exceptions the section states." }),
    Object.freeze({ section: "212.014", note: "Replat without vacating the preceding plat; a replat may not amend or remove covenants or restrictions." }),
    Object.freeze({ section: "212.015", note: "Additional replat requirements, notice, and the 20 percent protest and three-fourths vote. Read; not separately cited in the final text." }),
    Object.freeze({ section: "212.018", note: "General enforcement by injunction or damages. Read; not separately cited." }),
    Object.freeze({ section: "212.043", note: "Read as one of the development-plat sections the T05 record lists together (§§ 212.043-212.045: development plat subchapter definitions and requirement)." }),
    Object.freeze({ section: "212.044", note: "Read with §§ 212.043 and 212.045 as the development-plat definitions-and-requirement group." }),
    Object.freeze({ section: "212.045", note: "Read with §§ 212.043 and 212.044 as the development-plat definitions-and-requirement group." }),
    Object.freeze({ section: "212.049", note: "No municipal building permits and no building-code enforcement in the extraterritorial jurisdiction. Cited." }),
    Object.freeze({ section: "212.151", note: "Municipalities covered by the deed-restriction-enforcement subchapter - a population of 1.5 million or more with a qualifying ordinance, and a municipality 'that does not have zoning ordinances' with a qualifying ordinance. Core support for the Texas structure in which zoning is optional." }),
    Object.freeze({ section: "212.152", note: "The broad definition of the 'restriction' a covered municipality may enforce." }),
    Object.freeze({ section: "212.153", note: "Municipal suit to enjoin or abate a violation of a recorded restriction; (b) a property owners' association suit displaces the municipality's; (e) no municipal enforcement of a deed restriction against public-utility rights in easements and rights-of-way, used in T05U2." }),
    Object.freeze({ section: "212.154", note: "Restrictions predating August 30, 1965. Read; not cited." }),
    Object.freeze({ section: "212.155", note: "Notice to purchasers of restricted property that a municipality may require." }),
    Object.freeze({ section: "212.156", note: "Enforcement by ordinance and civil penalty; discriminatory provisions are excluded from 'restrictions'." }),
    Object.freeze({ section: "212.157", note: "A municipal enforcement suit is a governmental function. Read; not cited." }),
  ],
});

const NR_21 = chapter({
  code: "NR", codeName: "Natural Resources Code", chapter: "21", title: "Surveys and Surveyors",
  url: "https://tcss.legis.texas.gov/resources/NR/htm/NR.21.htm",
  localCopy: "texas/trec-sources/statutes/NR.21.htm",
  sha256: "31c106ae7cd383c0e39c3d04b665dac6153e36d373002208b7b8c815f7ed7a8b", bytes: 29873, retrievedOn: "2026-08-27",
  reliedOnByUnits: ["T05U2"],
  sectionsRead: [
    Object.freeze({ section: "21.001", note: "Definitions, including 'navigable stream' as 'a stream which retains an average width of 30 feet from the mouth up'." }),
    Object.freeze({ section: "21.011", note: "Surveys of public land must be made under authority of law by a duly appointed, elected, or licensed and qualified surveyor." }),
    Object.freeze({ section: "21.012", note: "Surveys on navigable streams - the land fronts one-half of the square on the stream at right angles to its general course, and '[a] navigable stream may not be crossed by the lines of a survey'. The module asserts nothing about who owns a streambed, only what this section says about survey lines." }),
    Object.freeze({ section: "21.013", note: "Surveys not on a navigable stream are square as far as prior lines permit. Read; not cited." }),
  ],
});

const WA_11 = chapter({
  code: "WA", codeName: "Water Code", chapter: "11", title: "Water Rights",
  url: "https://tcss.legis.texas.gov/resources/WA/htm/WA.11.htm",
  localCopy: "texas/trec-sources/statutes/WA.11.htm",
  sha256: "24e3aca8e73bf7cad479fcb3dbc2a088e29fab2db235e9f00c66f1c059156a45", bytes: 424135, retrievedOn: "2026-08-27",
  reliedOnByUnits: ["T05U2", "T05U3"],
  sectionsRead: [
    Object.freeze({ section: "11.021", note: "State water - the ordinary flow, underflow and tides of every flowing river, natural stream and lake, every bay or arm of the Gulf of Mexico, and the storm, flood and rainwater of every watershed 'is the property of the state'." }),
    Object.freeze({ section: "11.022", note: "The right to use state water is acquired by appropriation." }),
    Object.freeze({ section: "11.023", note: "The purposes for which state water may be appropriated, plus 'any other beneficial use'." }),
    Object.freeze({ section: "11.0235", note: "The waters of the state 'are held in trust for the public'; appropriation only as expressly authorized by law; the environmental flows policy." }),
    Object.freeze({ section: "11.033", note: "Eminent domain - political subdivisions and constitutional governmental agencies exercising delegated legislative powers hold the power, and domestic and municipal supply is 'primary and fundamental'." }),
    Object.freeze({ section: "11.035", note: "Condemnation of private property by an appropriator; (b) damages 'assessed and paid for as provided by the statutes of this state relating to eminent domain'; (d)-(e) commission investigation, notice, hearing, and institution of proceedings in the name of the State of Texas." }),
    Object.freeze({ section: "11.086", note: "No person may divert or impound the natural flow of surface waters in a manner that damages another's property by overflow; the injured owner has remedies at law and in equity and may recover damages." }),
  ],
});

const BC_17 = chapter({
  code: "BC", codeName: "Business and Commerce Code", chapter: "17", title: "Deceptive Trade Practices (subchapter E, the DTPA)",
  url: "https://tcss.legis.texas.gov/resources/BC/htm/BC.17.htm",
  localCopy: "texas/trec-sources/statutes/BC.17.htm",
  sha256: "33fdf21e31dba579c3e95972f6c9fef82f1582f2b83a2d7d883d1b216cd54d1f", bytes: 193909, retrievedOn: "2026-08-29",
  reliedOnByUnits: ["T07U5"],
  sectionsRead: [
    Object.freeze({ section: "17.41", note: "Short title - the Deceptive Trade Practices-Consumer Protection Act." }),
    Object.freeze({ section: "17.42", note: "Waivers are void as against public policy, with the three-element exception, the counsel-selection disqualifier in (b), and the form and typeface requirements in (c)." }),
    Object.freeze({ section: "17.43", note: "Remedies are cumulative; a violation of another law is not itself a DTPA violation." }),
    Object.freeze({ section: "17.44", note: "(a) Liberal construction and the statute's stated purposes; (b) Property Code ch. 27 prevails over the subchapter to the extent of any conflict. Chapter 27 is not held, so the module reports the cross-reference exactly as (b) states it and makes no claim about ch. 27's content." }),
    Object.freeze({ section: "17.45", note: "Definitions - (1) 'goods', which includes real property purchased or leased for use; (2) 'services'; (4) 'consumer', with the $25 million business-consumer exclusion; (5) 'unconscionable action or course of action'; (6) 'trade' and 'commerce'; (9) 'knowingly', including the inference clause; (10) 'business consumer'; (11) 'economic damages'; (12) 'residence'; (13) 'intentionally', including both inference clauses." }),
    Object.freeze({ section: "17.46", note: "(a) The general declaration that false, misleading or deceptive acts or practices in the conduct of trade or commerce are unlawful; (b) the laundry list, read in full, with (b)(5), (7), (12), (14), (20) and (24) taught as the items a license holder is most likely to meet; (d) the limitation of the term to enumerated subdivisions for private relief under § 17.50(a)(1). Subdivision (b)(26) is referenced only as one of the § 17.49(c) carve-outs, without describing the annuity conduct it covers." }),
    Object.freeze({ section: "17.49", note: "Exemptions, read at (a)-(i). Taken: (c) the professional services exemption and its carve-outs; (e) bodily injury, death and mental anguish; (f) the exemption for a written contract over $100,000 where the consumer is represented by counsel, with the residence carve-out; (g) the over-$500,000 exemption with the residence carve-out; and above all (i), the exemption for a claim against a ch. 1101 broker or salesperson arising from an act or omission while acting as such, with its three exceptions - express misrepresentation of a material fact, failure to disclose in violation of § 17.46(b)(24), and an unconscionable action." }),
    Object.freeze({ section: "17.50", note: "Relief for consumers - (a)(1)-(4) the causes of action, the producing-cause standard and the detrimental reliance element; (b)(1) economic damages, the 'knowingly' tier (mental anguish plus up to three times economic damages) and the 'intentionally' tier (mental anguish plus up to three times combined mental anguish and economic damages); (b)(2)-(4) other relief; (c) fees to a defendant for a groundless or bad-faith action; (d) mandatory costs and fees to a prevailing consumer; (e) exclusions from the additional-damages computation; (g) Civil Practice and Remedies Code ch. 41 is inapplicable; (h) read for context." }),
    Object.freeze({ section: "17.505", note: "Notice and inspection - (a) the 60-day written pre-suit notice and its required contents; (b) the impracticability and counterclaim exceptions; (c)-(e) plea in abatement, automatic abatement on the 11th day, and abatement until the 60th day after proper service." }),
    Object.freeze({ section: "17.5051", note: "Motion to compel mediation within 90 days of service of the pleading. Read; referenced only in an earlier draft and not relied on in the final text." }),
    Object.freeze({ section: "17.5052", note: "Offers of settlement - (a) the 60-day tender window; (d) the two separately stated components; (e) 30-day acceptance or rejection; (g)-(h) the damages and fee caps where the tender matches or exceeds the finding; (k) a tender is not an admission." }),
    Object.freeze({ section: "17.506", note: "Defenses - (a)(1)-(3) reliance on written information from government records, from another source, or from a government-prescribed test, with the pre-consummation written notice requirement; (b) producing-cause proof; (c) suit against the third-party supplier without privity; (d) the 30-day full-tender defense." }),
    Object.freeze({ section: "17.565", note: "Two-year limitations period running from the act or from discovery, with the 180-day extension." }),
  ],
});

const BC_26 = chapter({
  code: "BC", codeName: "Business and Commerce Code", chapter: "26", title: "Statute of Frauds",
  url: "https://tcss.legis.texas.gov/resources/BC/htm/BC.26.htm",
  localCopy: "texas/trec-sources/statutes/BC.26.htm",
  sha256: "e2c23d1a446796b7083157d2940094e660e14ca660670665ff5a801a8bd1a708", bytes: 9473, retrievedOn: "2026-08-27",
  reliedOnByUnits: ["T04U1", "T04U3"],
  sectionsRead: [
    Object.freeze({ section: "26.01", note: "A promise or agreement within the section is not enforceable unless it is in writing and signed by the person to be charged - including, at (b)(5), 'a lease of real estate for a term longer than one year'." }),
  ],
});

const FI_343 = chapter({
  code: "FI", codeName: "Finance Code", chapter: "343", title: "Home Loans",
  url: "https://tcss.legis.texas.gov/resources/FI/htm/FI.343.htm",
  localCopy: "texas/trec-sources/statutes/FI.343.htm",
  sha256: "94dee3bf7cdc8a41037310f5c138cabdfc21377240ebd251f29ef9be8f755e38", bytes: 32565, retrievedOn: "2026-08-27",
  reliedOnByUnits: ["T02U1", "T02U2", "T02U3", "T02U4", "T02U5", "T02U6", "T02U7"],
  sectionsRead: [
    Object.freeze({ section: "343.001", note: "Definitions - (1) 'bridge loan', temporary or short-term financing requiring payment of only interest until the entire unpaid balance is due; (2) 'home loan', a loan to individuals for personal, family or household purposes secured wholly or partly by a manufactured home or by real property improved by a dwelling for four or fewer families used or to be used as the borrower's principal residence; (3) 'restructure', a change in the payment schedule or other terms as a result of the borrower's default." }),
    Object.freeze({ section: "343.002", note: "(a) Applicability to a loan extended to a person located in this state at the time the loan is made; (b) the chapter does not apply to a reverse mortgage or to an open-end account as defined by § 301.002." }),
    Object.freeze({ section: "343.003", note: "The chapter controls over conflicting provisions of the title." }),
    Object.freeze({ section: "343.101", note: "Read and reported as EXPIRED - the low-rate home loan refinancing restriction, with the file's note that the section expired September 1, 2003 notwithstanding the September 13, 2003 voter approval. Its definition of a low-rate loan, using the fully indexed or fully stepped-up rate instead of a discounted introductory rate, is quoted in T02U4 as the Legislature's drafting choice and expressly identified there as an expired provision." }),
    Object.freeze({ section: "343.102", note: "Read and reported as EXPIRED - counseling-related disclosures for home loans at 12 percent or greater a year; subsection (b) states 'This section expires September 1, 2003'." }),
    Object.freeze({ section: "343.103", note: "(a)-(e) Disclosure of mortgage information to a surviving spouse within 30 days of a compliant request; the four categories of information; the death certificate, disinterested-witness affidavit (Estates Code § 203.002 form) and residency affidavit proof requirements; the required bold, capitalised and underlined Gramm-Leach-Bliley notice text; and the servicer's immunity for complying." }),
    Object.freeze({ section: "343.104", note: "Restrictions on single premium credit insurance and the prescribed applicant notice, delivered by hand or mail not later than the third business day after the application is received; the notice text is quoted in part - optional coverage, a single premium financed at the loan rate, and 30-day cancellation for a full refund or credit." }),
    Object.freeze({ section: "343.105", note: "(a)-(d) Notice of penalties for making a false or misleading written statement - required of '[a] lender, mortgage banker, or licensed mortgage broker' at closing; a separate document in at least 14-point type; the Penal Code § 32.32 warning with the two-to-99-year and $10,000 language; the applicant's representations as to identity, employment, annual income and intent to occupy; the applicant must verify and execute it; failure does not affect the validity or enforceability of the loan. Subsection (a) is the held anchor for the three-way originator taxonomy in T02U1." }),
    Object.freeze({ section: "343.106", note: "(a)-(g) Payoff statements - Finance Commission rulemaking and the prescribed standard form; at least seven business days for the servicer to respond; the form must state the proposed closing date and a payoff amount valid through it; the servicer may not demand more than the stated payoff on or before that date; a correction deadline of the second business day before closing with certified-mail and electronic delivery; and the consequences of an understated payoff, including continuing mortgagor liability, release or subordination, and a constructive trust over proceeds disbursed to or for the mortgagor." }),
    Object.freeze({ section: "343.108", note: "(a)-(e) Release of lien within 60 days after receipt of the correct payoff amount, shortened to 30 days after a written request made on or before the 20th day after payoff; ch. 349 is inapplicable; the servicer's duty is conditioned on authority to deliver or file." }),
    Object.freeze({ section: "343.201", note: "(1)(A)-(E), (2) High-cost home loan definition, including the principal-amount ceiling at one-half 'the maximum conventional loan amount for first mortgages as established and adjusted by the Federal National Mortgage Association' and the incorporation by reference of 12 C.F.R. §§ 1026.32, 1026.2, 1026.32(a)(1)(i)-(ii) and 1026.32(b), 'as amended'. This is the sole held anchor naming Fannie Mae and is used in T02U2, T02U5, T02U6 and T02U7; it establishes only that a maximum conventional loan amount exists and who adjusts it, and the module states no figure." }),
    Object.freeze({ section: "343.202", note: "Balloon payment restriction - no scheduled payment more than twice the average of the earlier scheduled monthly payments unless due at least 60 months after the date of the loan; the seasonal or irregular income and bridge loan exceptions." }),
    Object.freeze({ section: "343.203", note: "Negative amortization is prohibited in the regular periodic payment schedule of a high-cost home loan, with the temporary forbearance, bridge loan and borrower-sought restructure exception." }),
    Object.freeze({ section: "343.204", note: "(a) Definition of 'obligor'; (b) prohibition on a pattern or practice of collateral-based lending without regard to repayment ability, including current and expected income, current obligations, employment status and other financial resources other than the equity in the dwelling." }),
    Object.freeze({ section: "343.205", note: "Prepayment penalties are prohibited on a high-cost home loan." }),
    Object.freeze({ section: "343.206", note: "No charge may be made for a service or product the borrower does not receive." }),
  ],
});

const US15_1601 = federal({
  citation: "15 U.S.C. § 1601", title: "Truth in Lending Act - congressional findings and declaration of purpose", publisher: "uscode.house.gov",
  url: "https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1601&num=0&edition=prelim",
  localCopy: "texas/trec-sources/federal/us15-1601.html",
  sha256: "8447beacf59dc009b55be5f4b58f24c95836eb76df0b9aa94d68d7825a616df1", bytes: 203390, retrievedOn: "2026-08-29",
  reliedOnByUnits: ["T02U7", "T02U9"],
  sectionsRead: [
    Object.freeze({ section: "1601", note: "(a) Quoted in full - TILA's mechanism is the meaningful disclosure of credit terms so the consumer can compare terms and avoid the uninformed use of credit, which Congress ties to economic stabilization and to competition among creditors; the only held anchor for the module's macroeconomic framing. (b) The Consumer Leasing Act purpose - meaningful disclosure of personal property lease terms, comparison with credit terms, and limiting balloon payments in consumer leasing. The Short Title statutory notes were read and used ONLY to name amending acts by their statutory short titles and public law numbers: the Fair Credit Billing Act (Pub. L. 93-495, title III), the Truth in Lending Simplification and Reform Act (Pub. L. 96-221, title VI), the Home Equity Loan Consumer Protection Act of 1988 (Pub. L. 100-709), the Home Ownership and Equity Protection Act of 1994 (Pub. L. 103-325, title I, subtitle B), the Mortgage Disclosure Improvement Act of 2008 (Pub. L. 110-289, div. B, title V), the Mortgage Reform and Anti-Predatory Lending Act (Pub. L. 111-203, title XIV, § 1400(a)), and the note establishing that title VII of Pub. L. 90-321, added by Pub. L. 94-239 § 1(b), may be cited as the Equal Credit Opportunity Act." }),
  ],
});

const US12_2601 = federal({
  citation: "12 U.S.C. § 2601", title: "Real Estate Settlement Procedures Act - congressional findings and purpose", publisher: "uscode.house.gov",
  url: "https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title12-section2601&num=0&edition=prelim",
  localCopy: "texas/trec-sources/federal/us12-2601.html",
  sha256: "ea0a6edcbbbcfde427d58404733e8161fbb4b25ae2f124ffe999a902365939e1", bytes: 154001, retrievedOn: "2026-08-27",
  reliedOnByUnits: ["T02U5", "T02U7", "T02U9"],
  sectionsRead: [
    Object.freeze({ section: "2601", note: "(a) Findings - reforms are needed so consumers receive greater and more timely information on the nature and costs of the settlement process and are protected from unnecessarily high settlement charges caused by certain abusive practices; the subsection refers to the joint 'Mortgage Settlement Costs' report of the Secretary of Housing and Urban Development and the Administrator of Veterans' Affairs, used in T02U5 ONLY to establish that these federal offices exist and were named by Congress, not to state any FHA or VA program term. (b)(1)-(4) Quoted in full - the four statutory purposes: advance disclosure of settlement costs, elimination of kickbacks or referral fees, reduction of escrow amounts, and reform and modernization of local land title recordkeeping. The Change of Name note (Pub. L. 100-527 § 10) was read: a reference to the Administrator of Veterans' Affairs is deemed to refer to the Secretary of Veterans Affairs." }),
  ],
});

const US12_2603 = federal({
  citation: "12 U.S.C. § 2603", title: "RESPA - uniform settlement statement", publisher: "uscode.house.gov",
  url: "https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title12-section2603&num=0&edition=prelim",
  localCopy: "texas/trec-sources/federal/us12-2603.html",
  sha256: "849fe719b51be6afb48e45c0c5bb3d496c46ba40a899b84f28c5db24300ece92", bytes: 157543, retrievedOn: "2026-08-27",
  reliedOnByUnits: ["T02U9"],
  sectionsRead: [
    Object.freeze({ section: "2603", note: "(a) Quoted - the Bureau shall publish 'a single, integrated disclosure for mortgage loan transactions' combining this section's and § 2604's requirements with those of the Truth in Lending Act, to facilitate compliance and aid borrower understanding; the forms must conspicuously and clearly itemize all charges imposed on the borrower and on the seller and indicate whose interest a title insurance premium covers. Used as the statutory basis for the integrated TILA-RESPA disclosures. (b) The forms are completed and made available for inspection at or before settlement by the person conducting the settlement; Bureau exemptions; borrower waiver; and the borrower's right to inspect known items on the business day immediately preceding settlement. (c) Optional disclosure, where an appraisal was coordinated by an appraisal management company, of the fee paid directly to the appraiser and the company's administration fee. The section directs the Bureau to publish an integrated disclosure but does not name or print the Loan Estimate or Closing Disclosure or state their timing, and the module says so expressly." }),
  ],
});

const US12_2607 = federal({
  citation: "12 U.S.C. § 2607", title: "RESPA - prohibition against kickbacks and unearned fees", publisher: "uscode.house.gov",
  url: "https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title12-section2607&num=0&edition=prelim",
  localCopy: "texas/trec-sources/federal/us12-2607.html",
  sha256: "f04f0af9e186d042a7b8ab9637cadc8c466ca93e4a5d455ad53a953412ccb507", bytes: 160088, retrievedOn: "2026-08-27",
  reliedOnByUnits: ["T02U1", "T02U5", "T02U9"],
  sectionsRead: [
    Object.freeze({ section: "2607", note: "(a) Quoted in full - no person shall give and no person shall accept any fee, kickback or thing of value pursuant to any agreement or understanding, oral or otherwise, that settlement service business involving a federally related mortgage loan shall be referred to any person. (b) Quoted in full - no giving or accepting any portion, split or percentage of a charge for a settlement service other than for services actually performed. (c)(1)-(5) The exceptions: fees to attorneys for services actually rendered; a title company to its duly appointed agent for services actually performed in issuing a title policy; a lender to its duly appointed agent for services actually performed in making a loan; bona fide salary or compensation for goods or facilities actually furnished or services actually performed; payments pursuant to cooperative brokerage and referral arrangements between real estate agents and brokers; affiliated business arrangements meeting the (c)(4)(A)-(C) conditions (disclosure with a written estimate at or before referral, no required use, and only a return on an ownership interest or franchise relationship); and other payments specified by Bureau regulation. Also read: the sentence excluding lender-chosen attorney, credit reporting agency and appraiser arrangements and attorney-arranged title insurance from the (4)(B) required-use condition. (d)(1)-(6) A criminal fine of not more than $10,000 or imprisonment of not more than one year or both; joint and several liability for three times the charge paid; a bona fide error defense limited to (c)(4)(A); injunction actions by the Bureau, the Secretary, or a State attorney general or insurance commissioner with the Bureau holding primary enforcement authority; court costs and reasonable attorney's fees to a prevailing party; and no preemption of more stringent State limits on affiliated business arrangements." }),
  ],
});

const CFR_1024 = federal({
  citation: "12 C.F.R. part 1024 (Regulation X)", title: "RESPA Regulation X, subpart B", publisher: "eCFR API, title 12, as of 2026-08-01",
  url: "https://www.ecfr.gov/api/versioner/v1/full/2026-08-01/title-12.xml?part=1024&subpart=B",
  localCopy: "texas/trec-sources/federal/ecfr-12cfr1024.xml",
  sha256: "2df23a9029b5bfa2d12dbc38073b1fc1541f2c19a01c4b6f0a4cef8411f398b8", bytes: 90113, retrievedOn: "2026-08-27",
  reliedOnByUnits: ["T02U1", "T02U3", "T02U7", "T02U9"],
  sectionsRead: [
    Object.freeze({ section: "1024.6", note: "(a)(1)-(3), (b)-(d) Special information booklet within three business days of application; the broker distributes it where a mortgage broker is used; no booklet if the application is denied within the period; the excepted transaction categories (refinancings, closed-end subordinate-lien loans, reverse mortgages, and any federally related mortgage loan whose purpose is not the purchase of a one- to four-family residence); and the reproduction and permissible-change rules. Used for the broker/lender role split in T02U1 and the application-package duties in T02U3." }),
    Object.freeze({ section: "1024.7", note: "(a)(1)-(5), (g), (h), (i) Good faith estimate within three business days of application; the lender may charge only a credit report fee as a condition of providing the GFE; the GFE is not a loan commitment; open-end home-equity plans are satisfied by the 12 C.F.R. § 1026.40 disclosures; and cure of a tolerance violation within 30 days after settlement." }),
    Object.freeze({ section: "1024.8", note: "(a), (b)(1), (b)(2) Use of the HUD-1 or HUD-1A in every RESPA-covered settlement unless exempted; the exemption for open-end home-equity plans; the itemization requirements; and the average-charge rules." }),
    Object.freeze({ section: "1024.10", note: "(a)-(e) The borrower's right to inspect the completed settlement statement on the business day immediately preceding settlement; delivery; waiver; exempt transactions; and five-year retention." }),
    Object.freeze({ section: "1024.12", note: "No fee may be imposed for preparing and distributing the HUD-1 or HUD-1A, the escrow account statements required under 12 U.S.C. § 2609, or the Truth in Lending statements." }),
    Object.freeze({ section: "1024.14", note: "(a)-(i) Section 8 implementation - no referral fees; no split of charges except for services actually performed; the broad 'thing of value' definition, quoted at length in T02U9; an 'agreement or understanding' may be established by practice, pattern or course of conduct; the definition of 'referral'; the permitted payments in (g)(1)(i)-(vii), including the narrowing note in (g)(1)(v) that the cooperative brokerage exemption covers only fee divisions within real estate brokerage arrangements where all parties act in a brokerage capacity and has no applicability to fee arrangements between real estate brokers and mortgage brokers; (g)(2) on payments bearing no reasonable relationship to market value; (g)(3) requiring that additional services be 'actual, necessary and distinct'; and five-year recordkeeping." }),
    Object.freeze({ section: "1024.15", note: "(a), (b)(1)-(3) Affiliated business arrangement conditions; the separate-piece-of-paper disclosure; and the bona fide error proviso with the statement that an error of legal judgment is not a bona fide error." }),
    Object.freeze({ section: "1024.16", note: "Title companies; the § 2608 required-use cross-reference. Read for context; no proposition taken." }),
    Object.freeze({ section: "1024.17", note: "(a), (b) definitions, (c)(1)(i)-(ii), (c)(2)-(4), (c)(7), (c)(8) Escrow account definitions (escrow account, servicer-controlled; cushion; shortage; deficiency; surplus; target balance; escrow account computation year; annual and initial escrow account statements); the one-sixth cushion limit and the one-twelfth monthly accrual; mandatory aggregate accounting; and the servicer estimation rules, including use of the prior year's charge, CPI-limited adjustment, and comparable-property assessment for unassessed new construction. Used in T02U1 to establish the servicer as a distinct regulated actor and in T02U7 for the new-construction escrow-shortage explanation." }),
    Object.freeze({ section: "1024.20", note: "(a)(1)-(3), (b), (c)(1) Homeownership counseling list within three business days of application; the list must be obtained no earlier than 30 days before delivery from the Bureau website or Bureau/HUD data; a broker or dealer may deliver it but the lender is responsible for ensuring delivery; the HELOC timing alternative; and the reverse mortgage exemption." }),
  ],
});

const US15_1691 = federal({
  citation: "15 U.S.C. § 1691", title: "Equal Credit Opportunity Act - scope of prohibition", publisher: "uscode.house.gov",
  url: "https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1691&num=0&edition=prelim",
  localCopy: "texas/trec-sources/federal/us15-1691.html",
  sha256: "be6f84e9e3ab51dffcc9c71446a698d4b7f1026b1ad5106b3dbeca7a294cf9d9", bytes: 174749, retrievedOn: "2026-08-29",
  reliedOnByUnits: ["T02U2", "T02U3", "T02U7", "T02U9", "T08U4"],
  sectionsRead: [
    Object.freeze({ section: "1691", note: "(a)(1)-(3) Quoted in full - it is unlawful to discriminate against any applicant with respect to any aspect of a credit transaction on the basis of race, color, religion, national origin, sex or marital status, or age (provided the applicant has the capacity to contract); because all or part of the applicant's income derives from a public assistance program; or because the applicant has in good faith exercised a right under the chapter. Basis for the class-list comparison against 42 U.S.C. § 3604 and Property Code ch. 301. (b)(1)-(5) Activities not constituting discrimination - a marital-status inquiry to ascertain the creditor's rights and remedies; an age or public-assistance inquiry to determine the amount and probable continuance of income or other elements of creditworthiness; empirically derived, demonstrably and statistically sound credit systems that consider age but may not assign an elderly applicant a negative factor or value; inquiry into or consideration of an elderly applicant's age used in the applicant's favor; and § 1691c-2 inquiries. Basis for the teaching point that the question may be lawful while the use of the answer is not. (c)(1)-(3) Refusal of credit under an authorized credit assistance program for an economically disadvantaged class, a nonprofit-administered program, or a qualifying special purpose credit program is not a violation where required by or made pursuant to the program. (d)(1)-(6) Thirty-day notification of action on a COMPLETED application; entitlement to a statement of reasons and the two compliance routes with their 60-day request and 30-day response windows; the requirement that a statement contain the specific reasons; third-party requested credit; the 150-application verbal-statement allowance; and the definition of 'adverse action', including denial, revocation, a change in the terms of an existing arrangement, or refusal to grant credit in substantially the amount or on substantially the terms requested, with the delinquency and credit-limit exclusions. (e)(1)-(6) Copies of appraisals and valuations on dwelling first-lien applications, promptly on completion and no later than 3 days before closing, whether credit is granted, denied, incomplete or withdrawn; waiver of the 3-day timing; a reimbursement fee is permitted but the copy is at no additional cost; written notice of the right at application; and the definition of 'valuation', including values developed pursuant to a policy of a government sponsored enterprise or by an automated valuation model or broker price opinion - the (e)(6) definition being the sole held anchor for the term 'government sponsored enterprise' used in T02U2 and T02U7. Notes read: the Short Title note (the subchapter is known as the Equal Credit Opportunity Act); the Congressional Findings and Statement of Purpose note (Pub. L. 93-495, § 502, 1974), whose original sex-and-marital-status framing is quoted in T08U4; and the 1976 amendments note (Pub. L. 94-239), the sole basis for the statement that race, color, religion, national origin and age were added in 1976 along with clauses (2) and (3). Subsections (d)(4) and (d)(5) and Executive Order 14331 printed in the file's Executive Documents were read and deliberately not relied on." }),
  ],
});

const US42_3601 = federal({
  citation: "42 U.S.C. § 3601", title: "Fair Housing Act - declaration of policy", publisher: "uscode.house.gov",
  url: "https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title42-section3601&num=0&edition=prelim",
  localCopy: "texas/trec-sources/federal/us42-3601.html",
  sha256: "12cecfd10170f694065345302cd3ec8a06f4c0a4049614f3d7c21bb4a0660c1f", bytes: 151816, retrievedOn: "2026-08-29",
  reliedOnByUnits: ["T08U1"],
  sectionsRead: [
    Object.freeze({ section: "3601", note: "Full text of the declaration of policy, quoted verbatim - 'It is the policy of the United States to provide, within constitutional limitations, for fair housing throughout the United States' - used to establish that § 3601 states an objective only and creates no prohibition. The source credit (Pub. L. 90-284, title VIII, § 801, Apr. 11, 1968) dates the Act. Notes read and relied on: the Short Title note (Pub. L. 90-284 'may be cited as the Civil Rights Act of 1968' and its title VIII 'may be cited as the Fair Housing Act'); the Effective Date of 1988 Amendment note (Pub. L. 100-430 § 13(a)), supporting the statement that the 1988 amendments took effect on the 180th day beginning after September 13, 1988; the Short Title of 1988 Amendment note identifying Pub. L. 100-430 as the Fair Housing Amendments Act of 1988; and the Short Title of 1995 Amendment note (Pub. L. 104-76), supporting the statement that the Housing for Older Persons Act of 1995 amended § 3607 - nothing about the CONTENT of § 3607 was taken from this note. The remaining notes in the file (Separability, Disclaimer of Preemptive Effect, Initial Rulemaking, Federally Protected Activities) were read; no proposition was taken from them." }),
  ],
});

const US42_3602 = federal({
  citation: "42 U.S.C. § 3602", title: "Fair Housing Act - definitions", publisher: "uscode.house.gov",
  url: "https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title42-section3602&num=0&edition=prelim",
  localCopy: "texas/trec-sources/federal/us42-3602.html",
  sha256: "6a17c0d6df0b561337bb3173eee953d6b1b255ed65a75477d8a88f3f476e7daa", bytes: 151733, retrievedOn: "2026-08-29",
  reliedOnByUnits: ["T08U1", "T08U2", "T08U3", "T08U4"],
  sectionsRead: [
    Object.freeze({ section: "3602", note: "Verified single-section file. (a) 'Secretary' means the Secretary of Housing and Urban Development, used to identify who makes the § 3607(b)(2)(A) determination and issues the § 3607(b)(2)(C)(iii) rules. (b) 'Dwelling', quoted in full including 'portion thereof' and vacant land offered for sale or lease for residential construction - the basis for the two consequences drawn in T08U1 (a rented room is a dwelling; a residential lot is a dwelling) and for the comparison with Property Code § 301.003(8). (c) 'Family' includes a single individual, quoted, compared with § 301.003(9) and used to warn against confusing 'family' with familial status. (d) 'Person', quoted in full - the sole federal basis for the statement that an individual agent is personally a 'person' bound by §§ 3604 and 3605, paired with § 301.003(12). (e) 'To rent', quoted; the basis for the statement that a sublease is inside the Act. (f) 'Discriminatory housing practice' means an act unlawful under §§ 3604, 3605, 3606 or 3617, quoted - the module names §§ 3606 and 3617 ONLY because this definition does, and says expressly that neither was held and that their contents are not stated. (h) 'Handicap', quoted in full including all three prongs and the controlled-substance exclusion; the basis for the 'regarded as' teaching point and for the comparison with Property Code § 301.003(6), including the observation that the two Texas-only exclusions are not in § 3602. (i) 'Aggrieved person', quoted, with both the claimed-injury and anticipated-injury clauses. (k) 'Familial status', quoted in full including the closing sentence extending protection to a pregnant person and one 'in the process of securing legal custody'; the basis for the familial-status passage in T08U1 and for the statement that the federal and Texas classes match (§ 301.004). The Transvestism note (§ 6(b)(3) of Pub. L. 100-430) was quoted as the sole basis for the statement that the federal transvestism point sits in a note rather than in § 3602's own text. Subsections (g), (j), (l), (m), (n) and (o) were read in the same pass and are NOT relied on: they serve the federal enforcement sections, which are not held." }),
  ],
});

const US42_3603 = federal({
  citation: "42 U.S.C. § 3603", title: "Fair Housing Act - effective dates of certain prohibitions and the owner exemptions", publisher: "uscode.house.gov",
  url: "https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title42-section3603&num=0&edition=prelim",
  localCopy: "texas/trec-sources/federal/us42-3603.html",
  sha256: "1a8383b2416f976e13a705c0340d43567671104e4d026daee2cb9441a21b1a64", bytes: 147561, retrievedOn: "2026-08-29",
  reliedOnByUnits: ["T08U1", "T08U2"],
  sectionsRead: [
    Object.freeze({ section: "3603", note: "Verified single-section file. (a) Opening words quoted - 'Subject to the provisions of subsection (b) and section 3607 of this title, the prohibitions against discrimination in the sale or rental of housing set forth in section 3604 of this title shall apply.' (a)(1)(A)-(D) The four categories of federally connected housing covered on enactment - federally owned or operated; federally aided under post-November 20, 1962 agreements; federally insured, guaranteed or credit-secured, with the FDIC/FSLIC mortgage proviso; and slum-clearance or urban-renewal redevelopment property - summarized as historical staging and not as a limit on the modern statute. (a)(2) Quoted - 'After December 31, 1968, to all dwellings covered by paragraph (1) and to all other dwellings except as exempted by subsection (b)'; the sole basis for the operative statement that § 3604 reaches all dwellings except as § 3603(b) or § 3607 excepts. (b) Opening words quoted - 'Nothing in section 3604 of this title (other than subsection (c)) shall apply to-'; the sole federal basis for the rule that no § 3603(b) exemption ever reaches § 3604(c), that is, that there is no federal exemption from fair housing advertising law. (b)(1) The single-family-house-sold-or-rented-by-an-owner exemption with all four provisos quoted: the three-house ceiling; the beneficial-interest anti-evasion ceiling; the one-sale-in-any-24-month-period limit for an owner not residing in and not the most recent resident of the house; and the post-December 31, 1969 condition that the sale or rental be made (A) without the use 'in any manner' of a broker's, agent's or salesman's facilities or services or those of any person in the business of selling or renting dwellings, and (B) without publication, posting or mailing of an advertisement or written notice 'in violation of section 3604(c)', together with the closing clause preserving attorneys, escrow agents, abstractors and title companies. Basis for the statement that a license holder's involvement destroys the exemption and that a discriminatory advertisement destroys it as well. (b)(2) The rooms-or-units-in-an-owner-occupied-dwelling exemption, quoted in full, with the four elements identified in the module (no more than four families; living independently of each other; owner occupancy of one of the living quarters; occupancy as the owner's residence, reinforced by 'actually maintains and occupies'); the module notes that 'Mrs. Murphy' is an industry name absent from the statute and cites nothing for it. (c)(1)-(3) The definition of a person 'in the business of selling or renting dwellings' for purposes of subsection (b) - three or more transactions as principal in the preceding twelve months; two or more as agent in the preceding twelve months other than the sale of the person's own personal residence; or ownership of a dwelling designed or intended for or occupied by five or more families - quoted, as the basis for the point that the thresholds are low. Source credit (Pub. L. 90-284, title VIII, § 803, Apr. 11, 1968). The file carries no statutory notes beyond the source credit, so nothing about later amendment of § 3603 is asserted." }),
  ],
});

const US42_3604 = federal({
  citation: "42 U.S.C. § 3604", title: "Fair Housing Act - discrimination in the sale or rental of housing", publisher: "uscode.house.gov",
  url: "https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title42-section3604&num=0&edition=prelim",
  localCopy: "texas/trec-sources/federal/us42-3604.html",
  sha256: "1c35aca0cc53d430dcb4b100669730aff179d589b7d208593552b6c61a3fee9b", bytes: 156930, retrievedOn: "2026-08-29",
  reliedOnByUnits: ["T08U1", "T08U3", "T08U4", "T09U2"],
  sectionsRead: [
    Object.freeze({ section: "3604", note: "Opening clause - 'As made applicable by section 3603 of this title and except as exempted by sections 3603(b) and 3607 of this title, it shall be unlawful-'; the sole basis for the statements that § 3603 sets the section's reach and that §§ 3603(b) and 3607 hold the exemptions. (a) Refusal to sell or rent after a bona fide offer, refusal to negotiate, and 'otherwise make unavailable or deny'; six bases, no handicap; basis for the refusal-to-deal and steering analysis. (b) Discrimination in 'terms, conditions, or privileges' and in 'services or facilities'; the same six bases. (c) The advertising, notice and statement prohibition; seven bases including handicap; the verbs 'make, print, or publish, or cause to be' and the 'indicates any preference, limitation, or discrimination' test. (d) Representing that a dwelling is unavailable when it is in fact available; seven bases. (e) Blockbusting - 'For profit, to induce or attempt to induce… by representations regarding the entry or prospective entry into the neighborhood.' (f)(1) and (f)(2) Handicap discrimination in sale or rental and in terms and services, reaching the buyer or renter, a person who will reside there, and 'any person associated with' them. (f)(3)(A) Reasonable modification, quoted in full - the source of the 'at the expense of the handicapped person', 'full enjoyment of the premises' and interior-restoration proviso points. (f)(3)(B) Reasonable accommodation, quoted in full - the source of the 'rules, policies, practices, or services' and 'equal opportunity to use and enjoy a dwelling' points and of the fact that the clause contains no expense or restoration language. (f)(3)(C) Design and construction requirements and the four adaptive-design features (read for context in T09U2). (f)(4) ANSI A117.1 compliance suffices for the adaptive-design features. (f)(7) Definition of 'covered multifamily dwellings' - buildings of four or more units with an elevator, and ground-floor units in other buildings of four or more units. (f)(8) Preserves state and local law affording greater access. (f)(9) The direct-threat provision, quoted. Amendments notes (1974 Pub. L. 93-383; 1988 Pub. L. 100-430 §§ 6(a), 6(b)(1), 6(b)(2)) are the sole basis for the account of when 'sex', 'familial status' and 'handicap' entered which subsections and why the subsection lists differ. Subsections (f)(5) and (f)(6) were read in the same pass; no proposition rests on them. This file contains § 3604 only - verified by grep that only cross-reference strings, not section text, appear for §§ 3602, 3603, 3605, 3606 and 3607." }),
  ],
});

const US42_3605 = federal({
  citation: "42 U.S.C. § 3605", title: "Fair Housing Act - discrimination in residential real estate-related transactions", publisher: "uscode.house.gov",
  url: "https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title42-section3605&num=0&edition=prelim",
  localCopy: "texas/trec-sources/federal/us42-3605.html",
  sha256: "5f202d6edca34bbc878036cfa25c24a9440575d97845ba934ff3d06abc83ab08", bytes: 146904, retrievedOn: "2026-08-29",
  reliedOnByUnits: ["T08U2", "T08U3", "T08U4", "T08U5"],
  sectionsRead: [
    Object.freeze({ section: "3605", note: "Verified single-section file. (a) Quoted in full - the basis for the four points drawn in T08U4: who is covered ('any person or other entity whose business includes engaging in residential real estate-related transactions'); the two-stage prohibition ('in making available such a transaction, or in the terms or conditions of such a transaction'); the seven bases, including handicap and familial status, which § 3604(a) omits; and the absence of any intent or knowledge word. (b)(1)(A), (b)(1)(B), (b)(2) The definition of 'residential real estate-related transaction', quoted in full - the basis for the points that purchasing loans and not only making them is covered, that 'other financial assistance' reaches beyond loans, that (1)(B) supplies an independent route for anything 'secured by residential real estate', and above all that '[t]he selling, brokering, or appraising of residential real property' is named, so a license holder's own services are inside the federal section by name. (c) The appraisal provision, quoted in full; the module states what it permits ('factors other than' the listed characteristics) and states expressly that it is not an exemption for appraisers and does not remove appraising from § 3605(b)(2), comparing it with Property Code § 301.042(c). The 1988 amendments note (Pub. L. 100-430) records that the section was 'amended… generally' and prints the pre-1988 text, which reached only banks, building and loan associations, insurance companies and other enterprises making commercial real estate loans - the sole basis for the statement that the covered-persons language was widened in 1988 and the source of the quoted predecessor language. The 1974 amendments note (Pub. L. 93-383) records the insertion of ', sex' after 'religion'. Source credit (Pub. L. 90-284, title VIII, § 805, Apr. 11, 1968)." }),
  ],
});

const US42_3607 = federal({
  citation: "42 U.S.C. § 3607", title: "Fair Housing Act - religious organization, private club and housing for older persons exemptions", publisher: "uscode.house.gov",
  url: "https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title42-section3607&num=0&edition=prelim",
  localCopy: "texas/trec-sources/federal/us42-3607.html",
  sha256: "c70a72fdf4e6235af19b426400d6cb1243badcfd9d493ca8ea9a757cf3b5e6ea", bytes: 152858, retrievedOn: "2026-08-29",
  reliedOnByUnits: ["T08U1", "T08U2"],
  sectionsRead: [
    Object.freeze({ section: "3607", note: "Verified single-section file. (a) Quoted in full, both sentences - the religious organization exemption with its three built-in limits (dwellings the organization owns or operates; operated 'for other than a commercial purpose'; and the proviso withdrawing the exemption where membership in the religion 'is restricted on account of race, color, or national origin'), and the private club exemption with its limits ('not in fact open to the public', lodging provided 'as an incident to its primary purpose', 'for other than a commercial purpose'); compared with Property Code § 301.042(a), (a-1), (b). (b)(1) Both sentences - occupancy-limit restrictions are preserved, and '[n]or does any provision in this subchapter regarding familial status apply with respect to housing for older persons'; the sole basis for the emphasis that the exemption removes the familial-status provisions ONLY, leaving race, color, religion, sex, national origin and handicap fully applicable in a seniors community; the occupancy-limit sentence is compared with Property Code § 301.044(a). (b)(2)(A) Program housing determined by the Secretary, quoted. (b)(2)(B) 'Intended for, and solely occupied by, persons 62 years of age or older', quoted. (b)(2)(C) with clauses (i), (ii), (iii)(I) and (iii)(II) - the 55-and-over structure, quoted in full: intent and operation for occupancy by persons 55 or older; at least 80 percent of the OCCUPIED units occupied by at least one person 55 or older; published and adhered-to policies and procedures; and compliance with the Secretary's occupancy-verification rules, which must provide for verification by reliable surveys and affidavits and include examples of relevant policies and procedures, with those surveys and affidavits admissible. Basis for the (B)/(C) contrast, including the point that the 80 percent denominator is occupied units. (b)(3)(A) and (B) The two savings provisions, quoted - pre-September 13, 1988 residents who do not meet the age requirements, provided new occupants do; and unoccupied units reserved for qualifying occupants. (b)(4) The controlled-substance conviction provision, quoted in full, used as the federal counterpart to Property Code § 301.021(c); Texas places the rule inside the sale-and-rental prohibition while Congress places it in the exemptions section, where it reaches the subchapter. (b)(5)(A), (B)(i), (B)(ii) The good-faith reliance shield against personal liability for monetary damages and the exclusive two-element method of showing that reliance ('may ONLY show… by showing that'), including the requirement of a formal written statement of compliance from the facility or community - the basis for the module's statutory instruction to obtain the written statement. The 1995 amendments note (Pub. L. 104-76, §§ 2, 3) was used only to confirm that the quoted text is the post-1995 text; the module does not state the contents of the superseded pre-1995 subparagraph (C), which the note prints. The Codification note translating 'the date of enactment of this Act' in (b)(3)(A) to September 13, 1988 was read and is the basis for the module's use of that date. Source credit (Pub. L. 90-284, title VIII, § 807, Apr. 11, 1968; Pub. L. 100-430; Pub. L. 104-76). The Regulations note reproducing Pub. L. 102-550 § 919 was read and deliberately NOT used, because the phrase it defines belongs to the pre-1995 version of subparagraph (C) and no HUD rule was held." }),
  ],
});

const US12_2901 = federal({
  citation: "12 U.S.C. § 2901", title: "Community Reinvestment Act - congressional findings and purpose", publisher: "uscode.house.gov",
  url: "https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title12-section2901&num=0&edition=prelim",
  localCopy: "texas/trec-sources/federal/us12-2901.html",
  sha256: "a9f81e2d4b83e7bfb8b66ed668d54d6b53d39656e19c47b1ae8241f532a6da05", bytes: 146929, retrievedOn: "2026-08-29",
  reliedOnByUnits: ["T08U5"],
  sectionsRead: [
    Object.freeze({ section: "2901", note: "(a)(1)-(3) The three findings, quoted in full, including the 'continuing and affirmative obligation to help meet the credit needs of the local communities in which they are chartered'. (b) The purpose, quoted in full; the basis for every statement about the examination mechanism, the word 'encourage', and the 'consistent with the safe and sound operation' limit. Notes read: the Short Title note (Pub. L. 95-128, § 801, the Community Reinvestment Act of 1977); the note reproducing Pub. L. 106-102 § 715 (1999), the source of the phrase 'services in low- and moderate-income neighborhoods and for persons of modest means', which the module attributes to this note rather than to § 2901's findings; and the note reproducing Pub. L. 102-550 § 910 (1992) on the report comparing lending in 'low-income, minority, and distressed neighborhoods' to other neighborhoods. The module says plainly that nothing in § 2901 creates an individual borrower's claim, which is a statement about what the held text contains." }),
  ],
});

export const STATUTE_CHAPTERS = Object.freeze([
  OC_1101, OC_1103, PR_5, PR_91, PR_92, PR_202, PR_301, LG_211, LG_212, NR_21, WA_11, BC_17, BC_26, FI_343,
]);

export const FEDERAL_SOURCES = Object.freeze([
  US15_1601, US15_1691, US12_2601, US12_2603, US12_2607, CFR_1024, US12_2901,
  US42_3601, US42_3602, US42_3603, US42_3604, US42_3605, US42_3607,
]);

/**
 * Units that need no legal source, and why. A unit is not "uncovered" because no statute governs it
 * — arithmetic and appraisal vocabulary are governed by neither — but saying so has to be deliberate,
 * so each one is named with the reason its own read record gives rather than silently omitted.
 */
export const NO_STATUTE_REQUIRED = Object.freeze([
  Object.freeze({
    unit: "T01U1",
    reason: "Calculators - arithmetic method and calculator handling. The T01 read record states that NO source was opened for module 01 and that this is deliberate: no Texas statute, TREC rule or federal law prescribes the order of operations, a rounding convention, the behaviour of a calculator's percent or memory keys, or an estimation technique. The unit asserts no legal proposition, and the module's front matter says so.",
  }),
  Object.freeze({
    unit: "T01U2",
    reason: "Fractions and Percentages - the part/whole/rate relationship applied to commission rates, splits, list-to-sale price ratios and fractional ownership shares as arithmetic only. The T01 read record states that no held source sets, caps or standardises any of those figures, that every dollar figure and percentage in the module is an invented illustration chosen to make the arithmetic visible, and that the module says so twice and states expressly that none is a required, customary or standard figure.",
  }),
  Object.freeze({
    unit: "T03U4",
    reason: "Value - the economic principles of the unit (supply and demand, substitution, conformity, contribution, anticipation, change, progression and regression, plottage and assemblage, externalities) and the definitions of market value, cost, price, highest and best use and the four characteristics of value. The T03 read record records these as made deliberately as practice and not law: no Texas statute enacts them, ch. 1103 defines only 'appraisal' and the credential terms, and the remainder is the analytical vocabulary of the discipline, taught as such with nothing cited for it.",
  }),
  Object.freeze({
    unit: "T03U5",
    reason: "Three Approaches to Value - the three approaches and their vocabulary (the three forms of depreciation, gross living area, comparable, adjustment), taught as professional method, together with every numeric example: the adjustment grid and its adjustment rates, the cost-approach figures, the GRM table and the capitalization statement. The T03 read record records each as labelled illustrative in the module text and none as a required or statutory figure, with nothing cited for any of them.",
  }),
]);

export const ALL_SOURCES = Object.freeze([...STATUTE_CHAPTERS, ...FEDERAL_SOURCES]);

/**
 * The honest counterpart to the register: the substantive gaps the read records record — things the
 * course had to teach around because no source was held for them.
 *
 * `affectedUnits` names a unit only where the record supports it: either the record's own gap text
 * names the unit, or the gap was recorded under a SOURCE block, in which case the units relying on
 * that source are named. Where a record states a gap at topic level without tying it to a unit, the
 * array is deliberately EMPTY rather than filled in by inference.
 */
export const GAPS = Object.freeze([
  Object.freeze({ id: "tx-const-art-xvi-sec-50", gap: "Texas Constitution art. XVI § 50 (home equity lending) is not a held source. The T02 record calls this the single largest gap in the financing topic: the best-known feature of Texas home lending cannot be taught from held sources. The module states this expressly in the Texas Loan Programs unit, states none of the constitutional home equity conditions, and directs the student to the constitutional text or current lender materials.", affectedUnits: ["T02U6"] }),
  Object.freeze({ id: "texas-assistance-and-bond-programs", gap: "No held source states the eligibility criteria, income or purchase-price limits, assistance amounts, rates or administering rules of any Texas Veterans Land Board, Texas Department of Housing and Community Affairs, Texas State Affordable Housing Corporation, mortgage credit certificate or local down-payment assistance program. The module names the categories only and states no figures. The only held anchor is Property Code § 5.062(b)(2)(A), which names the Veterans' Land Board in excluding its land sales from executory-contract regulation.", affectedUnits: ["T02U6"] }),
  Object.freeze({ id: "fha-and-va-program-terms", gap: "No held source states FHA maximum LTVs, minimum down payments, mortgage insurance premium rates or durations, or loan limits, and none states VA entitlement amounts, guaranty percentages, funding fees or eligibility criteria. Held sources establish only that these federal offices exist (12 U.S.C. § 2601(a), the Change of Name note to § 2601, and 12 U.S.C. § 2607(c)(5)).", affectedUnits: ["T02U5"] }),
  Object.freeze({ id: "conventional-loan-limits-and-pmi", gap: "No held source states the dollar amount of the conforming loan limit, the LTV threshold at which private mortgage insurance is required, PMI premium rates, or PMI termination rules. Finance Code § 343.201(1)(C) establishes only that a maximum conventional loan amount for first mortgages exists and is established and adjusted by the Federal National Mortgage Association.", affectedUnits: ["T02U5"] }),
  Object.freeze({ id: "gse-charter-and-status", gap: "Only Fannie Mae appears in a held source, and only in Finance Code § 343.201(1)(C); 15 U.S.C. § 1691(e)(6) is the sole held anchor for the term 'government sponsored enterprise'. No held source states the governing statutes, ownership, conservatorship status or supervisory arrangements of Fannie Mae, Freddie Mac, Ginnie Mae or the FHFA. The module describes their market function, says the course holds no source for their legal status, and instructs the student not to represent any entity's status to a client.", affectedUnits: ["T02U2", "T02U7"] }),
  Object.freeze({ id: "federal-reserve-system", gap: "No held source states the Federal Reserve's structure, powers or policy tools. The module presents the rate-transmission mechanism as economics rather than law and cites nothing for it; the one held anchor for the macroeconomic framing is 15 U.S.C. § 1601(a).", affectedUnits: [] }),
  Object.freeze({ id: "loan-estimate-and-closing-disclosure", gap: "12 U.S.C. § 2603(a) directs the Bureau to publish a single, integrated disclosure but neither names nor prints the resulting forms, and the held Regulation X excerpt (12 C.F.R. part 1024, subpart B) retains the pre-integration GFE and HUD-1 architecture rather than the integrated-disclosure rules, which sit in Regulation Z (12 C.F.R. part 1026 - NOT held). The module names the two forms as the ones the market uses under § 2603(a)'s direction and states neither their content nor their timing.", affectedUnits: ["T02U1", "T02U3", "T02U7", "T02U9"] }),
  Object.freeze({ id: "credit-scoring", gap: "No held source states any credit scoring model, score range or lender threshold. The module describes scores in general terms only and instructs the license holder never to quote a threshold as a rule; the one held anchor is 15 U.S.C. § 1691(b)(3) on empirically derived credit systems that consider age.", affectedUnits: [] }),
  Object.freeze({ id: "assumability-and-due-on-sale", gap: "Property Code ch. 5 governs the executory contract and the encumbered-conveyance disclosure but states no rule on the assumability of an existing note or on due-on-sale clauses, and no other held source does. The module treats assumability as a question of the loan documents and program rules and cites nothing.", affectedUnits: ["T02U5", "T02U6", "T02U8"] }),
  Object.freeze({ id: "underwriting-documentation-standards", gap: "No held source prescribes income or asset documentation or states the 'three Cs' framework. The module presents both as industry practice; the one adjacent held rule is Finance Code § 343.204(b), which prohibits collateral-based lending without regard to repayment ability on high-cost home loans.", affectedUnits: [] }),
  Object.freeze({ id: "equity-sharing", gap: "No held source addresses equity sharing arrangements. The module states no rule for them and instead routes the student to two held provisions that may apply - Property Code § 5.062(a)(2) (a lease plus an option is an executory contract) and Occupations Code § 1101.652(b)(16) (undisclosed principal).", affectedUnits: ["T02U8"] }),
  Object.freeze({ id: "credit-unions", gap: "No held source describes credit union chartering or the cooperative membership structure. The module says so and treats the description as an account of institutional form rather than a legal rule.", affectedUnits: [] }),
  Object.freeze({ id: "aqb-criteria-talcb-rules-and-uspap-not-held", gap: "Occupations Code ch. 1103 states no qualifying-education hour counts, no experience hour counts, no calendar-year experience periods, no examination passing score, and no property-type or transaction-value limits per credential tier: §§ 1103.152, 1103.202(2)-(3) and 1103.256 delegate all of these to the Appraiser Qualifications Board's criteria as adopted by TALCB rule. Neither the TALCB rules (22 TAC ch. 153) nor the AQB Real Property Appraiser Qualification Criteria is held, and USPAP itself is not held. The module states the delegation explicitly, gives no numbers, describes USPAP only to the extent §§ 1103.154 and 1103.405 describe it, and quotes or paraphrases no USPAP text.", affectedUnits: ["T03U1", "T03U2", "T03U3", "T03U6"] }),
  Object.freeze({ id: "cma-and-bpo-content-not-prescribed", gap: "Occupations Code ch. 1101 contains no provision prescribing the content, format or retention of a comparative market analysis or broker price opinion. The module teaches CMA construction and disclosure as practice, says so expressly, and cites no statute for it; § 1103.405(c)'s notice provision is described as reaching appraisers' evaluations under § 1103.004(4) and (5) and expressly NOT as imposing that requirement on a license holder's CMA.", affectedUnits: ["T03U3", "T03U6"] }),
  Object.freeze({ id: "prins2-1-form-not-a-held-source", gap: "The PRINS 2-1 course approval form itself was not read as a source by the module authors: unit and topic names, the prescribed minutes, and the subchapter list beneath 'Subchapter A - General Provisions' came from the authoring assignment. The modules cite 22 TAC § 535.64 for the fact that the form is adopted by reference. (The separate transcription in config/texas/principles-ii-course-form.mjs was made from the held PDF and carries its own hash.)", affectedUnits: [] }),
  Object.freeze({ id: "leasehold-estate-labels-not-statutory", gap: "The four leasehold estates - tenancy for years, periodic tenancy, tenancy at will, tenancy at sufferance - are not defined as such in any held Texas source. The module says so expressly, presents the four labels as general property-law doctrine, and anchors every operative Texas rule (creation, termination, notice, holdover) to a statute that was read. The landlord's reversion is likewise presented as estate doctrine, supported only by Occupations Code § 1101.002(5)'s inclusion of a leasehold within 'real estate'.", affectedUnits: [] }),
  Object.freeze({ id: "property-code-ch-24-not-held", gap: "Property Code ch. 24 (forcible entry and detainer, that is, eviction procedure) is not among the held sources. Both the leases module and the property management module therefore describe eviction only through the ch. 92 provisions that were read (§§ 92.0081(b) 'except by judicial process', 92.331(b)(1), 92.332(b), 92.335) and state no eviction notice periods, filing steps, timelines or appeal deadlines.", affectedUnits: [] }),
  Object.freeze({ id: "commercial-lease-structures-not-held", gap: "No held source addresses commercial lease rent structures. Gross, modified gross, single/double/triple/absolute net, percentage, ground, index and sale-leaseback leases are taught as commercial practice and market vocabulary, expressly labelled as such, with the module telling the student that their meaning comes from the lease document and not from a statute. The only statutory anchor used is Property Code § 92.332(a)(1), which recognizes an escalation clause for utilities, taxes or insurance as a non-retaliatory reason for a rent increase.", affectedUnits: ["T04U5"] }),
  Object.freeze({ id: "leasing-commission-rates-not-held", gap: "No held source sets leasing commission rates or the customary structure of leasing compensation. The unit states the common Texas practice explicitly as practice and cites nothing for it.", affectedUnits: ["T04U2"] }),
  Object.freeze({ id: "trec-forms-and-trust-account-rules-not-held", gap: "No TREC promulgated or approved lease form, no model Texas property management agreement, and no TREC rule on trust accounts or property management is among the held sources. No held source prescribes the mechanics of a property management trust account - reconciliation intervals, record retention, permitted operating balances or account-titling requirements. The modules name no form numbers and ground the handling of other people's money solely in Occupations Code § 1101.652(b)(9), (10), (30) and (31), stating the rest as ordinary administrative practice without citing a rule number.", affectedUnits: [] }),
  Object.freeze({ id: "federal-environmental-statutes-not-held", gap: "CERCLA/Superfund, the Clean Water Act wetlands program, the federal lead-based paint disclosure rule for pre-1978 target housing, the asbestos and radon programs, underground storage tank regulation and the Endangered Species Act were NOT provided as held sources. The module teaches these as concepts only, cites NO section numbers for any of them, and states expressly that scope, thresholds, exemptions, deadlines and the exact contents of any required federal disclosure must be verified against the current federal authority. The single date stated (pre-1978 housing for lead-based paint) is presented as widely known and subject to that same caveat.", affectedUnits: ["T05U3"] }),
  Object.freeze({ id: "constitutional-eminent-domain-text-not-read", gap: "Neither the Texas Constitution nor the United States Constitution is a held source. The module describes the public-use and just-compensation elements of a taking as doctrine, cites no constitutional provision, and attributes concrete mechanics only to Water Code §§ 11.033 and 11.035, which were read.", affectedUnits: [] }),
  Object.freeze({ id: "property-code-ch-21-not-read", gap: "Property Code ch. 21 (eminent domain procedure) was not read for this course and is not cited. A PR.21.htm file exists in the statutes directory, but holding is not reading, so it is not registered here. The module consequently states NO condemnation procedure mechanics - no bona fide offer requirement, no special commissioners, no award or objection deadlines, no relocation provisions.", affectedUnits: [] }),
  Object.freeze({ id: "escheat-no-held-source", gap: "No Texas escheat statute (Property Code chs. 71-72, or the Estates Code descent provisions) was read for this course. The module states the escheat doctrine in a single sentence, states plainly that no source read for this course sets out the Texas procedure, asserts no waiting period, filing requirement or agency name, and refers the student to the title company and counsel.", affectedUnits: [] }),
  Object.freeze({ id: "county-land-use-authority-no-held-source", gap: "Local Government Code ch. 232 (county subdivision regulation) was not read for this course. The module states only the negative proposition it can support from ch. 211 - that ch. 211 grants zoning power to municipalities and not to counties, so unincorporated land is not zoned under that chapter - and makes no affirmative claim about what a Texas county may or may not regulate.", affectedUnits: [] }),
  Object.freeze({ id: "houston-stated-as-common-knowledge", gap: "The statement that Houston is a large Texas city without conventional use-district zoning is labelled in the module as common knowledge rather than law, is expressly flagged as not stated by any source read for this course, and carries no citation. The statutory structure that makes it possible (Local Government Code §§ 211.006(a), 211.015 and 212.151) is cited instead.", affectedUnits: [] }),
  Object.freeze({ id: "poa-procedure-and-resale-certificates-not-held", gap: "Property Code ch. 209 (property owners' association governance and assessment and enforcement procedure) and ch. 207 (resale certificates) are not held sources. The module states no POA fine procedure, hearing right, cure period, assessment-lien foreclosure mechanics or resale-certificate contents. The § 5.012 statutory notice read for the module refers on its face to § 207.003 and to resale certificates; the module quotes only the recording-and-county-clerk language of that notice.", affectedUnits: ["T05U1"] }),
  Object.freeze({ id: "etj-extent-ch-42-not-held", gap: "Local Government Code ch. 42 (determination of the extraterritorial jurisdiction) is not a held source, so the module defines the ETJ only by the cross-reference § 212.001(1) makes and asserts no acreage or mileage rule for its extent.", affectedUnits: ["T05U1", "T05U2"] }),
  Object.freeze({ id: "trec-fees-exam-score-and-testing-service", gap: "No held source states current TREC fee amounts, the examination passing score, the number of examination questions, or the identity of the current testing service. None of those is asserted. Occupations Code § 1101.152 delegates fee amounts to Commission rule and no fee rule was read; Subchapter I contains no passing score and the module says so. The only dollar figures asserted as law are ones read in the statute itself: §§ 1101.154, 1101.302, 1101.355(a)(2), 1101.457(b), 1101.610 and 1101.702(a).", affectedUnits: [] }),
  Object.freeze({ id: "trade-organizations-not-held", gap: "No held source covers the National Association of REALTORS, Texas REALTORS, local boards, the REALTOR collective membership mark, MLS rules, or any association code of ethics. The unit states all of that as practice and cites nothing for it, and states expressly that no held source makes membership a condition of licensure. Its only citations are Occupations Code §§ 1101.002(4), 1101.804, 1101.053(a) and 1101.801.", affectedUnits: ["T06U3"] }),
  Object.freeze({ id: "value-economics-frameworks-not-held", gap: "No held source supports the economic frameworks in the Real Estate - The Business of Value unit: the four elements of value (demand, utility, scarcity, transferability), the price/cost/value distinction, and the four components of the license holder's economic function. These are stated as analytical conventions and economics, not as legal rules, and the module says so in its opening line.", affectedUnits: ["T06U4"] }),
  Object.freeze({ id: "common-law-agency-doctrine-not-in-trela", gap: "TRELA contains no statutory statement of the common-law routes by which an agency is created (express, implied, ratification, estoppel), of actual versus apparent authority, or of the modes by which an agency terminates; the module teaches these as general agency and common-law principles and says so rather than citing ch. 1101 for them. TRELA also contains no express provision stating which fiduciary duties survive termination of the agency - the module makes only the textual observation that §§ 1101.652(b)(9), (10), (30), (31) and 1101.651(d)(3) are not by their terms limited to a live agency - and no general confidentiality section outside the intermediary context.", affectedUnits: ["T07U1", "T07U2", "T07U3", "T07U4", "T07U5"] }),
  Object.freeze({ id: "trec-rules-on-iabs-text-and-team-names-not-held", gap: "The Commission rules governing the text and delivery of the information-about-brokerage-services notice under Occupations Code § 1101.558(b-2), and the rules on registration of assumed, alternate and team names, are not among the held sources; TRELA has no 'team name' provision. The module states only what the statute says and says the rest is rule territory it does not reproduce. The IABS form itself is not held, so the module describes the notice only by the contents § 1101.558(b-1) requires.", affectedUnits: ["T07U1", "T07U2", "T07U3", "T07U4", "T07U5"] }),
  Object.freeze({ id: "property-code-ch-27-not-held", gap: "Property Code ch. 27, which DTPA § 17.44(b) makes controlling over the subchapter in case of conflict, is not a held source; the module reports the cross-reference exactly as § 17.44(b) states it and makes no claim about ch. 27's content. No held source supplies Texas case law construing 'consumer', 'producing cause' or the professional-services and broker exemptions, so the module teaches only the statutory text and asserts no judicial gloss.", affectedUnits: ["T07U5"] }),
  Object.freeze({ id: "brokerage-business-practice-not-law", gap: "Business practice with no held legal source, stated in the module as practice and cited to nothing: independent contractor engagement of sales agents, commission splits, desk, transaction and franchise fees, the 'employment contract' characterization of listing and representation agreements, and team marketing beyond what Occupations Code § 1101.652(b)(23) supplies.", affectedUnits: [] }),
  Object.freeze({ id: "usc-3606-and-3617-not-held", gap: "42 U.S.C. § 3606 (brokerage services) is NOT held, and neither is 42 U.S.C. § 3617 (interference). The module names both only where 42 U.S.C. § 3602(f) names them, states expressly that they were not held, and does not paraphrase either. Brokerage-access discrimination is taught instead from Property Code § 301.027, which was read in full.", affectedUnits: ["T08U1", "T08U2"] }),
  Object.freeze({ id: "cra-2902-2906-not-held", gap: "12 U.S.C. §§ 2902-2906 are NOT held - verified by grep that the held file contains no occurrence of 2902, 2903, 2904, 2905 or 2906. The assessment-area rules, the written public evaluation, the performance rating categories and the use of a CRA record in applications are therefore stated nowhere in the module; the unit says expressly that those sections were not held and directs the student to read them.", affectedUnits: ["T08U5"] }),
  Object.freeze({ id: "ecoa-1691a-1691f-and-regulation-b-not-held", gap: "15 U.S.C. §§ 1691a-1691f (the definitions of 'creditor' and 'applicant', the Bureau's rulemaking authority, enforcement and civil liability) are NOT held, and neither is Regulation B. The module refers to 'the Bureau' as § 1691 itself does, says expressly that the Bureau is defined outside the held text, and asserts no ECOA definition, remedy, penalty, limitations period or agency enforcement structure.", affectedUnits: ["T08U4"] }),
  Object.freeze({ id: "federal-fair-housing-enforcement-not-held", gap: "Federal fair housing enforcement procedure is not held - 42 U.S.C. §§ 3610-3614 were in no held file. The module gives the Texas complaint path from Property Code ch. 301 in detail and states expressly that it cannot supply the federal filing deadline or federal election procedure. The enforcement-facing definitions in § 3602 ('complainant', 'respondent', 'conciliation', 'conciliation agreement', 'prevailing party') were read but are not used, because the sections they serve are not held.", affectedUnits: [] }),
  Object.freeze({ id: "hud-rules-under-3607-not-held", gap: "No HUD rule or Secretarial determination under 42 U.S.C. § 3607(b)(2) is held. Both § 3607(b)(2)(A) (program housing the Secretary determines is designed to assist elderly persons) and § 3607(b)(2)(C)(iii) (the Secretary's occupancy-verification rules) turn on HUD action. The module quotes the statutory conditions, including the 80 percent figure that is in the statute itself, and describes no rule and names no determined program.", affectedUnits: ["T08U1", "T08U2"] }),
  Object.freeze({ id: "no-texas-municipal-fair-housing-ordinance-held", gap: "No Texas municipal fair housing ordinance is held, although the topic's scope note names local law. The module handles this by teaching Property Code § 301.068 (referral to a HUD-certified substantially equivalent municipality) and § 301.044(b), naming no city and asserting no local protected class, and by telling the student to read the ordinance of the city they work in.", affectedUnits: [] }),
  Object.freeze({ id: "no-twc-rule-under-ch-301-held", gap: "No Texas Workforce Commission rule under Property Code ch. 301 is held. Where the statute defers to commission rules (for example §§ 301.043(3) and 301.062) the module quotes the statute and stops. This is made a teaching point in its own right: the federal 55-and-over threshold is in 42 U.S.C. § 3607(b)(2)(C)(i) and can be quoted, while the Texas equivalent in § 301.043(2) runs through commission rules that were not read, so the module states the federal figure and not a Texas one.", affectedUnits: ["T08U1"] }),
  Object.freeze({ id: "trec-advertising-rules-not-held", gap: "The TREC advertising rules (22 TAC § 535.155) are not held and are not cited. The module's advertising guidance rests on 42 U.S.C. § 3604(c) and Property Code § 301.022, with the 'describe the property, not the people' habit expressly labelled practice rather than law.", affectedUnits: ["T08U3", "T08U4"] }),
  Object.freeze({ id: "property-management-agreement-form-not-held", gap: "No promulgated or model Texas property management agreement is held. The unit teaches the terms such an agreement must settle as drafting practice and business allocation, expressly saying so for indemnification and insurance, and cites statute only for Occupations Code §§ 1101.652(b)(12), 1101.652(b)(13) and 1101.557(c)(1).", affectedUnits: ["T09U2"] }),
  Object.freeze({ id: "property-management-designations-not-held", gap: "No held source establishes, requires or regulates any property management designation or trade body. The unit states expressly that no Texas statute read for this course requires any designation or membership, cites nothing for their existence or value, and names no particular organisation.", affectedUnits: ["T09U3"] }),
  Object.freeze({ id: "property-and-liability-insurance-not-held", gap: "The held insurance source for this project, Insurance Code ch. 2501, covers title insurance only - and it was not read for this course at all. No held source governs property or liability insurance for rental property, so the unit treats insurance in general business terms and states that the allocation is contract rather than statute.", affectedUnits: ["T09U2"] }),
  Object.freeze({ id: "fair-housing-enforcement-mechanics-not-read-for-t09", gap: "Subchapters D through I of Property Code ch. 301 (administration, complaints, conciliation, judicial enforcement) were not read for the property management module, which makes no claim about how a fair housing complaint is filed, investigated or adjudicated. It teaches only the substantive prohibitions in §§ 301.021, 301.022, 301.024 and 301.025, their federal counterparts in 42 U.S.C. § 3604, and the licensing consequence in Occupations Code § 1101.652(b)(32).", affectedUnits: [] }),
  Object.freeze({ id: "illustrative-figures-are-not-sourced", gap: "Every dollar figure, percentage, rate and worked example in this course that is not read from a statute is an invented illustration, labelled as such in the module text. No held source prescribes a commission rate or split, an adjustment rate, a capitalisation rate, a gross rent multiplier, a rent, a vacancy allowance, a management fee or an expense ratio, and none is asserted as a required, customary or standard figure.", affectedUnits: [] }),
  Object.freeze({ id: "sources-read-without-a-manifest-hash", gap: "Three things a read record names as READ are not registered above, because .prins2-drafts/HELD-SOURCE-HASHES.txt carries no hash for them and this file may not invent one: 22 TAC § 535.55 (T06 relies on it for the 180-hour qualifying-education breakdown and the inactive-sales-agent sponsorship rule), 22 TAC § 535.64 (T03 and T06 read it, T06 relying on it for the adoption of the PRINS 2-1 form by reference), and 22 TAC § 535.65 plus the TREC explanatory article 'What Changes in 2026 About Buyer/Tenant Representation in Texas' (T03 and T07 respectively). Every unit those records tie to them - T03U1-T03U3 and T03U6, T06U2, T06U5, T06U6, T07U2 and T07U3 - is independently held through Occupations Code chs. 1101 and 1103, so no unit's coverage depends on them. Registering an unhashed source would defeat the point of the register.", affectedUnits: [] }),
]);

export const SECTIONS_READ = Object.freeze(
  ALL_SOURCES.flatMap((entry) => entry.sectionsRead.map((s) => Object.freeze({ ...s, sourceId: entry.id, jurisdiction: entry.jurisdiction, citation: entry.citation }))),
);

/** Every PRINS2-1 unit either has a source read for it or is named as needing none. */
export function unitCoverage(allUnitCodes) {
  const held = new Set(ALL_SOURCES.flatMap((entry) => entry.reliedOnByUnits));
  const excused = new Set(NO_STATUTE_REQUIRED.map((entry) => entry.unit));
  return Object.freeze({
    held: Object.freeze(allUnitCodes.filter((code) => held.has(code))),
    excused: Object.freeze(allUnitCodes.filter((code) => !held.has(code) && excused.has(code))),
    uncovered: Object.freeze(allUnitCodes.filter((code) => !held.has(code) && !excused.has(code))),
  });
}

export default Object.freeze({ STATUTE_CHAPTERS, FEDERAL_SOURCES, ALL_SOURCES, NO_STATUTE_REQUIRED, GAPS, SECTIONS_READ, unitCoverage });
