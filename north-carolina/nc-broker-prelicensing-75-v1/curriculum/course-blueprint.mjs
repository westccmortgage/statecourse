export const course = {
  id: "nc-broker-prelicensing-75-v1",
  title: "North Carolina Broker Prelicensing 75h v1.0",
  status: "development",
  instructionalMinutesPerHour: 50,
  subjectHours: 72,
  endOfCourseExamHours: 3,
  passingPercent: 75,
  productionExamQuestions: null,
};

const module = (id, title, recommendedHours, proposedHours, authority, topics, type = "instruction") => ({
  id,
  title,
  recommendedHours,
  hours: proposedHours,
  authority,
  topics,
  type,
});

const syllabusAuthority = "NCREC Broker Prelicensing Course Syllabus, March 2024 edition; 21 NCAC 58H";

export const modules = [
  module("NCB-01", "North Carolina licensure", 2, 2, syllabusAuthority, [
    "North Carolina licensing pathway, application, character review, and license examination",
    "License categories, qualifications, status, renewal, education duties, and Commission authority",
  ]),
  module("NCB-02", "Basic real estate concepts", 1, 1, syllabusAuthority, [
    "Real property, personal property, the bundle of rights, and brokerage vocabulary",
  ]),
  module("NCB-03", "Property characteristics, description, and use", 4, 4, syllabusAuthority, [
    "Physical and economic characteristics of land and improvements",
    "Fixtures, trade fixtures, emblements, and property classification",
    "Legal descriptions, surveys, measurements, and area calculations",
    "Public and private land-use controls, environmental orientation, and development due diligence",
  ]),
  module("NCB-04", "Property ownership types and transfers", 6, 6, syllabusAuthority, [
    "Freehold, leasehold, defeasible, and life estates",
    "Severalty, tenancy in common, joint tenancy, tenancy by the entirety, and trust ownership",
    "Condominiums, cooperatives, planned communities, and time-share orientation",
    "Easements, licenses, encroachments, appurtenant rights, and adverse possession",
    "Liens, lien priority, marketable title, and title evidence",
    "Deed requirements, deed types, delivery, recording, and voluntary or involuntary transfer",
  ]),
  module("NCB-05", "Property disclosures and environmental issues", 6, 6, syllabusAuthority, [
    "Material facts, discoverability, broker inquiry, and disclosure duties",
    "Residential Property and Owners' Association Disclosure Statement workflow",
    "Mineral and Oil and Gas Rights Mandatory Disclosure Statement workflow",
    "Federal lead-based paint disclosure and record responsibilities",
    "Environmental hazards, contamination, flood, radon, asbestos, mold, and referral boundaries",
    "Stigmatized property, square footage, construction condition, and integrated disclosure case",
  ]),
  module("NCB-06", "Property taxation and insurance", 4, 4, syllabusAuthority, [
    "Ad valorem assessment, tax rates, special assessments, and tax calculations",
    "Excise tax, prorations, debits, credits, and transaction calculations",
    "Homeowner, hazard, liability, title, and mortgage insurance foundations",
    "Flood insurance and federal income-tax orientation for home ownership and sale",
  ]),
  module("NCB-07", "Agency and brokerage relationships", 13, 13, syllabusAuthority, [
    "Agency creation, authority, clients, customers, and third parties",
    "Common-law duties, statutory duties, fiduciary obligations, and reasonable skill and care",
    "Broker supervision, provisional brokers, broker-in-charge duties, and compensation",
    "Working With Real Estate Agents disclosure purpose and timing",
    "Seller agency creation, listing agreements, and listing-side duties",
    "Buyer agency creation, written agreements, and buyer-side duties",
    "Dual agency disclosure, authorization, conflicts, and informed consent",
    "Designated dual agency structure, limits, and supervision",
    "Subagency, cooperation, referrals, and out-of-state broker interaction",
    "Agency contract terms, termination, compensation, and surviving duties",
    "Material-fact identification and disclosure within agency practice",
    "Advertising, solicitation, antitrust, fair competition, and brokerage risk controls",
    "Integrated North Carolina agency selection, disclosure, and conflict-resolution case",
  ]),
  module("NCB-08", "Contracts and closing", 18, 18, syllabusAuthority, [
    "Contract classifications, essential elements, capacity, consideration, and lawful purpose",
    "Offer, acceptance, counteroffer, revocation, rejection, and communication",
    "Reality of consent: mistake, misrepresentation, fraud, duress, and undue influence",
    "Statute of Frauds, electronic signatures, assignment, novation, and interpretation",
    "Performance, discharge, breach, damages, rescission, and specific performance",
    "North Carolina Offer to Purchase and Contract structure and paragraph navigation",
    "Due diligence fee, earnest money deposit, escrow, and trust-account handling",
    "Property description, fixtures, personal property, and possession provisions",
    "Financing, appraisal, loan assumption, and sale-of-other-property issues",
    "Due diligence period, inspections, repairs, risk of loss, and termination rights",
    "Common addenda, disclosures, backups, and contract-document control",
    "Contract formation chronology, delivery, notice, dates, and deadline management",
    "Title examination, surveys, restrictive covenants, liens, and closing due diligence",
    "Attorney, lender, broker, settlement agent, and recording roles in North Carolina",
    "Closing disclosure, settlement figures, prorations, debits, credits, and broker review",
    "Broker responsibilities before and after settlement, possession, and file retention",
    "Unauthorized practice of law, drafting limits, prohibited conduct, and escalation",
    "Integrated North Carolina contract-to-closing transaction case",
  ]),
  module("NCB-09", "Real estate financing and settlement", 7, 7, syllabusAuthority, [
    "Promissory notes, mortgages, deeds of trust, priority, default, and foreclosure",
    "Primary and secondary mortgage markets, loan origination, and underwriting",
    "Conventional loans, private mortgage insurance, and qualification standards",
    "FHA, VA, USDA, seller financing, assumptions, and alternative financing",
    "Loan-to-value, debt ratios, interest, points, payments, and finance calculations",
    "Federal lending laws, fair lending, TILA, ECOA, TRID, and RESPA",
    "Loan process, settlement disclosures, servicing, and financing-risk case",
  ]),
  module("NCB-10", "Real property valuation and appraisal", 6, 6, syllabusAuthority, [
    "Value, price, cost, market forces, and appraisal regulation",
    "Highest and best use, substitution, contribution, conformity, and anticipation",
    "Appraisal process, data collection, reconciliation, and report orientation",
    "Sales comparison approach and adjustment analysis",
    "Cost approach, depreciation, land value, and replacement or reproduction cost",
    "Income approach, capitalization, gross rent multiplier, CMA, and BPO boundaries",
  ]),
  module("NCB-11", "Fair housing and anti-discrimination", 1.5, 2, syllabusAuthority, [
    "Federal Fair Housing Act protected classes, prohibited conduct, exemptions, and enforcement",
    "North Carolina anti-discrimination duties, advertising, disability requests, and applied case",
  ]),
  module("NCB-12", "Landlord, tenant, and property management", 3.5, 3, syllabusAuthority, [
    "North Carolina landlord-tenant duties, leases, remedies, and residential protections",
    "Tenant Security Deposit Act, Vacation Rental Act, trust money, and accounting",
    "Property-management agreements, agency duties, maintenance, risk, and integrated case",
  ]),
  module("NCB-13", "Proctored end-of-course examination", 3, 3, "21 NCAC 58H .0207 and NCREC Broker Prelicensing Course Syllabus", [
    "Secure closed-book proctored examination — session one",
    "Secure closed-book proctored examination — session two",
    "Secure closed-book proctored examination — session three and submission",
  ], "exam"),
];

const objectiveLead = ["Explain and apply", "Distinguish and analyze", "Identify and document", "Calculate or evaluate", "Compare and apply"];
const activityLead = ["Classify the facts in", "Build an issue log for", "Complete a document review for", "Resolve a calculation or decision in", "Prepare a broker-escalation record for"];
let hour = 0;
export const allUnits = modules.flatMap((entry) => entry.topics.map((title, index) => {
  hour += 1;
  if (entry.type === "exam") {
    return {
      hour,
      moduleId: entry.id,
      moduleTitle: entry.title,
      title,
      authority: entry.authority,
      type: "exam",
      objective: "Demonstrate comprehensive mastery of the Commission-prescribed Broker Prelicensing subjects under the approved identity, security, and proctoring procedure.",
      application: "No instructional content, hints, feedback, remediation, or answer review occurs during this secure examination block.",
    };
  }
  return {
    hour,
    moduleId: entry.id,
    moduleTitle: entry.title,
    title,
    authority: entry.authority,
    type: "instruction",
    objective: `${objectiveLead[index % objectiveLead.length]} ${title.toLowerCase()} at the instructional level prescribed by the NCREC syllabus and within an entry-level North Carolina broker's scope.`,
    application: `${activityLead[index % activityLead.length]} a realistic North Carolina buyer, seller, property, agency, finance, or closing scenario focused on ${title.toLowerCase()}.`,
  };
}));
