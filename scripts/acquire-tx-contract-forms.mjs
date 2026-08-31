#!/usr/bin/env node
/**
 * Acquire the current TREC contract-form PDFs named by the captured Contracts-page inventory.
 *
 * Usage:
 *   node scripts/acquire-tx-contract-forms.mjs          # resolve and report; write nothing
 *   node scripts/acquire-tx-contract-forms.mjs --write  # write PDFs and their hash catalog
 *
 * Each form page can link a generic Residential Service Contract notice and can retain a draft.
 * Selection is therefore by the inventory's exact form id, with draft and instruction-sheet links
 * excluded. The current PDF URL is retained in the generated catalog even though the local filename
 * is stable, so a future run exposes a changed remote revision as a hash/URL diff.
 */

import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { FORMS, SOURCE_URL } from "../config/texas/pcf-current-forms-inventory.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
/* Course-local on purpose. The global texas/trec-sources/source-inventory.json is a hashed
 * dependency of the completed Law of Agency freeze; adding unrelated Law of Contracts sources to
 * that inventory would invalidate LOA without changing one byte of LOA content. */
const OUTPUT_DIR = join(ROOT, "texas/tx-law-of-contracts-30-v1/sources/forms");
const WRITE = process.argv.includes("--write");
const BASE = "https://www.trec.texas.gov";
const RETRIEVED_ON = new Date().toISOString().slice(0, 10);

const cleanId = (value) => String(value).toLowerCase().replace(/[^a-z0-9]/g, "");
const localName = (formId) => `${String(formId).replace(/[^A-Za-z0-9.-]+/g, "-")}.pdf`;
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

async function fetchChecked(url, kind) {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) throw new Error(`${kind}: ${url} returned HTTP ${response.status}`);
  return response;
}

function pdfLinks(html, pageUrl, formId) {
  const target = cleanId(formId);
  const links = [...html.matchAll(/href=["']([^"'?]*\/pdf-forms\/[^"'?]+\.pdf)["']/gi)]
    .map((match) => new URL(match[1], pageUrl).href)
    .filter((url, index, all) => all.indexOf(url) === index)
    .filter((url) => {
      const file = decodeURIComponent(new URL(url).pathname.split("/").at(-1));
      if (/\bdraft\b/i.test(file) || /instruction[ _-]*sheet/i.test(file)) return false;
      return cleanId(file.replace(/\.pdf$/i, "")).startsWith(target);
    });

  if (links.length !== 1) {
    throw new Error(`${formId}: expected one current matching PDF, found ${links.length}: ${links.join(", ") || "none"}`);
  }
  return links[0];
}

const records = [];
for (const form of FORMS) {
  const pageUrl = new URL(form.path, BASE).href;
  const page = await fetchChecked(pageUrl, `${form.formId} form page`);
  const html = await page.text();
  const pdfUrl = pdfLinks(html, pageUrl, form.formId);
  const response = await fetchChecked(pdfUrl, `${form.formId} PDF`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.subarray(0, 5).toString("ascii") !== "%PDF-") {
    throw new Error(`${form.formId}: ${pdfUrl} did not return a PDF`);
  }

  const filename = localName(form.formId);
  const localCopy = `texas/tx-law-of-contracts-30-v1/sources/forms/${filename}`;
  const record = Object.freeze({
    formId: form.formId,
    name: form.name,
    effectiveDate: form.effectiveDate,
    formPageUrl: pageUrl,
    pdfUrl,
    localCopy,
    sha256: sha256(bytes),
    bytes: bytes.length,
  });
  records.push(record);

  if (WRITE) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
    writeFileSync(join(OUTPUT_DIR, filename), bytes);
  }
  console.log(`${form.formId.padEnd(8)} ${String(bytes.length).padStart(8)}  ${record.sha256.slice(0, 16)}  ${pdfUrl}`);
}

const catalog = Object.freeze({
  generatedBy: "scripts/acquire-tx-contract-forms.mjs --write",
  sourceListing: SOURCE_URL,
  retrievedOn: RETRIEVED_ON,
  status:
    "OFFICIAL TREC PDF COPIES HELD. Holding a PDF is not reading it; substantive reliance requires a page/paragraph-level read record.",
  formCount: records.length,
  totalBytes: records.reduce((sum, record) => sum + record.bytes, 0),
  forms: records,
});

if (WRITE) {
  writeFileSync(join(OUTPUT_DIR, "catalog.json"), `${JSON.stringify(catalog, null, 2)}\n`);
  console.log(`wrote ${records.length} official TREC PDFs and catalog.json (${catalog.totalBytes} bytes)`);
} else {
  console.log(`resolved ${records.length} official TREC PDFs (${catalog.totalBytes} bytes); use --write to acquire them`);
}
