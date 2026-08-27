/**
 * Texas statutes for Principles of Real Estate I — official static snapshots.
 *
 * THE CORRECTION THIS FILE EXISTS TO MAKE. The TX-0 report concluded that Texas statutes could not
 * be retrieved and that Principles I was blocked until a person exported them by hand. That was
 * wrong, and wrong in a way worth naming: it tested ONE path — statutes.capitol.texas.gov/Docs/…,
 * which now returns a single-page-application shell for every document — and generalised from one
 * failing host to "Texas statutes are unavailable".
 *
 * The Texas Legislative Council publishes the same codes as PLAIN STATIC HTML at
 * tcss.legis.texas.gov/resources/{CODE}/htm/{CODE}.{CHAPTER}.htm. Twenty-five chapters and four federal sources were retrieved
 * from it on 2026-08-27 with no browser, no login and no failures. The lesson is the one this
 * project keeps relearning: a single failing endpoint is evidence about that endpoint.
 *
 * HELD IS NOT READ, AND THE DIFFERENCE IS ENFORCED. Downloading a chapter does not make its sections known. Each record below carries sectionsRead — sections actually opened, with what was
 * taken from each — and everything else in the chapter is unread by construction. The curriculum
 * guard refuses a citation to a section not in sectionsRead, so holding a file cannot be mistaken
 * for having read it.
 *
 * WHAT A HELD CHAPTER UNBLOCKS. It unblocks WRITING: an author can open the governing text instead
 * of recalling it. That is what TX_PRINCIPLES_I_SOURCE_LOCK measures — whether the law a unit needs
 * is on disk — and it is deliberately a different question from whether a section has been read.
 */

const chapter = (record) =>
  Object.freeze({
    ...record,
    id: `${record.code.toLowerCase()}-${record.chapter}`,
    citation: `Tex. ${record.codeName} ch. ${record.chapter}`,
    publisher: "Texas Legislative Council",
    sourceLayer: "tcss.legis.texas.gov static resources",
    reliedOnByUnits: Object.freeze(record.reliedOnByUnits),
    sectionsRead: Object.freeze(record.sectionsRead),
  });

const federal = (record) =>
  Object.freeze({
    ...record,
    id: record.citation.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    jurisdiction: "federal",
    reliedOnByUnits: Object.freeze(record.reliedOnByUnits),
    sectionsRead: Object.freeze(record.sectionsRead),
  });

export const STATUTE_CHAPTERS = Object.freeze([
  chapter({
    code: "OC", codeName: "Occupations Code", chapter: "1101", title: "Real Estate Brokers and Sales Agents",
    url: "https://tcss.legis.texas.gov/resources/OC/htm/OC.1101.htm",
    localCopy: "texas/trec-sources/statutes/OC.1101.htm",
    sha256: "8c40aa399cf717901540150ae6acaf3d847305f7fefcf7dd7ec4c3068a418858", bytes: 308708, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T01U1", "T01U2", "T01U3", "T01U4", "T06U5"],
    sectionsRead: [
      Object.freeze({ section: "1101.155", note: "Rules relating to contract forms - the Commission may require use of forms prepared by the Broker-Lawyer Committee, and may not prohibit certain other forms." }),
      Object.freeze({ section: "1101.301", note: "Approval of programs and courses of study - the Commission may by rule establish standards for approving qualifying educational programs and develop instructor requirements." })
    ],
  }),
  chapter({
    code: "PR", codeName: "Property Code", chapter: "5", title: "Conveyances",
    url: "https://tcss.legis.texas.gov/resources/PR/htm/PR.5.htm",
    localCopy: "texas/trec-sources/statutes/PR.5.htm",
    sha256: "8d2de95ab891d16cb19dd73f4ac8f46c2cb349f49b7ed6f59d9e5a98c80ca9d7", bytes: 273766, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T02U1", "T03U2", "T05U1", "T06U4", "T07U1", "T07U5", "T07U8"],
    sectionsRead: [
      Object.freeze({ section: "5.008", note: "Seller's disclosure of property condition - a seller of residential real property of not more than one dwelling unit must give the prescribed written notice." })
    ],
  }),
  chapter({
    code: "PR", codeName: "Property Code", chapter: "11", title: "Provisions Generally Applicable to Real Property",
    url: "https://tcss.legis.texas.gov/resources/PR/htm/PR.11.htm",
    localCopy: "texas/trec-sources/statutes/PR.11.htm",
    sha256: "274fa3cfda2b15d503c12bf5ea439fbaab1a262ab7acc3623db757855f1fe5f3", bytes: 22639, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T02U1", "T07U2"],
    sectionsRead: [

    ],
  }),
  chapter({
    code: "PR", codeName: "Property Code", chapter: "12", title: "Recording of Instruments",
    url: "https://tcss.legis.texas.gov/resources/PR/htm/PR.12.htm",
    localCopy: "texas/trec-sources/statutes/PR.12.htm",
    sha256: "6cea8bbf2f7e8cfc58b707166c4d3dcf284c0cb090c67266ebad4aeb44e7470d", bytes: 85784, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T04U1", "T07U3"],
    sectionsRead: [
      Object.freeze({ section: "12.001", note: "Instruments concerning property - an instrument may be recorded if acknowledged, sworn to with a proper jurat, or proved according to law." })
    ],
  }),
  chapter({
    code: "PR", codeName: "Property Code", chapter: "13", title: "Effects of Recording",
    url: "https://tcss.legis.texas.gov/resources/PR/htm/PR.13.htm",
    localCopy: "texas/trec-sources/statutes/PR.13.htm",
    sha256: "2cfe34903ef3dac768acfd4d4e64f2a095335b4db1648f51ddd8dab5d6c1ac65", bytes: 8123, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T07U3", "T07U4"],
    sectionsRead: [

    ],
  }),
  chapter({
    code: "PR", codeName: "Property Code", chapter: "21", title: "Eminent Domain",
    url: "https://tcss.legis.texas.gov/resources/PR/htm/PR.21.htm",
    localCopy: "texas/trec-sources/statutes/PR.21.htm",
    sha256: "a39523c2f48d89c7f4ac901dcc6b1d377c95fdefdc0efb331de599359d3654df", bytes: 106104, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T07U9"],
    sectionsRead: [

    ],
  }),
  chapter({
    code: "PR", codeName: "Property Code", chapter: "41", title: "Interests in Land Exempt from Seizure",
    url: "https://tcss.legis.texas.gov/resources/PR/htm/PR.41.htm",
    localCopy: "texas/trec-sources/statutes/PR.41.htm",
    sha256: "46b5db89c5f031683f17b92fe17167d64c0cf032f6843325d5232045cf8fa0f2", bytes: 38782, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T03U7"],
    sectionsRead: [
      Object.freeze({ section: "41.001", note: "Interests in land exempt from seizure - a homestead is exempt from creditors' claims except for encumbrances properly fixed, which the section enumerates." }),
      Object.freeze({ section: "41.002", note: "Definition of homestead - 10 acres urban; the rural limits and the family/single-adult distinction." })
    ],
  }),
  chapter({
    code: "PR", codeName: "Property Code", chapter: "51", title: "Provisions Generally Applicable to Liens",
    url: "https://tcss.legis.texas.gov/resources/PR/htm/PR.51.htm",
    localCopy: "texas/trec-sources/statutes/PR.51.htm",
    sha256: "73590107b2418423a4b3af10c46cdd0638b0194581a3df65756566c6e196f921", bytes: 60209, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T03U3", "T03U5", "T08U1", "T08U2"],
    sectionsRead: [
      Object.freeze({ section: "51.002", note: "Sale of real property under contract lien - public auction, first Tuesday, between 10 a.m. and 4 p.m., at the county courthouse." })
    ],
  }),
  chapter({
    code: "PR", codeName: "Property Code", chapter: "53", title: "Mechanic's, Contractor's, or Materialman's Lien",
    url: "https://tcss.legis.texas.gov/resources/PR/htm/PR.53.htm",
    localCopy: "texas/trec-sources/statutes/PR.53.htm",
    sha256: "fc56f1f4cb731ce262d4283acfe48fa79b1284613487ae5f38e1066627ef4630", bytes: 175115, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T03U5"],
    sectionsRead: [

    ],
  }),
  chapter({
    code: "PR", codeName: "Property Code", chapter: "111", title: "General Provisions (Texas Trust Code)",
    url: "https://tcss.legis.texas.gov/resources/PR/htm/PR.111.htm",
    localCopy: "texas/trec-sources/statutes/PR.111.htm",
    sha256: "5eea3ffa844d0116f3225dfa14c85539cc723e69cb2ccdf856ce023ec2f32018", bytes: 21011, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T05U4"],
    sectionsRead: [

    ],
  }),
  chapter({
    code: "ES", codeName: "Estates Code", chapter: "101", title: "Estate Assets in General",
    url: "https://tcss.legis.texas.gov/resources/ES/htm/ES.101.htm",
    localCopy: "texas/trec-sources/statutes/ES.101.htm",
    sha256: "1d1417459c5fb129bc936e9f89e27db8cefd514bf3536fb1cf4b0231fafbc056", bytes: 9174, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T05U2", "T05U3", "T07U6"],
    sectionsRead: [

    ],
  }),
  chapter({
    code: "ES", codeName: "Estates Code", chapter: "201", title: "Descent and Distribution",
    url: "https://tcss.legis.texas.gov/resources/ES/htm/ES.201.htm",
    localCopy: "texas/trec-sources/statutes/ES.201.htm",
    sha256: "52338bd274ead06b1602f1c2c6838f2a297a851003f5c39e850f849c0df8a0ac", bytes: 39074, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T07U7"],
    sectionsRead: [

    ],
  }),
  chapter({
    code: "ES", codeName: "Estates Code", chapter: "251", title: "Will Execution and Revocation Generally",
    url: "https://tcss.legis.texas.gov/resources/ES/htm/ES.251.htm",
    localCopy: "texas/trec-sources/statutes/ES.251.htm",
    sha256: "4fd0a0a39400b485e8944ecc0847fab749958a408803e611cf6ad1ad3d77ecfe", bytes: 23639, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T07U7"],
    sectionsRead: [

    ],
  }),
  chapter({
    code: "BC", codeName: "Business and Commerce Code", chapter: "9", title: "Secured Transactions",
    url: "https://tcss.legis.texas.gov/resources/BC/htm/BC.9.htm",
    localCopy: "texas/trec-sources/statutes/BC.9.htm",
    sha256: "81e04c47f8d4eaf3ae08d1c73df8cd6532ef4b7d8ba320e8d87538eb67886fef", bytes: 454177, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T02U2"],
    sectionsRead: [

    ],
  }),
  chapter({
    code: "BC", codeName: "Business and Commerce Code", chapter: "26", title: "Statute of Frauds",
    url: "https://tcss.legis.texas.gov/resources/BC/htm/BC.26.htm",
    localCopy: "texas/trec-sources/statutes/BC.26.htm",
    sha256: "e2c23d1a446796b7083157d2940094e660e14ca660670665ff5a801a8bd1a708", bytes: 9473, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T06U1", "T06U2", "T06U4"],
    sectionsRead: [
      Object.freeze({ section: "26.01", note: "Promise or agreement must be in writing - unenforceable unless in writing and signed by the person to be charged, and the list of agreements it applies to." })
    ],
  }),
  chapter({
    code: "CP", codeName: "Civil Practice and Remedies Code", chapter: "16", title: "Limitations",
    url: "https://tcss.legis.texas.gov/resources/CP/htm/CP.16.htm",
    localCopy: "texas/trec-sources/statutes/CP.16.htm",
    sha256: "cfefbe20090b0e909f368e0d8a95a86fef9c80733921408d170070cc56dd8e78", bytes: 89021, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T06U3", "T07U9"],
    sectionsRead: [

    ],
  }),
  chapter({
    code: "TX", codeName: "Tax Code", chapter: "32", title: "Tax Liens and Personal Liability",
    url: "https://tcss.legis.texas.gov/resources/TX/htm/TX.32.htm",
    localCopy: "texas/trec-sources/statutes/TX.32.htm",
    sha256: "af09b4f7621a7d9976768769be7dd352f199ba407f325ae1c59c0d6e05330c73", bytes: 54703, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T03U4", "T07U9"],
    sectionsRead: [

    ],
  }),
  chapter({
    code: "IN", codeName: "Insurance Code", chapter: "2501", title: "Title Insurance Regulation",
    url: "https://tcss.legis.texas.gov/resources/IN/htm/IN.2501.htm",
    localCopy: "texas/trec-sources/statutes/IN.2501.htm",
    sha256: "246d1c57cc82e1dadd60c5c5f62361348cf4bc2b4a1f484abad696f01589f4a5", bytes: 18106, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T07U4", "T09U1", "T09U2"],
    sectionsRead: [

    ],
  }),
  chapter({
    code: "WA", codeName: "Water Code", chapter: "11", title: "Water Rights",
    url: "https://tcss.legis.texas.gov/resources/WA/htm/WA.11.htm",
    localCopy: "texas/trec-sources/statutes/WA.11.htm",
    sha256: "24e3aca8e73bf7cad479fcb3dbc2a088e29fab2db235e9f00c66f1c059156a45", bytes: 424135, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T03U6"],
    sectionsRead: [

    ],
  }),
  chapter({
    code: "BO", codeName: "Business Organizations Code", chapter: "200", title: "Real Estate Investment Trusts",
    url: "https://tcss.legis.texas.gov/resources/BO/htm/BO.200.htm",
    localCopy: "texas/trec-sources/statutes/BO.200.htm",
    sha256: "a931664b99ad75566b03f4679e0b11467db37e33b0d7d08c481f44166c6d3579", bytes: 151017, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T05U9"],
    sectionsRead: [

    ],
  }),
  chapter({
    code: "GV", codeName: "Government Code", chapter: "4001", title: "Securities - General Provisions",
    url: "https://tcss.legis.texas.gov/resources/GV/htm/GV.4001.htm",
    localCopy: "texas/trec-sources/statutes/GV.4001.htm",
    sha256: "f99f69374aaf2e5267e69ba442a9f5b6a468a8a21d5fe19641f798613bb59c28", bytes: 36228, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T05U8"],
    sectionsRead: [

    ],
  }),
  chapter({
    code: "GV", codeName: "Government Code", chapter: "4005", title: "Securities - Exemptions from Registration",
    url: "https://tcss.legis.texas.gov/resources/GV/htm/GV.4005.htm",
    localCopy: "texas/trec-sources/statutes/GV.4005.htm",
    sha256: "6af4b08eaf2d105b7b07de9e0d44beef6ad1b34b7e9ffe5c3263db25214fd17a", bytes: 61362, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T05U8"],
    sectionsRead: [

    ],
  }),
  chapter({
    code: "LG", codeName: "Local Government Code", chapter: "232", title: "County Regulation of Subdivisions",
    url: "https://tcss.legis.texas.gov/resources/LG/htm/LG.232.htm",
    localCopy: "texas/trec-sources/statutes/LG.232.htm",
    sha256: "0708ec2aae2283f5ec800492547f5f3c875c10275165263183dd515a4bda404e", bytes: 380316, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T04U1", "T04U2"],
    sectionsRead: [

    ],
  }),
  chapter({
    code: "NR", codeName: "Natural Resources Code", chapter: "21", title: "Surveys",
    url: "https://tcss.legis.texas.gov/resources/NR/htm/NR.21.htm",
    localCopy: "texas/trec-sources/statutes/NR.21.htm",
    sha256: "31c106ae7cd383c0e39c3d04b665dac6153e36d373002208b7b8c815f7ed7a8b", bytes: 29873, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T04U2"],
    sectionsRead: [

    ],
  }),
  chapter({
    code: "FI", codeName: "Finance Code", chapter: "343", title: "Home Loans",
    url: "https://tcss.legis.texas.gov/resources/FI/htm/FI.343.htm",
    localCopy: "texas/trec-sources/statutes/FI.343.htm",
    sha256: "94dee3bf7cdc8a41037310f5c138cabdfc21377240ebd251f29ef9be8f755e38", bytes: 32565, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T08U2"],
    sectionsRead: [

    ],
  }),
]);

export const FEDERAL_SOURCES = Object.freeze([
  federal({
    citation: "12 U.S.C. § 2601 et seq.", title: "Real Estate Settlement Procedures Act", publisher: "uscode.house.gov",
    url: "https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title12-section2601&num=0&edition=prelim",
    localCopy: "texas/trec-sources/federal/us12-2601.html",
    sha256: "ea0a6edcbbbcfde427d58404733e8161fbb4b25ae2f124ffe999a902365939e1", bytes: 154001, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T09U3"],
    sectionsRead: [
      Object.freeze({ section: "2601", note: "Congressional findings and purpose - reforms in the real estate settlement process so consumers get greater and more timely information on the nature and costs of settlement." })
    ],
  }),
  federal({
    citation: "12 C.F.R. part 1024 (Regulation X)", title: "Real Estate Settlement Procedures Act (Regulation X)", publisher: "eCFR API, title 12, as of 2026-08-01",
    url: "https://www.ecfr.gov/api/versioner/v1/full/2026-08-01/title-12.xml?part=1024&subpart=B",
    localCopy: "texas/trec-sources/federal/ecfr-12cfr1024.xml",
    sha256: "2df23a9029b5bfa2d12dbc38073b1fc1541f2c19a01c4b6f0a4cef8411f398b8", bytes: 90113, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T09U3", "T09U4"],
    sectionsRead: [

    ],
  }),
  federal({
    citation: "26 U.S.C. § 1445", title: "Withholding of tax on dispositions of United States real property interests (FIRPTA)", publisher: "uscode.house.gov",
    url: "https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title26-section1445&num=0&edition=prelim",
    localCopy: "texas/trec-sources/federal/us26-1445.html",
    sha256: "05f1b5f10bab862596c08fd167abaf30b9504b43ee7dce6993229babd0563d25", bytes: 191303, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T08U3"],
    sectionsRead: [
      Object.freeze({ section: "1445", note: "General rule - on a disposition of a United States real property interest by a foreign person, the transferee must deduct and withhold." })
    ],
  }),
  federal({
    citation: "26 U.S.C. § 860A et seq.", title: "Real Estate Mortgage Investment Conduits", publisher: "uscode.house.gov",
    url: "https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title26-section860A&num=0&edition=prelim",
    localCopy: "texas/trec-sources/federal/us26-860A.html",
    sha256: "756f0bf650877616c78cc65d81977be4fbf2406df8db9c71f5cd86fae0773499", bytes: 149816, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T05U10"],
    sectionsRead: [

    ],
  }),
]);

/**
 * Units that need no statutory source, and why. A unit is not "uncovered" because no statute
 * governs it — history and investment arithmetic are taught from neither — but saying so has to be
 * deliberate, so each one is named with its reason rather than silently omitted.
 */
export const NO_STATUTE_REQUIRED = Object.freeze([
  Object.freeze({ unit: "T03U1", reason: "Historical Background - the development of property concepts. Conceptual; no controlling statute, and none will be cited." }),
  Object.freeze({ unit: "T05U5", reason: "Investing in Real Estate - investment concepts rather than a rule of law." }),
  Object.freeze({ unit: "T05U6", reason: "The Investment - the mechanics and arithmetic of an investment position." }),
  Object.freeze({ unit: "T05U7", reason: "The Benefits - the economic case, taught as economics. Any TAX benefit stated must cite the Internal Revenue Code, which is not held for this unit." })
]);

export const ALL_SOURCES = Object.freeze([...STATUTE_CHAPTERS, ...FEDERAL_SOURCES]);

/** The path that returns an application shell, kept so nobody retries it and concludes the same thing twice. */
export const OBSOLETE_PATH = Object.freeze({
  pattern: "https://statutes.capitol.texas.gov/Docs/{CODE}/htm/{CODE}.{CHAPTER}.htm",
  observed: "returns an identical 250,874-byte single-page-application shell for every path, and 406 for a non-HTML Accept header",
  conclusion: "NOT evidence that Texas statutes are unavailable. Use the tcss.legis.texas.gov static layer.",
});

export const SECTIONS_READ = Object.freeze(
  ALL_SOURCES.flatMap((entry) => entry.sectionsRead.map((s) => Object.freeze({ ...s, sourceId: entry.id, citation: entry.citation }))),
);

/** Every PRINS1-1 unit either has a source held for it or is named as needing none. */
export function unitCoverage(allUnitCodes) {
  const held = new Set(ALL_SOURCES.flatMap((entry) => entry.reliedOnByUnits));
  const excused = new Set(NO_STATUTE_REQUIRED.map((entry) => entry.unit));
  return Object.freeze({
    held: Object.freeze(allUnitCodes.filter((code) => held.has(code))),
    excused: Object.freeze(allUnitCodes.filter((code) => !held.has(code) && excused.has(code))),
    uncovered: Object.freeze(allUnitCodes.filter((code) => !held.has(code) && !excused.has(code))),
  });
}

export default Object.freeze({ STATUTE_CHAPTERS, FEDERAL_SOURCES, ALL_SOURCES, NO_STATUTE_REQUIRED, SECTIONS_READ, OBSOLETE_PATH, unitCoverage });
