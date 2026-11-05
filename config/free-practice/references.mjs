// Public-practice source scope only. Does not refresh or alter paid-course approval manifests.
const ref = (url, reference) => ({url, reference});
const gaRules = 'https://rules.sos.ga.gov/download_pdf.aspx?dept=Departments&pdf=Department+520+GEORGIA+REAL+ESTATE+COMMISSION&st=GASOS&year=2026';
export const REFERENCES = {
  'fl-syllabus': ref('https://www2.myfloridalicense.com/re/documents/FREC1SyllabusCleanFinal01012023.pdf','FREC Course I syllabus, effective January 1, 2023; topic objectives'),
  'fl-license': ref('https://www.flsenate.gov/Laws/Statutes/2026/Chapter475/All','Florida Statutes Chapter 475, especially 475.01, .011, .17, .42'),
  'fl-agency': ref('https://www.flsenate.gov/Laws/Statutes/2026/475.278','Florida Statutes 475.278; brokerage relationships and duties'),
  'fl-escrow': ref('https://www.flrules.org/gateway/ChapterHome.asp?Chapter=61J2-14','F.A.C. Chapter 61J2-14; escrow handling'),
  'fl-ads': ref('https://www.flrules.org/gateway/RuleNo.asp?ID=61J2-10.025','F.A.C. 61J2-10.025; advertising'),
  'fl-discipline': ref('https://www.flsenate.gov/Laws/Statutes/2026/475.25','Florida Statutes 475.25; discipline and entrusted funds'),
  'fl-fund': ref('https://www.flsenate.gov/Laws/Statutes/2026/475.482','Florida Statutes 475.482–475.486; recovery fund conditions'),
  'fl-tax': ref('https://www.flsenate.gov/Laws/Statutes/2026/Chapter196/All','Florida Statutes Chapter 196; tax exemptions; distinguish Article X section 4 creditor protection'),
  'ga-rules': ref(gaRules,'Georgia Rules Chapter 520-1, current through October 21, 2026; .04–.11'),
  'ga-education': ref(gaRules,'Georgia Rule 520-2-.04(4)(c); salesperson topic framework (not exam weights)'),
  'ga-trust': ref(gaRules,'Georgia Rule 520-1-.08; trust accounts and trust funds'),
  'ga-owned': ref(gaRules,'Georgia Rules 520-1-.06(4), .08(9), .09(8), .11; licensees acting as principals'),
  'ga-ministerial': ref('https://grec.state.ga.us/wp-content/uploads/pdfs/About/newsarticles/2025GRECRENewsApril.pdf','GREC April 2025 newsletter pp. 1–2; BRRETA 10-6A-14; read with current Rule 520-1-.02(r)'),
  'ga-reciprocity': ref('https://grec.state.ga.us/wp-content/uploads/2023/09/Reciprocity-for-Real-Estate-Licensees.pdf','GREC reciprocity guide; eligibility only, no fee figure relied on'),
  'ny-syllabus': ref('https://dos.ny.gov/real-estate-salesperson-77-hour-curriculum','NY DOS 77-hour salesperson syllabus; subject headings and objectives'),
  'ny-license': ref('https://dos.ny.gov/real-estate-salesperson-frequently-asked-questions','NY DOS salesperson FAQ; initial education, licensing and association'),
  'ny-compensation': ref('https://www.nysenate.gov/legislation/laws/RPP/442-A','New York RPL 442-a; salesperson compensation restrictions'),
  'ny-agency': ref('https://www.nysenate.gov/legislation/laws/RPP/443','New York RPL 443(1)–(4); agency, scope, disclosure, acknowledgment and informed consent'),
  'ny-condition': ref('https://www.nysenate.gov/legislation/laws/RPP/462','New York RPL 462; read with exemptions in RPL 463'),
  'ny-form': ref('https://dos.ny.gov/system/files/documents/2025/05/dos-1614-f-property-condition-disclosure-statement_04.2025-eff.-07.2025.pdf','NY DOS current property condition disclosure form; general instructions'),
  'ny-update': ref('https://content.govdelivery.com/accounts/NYSDOS/bulletins/39132db','NY DOS disclosure-law update effective March 20, 2024; supersedes old $500-credit form'),
  'ny-income': ref('https://ag.ny.gov/publications/source-income-discrimination','New York Attorney General; lawful source of income, coverage and exceptions'),
};
export const STATE_REFERENCES = {
  TX: [ref('https://www.trec.texas.gov/become-licensed/sales-agent','TREC sales agent education; six-course topic structure'),ref('https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules','Current TREC rules; read the question’s curriculum pinpoint')],
  FL: [REFERENCES['fl-syllabus']],
  CO: [ref('https://dre.colorado.gov/division-programs/real-estate-broker/education/broker-qualifying-education','Colorado DRE six qualifying education outlines; course/topic structure'), ref('https://leg.colorado.gov/bills/hb26-1426','HB26-1426 section 87, effective August 12, 2026; written relationships and compensation'), ref('https://content.govdelivery.com/accounts/CODORA/bulletins/424a45a','DRE written relationship agreement advisory, August 12, 2026')],
  AZ: [ref('https://azre.gov/resources/exam-curriculum-real-estate-salesperson','ADRE salesperson exam curriculum effective January 1, 2026; topic alignment')],
  NC: [ref('https://www.ncrec.gov/Forms/Education/Prelicense_Course_Syllabus.pdf','NCREC prelicensing syllabus; March 2024 edition amended May 2026; current bytes match retained source'),ref('https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/ByChapter/Chapter_93A.html','North Carolina Chapter 93A; broker terminology and licensure')],
  GA: [REFERENCES['ga-education']],
  PA: [ref('https://www.pa.gov/agencies/dos/department-and-offices/bpoa/boards-commissions/real-estate-commission/education-information','Pennsylvania Commission Fundamentals and Practice outlines; course/topic structure')],
  WA: [ref('https://app.leg.wa.gov/RCW/default.aspx?cite=18.86&full=true','Current RCW 18.86; statutory duties, services agreements, limited dual agency and marketing'),ref('https://dol.wa.gov/media/pdf/1418/real-estate-fundamentals-2022pdf/download?inline=','DOL Fundamentals objective inventory; bounded topic alignment'),ref('https://dol.wa.gov/media/pdf/1419/reprac2010pdf/download?inline=','DOL Practices objective inventory; inherited course conformity remains NO-GO')],
  NY: [REFERENCES['ny-syllabus']],
};
export const PRIORITY_STATES = ['TX','FL','CO','AZ','NC','GA','PA','WA','NY'];
export const PRACTICE_DISCLOSURE = 'Free practice. No account required. Not an official state exam. Questions are original StateCourse educational practice. No course credit. No completion certificate. No regulator approval or endorsement is claimed.';
