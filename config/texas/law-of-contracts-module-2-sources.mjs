/**
 * Law of Contracts, Topic 02 — exact source reads and unit-level reliance.
 *
 * Each source→unit edge below must have a matching authored citation requirement, and each
 * authored citation requirement must resolve back to an exact held section read. Provider
 * frameworks are recorded separately so a teaching taxonomy cannot masquerade as Texas law.
 */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { TOPICS } from "./law-of-contracts-course-form.mjs";
import { FORM_READS } from "./law-of-contracts-form-read-register.mjs";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const INVENTORY_PATH = "texas/trec-sources/source-inventory.json";
const STATUTE_CATALOG_PATH = "texas/tx-law-of-contracts-30-v1/sources/statutes/catalog.json";
const BUSINESS_CATALOG_PATH = "texas/tx-law-of-contracts-30-v1/sources/business-organizations/catalog.json";
const FORM_CATALOG_PATH = "texas/tx-law-of-contracts-30-v1/sources/forms/catalog.json";
const MODULE_PATH = "texas/tx-law-of-contracts-30-v1/curriculum/module-02.md";

const inventory = JSON.parse(readFileSync(join(REPO_ROOT, INVENTORY_PATH), "utf8"));
const statuteCatalog = JSON.parse(readFileSync(join(REPO_ROOT, STATUTE_CATALOG_PATH), "utf8"));
const businessCatalog = JSON.parse(readFileSync(join(REPO_ROOT, BUSINESS_CATALOG_PATH), "utf8"));
const formCatalog = JSON.parse(readFileSync(join(REPO_ROOT, FORM_CATALOG_PATH), "utf8"));
const heldByPath = new Map(
  [...inventory.files, ...statuteCatalog.sources, ...businessCatalog.sources].map((entry) => [entry.path ?? entry.localCopy, entry]),
);
const formsById = new Map(formCatalog.forms.map((entry) => [entry.formId, entry]));

const read = (section, reliedOnByUnits, note) =>
  Object.freeze({ section, reliedOnByUnits: Object.freeze(reliedOnByUnits), note });

const source = (record) => {
  const held = record.formId ? formsById.get(record.formId) : heldByPath.get(record.localCopy);
  if (!held) throw new Error(`LOC Topic 02 source is not in a tracked acquisition catalog: ${record.localCopy}`);
  const trackedPath = record.formId ? held.localCopy : held.path ?? held.localCopy;
  if (trackedPath !== record.localCopy) throw new Error(`LOC Topic 02 source path differs from its tracked record: ${record.localCopy}`);
  const sectionsRead = Object.freeze(record.sectionsRead);
  return Object.freeze({
    ...record,
    sha256: held.sha256,
    bytes: held.bytes,
    readOn: "2026-08-31",
    reliedOnByUnits: Object.freeze([...new Set(sectionsRead.flatMap((entry) => entry.reliedOnByUnits))]),
    sectionsRead,
  });
};

const texasStatute = ({ id, code, chapter, title, localCopy, sectionsRead }) =>
  source({
    id,
    citation: `Tex. ${code} Code ch. ${chapter}`,
    title,
    authority: "Texas Legislature",
    publisher: "Texas Legislative Council",
    sourceLayer: "tcss.legis.texas.gov static resources",
    tier: "controlling",
    url: `https://tcss.legis.texas.gov/resources/${localCopy.split("/").at(-1).split(".")[0]}/htm/${localCopy.split("/").at(-1)}`,
    localCopy,
    sectionsRead,
  });

export const MODULE_2_SOURCES = Object.freeze([
  texasStatute({
    id: "loc2-oc-1101",
    code: "Occupations",
    chapter: "1101",
    title: "Real Estate Brokers and Sales Agents",
    localCopy: "texas/trec-sources/statutes/OC.1101.htm",
    sectionsRead: [
      read("1101.002", ["T02U1", "T02U2"], "Defines real estate for the licensing chapter as an interest in real property, including a leasehold, located in or outside Texas, but excludes an interest given as security for the performance of an obligation."),
    ],
  }),
  texasStatute({
    id: "loc2-pr-5",
    code: "Property",
    chapter: "5",
    title: "Conveyances",
    localCopy: "texas/trec-sources/statutes/PR.5.htm",
    sectionsRead: [
      read("5.001", ["T02U1", "T02U5"], "Provides the fee-simple presumption for an estate conveyed or devised unless the estate is expressly limited or a lesser estate is conveyed or devised by construction or operation of law."),
      read("5.041", ["T02U1", "T02U5"], "Allows a person to make an inter vivos conveyance of an estate of freehold or inheritance that commences in the future in the same manner as by will."),
    ],
  }),
  texasStatute({
    id: "loc2-bc-9",
    code: "Business and Commerce",
    chapter: "9",
    title: "Secured Transactions",
    localCopy: "texas/trec-sources/statutes/BC.9.htm",
    sectionsRead: [
      read("9.334", ["T02U3"], "Recognizes that goods may become fixtures, excludes ordinary building materials incorporated into an improvement from an Article 9 security interest, and states priority rules including the purchase-money fixture-filing window."),
    ],
  }),
  source({
    id: "loc2-form-20-19",
    formId: "20-19",
    citation: "TREC Form 20-19, page 1",
    title: "One to Four Family Residential Contract (Resale)",
    authority: "Texas Real Estate Commission official instrument",
    publisher: "Texas Real Estate Commission",
    sourceLayer: "official-instrument",
    tier: "instrument",
    effectiveDate: "2026-07-01",
    url: "https://www.trec.texas.gov/forms/one-four-family-residential-contract-resale",
    localCopy: "texas/tx-law-of-contracts-30-v1/sources/forms/20-19.pdf",
    sectionsRead: [
      read("page 1", ["T02U2", "T02U3"], "Page 1 was text-extracted and visually inspected. Reliance is limited to Paragraphs 1 and 2: the land description plus listed improvements and accessories, with exclusions requiring identification."),
    ],
  }),
  source({
    id: "loc2-cn-16",
    citation: "Tex. Const. art. XVI, § 15",
    title: "Separate and Community Property of Spouses",
    authority: "People of Texas",
    publisher: "Texas Legislative Council",
    sourceLayer: "tcss.legis.texas.gov static resources",
    tier: "controlling",
    url: "https://tcss.legis.texas.gov/resources/CN/htm/CN.16.htm",
    localCopy: "texas/trec-sources/statutes/CN.16.htm",
    sectionsRead: [
      read("16.15", ["T02U5"], "Defines a spouse's separate real and personal property at the constitutional level and authorizes written spouse-to-spouse partition or exchange and written conversion agreements, subject to the provision's terms."),
    ],
  }),
  texasStatute({
    id: "loc2-es-101",
    code: "Estates",
    chapter: "101",
    title: "Estate Assets in General",
    localCopy: "texas/trec-sources/statutes/ES.101.htm",
    sectionsRead: [
      read("101.002", ["T02U5"], "States the Texas default that a jointly held interest does not survive to the other joint owners and passes at death as though the decedent's interest had been severed."),
    ],
  }),
  texasStatute({
    id: "loc2-es-111",
    code: "Estates",
    chapter: "111",
    title: "Nonprobate Assets in General",
    localCopy: "texas/trec-sources/statutes/ES.111.htm",
    sectionsRead: [
      read("111.001", ["T02U5"], "Allows joint owners to agree in writing that a deceased joint owner's interest survives to the other joint owner or owners and bars inferring that agreement from joint ownership alone."),
    ],
  }),
  texasStatute({
    id: "loc2-es-112",
    code: "Estates",
    chapter: "112",
    title: "Community Property With Right of Survivorship",
    localCopy: "texas/trec-sources/statutes/ES.112.htm",
    sectionsRead: [
      read("112.051", ["T02U5"], "Authorizes spouses to agree that all or part of existing or after-acquired community property becomes the surviving spouse's property on death."),
      read("112.052", ["T02U5"], "Requires a community-property survivorship agreement to be written and signed by both spouses, supplies sufficient phrases, and rejects inference from account labels alone."),
    ],
  }),
  texasStatute({
    id: "loc2-pr-111",
    code: "Property",
    chapter: "111",
    title: "Texas Trust Code General Provisions",
    localCopy: "texas/trec-sources/statutes/PR.111.htm",
    sectionsRead: [
      read("111.003", ["T02U5"], "Limits the Trust Code term trust to an express trust and expressly excludes a business trust and security instruments such as a deed of trust, mortgage, or security interest."),
      read("111.004", ["T02U5"], "Defines an express trust as a fiduciary relationship in which the title holder has equitable duties to deal with property for another person's benefit or a qualifying purpose."),
    ],
  }),
  texasStatute({
    id: "loc2-bo-1",
    code: "Business Organizations",
    chapter: "1",
    title: "Definitions and Other General Provisions",
    localCopy: "texas/tx-law-of-contracts-30-v1/sources/business-organizations/BO.1.htm",
    sectionsRead: [
      read("1.002", ["T02U6", "T02U7"], "Defines organization, partnership, property, real estate investment trust, cooperative, and cooperative association for the Business Organizations Code; its owner definition is expressly limited to Titles 1, 7, and 8."),
    ],
  }),
  texasStatute({
    id: "loc2-bo-2",
    code: "Business Organizations",
    chapter: "2",
    title: "Purposes and Power of Domestic Entity",
    localCopy: "texas/tx-law-of-contracts-30-v1/sources/business-organizations/BO.2.htm",
    sectionsRead: [
      read("2.101", ["T02U6"], "Subject to exceptions elsewhere in the Code, gives a domestic entity individual-like powers, including acquiring, owning, selling, conveying, mortgaging, pledging, leasing, exchanging, or otherwise disposing of property and making contracts."),
    ],
  }),
  texasStatute({
    id: "loc2-bo-101",
    code: "Business Organizations",
    chapter: "101",
    title: "Limited Liability Companies",
    localCopy: "texas/tx-law-of-contracts-30-v1/sources/business-organizations/BO.101.htm",
    sectionsRead: [
      read("101.106", ["T02U6"], "Classifies an LLC membership interest as personal property and states that a member or assignee does not have an interest in any specific property of the company."),
    ],
  }),
  texasStatute({
    id: "loc2-bo-152",
    code: "Business Organizations",
    chapter: "152",
    title: "General Partnerships",
    localCopy: "texas/tx-law-of-contracts-30-v1/sources/business-organizations/BO.152.htm",
    sectionsRead: [
      read("152.101", ["T02U6"], "States that partnership property is not the partners' property and that neither a partner nor a partner's spouse has an interest in partnership property."),
      read("152.102", ["T02U6"], "Classifies partnership property from the acquisition name or disclosed partner capacity and partnership funds and supplies presumptions for property acquired in partners' names."),
    ],
  }),
  texasStatute({
    id: "loc2-bo-200",
    code: "Business Organizations",
    chapter: "200",
    title: "Real Estate Investment Trusts",
    localCopy: "texas/trec-sources/statutes/BO.200.htm",
    sectionsRead: [
      read("200.001", ["T02U6"], "Defines a Texas real estate investment trust for Chapter 200 as an unincorporated trust formed by one or more trust managers under Chapters 200 and 3 and managed under Chapter 200."),
    ],
  }),
  texasStatute({
    id: "loc2-pr-81",
    code: "Property",
    chapter: "81",
    title: "Condominiums Created Before Adoption of Uniform Condominium Act",
    localCopy: "texas/tx-law-of-contracts-30-v1/sources/statutes/PR.81.htm",
    sectionsRead: [
      read("81.0011", ["T02U7"], "Limits Chapter 81 generally to condominium regimes created before January 1, 1994, and points later regimes to Chapter 82."),
      read("81.101", ["T02U7"], "States how a pre-1994 condominium regime is created through a recorded master deed, master lease, or declaration satisfying the chapter."),
      read("81.107", ["T02U7"], "States that an apartment owner shares ownership of the regime's common elements with the other apartment owners and permits intended use without interfering with their rights."),
    ],
  }),
  texasStatute({
    id: "loc2-pr-82",
    code: "Property",
    chapter: "82",
    title: "Uniform Condominium Act",
    localCopy: "texas/tx-law-of-contracts-30-v1/sources/statutes/PR.82.htm",
    sectionsRead: [
      read("82.002", ["T02U7"], "States Chapter 82's general applicability to condominium declarations recorded on or after January 1, 1994, while making specified provisions applicable to older regimes."),
      read("82.051", ["T02U7"], "Provides that a condominium under Chapter 82 may be created only by recording a declaration executed like a deed by the required interest holders and preserves governmental platting and building-code authority."),
    ],
  }),
  texasStatute({
    id: "loc2-pr-221",
    code: "Property",
    chapter: "221",
    title: "Texas Timeshare Act",
    localCopy: "texas/tx-law-of-contracts-30-v1/sources/statutes/PR.221.htm",
    sectionsRead: [
      read("221.002", ["T02U7"], "Defines the Texas Timeshare Act's key terms, including accommodation, assessment, association, developer, managing entity, timeshare interest, and timeshare property."),
      read("221.041", ["T02U7"], "Creates a nonwaivable purchaser cancellation period ending before the sixth day after the later of signing and receiving the contract or receiving the required disclosure statement."),
    ],
  }),
  texasStatute({
    id: "loc2-pr-301",
    code: "Property",
    chapter: "301",
    title: "Texas Fair Housing Act",
    localCopy: "texas/trec-sources/statutes/PR.301.htm",
    sectionsRead: [
      read("301.021", ["T02U8"], "Prohibits specified sale-or-rental denials and discriminatory terms, conditions, services, or facilities because of the protected characteristics stated in the section."),
      read("301.022", ["T02U8"], "Prohibits a covered notice, statement, or advertisement that indicates a protected preference, limitation, discrimination, or intention."),
    ],
  }),
  source({
    id: "loc2-usc-42-3604",
    citation: "42 U.S.C. § 3604",
    title: "Discrimination in the Sale or Rental of Housing and Other Prohibited Practices",
    authority: "United States Congress",
    publisher: "Office of the Law Revision Counsel, U.S. House of Representatives",
    sourceLayer: "uscode.house.gov preliminary text",
    tier: "controlling",
    currentThrough: "2026-07-12",
    url: "https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title42-section3604",
    localCopy: "texas/trec-sources/federal/us42-3604.html",
    sectionsRead: [
      read("3604", ["T02U8"], "Read the federal sale, rental, advertising, availability, blockbusting, disability-discrimination, reasonable-modification, accommodation, and covered multifamily-design provisions as the federal counterpart to the Texas fair-housing layer."),
    ],
  }),
  texasStatute({
    id: "loc2-lg-211",
    code: "Local Government",
    chapter: "211",
    title: "Municipal Zoning Authority",
    localCopy: "texas/trec-sources/statutes/LG.211.htm",
    sectionsRead: [
      read("211.003", ["T02U8"], "Authorizes a municipality to regulate listed building dimensions, lot occupancy, yards and open space, density, uses of land and structures, and certain additional subjects, subject to the statute."),
    ],
  }),
  texasStatute({
    id: "loc2-pr-202",
    code: "Property",
    chapter: "202",
    title: "Construction and Enforcement of Restrictive Covenants",
    localCopy: "texas/trec-sources/statutes/PR.202.htm",
    sectionsRead: [
      read("202.001", ["T02U7", "T02U8"], "Defines dedicatory instrument and restrictive covenant for qualifying subdivisions, planned developments, condominium regimes, and townhouse regimes."),
      read("202.006", ["T02U8"], "Requires the property owners' association to file governing dedicatory instruments in county real-property records and states that a dedicatory instrument has no effect until filed."),
    ],
  }),
]);

export const MODULE_2_PROVIDER_METHODS = Object.freeze([
  Object.freeze({
    id: "loc2-provider-property-characteristics",
    tier: "provider-methodology",
    status: "PROVIDER_FRAMEWORK_NOT_LAW",
    affectedUnits: Object.freeze(["T02U4"]),
    marker: "StateCourse property-characteristics framework",
    note: "StateCourse groups physical observations (fixed location, durability with physical vulnerability, and parcel-specific uniqueness) and economic observations (scarcity, improvements and surrounding investment, long-lived capital commitments, and location preference). The grouping is an instructional lens, not a Texas statutory definition or appraisal conclusion.",
  }),
]);

export const MODULE_2_SOURCE_GAPS = Object.freeze([
  Object.freeze({
    id: "loc2-general-fixture-case-law-not-held",
    tier: "common-law",
    status: "SCOPE_NARROWED_NO_RELIANCE",
    affectedUnits: Object.freeze(["T02U3"]),
    note: "No Texas appellate opinion was acquired for a universal common-law fixture test. The unit is deliberately limited to the held contract allocation and Business and Commerce Code § 9.334 classification and priority rules; it directs disputed ownership or removal questions to counsel.",
  }),
  Object.freeze({
    id: "loc2-characteristics-provider-taxonomy",
    tier: "provider-methodology",
    status: "DISCLOSED_PROVIDER_METHOD",
    affectedUnits: Object.freeze(["T02U4"]),
    note: "The physical and economic characteristics taxonomy is StateCourse instructional methodology, not a proposition attributed to the Legislature, TREC, or an appraisal standard.",
  }),
  Object.freeze({
    id: "loc2-cooperative-housing-regime-not-held",
    tier: "transaction-structure",
    status: "SCOPE_NARROWED_NO_RELIANCE",
    affectedUnits: Object.freeze(["T02U7"]),
    note: "The held sources define cooperative entities but do not establish one universal Texas cooperative-housing ownership regime. The unit teaches recognition and document verification only and does not equate a cooperative share or occupancy agreement with a deeded condominium unit.",
  }),
  Object.freeze({
    id: "loc2-townhouse-label-not-title-estate",
    tier: "transaction-structure",
    status: "SCOPE_NARROWED_NO_RELIANCE",
    affectedUnits: Object.freeze(["T02U7"]),
    note: "Property Code § 202.001 recognizes a townhouse regime, but the word townhouse alone does not prove whether the estate is fee-simple, condominium, or another documented arrangement. The unit requires examination of title, declaration, plat, and governing instruments.",
  }),
]);

const requirement = (sourceId, section, marker) => Object.freeze({ sourceId, section, marker });

export const MODULE_2_UNIT_SOURCE_REQUIREMENTS = Object.freeze({
  T02U1: Object.freeze([
    requirement("loc2-oc-1101", "1101.002", "Tex. Occupations Code § 1101.002"),
    requirement("loc2-pr-5", "5.001", "Tex. Property Code § 5.001"),
    requirement("loc2-pr-5", "5.041", "Tex. Property Code § 5.041"),
  ]),
  T02U2: Object.freeze([
    requirement("loc2-oc-1101", "1101.002", "Tex. Occupations Code § 1101.002"),
    requirement("loc2-form-20-19", "page 1", "TREC Form 20-19, page 1"),
  ]),
  T02U3: Object.freeze([
    requirement("loc2-bc-9", "9.334", "Tex. Business and Commerce Code § 9.334"),
    requirement("loc2-form-20-19", "page 1", "TREC Form 20-19, page 1"),
  ]),
  T02U4: Object.freeze([]),
  T02U5: Object.freeze([
    requirement("loc2-pr-5", "5.001", "Tex. Property Code § 5.001"),
    requirement("loc2-pr-5", "5.041", "Tex. Property Code § 5.041"),
    requirement("loc2-cn-16", "16.15", "Tex. Const. art. XVI, § 15"),
    requirement("loc2-es-101", "101.002", "Tex. Estates Code § 101.002"),
    requirement("loc2-es-111", "111.001", "Tex. Estates Code § 111.001"),
    requirement("loc2-es-112", "112.051", "Tex. Estates Code § 112.051"),
    requirement("loc2-es-112", "112.052", "Tex. Estates Code § 112.052"),
    requirement("loc2-pr-111", "111.003", "Tex. Property Code § 111.003"),
    requirement("loc2-pr-111", "111.004", "Tex. Property Code § 111.004"),
  ]),
  T02U6: Object.freeze([
    requirement("loc2-bo-1", "1.002", "Tex. Business Organizations Code § 1.002"),
    requirement("loc2-bo-2", "2.101", "Tex. Business Organizations Code § 2.101"),
    requirement("loc2-bo-101", "101.106", "Tex. Business Organizations Code § 101.106"),
    requirement("loc2-bo-152", "152.101", "Tex. Business Organizations Code § 152.101"),
    requirement("loc2-bo-152", "152.102", "Tex. Business Organizations Code § 152.102"),
    requirement("loc2-bo-200", "200.001", "Tex. Business Organizations Code § 200.001"),
  ]),
  T02U7: Object.freeze([
    requirement("loc2-bo-1", "1.002", "Tex. Business Organizations Code § 1.002"),
    requirement("loc2-pr-81", "81.0011", "Tex. Property Code § 81.0011"),
    requirement("loc2-pr-81", "81.101", "Tex. Property Code § 81.101"),
    requirement("loc2-pr-81", "81.107", "Tex. Property Code § 81.107"),
    requirement("loc2-pr-82", "82.002", "Tex. Property Code § 82.002"),
    requirement("loc2-pr-82", "82.051", "Tex. Property Code § 82.051"),
    requirement("loc2-pr-221", "221.002", "Tex. Property Code § 221.002"),
    requirement("loc2-pr-221", "221.041", "Tex. Property Code § 221.041"),
    requirement("loc2-pr-202", "202.001", "Tex. Property Code § 202.001"),
  ]),
  T02U8: Object.freeze([
    requirement("loc2-pr-301", "301.021", "Tex. Property Code § 301.021"),
    requirement("loc2-pr-301", "301.022", "Tex. Property Code § 301.022"),
    requirement("loc2-usc-42-3604", "3604", "42 U.S.C. § 3604"),
    requirement("loc2-lg-211", "211.003", "Tex. Local Government Code § 211.003"),
    requirement("loc2-pr-202", "202.001", "Tex. Property Code § 202.001"),
    requirement("loc2-pr-202", "202.006", "Tex. Property Code § 202.006"),
  ]),
});

/** High-risk propositions must be visible both in the held source and the authored unit. */
export const MODULE_2_CLAIM_CHECKS = Object.freeze([
  Object.freeze({ sourceId: "loc2-oc-1101", section: "1101.002", unit: "T02U1", sourceNeedles: Object.freeze(["any interest in real property, including a leasehold", "does not include an interest given as security for the performance of an obligation"]), authoredNeedles: Object.freeze(["interest in real property, including a leasehold", "excluding an interest given as security for the performance of an obligation"])}),
  Object.freeze({ sourceId: "loc2-bc-9", section: "9.334", unit: "T02U3", sourceNeedles: Object.freeze(["goods that are fixtures", "a security interest does not exist under this chapter", "ordinary building materials" ]), authoredNeedles: Object.freeze(["goods may become fixtures", "a security interest under article 9 does not exist", "ordinary building materials"])}),
  Object.freeze({ sourceId: "loc2-es-101", section: "101.002", unit: "T02U5", sourceNeedles: Object.freeze(["does not survive to the remaining joint owner", "as if the decedent's interest had been severed"]), authoredNeedles: Object.freeze(["does not automatically survive", "passes as if it had been severed"])}),
  Object.freeze({ sourceId: "loc2-es-111", section: "111.001", unit: "T02U5", sourceNeedles: Object.freeze(["may agree in writing", "may not be inferred from the mere fact that property is held in joint ownership"]), authoredNeedles: Object.freeze(["may agree in writing", "cannot be inferred merely from joint ownership"])}),
  Object.freeze({ sourceId: "loc2-bo-1", section: "1.002", unit: "T02U6", sourceNeedles: Object.freeze(["for purposes of title 1, 7, or 8", "with respect to a foreign or domestic limited liability company or professional association, a member"]), authoredNeedles: Object.freeze(["for purposes of titles 1, 7, and 8", "shareholder, partner, or llc member"])}),
  Object.freeze({ sourceId: "loc2-bo-2", section: "2.101", unit: "T02U6", sourceNeedles: Object.freeze(["except as otherwise provided by this code", "sell, convey, mortgage, pledge, lease, exchange, and otherwise dispose of property"]), authoredNeedles: Object.freeze(["subject to the code's exceptions and limits", "selling, conveying, mortgaging, pledging, leasing, exchanging, and otherwise disposing of property"])}),
  Object.freeze({ sourceId: "loc2-bo-101", section: "101.106", unit: "T02U6", sourceNeedles: Object.freeze(["membership interest in a limited liability company is personal property", "does not have an interest in any specific property of the company"]), authoredNeedles: Object.freeze(["membership interest is personal property", "does not own a direct slice of each company asset"])}),
  Object.freeze({ sourceId: "loc2-bo-152", section: "152.101", unit: "T02U6", sourceNeedles: Object.freeze(["partnership property is not property of the partners", "partner's spouse does not have an interest"]), authoredNeedles: Object.freeze(["partnership property is not the partners' property", "title inquiry follows the partnership"])}),
  Object.freeze({ sourceId: "loc2-bo-200", section: "200.001", unit: "T02U6", sourceNeedles: Object.freeze(["formed by one or more trust managers under this chapter and chapter 3", "managed under this chapter"]), authoredNeedles: Object.freeze(["under chapters 200 and 3", "managed under chapter 200"])}),
  Object.freeze({ sourceId: "loc2-pr-81", section: "81.101", unit: "T02U7", sourceNeedles: Object.freeze(["recording a master deed, master lease, or declaration" ]), authoredNeedles: Object.freeze(["recorded master deed, master lease, or declaration"])}),
  Object.freeze({ sourceId: "loc2-pr-81", section: "81.107", unit: "T02U7", sourceNeedles: Object.freeze(["shares ownership of the regime's common elements", "without interfering with the rights of the other apartment owners"]), authoredNeedles: Object.freeze(["apartment owners share ownership of the common elements", "without interfering with other owners' lawful rights"])}),
  Object.freeze({ sourceId: "loc2-pr-82", section: "82.002", unit: "T02U7", sourceNeedles: Object.freeze(["declaration is recorded on or after january 1, 1994", "declaration was recorded before january 1, 1994"]), authoredNeedles: Object.freeze(["generally governs condominium declarations recorded on or after that date", "specified chapter 82 provisions to older regimes"])}),
  Object.freeze({ sourceId: "loc2-pr-82", section: "82.051", unit: "T02U7", sourceNeedles: Object.freeze(["condominium may be created under this chapter only by recording a declaration", "executed in the same manner as a deed"]), authoredNeedles: Object.freeze(["created only by recording a declaration", "executed in the same manner as a deed"])}),
  Object.freeze({ sourceId: "loc2-pr-221", section: "221.041", unit: "T02U7", sourceNeedles: Object.freeze(["before the sixth day", "may not waive the right of cancellation"]), authoredNeedles: Object.freeze(["before the sixth day", "cannot be waived"])}),
  Object.freeze({ sourceId: "loc2-pr-301", section: "301.022", unit: "T02U8", sourceNeedles: Object.freeze(["notice, statement, or advertisement", "indicates any preference, limitation, or discrimination"]), authoredNeedles: Object.freeze(["advertising rule reaches the message itself", "protected preference"])}),
  Object.freeze({ sourceId: "loc2-pr-202", section: "202.006", unit: "T02U8", sourceNeedles: Object.freeze(["has no effect until the instrument is filed", "real property records of each county"]), authoredNeedles: Object.freeze(["has no effect until filed", "county real-property records"])}),
]);

const normalizeSourceText = (text) =>
  text
    .replace(/<[^>]*>/gu, " ")
    .replace(/&nbsp;|&#160;/gu, " ")
    .replace(/&amp;/gu, "&")
    .replace(/&#39;|&apos;/gu, "'")
    .replace(/&quot;/gu, '"')
    .replace(/\s+/gu, " ")
    .trim()
    .toLowerCase();

const boundedSectionText = (record, section, text) => {
  if (record.sourceLayer === "uscode.house.gov preliminary text") return normalizeSourceText(text);
  if (record.sourceLayer !== "tcss.legis.texas.gov static resources") return normalizeSourceText(text);
  const start = text.indexOf(`name="${section}"`);
  if (start < 0) return "";
  const afterStart = text.slice(start + section.length + 7);
  const next = afterStart.search(/<p class="left"><a name="\d+\.\d+"/u);
  return normalizeSourceText(next < 0 ? afterStart : afterStart.slice(0, next));
};

export function validateModule2Sources() {
  const allowedUnits = new Set(TOPICS.find((entry) => entry.code === "T02").units.map((entry) => entry.code));
  const problems = [];
  let verifiedFiles = 0;
  let readSections = 0;
  const coveredUnits = new Set();
  const sourceById = new Map(MODULE_2_SOURCES.map((record) => [record.id, record]));
  const moduleText = readFileSync(join(REPO_ROOT, MODULE_PATH), "utf8");
  const topic = TOPICS.find((entry) => entry.code === "T02");
  const unitTextByCode = new Map();

  for (const [index, unit] of topic.units.entries()) {
    const heading = `## Unit: ${unit.unit}`;
    const start = moduleText.indexOf(heading);
    const next = topic.units[index + 1];
    const recap = moduleText.indexOf("### Module recap", start);
    const end = next ? moduleText.indexOf(`## Unit: ${next.unit}`) : recap;
    if (start < 0 || end < start) problems.push(`${unit.code}: authored unit heading is missing or out of order`);
    else unitTextByCode.set(unit.code, moduleText.slice(start, end));
  }

  const sourceEdges = new Set();
  for (const record of MODULE_2_SOURCES) {
    const bytes = readFileSync(join(REPO_ROOT, record.localCopy));
    const hash = createHash("sha256").update(bytes).digest("hex");
    if (bytes.length !== record.bytes || hash !== record.sha256) problems.push(`${record.id}: held bytes do not match the tracked acquisition record`);
    else verifiedFiles += 1;
    const rawText = bytes.toString("utf8");

    for (const entry of record.sectionsRead) {
      readSections += 1;
      if (entry.note.length < 100) problems.push(`${record.id} ${entry.section}: read note is too short`);
      for (const unit of entry.reliedOnByUnits) {
        coveredUnits.add(unit);
        sourceEdges.add(`${record.id}:${entry.section}:${unit}`);
        if (!allowedUnits.has(unit)) problems.push(`${record.id} ${entry.section}: non-Topic-02 unit ${unit}`);
      }
      if (record.sourceLayer === "tcss.legis.texas.gov static resources" && rawText.split(`name="${entry.section}"`).length - 1 !== 1) {
        problems.push(`${record.id}: section anchor ${entry.section} is not unique`);
      }
      if (record.sourceLayer === "uscode.house.gov preliminary text" && !rawText.includes("&sect;3604. Discrimination in the sale or rental of housing")) {
        problems.push(`${record.id}: official § 3604 heading is missing`);
      }
      if (record.sourceLayer === "official-instrument") {
        if (bytes.subarray(0, 5).toString("ascii") !== "%PDF-") problems.push(`${record.id}: held instrument is not a PDF`);
        if (entry.section !== "page 1") problems.push(`${record.id}: Topic 02 reliance exceeds registered page 1 scope`);
      }
    }

    if (record.formId) {
      const held = formsById.get(record.formId);
      const formRead = FORM_READS.find((entry) => entry.formId === record.formId);
      if (record.title !== held?.name || record.effectiveDate !== held?.effectiveDate || record.url !== held?.formPageUrl) {
        problems.push(`${record.id}: title, effective date, or URL differs from the acquisition catalog`);
      }
      if (formRead?.title !== record.title || !formRead.pagesRead.some((page) => page.number === 1)) {
        problems.push(`${record.id}: form-read register does not prove page 1 text and visual inspection`);
      }
    }
  }

  const expectedCoverage = [...allowedUnits].filter((unit) => unit !== "T02U4");
  if (expectedCoverage.some((unit) => !coveredUnits.has(unit))) {
    problems.push(`Topic 02 official-source coverage is incomplete: ${expectedCoverage.filter((unit) => !coveredUnits.has(unit)).join(", ")}`);
  }
  const provider = MODULE_2_PROVIDER_METHODS.find((entry) => entry.affectedUnits.includes("T02U4"));
  if (!provider || !unitTextByCode.get("T02U4")?.includes(provider.marker)) problems.push("T02U4: disclosed provider methodology is missing");

  const requirementEdges = new Set();
  const allowedCitationMarkers = new Set(
    Object.values(MODULE_2_UNIT_SOURCE_REQUIREMENTS).flatMap((requirements) => requirements.map((entry) => entry.marker)),
  );
  const citationPattern = /Tex\. (?:Occupations|Property|Business and Commerce|Estates|Business Organizations|Local Government) Code § \d+\.\d+|Tex\. Const\. art\. XVI, § 15|42 U\.S\.C\. § 3604|TREC Form 20-19, page 1/gu;

  for (const [unit, requirements] of Object.entries(MODULE_2_UNIT_SOURCE_REQUIREMENTS)) {
    const unitText = unitTextByCode.get(unit) ?? "";
    const actualMarkers = new Set(unitText.match(citationPattern) ?? []);
    const expectedMarkers = new Set(requirements.map((entry) => entry.marker));
    if (JSON.stringify([...actualMarkers].sort()) !== JSON.stringify([...expectedMarkers].sort())) {
      problems.push(`${unit}: authored citation set ${[...actualMarkers].sort().join(", ")} differs from trace ${[...expectedMarkers].sort().join(", ")}`);
    }
    for (const required of requirements) {
      requirementEdges.add(`${required.sourceId}:${required.section}:${unit}`);
      const record = sourceById.get(required.sourceId);
      const section = record?.sectionsRead.find((entry) => entry.section === required.section);
      if (!section?.reliedOnByUnits.includes(unit)) problems.push(`${unit}: ${required.sourceId} ${required.section} is not mapped back to the unit`);
      if (!unitText.includes(required.marker) || !allowedCitationMarkers.has(required.marker)) problems.push(`${unit}: citation marker ${required.marker} is absent or unregistered`);
    }
  }
  if (JSON.stringify([...sourceEdges].sort()) !== JSON.stringify([...requirementEdges].sort())) {
    problems.push("source→unit edges and authored citation requirements are not exactly bidirectional");
  }

  for (const check of MODULE_2_CLAIM_CHECKS) {
    const record = sourceById.get(check.sourceId);
    const declaredSection = record?.sectionsRead.find((entry) => entry.section === check.section);
    if (!declaredSection?.reliedOnByUnits.includes(check.unit)) {
      problems.push(`${check.sourceId} ${check.section}: claim check is not declared as relied on by ${check.unit}`);
      continue;
    }
    const rawText = record ? readFileSync(join(REPO_ROOT, record.localCopy), "utf8") : "";
    const sourceText = boundedSectionText(record, check.section, rawText);
    const unitText = (unitTextByCode.get(check.unit) ?? "").toLowerCase();
    for (const needle of check.sourceNeedles) if (!sourceText.includes(needle.toLowerCase())) problems.push(`${check.sourceId} ${check.section}: source claim needle absent: ${needle}`);
    for (const needle of check.authoredNeedles) if (!unitText.includes(needle.toLowerCase())) problems.push(`${check.unit}: authored claim needle absent: ${needle}`);
  }

  return Object.freeze({
    status: problems.length ? "FAIL" : "PASS",
    sources: MODULE_2_SOURCES.length,
    verifiedFiles,
    readSections,
    coveredOfficialSourceUnits: coveredUnits.size,
    providerMethodUnits: new Set(MODULE_2_PROVIDER_METHODS.flatMap((entry) => entry.affectedUnits)).size,
    disclosedScopeLimits: MODULE_2_SOURCE_GAPS.length,
    problems: Object.freeze(problems),
  });
}

export default Object.freeze({
  MODULE_2_SOURCES,
  MODULE_2_PROVIDER_METHODS,
  MODULE_2_SOURCE_GAPS,
  MODULE_2_UNIT_SOURCE_REQUIREMENTS,
  MODULE_2_CLAIM_CHECKS,
  validateModule2Sources,
});
