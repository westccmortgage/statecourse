/** Exact REF-0 topic/unit/minute transcription. All three held PDF pages visually read 2026-09-07.
 * The currently published TREC form page identifies REF-0 effective 06/20/2016.
 * The 2016 outline fixes coverage, not the date of the law taught. Its GSE heading includes
 * GNMA; instruction explains that Ginnie Mae is a government corporation, not a GSE.
 * "APA" and "REMT" are retained as printed; do not silently expand an ambiguous abbreviation.
 */
export const FORM = Object.freeze({
  formNumber: "REF-0", revision: "06/20/2016",
  title: "Qualifying Real Estate Course Approval Form — Real Estate Finance (30 hour course)",
  issuer: "Texas Real Estate Commission",
  url: "https://www.trec.texas.gov/sites/default/files/pdf-forms/REF-0.pdf",
  formPage: "https://www.trec.texas.gov/forms/qualifying-real-estate-course-approval-form-real-estate-finance-30-hour-course",
  localCopy: "texas/trec-sources/REF-0.pdf",
  sha256: "0ce0803148aff392bad39ba77d8c5f59e9668fd70455170f2bcf8c39d602f1f8",
  bytes: 1260112, pages: 3, readOn: "2026-09-07", visualTableCheck: true,
  courseHours: 30, totalMinutes: 1500, minutesPerCreditHour: 50,
  minutesPerCreditHourStatus: "FORM_DERIVED",
});
const raw=[
 ["The Nature & Cycle of Real Estate Finance",null,105,[["The Nature of Real Estate Finance",15],["Mortgage Lending Activities",30],["Real Estate Cycles",30],["Impact of the Economy",15],["Information Resources",15]]],
 ["Money & the Monetary System","Monetary systems; primary & secondary money markets",100,[["What is Money & The Federal Reserve System",20],["Instruments of Credit Policy",20],["The U.S. Treasury & U.S. Mint",15],["The Federal Deposit Insurance Corp (FDIC)",15],["The Federal Home Loan Bank(FHLB) System",15],["Information Resources",15]]],
 ["Additional Government Influence","State housing agencies; federal govt. programs; community reinvestment laws, state housing agencies",200,[["U.S. Dept. of Housing & Urban Development (HUD)",15],["Significant Federal Legislation (CRA, TILA, RESPA, SAFE, APA, Dodd-Frank)",60],["State & Local Programs (incl. TDHCA)",25],["Agricultural Lending",20],["Review of Loan Estimate",40],["Review of Closing Statement",40]]],
 ["The Secondary Mortgage Market","Primary & Secondary money markets",95,[["Major Participants in the Secondary Market",20],["The Government Sponsored Enterprises (GSEs incl: FNMA, FHLMC, GNMA, FHLB, Farmer Mac)",60],["Real Estate Mortgage Investment Conduits (REMICs)",15]]],
 ["Sources of Funds","Sources of mortgage loans; alternative financial instruments",110,[["Commercial Banks",15],["Life Insurance Companies",10],["Pension & Retirement Programs",10],["Credit Unions",15],["Mortgage Brokers & Bankers",10],["Real Estate Trusts (REIT, REMT)",10],["Real Estate Bonds",10],["Private Lenders (ie: sellers, individuals, gifts)",20],["Foreign Lenders",10]]],
 ["Instruments of Real Estate Finance","Loan applications, processes & procedures",170,[["Encumbrances & Liens",20],["The Note & Deed of Trust (Trust Deed)",30],["The Note & Mortgage",20],["Contract for Deed (Land Contract )",20],["Subordinate Finance Instruments",20],["Special Provisions in Mortgage Lending Instruments",20],["Review of Promissory Note Form",20],["Review of Trust Form",20]]],
 ["Loan Types, Terms & Issues","Loan applications, processes & procedures; alternative financial instruments",200,[["Interest",15],["Types of Loans",40],["Private Mortgage Insurance",20],["Refinancing Existing Conventional Loans",15],["Subprime & Predatory Lending",20],["Participation Agreements",10],["Tax Impacts in Mortgage Lending",20],["Review of Fixed/Adjustable Rate Note",15],["Mortgage Fraud (ie: red flags)",15],["PITI Workshop - Conventional",30]]],
 ["Government Loans","Federal govt. programs; equal credit opportunity laws",215,[["Federal Housing Administration (FHA)",20],["FHA - Insured Loan Program",20],["Underwriting Guidelines",20],["Most Frequently Used FHA Loans",20],["Direct Endorsement",15],["FHA Contributions to Real Estate Finance",10],["VA Loan Guarantee Program",30],["Additional VA Loan Programs",20],["FHA Case Study/Workshop",30],["VA Case Study/Workshop",30]]],
 ["Lender Loan Processes","Closing costs; equal credit opportunity laws, loan applications, processes & procedures",220,[["Qualifying the Borrower",20],["Qualifying the Collateral",20],["Review of Sample Credit Report",15],["Review of Uniform Residential Loan Application",15],["Review of Request for Verification of Deposit",10],["Review of Request for Verification of Employment",10],["Review of Uniform Residential Appraisal Report",30],["Required Lender Notices",10],["Qualifying the Title",20],["Review of the Title Commitment",20],["Lender Closing Costs",10],["Case Study/Workshop",40]]],
 ["Defaults & Foreclosures","Loan applications, processes & procedures",85,[["Defaults",25],["Adjustments & Modifications",10],["Types of Foreclosures",30],["Deficiency Judgments",10],["Tax Impacts of Foreclosure",10]]]
];
export const TOPICS = Object.freeze(raw.map(([topic, scopeNote, subtotalMinutes, units], i) => {
  const code = `T${String(i + 1).padStart(2, "0")}`;
  return Object.freeze({
    code, topic, scopeNote, subtotalMinutes,
    units: Object.freeze(units.map(([unit, minutes], j) => Object.freeze({ code: `${code}U${j + 1}`, unit, minutes }))),
  });
}));
export const ALL_UNITS=Object.freeze(TOPICS.flatMap(t=>t.units.map(u=>Object.freeze({...u,topicCode:t.code}))));
for(const t of TOPICS) if(t.units.reduce((s,u)=>s+u.minutes,0)!==t.subtotalMinutes) throw new Error(`REF-0 minute mismatch ${t.code}`);
if(TOPICS.reduce((s,t)=>s+t.subtotalMinutes,0)!==1500||ALL_UNITS.length!==74||new Set(ALL_UNITS.map(u=>u.code)).size!==74) throw new Error("REF-0 transcription invariant failed");
export default Object.freeze({FORM,TOPICS,ALL_UNITS});
