#!/usr/bin/env node
/**
 * Acquire official Texas Legislative Council chapter files needed by Law of Contracts.
 *
 * Usage:
 *   node scripts/acquire-tx-loc-statutes.mjs          # download and report; write nothing
 *   node scripts/acquire-tx-loc-statutes.mjs --write  # write chapter files and hash catalog
 *
 * These files are course-local on purpose. The completed Law of Agency freeze hashes the global
 * texas/trec-sources inventory; unrelated LOC acquisitions must not mutate that frozen dependency.
 */

import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT_DIR = join(ROOT, "texas/tx-law-of-contracts-30-v1/sources/statutes");
const WRITE = process.argv.includes("--write");
const RETRIEVED_ON = new Date().toISOString().slice(0, 10);
const BASE = "https://tcss.legis.texas.gov/resources";

const CHAPTERS = Object.freeze([
  Object.freeze({ code: "BC", codeName: "Business and Commerce Code", chapter: "3", title: "Negotiable Instruments" }),
  Object.freeze({ code: "BC", codeName: "Business and Commerce Code", chapter: "322", title: "Uniform Electronic Transactions Act" }),
  Object.freeze({ code: "PR", codeName: "Property Code", chapter: "24", title: "Forcible Entry and Detainer" }),
  Object.freeze({ code: "PR", codeName: "Property Code", chapter: "81", title: "Condominiums Created Before Adoption of Uniform Condominium Act" }),
  Object.freeze({ code: "PR", codeName: "Property Code", chapter: "82", title: "Uniform Condominium Act" }),
  Object.freeze({ code: "PR", codeName: "Property Code", chapter: "221", title: "Texas Timeshare Act" }),
  Object.freeze({ code: "OC", codeName: "Occupations Code", chapter: "1102", title: "Real Estate Inspectors" }),
  Object.freeze({ code: "FI", codeName: "Finance Code", chapter: "156", title: "Residential Mortgage Loan Companies and Residential Mortgage Loan Originators" }),
  Object.freeze({ code: "FI", codeName: "Finance Code", chapter: "157", title: "Mortgage Bankers and Residential Mortgage Loan Originators" }),
]);

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const normalized = (value) => String(value).replace(/\s+/g, " ").trim();

async function fetchChapter(chapter) {
  const filename = `${chapter.code}.${chapter.chapter}.htm`;
  const url = `${BASE}/${chapter.code}/htm/${filename}`;
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) throw new Error(`${filename}: ${url} returned HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const html = bytes.toString("utf8");
  const title = normalized(html.match(/<title>([^<]+)<\/title>/i)?.[1] ?? "");
  const expectedTitleFragment = `${chapter.codeName.toUpperCase()} CHAPTER ${chapter.chapter}.`;
  if (!/^<html\b/i.test(html.trimStart())) throw new Error(`${filename}: response is not HTML`);
  if (!title.includes(expectedTitleFragment)) {
    throw new Error(`${filename}: expected title to contain ${JSON.stringify(expectedTitleFragment)}, received ${JSON.stringify(title)}`);
  }
  if (!html.includes(`name="${chapter.chapter}.`)) {
    throw new Error(`${filename}: no section anchors for chapter ${chapter.chapter}`);
  }

  return Object.freeze({
    id: `${chapter.code.toLowerCase()}-${chapter.chapter}`,
    code: chapter.code,
    codeName: chapter.codeName,
    chapter: chapter.chapter,
    title: chapter.title,
    publisher: "Texas Legislative Council",
    sourceLayer: "tcss.legis.texas.gov static resources",
    url,
    localCopy: `texas/tx-law-of-contracts-30-v1/sources/statutes/${filename}`,
    sha256: sha256(bytes),
    bytes: bytes.length,
    heldStatus: "HELD",
    responseTitle: title,
    content: bytes,
  });
}

const acquired = [];
for (const chapter of CHAPTERS) {
  const record = await fetchChapter(chapter);
  acquired.push(record);
  if (WRITE) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
    writeFileSync(join(ROOT, record.localCopy), record.content);
  }
  console.log(`${record.id.padEnd(8)} ${String(record.bytes).padStart(8)}  ${record.sha256.slice(0, 16)}  ${record.url}`);
}

const sources = acquired.map(({ content, ...record }) => Object.freeze(record));
const catalog = Object.freeze({
  generatedBy: "scripts/acquire-tx-loc-statutes.mjs --write",
  retrievedOn: RETRIEVED_ON,
  status:
    "OFFICIAL TEXAS LEGISLATIVE COUNCIL CHAPTER COPIES HELD. Holding a chapter is not reading a section; substantive reliance requires a section-level LOC read record.",
  sourceCount: sources.length,
  totalBytes: sources.reduce((sum, record) => sum + record.bytes, 0),
  sources,
});

if (WRITE) {
  writeFileSync(join(OUTPUT_DIR, "catalog.json"), `${JSON.stringify(catalog, null, 2)}\n`);
  console.log(`wrote ${sources.length} official chapter files and catalog.json (${catalog.totalBytes} bytes)`);
} else {
  console.log(`resolved ${sources.length} official chapter files (${catalog.totalBytes} bytes); use --write to acquire them`);
}
