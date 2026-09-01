#!/usr/bin/env node
/** Acquire the four official Business Organizations Code chapters needed by LOC Topic 02. */

import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT_DIR = join(ROOT, "texas/tx-law-of-contracts-30-v1/sources/business-organizations");
const WRITE = process.argv.includes("--write");
const texasDate = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Chicago",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).formatToParts(new Date());
const datePart = (type) => texasDate.find((part) => part.type === type)?.value;
const RETRIEVED_ON = `${datePart("year")}-${datePart("month")}-${datePart("day")}`;
const BASE = "https://tcss.legis.texas.gov/resources/BO/htm";

const CHAPTERS = Object.freeze([
  Object.freeze({ chapter: "1", title: "Definitions and Other General Provisions" }),
  Object.freeze({ chapter: "2", title: "Purposes and Power of Domestic Entity" }),
  Object.freeze({ chapter: "101", title: "Limited Liability Companies" }),
  Object.freeze({ chapter: "152", title: "General Partnerships" }),
]);

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const normalized = (value) => String(value).replace(/\s+/gu, " ").trim();

async function fetchChapter(record) {
  const filename = `BO.${record.chapter}.htm`;
  const url = `${BASE}/${filename}`;
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) throw new Error(`${filename}: ${url} returned HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const html = bytes.toString("utf8");
  const responseTitle = normalized(html.match(/<title>([^<]+)<\/title>/iu)?.[1] ?? "");
  if (!/^<html\b/iu.test(html.trimStart())) throw new Error(`${filename}: response is not HTML`);
  if (!responseTitle.includes(`BUSINESS ORGANIZATIONS CODE CHAPTER ${record.chapter}.`)) {
    throw new Error(`${filename}: unexpected response title ${JSON.stringify(responseTitle)}`);
  }
  if (!html.includes(`name="${record.chapter}.`)) throw new Error(`${filename}: no chapter section anchors`);

  return Object.freeze({
    id: `bo-${record.chapter}`,
    code: "BO",
    codeName: "Business Organizations Code",
    chapter: record.chapter,
    title: record.title,
    publisher: "Texas Legislative Council",
    sourceLayer: "tcss.legis.texas.gov static resources",
    url,
    localCopy: `texas/tx-law-of-contracts-30-v1/sources/business-organizations/${filename}`,
    sha256: sha256(bytes),
    bytes: bytes.length,
    heldStatus: "HELD",
    responseTitle,
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
  generatedBy: "scripts/acquire-tx-loc-business-organization-sources.mjs --write",
  retrievedOn: RETRIEVED_ON,
  status:
    "OFFICIAL TEXAS LEGISLATIVE COUNCIL CHAPTER COPIES HELD. Holding a chapter is not reading a section; Topic 02 reliance requires its section-level source record.",
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
