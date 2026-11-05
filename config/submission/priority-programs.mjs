/** Existing-work inventory for unsigned local review exports, not an approval or hour certificate. */
const course = (id, hours, curriculumDir) => ({ id, proposedHours:hours, curriculumDir });
const under = (state,id,hours) => course(id,hours,`${state}/${id}/curriculum`);
export const PRIORITY_SUBMISSION_PROGRAMS = Object.freeze([
  {
    state:'TX', name:'Texas', root:'texas',
    courses:[...['principles-real-estate-i','principles-real-estate-ii','law-of-agency','law-of-contracts','promulgated-contract-forms','real-estate-finance'].map(slug=>under('texas',`tx-${slug}-30-v1`,30))],
    openContentWork:['Independent review and observed duration evidence for all six courses','Resolve remaining course-specific acceptance findings and freeze the exact reviewer/student version'],
    openApplicationWork:['Provider/entity, financial and bond evidence in the existing provider-application checklist','Current forms and authorized signer/operating and records roles','Course-application sequencing and any required provider identifier'],
    authority:'https://www.trec.texas.gov/forms/qualifying-education-provider-application'
  },
  {
    state:'FL', name:'Florida', root:'florida',
    courses:[under('florida','fl-sales-associate-course-i-63-v1',63)],
    openContentWork:['Substantive expansion of the 19 sections beyond short summaries and objective stubs','Objective time study for 3,000 instruction minutes plus the separate 150-minute course exam','Complete and independently review two secure final forms; the existing 19-item slice is not a complete bank','Freeze real student-material pagination and page-referenced keys'],
    openApplicationWork:['School/provider and course routes under current RE 5/RE 19/RE 18 controls','Owner entity, school officials, financial/policy inputs and signatures','Resolve exam design/adoption questions in the existing DBPR record'],
    authority:'https://www2.myfloridalicense.com/real-estate-commission/education/'
  },
  {
    state:'CO', name:'Colorado', root:'colorado',
    courses:[under('colorado','co-real-estate-law-and-practice-48-v1',48),under('colorado','co-contracts-and-regulations-48-v1',48),under('colorado','co-practical-applications-32-v1',32),under('colorado','co-closings-24-v1',24),under('colorado','co-current-legal-issues-8-v1',8),under('colorado','co-trust-accounts-and-record-keeping-8-v1',8)],
    openContentWork:['Complete current Commission contract families and related forms, including three prepared-contract closing problems','Independently review the new closing/trust workbooks and current-law corrections','Complete written comprehensive examinations and verify actual instructional duration'],
    openApplicationWork:['Current DRE provider/course documentation and DPOS applicability/authorization determination','Approved delivery-method and operating evidence as applicable','Owner school, financial, policy and signature inputs'],
    authority:'https://dre.colorado.gov/division-programs/real-estate-broker/education/broker-qualifying-education'
  },
  {
    state:'AZ', name:'Arizona', root:'arizona',
    courses:[under('arizona','az-salesperson-prelicense-90-v1',90),under('arizona','az-contract-writing-6-v1',6)],
    openContentWork:['Complete objective-by-objective comparison to current ADRE prescribed content','Build and review required completed contract/listing/lease drafting activities and course finals','Verify clock-hour evidence and the approved final-examination administration arrangement'],
    openApplicationWork:['Current school and separate prelicensing/contract-writing application forms','School administrator, enrollment agreement, delivery/identity and location/exam evidence','Owner entity, policy and signature inputs'],
    authority:'https://azre.gov/divisions/education/education-forms-resources'
  },
  {
    state:'NC', name:'North Carolina', root:'north-carolina',
    courses:[course('nc-broker-prelicensing-75-v1',75,'north-carolina/curriculum')],
    openContentWork:['Substantiate 3,600 active instructional minutes under the specific asynchronous time rules; raw manuscript length is insufficient','Complete required-activity/form artifacts and independent review','Validate the two protected exam forms and actual proctor, identity, progression and records behavior'],
    openApplicationWork:['Provider and course application data, policy disclosure and required approval evidence','Resolve current-source dependencies in the existing NCREC manifest','Owner school officials, entity and signature inputs'],
    authority:'https://www.ncrec.gov/Forms/Education/Prelicense_Course_Syllabus.pdf'
  },
  {
    state:'GA', name:'Georgia', root:'georgia',
    courses:[under('georgia','ga-salesperson-prelicense-75-v1',75)],
    prerequisite:'Rule 520-2-.04(10)(b) requires Commission methodology approval before development of specific computer-based credit courses; no such authorization is held.',
    openContentWork:['Obtain the required methodology authorization before developing the specific computer-based course','After clearance: author the full 75-hour course, required written work, mastery interactions and secure finals','Run the rule-prescribed nine-person development pilot and retain actual evidence'],
    openApplicationWork:['Methodology package and GREC written direction','GREC school and course-code path; GNPEC classification/exemption determination','Owner school director/coordinator, entity, policy, financial and signature inputs'],
    authority:'https://rules.sos.ga.gov/gac/520-2'
  },
  {
    state:'PA', name:'Pennsylvania', root:'pennsylvania',
    courses:[under('pennsylvania','pa-real-estate-fundamentals-30-v1',30),under('pennsylvania','pa-real-estate-practice-45-v1',45)],
    openContentWork:['Conform every objective to the two newly held Commission outlines; Practice needs substantive business, fair housing/antitrust, finance, valuation and closing coverage','Independently review the current-law remediation, prescribed notices and new disclosure workshop','Review Act 74 effective-date, form-revision and website-posting events before a later freeze','Complete proctored course finals and observed instruction-time evidence'],
    openApplicationWork:['Provider and course application forms are held; complete actual policies and required owner fields','ARELLO or Commission-accepted equivalent distance-method evidence is not held','Owner director, entity, enrollment/refund and signature inputs'],
    authority:'https://www.pa.gov/agencies/dos/resources/professional-licensing-resources/licensure-processing-guides-and-timelines/real-estate-commission-guide'
  },
  {
    state:'WA', name:'Washington', root:'washington',
    courses:[under('washington','wa-real-estate-fundamentals-60-v1',60),under('washington','wa-real-estate-practices-30-v1',30)],
    openContentWork:['Remediate all partial/missing mandatory objectives and subordinate topics in the existing complete DOL matrix','Build actual business/CMA/marketing/form/closing/calculator workshops','Complete separate 180/90-item comprehensive finals and independent review','Substantiate 3,000/1,500 active instruction minutes and actual distance controls'],
    openApplicationWork:['Current DOL school/course application fields and attachments','School officials, approved instructor and delivery/records evidence','Owner entity, policy and signature inputs'],
    authority:'https://dol.wa.gov/media/pdf/1418/real-estate-fundamentals-2022pdf/download?inline='
  },
  {
    state:'NY', name:'New York', root:'new-york',
    prerequisite:'19 NYCRR 176.1 restricts broker affiliation/control of a course seeking approval. The known founder is a California broker; applicability to actual StateCourse ownership/control requires a documented determination. Do not assume hiring an instructor cures entity eligibility.',
    courses:[under('new-york','ny-salesperson-prelicense-77-v1',77)],
    openContentWork:['Author the full 19-subject 77-hour course; the public 100-question collection is not a manuscript','Build source-traced activities, comprehensive school exam/keys and stable pagination','Validate the asynchronous delivery application and actual school-exam arrangement, including required New York location','Independent legal/content, accessibility and duration review'],
    openApplicationWork:['Resolve provider/course independence under 19 NYCRR 176.1 using actual ownership/control facts and DOS direction','Current DOS qualifying-course and distance-learning application attachments','School owner/coordinator, location and entity documentation','Owner policy, financial and signature inputs'],
    authority:'https://dos.ny.gov/real-estate-agent'
  }
]);
