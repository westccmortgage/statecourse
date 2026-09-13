import { readFileSync, readdirSync, lstatSync } from 'node:fs';
import { resolve, join, relative, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { getNmlsReviewCourse } from '../netlify/functions/_lib/nmls-review-content.mjs';
import { getNmlsFinalAuthoringCandidates } from '../lib/nmls-final-authoring-content.mjs';
import { NMLS_TRAINING_COURSE } from '../config/nmls-course-identity.mjs';

// Public-artifact boundary, not a generic ban on JavaScript property names.
// The existing authenticated reviewer renderer may refer to `correctChoice`;
// publishing the actual questions, item identities or answer maps is different.
// Source files are server-only. Reports contain paths/IDs, never answer values.
function actualItems() {
  const course = getNmlsReviewCourse(NMLS_TRAINING_COURSE.contentKey);
  // Held/reserve items are private too, not merely the currently active 50.
  const final = getNmlsFinalAuthoringCandidates();
  return [...final, ...course.modules.flatMap(module => [
    ...module.units.map(unit => unit.actionQuestion), ...module.quiz.bank,
  ])].map(question => ({ id: question.id, stem: question.stem, correctChoice: question.correctChoice }));
}
const textFile = /\.(?:html?|[cm]?js|jsx|tsx?|json|map|md|txt|csv|srt|vtt|webmanifest|css|svg|xml|ya?ml)$/i;
const privateName = /(?:^|\/)(?:[^/]*(?:answer[-_]key|final[-_]exam[-_]bank|secure[-_]final[-_]bank)[^/]*|(?:federal|ethics|nontraditional)-revised-candidates\.json|general-candidates\.json)$/i;
const privateTree = /(?:^|\/)nmls\/(?:assessment|curriculum|evidence)(?:\/|$)/i;
const htmlEscape = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const unique = values => [...new Set(values)];

export function verifyNmlsPublicArtifact({ artifactRoot = resolve('dist'), items = actualItems() } = {}) {
  if (!Array.isArray(items) || !items.length || items.some(item => !item || typeof item.id !== 'string' || !item.id || typeof item.stem !== 'string' || item.stem.length < 12))
    throw new Error('nmls_privacy_source_inventory_invalid');
  const inventory = [...new Map(items.map(item => [item.id, item])).values()].map(item => ({ ...item,
    stems: unique([item.stem, JSON.stringify(item.stem).slice(1, -1), htmlEscape(item.stem), htmlEscape(JSON.stringify(item.stem).slice(1, -1))]),
  }));
  const violations = []; let scannedFiles = 0, scannedTextFiles = 0;
  function visit(directory) {
    for (const name of readdirSync(directory).sort()) {
      const file = join(directory, name), path = relative(artifactRoot, file).replaceAll('\\', '/'), stat = lstatSync(file);
      if (stat.isSymbolicLink()) { violations.push({ file: path, code: 'public_artifact_symlink' }); continue; }
      if (stat.isDirectory()) { visit(file); continue; }
      if (!stat.isFile()) continue;
      scannedFiles++;
      if (privateName.test(path) || privateTree.test(path)) violations.push({ file: path, code: 'private_source_filename' });
      if (!textFile.test(basename(path))) continue;
      scannedTextFiles++;
      const text = readFileSync(file, 'utf8');
      const stemIds = [], identityIds = [];
      for (const item of inventory) {
        if (item.stems.some(stem => text.includes(stem))) stemIds.push(item.id);
        // A standalone key map can omit every question stem. All actual NMLS
        // assessment item IDs are private-at-rest in this build, so the full
        // authored ID catches that map without printing or guessing its key.
        if (text.includes(item.id)) identityIds.push(item.id);
      }
      if (stemIds.length) violations.push({ file: path, code: 'private_question_content', itemIds: unique(stemIds) });
      if (identityIds.length) violations.push({ file: path, code: 'private_assessment_identity_or_key_map', itemIds: unique(identityIds) });
      if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(text)) violations.push({ file: path, code: 'private_key_material' });
    }
  }
  const root = lstatSync(artifactRoot);
  if (!root.isDirectory() || root.isSymbolicLink()) throw new Error('nmls_public_artifact_root_invalid');
  visit(artifactRoot);
  if (scannedFiles === 0) throw new Error('nmls_public_artifact_empty');
  return { ok: violations.length === 0, scannedFiles, scannedTextFiles, privateItemCount: inventory.length, violations };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try {
    const result = verifyNmlsPublicArtifact({ artifactRoot: resolve(process.argv[2] || 'dist') });
    process.stdout.write(`${JSON.stringify(result)}\n`);
    if (!result.ok) process.exitCode = 1;
  } catch (error) {
    // No arbitrary filesystem exception text or source contents in CI output.
    const known = ['nmls_privacy_source_inventory_invalid', 'nmls_public_artifact_root_invalid', 'nmls_public_artifact_empty'];
    process.stderr.write(`${known.includes(error.message) ? error.message : 'nmls_public_artifact_check_failed'}\n`);
    process.exitCode = 1;
  }
}
