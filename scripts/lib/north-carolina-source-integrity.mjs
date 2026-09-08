import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

export const sha256 = value => createHash('sha256').update(value).digest('hex');
const normalize = value => value.toLowerCase().replace(/\s+/g, ' ').trim();
export function identityMarkers(source) {
  const match = source.id.match(/^NC-RULE-(58[A-Z])-([.\d-]+)$/);
  if (match) return match[2].split('-').map(number => `21 NCAC ${match[1]} ${number}`);
  return ({
    'NC-SYLLABUS-PRE-2026': ['Broker Prelicensing Course', 'SYLLABUS', 'May 2026'],
    'NC-GUIDE-RELINC-2026': ['Real Estate Licensing in North Carolina', 'April 2026'],
    'NC-FORM-SOS-L09': ['APPLICATION FOR CERTIFICATE OF AUTHORITY', 'LIMITED LIABILITY COMPANY', 'L-09', 'Revised July 2017'],
    'NC-LLCR-CURRENT': ['North Carolina Real Estate License Law', 'Commission Rules', 'Comments'],
    'NC-NCREC-RPOADS-2026': ['Residential Property And Owners', 'Association Disclosure Statement', 'REV 7/26'],
    'NC-NCREC-MOG': ['Mineral and Oil and Gas Rights Disclosure Statement', 'REC 4.25', '1/1/15'],
    'NC-NCREC-RSFG-2026': ['MEASURE.', 'CALCULATE.', 'REC 3.40', '7/2026'],
    'NC-NCREC-WWREA': ['Working With Real Estate Agents Disclosure', 'This form is not a contract'],
    'NC-NCREC-WWREA-QA-2022': ['Questions and Answers on:', 'WORKING WITH', 'REAL ESTATE', 'AGENTS', 'REC 3.45', '1/3/22'],
    'NC-NCREC-SUBDIVISIONS-QA-2019': ['Questions and Answers on:', 'RESIDENTIAL', 'SUBDIVISIONS', 'PLANNED COMMUNITIES', 'REC 3.49', '11/1/19'],
    'FED-HUD-NEIGHBORHOOD-INFO-2026': ['U.S. DEPARTMENT OF HOUSING AND URBAN DEVELOPMENT', 'April 24, 2026', 'Sharing Crime And School Data', 'Craig W. Trainor'],
    'FED-HUD-WITHDRAWAL-2025': ['Notice of the Withdrawal of FHEO Guidance Documents', 'September 17, 2025', 'GUIDANCE WITHDRAWN', 'John Gibbs']
  })[source.id] || [];
}
export function inspectPdfEvidence(source, entry, { bytes, pageText, today = '2026-09-06', renderBytes = {} } = {}) {
  const errors = [];
  if (!entry) return { status:'MISSING_CAPTURE', errors:['No capture entry'], byteVerified:false, reviewVerified:false };
  if (entry.requestedUrl !== source.url || !entry.sourceIds?.includes(source.id)) errors.push('Source/capture URL or ID mismatch');
  if (entry.httpStatus !== 200) errors.push(`Retrieval unsuccessful: ${entry.failure || entry.httpStatus || 'no response'}`);
  try {
    const requested = new URL(source.url), final = new URL(entry.finalUrl);
    if (final.protocol !== 'https:' || final.hostname !== requested.hostname) errors.push('Unapproved final redirect host/protocol');
  } catch { errors.push('Missing/invalid final URL'); }
  if (!/^application\/pdf(?:;|$)/i.test(entry.contentType || '')) errors.push('Response content type is not PDF');
  if (!entry.snapshotPath || !bytes) errors.push('Missing retained snapshot');
  if (bytes?.subarray(0,5).toString() !== '%PDF-') errors.push('PDF magic absent (possible soft-404)');
  if (!entry.sha256 || !bytes || entry.sha256 !== sha256(bytes)) errors.push('Missing/stale PDF SHA-256');
  const text = normalize((pageText || []).join('\n'));
  const markers = identityMarkers(source);
  if (!markers.length || markers.some(marker => !text.includes(normalize(marker)))) errors.push('PDF content identity markers absent');
  if (!pageText?.length || pageText.length !== entry.pdfPages) errors.push('PDF page count mismatch');
  const byteVerified = errors.length === 0;
  const review = entry.pdfReview;
  if (review?.status !== 'REVIEWED' || review.reviewedPdfSha256 !== entry.sha256 || !review.title || !review.revisionObservation || !review.pages?.length) errors.push('PDF title/revision/render review missing or stale');
  if (review?.pages?.length !== entry.pdfPages || new Set((review?.pages || []).map(page => page.number)).size !== entry.pdfPages) errors.push('PDF all-page review incomplete');
  for (const page of review?.pages || []) {
    if (!Number.isInteger(page.number) || page.number < 1 || page.number > entry.pdfPages || !page.renderPath || !page.sha256 || !renderBytes[page.renderPath] || sha256(renderBytes[page.renderPath]) !== page.sha256) errors.push('Missing/stale reviewed page render');
  }
  if (entry.attemptedAt?.slice(0,10) !== today) errors.push('Capture is not from required control date');
  return { status: errors.length ? (byteVerified ? 'CAPTURED_UNREVIEWED' : 'UNVERIFIED') : 'VERIFIED_AS_OF_CAPTURE', errors, byteVerified, reviewVerified:errors.length === 0 };
}

export function inspectStoredPdfEvidence(root, sources, log, today) {
  const cache = new Map();
  return sources.filter(s => new URL(s.url).pathname.endsWith('.pdf')).map(source => {
    const entry = log?.entries?.find(e => e.sourceIds?.includes(source.id));
    let materials = {};
    if (entry?.snapshotPath) {
      if (!cache.has(entry.snapshotPath)) {
        try {
          const path = resolve(root, entry.snapshotPath);
          if (!path.startsWith(resolve(root, 'north-carolina/regulatory/captures') + '/')) throw new Error('Snapshot outside capture directory');
          const bytes = readFileSync(path);
          const python = process.env.NC_PYTHON || 'python3';
          const pageText = JSON.parse(execFileSync(python, ['-c', 'import json,sys; from pypdf import PdfReader; print(json.dumps([p.extract_text() or "" for p in PdfReader(sys.argv[1]).pages]))', path], { encoding:'utf8', maxBuffer:16*1024*1024 }));
          const renderBytes = {};
          for (const page of entry.pdfReview?.pages || []) { const renderPath = resolve(root,page.renderPath); if (!renderPath.startsWith(resolve(root,'north-carolina/regulatory/captures')+'/')) throw new Error('Render outside capture directory'); renderBytes[page.renderPath]=readFileSync(renderPath); }
          cache.set(entry.snapshotPath, {bytes,pageText,renderBytes});
        } catch (error) { cache.set(entry.snapshotPath, { extractionError:`PDF extraction/read failed; install pypdf or set NC_PYTHON: ${error.message.slice(0,200)}` }); }
      }
      materials = cache.get(entry.snapshotPath);
    }
    const result = inspectPdfEvidence(source, entry, {...materials,today});
    if (materials.extractionError) result.errors.push(materials.extractionError);
    return { id:source.id, ...result };
  });
}
