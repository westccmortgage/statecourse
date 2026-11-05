import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { COLORADO_RELATIONSHIP_POLICY, validateColoradoRelationshipPolicy } from '../config/colorado/current-relationships.mjs';
import { pennsylvaniaEducationValidity, getPennsylvaniaCourse } from '../config/pennsylvania-course-engine.mjs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('current relationship validator rejects each obsolete or incomplete policy', () => {
  assert.deepEqual(validateColoradoRelationshipPolicy(COLORADO_RELATIONSHIP_POLICY), []);
  const mutations = [
    { defaultRelationship: 'transaction-broker' },
    { writtenAgreementRequiredFor: ['sellers-agent', 'buyers-agent'] },
    { conspicuousCompensationRequired: false },
    { mustCompleteBeforeLicensedActivities: false },
    { compensationOnlyDisclosureSufficient: true }
  ];
  for (const mutation of mutations) assert.ok(validateColoradoRelationshipPolicy({ ...COLORADO_RELATIONSHIP_POLICY, ...mutation }).length > 0);
});

test('current PA standard does not accept the superseded ten-year window or invalid dates', () => {
  assert.equal(pennsylvaniaEducationValidity('2020-11-05','2026-11-05').withinWindow,false);
  assert.equal(pennsylvaniaEducationValidity('2024-02-29','2029-02-28').expiresOn,'2029-02-28');
  assert.equal(pennsylvaniaEducationValidity('2024-02-31','2025-01-01'),null);
  assert.equal(pennsylvaniaEducationValidity('2025-01-01','2024-12-31').withinWindow,false);
  assert.equal(getPennsylvaniaCourse('pa-real-estate-practice-45-v1').durationEvidence.observedInstructionMinutes,null);
});

test('acquired primary-source bytes match the retained manifests', () => {
  for (const [state,minimum] of [['pennsylvania',14],['colorado',2],['florida',3],['georgia',1],['new-york',4]]) {
    const root = `${state}/regulatory/captures/2026-11-05/`;
    const { sources } = JSON.parse(read(`${root}manifest.json`));
    assert.ok(sources.length >= minimum, state);
    for (const source of sources) {
      const bytes=readFileSync(new URL(`../${root}${source.file}`,import.meta.url));
      assert.equal(bytes.length,source.bytes,source.file);
      assert.equal(createHash('sha256').update(bytes).digest('hex'),source.sha256,source.file);
    }
  }
});

test('Colorado active teaching and correct formative answers cannot restore the repealed rule', async () => {
  const forbidden = /a broker shall be considered a transaction-broker unless|one who signs nothing establishing agency|relationship does not require a written agreement/i;
  for (const file of readdirSync(new URL('../config/colorado/',import.meta.url)).filter(name=>name.endsWith('question-bank.mjs'))) {
    const {default: bank}=await import(`../config/colorado/${file}`);
    for (const [moduleId,module] of Object.entries(bank)) for (const item of [module.applied,...module.engagement,...module.remediation]) {
      assert.doesNotMatch(`${item.choices[item.correctChoice]} ${item.rationale}`,forbidden,`${file}/${moduleId}`);
    }
  }
  for (const course of readdirSync(new URL('../colorado/',import.meta.url)).filter(name=>name.startsWith('co-'))) {
    for (const file of readdirSync(new URL(`../colorado/${course}/curriculum/`,import.meta.url))) {
      const text=read(`colorado/${course}/curriculum/${file}`).replace(/\*|\n|>/g,' ').replace(/\s+/g,' ');
      assert.doesNotMatch(text,forbidden,`${course}/${file}`);
    }
  }
});

test('all nine instructor assignments remain explicitly deferred and unassigned', () => {
  const policy=JSON.parse(read('config/submission/instructor-assignments.json'));
  assert.deepEqual(policy.assignments.map(item=>item.state).sort(),['AZ','CO','FL','GA','NC','NY','PA','TX','WA']);
  for (const assignment of policy.assignments) {
    assert.equal(assignment.status,'DEFERRED_BY_OWNER');
    assert.deepEqual(assignment.instructors,[]);
  }
});
