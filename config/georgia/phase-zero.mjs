/**
 * Georgia Phase 0 control record.
 *
 * This is a planning and evidence model, not an application, legal opinion, or
 * representation of regulatory approval. Any field controlled by a regulator
 * stays false until written evidence is retained and independently verified.
 */

export const STATUS = Object.freeze({
  GO: "GO",
  NO_GO: "NO-GO",
  PENDING: "PENDING WRITTEN CONFIRMATION",
  NOT_STARTED: "NOT STARTED",
});

export const SOURCE_CLAIM_IDS = Object.freeze({
  brokerEligibility: "ga-broker-reciprocity-eligibility",
  brokerCertifiedHistories: "ga-broker-certified-histories",
  brokerCriminalHistory: "ga-broker-criminal-history",
  brokerFloridaResident: "ga-broker-florida-resident",
  brokerReciprocalFee: "ga-broker-reciprocal-fee",
  brokerActivationPaths: "ga-broker-activation-paths",
  psiCurrentExamFee: "ga-psi-current-exam-fee",
  currentRuleFees: "ga-current-rule-fees",
  firmFormFee: "ga-firm-form-fee",
  changeQualifyingBrokerForm: "ga-change-qb-form",
  sosForeignRegistrationFee: "ga-sos-foreign-registration-fee",
  instructorApplication: "ga-instructor-application",
  instructorPoints: "ga-instructor-points",
  instructorRenewal: "ga-instructor-renewal",
  instructorRenewalForm: "ga-instructor-renewal-form",
  schoolApplication: "ga-school-application",
  schoolOperationalRequirements: "ga-school-operational-requirements",
  schoolRenewalFee: "ga-school-renewal-fee",
  educationGuideControls: "ga-education-guide-controls",
  gnpecRealEstateExemption: "ga-gnpec-real-estate-exemption",
  gnpecStatutoryExemption: "ga-gnpec-statutory-exemption",
  gnpecExemptionProcess: "ga-gnpec-exemption-process",
  gnpecExemptionFee: "ga-gnpec-exemption-fee",
  salespersonCourseCore: "ga-salesperson-course-core",
  courseDistanceMethod: "ga-course-distance-method",
  coursePilot: "ga-course-pilot",
  courseFinalExam: "ga-course-final-exam",
  courseCodeGate: "ga-course-code-gate",
  outOfStateCourseCredit: "ga-out-of-state-course-credit",
  marketLicenseRecords: "ga-market-license-records",
  marketPopulation: "ga-market-population",
});

export const APPLICANT = Object.freeze({
  basisLicense: "California real estate broker",
  basisLicenseReportedCurrent: true,
  basisLicenseReportedObtainedByExam: true,
  completeRealEstateJurisdictionListHeld: false,
  allRequiredLicenseCertificationsHeld: false,
  legalResidenceVerifiedForGeorgiaRoute: false,
  georgiaBrokerLicenseHeld: false,
  georgiaInstructorApprovalHeld: false,
  grecSchoolApprovalHeld: false,
  grecCourseApprovalHeld: false,
  gnpecWrittenDeterminationHeld: false,
  applicationFiled: false,
  approvalAsserted: false,
});

export const BROKER_ROUTE = Object.freeze({
  selected: true,
  target: "Georgia Broker — inactive at initial issuance",
  regulator: "Georgia Real Estate Commission (GREC)",
  form: "Real Estate Reciprocal Application, revision 02/2025",
  sourceClaimIds: Object.freeze([
    SOURCE_CLAIM_IDS.brokerEligibility,
    SOURCE_CLAIM_IDS.brokerCertifiedHistories,
    SOURCE_CLAIM_IDS.brokerCriminalHistory,
    SOURCE_CLAIM_IDS.brokerFloridaResident,
    SOURCE_CLAIM_IDS.brokerReciprocalFee,
    SOURCE_CLAIM_IDS.brokerActivationPaths,
    SOURCE_CLAIM_IDS.psiCurrentExamFee,
    SOURCE_CLAIM_IDS.currentRuleFees,
    SOURCE_CLAIM_IDS.firmFormFee,
    SOURCE_CLAIM_IDS.changeQualifyingBrokerForm,
    SOURCE_CLAIM_IDS.sosForeignRegistrationFee,
  ]),
  publishedEligibility:
    "A current, good-standing out-of-state real estate license obtained by examination may support a comparable Georgia license; GREC decides comparability and issuance.",
  feeDollars: 170,
  licenseTermYears: 4,
  certifiedHistories: Object.freeze({
    required: true,
    requiredFromEveryRealEstateLicensingJurisdiction: true,
    maximumAgeMonths: 12,
    exactRule: "issued no more than twelve months before the Georgia application",
    mustShow: Object.freeze([
      "passed an examination for the comparable license type",
      "met all prelicense requirements imposed by that jurisdiction",
      "met all continuing-education requirements imposed by that jurisdiction",
      "currently licensed in good standing",
      "no disciplinary action imposed by that licensing body",
    ]),
    certifiedElectronicDataAcceptedOnlyAtGrecDiscretion: true,
  }),
  criminalHistory: Object.freeze({
    required: true,
    maximumAgeDays: 60,
    source: "law-enforcement agency in the applicant's state of residence",
    fbiEscalationTriggers: Object.freeze([
      "the residence-state report identifies a criminal record in another jurisdiction",
      "the applicant cannot obtain the required equivalent residence-state report",
    ]),
    fbiEscalationMayRequire: Object.freeze(["fingerprints", "fees", "authorization", "other GREC instructions"]),
  }),
  otherDocuments: Object.freeze([
    "notarized Lawful Presence Verification",
    "secure and verifiable identity document",
    "supporting disposition/discipline documents if any disclosure answer is yes",
  ]),
  floridaResidentFork: Object.freeze({
    trigger: "applicant is a legal resident of Florida at the time of application",
    ordinaryReciprocalFormAvailable: false,
    requiredPath: "Georgia Law and Practice supplement examination through PSI, then purchase the Georgia license",
    currentExamFeeDollars: null,
    reasonFeeUnset:
      "The 02/2025 GREC form says $121, while the PSI bulletin effective 07/01/2026 says $175. Verify the live fee before payment.",
  }),
  activeStatusOptions: Object.freeze({
    affiliateAsAssociateBroker: Object.freeze({
      separateFromInactiveIssuance: true,
      requiresActiveGeorgiaBroker: true,
      reciprocalApplicationSectionCCompletedAndSignedByGeorgiaBroker: true,
      georgiaBrokerCertifiesWrittenAffiliationAgreement: true,
    }),
    qualifyingBrokerOfExistingFirm: Object.freeze({
      separateFromInactiveIssuance: true,
      form: "Change of Qualifying Broker, revision 01/2021",
      formStatesFeeDollars: 0,
      liveFeeConfirmed: false,
      entitySpecificRoleRequired: true,
      eligibleLlcRoles: Object.freeze(["member", "manager"]),
      eligibleCorporationRole: "officer",
      eligiblePartnershipRole: "partner",
      eligibleSoleProprietorshipRole: "sole owner",
      authorityToBindFirmInContestedCaseRequired: true,
    }),
    openForeignLlcFirm: Object.freeze({
      separateFromInactiveIssuance: true,
      georgiaCertificateOfAuthorityRequired: true,
      georgiaRegisteredAgentAndOfficeRequired: true,
      qualifyingBrokerRoleRequired: true,
      secretaryOfStatePublishedFeeDollars: 235,
      openFirmFormRevision: "01/2021",
      openFirmFormFeeDollars: 275,
      currentRuleArithmeticDollars: 200,
      feeConflictOpen: true,
    }),
  }),
  inactiveFirstReason:
    "It isolates the personal-license filing from firm formation, qualifying-broker, and affiliation decisions and avoids guessing through unresolved firm-fee conflicts.",
  approvalGuaranteed: false,
});

export const INSTRUCTOR_ROUTE = Object.freeze({
  selected: true,
  regulator: "GREC",
  separateApprovalRequired: true,
  sourceClaimIds: Object.freeze([
    SOURCE_CLAIM_IDS.instructorApplication,
    SOURCE_CLAIM_IDS.instructorPoints,
    SOURCE_CLAIM_IDS.instructorRenewal,
    SOURCE_CLAIM_IDS.instructorRenewalForm,
    SOURCE_CLAIM_IDS.outOfStateCourseCredit,
    SOURCE_CLAIM_IDS.currentRuleFees,
    SOURCE_CLAIM_IDS.educationGuideControls,
  ]),
  prerequisitesWithinOneYearBeforeApplication: Object.freeze([
    "complete a Commission-approved 75-hour Salesperson Prelicense Course and pass its examination",
    "complete a Commission-approved Instructor Development Workshop",
  ]),
  prerequisitesAwardWorksheetPoints: false,
  criminalHistory: Object.freeze({
    maximumAgeDays: 60,
    nonGeorgiaResidentUsesEquivalentResidenceStateReport: true,
    fbiEscalationOnOtherJurisdictionRecordOrUnavailableReport: true,
  }),
  evidence: Object.freeze([
    "current application, live fee, and owner signature",
    "criminal background report and required dispositions/FBI escalation",
    "complete chronological resume",
    "education transcripts and certificates",
    "documented real estate licenses, transactions, and auxiliary experience",
    "documented teaching and course-development experience",
  ]),
  initialFeeConflict: Object.freeze({
    formRevision: "03/2024",
    formDollars: 175,
    currentRuleArithmeticDollars: 200,
    resolved: false,
  }),
  worksheet: Object.freeze({
    revision: "06/2024",
    favorableReviewThresholdPoints: 65,
    sections: Object.freeze({
      realEstateLicensure: Object.freeze({
        maximumPoints: 20,
        activeLicenseYears: Object.freeze({ pointsPerYear: 1, maximumPoints: 10 }),
        brokerLicensePoints: 5,
        camLicenseYears: Object.freeze({ pointsPerYear: 1, maximumPoints: 5 }),
      }),
      teachingExperience: Object.freeze({
        maximumPoints: 40,
        grecCoursesTaughtMaximum: 20,
        nonGrecTrainingCoursesTaughtMaximum: 5,
        grecApprovedCoursesWrittenMaximum: 5,
        informalInstitutionClassesMaximum: 5,
        formalInstitutionTeachingYearsMaximum: 5,
      }),
      formalGeneralEducation: Object.freeze({
        maximumPoints: 5,
        mutuallyExclusiveDegreePoints: Object.freeze({ associate: 2, bachelor: 3, graduate: 5 }),
      }),
      realEstateExperience: Object.freeze({
        maximumPoints: 35,
        brokerageTransactions: Object.freeze({ pointsPerTransaction: 0.3, maximumPoints: 30, transactionsAtMaximum: 100 }),
        auxiliaryFieldYears: Object.freeze({ pointsPerYear: 1, maximumPoints: 5 }),
      }),
    }),
    preliminaryAssumptions: Object.freeze({
      allDocumentarilyVerified: false,
      activeLicenseYears: 10,
      brokerLicensePoints: 5,
      teachingPoints: 0,
      degreePointsRange: Object.freeze([3, 5]),
      eligibleBrokerageTransactions: 100,
      auxiliaryFieldYears: 5,
    }),
    preliminaryKnownProfileRange: Object.freeze([53, 55]),
    estimatedGapRange: Object.freeze([10, 12]),
    caveat:
      "The range is a reproducible internal inventory built entirely from unverified assumptions, not a Commission score or eligibility finding. Every point needs documentary support and GREC makes the final decision.",
  }),
  outOfStateCourseSubstitutionConfirmed: false,
  outOfStateCourseRule:
    "Rule 520-2-.04(12)(d) recognizes corresponding prelicense education approved by another jurisdiction when credit hours are similar and delivery is consistent with Georgia standards; acceptance of the owner's particular course remains unconfirmed.",
  nonresidentExperiencedInstructorAlternative: Object.freeze({
    published: true,
    requirement:
      "Another jurisdiction's real-estate regulator approved the applicant as an instructor and the applicant can prove at least five years actively teaching prelicense courses as an approved instructor.",
    currentlyDocumented: false,
  }),
  renewal: Object.freeze({
    controllingRuleTeachingHours: 60,
    controllingRuleInstructorEducationHours: 36,
    minimumAnnualGrecMeetingHours: 12,
    otherPermittedSources: Object.freeze([
      "qualifying courses meeting Chapter 520-2 that the approved instructor teaches",
      "courses GREC approves for instructor continuing education",
    ]),
    staleFormInstructorEducationHours: 24,
    action: "Use the current rule; confirm the filing channel and fee rather than relying on the older form.",
  }),
  approvalGuaranteed: false,
});

export const SCHOOL_ROUTE = Object.freeze({
  regulator: "GREC",
  status: STATUS.NOT_STARTED,
  sourceClaimIds: Object.freeze([
    SOURCE_CLAIM_IDS.schoolApplication,
    SOURCE_CLAIM_IDS.schoolOperationalRequirements,
    SOURCE_CLAIM_IDS.schoolRenewalFee,
    SOURCE_CLAIM_IDS.currentRuleFees,
    SOURCE_CLAIM_IDS.educationGuideControls,
  ]),
  publishedDecisionWindowDaysAfterCompleteApplication: 60,
  abandonmentDaysAfterInformationRequest: 120,
  initialFeeConflict: Object.freeze({
    applicationFormRevision: "10/2015",
    applicationFormDollars: 175,
    currentRuleArithmeticDollars: 200,
    resolved: false,
  }),
  renewalFeeConflict: Object.freeze({
    renewalFormRevision: "02/2021",
    formPaperDollars: 125,
    formOnlineDollars: 100,
    rulePaperDollars: 125,
    ruleOnlineClauseExpresslyNamesSchools: false,
    resolved: false,
  }),
  initialApprovalEnds: "December 31 of the fourth calendar year following approval",
  minimumPackage: Object.freeze([
    "school identity, ownership, director, and coordinator",
    "school-director criminal-history report no more than 60 days old, with required dispositions",
    "school-director notarized Lawful Presence Verification and secure/verifiable identity document",
    "five-year records-management plan",
    "electronic exam-vendor registration and completion-reporting capability",
    "attendance/makeup, entry, ADA, and nondiscrimination policies",
    "media/equipment availability statement, with precise online-school applicability documented",
    "appropriate learning-environment statement or explicit documented treatment for no in-class delivery",
    "course schedule, timed outline, bibliography, and planned exercises",
    "measurable learning objectives for every instructional hour",
    "student assessment standards and Notice to Students",
    "proposed approved instructors",
  ]),
  continuingObligations: Object.freeze([
    "offer at least one qualifying continuing-education course every calendar year in addition to prelicense and postlicense courses",
    "report required school, director/coordinator, contact, and instructor-termination changes immediately",
    "maintain required records for at least five years",
  ]),
  approvalGuaranteed: false,
});

export const GNPEC_ROUTE = Object.freeze({
  regulator: "Georgia Nonpublic Postsecondary Education Commission (GNPEC)",
  sourceClaimIds: Object.freeze([
    SOURCE_CLAIM_IDS.gnpecRealEstateExemption,
    SOURCE_CLAIM_IDS.gnpecStatutoryExemption,
    SOURCE_CLAIM_IDS.gnpecExemptionProcess,
    SOURCE_CLAIM_IDS.gnpecExemptionFee,
  ]),
  selectedPosition:
    "Request a written Other State Agency Oversight exemption determination under O.C.G.A. § 20-3-250.3(a)(4).",
  exemptionAutomatic: false,
  institutionalProposalMayBeRequired: true,
  publishedCategoryFeeDollars: 200,
  feeAppliesConfirmed: false,
  fullAuthorizationRequiredConfirmed: false,
  enrollmentAndAdvertisingGate: true,
});

export const COURSE_ROUTE = Object.freeze({
  target: "75-hour Georgia Salesperson Prelicense Course",
  sourceClaimIds: Object.freeze([
    SOURCE_CLAIM_IDS.salespersonCourseCore,
    SOURCE_CLAIM_IDS.courseDistanceMethod,
    SOURCE_CLAIM_IDS.coursePilot,
    SOURCE_CLAIM_IDS.courseFinalExam,
    SOURCE_CLAIM_IDS.courseCodeGate,
    SOURCE_CLAIM_IDS.educationGuideControls,
  ]),
  hours: 75,
  distanceHourMinutes: 60,
  curriculumAuthoringAuthorized: false,
  methodologyApprovalRequiredBeforeDevelopment: true,
  courseCodeRequestFormRevision: "07/2026",
  assessmentTimeMaximumPercent: 10,
  recordsRetentionYears: 5,
  fixedSalespersonSubjects: Object.freeze([
    "real estate contracts and required form practice",
    "real estate instruments and conveyances",
    "RESPA closing procedures and salesperson responsibilities",
    "law of agency and agency disclosure",
    "pricing real property",
    "real estate financing and cost/payment estimation",
    "Georgia Residential Mortgage Fraud law, detection, and reporting",
    "community association management and property management activities",
    "environmental laws",
    "taxation",
    "city and urban development",
    "fair housing",
    "antitrust laws",
    "safety precautions",
    "Georgia real estate license law",
  ]),
  contentControls: Object.freeze({
    ethicsIntegratedThroughout: true,
    outOfClassReadingForEveryUnit: true,
    extensiveGradedWrittenWork: true,
    personalCompletionCertificationRequired: true,
    proficiencyDemonstrations: Object.freeze(["contracts", "pricing forms", "financing and cost-estimation forms"]),
  }),
  finalExam: Object.freeze({
    safeHarbor: Object.freeze({
      multipleChoiceRequired: true,
      minimumChoicesPerItem: 4,
      minimumItems: 100,
      everyConditionRequiredToAvoidSubmission: true,
      failureOfAnyConditionRequiresPriorCommissionApproval: true,
    }),
    minimumItemsInEachRequiredSubject: 5,
    fixedSubjectBuckets: Object.freeze([
      "brokerage engagements",
      "legal descriptions and legal aspects of contracts",
      "methods of payment and earnest money",
      "special stipulations and writing sales contracts",
      "leases and fair housing",
      "licensees acting as principals",
      "antitrust laws",
      "basic finance",
      "loan types",
      "pricing property",
      "seller costs",
      "qualifying purchasers and purchaser costs",
      "contract closing",
    ]),
    conditionalAdditionalMattersBucket: true,
    secureForms: 2,
    proctored: true,
    numericPassingScoreConfirmed: false,
    remoteProctoringMethodConfirmed: false,
    asynchronousFinalSchedulingConfirmed: false,
  }),
  pilot: Object.freeze({
    required: true,
    participants: 9,
    minimumUnlicensed: 3,
    minimumLicensedSalespersonsOrCommunityAssociationManagers: 3,
    minimumNonEducators: 6,
    varyingComputerAndRealEstateSkillLevelsRequired: true,
  }),
  distanceControls: Object.freeze([
    "personally completed modules and authorized certification statements",
    "interactive instruction rather than primarily screen text, audio, video, or exam-style questions",
    "measurable objectives, diagnostics, mastery, and individualized remediation",
    "locked progression until mastery",
    "credible time validation and module-completion verification",
    "approved-instructor availability and identity oversight",
    "five-year software-version, module, date, grade, examination, and answer-key records",
  ]),
  approvalGuaranteed: false,
});

export const MARKET = Object.freeze({
  sourceClaimIds: Object.freeze([SOURCE_CLAIM_IDS.marketPopulation, SOURCE_CLAIM_IDS.marketLicenseRecords]),
  decision: "Georgia Phase 0 GO",
  population2025Estimate: 11_302_748,
  totalLicenseRecordsFY2025: 118_387,
  newLicensesFY2025: 3_452,
  newLicenseCaveat:
    "The total includes resident and nonresident records across multiple license categories; it is not a count of unique 75-hour students or course buyers.",
  demandDecision:
    "Population and the large license-record base justify Phase 0, but revenue forecasting requires price, conversion, exam-attempt, and competitor evidence not yet held.",
});

export const OPEN_QUESTIONS = Object.freeze([
  "Will GREC issue the applicant a comparable Georgia broker license on the complete multi-jurisdiction certification record?",
  "What certified-electronic delivery method or substitute evidence will GREC accept when a jurisdiction's certification omits an element required by Rule 520-1-.04(3)(g)?",
  "What is the live Florida-resident supplement-exam fee: the form's $121 or PSI's newer $175?",
  "What current form and fee control a foreign-LLC Open Firm filing: the form's $275 or current-rule arithmetic of $200?",
  "Will GREC accept the owner's particular out-of-state course under Rule 520-2-.04(12)(d), or the nonresident five-year approved-instructor alternative?",
  "What current form and fee control each initial instructor and school application: the forms' $175 or current-rule arithmetic of $200?",
  "Does the school renewal online discount apply notwithstanding the current rule's omission of schools from the online clause?",
  "Must this real-estate-only out-of-state school submit a GNPEC institutional proposal and pay the $200 category fee?",
  "What asynchronous methodology package must GREC approve before course development?",
  "What remote-proctor arrangement will GREC accept for the final examination?",
  "What numeric final-exam passing score currently controls?",
  "How does the no-instruction-on-final-exam-day rule apply to a self-paced course?",
  "What identity and electronic-signature controls will GREC authorize?",
  "What vendor onboarding and electronic reporting fields are required?",
  "Does GREC prescribe completion-certificate content beyond electronic reporting and retained evidence?",
]);

export const RELEASE_GATES = Object.freeze({
  research: STATUS.GO,
  brokerApplicationReady: STATUS.NO_GO,
  brokerActivationOrFirm: STATUS.NO_GO,
  instructorApplicationReady: STATUS.NO_GO,
  schoolApplicationReady: STATUS.NO_GO,
  curriculumAuthoring: STATUS.NO_GO,
  advertisingToGeorgiaResidents: STATUS.NO_GO,
  enrollment: STATUS.NO_GO,
  payment: STATUS.NO_GO,
  completionCredit: STATUS.NO_GO,
});

export function georgiaReadiness() {
  return Object.freeze({
    phaseZero: RELEASE_GATES.research,
    selectedPersonalRoute: BROKER_ROUTE.target,
    marketDecision: MARKET.decision,
    openQuestionCount: OPEN_QUESTIONS.length,
    applicationsFiled: APPLICANT.applicationFiled,
    approvalsAsserted: APPLICANT.approvalAsserted,
    enrollmentEnabled: false,
  });
}

export default Object.freeze({
  APPLICANT,
  BROKER_ROUTE,
  INSTRUCTOR_ROUTE,
  SCHOOL_ROUTE,
  GNPEC_ROUTE,
  COURSE_ROUTE,
  MARKET,
  OPEN_QUESTIONS,
  RELEASE_GATES,
  SOURCE_CLAIM_IDS,
});
