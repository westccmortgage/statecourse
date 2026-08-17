export const course = {
  id: "pa-real-estate-practice-45-v1",
  title: "Pennsylvania Real Estate Practice 45h v1.0",
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
  authority: "Pennsylvania State Real Estate Commission Real Estate Practice minimum course-content outline",
  hours: topics.length,
  topics,
});

export const modules = [
  module("PAP-01", "The real estate business", [
    "Professional activities, property classifications and market factors",
    "Industry trends and the role of brokers and salespersons",
    "Compensation, independent-contractor status and tax orientation",
    "Brokerage records and compensation mathematics",
  ]),
  module("PAP-02", "Law, ethics and consumer protection", [
    "Professional ethics and its relationship to law",
    "RELRA and Commission rules governing practice",
    "Federal and state antitrust law in brokerage",
    "Fair housing protected classes and prohibited conduct",
    "Fair housing advertising, complaints, remedies and licensee responsibility",
  ]),
  module("PAP-03", "Agency and consumer relationships", [
    "Creation of agency and legal consequences",
    "Fiduciary duties, liability and imputed notice",
    "Seller, buyer, subagency and transaction-licensee relationships",
    "Dual and designated agency; consent and duty modification",
    "Pennsylvania consumer notice and relationship disclosures",
    "Statutory duties of each Pennsylvania brokerage relationship",
  ]),
  module("PAP-04", "Homeownership and listing practice", [
    "Housing choices, ownership considerations and residential insurance",
    "Creating the seller-broker relationship and listing types",
    "Pennsylvania licensee duties when listing property",
    "Seller property-condition disclosure and defect issue spotting",
    "Pricing, CMA boundaries and listing-agreement provisions",
    "Marketing, advertising, technology, social media and MLS cooperation",
  ]),
  module("PAP-05", "Buyer practice and risk reduction", [
    "Consumer notice and buyer-broker relationship formation",
    "Buyer-agency forms, scope and compensation",
    "Cooperating-broker, FSBO and in-house transaction structures",
    "Dual/designated agency risk and undisclosed agency",
    "Misrepresentation, fraud, negligence and risk-reduction records",
  ]),
  module("PAP-06", "Agreement of sale and escrow", [
    "Licensee role, unauthorized practice boundaries and form selection",
    "Negotiation, representation and communication of offers",
    "Writing requirements, electronic records and Pennsylvania agreement rules",
    "Earnest-money receipt, deposit deadline and escrow-account duties",
    "Escrow disputes, commingling and misappropriation prevention",
    "Agreement provisions, contingencies and addenda",
    "Performance, termination, default and available party remedies",
  ]),
  module("PAP-07", "Residential financing", [
    "Lender yield, risk, LTV and repayment structures",
    "Primary-market sources and Pennsylvania mortgage-broker orientation",
    "Conventional, FHA, VA and seller-financing structures",
    "Application, qualification, underwriting, Loan Estimate and Closing Disclosure",
    "Federal lending law and finance calculations",
  ]),
  module("PAP-08", "Valuation and appraisal", [
    "CMA, BPO and appraisal definitions and qualification boundaries",
    "Value principles and sales, cost and income approaches",
    "Depreciation, capitalization, multipliers and valuation calculations",
  ]),
  module("PAP-09", "Closing the residential transaction", [
    "Closing purpose, parties, loan closing and CFPB documents",
    "Title evidence, deeds, delivery, acceptance and recording",
    "Settlement statements, prorations, debits, credits and seller net",
    "FIRPTA reporting, cybersecurity, source-of-funds and identity risks",
  ]),
];

const objectiveLead = ["Explain and apply", "Distinguish and document", "Analyze and select", "Calculate or evaluate", "Identify and resolve"];
const activityLead = ["Map the chronology of", "Build a compliance record for", "Complete a form-and-source review for", "Resolve the calculation or judgment in", "Prepare a broker-escalation note for"];
let hour = 0;
export const allUnits = modules.flatMap((entry) => entry.topics.map((title, index) => {
  hour += 1;
  return {
    hour,
    moduleId: entry.id,
    moduleTitle: entry.title,
    title,
    authority: entry.authority,
    objective: `${objectiveLead[index % objectiveLead.length]} ${title.toLowerCase()} in a Pennsylvania residential transaction while protecting the consumer and staying within professional scope.`,
    application: `${activityLead[index % activityLead.length]} a realistic Pennsylvania listing, buyer-representation, contract, financing, valuation or closing scenario focused on ${title.toLowerCase()}.`,
  };
}));
