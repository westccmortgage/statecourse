/** PCF-0 transcription, checked against all three rendered pages on 2026-09-07.
 * Names preserve the 2016 outline, including its incomplete parenthesis and older names.
 * Current law and current forms control instruction; this file transcribes curriculum only.
 * Each printed timed row is one unit. T07U9 has three untimed subordinate entries.
 * In particular the wrapped row on page 2 assigns 15 minutes to T05U5, not 20.
 */
export const FORM = Object.freeze({
  formNumber: "PCF-0", revision: "06/20/2016",
  title: "Qualifying Real Estate Course Approval Form — Promulgated Contract Forms (30 hour course)",
  issuer: "Texas Real Estate Commission",
  url: "https://www.trec.texas.gov/sites/default/files/pdf-forms/PCF-0.pdf",
  localCopy: "texas/trec-sources/PCF-0.pdf",
  sha256: "6b87ca7dceb8d06f94ae46102823dede01edc3690c9e0944505a91f676704eec",
  bytes: 1040262, pages: 3, readOn: "2026-09-07", visualTableCheck: true,
  courseHours: 30, totalMinutes: 1500, minutesPerCreditHour: 50,
  minutesPerCreditHourStatus: "FORM_DERIVED",
});
const topic = (code, name, subtotalMinutes, scopeNote, rows, page) => Object.freeze({code, topic:name, subtotalMinutes, scopeNote, page, units:Object.freeze(rows.map(([unit,minutes,subentries],i)=>Object.freeze({code:`${code}U${i+1}`,unit,minutes,...(subentries?{subentries:Object.freeze(subentries)}:{})})))});
export const TOPICS = Object.freeze([
  topic("T01", "Contract Law Overview", 155, "Unauthorized Practice of Law", [
    ["Elements of a Valid Contract",15], ["Valid/Void/Unenforceable/Voidable",15],
    ["Executed and Executory Contracts",20], ["Bilateral vs. Unilateral",20],
    ["Reasonable Time vs. Time is of the Essence",15], ["Amendments and Addenda",20],
    ["Performance of a Contract",25], ["Statute of Limitations",10], ["Reasons for Termination",15],
  ],1),
  topic("T02", "Laws, Rules and Regulations", 150, "Broker-Lawyer Committee; Commission rules governing use of forms", [
    ["Texas Real Estate License Act",45], ["Unauthorized Practice of Law, Examples of Common Mistakes",25],
    ["The Broker-Lawyer Committee",15], ["Use of Promulgated Forms",25],
    ["Presenting Offers and Multiple Offers",20], ["When does the Offer Become a Contract?",20],
  ],1),
  topic("T03", "Parties, Property and Financing", 155, "Current promulgated forms", [
    ["Information Needed to Complete Contract Forms (including financing costs",20],
    ["Review Elements & Practice 1-4 Family Residential Contract (Resale), Non-Realty Items Addendum",25],
    ["Review Elements & Practice Third Party Financing Addendum & Loan Assumption Addendum",25],
    ["Review Elements & Practice Seller Financing Addendum",20],
    ["Review Elements & Practice Addendum for Release of Liability on Assumed Loan and/or Restoration of Seller's VA Entitlement",20],
    ["Case Study/ Workshop",45],
  ],[1,2]),
  topic("T04", "Covenants, Commitments and Notices", 160, "Current promulgated forms; Commission rules governing use of forms", [
    ["Earnest Money Requirement",15], ["Option Fee Requirement",15],
    ["Title Commitment, Title Policy & Endorsements",20], ["Survey",15],
    ["Affidavit & Notice to Prospective Buyer",15], ["Property Condition: Inspection, Acceptance, Repairs",30],
    ["Seller's Disclosure & Lead Based Paint Disclosure",20],
    ["Environmental Assessment & Threatened or Endangered Species & Wetlands Addendum",15],
    ["Residential Service Contract",15],
  ],2),
  topic("T05", "Closing, Possession and More", 220, "Current promulgated forms; Case studies", [
    ["Closing Paragraph & Buyer's Possession Paragraphs in Contract",20], ["Special Provisions",20],
    ["Seller's Temporary Lease Form & Buyer's Temporary Lease Form",30], ["Settlement & Other Expenses",20],
    ["Prorations, Casualty Loss, Default & Mediation of Contract",15], ["Escrow Provisions",15],
    ["Other Contract Provisions",15], ["Executing the Contract & Finalizing the Agreement",15],
    ["Case Study/Workshop",70],
  ],2),
  topic("T06", "The Remaining Promulgated Forms", 205, "Current promulgated forms; Case studies", [
    ["Overview of Forms",20], ["Differences Between 1-4 Family Residential Contract & Other Contracts",30],
    ["Residential Condominium Contract",30], ["Farm and Ranch Contract",30],
    ["Unimproved Property Contract",30], ["New Home Contracts",20], ["Case Study/Workshop",45],
  ],2),
  topic("T07", "Promulgated Addenda, Notices and Other Forms", 205, "Current promulgated forms; Case studies", [
    ["Addendum for Sale of Other Property by Buyer",15], ["Addendum for Back-Up Contract",15],
    ["Addendum for Reservation of Oil, Gas & Other Minerals",15], ["Buyers Termination of Contract",15],
    ["Mutual Termination of Contract",15],
    ["Addendum for Property Located Seaward of the Gulf Intracoastal Waterway, Addendum for Coastal Area Property",10],
    ["Addendum for Property Subject to Mandatory Membership in an Owner's Association",15], ["Short Sale Addendum",15],
    ["Noncontract Forms:",30,["Promulgated Resale Certificates","Consumer Information Form","Information About Brokerage Services Form"]],
    ["Non-Realty Items",5], ["Case Study/Workshop",55],
  ],3),
  topic("T08", "Other Real Estate Matters", 115, null, [
    ["Real Estate Fraud",30], ["Broker's Fees",20], ["Fair Housing Laws",30],
    ["Other Disclosures (Required, Permitted, Prohibited)",15], ["Review Occupancy Standards",20],
  ],3),
  topic("T09", "Practice Makes Perfect", 135, "Case studies involving use of forms", [
    ["Group Work Shop/Case Study/Discussion",135],
  ],3),
]);
export const ALL_UNITS = Object.freeze(TOPICS.flatMap(t=>t.units.map(u=>Object.freeze({...u,topicCode:t.code,topic:t.topic}))));
for(const t of TOPICS) if(t.units.reduce((s,u)=>s+u.minutes,0)!==t.subtotalMinutes) throw new Error(`${t.code}: transcription subtotal mismatch`);
if(TOPICS.reduce((s,t)=>s+t.subtotalMinutes,0)!==FORM.totalMinutes || ALL_UNITS.length!==63) throw new Error("PCF-0 outline mismatch");
export default Object.freeze({FORM,TOPICS,ALL_UNITS});
