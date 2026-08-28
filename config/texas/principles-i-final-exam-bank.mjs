/**
 * Texas Principles of Real Estate I — FINAL EXAMINATION BANK (TX-1B).
 *
 * AUTHORIZATION. TX-1A closed with the standing instruction "TX-1B IS NOT AUTHORIZED"; the owner
 * authorized TX-1B on 2026-08-28. This file is the 120-question final examination bank that
 * texas/submission/tx1b-exam-build-input-manifest.md specified: every item traced to a taught
 * PRINS1-1 unit, and through UNIT_TRACE to sections recorded as read in
 * config/texas/statute-sources.mjs. The formative bank (principles-i-question-bank.mjs) defined the
 * difficulty register and style; per the manifest, no formative item is promoted verbatim.
 *
 * WHAT REMAINS BLOCKED. Building the bank does not open an examination. Exam ADMINISTRATION
 * parameters (proctoring, identity validation, timing) live in the codified 22 TAC provider rules
 * (§ 535.65 as adopted effective 2026-08-31), which await human export; until
 * TX_PROVIDER_RULE_SOURCE_LOCK passes, EXAM_READY stays BLOCKED and no student may be served an
 * attempt. The administration constants in principles-i-final-exam-forms.mjs are PROVIDER
 * PROPOSALS pending that confirmation, and the engine refuses administration while blocked.
 *
 * SECURITY. This file is an answer key. It lives in config/, outside every student-served tree;
 * the site build refuses a dist that contains any file matching final-exam-bank or any
 * correctChoice text (site/build.sh). Items are authored with the correct answer at index 0 for
 * reviewability; the engine permutes choices deterministically at serve and strips the key from
 * anything student-facing.
 *
 * SOURCE DISCIPLINE. No item asserts a legal proposition the curriculum does not teach from a read
 * section. Every statutory figure in a prompt or rationale (15 percent, $300,000, 20 and 21 days,
 * two years, 160 acres, 10/200/100 acres, $3,000/$140,000/$60,000, 30 feet, 36 varas to 100 feet,
 * 12 hours, 60 hours, three transactions, 35 holders / 15 persons, first Tuesday, 10 a.m. to
 * 4 p.m.) is taught in the named unit from the read text. Nothing here claims TREC approval of
 * provider, course, or examination.
 */

import { ALL_UNITS } from "./prins1-course-form.mjs";

/* `source` is the item's trace — the PRINS1-1 topic and unit it examines — kept on the server
   object for blueprint audits and the instructor key, and never rendered to a student surface. */
const item = (id, tests, prompt, choices, rationale) =>
  Object.freeze({
    id, tests, prompt,
    choices: Object.freeze(choices),
    correctChoice: 0,
    rationale,
    source: Object.freeze({ topic: tests.slice(0, 3), unit: tests }),
  });

/* Items per unit, allocated proportionally to the PRINS1-1 form's own minutes (about one item per
   12.5 prescribed minutes, every unit at least one) and enforced by the invariants below. */
export const BLUEPRINT = Object.freeze({
  T01U1: 2, T01U2: 1, T01U3: 2, T01U4: 3,
  T02U1: 2, T02U2: 3,
  T03U1: 2, T03U2: 2, T03U3: 2, T03U4: 2, T03U5: 2, T03U6: 2, T03U7: 4,
  T04U1: 5, T04U2: 3,
  T05U1: 2, T05U2: 1, T05U3: 1, T05U4: 1, T05U5: 2, T05U6: 2, T05U7: 2, T05U8: 1, T05U9: 1, T05U10: 1,
  T06U1: 2, T06U2: 3, T06U3: 2, T06U4: 4, T06U5: 6,
  T07U1: 2, T07U2: 1, T07U3: 2, T07U4: 4, T07U5: 2, T07U6: 1, T07U7: 2, T07U8: 1, T07U9: 2,
  T08U1: 8, T08U2: 7, T08U3: 4,
  T09U1: 4, T09U2: 4, T09U3: 3, T09U4: 5,
});

export const FINAL_EXAM_BANK = Object.freeze([

  /* ── T01 Introduction to Modern Real Estate Practice ──────────────────────────────── */

  item("FX001", "T01U1",
    "A retired teacher, for a $3,500 fee, finds a small warehouse for a church to lease and negotiates the terms. She has never sold property and holds no licence. Under the Occupations Code § 1101.002(1) definition, what is her position?",
    ["She performed a broker act — aiding in locating real estate for lease, for another, for consideration — and needed a licence.",
     "She is exempt because leasing is not brokerage, only sales are.",
     "She is exempt because a single transaction never requires a licence.",
     "She needed no licence because the church is a nonprofit."],
    "The broker definition runs on performing a listed act for another person for consideration; aiding in locating or obtaining real estate for purchase or lease is on the twelve-act list, and neither transaction count nor the client's nonprofit status appears in the definition."),

  item("FX002", "T01U1",
    "A licensed sales agent prepares a written analysis of a home's likely sale price while taking a listing, calls it a comparative market analysis, and is compensated through her commission. Which condition in § 1101.002(1)(A)(xi) keeps this a broker act rather than a separately licensed appraisal?",
    ["The written price opinion is not referred to as an appraisal, is given in the ordinary course of business, and relates to the management, acquisition, disposition or encumbrance of real property.",
     "The analysis stays under a statutory page limit set for market analyses.",
     "The agent's sponsoring broker countersigns the analysis.",
     "The opinion is delivered orally before being written down."],
    "The statute treats a written price analysis as a broker act only when it is not called an appraisal, is given in the ordinary course of business, and relates to actual or potential management, acquisition, disposition or encumbrance; calling it an appraisal moves it into a separately licensed occupation."),

  item("FX003", "T01U2",
    "A course provider proposes to let a motivated student complete this 30-hour qualifying course over a single long weekend, crediting 15 hours each day and reporting completion on day four. Which statutory limits does the plan violate?",
    ["Both § 1101.003(d)'s 12-hour daily cap on a qualifying course segment and § 1101.003(e)'s rule that completion may not be reported until elapsed time from registration exceeds twice the credit hours — 60 hours for this course.",
     "Only a Commission rule on weekend study; the statute itself sets no limits.",
     "Neither — the limits apply only to classroom courses, not correspondence delivery.",
     "Only the daily cap; completion may be reported whenever the coursework is done."],
    "Section 1101.003(d) caps a daily qualifying-course segment at 12 hours, and § 1101.003(e) bars reporting a correspondence or alternative-delivery completion until elapsed time from registration exceeds twice the claimed credit hours — sixty hours for a 30-hour course. Both are statutory, not school policy."),

  item("FX004", "T01U3",
    "A national homebuilder cannot ship its surplus of completed houses from one metropolitan market to relieve a shortage in another, and prices in the two cities diverge for years. Which characteristic of real estate explains this?",
    ["Immobility — land cannot be moved, so every market is local and supply in one place cannot answer demand in another.",
     "Indestructibility — durable assets cannot be relocated.",
     "Scarcity — there is not enough land anywhere.",
     "Situs — buyers prefer some locations over others."],
    "Immobility is the physical characteristic that makes real estate markets irreducibly local: a surplus in one metropolitan area cannot ship to a shortage in another, which is also why real estate is governed, taxed and licensed where it sits."),

  item("FX005", "T01U3",
    "Real estate is described as trading in an imperfect market. Which combination of features supports that description as the course teaches it?",
    ["Incomplete information, non-standard products, slow entry of new supply, and dominance of local conditions.",
     "Continuously posted prices, standardised products and instant settlement.",
     "A central exchange where all parcels trade at one clearing price.",
     "Perfect substitutability between any two parcels of equal size."],
    "Because the asset is immobile and unique, buyers and sellers find each other by costly search, prices are discovered deal by deal, and supply responds slowly — the textbook features of an imperfect market, and the reason the brokerage occupation exists."),

  item("FX006", "T01U4",
    "An unlicensed man puts up a sign reading 'Hill County Realty — we sell your land' and hands out business cards, though he has not yet handled a transaction. Under Occupations Code § 1101.351, has he violated the licensing law?",
    ["Yes — a person may not act as OR represent being a broker or sales agent without a licence, and holding out alone is prohibited conduct.",
     "No — the statute is violated only when a transaction actually closes.",
     "No — signs are advertising, which the Act does not regulate.",
     "Only if he collects a commission."],
    "Section 1101.351(a) prohibits acting as or representing that the person is a broker or sales agent without a licence; representation alone — a sign, a website, a card — violates the section whether or not any transaction ever happens."),

  item("FX007", "T01U4",
    "A licensed auctioneer is engaged to call the auction of a ranch, and also proposes to run the pre-sale marketing campaign, negotiate with bidders in advance, and collect a percentage of the price. Where does the § 1101.005 exemption leave him?",
    ["Exempt only for calling the auction itself — the exemption covers the gavel, and the marketing and negotiating are broker acts requiring a licence.",
     "Fully exempt — auctioneers may perform any act connected to an auctioned property.",
     "Not exempt at all — real estate may never be auctioned without a broker.",
     "Exempt if the ranch sells for its reserve price."],
    "The auctioneer exemption applies to a licensed auctioneer calling the auction provided the auctioneer performs no other act of a broker; a marketing campaign and bidder negotiation for compensation are squarely inside the broker definition."),

  item("FX008", "T01U4",
    "For licensing purposes, § 1101.002(5) defines the 'real estate' a licence holder deals in. Which statement matches the definition?",
    ["Any interest in real property, including a leasehold, located in or outside this state — but not an interest held merely as security for an obligation.",
     "Only fee simple estates located within Texas.",
     "Land and permanent improvements, but never leaseholds.",
     "Any property interest, including liens held as security."],
    "The licensed commodity is interests, not dirt: the definition reaches any interest in real property including a leasehold, in or outside Texas, and expressly excludes an interest held merely as security — which is why brokering leases is licensed activity and holding a lien is not."),

  /* ── T02 Real Property ─────────────────────────────────────────────────────────────── */

  item("FX009", "T02U1",
    "A buyer contracts for a 60-acre tract 'together with all rights and appurtenances.' A 1981 deed in the chain conveyed the mineral estate to a third party. At closing, what does the buyer acquire?",
    ["The surface estate and the seller's remaining bundle of rights — the severed minerals are not the seller's to convey.",
     "The minerals as well, because the contract said 'all rights.'",
     "Nothing, because a contract cannot close over a severed mineral estate.",
     "The minerals, if the buyer had no actual knowledge of the 1981 deed."],
    "A conveyance passes only the sticks the seller holds; rights severed by a prior owner are gone from the bundle, and contract language cannot enlarge what the seller owns. Texas routinely severs and trades mineral interests separately from the surface."),

  item("FX010", "T02U1",
    "A hill-country listing is bounded on one side by a flowing, spring-fed creek. Under Water Code § 11.021, what may the listing truthfully say about the creek?",
    ["That the parcel has creek frontage and access — the water of the ordinary flow of a natural stream is the property of the state, so ownership of the watercourse may not be advertised.",
     "That the buyer will own the creek to its centerline.",
     "That the water conveys with the land like any other natural attachment.",
     "That ownership of the water depends on how long the seller has held title."],
    "Section 11.021 declares the water of the ordinary flow, underflow and tides of every flowing natural stream the property of the state; riparian frontage is access and amenity, not ownership of the stream, and a listing that promises the water promises what Texas owns."),

  item("FX011", "T02U2",
    "At a farmhouse closing walk-through, the seller has removed a hard-wired, wall-mounted water-filtration system custom-plumbed into the kitchen. The contract said nothing about it. Applying the fixture tests, who was entitled to it?",
    ["The buyer — annexation (hard-wired and plumbed), adaptation (custom-fitted to this house) and objective intention all point to a fixture that passes with the realty.",
     "The seller — she paid for it, and payment controls ownership.",
     "The seller — anything that can physically be removed is personal property.",
     "Whoever reaches the property first after funding."],
    "The fixture tests are method of annexation, adaptation to the realty, and objective intention judged from the circumstances; payment history and mere removability do not control. A plumbed, wired, custom-fitted system is a fixture, and fixtures pass with the deed when the contract is silent."),

  item("FX012", "T02U2",
    "A barbecue restaurant's tenant installed smokers, venting hoods and a walk-in cooler for its business. The lease ends next month. As between landlord and tenant, who owns the equipment, and on what condition?",
    ["The tenant — trade fixtures remain the tenant's personal property, removable at or before the end of the term, with the tenant responsible for removal damage.",
     "The landlord — attachment to the building made them part of the realty immediately.",
     "The landlord and tenant equally, by value.",
     "The tenant, but only if the landlord consents in writing to removal."],
    "Items a commercial tenant attaches for the tenant's business are trade fixtures: between landlord and tenant they stay the tenant's personal property, removable before the term ends with responsibility for removal damage; left behind, they typically pass to the landlord by abandonment."),

  item("FX013", "T02U2",
    "A solar array is sold on credit with a purchase-money security interest, and the financer records a fixture filing 12 days after installation on a home already subject to a 2019 deed of trust. Under Business & Commerce Code § 9.334, who has priority in the array?",
    ["The array financer — a purchase-money security interest in fixtures perfected by a fixture filing before the goods become fixtures or within 20 days after has priority over an earlier real-property encumbrancer.",
     "The mortgage lender — first recorded always wins against later filings.",
     "Neither — no security interest can exist in anything attached to a home.",
     "The homeowner chooses which creditor prevails."],
    "Section 9.334 gives a purchase-money fixture filing made before affixation or within 20 days after priority even over an earlier recorded real-property encumbrancer. The 12-day filing is inside the window. Ordinary building materials, by contrast, merge into the realty beyond any Article 9 interest."),

  /* ── T03 Interests in Real Estate ─────────────────────────────────────────────────── */

  item("FX014", "T03U1",
    "Modern Texas ownership is described as allodial, yet a fee simple owner still holds subject to four residual sovereign powers. Which list names them?",
    ["Taxation, eminent domain, police power, and escheat.",
     "Taxation, zoning, recording, and probate.",
     "Eminent domain, adverse possession, foreclosure, and partition.",
     "Police power, homestead, community property, and escheat."],
    "The allodial owner's title is complete against private claimants but remains subject to the sovereign's four residual powers — taxation, eminent domain, police power and escheat — each of which the course meets again as tax liens, condemnation, land-use regulation and the end of the intestacy ladder."),

  item("FX015", "T03U1",
    "A city rezones a commercial corridor, reducing what an owner may build, and pays nothing. A neighbouring parcel is taken outright for a road, and the owner is compensated. What distinction do the two events illustrate?",
    ["Police power regulates use without taking title and is not compensated; eminent domain takes property for public use and requires compensation.",
     "Both are escheat, differing only in amount.",
     "Both are takings; the city simply chose not to pay the first owner.",
     "Zoning is a private restrictive covenant, not a governmental power."],
    "Regulation under the police power — zoning, codes, platting — is uncompensated; a taking under eminent domain is compensated. The line between them is heavily litigated, which is why a licence holder describes land-use restrictions and never opines on their validity."),

  item("FX016", "T03U2",
    "A Texas deed conveys 'to Maria Ortiz' with no words of duration, inheritance or condition. Under Property Code § 5.001, what estate does Maria take?",
    ["Fee simple — a conveyed estate is a fee simple unless limited by express words or a lesser estate passes by construction or operation of law, and words of inheritance are unnecessary.",
     "A life estate, as the conservative default.",
     "A tenancy at will until the grantor clarifies.",
     "Nothing — 'and her heirs' was required."],
    "Texas's default is maximal: silence means fee simple, and § 5.001 expressly dispenses with the ancient words of inheritance. A lesser estate must be spelled out or arise by operation of law."),

  item("FX017", "T03U2",
    "A deed reads 'to Dr. Chen for her life, then to the county hospital district.' Which statement correctly names the interests and the life tenant's duty?",
    ["Dr. Chen holds a life estate and must not commit waste; the district holds a remainder — a present, transferable interest with possession postponed.",
     "Dr. Chen holds fee simple; the district holds nothing until she chooses to convey.",
     "Both hold the property as tenants in common during her life.",
     "The district holds a possibility of reverter that returns the land to the grantor."],
    "A life estate is measured by a life; the life tenant possesses and owes the future-interest holder the duty not to commit waste. Because the future interest was granted to a third person, it is a remainder, and Property Code § 5.041 lets a deed create such future estates as freely as a will."),

  item("FX018", "T03U3",
    "A rural parcel is crossed by a mowed strip under a transmission line, and the neighbouring landlocked tract's owner drives daily across a gravel path on the parcel. Which classification best fits the two uses?",
    ["The transmission strip suggests an easement in gross held by the utility; the neighbour's access suggests an easement appurtenant — or an unresolved claim by necessity or prescription — serving the landlocked dominant tract.",
     "Both are licences, revocable at the owner's whim.",
     "Both are encroachments that a survey will remove.",
     "The strip is an easement appurtenant and the driveway an easement in gross."],
    "An easement in gross serves a person or company — the utility line — while an easement appurtenant serves a dominant parcel and passes with it; a landlocked neighbour's long use raises necessity, implication or prescription questions that only title work and counsel resolve."),

  item("FX019", "T03U3",
    "A seller says the neighbour's family 'has always been allowed' to cross the back pasture to reach a fishing pond, and asks whether that matters to the sale. What is the accurate frame?",
    ["Permission ordinarily creates only a licence — personal and revocable — but long, open use raises the question whether a prescriptive easement has arisen, which is a title and survey matter for professionals, not for the agent's assurance.",
     "Long-tolerated permission automatically becomes an easement after one year.",
     "A spoken permission binds all future owners as a covenant.",
     "Neighbourly use of land can never affect title."],
    "A licence is a mere permission, personal and ordinarily revocable — but buyers routinely mistake tolerated use for a right, and years of open use point toward prescription; the licence holder discloses the facts and routes the question rather than declaring the answer."),

  item("FX020", "T03U4",
    "On what date does the property tax lien attach to a Texas parcel, and what must a taxing unit file to perfect it?",
    ["It attaches automatically on January 1 of each year to secure the year's taxes, penalties and interest, and § 32.01 makes it perfected on attachment with no filing, recording or notice required.",
     "It attaches when the tax bill is mailed, and is perfected by recording in the deed records.",
     "It attaches on the delinquency date, perfected by a court judgment.",
     "It attaches only if the taxes become delinquent for a full year."],
    "Tax Code § 32.01 attaches the lien on January 1 in favour of each taxing unit with power to tax the parcel, and subsection (d) declares it perfected on attachment without further action — which is why virtually every Texas closing happens under a live tax lien."),

  item("FX021", "T03U4",
    "A parcel carries subdivision covenants recorded in 1990, a deed of trust recorded in 2012, and an owners'-association assessment lien from 2024. This year's tax lien attached January 1. Under Tax Code § 32.05, how does the tax lien rank, and what survives a tax foreclosure?",
    ["The tax lien outranks the deed of trust and the association lien regardless of their earlier creation, but is inferior to the pre-existing recorded covenants — so the covenants survive a tax sale while the junior liens are subject to elimination.",
     "The 2012 deed of trust outranks the tax lien because it was recorded first.",
     "Everything recorded before January 1 outranks the tax lien.",
     "A tax foreclosure wipes out covenants and liens alike."],
    "Section 32.05 gives the tax lien priority over homestead interests, prior lienholders and association assessment liens regardless of when they arose, excepting only certain estate claims and restrictive covenants and easements recorded before January 1 of the lien year — encumbrances that define the property rather than compete for its value."),

  item("FX022", "T03U5",
    "A cabinet shop specially fabricates built-ins for a remodel under contract with the general contractor. The project collapses before delivery. Does the shop have mechanic's lien protection under Property Code § 53.021?",
    ["Yes — the statute extends the lien to one who specially fabricates material even if the material is never delivered, and to those contracting through a contractor or subcontractor, not only with the owner.",
     "No — a lien requires delivery and incorporation into the improvement.",
     "No — only those in privity with the owner may claim a lien.",
     "Yes, but only if the owner personally ordered the cabinets."],
    "Section 53.021 reaches labour and materials furnished under contract with the owner or the owner's agent, contractor or subcontractor, and expressly covers specially fabricated material even if never delivered — part of why recent construction on a listing means potential claimants the records do not yet show."),

  item("FX023", "T03U5",
    "A $40,000 business judgment against a seller has been abstracted into the county records. The seller's only property in the county is the family's 6-acre urban homestead. What is the judgment's practical effect on a sale of the home?",
    ["A general judgment is not on § 41.001's list of encumbrances that may be fixed on a homestead, so it never validly attached to the exempt home — but resolution of the title company's concern is counsel's work, not the agent's assurance.",
     "The judgment must be paid in full at closing because it was recorded first.",
     "The judgment automatically forecloses the homestead after one year.",
     "Judgments attach to homesteads but only up to half their value."],
    "An abstracted judgment is a general, involuntary lien on the debtor's non-exempt real property — and the homestead is not non-exempt property. A credit-card or business judgment cannot force the sale of a Texas homestead; how the title company clears the issue is for it and counsel."),

  item("FX024", "T03U6",
    "A working ranch's value turns on irrigation. The seller says 'the place has water rights — we've always pumped from the creek.' What does the taught framework require the agent to understand?",
    ["Flowing water in a natural watercourse is state property used only under rights granted through the state's permitting system, so the documented authority to take water — not the physical presence of water — is what must be verified.",
     "Creek water belongs to whoever has pumped it longest.",
     "Riparian frontage carries automatic ownership of the stream and its water.",
     "Water rights transfer informally with possession of the land."],
    "Under Water Code § 11.021 the stream's ordinary flow is the property of the state; private use runs through the appropriation-permit system. On working land the question is never whether water is present but what documented authority exists to take it — answered from permits, not the seller's memory."),

  item("FX025", "T03U6",
    "How does Texas law treat percolating groundwater under a parcel, as this course teaches it?",
    ["As part of the landowner's property, historically governed by the rule of capture — the owner may pump what the owner's wells produce — with modern management layered on through local groundwater conservation districts.",
     "As state property identical to the water of flowing streams.",
     "As federal property administered by the national government.",
     "As owned by the county in which the parcel lies."],
    "Groundwater is different in kind from surface water in watercourses: it is treated as the landowner's, under the rule of capture, managed in much of the state by conservation districts that permit and space wells — and a working well is not proof of a right to pump indefinitely."),

  item("FX026", "T03U7",
    "A lender proposes to take a lien on a family's homestead to secure the husband's unsecured business line of credit. Under Property Code § 41.001, can a valid lien be fixed on the homestead for this debt?",
    ["No — the homestead is exempt from seizure for creditors' claims except the closed statutory list (purchase money, taxes, properly contracted work and material, owelty, refinance, the constitutional home-equity loan, and reverse mortgage), and a general business debt is not on it.",
     "Yes — any lien the owner voluntarily signs is valid against a homestead.",
     "Yes, if the lender records first.",
     "No, unless the debt exceeds the home's value."],
    "Section 41.001(b) is a closed list: every valid homestead encumbrance either created, preserved, improved or adjusted the property interest, or is a constitutionally supervised borrowing. A voluntary lien for an unlisted debt does not attach, which is why homestead lending is a specialised, rule-bound practice."),

  item("FX027", "T03U7",
    "A single adult claims a rural homestead across two non-contiguous parcels totalling 130 acres. Under Property Code § 41.002, how much is protected?",
    ["100 acres — the rural homestead of a single adult is capped at 100 acres, which may lie in one or more parcels; the excess is reachable by creditors.",
     "All 130 acres — rural homesteads have no acreage cap.",
     "None — a rural homestead must be one contiguous parcel.",
     "10 acres, the cap that applies to every homestead."],
    "Section 41.002 allows 200 rural acres for a family and 100 for a single adult, in one or more parcels that need not be contiguous; the caps limit exempt quantity, so a claim beyond them is protected only up to the cap. The 10-acre figure is the urban cap, where the lots must be contiguous."),

  item("FX028", "T03U7",
    "A seller with a recorded judgment against him sells his exempt homestead and holds the proceeds while shopping for the next home. Under § 41.001(c), what protects the money?",
    ["The homestead claimant's sale proceeds are not subject to seizure for a creditor's claim for six months after the date of sale — a window in which they can be reinvested in a new homestead.",
     "Nothing — protection ends the moment the home sells.",
     "The proceeds are protected indefinitely once the home was exempt.",
     "The proceeds are protected only if held by the title company."],
    "Section 41.001(c) extends the shield past the sale: proceeds are exempt from seizure for six months, giving the seller a lawful path from one homestead to the next — with the timing a matter for the seller's counsel, not the agent's assurance."),

  item("FX029", "T03U7",
    "A 70-year-old owner asks what the residence homestead exemption removes from her school district taxation under the Tax Code text taught in this course. What does § 11.13 provide?",
    ["A $140,000 exemption of appraised value from school taxes for an adult's residence homestead, plus a further $60,000 for an owner who is disabled or 65 or older — with the dollar figures always verified against the current statute.",
     "A flat 50 percent reduction in all property taxes.",
     "Complete exemption from every taxing unit after age 65.",
     "A $3,000 school exemption and nothing more."],
    "In the text as held, § 11.13(b) grants $140,000 off school-district taxation for the residence homestead and § 11.13(c) adds $60,000 for an owner disabled or 65 or older; the $3,000 figure is the county exemption under § 11.13(a). The figures are the Legislature's to change, so the current statute is always the source."),

  /* ── T04 Legal Description ────────────────────────────────────────────────────────── */

  item("FX030", "T04U1",
    "A contract describes the property only as '508 Live Oak Street, Abilene, a corner lot roughly 80 by 150.' Why does this description fail, and what is the licence holder's correct move?",
    ["An address plus estimated dimensions identifies no boundaries a stranger could locate on the ground; the description is copied exactly from the prior deed or title commitment, never drafted or improved by the agent.",
     "It fails only because the square footage was not computed; adding it cures the defect.",
     "It is sufficient — Texas accepts any description the parties understand.",
     "It fails because it lacks the tax parcel number, which is the legal description."],
    "A legal description must let a stranger find the boundaries from the words alone; addresses are postal conveniences and parcel numbers an appraisal district's filing system. The agent's discipline is transmission: copy the existing description exactly and route any doubt to the title company or a surveyor."),

  item("FX031", "T04U1",
    "Texas land descriptions ultimately hang from a fabric unlike most states'. Which statement describes it?",
    ["Texas kept its public lands at statehood, so the federal township-and-section survey was never extended over it; land is described by reference to original surveys identified by grantee name, survey number and abstract number.",
     "Texas adopted the federal rectangular survey in 1876 and describes land by township and range.",
     "All Texas land is described by lot and block from statewide plats.",
     "Texas descriptions are informal because no original surveys exist."],
    "Because Texas retained its public lands, the government survey system never applied; the state's fabric is original grants across three sovereign eras, indexed by the General Land Office's abstract numbers, and every modern description ultimately ties back to that fabric."),

  item("FX032", "T04U1",
    "An 1888 deed in a chain calls a boundary 'North 950 varas along the creek.' A flyer for the same land advertises '950 feet of creek frontage.' What error has the flyer made?",
    ["It mistook varas for feet: at 36 varas to 100 feet, 950 varas is roughly 2,639 feet, so the boundary is advertised at about a third of its length.",
     "None — the vara and the foot are interchangeable in Texas records.",
     "It overstated the frontage, since a vara is shorter than a foot.",
     "It used the wrong unit; varas measure area, not distance."],
    "The vara — the Spanish yard of Texas land records, treated as 33 1/3 inches so that 36 varas equal 100 feet — still measures old calls, and Natural Resources Code § 21.041 directs field notes to observe it. A 950-vara call is about 2,639 feet; confusing the units misplaces a boundary by nearly two-thirds."),

  item("FX033", "T04U1",
    "Traced on paper, a metes-and-bounds description's calls end 60 feet short of the point of beginning, and the stated distance of one call conflicts with a found iron rod. Which two doctrines from this course govern?",
    ["A description must close — failure to close may defeat the conveyance and is a surveyor-and-title problem — and in a conflict of calls, monuments generally control over courses and distances, with stated area the weakest call.",
     "The agent adjusts the deficient call so the tract closes, then records the correction.",
     "Stated acreage controls over both monuments and distances.",
     "An unclosed description is cured automatically by the county clerk on filing."],
    "The construction hierarchy prefers monuments over courses and distances, and courses and distances over stated area; and a description that fails to close may fail entirely. Under no circumstances does a licence holder adjust a call — descriptions are drafted by surveyors and lawyers, transmitted by agents."),

  item("FX034", "T04U1",
    "A landowner outside any municipality plans to sell the back 25 acres of an 80-acre tract 'by metes and bounds in the deed — no plat needed.' What does Local Government Code § 232.001 say?",
    ["Dividing a tract outside a municipality into two or more parts triggers the platting requirement, and the statute expressly provides that a division by metes-and-bounds description in a deed, contract for deed or executory contract is still a division.",
     "Deed descriptions are exempt from platting if the parcel exceeds 10 acres.",
     "Platting applies only inside city limits.",
     "A plat is optional whenever both parties agree in writing."],
    "Section 232.001 requires the owner of a tract outside a municipality who divides it into two or more parts to have a plat prepared — describing the subdivision by metes and bounds, tying it to an original survey corner, stating dimensions, acknowledged like a deed and filed with the county clerk — and it closes the old deed-description evasion by name."),

  item("FX035", "T04U2",
    "Natural Resources Code § 21.041 prescribes the contents of a surveyor's field notes for public land. Which set matches the statute as taught?",
    ["The county; the authority for the survey and a true description; field notes with calls and connections for identification, observing the Spanish measurement by varas; a diagram; State Plane Coordinate values for the beginning point; field personnel; date; and the surveyor's signature.",
     "Only a sketch and the acreage, certified by the county clerk.",
     "The owner's name, the sale price, and the tax parcel number.",
     "GPS coordinates alone, since monuments are obsolete."],
    "The statutory anatomy doubles as a reader's guide to any Texas survey: authority, true description, vara-observing calls and connections, diagram, State Plane Coordinates with zone and reference station, personnel, date and signature — with coordinates supplementing, never replacing, the monument-and-call fabric."),

  item("FX036", "T04U2",
    "A creek averaging 40 feet in width from its mouth crosses a listed ranch. Why does Natural Resources Code § 21.001's definition matter to the listing?",
    ["A stream retaining an average width of 30 feet from the mouth up is navigable, and beds of navigable streams belong to the state — so where private land stops at the water is a surveyor's and lawyer's question with a statutory measuring stick.",
     "Streams over 30 feet wide may not be crossed by fences.",
     "Navigability determines only whether boats may use the stream.",
     "The definition affects mineral rights but never boundaries."],
    "Section 21.001 defines a navigable stream by the 30-foot average-width test, and because navigable streambeds are state-owned, the test decides the private boundary at the water — 'navigable' is a title question, not a canoeing observation."),

  item("FX037", "T04U2",
    "A new survey shows the neighbour's fence standing 15 feet inside the surveyed boundary of a listed farm, enclosing a strip the neighbour has cultivated for years. What is the licence holder's correct handling?",
    ["Disclose the discrepancy as an unresolved boundary and possible adverse-possession matter for the title company, surveyor and counsel — never declare who owns the strip.",
     "Assure the buyer the fence controls, since fences fix boundaries after five years.",
     "Assure the seller the survey controls and the neighbour's use is irrelevant.",
     "Move the fence before closing so the survey and the ground agree."],
    "Fence-line discrepancies are the everyday survey mismatch: fences follow convenience, not calls, and long-acquiesced fences raise exactly the adverse-possession and boundary questions the limitation statutes govern. The survey reveals the problem; resolving it is professional work the agent routes, with disclosure in writing."),

  /* ── T05 How Home Ownership is Held ───────────────────────────────────────────────── */

  item("FX038", "T05U1",
    "Three unrelated investors take a Texas deed to a duplex with no other agreement. One dies. Under the taught default and Estates Code § 101.002, where does the decedent's share go?",
    ["To the decedent's heirs or devisees — co-owners without a written survivorship agreement hold as tenants in common in effect at death, and the interest passes as if severed.",
     "To the two surviving co-owners automatically.",
     "To the co-owner who has paid the most expenses.",
     "To the state, until the survivors buy it back."],
    "Tenancy in common is the Texas default whenever two or more take title without more, and § 101.002 provides that a deceased joint owner's interest does not survive to the remaining owners but passes by will or intestacy as if severed. Survivorship exists only by written agreement."),

  item("FX039", "T05U1",
    "A father and daughter want the family lake house to pass automatically to the survivor. What does Estates Code § 111.001 require, and what does it forbid inferring?",
    ["A written agreement among the joint owners that the deceased owner's interest survives to the survivors — and survivorship may not be inferred from the mere fact that property is held in joint ownership.",
     "A deed reciting 'as joint tenants,' which creates survivorship by itself in Texas.",
     "Nothing — survivorship is automatic between family members.",
     "A court order approving the survivorship arrangement in advance."],
    "Texas reverses the multi-state presumption: § 111.001 authorises survivorship only by the co-owners' written agreement and expressly bars inferring it from joint ownership alone — so 'joint tenants' on a deed, without the writing, still leaves the share passing to heirs or devisees."),

  item("FX040", "T05U2",
    "A property-management LLC lists and leases houses for various owners, collecting fees. Its three members are all individually licensed sales agents. Under Occupations Code § 1101.351(a-1), is anything missing?",
    ["Yes — a business entity acting as a broker must hold its own broker licence; the members' individual licences do not cover brokerage conducted through the entity.",
     "No — an entity is covered by any one member's licence.",
     "No — entities cannot hold licences, so the members' licences must suffice.",
     "Yes — each tenant must individually consent to entity management."],
    "The Act defines business entities by reference to the Business Organizations Code and requires an entity that acts as a broker to be licensed itself; brokerage through an entity is not covered by the humans' licences alone. Internal dealings with the entity's own real estate, by contrast, sit outside the Act."),

  item("FX041", "T05U3",
    "During marriage, a spouse buys a boat and a rent house, each titled in that spouse's name alone. In a later dispute, who bears what burden under Family Code § 3.003?",
    ["Property possessed by either spouse during or on dissolution of marriage is presumed community, and the spouse claiming separate character must prove it by clear and convincing evidence — title in one name does not answer the question.",
     "Title controls: whatever is in one spouse's name is that spouse's separate property.",
     "Each spouse owns exactly half of every asset regardless of source.",
     "The presumption is separate property, rebuttable by any evidence."],
    "Section 3.002 makes property acquired during marriage community unless § 3.001 makes it separate (premarital, gift, devise, descent, most personal-injury recoveries), and § 3.003 presumes community from possession during marriage, rebuttable only by clear and convincing evidence. Title is not classification."),

  item("FX042", "T05U4",
    "A listing intake shows title vested in 'R. Flores, Trustee of the Flores Family Trust.' Who signs the contract and deed, and what must the title company see?",
    ["The trustee — who holds legal title under Property Code § 111.004's express-trust definition — signs in the fiduciary capacity, and the title company will require the trust instrument or its certification to verify the current trustee's authority to sell.",
     "The beneficiaries — they are the true owners and convey directly.",
     "Either the trustee or any adult beneficiary, interchangeably.",
     "The settlor, whose signature overrides the trust."],
    "An express trust splits legal title (trustee) from benefit (beneficiary); the trustee contracts and conveys, in the named fiduciary capacity, with authority proved from the instrument. A deed of trust, despite the name, is a mortgage instrument and not a trust — § 111.003 excludes it expressly."),

  item("FX043", "T05U5",
    "An investor considers a rental with gross scheduled rents of $30,000, expected vacancy and collection loss of $1,500, and operating expenses of $9,500. Debt service will be $15,000. Which figure is the property's net operating income?",
    ["$19,000 — gross income minus vacancy and operating expenses, computed before financing.",
     "$4,000 — the amount left after debt service.",
     "$30,000 — the scheduled rents themselves.",
     "$28,500 — rents minus vacancy only."],
    "NOI is effective gross income (rents less vacancy and collection loss) minus operating expenses: $30,000 − $1,500 − $9,500 = $19,000. Debt service comes out afterward to produce cash flow — $4,000 here — because NOI measures the property's earning power before financing."),

  item("FX044", "T05U5",
    "Why is leverage described in this course as a knife edge rather than a benefit?",
    ["Borrowed money multiplies outcomes in both directions — it raises the return on equity when the property's yield exceeds the loan's cost, and it deepens losses and can produce negative cash flow when the relationship reverses.",
     "Because lenders prohibit leverage on investment property.",
     "Because leverage affects only the downside, never the upside.",
     "Because leveraged property cannot appreciate."],
    "Leverage lets modest equity control a larger asset, so gains and losses both accrue on the whole asset against a small equity base: a 3% value move on a 25%-equity position is a 12% equity move, in either direction — and a decline steep enough erases the equity while the debt remains."),

  item("FX045", "T05U6",
    "A fourplex is priced at $450,000 with NOI of $27,000. An investor would put $90,000 down, and after debt service the property's annual cash flow would be $3,600. Compute the cap rate and the cash-on-cash return, on the correct bases.",
    ["Cap rate 6.0% (NOI over price, no financing) and cash-on-cash 4.0% (cash flow over cash invested, financing included).",
     "Cap rate 4.0% and cash-on-cash 6.0%.",
     "Both measures are 6.0%, computed on price.",
     "Cap rate 30% — NOI over the down payment."],
    "Cap rate compares properties: $27,000 / $450,000 = 6.0%, unlevered. Cash-on-cash compares equity positions: $3,600 / $90,000 = 4.0%, financing included. Mixing the bases — comparing one property's cap rate to another's cash-on-cash — is the error the discipline forbids."),

  item("FX046", "T05U6",
    "A flyer advertises a '7.5% cap rate' computed as gross scheduled rent divided by price. What is wrong, and what does the honest first step of any projection review require?",
    ["Cap rate is NOI over price — vacancy and operating expenses must come out of rents first — and every projection shown to a client should carry its assumptions on its face, labelled as estimates.",
     "Nothing — gross rent over price is the standard cap-rate formula.",
     "The flyer should have used cash flow after debt service over price.",
     "Cap rates may not appear in advertising at all."],
    "A cap rate computed on gross rents ignores vacancy and expenses and overstates yield. The professional discipline is sensitivity and candour: figures are estimates based on stated assumptions, said on the page — the difference between client education and sales talk."),

  item("FX047", "T05U7",
    "A client asks her agent whether owning a rental will 'save her on taxes.' What is the professional formulation this course prescribes?",
    ["'Ownership may have significant tax consequences; a qualified tax professional can tell you what they are for your situation' — describing specific tax outcomes to a client is tax advice the licence holder does not give.",
     "A summary of current federal deduction rules, since agents may explain any law.",
     "An estimate of her tax savings based on her bracket.",
     "A promise that rentals always reduce taxes."],
    "The course draws a deliberate line: federal income-tax consequences are governed by the Internal Revenue Code and change with it, and the only federal tax rules taught are the two imposing duties on transactions themselves (FIRPTA withholding and the REMIC structure). Everything else is referred, verbatim if need be."),

  item("FX048", "T05U7",
    "Beyond appreciation, which channel converts a rental owner's debt into equity on a fixed schedule, and what funds it?",
    ["Amortisation — each level payment retires a sliver of principal on a schedule that accelerates over the loan's life, funded in a rental by the tenants' rent.",
     "Inflation, which erases the debt automatically.",
     "Leverage, which increases equity without payments.",
     "Depreciation, which repays the lender directly."],
    "Amortisation is the quieter, surer channel: level payments shift from mostly interest toward mostly principal over the term — 'forced saving' funded by rent in an income property. It is a structure, not a promise, and describing structures accurately with gains and losses in the same sentence is the taught standard."),

  item("FX049", "T05U8",
    "A promoter assembling 'Bluebonnet Flats LLC' plans paid social-media ads to attract passive investors, aiming for about 50 members. Against Government Code §§ 4001.068 and 4005.012, what has he misjudged?",
    ["Both fence posts of the private limited offering: the exemption requires sales without any public solicitation or advertisement, and either no more than 35 security holders after the sale or sales to not more than 15 persons in the trailing 12 months buying for their own account.",
     "Nothing — LLC interests are never securities.",
     "Only the advertising; the exemption has no numeric limits.",
     "Only the member count; advertising is always permitted."],
    "Passive fractional interests in a promoter-managed pool sit within § 4001.068's sweeping definition (investment contract, participation certificate), so their sale needs registration or an exemption; § 4005.012's private limited offering forbids public solicitation and caps holders at 35 (or 15 purchasers in 12 months). Paid ads and 50 members leave both conditions behind — the promoter's securities counsel's problem, and the licence holder's cue to stay on the real estate side of the line."),

  item("FX050", "T05U9",
    "Under Business Organizations Code § 200.001, what is a Texas real estate investment trust, organisationally?",
    ["An unincorporated trust formed by one or more trust managers under Chapter 200 and the code's general provisions — a distinct Texas entity type, with federal tax law separately supplying the REIT qualification rules.",
     "A corporation chartered by the state's insurance regulator.",
     "A general partnership of at least one hundred investors.",
     "A federal entity that Texas law does not recognise."],
    "Section 200.001 defines the Texas REIT as an unincorporated trust formed by trust managers under Chapter 200; the federal Internal Revenue Code then supplies the tax architecture. REIT shares are securities in investors' hands — buying them is investing, not brokerage."),

  item("FX051", "T05U10",
    "Under 26 U.S.C. § 860A, what single tax feature defines the REMIC, and what did it make possible?",
    ["The REMIC is not itself subject to taxation — its income is taxable to the holders of interests in it — and that entity-level transparency made the secondary market's mortgage securitisation machinery possible.",
     "REMIC income is taxed twice, at the entity and the holder level.",
     "REMICs pay a flat federal entity tax in exchange for state exemption.",
     "REMIC interests are tax-free to all holders."],
    "Section 860A makes the conduit transparent: no entity-level tax, income taxed to interest holders. That lets mortgage pools pass cash flows to investors without an entity tax — the premise of securitisation, and the reason a borrower's 'mortgagee' of record may be a book-entry system while servicing is a separate industry."),

  /* ── T06 Real Estate Contracts ────────────────────────────────────────────────────── */

  item("FX052", "T06U1",
    "For a $2,000 fee, a landowner grants an investor the right to purchase a tract at a fixed price within six months; the investor promises nothing further. Classify the arrangement.",
    ["An express, unilateral contract — the optionor is bound to sell if the optionee elects, and on exercise a bilateral sales contract arises on the option's terms.",
     "A bilateral contract, since both parties signed.",
     "An implied contract arising from conduct.",
     "A void agreement for want of mutual promises."],
    "An option is the classic unilateral contract: a promise exchanged for an act (and the fee already paid), binding the optionor while leaving the optionee free to let it die. Exercise converts it into a bilateral purchase contract on the stated terms."),

  item("FX053", "T06U1",
    "Both parties admit on video that they orally agreed to sell a ranch. A 17-year-old signed a lease the same week. Which pair of classifications is correct?",
    ["The oral ranch agreement is unenforceable over a statute-of-frauds defence though genuinely made; the minor's lease is voidable at the minor's election while binding the adult party.",
     "Both agreements are void from the outset.",
     "The oral agreement is valid and enforceable because it was admitted; the lease is void.",
     "The oral agreement is voidable; the lease is unenforceable."],
    "An admitted oral land contract is real but cannot be enforced against a party who signed no writing — candour is not a writing. A minor's contract is voidable, not void: the protection runs one way, to the minor."),

  item("FX054", "T06U2",
    "Tuesday: Seller counters Buyer's offer at $310,000. Wednesday: before that counter is received, Seller signs an acceptance of a second buyer's offer. Thursday: Buyer receives and accepts the outstanding counter, and acceptance is communicated. What resulted?",
    ["Two enforceable contracts to sell one house — the Wednesday acceptance did not revoke the counter because revocation must be communicated, so Thursday's acceptance of a live counter formed a second contract.",
     "One contract only, with the second buyer — signing first controls.",
     "One contract only, with Buyer — a counter cannot be revoked once made.",
     "No contract with anyone until Seller chooses."],
    "A counteroffer kills the original offer and creates a new one; an offer or counter dies by revocation only when the revocation is communicated before acceptance. Uncommunicated paper created a lawyer's emergency — which is why counters are withdrawn in writing, communicated, before other offers are accepted."),

  item("FX055", "T06U2",
    "A landlord and tenant orally agree to a nine-month lease; the next year they orally extend for two more years. Under Business & Commerce Code § 26.01, which agreement is enforceable?",
    ["The nine-month lease — only a lease longer than one year falls within the statute of frauds; the two-year oral extension is unenforceable over a statute-of-frauds defence.",
     "Both — leases are outside the statute of frauds entirely.",
     "Neither — every lease must be written.",
     "The two-year term, because performance began."],
    "Section 26.01 requires a writing signed by the person to be charged for a contract for the sale of real estate and for a lease longer than one year. A month-to-month or nine-month oral lease is fine; the two-year oral term is the classic unenforceable agreement — plan as if it does not exist."),

  item("FX056", "T06U2",
    "A buyer signs a written offer; the seller accepts orally in front of witnesses, then refuses to close. The buyer sues. Under § 26.01's signature rule, what result?",
    ["The seller wins — enforcement runs against 'the person to be charged,' and the seller signed nothing; the buyer's signed offer binds the buyer, not the seller.",
     "The buyer wins — witnesses substitute for a signature.",
     "The buyer wins — one party's signature binds both.",
     "The contract is void, so neither party ever had rights."],
    "The writing must be signed by the person to be charged (or that person's authorised representative), making enforcement asymmetric: a writing signed by one party alone may bind that party and not the other. Oral acceptance, however well witnessed, leaves the seller unbound."),

  item("FX057", "T06U3",
    "A seller repudiates a contract to convey a unique hill-country tract in a rising market. Why is specific performance characteristically available, and what limitation period applies under CPRC § 16.004?",
    ["Land's uniqueness makes money presumptively inadequate for a particular parcel, so a buyer can often compel conveyance — and suit for specific performance of a contract to convey real property must be brought within four years.",
     "Specific performance is never available for land; damages are exclusive.",
     "It is available, but only within one year of breach.",
     "It is available only when the contract expressly allows it."],
    "Uniqueness — Module 01's economics becoming law — grounds the specific-performance remedy, and § 16.004 sets a four-year limitations period for it, alongside debt, fraud and breach of fiduciary duty. 'It's been years' is a fact for a lawyer to evaluate, not a reassurance."),

  item("FX058", "T06U3",
    "A buyer defaults, and the seller elects to keep the $5,000 earnest money as liquidated damages, then also sues for the full price difference. What principle does the second step ignore?",
    ["Election of remedies — the liquidated-damages election is a contract choice made in place of proving actual loss; remedies aiming at incompatible outcomes are elected, not stacked.",
     "Mitigation — a seller need never re-market after default.",
     "Rescission — keeping the deposit rescinds the contract automatically.",
     "Nothing — a seller may always pursue every remedy simultaneously."],
    "Liquidated damages are an amount fixed in advance as the remedy; the seller who takes the earnest money has chosen it. Alongside election sits mitigation: the injured party acts reasonably to limit loss, as by re-marketing the property."),

  item("FX059", "T06U4",
    "A seller of a single-dwelling residence delivers the Property Code § 5.008 disclosure notice five days after the contract's effective date. What right did the late delivery hand the buyer?",
    ["Termination for any reason within seven days after receiving the notice — a walk-away the seller never priced, which is why the notice belongs in the buyer's hands on or before the effective date.",
     "A price reduction equal to any undisclosed defect.",
     "Nothing — the notice is advisory only.",
     "Automatic rescission of the contract by operation of law."],
    "Section 5.008(f) requires delivery on or before the effective date; when a binding contract is made without it, the purchaser may terminate for any reason within seven days after receiving it. The notice itself is a disclosure of the seller's knowledge — not a warranty — and marking an item 'unknown' is compliance."),

  item("FX060", "T06U4",
    "Twenty days into a contract, the buyer's loan is denied. Whether the buyer exits with the earnest money or has defaulted turns on which distinction from this course?",
    ["Condition versus covenant — if a financing contingency existed and its terms, deadlines and notice mechanics were satisfied, the condition failed and performance is excused; missed mechanics can convert the exit into default.",
     "Bilateral versus unilateral contracts.",
     "Express versus implied contracts.",
     "Valid versus void agreements."],
    "A covenant is a promise whose breach is default; a condition is a gate whose failure excuses performance without fault. The financing contingency is a condition with deadlines and notice requirements — which is why every deadline is calendared the day the contract goes effective."),

  item("FX061", "T06U4",
    "The buyer never delivered the promised earnest money. The seller announces 'no deposit, no contract.' Is the seller right?",
    ["No — earnest money is a performance-assurance deposit, not the consideration; the contract formed on the exchange of promises, and the failure to deliver the deposit is a breach of a covenant with whatever consequences the contract attaches.",
     "Yes — a contract cannot exist until the deposit clears.",
     "Yes — earnest money is the consideration for a sales contract.",
     "No — because earnest money is optional, its absence has no consequences at all."],
    "The promises themselves are the consideration; recited nominal consideration is a drafting convention and courts do not weigh adequacy. The undelivered deposit does not un-form the contract — it breaches a covenant, a different and answerable question."),

  item("FX062", "T06U4",
    "During a contested termination, the buyer's agent tells her client 'you'll get your earnest money back, no problem — the title company is holding it.' What two things has the agent misstated?",
    ["The escrow agent is a neutral stakeholder who disburses only on the parties' signed release or prescribed procedures — holding the funds signals nothing about entitlement — and predicting the outcome is answering a contract-construction question that belongs to the documents and, if contested, to lawyers.",
     "Nothing — custody of funds determines their destination.",
     "Only the timing: refunds are automatic but slow.",
     "Only the holder: brokers, not title companies, hold deposits."],
    "The earnest money's life cycle runs promised, delivered, held, credited or released — held by the escrow agent for both parties, never in a broker's operating account, never disbursed on one side's demand. 'The title company is holding it' is a neutral fact, not a prediction."),

  item("FX063", "T06U5",
    "Who drafts and who adopts the contract forms Texas licence holders must ordinarily use, under Occupations Code § 1101.155?",
    ["The Texas Real Estate Broker-Lawyer Committee prepares them and the Commission adopts and promulgates them by rule — with licence holders using the promulgated forms for standard transactions.",
     "Each brokerage drafts its own forms, filed annually with the Commission.",
     "The Legislature enacts each contract form as a statute.",
     "The title insurance industry publishes the forms."],
    "Section 1101.155 authorises rules requiring licence holders to use forms prepared by the Broker-Lawyer Committee and adopted by the Commission. The architecture: committee drafts, Commission promulgates, licence holders fill blanks — and custom drafting belongs to owners and their lawyers."),

  item("FX064", "T06U5",
    "A production builder requires its own attorney-drafted purchase agreement on all sales. May a buyer's agent transact on it, and with what advisory posture?",
    ["Yes — the Commission may not prohibit use of a form prepared by the property owner or prepared by an attorney and required by the owner; the buyer should be told in writing that the promulgated protections are absent and attorney review is available.",
     "No — only promulgated forms may ever be used.",
     "Yes, and no advisory duty arises because the form is lawful.",
     "Only if the Commission pre-approves the builder's form."],
    "Section 1101.155's protected categories are owner-prepared forms and attorney-prepared forms required by the owner. What changes is posture, not permission: the buyer proceeds on the owner's paper knowing whose paper it is."),

  item("FX065", "T06U5",
    "A team leader hands new agents a 'standard net-sale agreement' he wrote himself 'to save time.' What is the correct response?",
    ["Decline it — a licence holder's home-made contract sits in neither of § 1101.155's protected categories, and using it is the unauthorized practice of law the promulgated system exists to prevent.",
     "Use it once the team leader initials each page.",
     "Use it for cash transactions only.",
     "Use it if every client signs a waiver."],
    "The protected drafters are owners and their counsel, never the licence holder. The correct instruments are the promulgated forms or the parties' attorneys' documents — and declining the team leader's paper is not optional."),

  item("FX066", "T06U5",
    "Clients ask their agent to write three special provisions: (a) 'Washer, dryer and refrigerator convey'; (b) 'Seller warrants the foundation for five years'; (c) 'Contingent on Buyer's brother approving by Friday.' Which may the agent write?",
    ["Only (a) — a factual statement of items conveying; (b) is drafted legal warranty language for an attorney, and (c) is a bespoke condition the form's option period should handle or an attorney should draft.",
     "All three — special provisions exist for exactly these requests.",
     "(a) and (b), because warranties are factual.",
     "None — agents may never write in the special-provisions blank."],
    "The special-provisions discipline: factual business terms may be filled in; language that creates, modifies or waives legal rights — warranties, indemnities, bespoke contingencies — is legal drafting. The promulgated library (including the purchased option period) exists so the blank can stay small."),

  item("FX067", "T06U5",
    "A buyer must sell her current home before she can close on the next one. What is the required route for that term, and why not a hand-written sentence?",
    ["The promulgated sale-of-other-property addendum — where a promulgated addendum handles a contingency, it is the required route, and a hand-written paraphrase is both UPL-adjacent and worse drafting.",
     "A special-provisions sentence, since the fact is simple.",
     "An oral side agreement between the agents.",
     "A separate letter signed only by the buyer."],
    "Fluency with the promulgated library is a matching skill: sale-of-other-property, HOA, financing addenda each own their facts. The duplication test asks whether an addendum already exists — if so, it is used, completed rather than paraphrased."),

  item("FX068", "T06U5",
    "An agent explains to a buyer what the form's option paragraph does — the days it buys and the unilateral termination right — and then is asked whether a disputed repair amendment 'legally obligates' the seller. Where is the line?",
    ["Explaining what provisions do procedurally is the agent's job; interpreting contested legal meaning is counsel's — the agent urges the parties to read the form and take legal advice on the dispute.",
     "Agents may answer both questions; contracts are their domain.",
     "Agents may answer neither question; only lawyers discuss contracts.",
     "The agent may interpret the amendment if she drafted it."],
    "The taught posture: advise the reading, not the law. Deadlines, options and notices are procedure an agent explains; contested meaning is interpretation, which is legal advice — the same boundary that keeps special provisions factual."),

  /* ── T07 Estates, Transfers and Titles ────────────────────────────────────────────── */

  item("FX069", "T07U1",
    "Under Property Code § 5.021, which three things must a conveyance of a freehold estate satisfy?",
    ["It must be in writing, subscribed (signed) by the conveyor or the conveyor's authorised agent, and delivered.",
     "It must be notarised, witnessed by two persons, and filed within ten days.",
     "It must recite consideration, bear a seal, and use words of inheritance.",
     "It must be recorded, surveyed, and title-insured."],
    "Section 5.021 is the Texas conveyancing core: writing, subscription, delivery. Acknowledgment qualifies a deed for recording (§ 12.001) but is not what makes it valid between the parties, and § 5.001 dispenses with words of inheritance."),

  item("FX070", "T07U1",
    "A deed says only 'grant, sell and convey,' with the warranty paragraph struck. Under Property Code §§ 5.022 and 5.023, what promises, if any, ride with it?",
    ["Unless the conveyance provides otherwise, 'grant' or 'convey' implies that the grantor has not previously conveyed the estate to another and that it is free from encumbrances — and § 5.022 confirms a covenant of warranty is not required for a valid conveyance.",
     "None — striking the warranty removes every promise a deed can carry.",
     "A full general warranty, which cannot be struck.",
     "Only a promise that the description is accurate."],
    "Warranty is optional (§ 5.022(b)), but § 5.023 implies two covenants from the operative words themselves — no prior conveyance, no encumbrances — unless express contrary language negates them, and the implied covenant is independently actionable."),

  item("FX071", "T07U2",
    "A 2014 forged deed sits upstream in a chain. In 2020 the then-owner conveyed to the present holder by special warranty deed. The true owner now surfaces. What does the special warranty grantor owe the evicted holder?",
    ["Nothing on the warranty — a special warranty deed promises only against defects arising by, through or under the grantor, and the forgery arose earlier; the holder's practical protection is an owner's title policy.",
     "Full indemnity — every warranty deed covers all defects whenever arising.",
     "Half the loss, split between the parties by statute.",
     "Return of the price, because special warranty deeds are quitclaims."],
    "Warranty grades allocate loss, never change what passes: general warranty covers defects from any time; special warranty only those arising under the grantor; a quitclaim asserts nothing. The forged-deed hypothetical is why Texas practice leans on title insurance over covenants."),

  item("FX072", "T07U3",
    "A deed is signed and delivered but never acknowledged before a notary. What is its status between the parties, and at the county clerk's counter?",
    ["Valid between the parties — acknowledgment is a recording prerequisite, not a validity requirement — but it cannot be recorded, so it radiates no constructive notice and leaves the grantee exposed under § 13.001.",
     "Void everywhere — an unacknowledged deed conveys nothing.",
     "Recordable anyway, since the clerk does not judge instruments.",
     "Valid only if a court later ratifies it."],
    "Property Code § 12.001 admits instruments to record when acknowledged, sworn with a proper jurat, or proved; the unacknowledged deed still conveys between the parties but cannot enter the records — and the unrecorded conveyance is the § 13.001 gamble."),

  item("FX073", "T07U3",
    "A tract lies mostly in one county with a sliver across the line. Where must instruments affecting it be recorded to be effective, and who maintains the order that decides priority races?",
    ["In the county where a part of the property is located — careful practice files in both — and the county clerk must record qualifying instruments in the order filed and maintain the indexes chains are searched by.",
     "In the state capital's central land registry.",
     "In whichever county has the lower filing fee.",
     "With the appraisal district of the larger county."],
    "Property Code § 11.001 fixes the where — recording in the wrong county records nothing — and § 11.004 fixes the operator: the clerk records in the order filed, gives receipts, and maintains the indexes; the clerk does not judge validity, which is why examination is a profession."),

  item("FX074", "T07U4",
    "Seller deeds a lot to A, who delays recording. Seller then deeds the same lot to B, who pays market price knowing nothing of A and records at once. Then Seller deeds it again to C, a nephew, as a gift. Under Property Code § 13.001, who owns the lot?",
    ["B — an unrecorded conveyance is void as to a subsequent purchaser for valuable consideration without notice; C's gift would not have qualified, because the statute's protection requires paying value.",
     "A — first in time always prevails in Texas.",
     "C — the most recent deed controls.",
     "A and B share it equally."],
    "Section 13.001 voids the unrecorded deed against the value-paying, notice-free subsequent purchaser while leaving it binding on the parties, heirs, and takers who paid nothing or had notice. Record immediately; search always — the records bind you whether or not you looked."),

  item("FX075", "T07U4",
    "Before buying, a purchaser tours the property and finds someone other than the record owner living there, but asks no questions. Why might § 13.001's protection be lost?",
    ["Visible possession inconsistent with record title is the classic fact demanding inquiry — notice of any kind, actual, constructive or inquiry-type, defeats the 'without notice' requirement.",
     "It cannot be lost — only the deed records give notice.",
     "Because touring a property waives all recording protections.",
     "Because occupants always own what they occupy."],
    "The recording statutes charge the world with constructive notice of the records (§ 13.002), but a purchaser's protection also fails on actual notice and on facts demanding investigation — the occupant who is not the record owner, the worn path across the land."),

  item("FX076", "T07U4",
    "How does Texas title insurance differ from an attorney's opinion on an abstract, and what makes its pricing unusual?",
    ["A policy is indemnity against past defects — the insurer pays covered losses and defends claims whether or not anyone erred, even for the flawless examination that missed a forged link — and the premium is promulgated by the state's insurance regulator, so rates do not vary company to company.",
     "The opinion insures against loss; the policy is merely advice.",
     "Both are identical except the policy costs whatever the market bears.",
     "The policy guarantees future value; the opinion covers the past."],
    "Insurance Code § 2501.003 defines title insurance as indemnity against loss from liens, encumbrances and defects — protection against the past — and defines the promulgated premium to include examination and closing charges. An opinion's recourse is professional negligence; a policy pays without fault."),

  item("FX077", "T07U4",
    "A title commitment arrives with a list of requirements and a list of exceptions. How does a professional read the two lists?",
    ["Requirements are tasks with owners and deadlines — what must happen before the policy issues; exceptions are what the policy will not cover if issued, each a disclosure conversation with the buyer before objections close — and the commitment is an offer to insure, not a statement that title is good.",
     "Both lists are boilerplate that closing automatically clears.",
     "Requirements bind the buyer; exceptions bind only the seller.",
     "Exceptions are defects the insurer promises to cure."],
    "The commitment operationalises marketable title: releases, probate papers and authority documents appear as requirements; the parcel's recorded burdens and the standard exceptions appear as exceptions. The insurer may be pricing a risk the buyer should be refusing."),

  item("FX078", "T07U5",
    "A chain of title contains, in sequence, an executor's deed, a trustee's deed after a foreclosure sale, and a condemnation decree. What does each announce, per the taught map of transfers?",
    ["Each names its family of transfer event — death with administration, involuntary transfer by the secured creditor's remedy, and involuntary transfer by eminent domain — and therefore which supporting documents must exist to prove the event was done right.",
     "All three are interchangeable forms of voluntary sale.",
     "Each is a defect that voids the chain automatically.",
     "Only the executor's deed has legal significance."],
    "Ownership moves in four families — voluntary alienation, transfer at death, involuntary transfer, and natural forces at the boundary. Every unexplained name in a chain announces which event occurred; the diagnostic skill is demanding the documents that support it."),

  item("FX079", "T07U5",
    "Over thirty years a river gradually deposits soil against a ranch's bank; then one flood night it cuts a new channel through the pasture. What happened to the boundaries?",
    ["The gradual deposits (accretion) enlarged the riparian parcel and belong to the owner; the sudden channel change (avulsion) moved no boundary — the line stays where the old channel ran.",
     "Both events moved the boundary to the water's new location.",
     "Neither event can ever change a boundary.",
     "The flood transferred the crossed land to the state."],
    "Accretion — gradual addition — grows the parcel, and gradual erosion shrinks it; avulsion — sudden change — moves no boundary. On shifting rivers the deed and the ground drift apart, which is why rural transactions lean on current surveys."),

  item("FX080", "T07U6",
    "A typed will is signed by the testator and one witness aged 30. A second, entirely handwritten will is signed by the same testator with no witnesses at all. Under Estates Code §§ 251.051–.052, which is valid?",
    ["Only the handwritten one — a holographic will wholly in the testator's handwriting needs no witnesses, while the typed will fails the requirement of attestation by two or more credible witnesses at least 14 years old.",
     "Only the typed one — handwritten wills are invalid in Texas.",
     "Both — one witness suffices for any will.",
     "Neither — all wills require notarisation."],
    "Section 251.051 requires writing, the testator's signature (or another's at the testator's direction and in the testator's presence), and two credible witnesses of at least 14 signing in the testator's presence; § 251.052 preserves the holographic exception every title examiner knows."),

  item("FX081", "T07U7",
    "H dies intestate. The home is community property. H is survived by his wife W and by two children — one of the marriage, one from H's prior relationship. Under Estates Code § 201.003, who owns the home now?",
    ["W keeps her own community half; H's half passes to his descendants — the two children take it in equal shares — so W owns one-half and each child one-quarter.",
     "W owns the whole home, as the surviving spouse always does.",
     "The children own it all, subject to W's right to live there.",
     "W owns three-quarters and the stepchild one-quarter."],
    "The intact-family rule sends the decedent's community half entirely to the surviving spouse only when all the decedent's descendants are also the spouse's. A child of another relationship breaks it: the decedent's half passes to the decedent's descendants — the classic blended-family surprise."),

  item("FX082", "T07U7",
    "W dies intestate owning separate-property land, survived by her husband and three children, one of whom predeceased her leaving two children of his own. Under §§ 201.002 and 201.101, state the interests.",
    ["The husband takes a life estate in one-third of the land; the land passes to the descendants subject to it — the two living children take one-third each, and the deceased child's third drops to his two children, one-sixth each, per capita with representation.",
     "The husband takes the land outright; the children take nothing.",
     "All takers share equally: one-quarter each to husband and three lines.",
     "The two living children split everything; the grandchildren take nothing."],
    "For separate land with children surviving, § 201.002 gives the spouse a life estate in one-third; § 201.101 distributes among descendants per capita with representation — nearest degree takes equally, a deceased taker's share drops to that taker's own descendants."),

  item("FX083", "T07U8",
    "A mother signs a deed to her son, tells no one, and keeps it in her desk. It is found at her death. Did the deed convey the land?",
    ["No — a deed conveys nothing until delivered with intent to pass title presently; the land passes under her will or the intestacy statutes, not the drawer deed.",
     "Yes — signing alone completes a conveyance.",
     "Yes — death substitutes for delivery.",
     "Only if the son pays the estate for it."],
    "Delivery is where deeds fail invisibly: a signed deed in the grantor's drawer conveys nothing, and an instrument meant to take effect at death must satisfy the will formalities. Gift deeds skip the closing table's discipline, which is why delivery problems cluster around them."),

  item("FX084", "T07U9",
    "A possessor claims land under a recorded quitclaim, has cultivated it and paid the taxes for eight years. Which adverse-possession statute, if any, is available under CPRC §§ 16.024–.026?",
    ["Only the ten-year statute's bare-possession route — § 16.025(b) expressly disqualifies a quitclaim as the duly registered deed for the five-year clock, and a quitclaim asserting no title is not title or color of title for the three-year clock.",
     "The three-year statute — eight years more than covers it.",
     "The five-year statute — deed, use and taxes are all present.",
     "None — quitclaim holders can never adversely possess."],
    "The five-year statute requires cultivation or use, tax payment, and claim under a duly registered deed — with quitclaims and forged deeds excluded; the three-year statute needs title or color of title. What remains is § 16.026's ten-year bare-possession clock, which eight years has not yet run."),

  item("FX085", "T07U9",
    "A pipeline company cannot agree on damages with a landowner and files a condemnation petition. Under Property Code § 21.012, what must the petition affirm beyond describing the property and naming the owner?",
    ["That the entity and the owner could not agree on damages, that the entity provided the owner the landowner's bill of rights statement, and that it made a bona fide offer to acquire the property voluntarily — with the public use stated with specificity.",
     "Only that the project has federal funding.",
     "That the owner consented to the taking in advance.",
     "That the property is vacant and unencumbered."],
    "Section 21.012 forces a real negotiation before the courthouse: specific public use, named owner, described property, failure to agree, the bill-of-rights statement, and a bona fide offer. A pending or threatened condemnation is a material fact, and valuation in condemnation is specialist work."),

  /* ── T08 Mortgages and Promissory Notes ───────────────────────────────────────────── */

  item("FX086", "T08U1",
    "A Texas home loan is built from two instruments. Which statement assigns each its job?",
    ["The promissory note is the debt — the borrower's promise to repay; the deed of trust is the security — the borrower's grant of a lien with a power of sale to assure the note's payment.",
     "The deed of trust is the debt and the note is the security.",
     "Both instruments create identical obligations, duplicated for safety.",
     "The note conveys title to the lender until the loan is repaid."],
    "The note answers what is owed; the deed of trust answers what happens to the property if it is not paid. Keeping the jobs separate organises the whole module — including whose signature creates which exposure."),

  item("FX087", "T08U1",
    "In Property Code § 51.0001's vocabulary, match the parties to a Texas deed-of-trust loan.",
    ["The mortgagor is the borrower-grantor of the security instrument; the mortgagee is its holder or beneficiary — expressly including a book-entry system; the mortgage servicer is the party the borrower is instructed to pay; and the trustee or substitute trustee exercises the power of sale.",
     "The mortgagor is the lender and the mortgagee the borrower.",
     "The trustee is the borrower's attorney, appointed at default.",
     "The servicer must always be the same entity as the mortgagee."],
    "Section 51.0001 defines the cast: mortgagor (borrower), mortgagee (holder — a book-entry system qualifies, securitisation's accommodation), servicer (whom the borrower pays), trustee and substitute trustee (who conduct the sale). The three-party structure with a power of sale is why Texas foreclosure needs no lawsuit."),

  item("FX088", "T08U1",
    "Under Property Code § 51.002, name the day, hours and place the statute fixes for a power-of-sale foreclosure.",
    ["A public auction between 10 a.m. and 4 p.m. on the first Tuesday of a month, at the county courthouse of the county where the land is located, with the section's stated accommodations.",
     "Any weekday at the property itself, at the trustee's convenience.",
     "The last Friday of the month at the sheriff's office.",
     "The first Monday of the quarter at the title company."],
    "'First Tuesday at the courthouse' is § 51.002, not folklore: 10 a.m. to 4 p.m., first Tuesday, county courthouse (the commissioners court may designate a public sale area, holidays move it to the first Wednesday), which is why Texas foreclosure moves in weeks rather than years."),

  item("FX089", "T08U1",
    "For a lien on the debtor's residence, walk § 51.002's two notice stages in order.",
    ["First, the servicer's written cure notice by certified mail giving at least 20 days to cure before any notice of sale may be given; then at least 21 days' notice of sale, given three ways at once — posted at the courthouse door, filed with the county clerk, and served by certified mail on each debtor obligated on the debt.",
     "A single 10-day notice by regular mail.",
     "Thirty days' newspaper publication, nothing more.",
     "No notice — the power of sale operates automatically on default."],
    "Section 51.002(d) requires the 20-day cure notice; § 51.002(b) requires 21 days' notice of sale by posting, filing and certified mail. Service by mail is complete on deposit, the day of sale is excluded from the count — roughly six weeks of statutory notice stands between a residential default and the courthouse steps."),

  item("FX090", "T08U1",
    "At a second-lien foreclosure, the property sells for $120,000. It carries current-year taxes, a $95,000 first-lien deed of trust, the foreclosing second lien owed $70,000, and a later-recorded $25,000 judgment lien. What does the purchaser take, and where does the money go?",
    ["The purchaser takes title subject to the tax lien and the first lien, which survive; proceeds pay costs of sale, then the foreclosing second lien, then junior claims in priority order, any surplus to the borrower — and the judgment lien is extinguished against the land, left to look to the proceeds.",
     "The purchaser takes free of everything, including the first lien.",
     "The proceeds pay the first lien before the foreclosing second.",
     "The judgment lien survives the sale and follows the land."],
    "A foreclosure sale extinguishes interests junior to the foreclosed lien and leaves seniors in place. Priority in foreclosure is the order of the queue at the pay window — which is what recording order and § 32.05's tax super-priority were establishing all along."),

  item("FX091", "T08U1",
    "A foreclosure nets $210,000 against a $270,000 debt. The borrower proves the property's fair market value at the sale date was $262,000, and the lender collected $10,000 of private mortgage guaranty insurance. Under Property Code § 51.003, compute the recoverable deficiency and the deadline to sue.",
    ["The $60,000 deficiency is offset by the $52,000 excess of value over price, leaving $8,000, and the $10,000 insurance credit extinguishes it — recoverable deficiency zero — with any action required within two years of the sale.",
     "$60,000, due within four years.",
     "$52,000, due within one year.",
     "$8,000, with no limitations period."],
    "Section 51.003 gives the deficiency action a two-year clock and lets any person sued elect a fair-market-value determination; value over price offsets the deficiency, and guaranty-insurance money is credited against the borrower's obligation — the statute's design against the double squeeze."),

  item("FX092", "T08U1",
    "A distressed owner deeds her home to the lender in lieu of foreclosure. A second-lien home-improvement loan and a recorded judgment exist. What did the lender acquire?",
    ["Title still burdened by the junior liens — no foreclosure occurred, so nothing was extinguished, which is why lenders title-search first and often refuse encumbered deeds in lieu.",
     "Clean title — a deed in lieu wipes juniors exactly like a sale.",
     "No title at all — deeds in lieu are void in Texas.",
     "Title free of the judgment but subject to the second lien."],
    "The deed in lieu is a negotiated conveyance, not a foreclosure: it does not by itself wipe junior liens. The short sale, reinstatement, modification and forbearance complete the distressed menu — and negotiating a short sale for compensation is itself a licensed broker act."),

  item("FX093", "T08U1",
    "A homeowner in default is offered this deal: 'Deed me the house and I'll take over your payments — you can walk away.' What does the two-instrument structure say about her position afterward?",
    ["The deed conveys her title, but the note remains hers — the debt follows the person, not the house — so she surrenders the asset while keeping the liability, with the due-on-sale covenant available to accelerate on top; the shape of classic equity-skimming schemes.",
     "She is fully released — transferring title transfers the debt.",
     "The lender must consent to the deed, or it is void.",
     "Her credit is protected because payments continue."],
    "Whoever signs the note owes the debt; whoever signs the deed of trust pledges the property. A subject-to transfer separates them at the seller's peril, and the due-on-sale covenant makes the debt callable on unauthorised transfer — which is why such proposals route to lenders and lawyers."),

  item("FX094", "T08U2",
    "A $180,000 real estate lien note carries 6% annual interest with a level monthly payment of $1,079.19. Compute month one's interest and principal split.",
    ["Interest $900.00 ($180,000 × 6% ÷ 12); principal $179.19; new balance $179,820.81.",
     "Interest $1,079.19; principal $0 in the first year.",
     "Interest $540.00; principal $539.19.",
     "Interest $179.19; principal $900.00."],
    "The amortisation method is balance × periodic rate = interest; payment − interest = principal; balance − principal = new balance. Early payments are mostly interest, the mix reversing over decades — the honest arithmetic behind equity's slow early growth."),

  item("FX095", "T08U2",
    "A note is amortised as if over 30 years but matures in year seven with a large final payment. Another note's scheduled payments cover only interest. Name the structures.",
    ["A balloon note and an interest-only note, respectively — the balloon borrower must plan to refinance or pay the final sum, and the interest-only borrower builds no equity through amortisation.",
     "Both are negative-amortisation notes.",
     "A wraparound and an adjustable-rate note.",
     "Both are fully amortising notes with different rates."],
    "The variations on the fully amortising level-payment note: interest-only (principal waits), balloon (amortised long, due early), and negative amortisation, where payments fall short of accrued interest and the balance grows — a structure Texas polices in the consumer context."),

  item("FX096", "T08U2",
    "Finance Code § 343.001 defines the 'home loan' the chapter protects. Which loan is inside the definition?",
    ["A loan to individuals for personal, family or household purposes, secured wholly or partly by a manufactured home or by real property improved by a dwelling for four or fewer families, used or to be used as the borrower's principal residence.",
     "Any loan secured by Texas real estate, whatever the borrower or purpose.",
     "An investor's loan on a rental fourplex she has never occupied.",
     "A commercial loan on a twelve-unit apartment building."],
    "Three simultaneous tests draw the consumer perimeter: individual borrowers, personal purpose, and one-to-four family (or manufactured-home) security used as the principal residence. The investor's rental fails purpose and residence; the family homestead purchase sits inside."),

  item("FX097", "T08U2",
    "A lender proposes a high-cost home loan whose regular scheduled payments are less than accruing interest, 'to keep it affordable.' What does Finance Code § 343.203 say?",
    ["A high-cost home loan may not provide a payment schedule with regular periodic payments that cause the principal balance to increase — scheduled negative amortisation is banned — except where the borrower seeks a temporary forbearance, bridge loan or restructure.",
     "Negative amortisation is permitted if disclosed in bold type.",
     "The ban applies only to adjustable-rate loans.",
     "Texas does not regulate home-loan payment structures."],
    "Section 343.203's ban patrols the loan structures that strip equity from the households least able to lose it. The licence holder does not administer the chapter — but knowing the perimeter exists produces the one correct sentence: 'that's a question for your lender and your lawyer, in writing.'"),

  item("FX098", "T08U2",
    "An old deed of trust from 1999 appears in the records with no release. The seller insists 'that loan was paid off decades ago.' Why is the seller's memory not the answer?",
    ["The deed of trust is recorded but the note is not — the records show the lien's existence, never the debt's live balance — so a released lien means a recorded release, and payoffs run on the lender's payoff statement, not on assumptions.",
     "Because liens expire automatically after twenty years.",
     "Because the county clerk certifies payoff status on request.",
     "Because notes are recorded and can be checked directly."],
    "The structural fact that keeps examiners oriented: lien public, debt private. An unreleased deed of trust is a live title requirement however ancient the loan, and the balance comes from the lender's payoff statement with per-diem interest through its good-through date."),

  item("FX099", "T08U2",
    "An adjustable-rate note names an index, a 2.75% margin, an initial fixed period, and per-adjustment and lifetime caps. What is the honest sentence about the borrower's future rate?",
    ["'If the index stands at X at your reset, your rate becomes X plus your 2.75% margin, subject to your caps' — every term is printed in the note, and the lender's written disclosures, not the agent's memory, supply the numbers.",
     "'Your rate can never rise more than 1% total.'",
     "'The lender chooses each new rate at its discretion.'",
     "'Adjustable rates always end up cheaper than fixed.'"],
    "Index plus margin equals the new rate at each adjustment, bounded by caps and floor; all four moving parts are printed in the note. The accurate client sentence is always conditional, sourced to the documents."),

  item("FX100", "T08U2",
    "A parent co-signs a child's note but never appears on the deed; the other parent signs the deed of trust at closing but not the note. Who risks what?",
    ["The note-signing parent owes the debt — including any lawful deficiency — though owning nothing; the deed-of-trust-signing parent pledged the property interest without promising payment. Which paper each person signs decides what each person risks.",
     "Both parents are equally liable for the debt and equally own the home.",
     "Neither parent has any exposure without both signatures.",
     "Only the person on the deed can ever owe the lender."],
    "The note binds people; the deed of trust binds property. The four signature combinations produce four different exposures, and family transactions walk through all of them unaware — a conversation for the lender and a lawyer before the signing table."),

  item("FX101", "T08U3",
    "A foreign person sells a Texas rental for $500,000. Under 26 U.S.C. § 1445(a), who must act, and in what amount?",
    ["The buyer must deduct and withhold 15 percent of the amount realized — $75,000, computed on the gross price, not the seller's gain — and a buyer who fails to withhold is personally exposed for the amount.",
     "The seller withholds 15 percent of her profit.",
     "The title company withholds 10 percent of the equity.",
     "No one — foreign sellers handle their own taxes after closing."],
    "FIRPTA drafts the buyer as collection agent: 15 percent of the amount realized, the transferee's duty. Because the base is the gross price, thin-equity foreign sales can find the withholding exceeding the seller's net — which is why the facts must surface at intake, not at the table."),

  item("FX102", "T08U3",
    "In the ordinary domestic sale, why does FIRPTA never surface at closing?",
    ["Because § 1445(b) removes the withholding duty when the transferor furnishes a non-foreign affidavit — a sworn statement with the seller's taxpayer identification number that the seller is not a foreign person — a routine document in the closing stack.",
     "Because FIRPTA applies only to commercial property.",
     "Because domestic sales are exempt from all federal law.",
     "Because the deed itself certifies the seller's status."],
    "The FIRPTA affidavit is the everyday escape: the ordinary domestic seller swears away the buyer's withholding duty, which is why the issue is invisible in most transactions — and visible the moment residency is 'complicated.'"),

  item("FX103", "T08U3",
    "A buyer will occupy the modest house she is purchasing from a foreign seller for $280,000. Which § 1445(b) exemption may apply, and with what caution?",
    ["The residence exemption — no withholding where the transferee acquires the property for use as a residence and the amount realized does not exceed $300,000 — with the figure verified against the current statute, never recited from memory in a live transaction.",
     "The qualifying-statement exemption, automatic for owner-occupants.",
     "No exemption exists below any price.",
     "The domestic-corporation affidavit, filed by the buyer."],
    "Section 1445(b)(5) keeps modest owner-occupant purchases out of the machinery; § 1445(b)(4)'s qualifying statement is the IRS-certified route for negotiated reductions, and § 1445(b)(3) lets a non-publicly-traded domestic corporation swear its shares are not U.S. real property interests."),

  item("FX104", "T08U3",
    "A seller-LLC has foreign members. The listing agent is asked whether FIRPTA withholding will apply. What is the professional answer?",
    ["Entity status under FIRPTA is a tax-counsel question — the entity's classification, not its members' passports, drives the analysis — so the agent routes it to the closer and the entity's advisors now and gives no opinion on residency or amounts.",
     "No — LLCs are always domestic for FIRPTA.",
     "Yes — any foreign member triggers withholding automatically.",
     "The agent computes the withholding and quotes it."],
    "The agent's competence is knowing the issue exists on every sale, expecting the title company to obtain the affidavit or administer withholding, and flagging foreign-status facts early — with no opinions on residency, treaty status, or amounts: tax advice, every word."),

  /* ── T09 Closing Procedures ───────────────────────────────────────────────────────── */

  item("FX105", "T09U1",
    "A contract goes effective with a 7-day option period, a financing deadline, a title-objection window and a closing date. What professional habit does this course prescribe for that moment?",
    ["Calendar every deadline the day the contract goes effective, in writing, with reminders ahead of each — a condition's deadline missed by a day converts a protected exit into a default.",
     "Wait for the title company to track the dates.",
     "Track only the closing date; the rest are estimates.",
     "Rely on the lender's system for all deadlines."],
    "Closing is a deadline system: the contract schedules everything, and the licence holder's contribution is running that calendar so no right lapses unnoticed. Option days are calendar days spent, not saved — inspections book immediately."),

  item("FX106", "T09U1",
    "Two days before closing, a buyer receives an email 'from the title company' with updated wiring instructions. Which protocols does the taught standard of care require?",
    ["Treat any change to wiring instructions as presumptively fraudulent, obtain instructions only through a verified channel, and confirm every wire by phone to a number independently known — never one taken from the email that asked for the money.",
     "Follow the newest instructions, since closings often change accounts.",
     "Reply to the email asking for confirmation.",
     "Split the wire between the old and new accounts to be safe."],
    "Wire fraud through intercepted and spoofed email is the industry's most damaging crime, and a misdirected down payment is usually unrecoverable. Stating the protocols is not legal advice; it is the standard of care, repeated to every buyer."),

  item("FX107", "T09U1",
    "What is the walk-through for, and when is it worth the trouble?",
    ["It is the buyer's final verification that the property's condition and the agreed repairs match the contract — the last, cheap moment to catch what would be expensive the day after funding.",
     "It is a formality the contract requires but nothing turns on.",
     "It is the appraiser's final inspection for the lender.",
     "It replaces the option-period inspections."],
    "The walk-through sits at the end of the critical path — after title cure, survey, inspections, financing and insurance — precisely because problems found before funding are negotiations and problems found after funding are lawsuits."),

  item("FX108", "T09U1",
    "The lender issues a 'conditional approval.' What does the taught discipline require before the closing date is treated as real?",
    ["The conditions listed and owned — whose document, due when — chased to final underwriting clearance ('clear to close'), with a standing status pattern among agent, lender and escrow officer rather than 'we're fine' assurances.",
     "Nothing — conditional approval is approval.",
     "Only the buyer's verbal confirmation that all is well.",
     "A backup contract in case the loan fails."],
    "Financing is the critical path's longest pole. Conditional approval is a list of open items, each with an owner and a deadline; no closing date is real before clearance, however confidently scheduled."),

  item("FX109", "T09U2",
    "Who conducts most Texas closings, and in what capacity under Insurance Code § 2501.003?",
    ["Title companies through their escrow officers — defined by function: countersigning title forms, supervising preparation and delivery of forms, signing escrow cheques, and closing the transaction — as neutral stakeholders who advocate for no one and give no legal advice.",
     "The buyers' attorneys, who represent both parties at the table.",
     "The listing brokers, who disburse funds from their trust accounts.",
     "County clerks, at the recording counter."],
    "The escrow officer is a neutral executing the contract's and the lender's instructions; attorneys close some transactions and lender instructions govern funding everywhere. The licence holder attends, explains procedure, and routes legal questions."),

  item("FX110", "T09U2",
    "The parties have signed everything, but the lender has not yet funded and the buyer's wire has not arrived. The buyer asks for keys 'since we closed.' What is accurate?",
    ["Nothing has happened yet — a Texas closing is an escrow that breaks only when every condition of the contract and the lender's instructions is met; between signature and funding there is no conveyance, and possession passes per the contract at funding unless otherwise agreed.",
     "Signing is closing; the keys change hands at the table.",
     "The deed took effect when notarised.",
     "Possession always transfers at the walk-through."],
    "Signed documents and funds accumulate with the neutral until conditions are satisfied; only then do funds disburse and documents record. 'We signed' is not 'we closed' — the two-stage truth underneath both words."),

  item("FX111", "T09U2",
    "Immediately after funding, in what order do disbursement and recording proceed, and why the urgency on recording?",
    ["Payoffs, commissions and seller proceeds disburse down the statement's lines, and the deed and deed of trust go to the county clerk without delay — because § 13.001 protects the world against the unrecorded, and the funding-to-recording gap is the danger zone the industry compresses to hours.",
     "Recording waits thirty days for the ink to cure.",
     "Proceeds are held a week in case of buyer remorse.",
     "The order is arbitrary and varies by county."],
    "Module 07's law makes the order obvious: record immediately. After recording, the original deed returns to the grantee, the policies issue, and the file closes into retention — with a closing letter telling the parties what arrives from whom."),

  item("FX112", "T09U2",
    "At the table, the parties propose papering a $260,000 price for the lender while privately agreeing the buyer will pay $285,000. What is the licence holder's obligation?",
    ["Refuse in the room, out loud — every term of the parties' real agreement appears on the statement the lender sees, and a double contract that shows one price to the lender is fraud territory.",
     "Note the side agreement in the file and proceed.",
     "Allow it if both parties sign a hold-harmless letter.",
     "Refer the question to the escrow officer and stay silent."],
    "What never flexes is the ledger's honesty. The closer implements only what the contract, amendments and lender instructions authorise — and a licence holder who facilitates a two-price closing has joined the fraud."),

  item("FX113", "T09U3",
    "What two consumer harms do RESPA's findings target, per 12 U.S.C. § 2601 as read for this course?",
    ["The lack of greater and more timely information on the nature and costs of the settlement process, and unnecessarily high settlement charges caused by certain abusive practices.",
     "Slow recording and inaccurate surveys.",
     "High interest rates and low appraisals.",
     "Unlicensed brokerage and forged deeds."],
    "Each of the Act's pillars answers one finding: itemised uniform disclosure answers the information failure, and § 2607's prohibitions answer the kickback economy — which is why the licence holder's referral relationships are federally regulated."),

  item("FX114", "T09U3",
    "What does 12 U.S.C. § 2603 require of the settlement disclosure in a covered transaction?",
    ["A single, integrated disclosure that conspicuously and clearly itemizes all charges imposed upon the borrower and all charges imposed upon the seller, and indicates whose interest each title insurance premium covers.",
     "A one-page summary of the loan's interest rate only.",
     "Separate, non-comparable statements from each provider.",
     "Disclosure to the seller alone."],
    "Section 2603 directs the integrated disclosure combining RESPA's settlement-cost statement with Truth in Lending's disclosures — the reason every financed closing produces a standardised, itemised accounting, comparable across lenders — with Regulation X (12 C.F.R. § 1024.6) adding the special information booklet at application."),

  item("FX115", "T09U3",
    "A lender offers a brokerage $150 per closed referral papered as a 'marketing fee'; separately, a listing broker pays a cooperating referral fee to the out-of-state broker who sent the client; and the brokerage part-owns a title agency it recommends with written disclosure, a charge estimate, and no required use. Under 12 U.S.C. § 2607, sort the three.",
    ["The per-referral 'marketing fee' violates § 2607(a) on both sides of the envelope; the agent-to-agent referral fee is expressly permitted; and the affiliated arrangement is lawful only on its conditions — disclosure, written estimate, no required use, and compensation limited to a return on ownership interest.",
     "All three are lawful marketing practices.",
     "All three violate RESPA equally.",
     "Only the agent-to-agent referral fee is prohibited."],
    "Section 2607 bans things of value for referrals of settlement business and fee splits not for services actually performed; § 2607(c) shelters payment for actual services, cooperative brokerage referrals, and conditioned affiliated business arrangements. Value keyed to referral volume is the thing the statute names, whatever the invoice says."),

  item("FX116", "T09U4",
    "On a closing statement, classify the buyer's new loan, the purchase price, and the seller's existing-loan payoff.",
    ["The loan is a buyer credit (money arriving on the buyer's behalf); the price is a buyer debit and a seller credit; the payoff is a seller debit (paid out of the seller's money at the table).",
     "All three are debits to the buyer.",
     "The loan is a buyer debit; the price is a seller debit.",
     "The payoff is a buyer credit because the buyer benefits."],
    "A debit is a charge against a party; a credit is money in a party's favour. Test any entry with 'whose money, which direction?' and the labels assign themselves — the price appearing once in each column with opposite signs is why the statement can reconcile."),

  item("FX117", "T09U4",
    "Closing is May 20; annual taxes are estimated at $5,400; the contract prorates on the 360-day method with the seller responsible through May 19. Compute the tax proration and its direction.",
    ["Per diem $15.00 ($5,400 ÷ 360); seller's share four 30-day months plus 19 days = 139 days × $15.00 = $2,085.00 — a buyer credit and seller debit, because the buyer will later pay the whole bill.",
     "$2,085.00 as a seller credit, since the seller prepaid the taxes.",
     "$2,100.00, using actual calendar days.",
     "No proration — taxes are the buyer's alone once title passes."],
    "Texas taxes are a lien from January 1 but billed late, so at mid-year closings the seller's elapsed share is credited to the buyer. The 360-day method uses twelve 30-day months; the statement states its method because the two conventions genuinely differ."),

  item("FX118", "T09U4",
    "A tenant-occupied duplex closes June 20. The seller collected June rent of $2,100 on June 1 and holds a $2,100 security deposit. The buyer owns June 20 onward (11 days of a 30-day month). Compute what moves to the buyer.",
    ["Rent proration: 11/30 × $2,100 = $770.00 as a buyer credit; the security deposit transfers to the buyer in full — it is the tenant's money changing custodians, never prorated.",
     "Rent $770.00 and half the deposit.",
     "Rent $1,330.00 — the seller's share moves to the buyer.",
     "Nothing — rents and deposits stay with whoever collected them."],
    "Prorations follow who holds money for whose period: the seller collected rent for days the buyer will own, so the buyer is credited; the deposit was never the seller's income and transfers whole."),

  item("FX119", "T09U4",
    "The same facts computed on the 365-day method give a different tax proration than the 360-day method. Why must the statement say which it used?",
    ["Because the methods legitimately diverge — a 360-day year of twelve 30-day months against actual calendar days — so the method is a stated contract term, not a rounding choice, and per diems carry extra decimal places before the final multiplication.",
     "Because federal law mandates the 365-day method.",
     "Because the county clerk rejects statements without the label.",
     "They never diverge; the label is tradition."],
    "The worked examples differ by real dollars on identical facts. The method and the allocation of the closing day are contract terms; 'through the day before closing' versus 'through closing' shifts every prorated line by one per diem."),

  item("FX120", "T09U4",
    "Reviewing a draft statement, an agent checks the price against the contract, the payoff against the lender's payoff statement, the commissions against the listing agreement, and the prorations against the tax certificate — then finds a fee the contract assigned to the seller charged to the buyer. What happens next?",
    ["The finding goes to the escrow officer in writing with the contract references — the statement is the closer's instrument, amended by the closer on documented instructions — and the corrected statement is re-reviewed before the parties see it.",
     "The agent corrects the statement directly and initials the change.",
     "The agent waives the error if the amount is small.",
     "The parties negotiate the fee orally at the table."],
    "Statement review is document-matching, not arithmetic-checking alone: each number has a source document it must match. Allocation errors are the most common find; the reviewer reviews, the instrument's author amends."),
]);

/* ── Load-time invariants: the bank refuses to load in any inconsistent state. ─────── */

const unitCodes = new Set(ALL_UNITS.map((unit) => unit.code));
const counts = new Map();
const seen = new Set();
for (const entry of FINAL_EXAM_BANK) {
  if (seen.has(entry.id)) throw new Error(`final bank: duplicate id ${entry.id}`);
  seen.add(entry.id);
  if (!unitCodes.has(entry.tests)) throw new Error(`final bank: ${entry.id} tests unknown unit ${entry.tests}`);
  if (!Array.isArray(entry.choices) || entry.choices.length !== 4) {
    throw new Error(`final bank: ${entry.id} must offer exactly four choices`);
  }
  if (entry.correctChoice !== 0) throw new Error(`final bank: ${entry.id} must author the correct answer first`);
  if (!entry.prompt || !entry.rationale) throw new Error(`final bank: ${entry.id} lacks prompt or rationale`);
  counts.set(entry.tests, (counts.get(entry.tests) ?? 0) + 1);
}
if (FINAL_EXAM_BANK.length !== 120) {
  throw new Error(`final bank: ${FINAL_EXAM_BANK.length} items against the manifest's 120`);
}
for (const unit of ALL_UNITS) {
  const expected = BLUEPRINT[unit.code];
  if (!expected) throw new Error(`final bank: unit ${unit.code} missing from the blueprint`);
  if ((counts.get(unit.code) ?? 0) !== expected) {
    throw new Error(`final bank: unit ${unit.code} carries ${counts.get(unit.code) ?? 0} items against a blueprint of ${expected}`);
  }
}
const blueprintTotal = Object.values(BLUEPRINT).reduce((sum, n) => sum + n, 0);
if (blueprintTotal !== 120) throw new Error(`final bank: blueprint totals ${blueprintTotal}`);

/* ── The four forms, composed here so the bank's default export is self-contained. ─────
   The blueprint-ordered bank is striped into six 20-item packets (item i to packet i mod 6), and
   each form is the union of three packets chosen so every pair of forms shares exactly one packet:
   every item sits on exactly two forms, every form carries 60 items, and any two forms overlap in
   exactly 20. The invariants live in principles-i-final-exam-forms.mjs alongside the
   administration proposals. */
const PACKET_COUNT = 6;
const PACKETS = Array.from({ length: PACKET_COUNT }, () => []);
FINAL_EXAM_BANK.forEach((entry, index) => { PACKETS[index % PACKET_COUNT].push(entry); });

export const FORM_PACKETS = Object.freeze({
  A: Object.freeze([0, 1, 2]),
  B: Object.freeze([0, 3, 4]),
  C: Object.freeze([1, 3, 5]),
  D: Object.freeze([2, 4, 5]),
});

export const FORMS_FULL = Object.freeze(
  Object.fromEntries(
    Object.entries(FORM_PACKETS).map(([form, packetIndexes]) => [
      form,
      Object.freeze(
        packetIndexes
          .flatMap((packet) => PACKETS[packet])
          .slice()
          .sort((a, b) => (a.id < b.id ? -1 : 1))
      ),
    ]),
  ),
);

export default Object.freeze({ items: FINAL_EXAM_BANK, forms: FORMS_FULL, blueprint: BLUEPRINT });
