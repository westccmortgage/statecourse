import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { verifyNmlsPublicArtifact } from '../scripts/verify-nmls-public-artifact.mjs';
import { getNmlsDraftFinalDefinition } from '../lib/nmls-final-authoring-content.mjs';
import { NMLS_TRAINING_COURSE } from '../config/nmls-course-identity.mjs';
const items = [{ id: 'N26-FIN-F99', stem: 'Which fictional evidence belongs in the file? "Check A & B"', correctChoice: 'B' }];
function fixture(t, files = {}) {
  const root = mkdtempSync(join(tmpdir(), 'statecourse-nmls-public-test-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [name, contents] of Object.entries(files)) {
    const path = join(root, name); mkdirSync(join(path, '..'), { recursive: true }); writeFileSync(path, contents);
  }
  return root;
}
test('generic authenticated renderer property names are not themselves private answer data', t => {
  const artifactRoot = fixture(t, { 'review.js': 'function render(item){return item.correctChoice;}', 'index.html': '<h1>Mortgage training</h1>' });
  assert.equal(verifyNmlsPublicArtifact({ artifactRoot, items }).ok, true);
});
test('raw private bank filenames, renamed private tree files and private keys fail explicitly', t => {
  for (const [name, contents] of [
    ['federal-revised-candidates.json', '{}'], ['renamed-answer-key.txt', 'A B C'], ['nmls/curriculum/unit.md', 'Source'],
    ['nmls/evidence/2026-09-13/manifest.json', '{}'], ['config.js', 'const key="-----BEGIN PRIVATE KEY-----"'],
  ]) {
    const artifactRoot = fixture(t, { [name]: contents });
    assert.equal(verifyNmlsPublicArtifact({ artifactRoot, items }).ok, false, name);
  }
});
test('actual stems are detected in raw, JSON escaped and HTML escaped exports without relying on property names', t => {
  for (const contents of [items[0].stem, JSON.stringify({ prose: items[0].stem }), items[0].stem.replace(/&/g, '&amp;').replace(/"/g, '&quot;')]) {
    const artifactRoot = fixture(t, { 'innocent.html': contents });
    const result = verifyNmlsPublicArtifact({ artifactRoot, items });
    assert.ok(result.violations.some(v => v.code === 'private_question_content'));
    assert.equal(JSON.stringify(result).includes(items[0].stem), false, 'Report does not echo question prose');
  }
});
test('answer-only maps with no stems are blocked by actual authored item identities', t => {
  const artifactRoot = fixture(t, { 'course-data.json': JSON.stringify({ [items[0].id]: items[0].correctChoice }) });
  const result = verifyNmlsPublicArtifact({ artifactRoot, items });
  assert.equal(result.ok, false); assert.equal(result.violations[0].code, 'private_assessment_identity_or_key_map');
  assert.equal(JSON.stringify(result).includes('correctChoice'), false);
});
test('symlinks, empty artifact and invalid inventories fail closed', t => {
  const artifactRoot = fixture(t, { 'index.html': 'Course' }); symlinkSync('index.html', join(artifactRoot, 'copy.html'));
  assert.ok(verifyNmlsPublicArtifact({ artifactRoot, items }).violations.some(v => v.code === 'public_artifact_symlink'));
  assert.throws(() => verifyNmlsPublicArtifact({ artifactRoot: fixture(t), items }), /empty/);
  assert.throws(() => verifyNmlsPublicArtifact({ artifactRoot, items: [] }), /source_inventory_invalid/);
});
test('CLI returns nonzero for a real current NMLS private item; no shell negation is needed', t => {
  const item = getNmlsDraftFinalDefinition(NMLS_TRAINING_COURSE.contentKey).items[0];
  const artifactRoot = fixture(t, { 'export.json': JSON.stringify({ [item.id]: item.correctChoice }) });
  const result = spawnSync(process.execPath, ['scripts/verify-nmls-public-artifact.mjs', artifactRoot], { encoding: 'utf8' });
  assert.equal(result.status, 1); assert.equal(JSON.parse(result.stdout).ok, false);
});
