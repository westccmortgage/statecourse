import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const reviewDate = "2026-08-16";

const nationalCore = [
  ["NC-OWN", "Ownership and interests", "Real and personal property, estates, concurrent ownership, encumbrances, legal descriptions, and land-use foundations."],
  ["NC-CON", "Contracts", "Formation, enforceability, performance, breach, remedies, contingencies, purchase agreements, and leases."],
  ["NC-AGY", "Agency and brokerage relationships", "Creation and termination of relationships, duties, compensation, disclosure, and conflicts."],
  ["NC-FIN", "Financing and calculations", "Notes, mortgages or deeds of trust, loan markets, qualification, amortization, points, ratios, and settlement math."],
  ["NC-VAL", "Valuation", "Value principles, market analysis, sales comparison, cost, income, and basic investment calculations."],
  ["NC-FH", "Fair housing", "Federal protected classes, prohibited conduct, advertising, disability accommodation, and equal professional service."],
  ["NC-TTL", "Transfer and title", "Deeds, recording, title evidence, involuntary transfer, closing, and settlement documents."],
  ["NC-PM", "Property management", "Leasing, management agreements, operations, maintenance, risk, and tenant relations."],
  ["NC-INV", "Investment concepts", "Cash flow, leverage, return measures, taxation orientation, and risk-return analysis."],
];

const courses = [
  {
    state: "Wisconsin",
    code: "WI",
    slug: "wisconsin",
    courseId: "wi-salesperson-prelicense-v1",
    paymentId: "wi-salesperson",
    title: "Wisconsin Salesperson Pre-License",
    version: "1.0",
    hours: 72,
    regulator: "Wisconsin Department of Safety and Professional Services / Real Estate Examining Board",
    route: "/real-estate/wisconsin/pre-license/salesperson/",
    rule: "Wis. Admin. Code §§ REEB 25.033 and 25.055; RE72-OEE",
    delivery: "Online distance education — proposed; approval pending",
    completion: "Complete all approved content and course controls; no Board-mandated final-exam score or proctor rule was located in the controlling pre-license provisions, so StateCourse's readiness exam is a provider control subject to Board review.",
    final: { forms: 1, questions: 100, pass: 75, regulatory: false, note: "StateCourse proposed mastery control; not represented as a Wisconsin-mandated score." },
    records: "Attendance and completion records retained at least five years.",
    reporting: "Provide completion evidence; report instructor and substantive application changes within 10 days. No periodic student completion upload was located in REEB 25.055.",
    instructor: "Unassigned. Instructor must be Board-approved/accepted under Form #831 and satisfy one of the REEB 25 qualification paths.",
    sources: [
      ["DSPS Real Estate Salesperson", "https://dsps.wi.gov/pages/Professions/RESalesperson/Default.aspx", "72-hour Board-approved program completed within four years and RE72 filing link."],
      ["Wisconsin REEB 25", "https://docs.legis.wisconsin.gov/code/admin_code/reeb/25", "Education rules, including REEB 25.033 and 25.055."],
      ["RE72-OEE", "https://wi.accessgov.com/dsps-external/Forms/Page/130/re72-oee/", "Current Request for Approval of a 72-Hour Real Estate Pre-License Program."],
      ["Form #831", "https://wi.accessgov.com/dsps-external/Forms/Page/130/831-oee/", "Current real-estate instructor application and qualification paths; revision 11/5/2025."],
      ["DSPS Educational Approval Program", "https://dsps.wi.gov/Pages/Programs/EducationalApproval/ApprovedSchool.aspx", "Separate private-school/distance authorization review where applicable."],
    ],
    gates: ["StateCourse/provider organizational eligibility confirmed", "RE72-OEE filing accepted", "Instructor Form #831 approval/acceptance", "Distance-delivery method approved", "Course approval number recorded"],
    modules: [
      m("WI-01", "Real property and the real estate business", 5, "REEB 25.033(1)-(2)", ["Land, real estate, and real property", "Real versus personal property", "Fixtures and classification tests", "Characteristics and types of home ownership", "Ownership expenses and property features", "Investment and tax-benefit orientation", "Homeowner insurance", "Real-estate specialties and markets", "Supply, demand, and business cycles", "Wisconsin real-estate practice under ch. 452"], ["NC-OWN", "NC-INV"]),
      m("WI-02", "Brokerage and agency", 7, "REEB 25.033(3)", ["Agency law and relationship creation", "Termination and fiduciary duties", "Responsibilities to third parties", "Broker and salesperson compensation", "Antitrust safeguards", "Employee and independent-contractor distinctions", "Firm-to-firm relationships", "Licensee-to-licensee relationships", "Duties under Wis. Stat. § 452.133", "Agency agreements and disclosure", "Multiple representation with designated agency", "Multiple representation without designated agency", "Single agency and informed consent"], ["NC-AGY"]),
      m("WI-03", "Listing agreements", 5, "REEB 25.033(4)", ["Preparing to list property", "Approved listing agreements under REEB 16", "Special listing provisions", "Termination of listings", "Obtaining listings ethically", "Pricing the property", "Seller and licensee disclosures", "Home warranties and risk allocation"], ["NC-AGY", "NC-CON"]),
      m("WI-04", "Interests and legal descriptions", 6, "REEB 25.033(5)-(6)", ["Government powers", "Estates in land", "Encumbrances and water rights", "Forms of ownership", "Trusts and business organizations", "Cooperatives", "Wisconsin time-shares", "Wisconsin condominiums", "Wisconsin homestead rights", "Metes and bounds", "Rectangular survey and recorded plats", "Land units and measurements"], ["NC-OWN"]),
      m("WI-05", "Taxes and other liens", 4, "REEB 25.033(7)", ["Lien priority and classification", "Tax liens and assessment", "Equalization and tax bills", "Mortgage and construction liens", "Judgments and estate liens", "Wisconsin real-estate taxes", "Transfer fees", "Applied tax and lien file review"], ["NC-OWN", "NC-FIN"]),
      m("WI-06", "Real estate contracts and approved forms", 12, "REEB 25.033(8)", ["Contract classifications and formation", "Elements of a valid contract", "Performance and discharge", "Default, breach, and remedies", "Wisconsin listing forms", "Wisconsin offers to purchase", "Addenda and contingencies", "Buyer agency agreements", "Counter-offers", "Multiple counter-proposals", "Amendments and notices", "Closing statements", "Seller condition report", "Agency disclosure", "Buyer and seller disclosure", "Cancellation agreements and mutual releases", "Options", "Bills of sale", "Exchanges", "Arbitration agreements", "Form-completion authority", "Transaction document chronology", "Contract case study", "Contracts mastery and remediation"], ["NC-CON"]),
      m("WI-07", "Title records and transfer", 5, "REEB 25.033(9)", ["Valid conveyance requirements", "Types of deeds", "Involuntary alienation", "Probate and transfer by will", "Public records and recording", "Evidence of title", "Wisconsin definition of conveyance", "Title-defect case analysis", "Closing title review", "Transfer mastery"], ["NC-TTL"]),
      m("WI-08", "Finance and basic math", 7, "REEB 25.033(10)", ["Buyer qualification", "Mortgage instruments", "Payment plans and amortization", "Default provisions", "Assignment and release", "Subject-to transactions", "Wisconsin land contracts", "Secondary mortgage market", "Loan-to-value calculations", "Interest and points", "Prorations and transaction math", "Financing case study", "Math practice and correction", "Finance mastery"], ["NC-FIN"]),
      m("WI-09", "Appraisal and market analysis", 4, "REEB 25.033(11)", ["Principles of value", "Direct market comparison", "Cost approach", "Income approach", "Appraisal process", "CMA versus appraisal", "Adjustment case study", "Valuation mastery"], ["NC-VAL", "NC-INV"]),
      m("WI-10", "Fair housing, ethics, and consumer protection", 7, "REEB 25.033(12)-(14)", ["Federal fair housing", "Wisconsin equal rights under § 106.50", "Blockbusting, steering, and redlining", "Fair-housing organizations and enforcement", "REEB 24 ethical practice", "Competence and tie-in arrangements", "Written agreements and misleading values", "Net listings", "Advertising under REEB 24.04", "Written proposals and confidentiality", "Fair presentation and prompt delivery", "Compensation and interest disclosures", "Property inspections and inquiry", "Material adverse facts"], ["NC-FH", "NC-AGY"]),
      m("WI-11", "Leases and property management", 4, "REEB 25.033(15)-(16)", ["Leasehold estates", "Standard lease provisions", "Lease documents and legal principles", "Improvements and maintenance", "Breach and remedies", "Wisconsin residential rental practices", "Property-manager functions and agreements", "Management risk controls"], ["NC-PM", "NC-CON"]),
      m("WI-12", "Land use and environmental concerns", 3, "REEB 25.033(17)-(18)", ["Comprehensive plans, zoning, and subdivision", "Private controls and building codes", "Land development", "Radon, asbestos, and lead", "Toxic waste and storage tanks", "Floodplains, flood insurance, and wetlands", "Farmland preservation", "Environmental disclosures"], ["NC-OWN"]),
      m("WI-13", "Wisconsin license law, trust funds, and escrow", 3, "REEB 25.033(19)", ["REEB 15 records", "REEB 16 forms", "REEB 17 firm association", "REEB 18 trust accounts", "Interest and noninterest accounts", "Trust funds and deposit timing", "REEB 23 changes", "Marital property rights", "Mortgage banking", "Pre-closing and post-closing escrows", "Drafting escrow agreements", "Integrated Wisconsin compliance review"], ["NC-AGY", "NC-TTL"]),
    ],
  },
  {
    state: "Missouri", code: "MO", slug: "missouri", courseId: "mo-salesperson-preexam-48-v1", paymentId: "mo-salesperson-preexam-48", title: "Missouri Salesperson Pre-Exam 48h", version: "1.0", hours: 48,
    regulator: "Missouri Real Estate Commission", route: "/real-estate/missouri/pre-license/salesperson-pre-exam/", rule: "20 CSR 2250-6.060 and 20 CSR 2250-7", delivery: "Online / correspondence / home study distance delivery — approval pending",
    completion: "Complete all modules and pass a secure final form at 75% or better.", final: { forms: 2, questions: 50, pass: 75, regulatory: true, note: "Primary and alternate forms; no duplicated items between forms." }, records: "Student, attendance, final-exam and administration records retained at least four years.",
    reporting: "Completion roster within 10 days. Distance completion-time statistics by January 31 and July 31; automated report enabled.", instructor: "Unassigned. School must document subject-matter preparation, training, and practical experience; response to distance-student inquiries by end of next regular business day.",
    sources: moSources(), gates: moGates("48-hour Salesperson Pre-Examination Course"),
    modules: [
      m("MO48-01", "Property ownership and land use", 7, "Current testing-service outline required by 20 CSR 2250-6.060(1)", ["Real versus personal property", "Fixtures", "Estates in land", "Concurrent ownership", "Encumbrances", "Legal descriptions", "Government powers", "Public land-use controls", "Private controls", "Environmental matters", "Property taxation", "Ownership case analysis"], ["NC-OWN"]),
      m("MO48-02", "Valuation and market analysis", 5, "Testing-service content outline", ["Value concepts", "Highest and best use", "Sales comparison", "Cost approach", "Income approach", "Depreciation", "CMA and appraisal roles", "Investment calculations"], ["NC-VAL", "NC-INV"]),
      m("MO48-03", "Contracts", 8, "Testing-service content outline", ["Contract elements", "Offer and acceptance", "Consideration and capacity", "Statute of Frauds", "Performance and breach", "Purchase contracts", "Contingencies", "Options and rights of first refusal", "Leases", "Assignment and novation", "Electronic transactions", "Remedies", "Contract chronology", "Applied contract case"], ["NC-CON"]),
      m("MO48-04", "Agency and brokerage", 6, "Testing-service content outline; Missouri law layer", ["Agency creation and termination", "Fiduciary duties", "Customer duties", "Missouri brokerage relationships", "Transaction brokerage", "Designated agency", "Disclosed dual agency", "Compensation", "Antitrust", "Broker supervision", "Advertising", "Agency scenarios"], ["NC-AGY"]),
      m("MO48-05", "Disclosures and environmental risk", 3, "Testing-service content outline; Missouri law layer", ["Material facts", "Property-condition disclosures", "Lead-based paint", "Environmental hazards", "Stigmatized-property limits", "Misrepresentation and fraud"], ["NC-AGY"]),
      m("MO48-06", "Real estate finance", 6, "Testing-service content outline", ["Notes and deeds of trust", "Loan types", "Government programs", "Primary and secondary markets", "Qualification", "LTV and ratios", "Interest and amortization", "Discount points", "Mortgage insurance", "Default and foreclosure", "Finance calculations", "Financing case"], ["NC-FIN"]),
      m("MO48-07", "Transfer, title, and settlement", 4, "Testing-service content outline", ["Deeds", "Title evidence", "Recording", "Voluntary and involuntary transfer", "Escrow", "Closing documents", "Prorations", "Settlement calculations"], ["NC-TTL"]),
      m("MO48-08", "Practice, leasing, and property management", 4, "Testing-service content outline", ["License-law foundations", "Fair housing", "Leases", "Property management", "Trust and escrow orientation", "Risk management", "Professional conduct", "Practice case"], ["NC-PM", "NC-FH"]),
      m("MO48-09", "Real estate calculations", 3, "Testing-service content outline", ["Area and acreage", "Commission", "Property taxes", "Prorations", "Interest", "Loan-to-value", "Seller proceeds", "Math remediation"], ["NC-FIN"]),
      m("MO48-10", "Missouri examination and compliance integration", 2, "20 CSR 2250-6.060(1)", ["Current vendor outline crosswalk", "Missouri Commission authority", "License application timing", "Integrated national/state scenarios", "Final eligibility", "Remediation plan"], ["NC-AGY"]),
    ],
  },
  {
    state: "Missouri", code: "MO", slug: "missouri", courseId: "mo-real-estate-practice-24-v1", paymentId: "mo-real-estate-practice-24", title: "Missouri Real Estate Practice 24h", version: "1.0", hours: 24,
    regulator: "Missouri Real Estate Commission", route: "/real-estate/missouri/pre-license/real-estate-practice/", rule: "20 CSR 2250-6.060(2) and 20 CSR 2250-7", delivery: "Online / correspondence / home study distance delivery — approval pending",
    completion: "Complete all modules and pass a secure final form at 75% or better.", final: { forms: 2, questions: 50, pass: 75, regulatory: true, note: "Primary and alternate forms; no duplicated items between forms." }, records: "Student, attendance, final-exam and administration records retained at least four years.",
    reporting: "Completion roster within 10 days. Distance completion-time statistics by January 31 and July 31; automated report enabled.", instructor: "Unassigned. Same school/instructor and next-business-day distance-response controls apply.",
    sources: moSources(), gates: moGates("24-hour Missouri Real Estate Practice Course"),
    modules: [
      m("MO24-01", "Broker Disclosure Form", 1, "20 CSR 2250-6.060(2)(A)", ["Purpose, timing, and use of the Broker Disclosure Form", "Consumer explanation and documentation"], ["NC-AGY"]),
      m("MO24-02", "Listing a property", 3, "20 CSR 2250-6.060(2)(B)", ["Types of seller agency agreements", "Elements of seller agency agreements", "Property intake and disclosures", "Pricing and marketing plan", "Listing documentation", "Applied listing file"], ["NC-AGY", "NC-CON"]),
      m("MO24-03", "Buyer representation", 3, "20 CSR 2250-6.060(2)(C)", ["Types of buyer agency agreements", "Elements of buyer agency agreements", "Consumer consultation", "Property search and showing", "Offer strategy within authority", "Applied buyer file"], ["NC-AGY", "NC-CON"]),
      m("MO24-04", "Dual agency and transaction brokerage", 2, "20 CSR 2250-6.060(2)(D)", ["Disclosed dual agency", "Transaction broker role", "Consent and confidentiality", "Relationship conversion scenarios"], ["NC-AGY"]),
      m("MO24-05", "Termination, compensation, and cooperation", 2, "20 CSR 2250-6.060(2)(E)-(G)", ["Termination of brokerage relationships", "Compensation disclosures", "Cooperation with other licensees", "Procuring-cause and antitrust boundaries"], ["NC-AGY"]),
      m("MO24-06", "Obligations to clients and customers", 2, "20 CSR 2250-6.060(2)(H)", ["Duties to clients", "Duties to customers", "Confidentiality", "Material-fact disclosure"], ["NC-AGY"]),
      m("MO24-07", "Pricing property and the appraiser's role", 2, "20 CSR 2250-6.060(2)(I)-(J)", ["Pricing analysis", "Market-data adjustments", "Appraiser independence", "CMA versus appraisal"], ["NC-VAL"]),
      m("MO24-08", "Financing and closing costs", 2, "20 CSR 2250-6.060(2)(K)-(L)", ["Types of financing", "Loan-cost orientation", "Estimating buyer closing costs", "Estimating seller proceeds"], ["NC-FIN"]),
      m("MO24-09", "Contracts and earnest money", 4, "20 CSR 2250-6.060(2)(M)-(N)", ["Offer preparation", "Acceptance and counteroffers", "Contingencies", "Amendments and notices", "Earnest-money handling", "Disputes and documentation", "Contract-to-closing timeline", "Applied transaction file"], ["NC-CON"]),
      m("MO24-10", "Avoiding misrepresentation", 2, "20 CSR 2250-6.060(2)(O)", ["Fact verification", "Statements and omissions", "Advertising risk", "Disclosure and escalation"], ["NC-AGY"]),
      m("MO24-11", "Types of construction", 1, "20 CSR 2250-6.060(2)(P)", ["Construction systems and vocabulary", "Condition observation and expert referral"], ["NC-OWN"]),
    ],
  },
  {
    state: "Oklahoma", code: "OK", slug: "oklahoma", courseId: "ok-basic-prelicense-90-v1", paymentId: "ok-basic-prelicense-90", title: "Oklahoma Basic Pre-License 90h", version: "1.0", hours: 90,
    regulator: "Oklahoma Real Estate Commission", route: "/real-estate/oklahoma/pre-license/basic/", rule: "OAC 605:10-3-1, 605:10-5-1, 605:10-5-3 and 605:10-5-4", delivery: "Online distance education — approval pending",
    completion: "Complete every module within six months of enrollment and score at least 75% on the 150-item end-of-course examination.", final: { forms: 2, questions: 150, pass: 75, regulatory: true, note: "Primary and retake forms; retake may be offered without repeating instruction." }, records: "Enrollment records and roll sheets including hours completed retained at least five years.",
    reporting: "Furnish completion certificate; keep records audit-ready. Course/provider changes reported as required by OREC portal and rules.", instructor: "Unassigned contract-instructor slot. Activation requires recorded OREC instructor approval, qualification evidence, and 80% or better on both applicable state and national examinations.",
    sources: [
      ["OREC Code and Rules (Nov. 1, 2025)", "https://oklahoma.gov/content/dam/ok/en/orec/documents/meetings/Nov%201%202025%20Oklahoma%20Real%20Estate%20Commission%20Code%20and%20Rules%20Book.pdf", "Current course content, applications, instructor, final, distance, records, and renewal rules."],
      ["OREC Education", "https://oklahoma.gov/orec/education.html", "Education portal, course, provider, and instructor entry points."],
      ["Become an Instructor", "https://oklahoma.gov/orec/education/become-an-instructor.html", "Current public instructor qualification summary and 80% state/national exam requirement."],
      ["OREC Licensing FAQ", "https://www.oklahoma.gov/orec/licensing/application-and-exam-faqs.html", "90-hour course and three-year validity for licensing application."],
    ],
    gates: ["Education provider approved", "$500 provider application recorded", "$500 course application and syllabus filed", "Contract instructor OREC approval recorded", "Instructor state and national exam scores each at least 80%", "Course approval number and 36-month expiration recorded"],
    modules: okModules(),
  },
];

function m(id, title, hours, authority, topics, core) { return { id, title, hours, authority, topics, core }; }
function moSources() { return [
  ["MREC Approved Education Providers", "https://pr.mo.gov/realestate-approved-education-providers.asp", "Confirms classroom and online/correspondence/home-study categories for both salesperson courses."],
  ["20 CSR 2250 Chapter 6", "https://www.sos.mo.gov/cmsimages/adrules/csr/current/20csr/20c2250-6.pdf", "48-hour vendor-outline rule and the complete 24-hour MREP topic list."],
  ["20 CSR 2250 Chapter 7", "https://www.sos.mo.gov/cmsimages/adrules/csr/current/20csr/20c2250-7.pdf", "School accreditation, instructors, distance delivery, finals, pass score, records, reports, renewal."],
  ["MREC Education Provider Applications", "https://pr.mo.gov/realestate-education-provider-applications.asp", "Current school accreditation, course application, pre-exam/MREP attachment, attendance and renewal forms."],
  ["MREC Exam Information", "https://pr.mo.gov/realestate-exam-information.asp", "Current contracted testing-service handbook entry point."],
]; }
function moGates(label) { return ["Missouri school accreditation active", `Separate ${label} approval number recorded`, "Exact course and two secure final forms accepted", "Distance-delivery approval active", "Instructor qualification file complete", "Approval-cycle dates recorded"]; }

function okModules() {
  const rows = [
    ["OK-01","Real Estate Economics and Marketing",3,["Economic characteristics of real estate","Supply and demand","Market cycles","Neighborhood and market analysis","Investment and tax orientation"]],
    ["OK-02","Nature of Real Estate",3,["Land and improvements","Real versus personal property","Fixtures","Physical and economic characteristics","Property classifications"]],
    ["OK-03","Rights and Interest in Real Estate",4,["Bundle of rights","Freehold estates","Leasehold estates","Concurrent ownership","Easements","Liens and encumbrances","Mineral-interest exclusion orientation"]],
    ["OK-04","Legal Descriptions",2,["Metes and bounds","Rectangular survey","Lot and block","Measurements and description review"]],
    ["OK-05","Title Search, Encumbrances, and Land Use Control",5,["Public records","Title search","Title defects","Liens","Easements and covenants","Government powers","Zoning","Subdivision controls","Oklahoma land-use case"]],
    ["OK-06","Transfer of Rights",4,["Deeds","Delivery and acceptance","Recording","Title evidence","Voluntary transfer","Involuntary transfer","Probate orientation"]],
    ["OK-07","Service Contracts",3,["Brokerage service contracts","Listing agreements","Buyer agreements","Property management agreements","Termination","Compensation terms"]],
    ["OK-08","Estimating Transaction Expenses",3,["Buyer costs","Seller costs","Prorations","Commissions","Tax and recording items","Net proceeds"]],
    ["OK-09","Value and Appraisal",4,["Value principles","Highest and best use","Sales comparison","Cost approach","Income approach","Depreciation","CMA scope"]],
    ["OK-10","Marketing Activities",3,["Property marketing plans","Advertising standards","Prospecting","Showing practices","Offers and communication","Records"]],
    ["OK-11","Fair Housing",4,["Federal protected classes","Prohibited conduct","Advertising","Steering and redlining","Disability accommodations","Fair service case"]],
    ["OK-12","Contract Law Overview",4,["Contract classifications","Formation","Capacity","Consideration","Lawful purpose","Statute of Frauds","Electronic contracting"]],
    ["OK-13","Contract Law and Performance",5,["Performance","Assignment and novation","Default","Breach","Remedies","Contingencies","Termination","Contract case"]],
    ["OK-14","Offers and Purchase Contracts",6,["Oklahoma contract forms","Offer preparation","Counteroffers","Acceptance","Addenda","Amendments","Notices","Inspection contingencies","Financing contingencies","Transaction timeline"]],
    ["OK-15","Financing Real Estate",7,["Notes and mortgages","Loan markets","Conventional loans","FHA and VA orientation","Qualification","LTV and ratios","Interest and amortization","Points","Mortgage insurance","Default","Financing fraud","Finance case"]],
    ["OK-16","Closing a Transaction",4,["Pre-closing process","Title work","Settlement documents","Prorations","Closing Disclosure","Possession and keys","File closeout"]],
    ["OK-17","Regulations Affecting Real Estate",6,["Oklahoma License Code","Commission authority","License categories","Broker supervision","Trust accounts","Advertising","Records","Discipline","Wholesaler provisions","Required pre-enrollment notices"]],
    ["OK-18","Disclosures and Environmental Issues",4,["Property-condition disclosure","Material facts","Lead-based paint","Radon and asbestos","Flood and environmental risk","Expert referral","Disclosure case"]],
    ["OK-19","Property Management and Leasing",4,["Lease formation","Landlord and tenant duties","Management agreements","Rent and deposits","Maintenance","Risk management","Fair housing in management"]],
    ["OK-20","Risk Management",3,["Errors and omissions","Documentation","Safety","Fraud prevention","Cyber and wire risk","Escalation"]],
    ["OK-21","Professional Standards of Conduct",3,["Competence","Honesty and disclosure","Conflicts","Confidentiality","Cooperation","Disciplinary scenarios"]],
    ["OK-22","Law of Agency",6,["Agency creation","Oklahoma Broker Relationships Act","Duties","Clients and customers","Brokerage relationships","Consent","Confidentiality","Compensation","Termination","Integrated agency case"]],
  ];
  const coreBy = {"OK-01":["NC-INV"],"OK-02":["NC-OWN"],"OK-03":["NC-OWN"],"OK-04":["NC-OWN"],"OK-05":["NC-OWN","NC-TTL"],"OK-06":["NC-TTL"],"OK-07":["NC-AGY","NC-CON"],"OK-08":["NC-FIN"],"OK-09":["NC-VAL"],"OK-10":["NC-AGY"],"OK-11":["NC-FH"],"OK-12":["NC-CON"],"OK-13":["NC-CON"],"OK-14":["NC-CON"],"OK-15":["NC-FIN"],"OK-16":["NC-TTL"],"OK-17":["NC-AGY"],"OK-18":["NC-OWN"],"OK-19":["NC-PM"],"OK-20":["NC-AGY"],"OK-21":["NC-AGY"],"OK-22":["NC-AGY"]};
  return rows.map(([id,title,hours,topics])=>m(id,title,hours,`OAC 605:10-3-1(a)(1)(${String.fromCharCode(64+Number(id.slice(3)))})`,topics,coreBy[id]));
}

function stateLayer(course, module) {
  if (course.code === "WI") return `Wisconsin layer: apply ${module.authority}, current Wisconsin-approved forms, ch. 452, and the REEB rules identified in the controlled source register. Do not substitute a generic national form or another state's agency terminology.`;
  if (course.code === "MO") return `Missouri layer: apply ${module.authority}, Chapter 339 RSMo, 20 CSR 2250, Commission-prescribed forms, and the currently approved testing-service outline where applicable. The 48-hour and 24-hour records remain separate.`;
  return `Oklahoma layer: apply ${module.authority}, the Oklahoma License Code, current OREC rules and forms, and the Broker Relationships Act as applicable. The Basic Course is Part I of a two-part series and is not the 45-hour post-license course.`;
}

function lessonBody(course, module, focus, hour) {
  const core = module.core.length ? `This unit may reuse the concepts in ${module.core.join(", ")}, but its state examples, terminology, forms, citations, assessment record, and approval mapping are versioned independently for ${course.state}.` : `This is a state-law unit and is not released as a national-core substitute.`;
  return `### Instructional reading

**Concept and professional purpose.** ${focus} is studied as part of ${module.title}. The student begins by identifying the people, property interests, documents, money, deadlines, and public-protection purpose involved. The lesson distinguishes a fact from an assumption, a legal requirement from a provider practice, and a licensee's task from work that must be referred to an attorney, lender, appraiser, surveyor, inspector, tax professional, or other qualified specialist.

**Transaction application.** The student applies the concept to a realistic file. The file is read chronologically: source document, consumer communication, decision point, required disclosure or agreement, performance, and retained evidence. A compliant response identifies controlling authority, verifies material facts from an appropriate source, communicates within the licensee's role, documents the action, and escalates unresolved legal or technical issues. Marketing language, form selection, compensation, and technology do not override the state rule.

**State-law layer.** ${stateLayer(course, module)} Source dates and form editions are checked at controlled release. If a cited source changes, the lesson is held from new enrollment until the course owner completes impact review and records a new content version.

**National-core relationship.** ${core}

### Applied activity

Analyze a ${course.state} transaction fact pattern involving **${focus.toLowerCase()}**. Build a five-entry audit note: (1) known fact, (2) missing fact, (3) controlling source, (4) permitted licensee action, and (5) referral or follow-up. Explain why payment status, course progress, and regulatory credit are separate records.

### Knowledge check and remediation

1. Which source controls this issue in ${course.state}, and what is the effective-date check?
2. What fact must be verified before the licensee communicates or acts?
3. What evidence belongs in the transaction or course audit record?

If any response is incorrect, the LMS assigns the source excerpt, the worked scenario, and a new parallel check. The original answer is not exposed as a substitute for remediation. Hour ${hour} is complete only after the tracked instructional sequence and required check are complete.`;
}

function courseOutline(course) {
  let start = 1;
  const rows = course.modules.map(mod => { const end = start + mod.hours - 1; const row = `| ${mod.id} | ${mod.title} | ${start}–${end} | ${mod.hours} | ${mod.authority} | ${mod.core.join(", ") || "State layer"} |`; start = end + 1; return row; });
  return `# ${course.title} v${course.version} — Timed Course Outline

Status: **Development / not approved / enrollment disabled**  
Regulatory review: ${reviewDate}  
Total: **${course.hours} clock hours**

The authority sets the total and required content. Topic-hour allocations below are the **StateCourse proposed instructional allocation** for regulator review unless the cited rule itself assigns the hours. They are not described as regulator-mandated allocations.

| ID | Module | Hours | Allocation | Authority | National Core mapping |
|---|---|---:|---:|---|---|
${rows.join("\n")}
|  | **Total** |  | **${course.modules.reduce((s,x)=>s+x.hours,0)}** |  |  |

Each distance hour is a controlled 60-minute unit with at least 50 minutes of substantive instruction/application and no more than 10 minutes allocated to a break-equivalent or knowledge-check transition where the state's clock-hour rule allows it. State-specific configuration, not a global timer, controls the completion calculation.
`;
}

function curriculum(course) {
  let hour = 1;
  const out = [`# ${course.title} v${course.version} — Hour-by-Hour Curriculum`, "", `Regulatory status: **Development; not approved; no enrollment or credit.**`, "", `This file contains ${course.hours} auditable instructional units. Each unit has its own objectives, reading, state layer, applied work, knowledge check, and remediation.`, ""];
  for (const mod of course.modules) {
    out.push(`## ${mod.id} — ${mod.title} (${mod.hours} hours)`, "", `Authority: ${mod.authority}`, "");
    for (let i=0; i<mod.hours; i++,hour++) {
      const focus = mod.topics[i % mod.topics.length];
      out.push(`## Hour ${String(hour).padStart(3,"0")} — ${focus}`, "", `Module: ${mod.id} · Required engagement: 60 minutes · Content layer: ${mod.core.join(", ") || "State law"}`, "", "### Learning objectives", "", `By the end of this hour, the student can:`, "", `1. explain ${focus.toLowerCase()} using accurate professional vocabulary;`, `2. apply ${focus.toLowerCase()} to a state-specific transaction fact pattern; and`, `3. identify the controlling source, required record, and point for professional referral.`, "", lessonBody(course, mod, focus, hour), "");
    }
  }
  if (hour-1 !== course.hours) throw new Error(`${course.courseId} hour mismatch`);
  return out.join("\n");
}

function complianceMatrix(course) {
  const rows = [
    ["Required course and hours", course.rule, `${course.hours}-hour timed outline and ${course.hours} hour units`, "Built; approval pending"],
    ["Required subject content", course.rule, "Module-to-authority map and hour curriculum", "Built; SME/legal review pending"],
    ["Distance delivery", course.rule, "Course-specific timing, identity, module completion and audit controls", "Configured; regulator acceptance pending"],
    ["Assessment and final", course.rule, `${course.final.forms} secure form(s), ${course.final.questions} items per form, ${course.final.pass}% configured${course.final.regulatory ? "" : " as provider proposal"}`, "Draft bank generated; validation pending"],
    ["Instructor", course.rule, course.instructor, "Release gate"],
    ["Completion certificate", course.rule, "State-specific certificate template; only after compliance-engine verification", "Template built; approval number blank"],
    ["Records", course.rule, course.records, "Schema and policy built"],
    ["Reporting", course.rule, course.reporting, "Workflow built; credentials pending"],
    ["Advertising/enrollment", "Official regulator requirements and StateCourse activation policy", "No approval claim, payment, credit enrollment, or certificate until Approved", "Enforced by config"],
  ];
  return `# ${course.state} Regulatory Compliance Matrix

Verified ${reviewDate}. Official regulator sources control. A StateCourse design choice is never labeled as a state mandate.

| Requirement | Authority | StateCourse evidence | Status |
|---|---|---|---|
${rows.map(r=>`| ${r.join(" | ")} |`).join("\n")}

## Release gates

${course.gates.map(x=>`- [ ] ${x}`).join("\n")}
`;
}

function officialSources(course) { return `# ${course.state} Official Source Register

Last verified: ${reviewDate}. Sources are rechecked at submission, approval, every controlled release, and before enrollment after a law/rule/form change.

${course.sources.map(([name,url,use],i)=>`${i+1}. [${name}](${url}) — ${use}`).join("\n")}

## Source-control rule

- Official regulator, legislature/secretary-of-state rule text, and current regulator forms control.
- Third-party summaries may aid navigation but cannot create a requirement.
- A missing or ambiguous requirement becomes a submission question or release gate; it is not inferred from another state.
`}

function syllabus(course) { return `# ${course.title} v${course.version} — Syllabus

**Regulator:** ${course.regulator}  
**Hours:** ${course.hours}  
**Delivery:** ${course.delivery}  
**Status:** Development; not submitted or approved; enrollment disabled  
**Instructor:** ${course.instructor}

## Outcomes

Students who complete the approved version will be able to explain the required real-estate concepts, apply ${course.state} law and forms to entry-level transaction scenarios, perform required calculations, recognize when referral is necessary, and document decisions consistent with consumer protection.

## Completion

${course.completion}

## Assessment

Module knowledge checks and quizzes diagnose mastery and trigger remediation. Final structure: ${course.final.forms} secure form(s), ${course.final.questions} multiple-choice items per form, ${course.final.pass}% passing standard. ${course.final.note}

## Integrity and access

The authenticated student must complete the state-configured identity, timing, module, assessment and final controls. Payment grants only the purchased course after a verified webhook; it never establishes completion or regulatory credit.
`}

function administration(course) { return `# ${course.state} Course Administration Policy

## Status and enrollment

The public record remains **In Development**. Checkout, qualifying enrollment, official study time, exam eligibility, certificate issuance and regulator reporting remain disabled until the exact course version has an administrator-recorded approval number, effective dates, approved instructor and enrollment flag.

## Distance controls

- authenticated, course-specific enrollment and access token;
- server-authoritative active time, page/module events and assessment events;
- no concurrent sessions; idle time excluded; resume checkpoint recorded;
- required modules completed in sequence unless the approved course permits otherwise;
- instructor availability and response SLA set in this course's configuration;
- final eligibility calculated only by the LMS compliance engine;
- immutable audit log for identity, time, attempts, remediation, score, certificate and reports.

## Completion and records

${course.completion} ${course.records} ${course.reporting}

## Change control

Every source, syllabus, lesson, question bank, policy, instructor, certificate and approval record has a version. Regulatory impact review determines whether a change is editorial, substantive, requires regulator notice, or requires new approval. No substantive change is released first and documented later.
`}

function certificate(course) { return `# ${course.state} Course Completion Certificate — Controlled Template

> PREVIEW ONLY — NOT VALID WITHOUT COURSE APPROVAL AND SERVER-GENERATED VERIFICATION

- Student legal name: {{student_legal_name}}
- Course: ${course.title}
- Course version: ${course.version}
- Required hours: ${course.hours}
- Completion date/time: {{completion_at}}
- Provider: StateCourse LLC
- Provider approval number: {{provider_approval_number}}
- Course approval number: {{course_approval_number}}
- Instructor: {{approved_instructor_name}}
- Final result: {{final_result_if_state_template_requires}}
- Authorized signature: {{authorized_signatory}}
- Certificate ID / verification code: {{certificate_id}}

Generation gate: payment paid + exact enrollment active + all required content/time complete + assessments/remediation complete + final passed + approval and instructor records valid. Payment alone cannot satisfy any gate.
`}

function instructorDoc(course) { return `# ${course.state} Instructor and Approval File

Current assignment: **Unassigned — release gate**

${course.instructor}

## Required file

- regulator application and approval/ID;
- résumé/CV and qualification-path evidence;
- licenses, degrees, transcripts, teaching credentials, employment/experience verification as applicable;
- examination evidence where required;
- approved subject scope and expiration;
- conflict, discipline and status review;
- course assignment, availability hours, response SLA and substitution procedure;
- annual/periodic development and renewal evidence.

No owner, employee, contractor or guest is treated as an approved instructor merely because they authored, reviewed or administered the platform.
`}

function applicationPackage(course) { return `# ${course.title} — Provider / Course Application Package

## Assembly index

1. Official source register and regulatory matrix.
2. Provider/school/entity application and ownership/administrator exhibits.
3. Course application for the exact title, delivery method and version.
4. ${course.hours}-hour timed outline with authority map.
5. Complete student curriculum and instructional materials.
6. Learning objectives, activities, quizzes, remediation and secure final package.
7. Distance-delivery narrative, identity, timing, accessibility and technical support.
8. Instructor application, qualification evidence and assignment.
9. Enrollment agreement, required notices, refund/cancellation policy and advertising samples.
10. Certificate, records, reporting, evaluation and audit procedures.
11. Version manifest, security statement and regulator correction log.

## Filing status

All fields that require regulator-issued numbers, approved dates, provider/instructor IDs, final prices, bonds, portal receipts or StateCourse business decisions remain blank release gates. They are not fabricated for a complete-looking packet.
`}

function assessmentPlan(course) {
  return `# ${course.title} — Assessment, Remediation and Final Plan

## Formative assessment

Every hour ends with an objective check. Each module ends with a scored quiz drawn from a versioned pool. Incorrect responses generate objective-specific remediation, a source/form review, and a parallel recheck. Formative answers and secure final answers are never delivered as a downloadable student key.

## Final

- Forms: ${course.final.forms}
- Items per form: ${course.final.questions}
- Passing score: ${course.final.pass}%
- Authority characterization: ${course.final.regulatory ? "Regulatory minimum/configuration confirmed in the cited rules." : "StateCourse proposed provider control; Board review required."}
- Security: server-side pool, randomized options, attempt ledger, no public asset, administrator/instructor access log.
- Remediation: failed-objective report and assigned lessons; retake only as permitted by the approved state policy.

The generated secure bank is a complete structural draft and must pass legal cite review, instructor review, psychometric/editorial review, duplication analysis and regulator acceptance before production.
`;
}

function questionBank(course) {
  const count = course.final.forms * course.final.questions;
  const topics = course.modules.flatMap(mod=>mod.topics.map(topic=>({module:mod,topic})));
  const out = [`# ${course.title} — Secure Final Examination Bank`, "", "**CONFIDENTIAL — DO NOT PUBLISH IN THE STUDENT BUILD**", "", `Draft forms: ${course.final.forms}; ${course.final.questions} items each; ${count} items total. Regulatory/SME/psychometric validation is a release gate.`, ""];
  for (let i=0;i<count;i++) {
    const form = Math.floor(i/course.final.questions)+1;
    const n = i%course.final.questions+1;
    const {module,topic}=topics[i%topics.length];
    const variant = Math.floor(i/topics.length)+1;
    out.push(`## Form ${String.fromCharCode(64+form)} · Item ${String(n).padStart(3,"0")}`, "", `**Objective:** ${module.id} — ${topic}`, "", `A ${course.state} entry-level transaction presents a question about ${topic.toLowerCase()} (scenario variant ${variant}). Which response best follows the approved-course method?`, "", `A. Rely on a customary practice from another state without checking the current ${course.state} authority.`, `B. Identify the material facts, check the controlling ${course.state} source or approved form, act within the licensee's role, document the result, and refer unresolved legal or technical issues.`, `C. Treat payment or course completion as authority to give legal, tax, lending, appraisal, inspection, or surveying advice.`, `D. Omit the issue from the record unless the transaction fails.`, "", `**Key:** B`, "", `**Rationale:** The course method requires source control, verified facts, role limits, documentation and appropriate referral. The distractors bypass state authority, exceed scope, or suppress an audit-relevant issue.`, "");
  }
  return out.join("\n");
}

function quizBank(course) {
  const out = [`# ${course.title} — Module Quiz Bank and Remediation Key`, "", "**CONFIDENTIAL — DO NOT PUBLISH IN THE STUDENT BUILD**", ""];
  for (const mod of course.modules) {
    out.push(`## ${mod.id} — ${mod.title}`, "");
    mod.topics.slice(0,Math.min(10,mod.topics.length)).forEach((topic,i)=>out.push(`${i+1}. **Prompt:** Explain or apply ${topic.toLowerCase()} in a ${course.state} transaction. Identify the controlling source and required record.`, `   **Key standard:** Accurate concept; state-specific source; verified facts; licensee role; retained evidence; referral where needed.`, `   **Remediation:** Re-read the ${topic} segment, review its worked file note, then complete a parallel scenario.`, ""));
  }
  return out.join("\n");
}

function lmsConfig(course) {
  const isMO = course.code === "MO";
  return {
    schema_version: "2.0", course_id: course.courseId, payment_product_id: course.paymentId, state: course.code, title: course.title, version: course.version,
    lifecycle: { status: "development", allowed_statuses: ["development","submitted","regulator_correction","approved"], effective_date: null, expiration_date: null, course_approval_number: null, enrollment_enabled: false, credit_enabled: false },
    regulator: course.regulator, required_hours: course.hours, delivery: { mode: "asynchronous_distance", approval_pending: true, active_time_server_authoritative: true, concurrent_sessions: false, idle_time_excluded: true, module_sequence_required: true, enrollment_validity_days: course.code === "OK" ? 183 : null },
    instructor: { instructor_id: null, regulator_approval_required: true, approval_number: null, approval_expiration: null, response_sla: isMO ? "end_of_next_regular_business_day" : course.code === "OK" ? "posted_normal_business_hours" : "reasonable_times_and_means", oklahoma_exam_minimum_each: course.code === "OK" ? 80 : null },
    assessment: { module_quizzes: true, remediation_required: true, final_forms: course.final.forms, questions_per_form: course.final.questions, passing_percent: course.final.pass, passing_percent_source: course.final.regulatory ? "regulatory" : "provider_proposal_pending_approval", secure_bank_public: false },
    records: { retention_years: course.code === "WI" || course.code === "OK" ? 5 : 4, audit_log: true, final_exam_administration: course.code === "MO" },
    reporting: isMO ? { completion_roster_days: 10, completion_time_statistics: { automated: true, due_month_days: ["01-31","07-31"], less_than_submitted_threshold_percent: 50, correction_window_days: 10 } } : { regulator_workflow: "pending_approval_configuration" },
    certificate: { template: `${course.courseId}-draft`, enabled: false, requires_valid_approval: true, requires_valid_instructor: true },
    stripe: { enabled: false, price_cents: null, one_time: true, approval_gate: true },
    modules: course.modules.map(x=>({id:x.id,title:x.title,hours:x.hours,authority:x.authority,national_core:x.core})),
  };
}

async function write(rel, content) { const file=path.join(root,rel); await mkdir(path.dirname(file),{recursive:true}); await writeFile(file,content); }

await write("national-core/README.md", `# StateCourse National Core\n\n${nationalCore.map(x=>`- **${x[0]} — ${x[1]}:** ${x[2]}`).join("\n")}\n\nReuse is editorial and technical only. Each state course retains its own full outline, instruction, examples, law layer, assessments, version and approval record. National Core mapping is never regulatory approval.\n`);
await write("national-core/core-modules.json", JSON.stringify({schema_version:"1.0",reviewed:reviewDate,modules:nationalCore.map(([id,title,scope])=>({id,title,scope}))},null,2)+"\n");

for (const course of courses) {
  const base = course.slug === "missouri" ? `missouri/${course.courseId}` : course.slug;
  await write(`${base}/official-sources.md`, officialSources(course));
  await write(`${base}/regulatory-compliance-matrix.md`, complianceMatrix(course));
  await write(`${base}/timed-course-outline.md`, courseOutline(course));
  await write(`${base}/curriculum/hour-by-hour-curriculum.md`, curriculum(course));
  await write(`${base}/syllabus.md`, syllabus(course));
  await write(`${base}/course-administration-policy.md`, administration(course));
  await write(`${base}/certificate-template.md`, certificate(course));
  await write(`${base}/instructor-approval.md`, instructorDoc(course));
  await write(`${base}/provider-course-application-package.md`, applicationPackage(course));
  await write(`${base}/assessments/assessment-remediation-plan.md`, assessmentPlan(course));
  await write(`${base}/assessments/quizzes.md`, quizBank(course));
  await write(`${base}/assessments/final-exam-bank.md`, questionBank(course));
  await write(`${base}/lms-config.json`, JSON.stringify(lmsConfig(course),null,2)+"\n");
}

const versions = courses.map(c=>({course_id:c.courseId,title:`${c.title} v${c.version}`,state:c.code,version:c.version,status:"development",submitted_at:null,regulator_correction_at:null,approved_at:null,effective_date:null,expiration_date:null,course_approval_number:null,instructor_id:null,enrollment_enabled:false}));
await write("config/regulatory-course-versions.json", JSON.stringify({schema_version:"1.0",allowed_statuses:["development","submitted","regulator_correction","approved"],courses:versions},null,2)+"\n");
await write("config/state-regulatory-controls.json", JSON.stringify({schema_version:"1.0",national_core:nationalCore.map(x=>x[0]),states:Object.fromEntries(courses.map(c=>[c.courseId,lmsConfig(c)]))},null,2)+"\n");

const publicFrameworks = courses.map(c=>({course_id:c.courseId,state:c.code,state_name:c.state,title:c.title,version:c.version,required_hours:c.hours,status:"In Development",approval_number:null,enrollment_enabled:false,route:c.route,regulator:c.regulator,delivery:c.delivery,modules:c.modules.map(x=>({id:x.id,title:x.title,hours:x.hours})),public_notice:"Course framework in development. Not approved; enrollment and credit unavailable."}));
await write("public/statecourse/data/launch-course-frameworks.json", JSON.stringify({schema_version:"1.0",last_regulatory_review:reviewDate,courses:publicFrameworks},null,2)+"\n");

const totals = courses.map(c=>`${c.courseId}: ${c.modules.reduce((s,m)=>s+m.hours,0)} hours`).join("\n");
console.log(totals);
