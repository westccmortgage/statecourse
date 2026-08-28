/**
 * Texas statutes and federal sources for Principles of Real Estate I — the read record.
 *
 * THE RULE THIS FILE ENFORCES BY ITS SHAPE: HELD IS NOT READ. Every source below is a document on
 * disk with a hash. Inside each, `sectionsRead` lists the sections that were actually OPENED AND
 * READ, each with a note stating what was taken from it — and nothing else in the document may be
 * cited, because the claim-traceability gate resolves every curriculum citation against this list
 * and refuses any section that is not on it. A chapter can sit here fully hashed and contribute
 * nothing; a unit is only as sourced as the sections read for it.
 *
 * HOW THE READS WERE DONE. TX-1A followed a read-before-write protocol: for each PRINS1-1 unit, the
 * legal claims the unit needs were identified first, the exact sections were then extracted from the
 * held snapshots and read, the read was recorded here, and only then was the unit written. The notes
 * are deliberately substantive — each states the proposition relied on, so a reviewer can check the
 * curriculum against this file without re-deriving what each section was for.
 *
 * THE CORRECTION THIS FILE CARRIES FORWARD (TX-0.1). The TX-0 report concluded Texas statutes were
 * unreachable after testing one endpoint — statutes.capitol.texas.gov/Docs/…, which serves a
 * single-page-application shell. The Texas Legislative Council publishes the same codes as plain
 * static HTML at tcss.legis.texas.gov/resources/{CODE}/htm/{CODE}.{CHAPTER}.htm, and every Texas
 * chapter below came from that layer with no browser and no login. A single failing endpoint is
 * evidence about that endpoint.
 */

const chapter = (record) =>
  Object.freeze({
    ...record,
    id: `${record.code.toLowerCase()}-${record.chapter}`,
    citation: `Tex. ${record.codeName} ch. ${record.chapter}`,
    publisher: "Texas Legislative Council",
    sourceLayer: "tcss.legis.texas.gov static resources",
    jurisdiction: "texas",
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
    reliedOnByUnits: ["T01U1", "T01U2", "T01U3", "T01U4", "T05U2", "T06U5"],
    sectionsRead: [
      Object.freeze({ section: "1101.001", note: "Short title - this chapter may be cited as The Real Estate License Act." }),
      Object.freeze({ section: "1101.002", note: "Definitions. (1) 'Broker': twelve enumerated acts performed for another for a commission or valuable consideration or the expectation of it - selling, exchanging, purchasing, leasing; offering; negotiating; listing; auctioning; dealing in options; aiding in locating or obtaining real estate; procuring prospects or property; controlling the acceptance or deposit of rent from a resident of a single-family residential unit; price opinions not called appraisals; short-sale advice - and includes advance-fee listing businesses. (5) 'Real estate' means any interest in real property, including a leasehold, located in or outside this state, excluding an interest given as security. (7) 'Sales agent' means a person sponsored by a licensed broker to perform broker acts." }),
      Object.freeze({ section: "1101.003", note: "Qualifying real estate courses: the eleven statutory course subjects including principles of real estate; the commission may prescribe content by rule. (d) A DAILY COURSE SEGMENT FOR A QUALIFYING COURSE MAY NOT EXCEED 12 HOURS. (e) An alternative delivery or correspondence course completion may not be reported until elapsed time from registration exceeds TWICE the credit hours claimed." }),
      Object.freeze({ section: "1101.005", note: "Applicability - the chapter does not apply to: Texas attorneys; attorneys-in-fact for not more than three transactions annually; public officials on official duty; licensed auctioneers calling the sale; transactions under court order, will or trust; a builder-owner's sales employees; on-site apartment managers; owners and their employees leasing the owner's property; mineral, cemetery-lot, hotel and standing-timber transactions; foreclosure sales under a power of sale; general partners and employees in limited-partnership transactions; comparable LLC transactions." }),
      Object.freeze({ section: "1101.051", note: "Commission membership - nine members appointed by the governor with senate consent: six licensed brokers of five years' standing and three public members." }),
      Object.freeze({ section: "1101.151", note: "General powers and duties - the commission administers chapters 1101 and 1102, may adopt and enforce rules necessary to administer them, and may establish standards of conduct and ethics." }),
      Object.freeze({ section: "1101.155", note: "Rules relating to contract forms - the commission may require licence holders to use forms prepared by the Texas Real Estate Broker-Lawyer Committee, and may not prohibit certain party-drafted, attorney-prepared or government forms." }),
      Object.freeze({ section: "1101.158", note: "Advisory committees - the commission may appoint advisory committees, whose members serve at the commission's will without compensation; meetings are subject to the open-meetings law." }),
      Object.freeze({ section: "1101.301", note: "Approval of programs and courses of study - the commission may by rule establish standards for approving qualifying education programs and develop instructor requirements." }),
      Object.freeze({ section: "1101.351", note: "Licence required - a person may not act as or represent being a broker or sales agent without a licence; a business entity may not act as a broker unlicensed; a sales agent may act only when sponsored by and acting for a licensed broker." })
    ],
  }),
  chapter({
    code: "PR", codeName: "Property Code", chapter: "5", title: "Conveyances",
    url: "https://tcss.legis.texas.gov/resources/PR/htm/PR.5.htm",
    localCopy: "texas/trec-sources/statutes/PR.5.htm",
    sha256: "8d2de95ab891d16cb19dd73f4ac8f46c2cb349f49b7ed6f59d9e5a98c80ca9d7", bytes: 273766, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T02U1", "T03U2", "T05U1", "T06U4", "T07U1", "T07U5", "T07U8"],
    sectionsRead: [
      Object.freeze({ section: "5.001", note: "Fee simple - a conveyed or devised estate is fee simple unless limited by express words or a lesser estate passes by construction or operation of law; common-law words of inheritance unnecessary." }),
      Object.freeze({ section: "5.002", note: "An instrument that fails as a conveyance is enforceable to the extent permitted by law as a contract to convey." }),
      Object.freeze({ section: "5.008", note: "Seller's disclosure of property condition - the seller of residential real property of not more than one dwelling unit must give the purchaser the prescribed written notice or one substantially similar." }),
      Object.freeze({ section: "5.021", note: "Instrument of conveyance - a conveyance of an estate of inheritance, a freehold, or an estate for more than one year must be in writing, subscribed and delivered by the conveyor or an agent authorized in writing." }),
      Object.freeze({ section: "5.022", note: "Statutory form - the general warranty deed form; a covenant of warranty is NOT required in a conveyance; parties may use any lawful form." }),
      Object.freeze({ section: "5.023", note: "Implied covenants - 'grant' or 'convey' implies only that the grantor has not previously conveyed the estate and that it is free from encumbrances; the implied covenant is actionable." }),
      Object.freeze({ section: "5.041", note: "Future estates - a person may convey inter vivos a freehold estate that commences in the future, as by will." })
    ],
  }),
  chapter({
    code: "PR", codeName: "Property Code", chapter: "11", title: "Provisions Generally Applicable to Real Property",
    url: "https://tcss.legis.texas.gov/resources/PR/htm/PR.11.htm",
    localCopy: "texas/trec-sources/statutes/PR.11.htm",
    sha256: "274fa3cfda2b15d503c12bf5ea439fbaab1a262ab7acc3623db757855f1fe5f3", bytes: 22639, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T07U2", "T07U3"],
    sectionsRead: [
      Object.freeze({ section: "11.001", note: "Place of recording - to be effectively recorded, an instrument relating to real property must be eligible for recording and must be recorded in the county in which a part of the property is located; a later new-county split does not affect a proper recording's validity or effect as notice." }),
      Object.freeze({ section: "11.004", note: "Duty of recorder - the county clerk must correctly record qualifying instruments within a reasonable time after delivery, give a receipt, record instruments relating to the same property in the order filed, and keep the required indexes." }),
      Object.freeze({ section: "11.008", note: "Personal information - an instrument submitted for recording is not required to contain a social security number and the preparer may not include one; a transfer instrument between individuals carries the prescribed 12-point NOTICE OF CONFIDENTIALITY RIGHTS block on its first page." })
    ],
  }),
  chapter({
    code: "PR", codeName: "Property Code", chapter: "12", title: "Recording of Instruments",
    url: "https://tcss.legis.texas.gov/resources/PR/htm/PR.12.htm",
    localCopy: "texas/trec-sources/statutes/PR.12.htm",
    sha256: "6cea8bbf2f7e8cfc58b707166c4d3dcf284c0cb090c67266ebad4aeb44e7470d", bytes: 85784, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T04U1", "T07U3"],
    sectionsRead: [
      Object.freeze({ section: "12.001", note: "An instrument may be recorded if acknowledged, sworn to with a proper jurat, or proved; a conveyance may not be recorded unless signed and acknowledged or sworn to, and an individual presenting a paper instrument shows photo identification (as amended eff. December 4, 2025)." }),
      Object.freeze({ section: "12.0011", note: "Paper documents require an original signature acknowledged, sworn or proved to be recorded or serve as notice; electronic instruments under the applicable electronic-recording law need no original signature." })
    ],
  }),
  chapter({
    code: "PR", codeName: "Property Code", chapter: "13", title: "Effects of Recording",
    url: "https://tcss.legis.texas.gov/resources/PR/htm/PR.13.htm",
    localCopy: "texas/trec-sources/statutes/PR.13.htm",
    sha256: "2cfe34903ef3dac768acfd4d4e64f2a095335b4db1648f51ddd8dab5d6c1ac65", bytes: 8123, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T07U3", "T07U4"],
    sectionsRead: [
      Object.freeze({ section: "13.001", note: "An unrecorded conveyance, mortgage or deed of trust is VOID as to a creditor or subsequent purchaser for valuable consideration without notice - and binding on the parties, their heirs, and a subsequent purchaser with notice or without valuable consideration." }),
      Object.freeze({ section: "13.002", note: "A properly recorded instrument is notice to all persons of its existence and open to public inspection." })
    ],
  }),
  chapter({
    code: "PR", codeName: "Property Code", chapter: "21", title: "Eminent Domain",
    url: "https://tcss.legis.texas.gov/resources/PR/htm/PR.21.htm",
    localCopy: "texas/trec-sources/statutes/PR.21.htm",
    sha256: "a39523c2f48d89c7f4ac901dcc6b1d377c95fdefdc0efb331de599359d3654df", bytes: 106104, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T07U9"],
    sectionsRead: [
      Object.freeze({ section: "21.012", note: "Condemnation petition - describes the property, states the specific public use, states inability to agree on damages, and states that the entity gave the landowner's bill of rights statement and made a bona fide offer." })
    ],
  }),
  chapter({
    code: "PR", codeName: "Property Code", chapter: "41", title: "Interests in Land Exempt from Seizure",
    url: "https://tcss.legis.texas.gov/resources/PR/htm/PR.41.htm",
    localCopy: "texas/trec-sources/statutes/PR.41.htm",
    sha256: "46b5db89c5f031683f17b92fe17167d64c0cf032f6843325d5232045cf8fa0f2", bytes: 38782, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T03U7"],
    sectionsRead: [
      Object.freeze({ section: "41.001", note: "A homestead is exempt from seizure for creditors' claims except encumbrances properly fixed - purchase money, taxes on the property, work-and-material liens contracted for in the manner required, owelty and refinance liens among those enumerated." }),
      Object.freeze({ section: "41.002", note: "Homestead definition - urban homestead of not more than 10 acres in one or more contiguous lots; rural homestead of not more than 200 acres for a family (100 for a single adult) not in a municipality, with the urban/rural test stated." })
    ],
  }),
  chapter({
    code: "PR", codeName: "Property Code", chapter: "51", title: "Provisions Generally Applicable to Liens",
    url: "https://tcss.legis.texas.gov/resources/PR/htm/PR.51.htm",
    localCopy: "texas/trec-sources/statutes/PR.51.htm",
    sha256: "73590107b2418423a4b3af10c46cdd0638b0194581a3df65756566c6e196f921", bytes: 60209, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T03U3", "T03U5", "T08U1", "T08U2"],
    sectionsRead: [
      Object.freeze({ section: "51.0001", note: "Definitions - 'security instrument' means a deed of trust, mortgage or other contract lien on an interest in real property; 'mortgagor' is the grantor; 'mortgagee' the holder or book-entry system; 'trustee' and 'substitute trustee' exercise the power of sale; 'mortgage servicer' receives payments." }),
      Object.freeze({ section: "51.002", note: "Sale of real property under contract lien - public auction, first Tuesday of the month, 10 a.m. to 4 p.m., at the county courthouse, with the notice periods stated in the section." }),
      Object.freeze({ section: "51.003", note: "Deficiency judgment - an action must be brought within two years of the foreclosure sale; the debtor may have the deficiency offset by the amount by which fair market value at sale exceeds the sale price." })
    ],
  }),
  chapter({
    code: "PR", codeName: "Property Code", chapter: "53", title: "Mechanic's, Contractor's, or Materialman's Lien",
    url: "https://tcss.legis.texas.gov/resources/PR/htm/PR.53.htm",
    localCopy: "texas/trec-sources/statutes/PR.53.htm",
    sha256: "fc56f1f4cb731ce262d4283acfe48fa79b1284613487ae5f38e1066627ef4630", bytes: 175115, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T03U5"],
    sectionsRead: [
      Object.freeze({ section: "53.001", note: "Definitions - 'improvement' includes buildings, fixtures, landscaping-related works, plans by licensed architects, engineers and surveyors; 'labor', 'material', 'original contractor' defined." }),
      Object.freeze({ section: "53.021", note: "Persons entitled to lien - one who labors or furnishes labor or materials for construction or repair under a contract with the owner or the owner's agent, trustee, receiver, contractor or subcontractor; specially fabricated material even if not delivered; licensed architects, engineers and surveyors; landscaping; demolition." })
    ],
  }),
  chapter({
    code: "PR", codeName: "Property Code", chapter: "111", title: "General Provisions (Texas Trust Code)",
    url: "https://tcss.legis.texas.gov/resources/PR/htm/PR.111.htm",
    localCopy: "texas/trec-sources/statutes/PR.111.htm",
    sha256: "5eea3ffa844d0116f3225dfa14c85539cc723e69cb2ccdf856ce023ec2f32018", bytes: 21011, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T05U4"],
    sectionsRead: [
      Object.freeze({ section: "111.003", note: "For the subtitle a 'trust' is an EXPRESS trust only - not a resulting trust, constructive trust, business trust, or security instrument such as a deed of trust." }),
      Object.freeze({ section: "111.004", note: "'Express trust' means a fiduciary relationship with respect to property arising from the settlor's manifested intention to create it, subjecting the title-holder to equitable duties to deal with the property for another's benefit." })
    ],
  }),
  chapter({
    code: "ES", codeName: "Estates Code", chapter: "101", title: "Estate Assets in General",
    url: "https://tcss.legis.texas.gov/resources/ES/htm/ES.101.htm",
    localCopy: "texas/trec-sources/statutes/ES.101.htm",
    sha256: "1d1417459c5fb129bc936e9f89e27db8cefd514bf3536fb1cf4b0231fafbc056", bytes: 9174, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T05U3", "T07U6"],
    sectionsRead: [
      Object.freeze({ section: "101.002", note: "Effect of joint ownership - if a joint owner dies before severance, the decedent's interest does NOT survive to the remaining joint owners; it passes by will or intestacy as if severed." })
    ],
  }),
  chapter({
    code: "ES", codeName: "Estates Code", chapter: "111", title: "Nontestamentary Transfers (survivorship agreements)",
    url: "https://tcss.legis.texas.gov/resources/ES/htm/ES.111.htm",
    localCopy: "texas/trec-sources/statutes/ES.111.htm",
    sha256: "6ba91e92d22c56ac091622fa80207502f73fbe766f07926aae8aab70cb9e9cf3", bytes: 15780, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T05U3"],
    sectionsRead: [
      Object.freeze({ section: "111.001", note: "Right-of-survivorship agreements authorized - notwithstanding § 101.002, joint owners may agree IN WRITING that a decedent's interest survives to the surviving owners; survivorship may NOT be inferred from the mere fact of joint ownership." })
    ],
  }),
  chapter({
    code: "ES", codeName: "Estates Code", chapter: "112", title: "Community Property with Right of Survivorship",
    url: "https://tcss.legis.texas.gov/resources/ES/htm/ES.112.htm",
    localCopy: "texas/trec-sources/statutes/ES.112.htm",
    sha256: "7a888ff72e9f5a75c6dec6ada17a6f57c4ada89bb126e77e3ef9c7fd46e92204", bytes: 34451, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T05U3"],
    sectionsRead: [
      Object.freeze({ section: "112.051", note: "Spouses may agree between themselves that all or part of their community property becomes the surviving spouse's on death." }),
      Object.freeze({ section: "112.052", note: "The agreement must be in writing signed by BOTH spouses; four phrases suffice ('with right of survivorship' among them); survivorship is not inferred from a joint account or 'JT TEN' designation." })
    ],
  }),
  chapter({
    code: "ES", codeName: "Estates Code", chapter: "201", title: "Descent and Distribution",
    url: "https://tcss.legis.texas.gov/resources/ES/htm/ES.201.htm",
    localCopy: "texas/trec-sources/statutes/ES.201.htm",
    sha256: "52338bd274ead06b1602f1c2c6838f2a297a851003f5c39e850f849c0df8a0ac", bytes: 39074, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T07U7"],
    sectionsRead: [
      Object.freeze({ section: "201.001", note: "Intestate leaving no spouse - to children and their descendants; then parents and siblings by the stated division; then the two-moiety split between paternal and maternal kindred." }),
      Object.freeze({ section: "201.002", note: "Separate estate with a surviving spouse - with children, the spouse takes one-third of personal property and a life estate in one-third of land, remainder to the children; without children, all personal property and one-half of land to the spouse." }),
      Object.freeze({ section: "201.003", note: "Community estate - passes entirely to the surviving spouse if no descendant, or if all surviving descendants are also the survivor's; otherwise the decedent's one-half passes to the descendants." }),
      Object.freeze({ section: "201.101", note: "Per capita with representation distribution defined." })
    ],
  }),
  chapter({
    code: "ES", codeName: "Estates Code", chapter: "251", title: "Fundamental Requirements and Provisions Relating to Wills",
    url: "https://tcss.legis.texas.gov/resources/ES/htm/ES.251.htm",
    localCopy: "texas/trec-sources/statutes/ES.251.htm",
    sha256: "4fd0a0a39400b485e8944ecc0847fab749958a408803e611cf6ad1ad3d77ecfe", bytes: 23639, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T07U7"],
    sectionsRead: [
      Object.freeze({ section: "251.001", note: "Who may make a will - a person of sound mind who is 18, or is or has been married, or is a member of the armed forces." }),
      Object.freeze({ section: "251.051", note: "A will must be in writing, signed by the testator or another at the testator's direction and in the testator's presence, and attested by two or more credible witnesses at least 14 years old signing in the testator's presence." }),
      Object.freeze({ section: "251.052", note: "Holographic exception - a will wholly in the testator's handwriting needs no attesting witnesses." })
    ],
  }),
  chapter({
    code: "BC", codeName: "Business and Commerce Code", chapter: "9", title: "Secured Transactions",
    url: "https://tcss.legis.texas.gov/resources/BC/htm/BC.9.htm",
    localCopy: "texas/trec-sources/statutes/BC.9.htm",
    sha256: "81e04c47f8d4eaf3ae08d1c73df8cd6532ef4b7d8ba320e8d87538eb67886fef", bytes: 454177, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T02U2"],
    sectionsRead: [
      Object.freeze({ section: "9.334", note: "Fixtures - no Article 9 security interest exists in ordinary building materials incorporated into an improvement; a purchase-money security interest in fixtures perfected by a fixture filing before the goods become fixtures or within 20 days after has priority over an earlier real-property encumbrancer; readily removable machines and replacement domestic appliances treated separately." })
    ],
  }),
  chapter({
    code: "BC", codeName: "Business and Commerce Code", chapter: "26", title: "Statute of Frauds",
    url: "https://tcss.legis.texas.gov/resources/BC/htm/BC.26.htm",
    localCopy: "texas/trec-sources/statutes/BC.26.htm",
    sha256: "e2c23d1a446796b7083157d2940094e660e14ca660670665ff5a801a8bd1a708", bytes: 9473, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T06U1", "T06U2", "T06U4"],
    sectionsRead: [
      Object.freeze({ section: "26.01", note: "A promise or agreement within the section is unenforceable unless in writing and signed by the person to be charged - including a contract for the sale of real estate and a lease of real estate for a term longer than one year." })
    ],
  }),
  chapter({
    code: "CP", codeName: "Civil Practice and Remedies Code", chapter: "16", title: "Limitations",
    url: "https://tcss.legis.texas.gov/resources/CP/htm/CP.16.htm",
    localCopy: "texas/trec-sources/statutes/CP.16.htm",
    sha256: "cfefbe20090b0e909f368e0d8a95a86fef9c80733921408d170070cc56dd8e78", bytes: 89021, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T06U3", "T07U9"],
    sectionsRead: [
      Object.freeze({ section: "16.004", note: "Four-year limitations period - specific performance of a contract for the conveyance of real property, debt, fraud, breach of fiduciary duty." }),
      Object.freeze({ section: "16.024", note: "Adverse possession, three years - recovery of property held in peaceable and adverse possession under title or color of title." }),
      Object.freeze({ section: "16.025", note: "Adverse possession, five years - possessor cultivates, uses or enjoys the property, pays applicable taxes, and claims under a duly registered deed; quitclaim and forged deeds excluded." }),
      Object.freeze({ section: "16.026", note: "Adverse possession, ten years - cultivates, uses or enjoys; without a title instrument possession is limited to 160 acres unless more is actually enclosed." }),
      Object.freeze({ section: "16.051", note: "Residual four-year period for actions with no express period, EXCEPT an action for the recovery of real property." })
    ],
  }),
  chapter({
    code: "TX", codeName: "Tax Code", chapter: "11", title: "Taxable Property and Exemptions",
    url: "https://tcss.legis.texas.gov/resources/TX/htm/TX.11.htm",
    localCopy: "texas/trec-sources/statutes/TX.11.htm",
    sha256: "d3b3e1825764e0fa5b2f4965d6ee0cbcc46d7865bdfc6796d4b0b2c7730c4a82", bytes: 474190, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T03U7"],
    sectionsRead: [
      Object.freeze({ section: "11.13", note: "Residence homestead exemptions - $3,000 of assessed value for county purposes under Article VIII, Section 1-a; $140,000 of appraised value from school district taxation for an adult's residence homestead (as the held text states it); an additional $60,000 school exemption for an owner who is disabled or 65 or older; optional local-option exemptions of at least $3,000 as adopted." })
    ],
  }),
  chapter({
    code: "TX", codeName: "Tax Code", chapter: "32", title: "Tax Liens and Personal Liability",
    url: "https://tcss.legis.texas.gov/resources/TX/htm/TX.32.htm",
    localCopy: "texas/trec-sources/statutes/TX.32.htm",
    sha256: "af09b4f7621a7d9976768769be7dd352f199ba407f325ae1c59c0d6e05330c73", bytes: 54703, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T03U4", "T07U9"],
    sectionsRead: [
      Object.freeze({ section: "32.01", note: "A tax lien attaches to property on JANUARY 1 each year to secure that year's taxes, penalties and interest, in favour of each taxing unit, and is perfected on attachment without further action." }),
      Object.freeze({ section: "32.05", note: "Priority - the tax lien takes priority over a homestead interest and over the claims of creditors and other lienholders REGARDLESS of when the competing interest arose; it is inferior to certain estate claims and to restrictive covenants and easements recorded before January 1 of the lien year." })
    ],
  }),
  chapter({
    code: "WA", codeName: "Water Code", chapter: "11", title: "Water Rights",
    url: "https://tcss.legis.texas.gov/resources/WA/htm/WA.11.htm",
    localCopy: "texas/trec-sources/statutes/WA.11.htm",
    sha256: "24e3aca8e73bf7cad479fcb3dbc2a088e29fab2db235e9f00c66f1c059156a45", bytes: 424135, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T03U6"],
    sectionsRead: [
      Object.freeze({ section: "11.021", note: "State water - the water of the ordinary flow, underflow and tides of every flowing river, natural stream and lake, and storm, flood and rain water in natural watercourses, is the property of the state." })
    ],
  }),
  chapter({
    code: "BO", codeName: "Business Organizations Code", chapter: "200", title: "Real Estate Investment Trusts",
    url: "https://tcss.legis.texas.gov/resources/BO/htm/BO.200.htm",
    localCopy: "texas/trec-sources/statutes/BO.200.htm",
    sha256: "a931664b99ad75566b03f4679e0b11467db37e33b0d7d08c481f44166c6d3579", bytes: 151017, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T05U2", "T05U9"],
    sectionsRead: [
      Object.freeze({ section: "200.001", note: "A Texas real estate investment trust is an unincorporated trust formed by one or more trust managers under chapter 200 and chapter 3 of the Business Organizations Code." })
    ],
  }),
  chapter({
    code: "GV", codeName: "Government Code", chapter: "4001", title: "Securities Act - General Provisions",
    url: "https://tcss.legis.texas.gov/resources/GV/htm/GV.4001.htm",
    localCopy: "texas/trec-sources/statutes/GV.4001.htm",
    sha256: "f99f69374aaf2e5267e69ba442a9f5b6a468a8a21d5fe19641f798613bb59c28", bytes: 36228, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T05U8"],
    sectionsRead: [
      Object.freeze({ section: "4001.068", note: "'Security' includes a limited-partner interest, share, stock, note, bond, debenture or other evidence of indebtedness, a certificate under a profit-sharing or participation agreement, an interest under an oil, gas or mining lease, and an INVESTMENT CONTRACT, whether or not evidenced by a written instrument." })
    ],
  }),
  chapter({
    code: "GV", codeName: "Government Code", chapter: "4005", title: "Securities Act - Exemptions",
    url: "https://tcss.legis.texas.gov/resources/GV/htm/GV.4005.htm",
    localCopy: "texas/trec-sources/statutes/GV.4005.htm",
    sha256: "6af4b08eaf2d105b7b07de9e0d44beef6ad1b34b7e9ffe5c3263db25214fd17a", bytes: 61362, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T05U8"],
    sectionsRead: [
      Object.freeze({ section: "4005.001", note: "Scope of exemption - except as expressly provided otherwise, the Securities Act title does not apply to a sale, offer, solicitation, subscription, dealing or delivery of a security made in a transaction or under a condition specified in the exemptions subchapter." }),
      Object.freeze({ section: "4005.012", note: "Private limited offerings - the exemption applies to sales made without any public solicitation or advertisement where the issuer has no more than 35 security holders after the sale, or sells to not more than 15 persons in the 12 months ending on the sale date who buy for their own account and not for distribution." })
    ],
  }),
  chapter({
    code: "LG", codeName: "Local Government Code", chapter: "232", title: "County Regulation of Subdivisions",
    url: "https://tcss.legis.texas.gov/resources/LG/htm/LG.232.htm",
    localCopy: "texas/trec-sources/statutes/LG.232.htm",
    sha256: "0708ec2aae2283f5ec800492547f5f3c875c10275165263183dd515a4bda404e", bytes: 380316, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T04U1", "T04U2"],
    sectionsRead: [
      Object.freeze({ section: "232.001", note: "Plat required - an owner dividing a tract outside a municipality into two or more parts to lay out a subdivision, lots or streets must have a plat prepared; the plat must describe the subdivision by metes and bounds, locate it with respect to an original survey corner, state dimensions, be acknowledged like a deed and be filed with the county clerk; a division by metes-and-bounds description in a deed or executory contract is still a division." })
    ],
  }),
  chapter({
    code: "NR", codeName: "Natural Resources Code", chapter: "21", title: "Surveys",
    url: "https://tcss.legis.texas.gov/resources/NR/htm/NR.21.htm",
    localCopy: "texas/trec-sources/statutes/NR.21.htm",
    sha256: "31c106ae7cd383c0e39c3d04b665dac6153e36d373002208b7b8c815f7ed7a8b", bytes: 29873, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T04U2"],
    sectionsRead: [
      Object.freeze({ section: "21.001", note: "Definitions - 'navigable stream' means a stream retaining an average width of 30 feet from the mouth up." }),
      Object.freeze({ section: "21.041", note: "Field notes of a survey of public land - county, authority, proper field notes with calls and connections, observing the Spanish measurement by VARAS, a diagram, State Plane Coordinates under the Texas Coordinate Systems, personnel, date, surveyor's signature." })
    ],
  }),
  chapter({
    code: "FA", codeName: "Family Code", chapter: "3", title: "Marital Property Rights and Liabilities",
    url: "https://tcss.legis.texas.gov/resources/FA/htm/FA.3.htm",
    localCopy: "texas/trec-sources/statutes/FA.3.htm",
    sha256: "ed76712a7e9e25b7317ff745fce71af4bc9fe9923129c2d6e0c1a686539056d3", bytes: 46081, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T05U1", "T05U3"],
    sectionsRead: [
      Object.freeze({ section: "3.001", note: "Separate property - property owned or claimed before marriage, property acquired during marriage by gift, devise or descent, and most personal-injury recoveries." }),
      Object.freeze({ section: "3.002", note: "Community property - the property, other than separate property, acquired by either spouse during marriage." }),
      Object.freeze({ section: "3.003", note: "Presumption - property possessed by either spouse during or on dissolution of marriage is presumed community; separate character must be proved by clear and convincing evidence." })
    ],
  }),
  chapter({
    code: "FI", codeName: "Finance Code", chapter: "343", title: "Home Loans",
    url: "https://tcss.legis.texas.gov/resources/FI/htm/FI.343.htm",
    localCopy: "texas/trec-sources/statutes/FI.343.htm",
    sha256: "94dee3bf7cdc8a41037310f5c138cabdfc21377240ebd251f29ef9be8f755e38", bytes: 32565, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T08U2"],
    sectionsRead: [
      Object.freeze({ section: "343.001", note: "'Home loan' - a loan to individuals for personal, family or household purposes secured wholly or partly by a manufactured home or by real property improved by a dwelling for four or fewer families, used or to be used as the borrower's principal residence; 'bridge loan' defined." }),
      Object.freeze({ section: "343.203", note: "A high-cost home loan may not provide a payment schedule of regular periodic payments that causes the principal balance to increase - negative amortization - except in a borrower-sought forbearance, bridge loan or restructure." })
    ],
  }),
  chapter({
    code: "IN", codeName: "Insurance Code", chapter: "2501", title: "Title Insurance - General Provisions",
    url: "https://tcss.legis.texas.gov/resources/IN/htm/IN.2501.htm",
    localCopy: "texas/trec-sources/statutes/IN.2501.htm",
    sha256: "246d1c57cc82e1dadd60c5c5f62361348cf4bc2b4a1f484abad696f01589f4a5", bytes: 18106, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T07U4", "T09U1", "T09U2"],
    sectionsRead: [
      Object.freeze({ section: "2501.003", note: "Definitions - 'title insurance' indemnifies an owner or other interested person against loss from a lien, encumbrance or defect in title or the invalidity or impairment of a lien; 'premium' means the rates PROMULGATED BY THE COMMISSIONER and includes charges for title examination and closing; 'title examination'; 'escrow officer'; 'abstract plant'." }),
      Object.freeze({ section: "2501.004", note: "An abstract plant must be geographically arranged, cover a period beginning not later than January 1, 1979, and be kept current." })
    ],
  }),
]);

export const FEDERAL_SOURCES = Object.freeze([
  federal({
    citation: "12 U.S.C. § 2601", title: "Real Estate Settlement Procedures Act - findings and purpose", publisher: "uscode.house.gov",
    url: "https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title12-section2601&num=0&edition=prelim",
    localCopy: "texas/trec-sources/federal/us12-2601.html",
    sha256: "ea0a6edcbbbcfde427d58404733e8161fbb4b25ae2f124ffe999a902365939e1", bytes: 154001, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T09U3"],
    sectionsRead: [
      Object.freeze({ section: "2601", note: "Congressional findings and purpose - reforms of the settlement process so consumers receive greater and more timely information on the nature and costs of settlement and are protected from unnecessarily high charges." })
    ],
  }),
  federal({
    citation: "12 U.S.C. § 2603", title: "RESPA - uniform settlement statement", publisher: "uscode.house.gov",
    url: "https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title12-section2603&num=0&edition=prelim",
    localCopy: "texas/trec-sources/federal/us12-2603.html",
    sha256: "849fe719b51be6afb48e45c0c5bb3d496c46ba40a899b84f28c5db24300ece92", bytes: 157543, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T09U3", "T09U4"],
    sectionsRead: [
      Object.freeze({ section: "2603", note: "The Bureau publishes a single, INTEGRATED disclosure for mortgage loan transactions, combining RESPA settlement-cost disclosure with Truth in Lending Act disclosures; the forms conspicuously and clearly itemize all charges imposed on the borrower and all charges imposed on the seller." })
    ],
  }),
  federal({
    citation: "12 U.S.C. § 2607", title: "RESPA - prohibition against kickbacks and unearned fees", publisher: "uscode.house.gov",
    url: "https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title12-section2607&num=0&edition=prelim",
    localCopy: "texas/trec-sources/federal/us12-2607.html",
    sha256: "f04f0af9e186d042a7b8ab9637cadc8c466ca93e4a5d455ad53a953412ccb507", bytes: 160088, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T09U2", "T09U3"],
    sectionsRead: [
      Object.freeze({ section: "2607", note: "No fee, kickback or thing of value for referring settlement-service business involving a federally related mortgage loan, and no splitting of charges except for services actually performed; cooperative brokerage and referral arrangements BETWEEN real estate agents and brokers are expressly permitted, as are payments for goods, facilities and services actually furnished." })
    ],
  }),
  federal({
    citation: "12 C.F.R. part 1024 (Regulation X)", title: "RESPA Regulation X, subpart B", publisher: "eCFR API, title 12, as of 2026-08-01",
    url: "https://www.ecfr.gov/api/versioner/v1/full/2026-08-01/title-12.xml?part=1024&subpart=B",
    localCopy: "texas/trec-sources/federal/ecfr-12cfr1024.xml",
    sha256: "2df23a9029b5bfa2d12dbc38073b1fc1541f2c19a01c4b6f0a4cef8411f398b8", bytes: 90113, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T09U3", "T09U4"],
    sectionsRead: [
      Object.freeze({ section: "1024.6", note: "Special information booklet - the lender provides the booklet to a person from whom the lender receives or for whom it prepares a written application for a federally related mortgage loan, subject to stated exceptions." })
    ],
  }),
  federal({
    citation: "26 U.S.C. § 1445", title: "FIRPTA - withholding on dispositions of U.S. real property interests", publisher: "uscode.house.gov",
    url: "https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title26-section1445&num=0&edition=prelim",
    localCopy: "texas/trec-sources/federal/us26-1445.html",
    sha256: "05f1b5f10bab862596c08fd167abaf30b9504b43ee7dce6993229babd0563d25", bytes: 191303, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T08U3"],
    sectionsRead: [
      Object.freeze({ section: "1445", note: "On a disposition of a United States real property interest by a FOREIGN person, the transferee must deduct and withhold a tax equal to 15 PERCENT of the amount realized, subject to exemptions including the transferor's non-foreign affidavit." })
    ],
  }),
  federal({
    citation: "26 U.S.C. § 860A", title: "Real estate mortgage investment conduits - taxation", publisher: "uscode.house.gov",
    url: "https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title26-section860A&num=0&edition=prelim",
    localCopy: "texas/trec-sources/federal/us26-860A.html",
    sha256: "756f0bf650877616c78cc65d81977be4fbf2406df8db9c71f5cd86fae0773499", bytes: 149816, retrievedOn: "2026-08-27",
    reliedOnByUnits: ["T05U10"],
    sectionsRead: [
      Object.freeze({ section: "860A", note: "A REMIC is not itself subject to taxation under the subtitle; the income of the REMIC is taxable to the holders of interests in it." })
    ],
  }),
]);

/**
 * Units that need no statutory source, and why. A unit is not "uncovered" because no statute
 * governs it — history and investment arithmetic are taught from neither — but saying so has to be
 * deliberate, so each one is named with its reason rather than silently omitted.
 */
export const NO_STATUTE_REQUIRED = Object.freeze([
  Object.freeze({ unit: "T03U1", reason: "Historical Background - the development of property concepts from feudal tenure to allodial ownership, taught as history. No current legal rule is asserted from it." }),
  Object.freeze({ unit: "T05U5", reason: "Investing in Real Estate - investment concepts and vocabulary, taught as economics rather than as a rule of law." }),
  Object.freeze({ unit: "T05U6", reason: "The Investment - the mechanics and arithmetic of an investment position: income, expenses, cash flow, appreciation. Arithmetic, not law." }),
  Object.freeze({ unit: "T05U7", reason: "The Benefits - the economic case for ownership, taught WITHOUT tax propositions: use and control, potential income and appreciation, leverage, inflation hedging, with liquidity and risk stated as the offsetting costs. Any tax statement would require the Internal Revenue Code, which is not held for this unit, so none is made and the student is directed to a qualified tax professional." })
]);

export const ALL_SOURCES = Object.freeze([...STATUTE_CHAPTERS, ...FEDERAL_SOURCES]);

/** The path that returns an application shell, kept so nobody retries it and concludes the same thing twice. */
export const OBSOLETE_PATH = Object.freeze({
  pattern: "https://statutes.capitol.texas.gov/Docs/{CODE}/htm/{CODE}.{CHAPTER}.htm",
  observed: "returns an identical 250,874-byte single-page-application shell for every path, and 406 for a non-HTML Accept header",
  conclusion: "NOT evidence that Texas statutes are unavailable. Use the tcss.legis.texas.gov static layer.",
});

export const SECTIONS_READ = Object.freeze(
  ALL_SOURCES.flatMap((entry) => entry.sectionsRead.map((s) => Object.freeze({ ...s, sourceId: entry.id, jurisdiction: entry.jurisdiction, citation: entry.citation }))),
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
