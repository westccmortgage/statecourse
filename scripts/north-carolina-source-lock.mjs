#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { NC_BLOCKERS, NC_CLAIMS, NC_CONTROL_DATE, NC_MANIFEST_VERSION, NC_SOURCES } from "../config/north-carolina/regulatory-manifest.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const jsonMode = process.argv.includes("--json");
const allowedHosts = new Set(["www.ncleg.gov", "www3.ncleg.gov", "library.ncleg.gov", "reports.oah.state.nc.us", "www.ncrec.gov", "educprovider.ncrec.gov", "eservices.ncrec.gov", "ncrecblog.com", "bulletins.ncrec.gov", "www.pearsonvue.com", "www.sosnc.gov"]);
const requiredDocs = [
  "north-carolina/regulatory/official-sources.md",
  "north-carolina/regulatory/personal-broker-path.md",
  "north-carolina/regulatory/requirements-traceability.md",
  "north-carolina/submission/00-filing-index.md",
  "north-carolina/submission/01-provider-application-datasheet.md",
  "north-carolina/submission/02-course-approval-datasheet.md",
  "north-carolina/submission/03-instructor-candidate-dossier.md",
  "north-carolina/submission/04-regulator-preclearance-email.md",
  "north-carolina/submission/05-policies-procedures-disclosure-draft.md",
  "north-carolina/submission/06-distance-education-control-plan.md",
  "north-carolina/submission/07-course-guide.md",
  "north-carolina/submission/08-recordkeeping-reporting-sop.md",
  "north-carolina/submission/09-timing-evidence-report.md",
  "north-carolina/submission/10-product-roadmap.md",
  "north-carolina/submission/course-completion-certificate-specimen.md",
  "north-carolina/HANDOFF.md"
];

function filesBelow(path) {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const full = join(path, entry.name);
    return entry.isDirectory() ? filesBelow(full) : [full];
  });
}

function words(text) { return text.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu)?.length ?? 0; }
function fail(errors, message) { errors.push(message); }

const errors = [];
const warnings = [];
const ids = new Set();
for (const source of NC_SOURCES) {
  if (ids.has(source.id)) fail(errors, `duplicate source id ${source.id}`);
  ids.add(source.id);
  for (const field of ["authorityClass", "title", "url", "effectiveOrRevisionDate", "retrievedOn", "pinpoint", "evidence", "supersessionCheck", "verification"]) {
    if (!source[field]) fail(errors, `${source.id} lacks ${field}`);
  }
  let parsed;
  try { parsed = new URL(source.url); } catch { fail(errors, `${source.id} has invalid URL`); continue; }
  if (parsed.protocol !== "https:") fail(errors, `${source.id} is not HTTPS`);
  if (!allowedHosts.has(parsed.hostname)) fail(errors, `${source.id} uses non-official/unapproved host ${parsed.hostname}`);
  if (!source.verification.publisherConfirmed || !source.verification.contentAnchorConfirmed) fail(errors, `${source.id} lacks publisher/content anchor verification`);
  if (source.verification.localBytesRetained === false) warnings.push(`${source.id}: no local bytes/hash/render-OCR lock`);
}

const statuses = new Set(["confirmed", "interpretation", "needs-regulator-confirmation"]);
const claimIds = new Set();
for (const claim of NC_CLAIMS) {
  if (claimIds.has(claim.id)) fail(errors, `duplicate claim id ${claim.id}`);
  claimIds.add(claim.id);
  if (!statuses.has(claim.status)) fail(errors, `${claim.id} has invalid status`);
  if (!claim.statement || !claim.pinpoint || !claim.evidence || !claim.reliedOnBy?.length) fail(errors, `${claim.id} is missing traceability fields`);
  for (const sourceId of claim.sourceIds ?? []) if (!ids.has(sourceId)) fail(errors, `${claim.id} cites unknown ${sourceId}`);
  if (!claim.sourceIds?.length) fail(errors, `${claim.id} has no official source`);
}

for (const blocker of NC_BLOCKERS) {
  if (!/^NC-B\d{2}$/.test(blocker.id) || !blocker.owner || !blocker.blocker) fail(errors, `invalid blocker ${JSON.stringify(blocker)}`);
}
for (const blockerId of ["NC-B01", "NC-B02", "NC-B03", "NC-B04", "NC-B05", "NC-B06", "NC-B07", "NC-B08", "NC-B09", "NC-B10", "NC-B11", "NC-B12"]) {
  if (!NC_BLOCKERS.some((item) => item.id === blockerId)) fail(errors, `missing blocker ${blockerId}`);
}

for (const doc of requiredDocs) {
  try { if (!statSync(join(root, doc)).isFile()) fail(errors, `${doc} is not a file`); } catch { fail(errors, `missing ${doc}`); }
}

const ncFiles = filesBelow(join(root, "north-carolina")).filter((file) => /\.(md|mjs|json)$/i.test(file));
const publicClaimPatterns = [
  /StateCourse(?:'s)? North Carolina (?:course|school) (?:is|has been) (?:NCREC |Commission )?approved/i,
  /StateCourse(?:'s)? North Carolina (?:course|school).{0,40}approved by (?:the )?(?:North Carolina Real Estate Commission|NCREC)/i,
  /enroll now/i,
  /credit (?:is )?available now/i
];
for (const file of ncFiles) {
  const text = readFileSync(file, "utf8");
  for (const pattern of publicClaimPatterns) if (pattern.test(text)) fail(errors, `${relative(root, file)} contains prohibited release claim ${pattern}`);
}

const curriculumFiles = ncFiles.filter((file) => /north-carolina\/curriculum\/module-\d+\.md$/.test(file));
const curriculumWords = curriculumFiles.reduce((sum, file) => sum + words(readFileSync(file, "utf8")), 0);
const bankWords = words(readFileSync(join(root, "config/north-carolina/module-question-bank.mjs"), "utf8"));
const repositoryWordCeiling = curriculumWords + bankWords;
const readingRateWpm = 225;
const targetInstructionMinutes = 72 * 60;
const curriculumReadingMinutes = Number((curriculumWords / readingRateWpm).toFixed(2));
const repositoryWordCeilingMinutes = Number((repositoryWordCeiling / readingRateWpm).toFixed(2));
const timingDemonstrated = curriculumReadingMinutes >= targetInstructionMinutes;
if (timingDemonstrated) warnings.push("Word count alone reached the target; submission still needs the regulator-format unit/media outline.");

let handoff = "";
try { handoff = readFileSync(join(root, "north-carolina/HANDOFF.md"), "utf8"); } catch {}
if (handoff && !/Enrollment:\*{0,2}\s*closed/i.test(handoff)) fail(errors, "HANDOFF does not say Enrollment: closed");
if (handoff && !/Not approved/i.test(handoff)) fail(errors, "HANDOFF does not say Not approved");

const report = {
  manifest: NC_MANIFEST_VERSION,
  controlDate: NC_CONTROL_DATE,
  structuralStatus: errors.length ? "FAILED" : "LOCKED",
  filingStatus: errors.length ? "NO-GO" : "NO-GO",
  reason: errors.length ? "structural validation errors" : "external approvals and documented build blockers remain",
  sourceCount: NC_SOURCES.length,
  claimCount: NC_CLAIMS.length,
  claimStatuses: Object.fromEntries([...statuses].map((status) => [status, NC_CLAIMS.filter((claim) => claim.status === status).length])),
  blockerCount: NC_BLOCKERS.length,
  requiredDocumentCount: requiredDocs.length,
  inventory: { northCarolinaFiles: ncFiles.length, curriculumFiles: curriculumFiles.length },
  timing: { readingRateWpm, targetInstructionMinutes, curriculumWords, curriculumReadingMinutes, questionBankSourceWords: bankWords, repositoryWordCeiling, repositoryWordCeilingMinutes, demonstrated: timingDemonstrated, note: "Repository source-word counts are an audit signal, not a regulator-ready student-visible time ledger." },
  sourceIntegrity: { byteLocked: NC_SOURCES.filter((source) => source.verification.localBytesRetained && source.verification.sha256).length, byteLockRequired: NC_SOURCES.filter((source) => /pdf/i.test(new URL(source.url).pathname)).length, warningCount: warnings.length },
  errors,
  warnings
};

if (jsonMode) console.log(JSON.stringify(report, null, 2));
else {
  console.log(`North Carolina ${report.structuralStatus}; filing ${report.filingStatus}`);
  console.log(`${report.sourceCount}/${report.sourceCount} sources indexed; ${report.claimCount}/${report.claimCount} claims traced; ${report.blockerCount} blockers open`);
  console.log(`${curriculumWords} curriculum words = ${curriculumReadingMinutes} minutes at ${readingRateWpm} wpm; target ${targetInstructionMinutes} minutes; timing demonstrated: ${timingDemonstrated}`);
  console.log(`${report.sourceIntegrity.byteLocked}/${report.sourceIntegrity.byteLockRequired} official PDF sources byte/hash locked; filing requires a fresh capture`);
  for (const error of errors) console.error(`ERROR ${error}`);
}
process.exitCode = errors.length ? 1 : 0;
