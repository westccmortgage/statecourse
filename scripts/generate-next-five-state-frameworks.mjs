import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const reviewDate = "2026-08-16";

const sources = {
  AZ: [
    ["ADRE Salesperson License", "https://azre.gov/about/services/salesperson-license", "90-hour prelicense certificate and separate 6-hour Contract Writing certificate."],
    ["ADRE Education Forms and Resources", "https://azre.gov/divisions/education/education-forms-resources", "Current school, instructor, prelicense-course, and Contract Writing applications."],
    ["ADRE School Approval Application (09/2025)", "https://azre.gov/sites/default/files/2025-09/School%20Approval%20Application%20Form.pdf", "School type, owner, administrator, instructor, entity, and distance-school exhibits."],
    ["ADRE Instructor Application (12/2025)", "https://azre.gov/sites/default/files/2025-12/Instructor%20Application%20Form.pdf", "Fingerprint, workshop, subject qualification, résumé, and disclosure requirements."],
    ["ADRE Prelicense Course Application (09/2025)", "https://azre.gov/sites/default/files/2025-09/Course%20Application%20Form%20-%20Pre-Licensing.pdf", "Outline, enrollment agreement, distance-review access, IP, identity, support, and clock-hour attestations."],
    ["ADRE Contract Writing Course Application (01/2026)", "https://azre.gov/sites/default/files/2026-01/Course%20Application%20Form%20-%20Continuing%20Education%20or%206-Hour%20Contract%20Writing.pdf", "Separate six-hour Contract Writing course record and delivery application."],
    ["ADRE SPS 2025.01", "https://azre.gov/sites/default/files/2025-07/S.P.S.%202025.01.pdf", "Distance identity, inactivity, timing, interactivity, quizzes, finals, proctoring, and certificate controls."],
    ["A.R.S. § 32-2124", "https://www.azleg.gov/ars/32/02124.htm", "Salesperson education, Arizona-specific instruction, course examination, and certificate rules."],
    ["ADRE Fees", "https://azre.gov/all-adre-resources/fees", "Current public fee schedule; education-application fees are not listed and must be confirmed at filing."],
  ],
  WA: [
    ["Washington DOL — Get your broker license", "https://dol.wa.gov/professional-licenses/real-estate-brokers/get-your-license-real-estate-brokers", "60-hour Fundamentals plus 30-hour Practices entry education."],
    ["Washington DOL — School approval", "https://dol.wa.gov/professional-licenses/real-estate-educators/school-approval-real-estate-educators", "School application, student publication, administrator résumé, fee, and two-year cycle."],
    ["Washington DOL — Instructor approval", "https://dol.wa.gov/professional-licenses/real-estate-educators/apply-approval-real-estate-instructors", "Instructor application, qualifications, résumé, fee, and two-year cycle."],
    ["Washington DOL — Course approval", "https://dol.wa.gov/professional-licenses/real-estate-educators/get-your-course-approval-real-estate-educators", "Separate course application, outline, materials, examination/key, evaluation, and distance method approval or ARELLO certificate."],
    ["Washington DOL — Curriculum", "https://dol.wa.gov/professional-licenses/real-estate-educators/curriculum-real-estate-educators", "Current prescribed Fundamentals and Practices curricula."],
    ["Washington DOL — Forms", "https://dol.wa.gov/professional-licenses/real-estate-educators/forms-real-estate-educators", "School, instructor, pre/post course, and Distance Education Delivery Method applications."],
    ["Washington DOL — Fees", "https://dol.wa.gov/professional-licenses/real-estate-brokers/fees-real-estate", "Current school, instructor, course, and renewal fees."],
    ["WAC 308-124H", "https://app.leg.wa.gov/WAC/default.aspx?cite=308-124H", "Clock hours, exams, distance delivery, ARELLO alternative, certificates, records, and approvals."],
  ],
  PA: [
    ["Pennsylvania Commission — Education Information", "https://www.pa.gov/agencies/dos/department-and-offices/bpoa/boards-commissions/real-estate-commission/education-information", "Approved-provider requirement, forms, and separate 30/45-hour course outlines."],
    ["Initial Education Provider Application (04/2024)", "https://www.pa.gov/content/dam/copapwp-pagov/en/dos/department-and-offices/bpoa/real-estate/App%20-%20Approval%20Initial%20Provider.pdf", "Provider, director, office, bond, inspection, agreement, refund, and fee requirements."],
    ["Education Provider Owner Approval", "https://www.pa.gov/content/dam/copapwp-pagov/en/dos/department-and-offices/bpoa/real-estate/App%20-%20Approval%20Owner.pdf", "Owner approval, character, résumé, references, background check, and fee."],
    ["Education Provider Director Approval", "https://www.pa.gov/content/dam/copapwp-pagov/en/dos/department-and-offices/bpoa/real-estate/App%20-%20Approval%20Director.pdf", "Director qualifications, résumé, background check, and fee."],
    ["Education Provider Surety Bond", "https://www.pa.gov/content/dam/copapwp-pagov/en/dos/department-and-offices/bpoa/real-estate/Document%20-%20Surety%20Bond.pdf", "$10,000 bond instrument."],
    ["Instructor Approval Application", "https://www.pa.gov/content/dam/copapwp-pagov/en/dos/department-and-offices/bpoa/real-estate/App%20-%20Approval%20Instructor.pdf", "Instructor qualification certification and fee."],
    ["Distance Education Course Application", "https://www.pa.gov/content/dam/copapwp-pagov/en/dos/department-and-offices/bpoa/real-estate/App%20-%20Approval%20Course%20Distance%20Ed.pdf", "Timed outline, materials, final/key, ARELLO/IDECC delivery approval, reviewer access, and proctored prelicense final."],
    ["Fundamentals Commission Outline", "https://www.pa.gov/content/dam/copapwp-pagov/en/dos/department-and-offices/bpoa/real-estate/Outline%20-%20RE%20Fundamentals.pdf", "Controlling 30-hour Fundamentals outline."],
    ["Practice Commission Outline", "https://www.pa.gov/content/dam/copapwp-pagov/en/dos/department-and-offices/bpoa/real-estate/Outline%20-%20RE%20Practice.pdf", "Controlling 45-hour Practice outline."],
    ["49 Pa. Code Chapter 35", "https://www.pacodeandbulletin.gov/Display/pacode?file=%2Fsecure%2Fpacode%2Fdata%2F049%2Fchapter35%2Fchap35toc.html", "Provider, course, distance, clock hour, proctoring, certificate/transcript, and record rules."],
  ],
  NC: [
    ["21 NCAC 58H — current compiled rules", "https://reports.oah.state.nc.us/ncac/title%2021%20-%20occupational%20licensing%20boards%20and%20commissions/chapter%2058%20-%20real%20estate%20commission/chapter%2058%20rules.html", "Provider, instructor, course, asynchronous delivery, completion, examination, reporting, records, fees, and renewals."],
    ["N.C.G.S. Chapter 93A, Article 3", "https://www.ncleg.gov/enactedlegislation/statutes/html/bychapter/chapter_93a.html", "Education Provider certification and statutory authority."],
    ["NCREC 2026 Rule Changes", "https://bulletins.ncrec.gov/rule-changes/", "July 1, 2026 synchronous-camera attendance amendment."],
    ["NCREC Prelicensing Rosters", "https://bulletins.ncrec.gov/lets-talk-prelicensing-rosters/", "Seven-day roster fields and reporting responsibility."],
    ["NCREC Policies and Procedures Disclosure", "https://bulletins.ncrec.gov/did-you-know-education-providers-must-publish-a-policies-and-procedures-disclosure-ppd/", "Required provider/student disclosure contents and signed receipt."],
    ["NCREC Broker Prelicensing Course Syllabus", "https://www.ncrec.gov/Education/Prelicensing", "Current prescribed 75-hour Broker Prelicensing syllabus and provider resources; controlled snapshot required at filing."],
  ],
  CO: [
    ["Colorado DRE — Broker Qualifying Education", "https://dre.colorado.gov/division-programs/real-estate-broker/education/broker-qualifying-education", "168-hour total, six mandatory courses, and official course outlines."],
    ["Colorado DRE — Broker Application Requirements", "https://dre.colorado.gov/division-programs/real-estate-broker/licensing/broker-license-application-requirements", "First-time broker education breakdown and licensing path."],
    ["Colorado DRE — Licensee Application Requirements", "https://dre.colorado.gov/licensee-application-requirements", "REC-33 completion certificates and first-time broker examination requirements."],
    ["Colorado DPOS — Laws and Regulations", "https://cdhe.colorado.gov/dpos-laws-regulations", "Current 8 CCR 1504-1 school, program, agent, instructor/staff, delivery, records, renewal, and fee rules."],
    ["Colorado DPOS Connect Resources", "https://cdhe.colorado.gov/dposconnect-resources", "School and program submission portal and application resources."],
    ["Colorado DPOS Fee Schedule", "https://cdhe.colorado.gov/fee-schedule", "Current school/program fees; amounts must be rechecked in DPOS Connect on filing day."],
  ],
};

const stateMeta = {
  AZ: {
    name: "Arizona", regulator: "Arizona Department of Real Estate", provider: "ADRE School Approval Application (rev. 09/2025)",
    approvals: ["school", "instructor", "salesperson_prelicense_course", "contract_writing_course"],
    fees: [
      ["School approval", "Not listed on the current ADRE fee page/application", "Confirm in ADRE Message Center at filing; no zero-dollar assumption."],
      ["Instructor approval", "Not listed on the current ADRE fee page/application", "Confirm at filing."],
      ["Prelicense course approval", "Not listed on the current ADRE fee page/application", "Confirm at filing."],
      ["Contract Writing course approval", "Not listed on the current ADRE fee page/application", "Confirm at filing."],
    ],
    delivery: "Synchronous or asynchronous distance learning under ADRE SPS 2025.01 and the applicable course application.",
    records: "Server-authoritative identity, unit, timestamp, IP, assessment, completion, exam, certificate, instructor, and version records; retention period to be confirmed in the approved school/course package.",
    reporting: "ADRE reviewer credentials, distance audit exports, certificates, and school/course/instructor changes through the ADRE process.",
    renewals: "School, instructor, and course expiration/renewal dates are stored independently from the issued approvals; current terms must be captured from ADRE approvals at issuance.",
  },
  WA: {
    name: "Washington", regulator: "Washington State Department of Licensing", provider: "Real Estate School Application",
    approvals: ["school", "instructor", "fundamentals_course", "practices_course", "distance_delivery_method_or_arello"],
    fees: [
      ["School application / renewal", "$380", "Two-year approval."],
      ["Instructor application / renewal", "$114", "Two-year approval; add-topic fee $38."],
      ["60-hour Fundamentals course", "$456", "Four-year approval."],
      ["30-hour Practices course", "$456", "$15.20 per clock hour; four-year approval."],
    ],
    delivery: "Course-specific Distance Education Delivery Method Application, or an accepted ARELLO certificate for the same course and clock-hour controls.",
    records: "Five-year student, enrollment, start/end, course, examination result, and evaluation records under WAC 308-124H-935.",
    reporting: "Certificates and audit-ready school records; DOL observation/audit access and material-change submissions.",
    renewals: "School and instructor approvals two years; mandated course approvals four years unless the current DOL approval states otherwise.",
  },
  PA: {
    name: "Pennsylvania", regulator: "Pennsylvania Real Estate Commission", provider: "Initial Real Estate Education Provider Approval",
    approvals: ["education_provider", "provider_owner", "provider_director", "surety_bond", "instructor", "fundamentals_course", "practice_course", "distance_delivery"],
    fees: [
      ["Initial Education Provider", "$120", "Current initial provider application rev. 04/2024."],
      ["Owner approval", "$75 standalone", "No separate fee when included with initial provider application."],
      ["Director approval", "$75 standalone", "No separate fee when included with initial provider application."],
      ["Instructor approval", "$20", "Per current instructor application."],
      ["Distance Education course", "$25 per course", "Fundamentals and Practice filed separately."],
      ["Failed inspection / reinspection", "$65", "Where applicable."],
      ["Annual renewal", "$375 provider + $15 instructor + $15 each course", "Renewal due by October 31; satellite fee $15 if applicable."],
      ["Surety bond", "$10,000 bond amount", "Bond amount, not Commission fee."],
    ],
    delivery: "Distance delivery method approved by ARELLO/IDECC or another Commission-accepted body; prelicense final proctored.",
    records: "Provider administrative, course, financial, scholastic, transcript, examination, and completion records under 49 Pa. Code Chapter 35; retention duration is a filing-confirmation gate where the cited rule does not state a numeric term.",
    reporting: "Commission inspection/audit access, transcripts/certificates, instructor/course/provider renewal records, and change notices.",
    renewals: "Annual provider/instructor/course renewal due by October 31 using current Commission renewal process.",
  },
  NC: {
    name: "North Carolina", regulator: "North Carolina Real Estate Commission", provider: "Education Provider Certification",
    approvals: ["education_provider", "education_director", "broker_prelicensing_course", "prelicensing_instructor"],
    fees: [
      ["Initial Education Provider certification", "$200 per location", "21 NCAC 58H .0202."],
      ["Prelicensing course approval", "$40 per course/location", "Current 58H course-approval rule."],
      ["Annual provider renewal", "$100 per location", "Due June 1; certification expires June 30."],
      ["Annual course renewal", "$25 per course", "Current 58H renewal rule."],
      ["Instructor approval", "No separate fee identified in the cited current rule", "Confirm in the NCREC portal at filing; no zero-dollar assumption."],
    ],
    delivery: "In-person, synchronous distance, blended, or asynchronous distance only as approved for the 75-hour Prelicensing course. Asynchronous learners complete every unit and assessment; synchronous learners must remain visible on camera effective July 1, 2026.",
    records: "Three years: enrollment/attendance, every graded exam and answer, master exam/key, evaluations, advertising, delivery certification, PPD, schedules, materials, and required reports.",
    reporting: "Completion report within seven calendar days; prior-month course summary by the fifth day; exact roster fields and audit trail retained.",
    renewals: "Provider certification expires June 30; renewal due June 1. Course and instructor status checked independently before scheduling/enrollment.",
  },
  CO: {
    name: "Colorado", regulator: "Colorado Division of Real Estate and Colorado Division of Private Occupational Schools", provider: "DPOS Certificate of Approval",
    approvals: ["dpos_school", "dpos_programs", "school_agents", "instructional_staff", "six_dre_qualifying_courses"],
    fees: [
      ["Initial provisional in-state Certificate of Approval", "$5,130", "Current 8 CCR 1504-1 fee schedule effective 04/01/2026; includes up to five new programs/standalone courses."],
      ["Additional campus", "$2,565", "Current 8 CCR 1504-1 fee schedule."],
      ["Standard three-year renewal", "$2,052 per campus", "Current 8 CCR 1504-1 fee schedule."],
      ["New program / standalone course", "$513", "Six courses require DPOS filing treatment; initial package inclusion must be confirmed."],
      ["Major / minor revision", "$513 / $128", "Current 8 CCR 1504-1 fee schedule."],
      ["School agent permit", "$308", "If applicable."],
      ["Student assessment", "$5 per student per quarter", "Subject to current DPOS billing instructions."],
    ],
    delivery: "Distance/asynchronous delivery must be included in the DPOS school/program approval. No broker-qualifying ARELLO/IDECC mandate was identified in the controlling DRE/DPOS sources; that certification is not imported from appraiser or another state rules.",
    records: "DPOS student, enrollment, catalog, agreement, financial, progress, completion, instructor/staff, program, and closure records plus DRE REC-33 completion evidence.",
    reporting: "DPOS student assessments/reports and regulator access; DRE qualifying completion evidence and six separate course records.",
    renewals: "DPOS provisional/standard approval and program lifecycles tracked from the issued certificate; current three-year standard-renewal fee is recorded but exact dates are approval-specific.",
  },
};

const formRegisters = {
  AZ: [
    "School Approval Application Form (rev. 09/2025)",
    "Instructor Application Form (rev. 12/2025)",
    "Course Application Form — Pre-Licensing (rev. 09/2025)",
    "Course Application Form — Continuing Education or 6-Hour Contract Writing (rev. 01/2026)",
    "ED-106 owner/administrator statements and current fingerprint-clearance-card exhibits identified by the school/instructor forms",
  ],
  WA: [
    "Real Estate School Application",
    "Real Estate Instructor Approval Application",
    "Real Estate Prelicensing/Postlicensing Course Approval Application",
    "Real Estate Distance Education Delivery Method Application, or accepted ARELLO certificate for the same course/method",
  ],
  PA: [
    "Application for Initial Real Estate Education Provider Approval (rev. 04/2024)",
    "Education Provider Owner Approval",
    "Education Provider Director Approval",
    "Real Estate Education Provider Surety Bond",
    "Real Estate Instructor Approval Application",
    "Distance Education Course Approval Application — filed separately for Fundamentals and Practice",
  ],
  NC: [
    "NCREC Education Provider certification filing in the current Education Provider portal",
    "NCREC Broker Prelicensing course approval filing with current 75-hour syllabus/course guide",
    "NCREC Prelicensing instructor approval filing and New Instructor Seminar evidence",
    "Policies and Procedures Disclosure receipt, course schedule/roster, completion-report, and monthly-summary workflows prescribed by 21 NCAC 58H",
  ],
  CO: [
    "DPOS Connect initial provisional Certificate of Approval application",
    "DPOS Connect new program / standalone course application for each required qualifying course as directed by DPOS",
    "DPOS school-agent permit filing when applicable",
    "DPOS catalog, enrollment agreement, bond/financial, ownership, staff/instructor, delivery, and program exhibits",
    "Colorado DRE REC-33 completion certificate record for each qualifying course",
  ],
};

const C = (id, state, title, hours, route, modules, extra = {}) => ({
  id, state, title, hours, route, modules, version: "1.0", ...extra,
});
const M = (id, title, hours, authority, topics, core = []) => ({ id, title, hours, authority, topics, core });

const courses = [
  C("az-salesperson-prelicense-90-v1", "AZ", "Arizona Salesperson Pre-License 90h", 90, "/real-estate/arizona/pre-license/salesperson/", [
    M("AZ90-01", "Property, ownership, and land use", 8, "A.R.S. § 32-2124 and current ADRE prelicense outline", ["Real property and personal property", "Fixtures and trade fixtures", "Estates and ownership", "Legal descriptions", "Easements and encumbrances", "Government powers", "Zoning and subdivision", "Environmental and water issues"], ["NC-OWN"]),
    M("AZ90-02", "Real estate law and professional scope", 8, "Current ADRE prelicense outline", ["Sources of real estate law", "Arizona statutes and Commissioner's Rules", "Legal capacity and authority", "Unauthorized practice of law", "Statute of Frauds", "Electronic records", "Consumer-protection method", "Professional referral and documentation"], ["NC-CON"]),
    M("AZ90-03", "Brokerage relationships and agency", 9, "Current ADRE prelicense outline and Arizona license law", ["Agency creation", "Fiduciary duties", "Clients and customers", "Broker supervision", "Salesperson duties", "Compensation and antitrust", "Disclosure and conflicts", "Termination", "Arizona agency case"], ["NC-AGY"]),
    M("AZ90-04", "Contracts and transaction documents", 14, "Current ADRE prelicense outline", ["Contract elements", "Offer and acceptance", "Consideration and capacity", "Performance and breach", "Remedies", "Purchase contracts", "Contingencies", "Addenda", "Counteroffers", "Options and rights", "Leases", "Electronic signatures", "Document chronology", "Contract case"], ["NC-CON"]),
    M("AZ90-05", "Title and transfer", 8, "Current ADRE prelicense outline", ["Deeds", "Delivery and acceptance", "Recording", "Title evidence", "Escrow", "Voluntary transfer", "Involuntary transfer", "Arizona title case"], ["NC-TTL"]),
    M("AZ90-06", "Financing and calculations", 10, "Current ADRE prelicense outline", ["Notes and deeds of trust", "Loan markets", "Conventional financing", "FHA and VA orientation", "Qualification", "Loan-to-value", "Interest and amortization", "Points and mortgage insurance", "Default and foreclosure", "Settlement math"], ["NC-FIN"]),
    M("AZ90-07", "Valuation and investment", 8, "Current ADRE prelicense outline", ["Value principles", "Highest and best use", "Sales comparison", "Cost approach", "Income approach", "Depreciation", "CMA and appraisal roles", "Investment risk and return"], ["NC-VAL", "NC-INV"]),
    M("AZ90-08", "Leasing and property management", 7, "Current ADRE prelicense outline", ["Leasehold estates", "Lease terms", "Management agreements", "Rent and deposits", "Maintenance and risk", "Landlord-tenant orientation", "Management case"], ["NC-PM"]),
    M("AZ90-09", "Fair housing, disclosures, and risk", 8, "Current ADRE prelicense outline", ["Federal fair housing", "Arizona fair housing layer", "Advertising", "Disability accommodation", "Property disclosures", "Environmental disclosure", "Misrepresentation and fraud", "Risk-management file"], ["NC-FH"]),
    M("AZ90-10", "Arizona-specific law, forms, and integrated practice", 10, "A.R.S. § 32-2124 Arizona-specific instruction", ["ADRE authority and licensing", "Arizona broker records", "Arizona trust and escrow controls", "Arizona subdivisions and public reports", "Arizona water disclosure", "Arizona residential resale transaction", "Arizona agency disclosure", "Arizona contract form orientation", "Arizona disciplinary scenarios", "Integrated Arizona case"], []),
  ], { exam: { forms: 1, questions: 90, bankRatio: 2, pass: 75, proctor: "ADRE SPS 2025.01 compliant proctoring; final not on a student-supplied device", regulatory: true }, enrollmentDays: null, azSpecificMinimum: 27 }),

  C("az-contract-writing-6-v1", "AZ", "Arizona Contract Writing 6h", 6, "/real-estate/arizona/pre-license/contract-writing/", [
    M("AZCW-01", "Arizona purchase contract structure", 2, "ADRE 6-Hour Contract Writing application", ["Parties, property, price, and acceptance", "Financing, title, escrow, closing, and possession"], ["NC-CON"]),
    M("AZCW-02", "Contingencies, addenda, and counteroffers", 1, "ADRE 6-Hour Contract Writing application", ["Inspection, financing, appraisal, addenda, counteroffers, and change control"], ["NC-CON"]),
    M("AZCW-03", "Disclosure and agency documents", 1, "ADRE 6-Hour Contract Writing application", ["Seller disclosure, agency disclosure, lead-based paint, and material-fact documentation"], ["NC-AGY"]),
    M("AZCW-04", "Closing and transaction-file documents", 1, "ADRE 6-Hour Contract Writing application", ["Notices, amendments, escrow evidence, closing documents, and retention"], ["NC-TTL"]),
    M("AZCW-05", "Integrated contract-writing case", 1, "ADRE 6-Hour Contract Writing application", ["Prepare, audit, explain, and correct an Arizona contract file without unauthorized legal practice"], []),
  ], { exam: { forms: 1, questions: 20, bankRatio: 2, pass: 75, proctor: "Course-approval configuration; no requirement imported from the 90-hour final", regulatory: false } }),

  C("wa-real-estate-fundamentals-60-v1", "WA", "Washington Real Estate Fundamentals 60h", 60, "/real-estate/washington/pre-license/fundamentals/", [
    M("WAF-01", "Property and ownership", 10, "Current DOL Real Estate Fundamentals curriculum", ["Real and personal property", "Fixtures", "Estates", "Concurrent ownership", "Condominiums and common interests", "Legal descriptions", "Easements", "Liens", "Government powers", "Environmental matters"], ["NC-OWN"]),
    M("WAF-02", "Land use and development", 6, "Current DOL Real Estate Fundamentals curriculum", ["Zoning", "Subdivision", "Building regulation", "Private controls", "Survey and site issues", "Development analysis"], ["NC-OWN"]),
    M("WAF-03", "Valuation", 6, "Current DOL Real Estate Fundamentals curriculum", ["Value principles", "Highest and best use", "Sales comparison", "Cost approach", "Income approach", "CMA and appraisal roles"], ["NC-VAL"]),
    M("WAF-04", "Contracts", 10, "Current DOL Real Estate Fundamentals curriculum", ["Formation", "Capacity and consideration", "Statute of Frauds", "Offer and acceptance", "Performance", "Breach and remedies", "Purchase agreements", "Contingencies", "Leases", "Contract case"], ["NC-CON"]),
    M("WAF-05", "Agency and brokerage", 8, "Current DOL Real Estate Fundamentals curriculum", ["Agency creation", "Duties", "Clients and customers", "Disclosure", "Compensation", "Antitrust", "Termination", "Brokerage case"], ["NC-AGY"]),
    M("WAF-06", "Finance", 8, "Current DOL Real Estate Fundamentals curriculum", ["Notes and security instruments", "Loan markets", "Loan programs", "Qualification", "LTV and ratios", "Interest", "Amortization", "Default"], ["NC-FIN"]),
    M("WAF-07", "Transfer and settlement", 6, "Current DOL Real Estate Fundamentals curriculum", ["Deeds", "Recording", "Title evidence", "Voluntary and involuntary transfer", "Escrow and settlement", "Prorations"], ["NC-TTL"]),
    M("WAF-08", "Federal practice and applied review", 6, "Current DOL Real Estate Fundamentals curriculum", ["Federal fair housing", "Federal disclosure", "Consumer credit orientation", "Property management foundations", "Investment foundations", "Integrated fundamentals case"], ["NC-FH", "NC-PM", "NC-INV"]),
  ], { exam: { forms: 1, questions: 180, bankRatio: 1, pass: 70, proctor: "Secure school examination; no separate proctor mandate identified in WAC 308-124H", regulatory: true } }),

  C("wa-real-estate-practices-30-v1", "WA", "Washington Real Estate Practices 30h", 30, "/real-estate/washington/pre-license/practices/", [
    M("WAP-01", "Washington license law and supervision", 5, "Current DOL Real Estate Practices curriculum", ["DOL and Commission authority", "License categories", "Firm and managing broker supervision", "Advertising", "Records"], []),
    M("WAP-02", "Washington brokerage relationships", 5, "Current DOL Real Estate Practices curriculum", ["Washington agency law", "Duties to parties", "Consent and disclosure", "Compensation", "Agency case"], ["NC-AGY"]),
    M("WAP-03", "Washington contracts and forms", 8, "Current DOL Real Estate Practices curriculum", ["Form selection", "Purchase and sale agreement", "Financing contingencies", "Inspection contingencies", "Addenda", "Counteroffers", "Amendments and notices", "Contract file audit"], ["NC-CON"]),
    M("WAP-04", "Seller and buyer transaction practice", 5, "Current DOL Real Estate Practices curriculum", ["Listing intake", "Seller disclosure", "Buyer consultation", "Offers and presentation", "Transaction coordination"], ["NC-AGY"]),
    M("WAP-05", "Finance, escrow, and closing", 4, "Current DOL Real Estate Practices curriculum", ["Financing file", "Earnest money", "Escrow", "Closing and settlement"], ["NC-FIN", "NC-TTL"]),
    M("WAP-06", "Fair housing, property management, and risk", 3, "Current DOL Real Estate Practices curriculum", ["Washington/federal fair housing", "Property management practice", "Professional risk and integrated case"], ["NC-FH", "NC-PM"]),
  ], { exam: { forms: 1, questions: 90, bankRatio: 1, pass: 70, proctor: "Secure school examination; no separate proctor mandate identified in WAC 308-124H", regulatory: true } }),

  C("pa-real-estate-fundamentals-30-v1", "PA", "Pennsylvania Real Estate Fundamentals 30h", 30, "/real-estate/pennsylvania/pre-license/fundamentals/", [
    M("PAF-01", "Real estate law and legal concepts", 6, "Commission Real Estate Fundamentals outline", ["Sources of law", "Real versus personal property", "Fixtures", "Legal capacity", "Professional scope", "Applied legal concepts"], ["NC-OWN"]),
    M("PAF-02", "Interests, ownership, and legal descriptions", 5, "Commission Real Estate Fundamentals outline", ["Estates", "Concurrent ownership", "Easements", "Liens", "Legal descriptions"], ["NC-OWN"]),
    M("PAF-03", "Land use and environmental controls", 3, "Commission Real Estate Fundamentals outline", ["Government powers", "Zoning and subdivision", "Environmental concerns"], ["NC-OWN"]),
    M("PAF-04", "Valuation", 4, "Commission Real Estate Fundamentals outline", ["Value principles", "Sales comparison", "Cost approach", "Income approach"], ["NC-VAL"]),
    M("PAF-05", "Finance", 5, "Commission Real Estate Fundamentals outline", ["Notes and mortgages", "Loan markets", "Qualification", "Interest and amortization", "Default and foreclosure"], ["NC-FIN"]),
    M("PAF-06", "Transfer and title", 3, "Commission Real Estate Fundamentals outline", ["Deeds", "Recording and title evidence", "Voluntary/involuntary transfer"], ["NC-TTL"]),
    M("PAF-07", "Contract foundations", 2, "Commission Real Estate Fundamentals outline", ["Formation and performance", "Breach and remedies"], ["NC-CON"]),
    M("PAF-08", "Fair housing and real estate math", 2, "Commission Real Estate Fundamentals outline", ["Federal fair housing", "Core transaction calculations"], ["NC-FH", "NC-FIN"]),
  ], { exam: { forms: 1, questions: 75, bankRatio: 1, pass: null, proctor: "Proctored prelicense final under 49 Pa. Code § 35.358", regulatory: false } }),

  C("pa-real-estate-practice-45-v1", "PA", "Pennsylvania Real Estate Practice 45h", 45, "/real-estate/pennsylvania/pre-license/practice/", [
    M("PAP-01", "Pennsylvania license law and brokerage", 6, "Commission Real Estate Practice outline", ["Commission authority", "Licensing", "Broker supervision", "Advertising", "Records", "Discipline"], []),
    M("PAP-02", "Agency and consumer relationships", 6, "Commission Real Estate Practice outline", ["Agency creation", "Duties", "Consumer Notice", "Disclosure", "Conflicts", "Termination"], ["NC-AGY"]),
    M("PAP-03", "Listing practice", 5, "Commission Real Estate Practice outline", ["Seller consultation", "Listing agreement", "Pricing", "Property disclosure", "Marketing"], ["NC-AGY"]),
    M("PAP-04", "Buyer practice", 5, "Commission Real Estate Practice outline", ["Buyer consultation", "Buyer agreement", "Property search", "Showing", "Offer strategy"], ["NC-AGY"]),
    M("PAP-05", "Pennsylvania contracts and forms", 7, "Commission Real Estate Practice outline", ["Agreement of sale", "Contingencies", "Addenda", "Counteroffers", "Amendments", "Notices", "Contract file"], ["NC-CON"]),
    M("PAP-06", "Financing practice", 4, "Commission Real Estate Practice outline", ["Loan application", "Qualification", "Financing contingencies", "Mortgage disclosure"], ["NC-FIN"]),
    M("PAP-07", "Closing and title practice", 4, "Commission Real Estate Practice outline", ["Title review", "Escrow", "Closing documents", "Prorations"], ["NC-TTL"]),
    M("PAP-08", "Leasing and property management", 3, "Commission Real Estate Practice outline", ["Leases", "Management agreements", "Operations and risk"], ["NC-PM"]),
    M("PAP-09", "Fair housing and consumer protection", 3, "Commission Real Estate Practice outline", ["Federal/Pennsylvania fair housing", "Consumer protection", "Disclosure case"], ["NC-FH"]),
    M("PAP-10", "Professional conduct and integrated practice", 2, "Commission Real Estate Practice outline", ["Professional boundaries", "Integrated transaction case"], ["NC-AGY"]),
  ], { exam: { forms: 1, questions: 90, bankRatio: 1, pass: null, proctor: "Proctored prelicense final under 49 Pa. Code § 35.358", regulatory: false } }),

  C("nc-broker-prelicensing-75-v1", "NC", "North Carolina Broker Prelicensing 75h", 75, "/real-estate/north-carolina/pre-license/broker/", [
    M("NCB-01", "License law and brokerage regulation", 5, "Current NCREC Broker Prelicensing syllabus", ["Commission authority", "Broker license", "Firm and BIC", "Education and examination", "Discipline"], []),
    M("NCB-02", "Property concepts and ownership", 5, "Current NCREC syllabus", ["Real/personal property", "Fixtures", "Estates", "Concurrent ownership", "Common interests"], ["NC-OWN"]),
    M("NCB-03", "Title, legal descriptions, and transfer", 5, "Current NCREC syllabus", ["Legal descriptions", "Deeds", "Recording", "Title evidence", "Transfer"], ["NC-TTL"]),
    M("NCB-04", "Land use and environmental matters", 5, "Current NCREC syllabus", ["Government powers", "Zoning", "Subdivision", "Private controls", "Environmental issues"], ["NC-OWN"]),
    M("NCB-05", "Brokerage relationships and agency", 5, "Current NCREC syllabus", ["Agency formation", "Duties", "Working With Real Estate Agents disclosure", "Dual agency", "Termination"], ["NC-AGY"]),
    M("NCB-06", "Contract law", 5, "Current NCREC syllabus", ["Formation", "Capacity and consideration", "Statute of Frauds", "Performance", "Breach/remedies"], ["NC-CON"]),
    M("NCB-07", "North Carolina sales contracts and forms", 5, "Current NCREC syllabus", ["Offer to Purchase and Contract", "Contingencies", "Addenda", "Counteroffers", "Transaction file"], ["NC-CON"]),
    M("NCB-08", "Real estate finance", 5, "Current NCREC syllabus", ["Notes/security instruments", "Loan types", "Qualification", "Interest/amortization", "Default"], ["NC-FIN"]),
    M("NCB-09", "Valuation and brokerage pricing", 5, "Current NCREC syllabus", ["Value principles", "Sales comparison", "Cost", "Income", "CMA versus appraisal"], ["NC-VAL"]),
    M("NCB-10", "Real estate calculations", 5, "Current NCREC syllabus", ["Area/acreage", "Commission", "Taxes", "Prorations", "Loan calculations"], ["NC-FIN"]),
    M("NCB-11", "Fair housing and consumer protection", 5, "Current NCREC syllabus", ["Federal/NC fair housing", "Advertising", "Disability", "Disclosure", "Consumer case"], ["NC-FH"]),
    M("NCB-12", "Leasing and property management", 5, "Current NCREC syllabus", ["Lease estates", "Residential rental law", "Management agreements", "Deposits", "Operations"], ["NC-PM"]),
    M("NCB-13", "Construction, insurance, and property condition", 5, "Current NCREC syllabus", ["Construction vocabulary", "Systems", "Insurance", "Inspections", "Condition disclosures"], ["NC-OWN"]),
    M("NCB-14", "Closing, settlement, and taxation", 5, "Current NCREC syllabus", ["Closing process", "Settlement documents", "Trust funds", "Prorations", "Tax orientation"], ["NC-TTL"]),
    M("NCB-15", "Integrated North Carolina brokerage practice", 5, "Current NCREC syllabus", ["Seller file", "Buyer file", "Agency case", "Contract-to-closing case", "Final review/remediation"], []),
  ], { exam: { forms: 1, questions: 100, bankRatio: 1, pass: 75, proctor: "Proctored, closed-book, identity-verified end-of-course examination", regulatory: true }, enrollmentDays: 180 }),

  ...coCourses(),
];

function coCourses() {
  const defs = [
    ["co-real-estate-law-practice-48-v1", "Colorado Real Estate Law and Practice 48h", 48, "/real-estate/colorado/qualifying/law-and-practice/", [
      ["COLP-01", "Colorado licensing and regulation", 6, ["Commission/Division authority", "Broker credentials", "Employing broker supervision", "Office policy", "Discipline", "Records"]],
      ["COLP-02", "Property law and ownership", 6, ["Real property", "Estates", "Concurrent ownership", "Common interests", "Easements", "Liens"]],
      ["COLP-03", "Agency and brokerage relationships", 6, ["Brokerage relationships", "Duties", "Disclosures", "Conflicts", "Compensation", "Termination"]],
      ["COLP-04", "Contracts and transaction law", 6, ["Contract law", "Listing contracts", "Buyer agreements", "Purchase contracts", "Breach", "Remedies"]],
      ["COLP-05", "Finance", 6, ["Notes/deeds of trust", "Loan programs", "Qualification", "Interest", "Default", "Foreclosure"]],
      ["COLP-06", "Title and transfer", 6, ["Deeds", "Recording", "Title evidence", "Liens", "Transfer", "Title case"]],
      ["COLP-07", "Valuation, land use, and environment", 6, ["Valuation", "CMA", "Zoning", "Subdivision", "Environmental issues", "Expert referral"]],
      ["COLP-08", "Fair housing, leasing, and professional practice", 6, ["Fair housing", "Leases", "Property management", "Advertising", "Risk", "Integrated practice"]],
    ]],
    ["co-contracts-regulations-48-v1", "Colorado Contracts and Regulations 48h", 48, "/real-estate/colorado/qualifying/contracts-and-regulations/", [
      ["COCR-01", "Colorado Commission rules and brokerage duties", 6, ["Commission rules", "Employing broker duties", "Broker relationships", "Supervision", "Records", "Discipline"]],
      ["COCR-02", "Listing and buyer contracts", 6, ["Listing contract", "Buyer listing", "Duties", "Compensation", "Termination", "File controls"]],
      ["COCR-03", "Contract to Buy and Sell", 6, ["Parties/property", "Price/terms", "Dates/deadlines", "Closing/possession", "Signatures", "Mutual execution"]],
      ["COCR-04", "Title, off-record matters, and association documents", 6, ["Title commitments", "Off-record matters", "HOA documents", "Objections", "Resolution", "Notices"]],
      ["COCR-05", "Property condition and due diligence", 6, ["Seller disclosure", "Inspection", "Due diligence", "Survey", "Environmental", "Termination"]],
      ["COCR-06", "Finance and appraisal provisions", 6, ["Loan terms", "Loan availability", "Appraisal", "Seller financing", "Assumption", "Default risk"]],
      ["COCR-07", "Addenda, counterproposals, amendments, and notices", 6, ["Counterproposal", "Amend/extend", "Notice to terminate", "Earnest money release", "Addenda", "Document chronology"]],
      ["COCR-08", "Integrated Colorado contract file", 6, ["Seller file", "Buyer file", "Multiple offers", "Transaction deadlines", "Closing preparation", "Audit/remediation"]],
    ]],
    ["co-trust-accounts-recordkeeping-8-v1", "Colorado Trust Accounts and Record-Keeping 8h", 8, "/real-estate/colorado/qualifying/trust-accounts/", [
      ["COTA-01", "Trust funds and accounts", 2, ["Trust-fund identification", "Account structure"]],
      ["COTA-02", "Deposits, disbursements, and disputes", 2, ["Deposit timing", "Authorized disbursement"]],
      ["COTA-03", "Ledgers and reconciliation", 2, ["Transaction ledgers", "Three-way reconciliation"]],
      ["COTA-04", "Retention, audit, and case", 2, ["Records and retention", "Trust-account audit case"]],
    ]],
    ["co-current-legal-issues-8-v1", "Colorado Current Legal Issues 8h", 8, "/real-estate/colorado/qualifying/current-legal-issues/", [
      ["COCLI-01", "Current statutes and Commission rules", 2, ["Controlled current-law update", "Effective-date analysis"]],
      ["COCLI-02", "Current forms and contracts", 2, ["Current form revisions", "Transaction impact"]],
      ["COCLI-03", "Current cases, enforcement, and risk", 2, ["Case/enforcement review", "Risk controls"]],
      ["COCLI-04", "Integrated current-issues workshop", 2, ["Current legal scenario", "Source/change-control exercise"]],
    ]],
    ["co-real-estate-closings-24-v1", "Colorado Real Estate Closings 24h", 24, "/real-estate/colorado/qualifying/closings/", [
      ["COCL-01", "Contract-to-closing workflow", 4, ["Dates/deadlines", "Closing responsibilities", "File checklist", "Communication"]],
      ["COCL-02", "Title and payoff", 4, ["Title commitment", "Exceptions", "Liens/payoffs", "Objections"]],
      ["COCL-03", "Closing statements and calculations", 4, ["Debits/credits", "Prorations", "Commission", "Net proceeds"]],
      ["COCL-04", "Loan and federal closing documents", 4, ["Loan documents", "Loan Estimate/Closing Disclosure", "Funding", "Lender conditions"]],
      ["COCL-05", "Deeds, settlement, and post-closing", 4, ["Deeds", "Execution/acknowledgment", "Recording", "Post-closing file"]],
      ["COCL-06", "Integrated closing files", 4, ["Buyer closing", "Seller closing", "Error correction", "Closing audit"]],
    ]],
    ["co-practical-applications-32-v1", "Colorado Practical Applications 32h", 32, "/real-estate/colorado/qualifying/practical-applications/", [
      ["COPA-01", "New-broker professional setup", 4, ["Brokerage selection", "Office policy", "Supervision", "Business practice"]],
      ["COPA-02", "Seller representation file", 4, ["Seller consultation", "Listing", "Disclosure", "Marketing"]],
      ["COPA-03", "Buyer representation file", 4, ["Buyer consultation", "Agreement", "Showing", "Offer"]],
      ["COPA-04", "Contract negotiation and management", 4, ["Offer/counter", "Deadlines", "Amendments", "Communication"]],
      ["COPA-05", "Inspection, title, appraisal, and loan problems", 4, ["Inspection issue", "Title issue", "Appraisal issue", "Loan issue"]],
      ["COPA-06", "Closing and post-closing", 4, ["Closing preparation", "Walk-through", "Possession", "File closeout"]],
      ["COPA-07", "Leasing, property management, and fair housing", 4, ["Leasing", "Management", "Fair housing", "Risk"]],
      ["COPA-08", "Integrated capstone", 4, ["Full transaction", "Ethics/risk", "Audit record", "Readiness/remediation"]],
    ]],
  ];
  return defs.map(([id, title, hours, route, rows]) => C(id, "CO", title, hours, route, rows.map(([mid, mt, mh, topics]) => M(mid, mt, mh, "Colorado DRE official qualifying course outline", topics, [])), {
    exam: { forms: 1, questions: Math.max(25, hours * 2), bankRatio: 1, pass: null, proctor: "DPOS-approved course policy; no universal DRE course-final score identified", regulatory: false },
  }));
}

function assertCourses() {
  for (const course of courses) {
    const sum = course.modules.reduce((total, module) => total + module.hours, 0);
    if (sum !== course.hours) throw new Error(`${course.id}: ${sum} != ${course.hours}`);
  }
  const co = courses.filter((course) => course.state === "CO").reduce((sum, course) => sum + course.hours, 0);
  if (co !== 168) throw new Error(`Colorado total ${co} != 168`);
}

const stateLayer = (course, module) => {
  const m = stateMeta[course.state];
  return `Apply ${module.authority} and the controlled ${m.name} source register. A national concept may be reused for explanation, but ${m.name} terminology, forms, examples, citations, assessments, version, and approval record remain independent. When a source or form changes, new enrollment is held until impact review is recorded.`;
};

function unitText(course, module, topic, hour) {
  return `### Learning objectives

By the end of this unit, the student can:

1. explain **${topic.toLowerCase()}** with accurate entry-level professional vocabulary;
2. apply it to a ${stateMeta[course.state].name} transaction fact pattern;
3. distinguish the licensee's permitted task from legal, tax, appraisal, lending, inspection, engineering, or surveying work; and
4. identify the controlling source, required communication, and retained evidence.

### Instructional lesson

**Rule and purpose.** ${topic} is studied within ${module.title}. The student identifies the parties, property, money, documents, deadlines, disclosures, and consumer-protection purpose. The rule is applied only after its current effective date and form edition are checked.

**Transaction method.** Read the file chronologically: source document, known facts, missing facts, decision point, permitted broker action, consumer communication, performance, and retained evidence. A compliant response verifies material facts from an appropriate source, stays within the broker's role, uses the current approved document when required, communicates promptly, and escalates unresolved professional questions.

**${stateMeta[course.state].name} layer.** ${stateLayer(course, module)}

**Common error.** Custom, memory, another state's form, a payment event, or a technology default never replaces the controlling state rule or an approval condition. The audit file records what was checked, when it was checked, the result, and who was responsible.

### Applied exercise

Analyze a ${stateMeta[course.state].name} transaction involving **${topic.toLowerCase()}**. Prepare a five-entry compliance note: known fact; missing fact; controlling source; permitted action; required follow-up/referral. Then select the document or record that proves the action occurred.

### Scored check and remediation

The LMS presents a scenario-based item after the lesson and applied exercise. A correct response requires the current state source, verified facts, professional-scope limit, and audit evidence. An incorrect response opens an alternate explanation, a different transaction example, and a parallel scored item. Answers are not shown before submission. Unit ${String(hour).padStart(3, "0")} earns no completion credit until the configured active-time, content, exercise, check, remediation, identity, and sequencing controls are satisfied.`;
}

function outline(course) {
  let first = 1;
  const rows = course.modules.map((module) => {
    const last = first + module.hours - 1;
    const row = `| ${module.id} | ${module.title} | ${first}–${last} | ${module.hours} | ${module.authority} |`;
    first = last + 1;
    return row;
  });
  return `# ${course.title} v1.0 — Timed Course Outline

Status: **Development — not approved — enrollment disabled**  
Official-source review: ${reviewDate}

| Module | Subject | Units | Hours | Controlling mapping |
|---|---|---:|---:|---|
${rows.join("\n")}
|  | **Total** |  | **${course.hours}** |  |

Topic-hour allocations are StateCourse's submission proposal unless the cited regulator outline assigns them. They become regulatory delivery commitments only after acceptance. Final-examination time is excluded from instructional hours where the controlling state rule requires that separation.
`;
}

function curriculum(course) {
  let hour = 1;
  const result = [`# ${course.title} v1.0 — Unit-by-Unit Curriculum`, "", "**Development draft. No enrollment, credit, or certificate.**", ""];
  for (const courseModule of course.modules) {
    result.push(`## ${courseModule.id} — ${courseModule.title}`, "", `Authority mapping: ${courseModule.authority}`, "");
    for (let i = 0; i < courseModule.hours; i += 1, hour += 1) {
      const topic = courseModule.topics[i % courseModule.topics.length];
      result.push(`## Unit ${String(hour).padStart(3, "0")} — ${topic}`, "", `Module: ${courseModule.id} · Proposed clock hours: 1 · Content layer: ${courseModule.core.join(", ") || `${course.state}-specific`}`, "", unitText(course, courseModule, topic, hour), "");
    }
  }
  return result.join("\n");
}

function sourceRegister(state) {
  const meta = stateMeta[state];
  return `# ${meta.name} Official Source Register

Last verified: **${reviewDate}**. Official regulator, legislature/rule publisher, and current regulator forms control. Missing or ambiguous requirements remain filing questions; another state's rule is never substituted.

${sources[state].map(([name, url, use], index) => `${index + 1}. [${name}](${url}) — ${use}`).join("\n")}

## Release control

All sources are checked again on filing day, on regulator correction, before each controlled release, and before enrollment after a legal/form change. A snapshot, checksum, effective date, reviewer, and impact decision belong in the regulatory-document record.
`;
}

function complianceMatrix(state) {
  const meta = stateMeta[state];
  const stateCourses = courses.filter((course) => course.state === state);
  const courseText = stateCourses.map((course) => `${course.title} (${course.hours}h)`).join("; ");
  const rows = [
    ["Provider / school", meta.provider, "Separate provider/school approval record, application index, ownership/administrator exhibits, status and dates", "Development; filing gate"],
    ["Instructor", "Current instructor rule/application", "Separate instructor approval records and course assignments; no owner is presumed eligible", "Unassigned; release gate"],
    ["Courses", "Current state course rule and regulator outline", courseText, "Separate v1.0 approval records"],
    ["Distance delivery", "Current state distance rule/application", meta.delivery, "Configured; acceptance pending"],
    ["Assessments", "Course-specific rule/application", "Versioned formative pools, remediation, secure finals and attempt audit", "Draft; SME/psychometric/regulator review pending"],
    ["Identity / attendance", "Course-specific distance standard", "Authentication, no concurrent sessions, server time, inactivity exclusion, unit progression, assessment evidence, reviewer bypass isolation", "Configured per course"],
    ["Certificate", "Current state certificate/transcript rule", "State/course/version/approval/instructor/student/hours/date and verification fields", "Controlled template; issuance disabled"],
    ["Records", "Current state rule", meta.records, "Data model and policy built"],
    ["Reporting", "Current state rule/application", meta.reporting, "Workflow configured; regulator credentials pending"],
    ["Renewal", "Current approval lifecycle", meta.renewals, "Independent approval dates required"],
    ["Enrollment and advertising", "StateCourse approval gate", "No Approved/State Approved/Enroll Now/payment/credit until administrator records valid regulator approval", "Enforced"],
  ];
  return `# ${meta.name} Regulatory Compliance and Traceability Matrix

Verified ${reviewDate}. StateCourse design choices are labeled as provider proposals, never state mandates.

| Requirement | Controlling source | StateCourse evidence | Status |
|---|---|---|---|
${rows.map((row) => `| ${row.join(" | ")} |`).join("\n")}

## Approval records

${meta.approvals.map((record) => `- \`${state.toLowerCase()}_${record}\`: status Development; approval number/effective/expiration blank; enrollment dependency active.`).join("\n")}
`;
}

function feesAndApplications(state) {
  const meta = stateMeta[state];
  return `# ${meta.name} Provider, School, Instructor, and Course Application Package

## Filing order

1. Confirm entity eligibility and regulator account/portal.
2. File ${meta.provider} with ownership, administrators/director, location/delivery, financial/bond, catalog, enrollment agreement, refund/cancellation, records, and advertising exhibits required by the current form.
3. File each instructor separately with qualification evidence and course scope.
4. File every regulatory course separately with the exact title, hours, outline, curriculum, objectives, materials, assessments, final/key, evaluation, certificate, delivery method, reviewer access, and policies.
5. Record regulator corrections, approval number, effective date, expiration, approved delivery method, instructor scope, and renewal schedule before public activation.

## Current form/fee register

${formRegisters[state].map((form) => `- ${form}`).join("\n")}

## Current fee register

| Filing | Current amount | Control note |
|---|---:|---|
${meta.fees.map((row) => `| ${row.join(" | ")} |`).join("\n")}

Fees are point-in-time regulatory data. The administrator must attach the filing-day official fee page or portal receipt; the platform does not silently reuse an old amount.

## Required submission exhibits

- official-source register and compliance matrix;
- entity, owner, administrator/director, school/location, bond/financial, and agent exhibits as applicable;
- course application and regulator-outline crosswalk for each course;
- complete student/instructor materials, timed outline, objectives, activities, assessments, remediation, secure final, and answer key;
- identity, attendance/time, inactivity, support, accessibility, technical, security, proctor/reviewer, records, certificate, reporting, evaluation, complaint, refund/cancellation, and change-control policies;
- instructor approval file and assignment;
- regulator correction log and final version manifest.
`;
}

function syllabus(course) {
  const meta = stateMeta[course.state];
  const pass = course.exam.pass == null ? "Provider proposal withheld until regulator-approved standard is recorded" : `${course.exam.pass}%`;
  return `# ${course.title} v1.0 — Course Syllabus

**Regulator:** ${meta.regulator}  
**Hours:** ${course.hours}  
**Status:** Development; not approved; enrollment disabled  
**Instructor:** Unassigned; state approval/qualification and course assignment required

## Learning outcomes

Students completing an approved release will explain the prescribed subjects, apply ${meta.name} law/forms to entry-level facts, perform required calculations, recognize professional-scope limits, and produce an auditable transaction response.

## Delivery and completion

${meta.delivery} The exact course configuration controls active time, sequence, units, interactions, assessment, remediation, identity, inactivity, final eligibility, completion period, and proctoring. Payment never determines completion or credit.

## Assessment

Formative checks and module quizzes trigger objective-specific remediation. Draft final configuration: ${course.exam.forms} form(s), ${course.exam.questions} items/form, passing standard: ${pass}. ${course.exam.proctor}. Any item count not prescribed by the regulator is a StateCourse submission proposal.
`;
}

function adminPolicy(course) {
  const meta = stateMeta[course.state];
  return `# ${course.title} — Course Administration, Identity, Attendance, Records, and Reporting

## Approval gate

Checkout, enrollment, official study time, final eligibility, completion, certificate, and regulator reporting remain disabled until the exact v1.0 course, school/provider, delivery method, and assigned instructor are validly approved and the administrator records their numbers and dates.

## Identity and engagement

- authenticated legal-name student profile and course-specific enrollment;
- state-approved identity method and proctor method where applicable;
- single active session, device/session/IP metadata where lawful and appropriate;
- server-authoritative timestamps and active engagement; idle/hidden/disconnected time excluded;
- unit/content/activity/check/remediation completion and immutable attempt ledger;
- student sequencing enforced; authorized regulator/reviewer bypass produces no student credit;
- instructor support and accessibility/technical-support events retained.

## Records and reporting

${meta.records}

${meta.reporting}

## Integrity and changes

Every approval, source, policy, lesson, question, certificate, instructor assignment, completion, correction, and regulator communication is versioned. Ordinary administrators cannot overwrite historical completion evidence; corrections are append-only and attributed.
`;
}

function instructorFile(course) {
  const meta = stateMeta[course.state];
  return `# ${course.title} — Instructor Approval and Assignment File

Assignment: **Unassigned — production release gate**

The file must contain the current ${meta.name} instructor application/approval or DPOS-qualified staff record, approved subject scope, approval number, effective/expiration dates, résumé/CV, education, licenses, experience, teaching-method evidence, background/disclosure material, renewal evidence, availability/response commitments, and course assignment. No owner, contractor, author, or reviewer is deemed qualified without the applicable state record.
`;
}

function instructorGuide(course) {
  const modules = course.modules.map((module) => `| ${module.id} | ${module.title} | ${module.hours} | Check the current source/form edition; review quiz analytics; answer scope questions; approve remediation escalation notes. |`).join("\n");
  return `# ${course.title} — Instructor Guide

The assigned instructor must be eligible for this exact state and subject scope before any student enrollment. The LMS supplies current-source links, lesson objectives, student attempts, remediation history, help requests, and version context; it does not replace instructor judgment or regulator approval.

| Module | Subject | Hours | Instructor control |
|---|---|---:|---|
${modules}

## Student support

Answer within the state/course-approved response window. Correct misconceptions with an alternate explanation and scenario; do not reveal secure answers as remediation. Repeated failure, the same misconception, an integrity anomaly, or a help request creates an attributed support record. Do not change credited time, scores, or completion silently.

## Version and source control

Before facilitating a changed lesson, verify the course version, regulator approval record, current form/source snapshot, and change classification. Escalate legal questions and regulator ambiguities; do not invent a rule or import another state's practice.
`;
}

function studentHandbook(course) {
  const meta = stateMeta[course.state];
  return `# ${course.title} — Student Handbook and Required Disclosures Draft

## Public and enrollment status

This v1.0 course is **in development and not approved**. Enrollment, payment, regulated study time, credit, final eligibility, and certificates are disabled. Final disclosures, refund/cancellation terms, price, instructor, approval number, effective dates, complaint contacts, and access period require approved versions before checkout.

## How an approved online course will work

The student completes the required identity step, reviews and accepts versioned disclosures, and accesses only the purchased course after verified payment. Active instructional time excludes inactivity, hidden-tab time, and disconnection. Required content, applied work, scored checks, remediation, and assessments must be complete. The final and certificate follow only the ${meta.name} course configuration.

## Support, integrity, and records

Students receive instructor, technical, accessibility, complaint, cancellation, and refund contacts in the approved PPD/catalog/enrollment agreement. Sharing credentials, using unauthorized assistance, or defeating time/identity/exam controls is prohibited and documented. A reviewer bypass never creates student credit.
`;
}

function courseCrosswalk(course) {
  return `# ${course.title} — Regulator Outline Crosswalk

| Regulator subject / authority | StateCourse module | Hours | Evidence |
|---|---|---:|---|
${course.modules.map((module) => `| ${module.authority} | ${module.id} — ${module.title} | ${module.hours} | Timed outline; unit curriculum; quiz/remediation; final blueprint; instructor guide |`).join("\n")}
|  | **Total** | **${course.hours}** |  |

The filing reviewer must compare this table to a dated snapshot of the regulator's current outline. StateCourse allocations remain proposed until accepted.
`;
}

function studentEvaluation(course) {
  return `# ${course.title} — Student Evaluation and Quality Review

After completion, the student evaluates objective clarity, content accuracy, examples, activities, assessments, remediation, instructor response, technology/accessibility, identity/proctoring experience, and overall readiness. The system stores course ID/version, completion date, delivery method, instructor, anonymous/identified choice where permitted, rating, narrative, and follow-up consent.

Monthly quality review aggregates completion time, objective performance, remediation, instructor flags, support tickets, integrity events, evaluation results, and source changes. A trend can trigger content review or enrollment hold; it never rewrites historical student records.
`;
}

function certificate(course) {
  return `# ${course.title} — Controlled Completion Certificate

> PREVIEW ONLY — INVALID UNTIL APPROVAL AND SERVER VERIFICATION

- Student legal name: {{student_legal_name}}
- Provider/school legal name: StateCourse LLC
- Provider/school approval number: {{provider_approval_number}}
- Course title: ${course.title}
- Course version: 1.0
- Course approval number: {{course_approval_number}}
- Required/credited hours: ${course.hours}
- Start/completion date: {{start_date}} / {{completion_date}}
- Approved instructor: {{instructor_name}} / {{instructor_approval_number}}
- Final result when required: {{final_result}}
- Certificate ID and verification: {{certificate_id}} / {{verification_url}}
- Authorized signature: {{authorized_signatory}}

State-specific mandatory fields from the issued course approval are added before activation. A paid order cannot issue this certificate.
`;
}

function assessmentPlan(course) {
  return `# ${course.title} — Assessment, Remediation, and Final Plan

Each instructional unit has an applied task and scored check; each module has a versioned quiz. An incorrect response assigns an alternate explanation, a different scenario, and a parallel scored item. Repeated objective failures create an instructor-support record without silently altering progress.

Final configuration: ${course.exam.forms} secure form(s); ${course.exam.questions} items/form; bank ratio ${course.exam.bankRatio}:1; passing score ${course.exam.pass == null ? "not stated by the controlling source — regulator/provider approval decision required" : `${course.exam.pass}%`}; administration: ${course.exam.proctor}. The draft bank is non-public and requires legal, subject-matter, editorial, duplication, bias/accessibility, and psychometric review before filing/production.
`;
}

function examBank(course) {
  const count = course.exam.forms * course.exam.questions * (course.exam.bankRatio || 1);
  const topicList = course.modules.flatMap((module) => module.topics.map((topic) => ({ module, topic })));
  const result = [`# ${course.title} — Secure Draft Examination Bank`, "", "**CONFIDENTIAL — excluded from the public site and student assets**", "", `Structural bank: ${count} items. Every item requires legal, instructor/SME, editorial and psychometric validation.`, ""];
  for (let i = 0; i < count; i += 1) {
    const { module: courseModule, topic } = topicList[i % topicList.length];
    result.push(`## Bank Item ${String(i + 1).padStart(3, "0")}`, "", `**Objective:** ${courseModule.id} — ${topic}`, "", `A ${stateMeta[course.state].name} entry-level transaction raises an issue involving ${topic.toLowerCase()}. Which method best protects the consumer and the audit record?`, "", `A. Use another state's customary form without checking current ${stateMeta[course.state].name} authority.`, "B. Verify material facts, check the controlling current source/form, act within the broker's role, communicate and document, then refer unresolved specialized issues.", "C. Treat payment or LMS completion as permission to give legal, tax, lending, appraisal, inspection, or engineering advice.", "D. Omit the issue unless the transaction fails.", "", "**Key:** B", "", "**Rationale:** The approved-course method requires current state authority, verified facts, professional scope, communication, retained evidence, and referral.", "");
  }
  return result.join("\n");
}

function quizzes(course) {
  const result = [`# ${course.title} — Module Quiz and Remediation Bank`, "", "**CONFIDENTIAL — development bank**", ""];
  for (const courseModule of course.modules) {
    result.push(`## ${courseModule.id} — ${courseModule.title}`, "");
    courseModule.topics.forEach((topic, index) => result.push(`${index + 1}. **Scenario prompt:** Apply ${topic.toLowerCase()} to a ${stateMeta[course.state].name} file. State the current controlling source, material fact, permitted action, record, and referral point.`, "   **Answer standard:** Accurate concept; state-specific source/form; verified facts; role limit; prompt communication; retained evidence.", `   **Remediation:** Alternate explanation + worked ${topic.toLowerCase()} example + parallel scored scenario.`, ""));
  }
  return result.join("\n");
}

function config(course) {
  const state = course.state;
  const baseMinutes = state === "AZ" || state === "WA" || state === "PA" ? 50 : 50;
  return {
    schema_version: "3.0",
    course_id: course.id,
    state,
    title: course.title,
    course_version: "1.0",
    lifecycle: { status: "development", approval_number: null, submitted_at: null, correction_at: null, approved_at: null, effective_date: null, expiration_date: null, enrollment_enabled: false, regulatory_credit_enabled: false },
    approvals: Object.fromEntries(stateMeta[state].approvals.map((name) => [name, { status: "development", approval_number: null, effective_date: null, expiration_date: null }])),
    required_hours: course.hours,
    delivery: {
      mode: "asynchronous_distance_proposed",
      approval_pending: true,
      active_time_server_authoritative: true,
      instructional_minutes_per_clock_hour: baseMinutes,
      idle_time_excluded: true,
      tab_hidden_time_excluded: true,
      disconnected_time_excluded: true,
      concurrent_sessions: false,
      sequential_units: true,
      reviewer_bypass_isolated: true,
      enrollment_validity_days: course.enrollmentDays ?? null,
    },
    identity: { state_approved_method_pending: true, username_password_alone_sufficient: state === "AZ" ? false : null, ip_session_device_audit: true, exam_proctoring: course.exam.proctor },
    instructor: { assigned_instructor_id: null, approval_required: true, assignment_required_for_enrollment: true },
    assessment: { formative_checks: true, remediation_required: true, final_forms: course.exam.forms, questions_per_form: course.exam.questions, bank_ratio: course.exam.bankRatio, passing_percent: course.exam.pass, passing_percent_source: course.exam.pass == null ? "not_specified_release_gate" : "regulatory_or_current_application", secure_bank_public: false },
    reporting: { state_workflow: stateMeta[state].reporting, automated_events: true },
    records: { state_rule: stateMeta[state].records, append_only_completion_audit: true, exact_course_version_required: true },
    certificate: { enabled: false, template: `${course.id}-draft`, valid_approval_required: true, valid_instructor_required: true },
    stripe: { enabled: false, price_cents: null, approval_gate: true, payment_never_controls_completion: true },
    modules: course.modules.map((module) => ({
      id: module.id,
      title: module.title,
      hours: module.hours,
      authority: module.authority,
      national_core: module.core,
      ...(course.azSpecificMinimum && ["AZ90-02", "AZ90-03", "AZ90-10"].includes(module.id) ? { arizona_specific_hours: module.hours } : {}),
    })),
    ...(course.azSpecificMinimum ? { arizona_specific_instruction_minimum_hours: course.azSpecificMinimum } : {}),
  };
}

function publicCourse(course) {
  return {
    course_id: course.id,
    state: course.state,
    state_name: stateMeta[course.state].name,
    title: course.title,
    version: "1.0",
    required_hours: course.hours,
    status: "In Development",
    approval_number: null,
    enrollment_enabled: false,
    route: course.route,
    regulator: stateMeta[course.state].regulator,
    delivery: "Online distance delivery proposed; regulator approval pending",
    modules: course.modules.map((module) => ({ id: module.id, title: module.title, hours: module.hours })),
    public_notice: "Course framework in development. Not approved; enrollment, payment, regulatory study time, credit, and certificates are unavailable.",
  };
}

async function write(relative, contents) {
  const file = path.join(root, relative);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, contents);
}

function coursePage(course) {
  const meta = stateMeta[course.state];
  const depth = "../../../../";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="index,follow"><title>${course.title} | StateCourse</title><link rel="icon" href="${depth}favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="${depth}styles.css"><link rel="stylesheet" href="${depth}institutional-v2.css"><link rel="stylesheet" href="${depth}state-course.css"></head><body class="framework-page" data-course-id="${course.id}"><a class="skip-link" href="#curriculum">Skip to curriculum</a><header class="site-header"><div class="header-inner"><a class="brand" href="${depth}index.html"><span class="brand-seal">SC</span><span><strong>StateCourse</strong><small>Professional Licensing Education</small></span></a><nav class="primary-nav"><a href="#overview">Overview</a><a href="#curriculum">Curriculum</a><a href="#requirements">Requirements</a></nav><a class="header-action" href="#curriculum">Review framework</a></div></header><main><section class="framework-masthead"><div class="framework-title-grid"><div><p class="framework-breadcrumb">Real Estate / ${meta.name} / Pre-License</p><h1>${course.title}</h1><p class="framework-deck">A separate ${course.hours}-hour regulatory course framework mapped to current official ${meta.name} sources.</p></div><aside class="framework-status"><span>Public course status</span><strong>In Development</strong><p>Not approved. Enrollment, payment, study credit, and certificates are disabled.</p></aside></div><dl class="framework-facts"><div><dt>Required hours</dt><dd data-hours>${course.hours} hours</dd></div><div><dt>Course version</dt><dd>v1.0 · Development</dd></div><div><dt>Instructor</dt><dd>Unassigned · approval required</dd></div><div><dt>Approval number</dt><dd>Pending</dd></div></dl></section><div class="framework-body"><section class="framework-intro" id="overview"><h2>Approval-gated by design.</h2><div class="framework-intro-copy"><p>This course has its own provider/school, instructor, delivery, course-version, examination, certificate, reporting, and approval records. Rules from another state are not inherited.</p><div class="framework-callout"><strong>Development notice:</strong> the curriculum and submission package are built for regulator review. Public enrollment remains unavailable until approval is recorded.</div></div></section><section class="framework-curriculum" id="curriculum"><div class="framework-heading"><h2>Timed curriculum</h2><p><span data-module-count>${course.modules.length} modules</span> totaling <span data-hours>${course.hours} hours</span>.</p></div><div data-module-list></div></section><section class="framework-bottom" id="requirements"><article><h3>Distance controls</h3><p>${meta.delivery}</p></article><article><h3>Regulatory record</h3><p data-regulator>${meta.regulator}</p><p>Course v1.0 · approval number and dates pending · enrollment disabled.</p></article></section></div></main><footer class="site-footer"><div><a class="brand footer-brand" href="${depth}index.html"><span class="brand-seal">SC</span><span><strong>StateCourse</strong><small>Professional Licensing Education</small></span></a></div><p>${meta.name} v1.0 · Development draft · Enrollment disabled</p></footer><script src="${depth}state-course.js" defer></script></body></html>`;
}

assertCourses();

for (const state of Object.keys(stateMeta)) {
  const slug = stateMeta[state].name.toLowerCase().replaceAll(" ", "-");
  await write(`${slug}/official-sources.md`, sourceRegister(state));
  await write(`${slug}/regulatory-compliance-matrix.md`, complianceMatrix(state));
  await write(`${slug}/provider-school-application-package.md`, feesAndApplications(state));
  await write(`${slug}/submission-package.md`, `# ${stateMeta[state].name} Submission Package\n\nStatus: **Development / not filed / not approved**\n\n${stateMeta[state].approvals.map((item, index) => `${index + 1}. ${item.replaceAll("_", " ")} application and approval record`).join("\n")}\n\nEach course below has a separate timed outline, syllabus, full unit curriculum, assessments, remediation, secure final bank, administration/identity/records/reporting policy, instructor file, and certificate template. Regulator-issued numbers and dates remain blank.\n`);
}

for (const course of courses) {
  const slug = stateMeta[course.state].name.toLowerCase().replaceAll(" ", "-");
  const base = `${slug}/${course.id}`;
  await write(`${base}/lms-config.json`, `${JSON.stringify(config(course), null, 2)}\n`);
  await write(`${base}/timed-course-outline.md`, outline(course));
  await write(`${base}/curriculum/hour-by-hour-curriculum.md`, curriculum(course));
  await write(`${base}/syllabus.md`, syllabus(course));
  await write(`${base}/course-administration-policy.md`, adminPolicy(course));
  await write(`${base}/instructor-approval.md`, instructorFile(course));
  await write(`${base}/instructor-guide.md`, instructorGuide(course));
  await write(`${base}/student-handbook.md`, studentHandbook(course));
  await write(`${base}/regulator-outline-crosswalk.md`, courseCrosswalk(course));
  await write(`${base}/student-evaluation.md`, studentEvaluation(course));
  await write(`${base}/certificate-template.md`, certificate(course));
  await write(`${base}/assessments/assessment-remediation-plan.md`, assessmentPlan(course));
  await write(`${base}/assessments/quizzes.md`, quizzes(course));
  await write(`${base}/assessments/final-exam-bank.md`, examBank(course));

  const relative = course.route.replace(/^\//, "");
  await write(`public/statecourse/${relative}index.html`, coursePage(course));
}

const newIds = new Set(courses.map((course) => course.id));
const versionsPath = path.join(root, "config/regulatory-course-versions.json");
const versions = JSON.parse(await readFile(versionsPath, "utf8"));
versions.courses = versions.courses.filter((item) => !newIds.has(item.course_id));
versions.courses.push(...courses.map((course) => ({
  course_id: course.id,
  title: `${course.title} v1.0`,
  state: course.state,
  version: "1.0",
  status: "development",
  submitted_at: null,
  regulator_correction_at: null,
  approved_at: null,
  effective_date: null,
  expiration_date: null,
  course_approval_number: null,
  instructor_id: null,
  enrollment_enabled: false,
})));
await write("config/regulatory-course-versions.json", `${JSON.stringify(versions, null, 2)}\n`);

const controlsPath = path.join(root, "config/state-regulatory-controls.json");
const controls = JSON.parse(await readFile(controlsPath, "utf8"));
for (const course of courses) controls.states[course.id] = config(course);
await write("config/state-regulatory-controls.json", `${JSON.stringify(controls, null, 2)}\n`);

await write("config/state-approval-records.json", `${JSON.stringify({
  schema_version: "1.0",
  reviewed: reviewDate,
  states: Object.fromEntries(Object.entries(stateMeta).map(([code, meta]) => [code, {
    regulator: meta.regulator,
    provider_application: meta.provider,
    public_status: "In Development",
    enrollment_enabled: false,
    approval_records: Object.fromEntries(meta.approvals.map((name) => [name, { status: "development", approval_number: null, effective_date: null, expiration_date: null, communications: [] }])),
  }])),
}, null, 2)}\n`);

const publicPath = path.join(root, "public/statecourse/data/launch-course-frameworks.json");
const publicData = JSON.parse(await readFile(publicPath, "utf8"));
publicData.courses = publicData.courses.filter((item) => !newIds.has(item.course_id));
publicData.courses.push(...courses.map(publicCourse));
publicData.last_regulatory_review = reviewDate;
await write("public/statecourse/data/launch-course-frameworks.json", `${JSON.stringify(publicData, null, 2)}\n`);

console.log(`Generated ${courses.length} separate courses, ${courses.reduce((sum, course) => sum + course.hours, 0)} total hours.`);
