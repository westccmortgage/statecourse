#!/usr/bin/env node
/**
 * Extracts the official DRE forms in california/dre-sources/ to plain text and to a
 * list of their fillable fields, so the submission work can be built and reviewed
 * against the forms themselves rather than against a description of them.
 *
 * The PDFs are encrypted (AES) with an empty user password, which is how DRE
 * publishes them; extraction is read-only and does not modify the originals.
 *
 * Requires python3 with pypdf. Run: node scripts/extract-dre-sources.mjs
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sources = path.join(root, "california/dre-sources");
const out = path.join(sources, "extracted");

const script = `
import sys, json
from pypdf import PdfReader

reader = PdfReader(sys.argv[1])
pages = [page.extract_text() or "" for page in reader.pages]
try:
    raw_fields = reader.get_fields() or {}
except Exception:
    raw_fields = {}
fields = []
for name, spec in raw_fields.items():
    fields.append({
        "name": name,
        "type": str(spec.get("/FT", "")),
        "tooltip": str(spec.get("/TU", "")),
        "options": [str(v) for v in (spec.get("/_States_") or [])],
    })
print(json.dumps({"pages": pages, "fields": fields}))
`;

fs.mkdirSync(out, { recursive: true });
const forms = fs.readdirSync(sources).filter((name) => name.toLowerCase().endsWith(".pdf")).sort();
if (!forms.length) throw new Error(`no PDFs found in ${sources}`);

for (const form of forms) {
  const name = path.basename(form, path.extname(form));
  const json = execFileSync("python3", ["-c", script, path.join(sources, form)], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024
  });
  const { pages, fields } = JSON.parse(json);

  const text = pages.map((page, index) => `===== ${name} page ${index + 1} of ${pages.length} =====\n${page.trim()}`).join("\n\n");
  fs.writeFileSync(path.join(out, `${name}.txt`), `${text}\n`);

  if (fields.length) {
    const lines = fields.map((field) => {
      const type = (field.type || "").replace("/", "") || "?";
      const options = field.options?.length ? `  [${field.options.map((option) => option.replace("/", "")).join(" | ")}]` : "";
      const tooltip = field.tooltip ? `\n      ${field.tooltip}` : "";
      return `${type.padEnd(9)} ${field.name}${options}${tooltip}`;
    });
    fs.writeFileSync(path.join(out, `${name}.fields.txt`), `${lines.join("\n")}\n`);
  }
  console.log(`${name}: ${pages.length} page(s), ${fields.length} fillable field(s)`);
}
