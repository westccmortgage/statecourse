#!/usr/bin/env node
/**
 * Fills the official RE 336 (Statutory/Pre-License Instructor Certification) PDF, one
 * copy per proposed course, from the instructor data in california/dre-sources/re336-data.json.
 *
 * Why this exists: an earlier draft of the instructor package was a retyped facsimile of
 * RE 336 rather than the Department's own form, and its certification wording differed
 * from the official text. The certification is made under penalty of perjury, so it must
 * carry DRE's exact language. This writes the real form instead.
 *
 * Signature and date fields are deliberately left empty. Both the primary contact and the
 * instructor sign by hand after review; nothing here signs or certifies anything.
 *
 * Output: california/dre-sources/generated/RE336-<course-slug>.pdf
 * Run: node scripts/fill-re336.mjs
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sources = path.join(root, "california/dre-sources");
const form = path.join(sources, "RE336.pdf");
const outDir = path.join(sources, "generated");
const data = JSON.parse(fs.readFileSync(path.join(sources, "re336-data.json"), "utf8"));

const script = `
import json, sys
from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject, BooleanObject

form_path, out_path, values_json = sys.argv[1], sys.argv[2], sys.argv[3]
values = json.loads(values_json)

reader = PdfReader(form_path)
if reader.is_encrypted:
    reader.decrypt("")

writer = PdfWriter()
writer.append(reader)
# NeedAppearances makes viewers render the filled values with the form's own styling.
writer._root_object["/AcroForm"][NameObject("/NeedAppearances")] = BooleanObject(True)
for page in writer.pages:
    writer.update_page_form_field_values(page, values)
with open(out_path, "wb") as handle:
    writer.write(handle)
print(out_path)
`;

fs.mkdirSync(outDir, { recursive: true });

const slug = (title) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

for (const course of data.courses) {
  const values = {
    /* Perjury declaration block */
    "Name": data.primaryContact.declarantName,
    "City a": data.primaryContact.city,
    "State a": data.primaryContact.state,
    /* Primary contact block */
    "PRINTED OR TYPED NAME OF PRIMARY CONTACT": data.primaryContact.name,
    "TITLE OF PRIMARY CONTACT": data.primaryContact.title,
    /* Course provider block */
    "Name of course provider": data.provider.legalName,
    "4DIGIT SPONSOR ID NUMBER": data.provider.sponsorId,
    "Address of course provider": data.provider.street,
    "city": data.provider.city,
    "State": data.provider.state,
    "Zip Code": data.provider.zip,
    "Course title": course,
    /* Instructor block */
    "INSTRUCTOR NAME": data.instructor.name,
    "CalBRE LICENSE NUMBER": data.instructor.licenseNumber,
    /* Checkbox on-states are name objects, so they must carry the leading slash. */
    "insturctor licensced? yes": data.instructor.heldCaliforniaLicense ? "/Yes" : "/Off",
    "insturctor licensced? No": data.instructor.heldCaliforniaLicense ? "/Off" : "/Yes"
    /* day / Month / Year / DATE / DATE 2 / Signature1 / Signature2 stay empty on purpose. */
  };
  const out = path.join(outDir, `RE336-${slug(course)}.pdf`);
  execFileSync("python3", ["-c", script, form, out, JSON.stringify(values)], { encoding: "utf8" });
  console.log(`wrote ${path.relative(root, out)}  (${course})`);
}

console.log("\nSignature, date, city-of-signing day/month/year fields are blank by design - sign by hand.");
