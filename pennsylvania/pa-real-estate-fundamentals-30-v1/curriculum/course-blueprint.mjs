export const course = {
  id: "pa-real-estate-fundamentals-30-v1",
  title: "Pennsylvania Real Estate Fundamentals 30h v1.0",
  status: "development",
  instructionalMinutesPerHour: 50,
  finalExamRequired: true,
  finalExamProctored: true,
  finalExamQuestions: null,
  passingPercent: null,
};

const module = (id, title, topics) => ({
  id,
  title,
  authority: "Pennsylvania State Real Estate Commission Real Estate Fundamentals outline (final draft January 28, 2019)",
  hours: topics.length,
  topics,
});

export const modules = [
  module("PAF-01", "Land, real estate and property", [
    "Land, real estate, real property and personal property",
    "Annexation, severance, manufactured housing and fixtures",
    "Bundle of rights, surface, subsurface and air rights",
  ]),
  module("PAF-02", "Public and private controls; environmental issues", [
    "Sources of public controls and licensee obligations",
    "Land-use controls, zoning, subdivision and building codes",
    "Private controls, environmental laws and property hazards",
  ]),
  module("PAF-03", "Legal descriptions and interests in real estate", [
    "Metes and bounds, lot and block, rectangular survey and condominium descriptions",
    "Government powers: police power, eminent domain, taxation and escheat",
    "Freehold and leasehold estates; Pennsylvania landlord-tenant orientation",
    "Liens, restrictions, easements, encroachments, licenses and water rights",
  ]),
  module("PAF-04", "Forms of ownership", [
    "Severalty, joint tenancy, tenancy in common and tenancy by the entireties",
    "Trust, partnership, corporation and limited-liability-company ownership",
    "Condominium, cooperative, timeshare and campground interests",
  ]),
  module("PAF-05", "Transfer of title and title records", [
    "Deed types and appropriate transfer uses",
    "Essential deed elements, execution, delivery and acceptance",
    "Voluntary and involuntary alienation; foreclosure and adverse possession",
    "Probate, wills, descent and distribution; estate and inheritance tax orientation",
    "Recording, notice, chain of title, marketable title and title insurance",
  ]),
  module("PAF-06", "Principles of contract law", [
    "Contract classifications, validity and essential elements",
    "Statute of Frauds, parol evidence, limitations and performance",
    "Assignment, novation, discharge, breach and remedies",
  ]),
  module("PAF-07", "Principles of financing", [
    "Primary market, secondary market and Federal Reserve orientation",
    "Promissory note and mortgage; parties and core provisions",
    "Repayment structures, interest, prepayment, acceleration and default",
    "Recording priority, foreclosure, deficiency judgments and redemption",
  ]),
  module("PAF-08", "Pennsylvania license law, rules and regulation", [
    "RELRA definitions, application, exclusions and Commission authority",
    "License qualifications, applications, status, renewal and employment changes",
    "Real estate office operation, broker supervision and general licensee duties",
    "Consumer relationships, disclosures, escrow and prohibited conduct",
    "Discipline, reporting, hearings and the Real Estate Recovery Fund",
  ]),
];

const objectiveLead = ["Explain and distinguish", "Apply and document", "Analyze and select", "Compare and evaluate", "Identify and resolve"];
const activityLead = ["Classify the facts in", "Build an issue-and-authority log for", "Complete a source and document review for", "Resolve the decision point in", "Prepare a broker-escalation record for"];
let hour = 0;
export const allUnits = modules.flatMap((entry) => entry.topics.map((title, index) => {
  hour += 1;
  return {
    hour,
    moduleId: entry.id,
    moduleTitle: entry.title,
    title,
    authority: entry.authority,
    objective: `${objectiveLead[index % objectiveLead.length]} ${title.toLowerCase()} in an entry-level Pennsylvania real estate scenario while remaining within the licensee's permitted professional role.`,
    application: `${activityLead[index % activityLead.length]} a realistic property, ownership, contract, financing or license-law scenario focused on ${title.toLowerCase()}.`,
  };
}));
