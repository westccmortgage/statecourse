/**
 * FREC Course I — the Commission's own syllabus, locked.
 *
 * WHAT THIS FILE IS. Rule 61J2-3.008(4)(b), F.A.C. does not describe the Course I syllabus; it
 * INCORPORATES one BY REFERENCE — "FREC Sales Associate Course Syllabus (FREC Course I)", Ref-14599,
 * the January 1, 2023 revision — and directs that submissions for classes offered on or after
 * 1 January 2023 be evaluated against it. So the syllabus is not guidance about the course. It is
 * part of the rule, and the rule says a pre-licensing course "must conform to and follow the order
 * of the Course I ... syllabus" and "must include learning objectives for each session of the
 * syllabus" (61J2-3.008(4)(b)3.h.).
 *
 * That single sentence is why this file exists before any Florida curriculum does. ORDER is a
 * compliance property, not an editorial preference. A Florida course that teaches the right topics
 * in a better sequence is a non-conforming course. Locking the order now means the curriculum gets
 * written to it, rather than being rearranged into it afterwards and hoping nothing shifted.
 *
 * WHAT IS LOCKED AND WHAT IS MERELY RECORDED — the distinction matters and is not decoration.
 *
 *   LOCKED: that there are nineteen sections, their numbers, and their titles. These were read
 *   directly off the syllabus's own TABLE OF CONTENTS on page 1 of the scanned document, by eye,
 *   not by OCR. Where a section's own heading differs from its table-of-contents entry, BOTH are
 *   recorded and neither is silently preferred — see section 19, where the contents page says
 *   "Planning, And Zoning" and the section itself says "Planning, Zoning And Environmental
 *   Hazards". The syllabus says both things. It is not this file's place to decide which the
 *   Commission meant.
 *
 *   RECORDED, NOT LOCKED: the learning objectives. The Commission publishes Ref-14599 as a 59-page
 *   SCAN with no text layer. The objectives below were recovered by OCR (tesseract 5.3.4) and carry
 *   OCR's characteristic damage — a dropped leading letter, a bullet glyph read as a letter, a
 *   wrapped line rejoined in the wrong place. They are a working index into the authority, good
 *   enough to plan a course against and NOT good enough to certify to a regulator. Every one must
 *   be read against the PDF by a person before any Florida curriculum claims to satisfy it.
 *   `objectivesVerifiedAgainstSource` stays false until that reading happens, and the Florida
 *   foundation test holds the count so that a silent edit cannot pass as a verification.
 *
 * THE AUTHORITY IS THE PDF, NOT THIS FILE. florida/frec-sources/fac/ref-14599-frec-course-1-eff-010123.pdf
 * is held on disk and hashed in the regulatory manifest. This file is an index to it.
 *
 * WHAT THE SYLLABUS DOES NOT SAY, WHICH IS AS IMPORTANT AS WHAT IT DOES. It allocates NO hours to
 * any section. Its only timing instruction is on page 2: "Section times are not required to be
 * three hours in duration provided the overall course is 60-hours of instruction with 3-hour
 * end-of-course examination. Allocate your time based upon the complexity of the material." The
 * hour allocation is therefore StateCourse's to design and StateCourse's to evidence, under
 * 61J2-3.008(4)(b)3.e. That work lives in config/florida/course-i-requirements.mjs, not here.
 */

export const SYLLABUS_REFERENCE = Object.freeze({
  id: "Ref-14599",
  name: "FREC Sales Associate Course Syllabus (FREC Course I)",
  revision: "January 1, 2023",
  adoptedOn: "2022-07-26",
  incorporatedBy: "Rule 61J2-3.008(4)(b), F.A.C.",
  appliesTo: "Course I submissions for classes offered on or after 1 January 2023",
  publisher: "Florida Department of State, Division of Library and Information Services (flrules.org)",
  url: "https://www.flrules.org/gateway/reference.asp?No=Ref-14599",
  localCopy: "florida/frec-sources/fac/ref-14599-frec-course-1-eff-010123.pdf",
  pages: 59,
  hasTextLayer: false,
  transcriptionMethod: "section titles read by eye from the scanned table of contents; learning objectives recovered by OCR (tesseract 5.3.4)",
  objectivesVerifiedAgainstSource: false,
});

/* The syllabus prescribes sequence. 61J2-3.008(4)(b)3.h. makes departing from it a defect, so the
   order of this array is itself the compliance artifact and must not be sorted, filtered or
   re-grouped by any consumer. */
const section = (record) => Object.freeze({ ...record, learningObjectives: Object.freeze(record.learningObjectives) });

export const SECTIONS = Object.freeze([
  section({
    number: 1,
    title: "Course Overview: The Real Estate Business",
    learningObjectiveCount: 6,
    learningObjectives: [
      "Describe the various activities of real estate brokerage",
      "Distinguish among the five major sales specialties",
      "Identify the role of property managers",
      "Describe activities that require appraiser services and distinguish among CMA, BPO, and appraisal",
      "Understand the mortgage process and the role of mortgage loan originator Explain the three phases of development and construction",
      "Distinguish among the three categories of residential construction",
    ],
  }),
  section({
    number: 2,
    title: "Real Estate License Law And Qualifications For Licensure",
    learningObjectiveCount: 11,
    learningObjectives: [
      "Identify the qualifications for a sales associate's license",
      "Describe the application requirements for licensure including nonresident application requirements",
      "Explain the importance of responding accurately and completely to the background information questions on the licensure application",
      "Illustrate the background check procedure conducted by the DBPR",
      "Describe the education requirement for pre- and post-license education and continuing ducation",
      "Distinguish among the various license categories",
      "Identify services of real estate where licensure is required",
      "Recognize actions that constitute unlicensed activity",
      "Recognize exemptions from real estate licensure",
      "Distinguish between registration and licensure",
      "Explain mutual recognition agreements",
    ],
  }),
  section({
    number: 3,
    title: "Real Estate License Law And Commission Rules",
    learningObjectiveCount: 8,
    learningObjectives: [
      "Describe the composition, appointment and member qualifications of the Florida Real",
      "Estate Commission",
      "Define the powers and duties of the Commission",
      "Describe the scope and function of the DBPR and the DRE",
      "Explain the different licensure statuses",
      "Distinguish between active and inactive license status",
      "Describe the regulations regarding involuntarily inactive status",
      "Distinguish between multiple and group licenses",
    ],
  }),
  section({
    number: 4,
    title: "Authorized Relationships, Duties And Disclosure",
    learningObjectiveCount: 10,
    learningObjectives: [
      "Describe which provisions of the Brokerage Relationship Disclosure Act apply only to residential real estate sales and list types of real estate activities that are exempt from the disclosure requirements",
      "Define residential transaction",
      "Distinguish among nonrepresentation, single agent and transaction broker",
      "List and describe the duties owed in the various authorized relationships",
      "Compare and contrast the fiduciary duties owed in a single agent relationship and the duties owed in a transaction broker relationship",
      "Describe the disclosure procedures for the various authorized relationships",
      "Describe the required content and format of the various disclosure forms",
      "Explain the procedure for transition from a single agent to a transaction broker",
      "Describe the disclosure requirements for non-residential transactions where the buyer and seller have assets of $1 million or more",
      "List the events that will cause an authorized relationship to be terminated",
    ],
  }),
  section({
    number: 5,
    title: "Real Estate Brokerage Activities And Procedures",
    learningObjectiveCount: 9,
    learningObjectives: [
      "Identify the requirements for real estate brokerage office(s) and the types of business ntities that may register",
      "Explain what determines whether a temporary shelter must be registered as a branch office",
      "List the requirements related to sign regulation",
      "List the requirements related to the regulation of advertising by real estate brokers",
      "Explain the term immediately as it applies to earnest money deposits",
      "Describe the four settlement procedures available to a broker who has received conflicting demands or who has a good-faith doubt as to who is entitled to disputed funds",
      "Describe the obligations placed on a sales associate who changes employers and/or address",
      "Describe the regulations regarding lien rights for unpaid sales commission",
      "Contrast the features and requirements of the various types of business organizations",
    ],
  }),
  section({
    number: 6,
    title: "Violations Of License Law, Penalties And Procedures",
    /* The section heading printed on the section itself reads "VIOLATIONS OF LICENSE LAW, PENALTIES AND PROCEDURES ", which is not word-for-word
       the table of contents entry. Recorded, not reconciled: the syllabus says both. */
    headingOnSection: "VIOLATIONS OF LICENSE LAW, PENALTIES AND PROCEDURES ",
    learningObjectiveCount: 10,
    learningObjectives: [
      "Explain the procedures involved in the reporting of violations, the investigation of complaints and the conduct of hearings",
      "Define the elements of a valid complaint",
      "Discuss the composition of the probable-cause panel",
      "Recognize events that would cause a license application to be denied",
      "Distinguish actions that would cause a license to be subject to suspension or revocation",
      "Identify individuals who would be eligible and the procedure to seek reimbursement from the Real Estate Recovery Fund",
      "Identify individuals who are not qualified to make a claim from the Real Estate",
      "Recovery Fund",
      "Describe the monetary limits imposed by law on the Real Estate Recovery Fund",
      "Distinguish among the various penalties that may be issued by a court of law",
    ],
  }),
  section({
    number: 7,
    title: "Federal And State Laws Pertaining To Real Estate",
    learningObjectiveCount: 11,
    learningObjectives: [
      "Explain the significance of the Jones vs. Mayer court case",
      "List the real estate included under the different fair housing acts",
      "Recognize the groups protected under the 1968 Fair Housing Act",
      "List the property exempt from the 1968 Fair Housing Act and the protected classes",
      "List the two protected classed added to the 1988 Fair Housing Amendment",
      "Describe the types of discriminatory acts that are prohibited under the 1968 Fair",
      "Housing Act",
      "\u00ae Describe the HUD process for handling a complaint under the 1968 Fair Housing Act",
      "Describe the objectives and major provisions of the Americans with Disabilities Act",
      "Describe the major provisions of the Florida Residential Landlord and Tenant Act",
      "Describe the major provisions of the Interstate Land Sales Disclosure Act",
    ],
  }),
  section({
    number: 8,
    title: "Property Rights: Estates And Tenancies; Condominiums, Cooperatives, Community Development Districts, Homeowner Associations, And Time-Sharing",
    /* The section heading printed on the section itself reads "PROPERTY RIGHTS: ESTATES AND TENANCIES; CONDOMINIUMS, COOPERATIVES, COMMUNITY DEVELOPMENT DISTRICTS, HOMEOWNER ASSOCIATIONS AND TIME-SHARING", which is not word-for-word
       the table of contents entry. Recorded, not reconciled: the syllabus says both. */
    headingOnSection: "PROPERTY RIGHTS: ESTATES AND TENANCIES; CONDOMINIUMS, COOPERATIVES, COMMUNITY DEVELOPMENT DISTRICTS, HOMEOWNER ASSOCIATIONS AND TIME-SHARING",
    learningObjectiveCount: 8,
    learningObjectives: [
      "Define real property based on the definition in Chapter 475, F.S.",
      "List and explain the physical components of real property",
      "Explain the four tests courts use to determine if an item is a fixture",
      "Distinguish between real and personal property",
      "Describe the bundle of rights associated with real property ownership",
      "List the principal types of estates (tenancies) and describe their characteristics",
      "Describe the features associated with the Florida homestead law",
      "Distinguish between cooperatives, condominiums and time-shares and describe the four main documents associated with condominiums",
    ],
  }),
  section({
    number: 9,
    title: "Title, Deeds And Ownership Restrictions",
    learningObjectiveCount: 9,
    learningObjectives: [
      "Differentiate between voluntary and involuntary alienation",
      "Explain the various methods of acquiring title to real property and describe the conditions necessary to acquire real property by adverse possession",
      "Distinguish between actual notice and constructive notice",
      "Distinguish between an abstract of title and a chain of title",
      "Explain the different types of title insurance",
      "Describe the parts of a deed and the requirements of a valid deed",
      "List and describe the four types of statutory deeds and the legal requirements for deeds",
      "List and describe the various types of governmental and private restrictions on ownership of real property",
      "Distinguish among the various types of leases and liens",
    ],
  }),
  section({
    number: 10,
    title: "Legal Descriptions",
    learningObjectiveCount: 10,
    learningObjectives: [
      "Describe the purpose for legal descriptions",
      "Understand the licensee\u2019s role and responsibilities as it pertains to legal descriptions",
      "Explain and distinguish among the three types of legal descriptions",
      "Describe the process of creating a legal description using the metes-and-bounds method",
      "Locate a township by township line and range",
      "Locate a particular section within a township",
      "Understand how to subdivide a section",
      "Calculate the number of acres in a parcel based on the legal description, and convert to square feet",
      "Explain the use of assessor's parcel numbers",
      "Apply the measurements associated with checks, townships and sections",
    ],
  }),
  section({
    number: 11,
    title: "Real Estate Contracts",
    learningObjectiveCount: 11,
    learningObjectives: [
      "List and describe the essentials of a contract",
      "Distinguish among formal, parol, bilateral, unilateral, implied, express, executory and xecuted contracts",
      "Describe the various ways in which an offer is terminated",
      "Describe the various methods of terminating a contract",
      "Explain the remedies for breach of a contract",
      "Describe the effect of the Statute of Frauds and the Statute of Limitations",
      "Describe the elements of an option",
      "Differentiate among the various types of listings",
      "Explain and describe the various disclosures required in a real estate contract",
      "Recognize what constitutes fraud",
      "Recognize what constitutes culpable negligence",
    ],
  }),
  section({
    number: 12,
    title: "Residential Mortgages",
    learningObjectiveCount: 9,
    learningObjectives: [
      "Distinguish between title theory and lien theory",
      "Describe the essential elements of the mortgage instrument and the note",
      "Describe the various features of a mortgage including down payment, loan-to-value ratio, equity, interest, loan servicing, escrow account, PITI, discount points and loan origination fee",
      "Explain assignment of a mortgage and the purpose of an estoppel certificate",
      "Explain the foreclosure process and distinguish between judicial and nonjudicial foreclosure",
      "Describe the mortgagor's and mortgagee\u2019s rights in a foreclosure",
      "Calculate loan-to-value ratio",
      "Explain the use of discount points and calculate approximate yield on a loan",
      "Distinguish among the various methods of purchasing mortgaged property",
    ],
  }),
  section({
    number: 13,
    title: "Types Of Mortgages And Sources Of Financing",
    learningObjectiveCount: 10,
    learningObjectives: [
      "Describe the mechanics of an adjustable rate mortgage and the components of an ARM",
      "Describe the features of an amortized mortgage and amortize a level-payment plan mortgage when given the principal amount, the interest rate and the monthly payment amount",
      "Distinguish among the various types of mortgages",
      "Describe the characteristics of FHA mortgages and common FHA loan programs",
      "Identify the guarantee feature of VA mortgage loans and the characteristics of VA loan programs",
      "Explain the process of qualifying for a loan and how to calculate qualifying ratios",
      "Distinguish among the primary sources of home financing",
      "Describe the role of the secondary mortgage market and know the features of the major agencies active in the secondary market",
      "Describe the major provisions of the federal laws regarding fair credit and lending procedures",
      "Recognize and avoid mortgage fraud",
    ],
  }),
  section({
    number: 14,
    title: "Real Estate Related Computations And Closing Of Transactions",
    learningObjectiveCount: 10,
    learningObjectives: [
      "Compute the sales commission",
      "Calculate the percent of profit or loss, given the original cost of the investment, the sale price and the dollar amount of profit or loss",
      "Define settlement and title closing",
      "List the preliminary steps to a closing",
      "Prorate the buyer's and seller's expenses",
      "Calculate the dollar amount of transfer taxes on deeds, mortgages and notes",
      "Allocate taxes and fees to the proper parties and compute individual costs",
      "Explain the rules of thumb for Closing Disclosure entries",
      "Explain the major sections of the Closing Disclosure",
      "Demonstrate ability to read and check the Closing Disclosure for errors",
    ],
  }),
  section({
    number: 15,
    title: "The Real Estate Markets And Analysis",
    learningObjectiveCount: 5,
    learningObjectives: [
      "Describe the physical characteristics of real estate",
      "Describe the economic characteristics of real estate",
      "Identify the factors that influence demand Identify the factors that influence supply",
      "Distinguish among different ways of interpreting market conditions",
      "Demonstrate understanding of the different market indicators",
    ],
  }),
  section({
    number: 16,
    title: "Real Estate Appraisal",
    learningObjectiveCount: 16,
    learningObjectives: [
      "Describe federal and state regulations pertaining to appraising",
      "Identify the appraisers fiduciary relationship",
      "Identify the economic and physical characteristics of real estate that affect market value",
      "Explain what the Uniform Standards of Professional Appraisal Practice (USPAP) is and how it affects the appraisal process of real property",
      "Distinguish among the various types of value",
      "Define market value and describe its underlying assumptions",
      "Distinguish among value, price and cost",
      "Describe the four characteristics of value",
      "Distinguish among the principles of value",
      "Differentiate among the three approaches to estimating the value of real property",
      "Estimate value of subject property using Comparable Sales Approach",
      "Estimate value of subject property using Cost Approach",
      "Estimate value of subject property using Income Approach",
      "Reconcile three approaches to establish final value estimate",
      "Calculate value using gross multiplier analysis",
      "Explain how to prepare a Comparative Market Analysis (CMA), comparing and contrasting with sales comparison approach",
    ],
  }),
  section({
    number: 17,
    title: "Real Estate Investments And Business Opportunity Brokerage",
    learningObjectiveCount: 8,
    learningObjectives: [
      "Distinguish among the different types of real estate investments",
      "Identify the advantages and disadvantages of investing in real estate",
      "Distinguish among the various types of risk",
      "Explain the importance of investment analysis",
      "Describe the similarities and differences between real estate brokerage and business brokerage",
      "Describe the types of expertise required in business brokerage",
      "Distinguish among the methods of appraising businesses",
      "Describe the steps in the sale of a business",
    ],
  }),
  section({
    number: 18,
    title: "Taxes Affecting Real Estate",
    learningObjectiveCount: 9,
    learningObjectives: [
      "Distinguish among immune, exempt and partially exempt property",
      "Describe the various personal exemptions available to qualified owners of homestead property",
      "Compute the property tax on a specific parcel, given the current tax rate, assessed value, eligible exemptions and transfer of assessment limitation difference (save our homes portability) if applicable",
      "List the steps involved in the tax appeal procedure",
      "Describe the purpose of Florida\u2019s Green Belt Law",
      "Calculate the cost of a special assessment, given the conditions and amounts involved",
      "Describe the tax advantages of home ownership",
      "Explain how to determine taxable income of investment real estate",
      "Distinguish between installment sales and like-kind exchange",
    ],
  }),
  section({
    number: 19,
    title: "Planning, And Zoning",
    /* The section heading printed on the section itself reads "PLANNING, ZONING AND ENVIRONMENTAL HAZARDS", which is not word-for-word
       the table of contents entry. Recorded, not reconciled: the syllabus says both. */
    headingOnSection: "PLANNING, ZONING AND ENVIRONMENTAL HAZARDS",
    learningObjectiveCount: 11,
    learningObjectives: [
      "Describe the composition and authority of the local planning agency",
      "Explain the purpose of land-use controls and the role of zoning ordinances",
      "Identify the provisions of Florida\u2019s comprehensive plan and the Growth Management",
      "Distinguish among the five general zoning classifications",
      "Distinguish among zoning ordinances, building codes and health ordinances",
      "Explain the purpose of a variance, special exception and a nonconforming use",
      "Calculate the number of lots available for development, given the total number of acres contained in a parcel, the percentage of land reserved for streets and other facilities and the minimum number of square feet per lot",
      "Describe the characteristics of a planned unit development",
      "Understand the basic provisions of the national flood insurance program",
      "Describe the impact Comprehensive Environmental Response Compensation and Liability Act (CERCLA)",
      "Explain the various environmental hazards associated with real estate",
    ],
  }),
]);

export const SECTION_COUNT = SECTIONS.length;
export const TOTAL_LEARNING_OBJECTIVES = SECTIONS.reduce((n, s) => n + s.learningObjectiveCount, 0);

/* A Florida course conforms only if it presents every section, in this order. Exposed as a function
   rather than a constant so that a caller cannot mutate the sequence it is being checked against. */
export function prescribedOrder() {
  return SECTIONS.map((s) => s.number);
}

export default Object.freeze({
  SYLLABUS_REFERENCE,
  SECTIONS,
  SECTION_COUNT,
  TOTAL_LEARNING_OBJECTIVES,
  prescribedOrder,
});
