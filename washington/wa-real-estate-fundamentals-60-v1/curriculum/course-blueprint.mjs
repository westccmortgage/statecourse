export const course = {
  id: "wa-real-estate-fundamentals-60-v1",
  title: "Washington Real Estate Fundamentals 60h v1.0",
  status: "development",
  instructionalMinutesPerHour: 50,
  finalExamMinutesIncluded: false,
  finalExamQuestions: 180,
  passingPercent: 70,
};

const module = (id, title, authority, topics) => ({ id, title, authority, hours: topics.length, topics });

export const modules = [
  module("WAF-01", "Property and ownership", "DOL prescribed Washington Real Estate Fundamentals curriculum; WAC 308-124H-820", [
    "Real property, personal property and the bundle of rights", "Fixtures, trade fixtures and crops", "Freehold and leasehold estates", "Concurrent ownership", "Business, trust and common-interest ownership", "Legal descriptions and survey systems", "Easements, licenses and encroachments", "Liens, priority and encumbrances", "Government powers affecting property", "Ownership and title issue-spotting case",
  ]),
  module("WAF-02", "Land use and development", "DOL prescribed Washington Real Estate Fundamentals curriculum; WAC 308-124H-820", [
    "Zoning classifications and lawful nonconforming uses", "Subdivision, platting and development controls", "Building codes, permits and occupancy", "Deed restrictions and private controls", "Site, access, utility and survey due diligence", "Land-use feasibility and referral case",
  ]),
  module("WAF-03", "Valuation", "DOL prescribed Washington Real Estate Fundamentals curriculum; WAC 308-124H-820", [
    "Value, price, cost and market forces", "Highest and best use", "Sales comparison approach", "Cost approach and depreciation", "Income capitalization approach", "CMA, BPO and licensed-appraisal boundaries",
  ]),
  module("WAF-04", "Contracts", "DOL prescribed Washington Real Estate Fundamentals curriculum; WAC 308-124H-820", [
    "Contract classifications and essential elements", "Capacity, lawful purpose and consideration", "Statute of Frauds and electronic records", "Offer, acceptance, revocation and counteroffer", "Contract interpretation, dates and deadlines", "Conditions, covenants and contingencies", "Performance, discharge and breach", "Damages, rescission and specific-performance orientation", "Leases, options and representation agreements", "Integrated contract chronology case",
  ]),
  module("WAF-05", "Agency and brokerage", "DOL prescribed Washington Real Estate Fundamentals curriculum; WAC 308-124H-820", [
    "Agency creation and authority", "Fiduciary duties and reasonable skill and care", "Clients, customers and third parties", "Single, dual and designated representation concepts", "Disclosure and informed consent", "Compensation, cooperation and antitrust", "Termination and surviving duties", "Integrated brokerage-relationship case",
  ]),
  module("WAF-06", "Finance", "DOL prescribed Washington Real Estate Fundamentals curriculum; WAC 308-124H-820", [
    "Promissory notes and security instruments", "Primary and secondary mortgage markets", "Conventional and government loan programs", "Loan application and underwriting factors", "Loan-to-value, debt ratios and qualification math", "Interest, points, APR and loan cost", "Amortization, payments and remaining balance", "Default, foreclosure and consumer-protection orientation",
  ]),
  module("WAF-07", "Transfer and settlement", "DOL prescribed Washington Real Estate Fundamentals curriculum; WAC 308-124H-820", [
    "Deed requirements and deed types", "Delivery, acceptance and recording", "Title evidence and title insurance", "Voluntary and involuntary transfer", "Escrow, settlement and closing sequence", "Commissions, prorations and closing calculations",
  ]),
  module("WAF-08", "Federal practice and applied review", "DOL prescribed Washington Real Estate Fundamentals curriculum; WAC 308-124H-820", [
    "Federal Fair Housing Act and protected conduct", "Fair-housing advertising and disability requests", "Federal lead-based-paint and consumer disclosures", "Property-management and leasing foundations", "Investment property income and risk foundations", "Comprehensive fundamentals transaction case",
  ]),
];

const objectiveLead = ["Explain and apply", "Distinguish and analyze", "Identify and document", "Calculate or evaluate", "Compare and apply"];
const activityLead = ["Classify facts in", "Build an issue log for", "Complete a document review for", "Resolve a calculation or decision in", "Prepare a broker-escalation record for"];
let hour = 0;
export const allUnits = modules.flatMap((entry) => entry.topics.map((title, index) => {
  hour += 1;
  return {
    hour,
    moduleId: entry.id,
    moduleTitle: entry.title,
    title,
    authority: entry.authority,
    objective: `${objectiveLead[index % objectiveLead.length]} ${title.toLowerCase()} in an entry-level real estate transaction while remaining within a broker's professional scope.`,
    application: `${activityLead[index % activityLead.length]} a realistic buyer, seller, property or closing scenario focused on ${title.toLowerCase()}.`,
  };
}));
