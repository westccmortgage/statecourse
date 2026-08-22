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
 * So are three other things, each for its own reason:
 *
 *   The city and state of execution, because they are established at the moment of signing in
 *   the same clause as the date. A pre-printed city is a false declaration the moment the form
 *   is signed anywhere else, and it is made under penalty of perjury.
 *
 *   The real estate license status question at the very bottom, because the Course Provider
 *   Handbook reserves it — with the instructor's signature — to the instructor. The form asks
 *   the instructor directly; the primary contact does not answer for them.
 *
 *   The four-digit sponsor ID, because DRE assigns it.
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
    /*
     * The perjury declaration reads: "I, ___, declare under penalty of perjury that the foregoing
     * is true and correct. Signed in the City of ___, State of ___, this ___ day of ___, 20___."
     *
     * The declarant's name is a fact known now. The CITY AND STATE ARE NOT — they are established
     * at the moment of signing, in the same clause and by the same act as the date. Pre-printing
     * "Redondo Beach" while leaving the date blank asserted half a fact about an event that had
     * not happened, and if the form were signed in Burbank the declaration would be false on its
     * face, under penalty of perjury. All five go in together, by hand.
     */
    "Name": data.primaryContact.declarantName,
    "City a": "",
    "State a": "",
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
    /*
     * Instructor block. The printed name is the primary contact's to enter.
     *
     * The line below it is not. The form addresses it to the instructor in its own words —
     * "INSTRUCTOR: DO YOU NOW OR HAVE YOU EVER HELD A CALIFORNIA REAL ESTATE LICENSE? NO / YES.
     * IF YES, LICENSE # ___" — and the Course Provider Handbook (Rev. 01/2026) says the primary
     * contact completes all of the information on RE 336 "except for the instructor's signature
     * and the real estate license status question on the very bottom of the form".
     *
     * So the answer and the licence number are left blank for the instructor to give. That the
     * same person happens to hold both roles here does not transfer one role's answer to the
     * other: the question is put to the instructor, and the instructor answers it.
     */
    "INSTRUCTOR NAME": data.instructor.name,
    "CalBRE LICENSE NUMBER": "",
    "insturctor licensced? yes": "/Off",
    "insturctor licensced? No": "/Off"
    /* day / Month / Year / DATE / DATE 2 / Signature1 / Signature2 stay empty on purpose. */
  };
  const out = path.join(outDir, `RE336-${slug(course)}.pdf`);
  execFileSync("python3", ["-c", script, form, out, JSON.stringify(values)], { encoding: "utf8" });
  console.log(`wrote ${path.relative(root, out)}  (${course})`);
}

console.log("\nLeft blank by design, to be completed by hand at signing:");
console.log("  - both signatures and both dates");
console.log("  - the city and state of execution, which the perjury declaration ties to the act of signing");
console.log("  - the instructor's real estate license question and licence number at the very bottom,");
console.log("    which the Course Provider Handbook reserves to the instructor");
console.log("  - the four-digit DRE sponsor ID, which the Department assigns");
