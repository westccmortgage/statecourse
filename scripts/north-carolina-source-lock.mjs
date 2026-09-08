#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { NC_BLOCKERS, NC_CLAIMS, NC_CONTROL_DATE, NC_MANIFEST_VERSION, NC_SOURCES } from "../config/north-carolina/regulatory-manifest.mjs";
import { inspectStoredPdfEvidence } from './lib/north-carolina-source-integrity.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const jsonMode = process.argv.includes("--json");
const requireCapture = process.argv.includes('--require-source-capture');
const allowedHosts = new Set([
  "www.ncleg.gov",
  "www3.ncleg.gov",
  "library.ncleg.gov",
  "reports.oah.state.nc.us",
  "www.ncrec.gov",
  "educprovider.ncrec.gov",
  "eservices.ncrec.gov",
  "ncrecblog.com",
  "bulletins.ncrec.gov",
  "www.ncosfm.gov",
  "www.pearsonvue.com",
  "www.sosnc.gov",
  "uscode.house.gov",
  "www.ecfr.gov",
  "www.epa.gov",
  "www.hud.gov",
  "www.ada.gov",
  "www.ftc.gov",
  "www.justice.gov",
  "training.fema.gov",
  "www.consumerfinance.gov",
  "www.fdic.gov",
  "www.nccourts.gov",
  "www.deq.nc.gov",
  "epi.dph.ncdhhs.gov",
  "www.ncbar.gov",
  "www.ncrealtors.org",
  "www.benefits.va.gov",
  "benefits.va.gov",
  "www.rd.usda.gov",
  "www.fhfa.gov",
  "www.ginniemae.gov",
  "www.alta.org",
  "appraisalfoundation.org",
  "singlefamily.fanniemae.com"
]);
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
  "north-carolina/submission/11-module-12-correction-audit.md",
  "north-carolina/submission/12-module-13-correction-audit.md",
  "north-carolina/submission/13-module-14-correction-audit.md",
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
  if (!/\.pdf$/i.test(parsed.pathname)) warnings.push(`${source.id}: live HTML/portal fields require filing-date recheck`);
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
const instructionalMinutesPerHour = 50; // 21 NCAC 58H .0101(7).
const targetInstructionMinutes = 72 * instructionalMinutesPerHour;
const curriculumReadingMinutes = Number((curriculumWords / readingRateWpm).toFixed(2));
const repositoryWordCeilingMinutes = Number((repositoryWordCeiling / readingRateWpm).toFixed(2));
const repositoryWordCeilingMeetsTarget = repositoryWordCeilingMinutes >= targetInstructionMinutes;
// Source text includes author notes/metadata. It can expose a deficit, never validate student time.
const timingDemonstrated = false;
let captureLog;
try { captureLog = JSON.parse(readFileSync(join(root, 'north-carolina/regulatory/captures/2026-09-06/capture-log.json'), 'utf8')); } catch {}
try {
  const reviews = JSON.parse(readFileSync(join(root, 'north-carolina/regulatory/captures/2026-09-06/page-reviews.json'), 'utf8'));
  for (const entry of captureLog?.entries || []) {
    const review = entry.sourceIds.map(id => reviews[id]).find(Boolean);
    if (review && (!entry.pdfReview || review.pages?.length > (entry.pdfReview.pages?.length || 0))) entry.pdfReview = review;
  }
} catch {}
const pdfEvidence = inspectStoredPdfEvidence(root, NC_SOURCES, captureLog, NC_CONTROL_DATE);
for (const row of pdfEvidence) if (!row.reviewVerified) warnings.push(`${row.id}: ${row.status}: ${row.errors.join('; ')}`);

let handoff = "";
try { handoff = readFileSync(join(root, "north-carolina/HANDOFF.md"), "utf8"); } catch {}
if (handoff && !/Enrollment:\*{0,2}\s*closed/i.test(handoff)) fail(errors, "HANDOFF does not say Enrollment: closed");
if (handoff && !/Not approved/i.test(handoff)) fail(errors, "HANDOFF does not say Not approved");

const report = {
  manifest: NC_MANIFEST_VERSION,
  controlDate: NC_CONTROL_DATE,
  structuralStatus: errors.length ? "FAILED" : "PASS",
  sourceStatus: pdfEvidence.every(row => row.reviewVerified) ? 'VERIFIED_AS_OF_CAPTURE' : 'INCOMPLETE',
  filingStatus: errors.length ? "NO-GO" : "NO-GO",
  reason: errors.length ? "structural validation errors" : "external approvals and documented build blockers remain",
  sourceCount: NC_SOURCES.length,
  claimCount: NC_CLAIMS.length,
  claimStatuses: Object.fromEntries([...statuses].map((status) => [status, NC_CLAIMS.filter((claim) => claim.status === status).length])),
  blockerCount: NC_BLOCKERS.length,
  requiredDocumentCount: requiredDocs.length,
  inventory: { northCarolinaFiles: ncFiles.length, curriculumFiles: curriculumFiles.length },
  timing: { readingRateWpm, instructionalMinutesPerHour, targetInstructionMinutes, curriculumWords, curriculumReadingMinutes, questionBankSourceWords: bankWords, repositoryWordCeiling, repositoryWordCeilingMinutes, repositoryWordCeilingMeetsTarget, demonstrated: timingDemonstrated, note: "Both repository source-word counts are upper-bound audit signals including nonstudent text; neither establishes student-visible instruction. Breaks and the syllabus exam allocation need separate ledgers." },
  sourceIntegrity: { byteVerified: pdfEvidence.filter(row => row.byteVerified).length, reviewed: pdfEvidence.filter(row => row.reviewVerified).length, pdfSourceEntries: pdfEvidence.length, uniquePdfUrls: new Set(NC_SOURCES.filter(s => new URL(s.url).pathname.endsWith('.pdf')).map(s => s.url)).size, warningCount: warnings.length, details: pdfEvidence },
  errors,
  warnings
};

if (jsonMode) console.log(JSON.stringify(report, null, 2));
else {
  console.log(`North Carolina structure ${report.structuralStatus}; sources ${report.sourceStatus}; filing ${report.filingStatus}`);
  console.log(`${report.sourceCount}/${report.sourceCount} sources indexed; ${report.claimCount}/${report.claimCount} claims traced; ${report.blockerCount} blockers open`);
  console.log(`${curriculumWords} curriculum words = ${curriculumReadingMinutes} minutes at ${readingRateWpm} wpm; target ${targetInstructionMinutes} minutes; timing demonstrated: ${timingDemonstrated}`);
  console.log(`${report.sourceIntegrity.byteVerified}/${report.sourceIntegrity.pdfSourceEntries} official PDF source entries have verified bytes/identity; ${report.sourceIntegrity.reviewed} visually reviewed; filing requires fresh source checks`);
  for (const error of errors) console.error(`ERROR ${error}`);
}
process.exitCode = errors.length || (requireCapture && report.sourceStatus !== 'VERIFIED_AS_OF_CAPTURE') ? 1 : 0;
