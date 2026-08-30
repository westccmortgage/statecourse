/**
 * FREC Course I — the Commission's own syllabus, transcribed and locked.
 *
 * WHAT THIS FILE IS. Rule 61J2-3.008(4)(b), F.A.C. does not describe the Course I syllabus; it
 * INCORPORATES one BY REFERENCE — "FREC Sales Associate Course Syllabus (FREC Course I)", Ref-14599,
 * the January 1, 2023 revision — and directs that submissions for classes offered on or after
 * 1 January 2023 be evaluated against it. The syllabus is therefore not guidance about the course.
 * It is part of the rule, and the rule requires a pre-licensing course to "conform to and follow the
 * order of the Course I ... syllabus" and to "include learning objectives for each session of the
 * syllabus" (61J2-3.008(4)(b)3.h.). ORDER is a compliance property, not an editorial preference.
 *
 * HOW THIS FILE WAS BUILT, AND WHY THE FIRST ATTEMPT WAS NOT GOOD ENOUGH. The copy flrules.org
 * serves for Ref-14599 is a 59-page SCAN with no text layer. A first pass OCR'd that scan and
 * produced an objective count that could not even agree with itself — 182 at parse time, 181 after
 * cleaning — which is a count nobody should build a course against. An OCR total that drifts is not
 * a transcription; it is a guess with a number attached.
 *
 * The Department publishes the same syllabus a second time, on its own education page, as
 * FREC1SyllabusCleanFinal01012023.pdf — 59 pages, identical content, WITH a real text layer. Every
 * objective below is transcribed from that text layer, not from OCR. The OCR pass is retained as a
 * cross-check rather than as a source: florida/frec-sources/extracted/syllabus-reconciliation.json
 * records, for all nineteen sections, the verified transcription, the OCR output, the page number,
 * and — for the five sections where they disagreed — what the disagreement was and how it resolved.
 * In every case OCR was the party at fault, splitting a wrapped objective in two or merging two
 * into one.
 *
 * THE VERIFIED TOTAL IS 180. Not 181, not 182. And 180 is not an arbitrary number: DBPR's own course
 * approval application, DBPR RE 18, requires learning objectives at "[t]hree per hour", and the
 * course carries 60 instruction hours. 3 x 60 = 180. The Commission's syllabus and the Department's
 * application form agree, which is a stronger check on the transcription than either alone.
 *
 * WHAT IS LOCKED. All of it, now — section count, section order, titles, per-section objective
 * counts, objective wording, and the printed page each objective appears on. `verify()` below fails
 * if the total stops matching the sum of the section counts, if any objective loses its page
 * reference, if any objective is left resting on OCR alone, or if the section order departs from
 * the incorporated syllabus. Those four conditions are the ones under which this file would quietly
 * stop being a transcription, so they are the ones the test asserts.
 *
 * WHAT THE SYLLABUS DOES NOT SAY. It allocates NO hours to any section. Its only timing instruction,
 * on page 2, is that "Section times are not required to be three hours in duration provided the
 * overall course is 60-hours of instruction with 3-hour end-of-course examination. Allocate your
 * time based upon the complexity of the material." The hour allocation is StateCourse's to design
 * and, under 61J2-3.008(4)(b)3.e, StateCourse's to evidence by objective study. It is not here.
 */

export const SYLLABUS_REFERENCE = Object.freeze({
  id: "Ref-14599",
  name: "FREC Sales Associate Course Syllabus (FREC Course I)",
  revision: "January 1, 2023",
  adoptedOn: "2022-07-26",
  incorporatedBy: "Rule 61J2-3.008(4)(b), F.A.C.",
  appliesTo: "Course I submissions for classes offered on or after 1 January 2023",

  /* The rule points at the flrules.org reference copy, which is the scan. The Department's own
     education page serves the same syllabus with a text layer. Both are held; the text-layer copy
     is what was transcribed, and the scan is what the rule cites. */
  citedCopy: Object.freeze({
    publisher: "Florida Department of State, Division of Library and Information Services (flrules.org)",
    url: "https://www.flrules.org/gateway/reference.asp?No=Ref-14599",
    localCopy: "florida/frec-sources/fac/ref-14599-frec-course-1-eff-010123.pdf",
    pages: 59,
    hasTextLayer: false,
  }),
  transcribedCopy: Object.freeze({
    publisher: "Florida Department of Business and Professional Regulation, Division of Real Estate",
    url: "https://www2.myfloridalicense.com/re/documents/FREC1SyllabusCleanFinal01012023.pdf",
    localCopy: "florida/frec-sources/dbpr/education/FREC1SyllabusCleanFinal01012023.pdf",
    pages: 59,
    hasTextLayer: true,
  }),

  transcriptionMethod: "transcribed from the Department's text-layer PDF; OCR of the flrules.org scan retained only as a cross-check",
  objectivesVerifiedAgainstSource: true,
  reconciliationRecord: "florida/frec-sources/extracted/syllabus-reconciliation.json",
  ocrCrossCheckTotal: 181,
  sectionsWhereOcrDisagreed: Object.freeze([1, 3, 6, 7, 15]),
});

/* The order of this array IS the compliance artifact under 61J2-3.008(4)(b)3.h. It must not be
   sorted, filtered or re-grouped by any consumer. */
const section = (record) =>
  Object.freeze({
    ...record,
    learningObjectives: Object.freeze(record.learningObjectives.map((o) => Object.freeze(o))),
  });

export const SECTIONS = Object.freeze([
  section({
    number: 1,
    title: "Course Overview: The Real Estate Business",
    startPage: 3,
    learningObjectiveCount: 7,
    ocrObjectiveCount: 6,
    ocrDiscrepancy: "OCR 6 vs verified 7",
    ocrResolution: "OCR merged the two-line objective 'Describe activities that require appraiser services and distinguish among CMA, BPO, and appraisal' with its wrapped continuation and dropped one bullet. Verified text layer carries 7.",
    learningObjectives: [
      { n: 1, page: 3, text: "Describe the various activities of real estate brokerage" },
      { n: 2, page: 3, text: "Distinguish among the five major sales specialties" },
      { n: 3, page: 3, text: "Identify the role of property managers" },
      { n: 4, page: 3, text: "Describe activities that require appraiser services and distinguish among CMA, BPO, and appraisal" },
      { n: 5, page: 3, text: "Understand the mortgage process and the role of mortgage loan originator" },
      { n: 6, page: 3, text: "Explain the three phases of development and construction" },
      { n: 7, page: 3, text: "Distinguish among the three categories of residential construction" },
    ],
  }),
  section({
    number: 2,
    title: "Real Estate License Law And Qualifications For Licensure",
    startPage: 6,
    learningObjectiveCount: 11,
    learningObjectives: [
      { n: 1, page: 6, text: "Identify the qualifications for a sales associate's license" },
      { n: 2, page: 6, text: "Describe the application requirements for licensure including nonresident application requirements" },
      { n: 3, page: 6, text: "Explain the importance of responding accurately and completely to the background information questions on the licensure application" },
      { n: 4, page: 6, text: "Illustrate the background check procedure conducted by the DBPR" },
      { n: 5, page: 6, text: "Describe the education requirement for pre- and post-license education and continuing education" },
      { n: 6, page: 6, text: "Distinguish among the various license categories" },
      { n: 7, page: 6, text: "Identify services of real estate where licensure is required" },
      { n: 8, page: 6, text: "Recognize actions that constitute unlicensed activity" },
      { n: 9, page: 6, text: "Recognize exemptions from real estate licensure" },
      { n: 10, page: 6, text: "Distinguish between registration and licensure" },
      { n: 11, page: 6, text: "Explain mutual recognition agreements" },
    ],
  }),
  section({
    number: 3,
    title: "Real Estate License Law And Commission Rules",
    startPage: 9,
    learningObjectiveCount: 7,
    ocrObjectiveCount: 8,
    ocrDiscrepancy: "OCR 8 vs verified 7",
    ocrResolution: "OCR split 'Describe the composition, appointment and member qualifications of the Florida Real Estate Commission' across two bullets at the line wrap, inventing an eighth. Verified text layer carries 7.",
    learningObjectives: [
      { n: 1, page: 9, text: "Describe the composition, appointment and member qualifications of the Florida Real Estate Commission" },
      { n: 2, page: 9, text: "Define the powers and duties of the Commission" },
      { n: 3, page: 9, text: "Describe the scope and function of the DBPR and the DRE" },
      { n: 4, page: 9, text: "Explain the different licensure statuses" },
      { n: 5, page: 9, text: "Distinguish between active and inactive license status" },
      { n: 6, page: 9, text: "Describe the regulations regarding involuntarily inactive status" },
      { n: 7, page: 9, text: "Distinguish between multiple and group licenses" },
    ],
  }),
  section({
    number: 4,
    title: "Authorized Relationships, Duties And Disclosure",
    startPage: 11,
    learningObjectiveCount: 10,
    learningObjectives: [
      { n: 1, page: 11, text: "Describe which provisions of the Brokerage Relationship Disclosure Act apply only to residential real estate sales and list types of real estate activities that are exempt from the disclosure requirements" },
      { n: 2, page: 11, text: "Define residential transaction" },
      { n: 3, page: 11, text: "Distinguish among nonrepresentation, single agent and transaction broker" },
      { n: 4, page: 11, text: "List and describe the duties owed in the various authorized relationships" },
      { n: 5, page: 11, text: "Compare and contrast the fiduciary duties owed in a single agent relationship and the duties owed in a transaction broker relationship" },
      { n: 6, page: 11, text: "Describe the disclosure procedures for the various authorized relationships" },
      { n: 7, page: 11, text: "Describe the required content and format of the various disclosure forms" },
      { n: 8, page: 11, text: "Explain the procedure for transition from a single agent to a transaction broker" },
      { n: 9, page: 11, text: "Describe the disclosure requirements for non-residential transactions where the buyer and seller have assets of $1 million or more" },
      { n: 10, page: 11, text: "List the events that will cause an authorized relationship to be terminated" },
    ],
  }),
  section({
    number: 5,
    title: "Real Estate Brokerage Activities And Procedures",
    startPage: 14,
    learningObjectiveCount: 9,
    learningObjectives: [
      { n: 1, page: 14, text: "Identify the requirements for real estate brokerage office(s) and the types of business entities that may register" },
      { n: 2, page: 14, text: "Explain what determines whether a temporary shelter must be registered as a branch office" },
      { n: 3, page: 14, text: "List the requirements related to sign regulation" },
      { n: 4, page: 14, text: "List the requirements related to the regulation of advertising by real estate brokers" },
      { n: 5, page: 14, text: "Explain the term immediately as it applies to earnest money deposits" },
      { n: 6, page: 14, text: "Describe the four settlement procedures available to a broker who has received conflicting demands or who has a good-faith doubt as to who is entitled to disputed funds" },
      { n: 7, page: 14, text: "Describe the obligations placed on a sales associate who changes employers and/or address" },
      { n: 8, page: 14, text: "Describe the regulations regarding lien rights for unpaid sales commission" },
      { n: 9, page: 14, text: "Contrast the features and requirements of the various types of business organizations" },
    ],
  }),
  section({
    number: 6,
    title: "Violations Of License Law, Penalties And Procedures",
    startPage: 18,
    learningObjectiveCount: 9,
    ocrObjectiveCount: 10,
    ocrDiscrepancy: "OCR 10 vs verified 9",
    ocrResolution: "OCR split one wrapped objective into two. Verified text layer carries 9.",
    learningObjectives: [
      { n: 1, page: 18, text: "Explain the procedures involved in the reporting of violations, the investigation of complaints and the conduct of hearings" },
      { n: 2, page: 18, text: "Define the elements of a valid complaint" },
      { n: 3, page: 18, text: "Discuss the composition of the probable-cause panel" },
      { n: 4, page: 18, text: "Recognize events that would cause a license application to be denied" },
      { n: 5, page: 18, text: "Distinguish actions that would cause a license to be subject to suspension or revocation" },
      { n: 6, page: 18, text: "Identify individuals who would be eligible and the procedure to seek reimbursement from the Real Estate Recovery Fund" },
      { n: 7, page: 18, text: "Identify individuals who are not qualified to make a claim from the Real Estate Recovery Fund" },
      { n: 8, page: 18, text: "Describe the monetary limits imposed by law on the Real Estate Recovery Fund" },
      { n: 9, page: 18, text: "Distinguish among the various penalties that may be issued by a court of law" },
    ],
  }),
  section({
    number: 7,
    title: "Federal And State Laws Pertaining To Real Estate",
    startPage: 21,
    learningObjectiveCount: 10,
    ocrObjectiveCount: 11,
    ocrDiscrepancy: "OCR 11 vs verified 10",
    ocrResolution: "OCR split one wrapped objective into two. Verified text layer carries 10.",
    learningObjectives: [
      { n: 1, page: 21, text: "Explain the significance of the Jones vs. Mayer court case" },
      { n: 2, page: 21, text: "List the real estate included under the different fair housing acts" },
      { n: 3, page: 21, text: "Recognize the groups protected under the 1968 Fair Housing Act" },
      { n: 4, page: 21, text: "List the property exempt from the 1968 Fair Housing Act and the protected classes" },
      { n: 5, page: 21, text: "List the two protected classed added to the 1988 Fair Housing Amendment" },
      { n: 6, page: 21, text: "Describe the types of discriminatory acts that are prohibited under the 1968 Fair Housing Act" },
      { n: 7, page: 21, text: "Describe the HUD process for handling a complaint under the 1968 Fair Housing Act" },
      { n: 8, page: 21, text: "Describe the objectives and major provisions of the Americans with Disabilities Act" },
      { n: 9, page: 21, text: "Describe the major provisions of the Florida Residential Landlord and Tenant Act" },
      { n: 10, page: 21, text: "Describe the major provisions of the Interstate Land Sales Disclosure Act" },
    ],
  }),
  section({
    number: 8,
    title: "Property Rights: Estates And Tenancies; Condominiums, Cooperatives, Community Development Districts, Homeowner Associations, And Time-Sharing",
    /* The heading printed on the section itself differs from the table of contents entry.
       Both are recorded; neither is preferred here. */
    printedSectionHeading: "PROPERTY RIGHTS: ESTATES AND TENANCIES; CONDOMINIUMS, COOPERATIVES, COMMUNITY DEVELOPMENT DISTRICTS, HOMEOWNER ASSOCIATIONS AND TIME-SHARING",
    startPage: 23,
    learningObjectiveCount: 8,
    learningObjectives: [
      { n: 1, page: 23, text: "Define real property based on the definition in Chapter 475, F.S." },
      { n: 2, page: 23, text: "List and explain the physical components of real property" },
      { n: 3, page: 23, text: "Explain the four tests courts use to determine if an item is a fixture" },
      { n: 4, page: 23, text: "Distinguish between real and personal property" },
      { n: 5, page: 23, text: "Describe the bundle of rights associated with real property ownership" },
      { n: 6, page: 23, text: "List the principal types of estates (tenancies) and describe their characteristics" },
      { n: 7, page: 23, text: "Describe the features associated with the Florida homestead law" },
      { n: 8, page: 23, text: "Distinguish between cooperatives, condominiums and time-shares and describe the four main documents associated with condominiums" },
    ],
  }),
  section({
    number: 9,
    title: "Title, Deeds And Ownership Restrictions",
    startPage: 27,
    learningObjectiveCount: 9,
    learningObjectives: [
      { n: 1, page: 27, text: "Differentiate between voluntary and involuntary alienation" },
      { n: 2, page: 27, text: "Explain the various methods of acquiring title to real property and describe the conditions necessary to acquire real property by adverse possession" },
      { n: 3, page: 27, text: "Distinguish between actual notice and constructive notice" },
      { n: 4, page: 27, text: "Distinguish between an abstract of title and a chain of title" },
      { n: 5, page: 27, text: "Explain the different types of title insurance" },
      { n: 6, page: 27, text: "Describe the parts of a deed and the requirements of a valid deed" },
      { n: 7, page: 27, text: "List and describe the four types of statutory deeds and the legal requirements for deeds" },
      { n: 8, page: 27, text: "List and describe the various types of governmental and private restrictions on ownership of real property" },
      { n: 9, page: 27, text: "Distinguish among the various types of leases and liens" },
    ],
  }),
  section({
    number: 10,
    title: "Legal Descriptions",
    startPage: 31,
    learningObjectiveCount: 10,
    learningObjectives: [
      { n: 1, page: 31, text: "Describe the purpose for legal descriptions" },
      { n: 2, page: 31, text: "Understand the licensee’s role and responsibilities as it pertains to legal descriptions" },
      { n: 3, page: 31, text: "Explain and distinguish among the three types of legal descriptions" },
      { n: 4, page: 31, text: "Describe the process of creating a legal description using the metes-and-bounds method" },
      { n: 5, page: 31, text: "Locate a township by township line and range" },
      { n: 6, page: 31, text: "Locate a particular section within a township" },
      { n: 7, page: 31, text: "Understand how to subdivide a section" },
      { n: 8, page: 31, text: "Calculate the number of acres in a parcel based on the legal description, and convert to square feet" },
      { n: 9, page: 31, text: "Explain the use of assessor's parcel numbers" },
      { n: 10, page: 31, text: "Apply the measurements associated with checks, townships and sections" },
    ],
  }),
  section({
    number: 11,
    title: "Real Estate Contracts",
    startPage: 33,
    learningObjectiveCount: 11,
    learningObjectives: [
      { n: 1, page: 33, text: "List and describe the essentials of a contract" },
      { n: 2, page: 33, text: "Distinguish among formal, parol, bilateral, unilateral, implied, express, executory and executed contracts" },
      { n: 3, page: 33, text: "Describe the various ways in which an offer is terminated" },
      { n: 4, page: 33, text: "Describe the various methods of terminating a contract" },
      { n: 5, page: 33, text: "Explain the remedies for breach of a contract" },
      { n: 6, page: 33, text: "Describe the effect of the Statute of Frauds and the Statute of Limitations" },
      { n: 7, page: 33, text: "Describe the elements of an option" },
      { n: 8, page: 33, text: "Differentiate among the various types of listings" },
      { n: 9, page: 33, text: "Explain and describe the various disclosures required in a real estate contract" },
      { n: 10, page: 33, text: "Recognize what constitutes fraud" },
      { n: 11, page: 33, text: "Recognize what constitutes culpable negligence" },
    ],
  }),
  section({
    number: 12,
    title: "Residential Mortgages",
    startPage: 36,
    learningObjectiveCount: 9,
    learningObjectives: [
      { n: 1, page: 36, text: "Distinguish between title theory and lien theory" },
      { n: 2, page: 36, text: "Describe the essential elements of the mortgage instrument and the note" },
      { n: 3, page: 36, text: "Describe the various features of a mortgage including down payment, loan-to-value ratio, equity, interest, loan servicing, escrow account, PITI, discount points and loan origination fee" },
      { n: 4, page: 36, text: "Explain assignment of a mortgage and the purpose of an estoppel certificate" },
      { n: 5, page: 36, text: "Explain the foreclosure process and distinguish between judicial and nonjudicial foreclosure" },
      { n: 6, page: 36, text: "Describe the mortgagor’s and mortgagee’s rights in a foreclosure" },
      { n: 7, page: 36, text: "Calculate loan-to-value ratio" },
      { n: 8, page: 36, text: "Explain the use of discount points and calculate approximate yield on a loan" },
      { n: 9, page: 36, text: "Distinguish among the various methods of purchasing mortgaged property" },
    ],
  }),
  section({
    number: 13,
    title: "Types Of Mortgages And Sources Of Financing",
    startPage: 39,
    learningObjectiveCount: 10,
    learningObjectives: [
      { n: 1, page: 39, text: "Describe the mechanics of an adjustable rate mortgage and the components of an ARM" },
      { n: 2, page: 39, text: "Describe the features of an amortized mortgage and amortize a level-payment plan mortgage when given the principal amount, the interest rate and the monthly payment amount" },
      { n: 3, page: 39, text: "Distinguish among the various types of mortgages" },
      { n: 4, page: 39, text: "Describe the characteristics of FHA mortgages and common FHA loan programs" },
      { n: 5, page: 39, text: "Identify the guarantee feature of VA mortgage loans and the characteristics of VA loan programs" },
      { n: 6, page: 39, text: "Explain the process of qualifying for a loan and how to calculate qualifying ratios" },
      { n: 7, page: 39, text: "Distinguish among the primary sources of home financing" },
      { n: 8, page: 39, text: "Describe the role of the secondary mortgage market and know the features of the major agencies active in the secondary market" },
      { n: 9, page: 39, text: "Describe the major provisions of the federal laws regarding fair credit and lending procedures" },
      { n: 10, page: 39, text: "Recognize and avoid mortgage fraud" },
    ],
  }),
  section({
    number: 14,
    title: "Real Estate Related Computations And Closing Of Transactions",
    startPage: 44,
    learningObjectiveCount: 10,
    learningObjectives: [
      { n: 1, page: 44, text: "Compute the sales commission" },
      { n: 2, page: 44, text: "Calculate the percent of profit or loss, given the original cost of the investment, the sale price and the dollar amount of profit or loss" },
      { n: 3, page: 44, text: "Define settlement and title closing" },
      { n: 4, page: 44, text: "List the preliminary steps to a closing" },
      { n: 5, page: 44, text: "Prorate the buyer's and seller's expenses" },
      { n: 6, page: 44, text: "Calculate the dollar amount of transfer taxes on deeds, mortgages and notes" },
      { n: 7, page: 44, text: "Allocate taxes and fees to the proper parties and compute individual costs" },
      { n: 8, page: 44, text: "Explain the rules of thumb for Closing Disclosure entries" },
      { n: 9, page: 44, text: "Explain the major sections of the Closing Disclosure" },
      { n: 10, page: 44, text: "Demonstrate ability to read and check the Closing Disclosure for errors" },
    ],
  }),
  section({
    number: 15,
    title: "The Real Estate Markets And Analysis",
    startPage: 46,
    learningObjectiveCount: 6,
    ocrObjectiveCount: 5,
    ocrDiscrepancy: "OCR 5 vs verified 6",
    ocrResolution: "OCR merged 'Identify the factors that influence demand' and 'Identify the factors that influence supply' into a single line. Visually confirmed on printed page 46: six distinct bullets. Verified text layer carries 6.",
    learningObjectives: [
      { n: 1, page: 46, text: "Describe the physical characteristics of real estate" },
      { n: 2, page: 46, text: "Describe the economic characteristics of real estate" },
      { n: 3, page: 46, text: "Identify the factors that influence demand" },
      { n: 4, page: 46, text: "Identify the factors that influence supply" },
      { n: 5, page: 46, text: "Distinguish among different ways of interpreting market conditions" },
      { n: 6, page: 46, text: "Demonstrate understanding of the different market indicators" },
    ],
  }),
  section({
    number: 16,
    title: "Real Estate Appraisal",
    startPage: 48,
    learningObjectiveCount: 16,
    learningObjectives: [
      { n: 1, page: 48, text: "Describe federal and state regulations pertaining to appraising" },
      { n: 2, page: 48, text: "Identify the appraisers fiduciary relationship" },
      { n: 3, page: 48, text: "Identify the economic and physical characteristics of real estate that affect market value" },
      { n: 4, page: 48, text: "Explain what the Uniform Standards of Professional Appraisal Practice (USPAP) is and how it affects the appraisal process of real property" },
      { n: 5, page: 48, text: "Distinguish among the various types of value" },
      { n: 6, page: 48, text: "Define market value and describe its underlying assumptions" },
      { n: 7, page: 48, text: "Distinguish among value, price and cost" },
      { n: 8, page: 48, text: "Describe the four characteristics of value" },
      { n: 9, page: 48, text: "Distinguish among the principles of value" },
      { n: 10, page: 48, text: "Differentiate among the three approaches to estimating the value of real property" },
      { n: 11, page: 48, text: "Estimate value of subject property using Comparable Sales Approach" },
      { n: 12, page: 48, text: "Estimate value of subject property using Cost Approach" },
      { n: 13, page: 48, text: "Estimate value of subject property using Income Approach" },
      { n: 14, page: 48, text: "Reconcile three approaches to establish final value estimate" },
      { n: 15, page: 48, text: "Calculate value using gross multiplier analysis" },
      { n: 16, page: 48, text: "Explain how to prepare a Comparative Market Analysis (CMA), comparing and contrasting with sales comparison approach" },
    ],
  }),
  section({
    number: 17,
    title: "Real Estate Investments And Business Opportunity Brokerage",
    startPage: 51,
    learningObjectiveCount: 8,
    learningObjectives: [
      { n: 1, page: 51, text: "Distinguish among the different types of real estate investments" },
      { n: 2, page: 51, text: "Identify the advantages and disadvantages of investing in real estate" },
      { n: 3, page: 51, text: "Distinguish among the various types of risk" },
      { n: 4, page: 51, text: "Explain the importance of investment analysis" },
      { n: 5, page: 51, text: "Describe the similarities and differences between real estate brokerage and business brokerage" },
      { n: 6, page: 51, text: "Describe the types of expertise required in business brokerage" },
      { n: 7, page: 51, text: "Distinguish among the methods of appraising businesses" },
      { n: 8, page: 51, text: "Describe the steps in the sale of a business" },
    ],
  }),
  section({
    number: 18,
    title: "Taxes Affecting Real Estate",
    startPage: 53,
    learningObjectiveCount: 9,
    learningObjectives: [
      { n: 1, page: 53, text: "Distinguish among immune, exempt and partially exempt property" },
      { n: 2, page: 53, text: "Describe the various personal exemptions available to qualified owners of homestead property" },
      { n: 3, page: 53, text: "Compute the property tax on a specific parcel, given the current tax rate, assessed value, eligible exemptions and transfer of assessment limitation difference (save our homes portability) if applicable" },
      { n: 4, page: 53, text: "List the steps involved in the tax appeal procedure" },
      { n: 5, page: 53, text: "Describe the purpose of Florida’s Green Belt Law" },
      { n: 6, page: 53, text: "Calculate the cost of a special assessment, given the conditions and amounts involved" },
      { n: 7, page: 53, text: "Describe the tax advantages of home ownership" },
      { n: 8, page: 53, text: "Explain how to determine taxable income of investment real estate" },
      { n: 9, page: 53, text: "Distinguish between installment sales and like-kind exchange" },
    ],
  }),
  section({
    number: 19,
    title: "Planning, And Zoning",
    /* The heading printed on the section itself differs from the table of contents entry.
       Both are recorded; neither is preferred here. */
    printedSectionHeading: "PLANNING, ZONING AND ENVIRONMENTAL HAZARDS",
    startPage: 56,
    learningObjectiveCount: 11,
    learningObjectives: [
      { n: 1, page: 56, text: "Describe the composition and authority of the local planning agency" },
      { n: 2, page: 56, text: "Explain the purpose of land-use controls and the role of zoning ordinances" },
      { n: 3, page: 56, text: "Identify the provisions of Florida’s comprehensive plan and the Growth Management Act" },
      { n: 4, page: 56, text: "Distinguish among the five general zoning classifications" },
      { n: 5, page: 56, text: "Distinguish among zoning ordinances, building codes and health ordinances" },
      { n: 6, page: 56, text: "Explain the purpose of a variance, special exception and a nonconforming use" },
      { n: 7, page: 56, text: "Calculate the number of lots available for development, given the total number of acres contained in a parcel, the percentage of land reserved for streets and other facilities and the minimum number of square feet per lot" },
      { n: 8, page: 56, text: "Describe the characteristics of a planned unit development" },
      { n: 9, page: 56, text: "Understand the basic provisions of the national flood insurance program" },
      { n: 10, page: 56, text: "Describe the impact Comprehensive Environmental Response Compensation and Liability Act (CERCLA)" },
      { n: 11, page: 56, text: "Explain the various environmental hazards associated with real estate" },
    ],
  }),
]);

export const SECTION_COUNT = SECTIONS.length;
export const TOTAL_LEARNING_OBJECTIVES = SECTIONS.reduce((n, s) => n + s.learningObjectiveCount, 0);

/** The prescribed sequence, exposed as a function so a caller cannot mutate what it is checked against. */
export function prescribedOrder() {
  return SECTIONS.map((s) => s.number);
}

/**
 * The four conditions under which this file would stop being a transcription and start being a
 * recollection. Returned as a list rather than thrown so that every failure is visible at once.
 */
export function verify() {
  const failures = [];

  const summed = SECTIONS.reduce((n, s) => n + s.learningObjectives.length, 0);
  if (summed !== TOTAL_LEARNING_OBJECTIVES) {
    failures.push(`declared total ${TOTAL_LEARNING_OBJECTIVES} does not match the sum of the section counts (${summed})`);
  }
  for (const s of SECTIONS) {
    if (s.learningObjectives.length !== s.learningObjectiveCount) {
      failures.push(`section ${s.number} declares ${s.learningObjectiveCount} objectives and carries ${s.learningObjectives.length}`);
    }
    for (const o of s.learningObjectives) {
      if (!Number.isInteger(o.page) || o.page < 1 || o.page > SYLLABUS_REFERENCE.transcribedCopy.pages) {
        failures.push(`section ${s.number} objective ${o.n} has no usable page reference`);
      }
      if (!o.text || !o.text.trim()) failures.push(`section ${s.number} objective ${o.n} has no text`);
    }
  }
  if (!SYLLABUS_REFERENCE.objectivesVerifiedAgainstSource) {
    failures.push("objectives are not verified against the source — they may not be relied on");
  }
  const order = prescribedOrder();
  const expected = Array.from({ length: order.length }, (_, i) => i + 1);
  if (order.join(",") !== expected.join(",")) {
    failures.push(`section order ${order.join(",")} departs from the incorporated syllabus`);
  }
  return failures;
}

export default Object.freeze({
  SYLLABUS_REFERENCE,
  SECTIONS,
  SECTION_COUNT,
  TOTAL_LEARNING_OBJECTIVES,
  prescribedOrder,
  verify,
});
