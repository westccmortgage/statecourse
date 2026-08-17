export const course = {
  id: "wa-real-estate-practices-30-v1",
  title: "Washington Real Estate Practices 30h v1.0",
  status: "development",
  instructionalMinutesPerHour: 50,
  finalExamMinutesIncluded: false,
  finalExamQuestions: 90,
  passingPercent: 70,
};

const module = (id, title, authority, topics) => ({ id, title, authority, hours: topics.length, topics });
export const modules = [
  module("WAP-01", "Washington license law and supervision", "DOL prescribed Real Estate Practices curriculum; chapter 18.85 RCW; title 308 WAC", [
    "DOL, Director and Real Estate Commission authority", "Broker, managing broker, firm and branch credentials", "Designated/managing broker supervision and delegation", "Washington advertising and team communications", "Transaction records, audit response and discipline",
  ]),
  module("WAP-02", "Washington brokerage relationships", "DOL prescribed Real Estate Practices curriculum; chapter 18.86 RCW", [
    "Washington brokerage-relationship framework", "Duties owed to all parties", "Duties owed to a principal", "Consent, conflicts and relationship disclosures", "Compensation, termination and agency case",
  ]),
  module("WAP-03", "Washington contracts and forms", "DOL prescribed Real Estate Practices curriculum; current Washington authority and approved course materials", [
    "Form selection and unauthorized-practice boundaries", "Purchase and sale agreement architecture", "Financing terms and contingencies", "Inspection, feasibility and due-diligence contingencies", "Title, association and property-specific addenda", "Offers, counteroffers and multiple-offer handling", "Amendments, notices, delivery and deadline control", "Integrated contract-file audit",
  ]),
  module("WAP-04", "Seller and buyer transaction practice", "DOL prescribed Real Estate Practices curriculum; chapters 18.85 and 18.86 RCW", [
    "Seller intake, authority and property-file setup", "Seller disclosure and material-fact workflow", "Buyer consultation, representation and financial readiness", "Showing, offer preparation and presentation", "Mutual acceptance through transaction coordination",
  ]),
  module("WAP-05", "Finance, escrow and closing", "DOL prescribed Real Estate Practices curriculum; Washington transaction practice", [
    "Financing file and lender communication boundaries", "Earnest money receipt, delivery and documentation", "Escrow instructions, title conditions and settlement coordination", "Closing documents, prorations, recording and possession",
  ]),
  module("WAP-06", "Fair housing, property management and risk", "DOL prescribed Real Estate Practices curriculum; federal Fair Housing Act; Washington Law Against Discrimination", [
    "Federal and Washington fair-housing practice", "Washington leasing and property-management workflow", "Fraud prevention, professional boundaries and integrated risk case",
  ]),
];

const objectiveLead = ["Apply", "Analyze", "Document", "Distinguish", "Evaluate"];
const activityLead = ["Complete", "Audit", "Build", "Resolve", "Prepare"];
let hour = 0;
export const allUnits = modules.flatMap((entry) => entry.topics.map((title, index) => {
  hour += 1;
  return {
    hour, moduleId: entry.id, moduleTitle: entry.title, title, authority: entry.authority,
    objective: `${objectiveLead[index % objectiveLead.length]} ${title.toLowerCase()} in a Washington brokerage file using current authority, broker supervision and documented consumer protection.`,
    application: `${activityLead[index % activityLead.length]} a Washington transaction scenario centered on ${title.toLowerCase()}, including the required communication, record and escalation path.`,
  };
}));
