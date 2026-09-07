import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {collectCourseReferences, exportedUrls, staticRelativeImports, statutoryHtmlIssues, traceModuleInputs} from '../scripts/lib/texas-source-links.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const fixtures = path.join(here, 'fixtures/texas-source-links');
const parserRoot = process.env.STATECOURSE_CHECKOUT ?? path.resolve(here, '..');

test('runtime factory result is collected; unused constant prefix and protected fields are not emitted', async () => {
  const course = {curriculumDir:'curriculum', outlinePath:'entry.mjs', coursePath:'entry.mjs', questionBankPath:'entry.mjs', scenarioPath:'entry.mjs', finalBankPath:'entry.mjs', finalFormsPath:'entry.mjs'};
  const report = await collectCourseReferences({root:fixtures, courses:[course], parserRoot});
  assert.deepEqual([...report.references.keys()].sort(), ['https://example.test/required-reading', 'https://tcss.legis.texas.gov/resources/CN/htm/CN.16.htm', 'https://tcss.legis.texas.gov/resources/PR/htm/PR.51.htm']);
  assert.equal(report.references.has('https://tcss.legis.texas.gov/resources/'), false);
  assert.ok(report.inputs.some(x => x.path === 'protected/override.mjs'));
  assert.ok(report.inputs.every(x => /^[a-f0-9]{64}$/.test(x.sha256)));
  assert.doesNotMatch(JSON.stringify({...report, references:[...report.references.keys()]}), /PRIVATE_TEST_STEM|correctChoice|secret-key/);
});

test('cycles, alias exports, functions, maps, sets, and accessors are handled without executing code', () => {
  const a = {url:'https://example.test/a', factory:()=>{throw Error('called')}}; a.self=a;
  Object.defineProperty(a, 'getter', {enumerable:true, get(){throw Error('called')}});
  assert.deepEqual([...exportedUrls({a, alias:a, map:new Map([['x','https://example.test/b']]), set:new Set([a])})].sort(), ['https://example.test/a','https://example.test/b']);
});

test('static imports and reexports include protected dependencies but ignore comments and strings', () => {
  const source = `// import './fake-a.mjs';\nconst x="export * from './fake-b.mjs'";\nimport {x as y} from './real-a.mjs';\nexport {z} from '../real-b.mjs';\nimport './side-effect.mjs';`;
  assert.deepEqual(staticRelativeImports(source, parserRoot), ['./real-a.mjs','../real-b.mjs','./side-effect.mjs']);
  assert.deepEqual(traceModuleInputs({root:fixtures, entries:['entry.mjs'], parserRoot}).map(x=>x.path), ['entry.mjs','factory.mjs','protected/override.mjs']);
});

test('false 200 SPA and script-only identity do not establish chapter identity', () => {
  const url='https://tcss.legis.texas.gov/resources/PR/htm/PR.51.htm';
  assert.ok(statutoryHtmlIssues(url,'<title>Texas Statutes</title><div id="root"></div>').includes('EXPECTED_STATUTORY_CHAPTER_MISSING'));
  assert.ok(statutoryHtmlIssues(url,'<head><title>PROPERTY CODE CHAPTER 51</title></head><script>CHAPTER 51</script><div id="root"></div>').includes('EXPECTED_STATUTORY_CHAPTER_MISSING'));
});

test('constitution identity accepts case-insensitive Roman I/XVI and validates its fragment', () => {
  for(const [n,r] of [[1,'I'],[16,'XVI']]) {
    const html=`<head><title>Texas Constitution article ${r}</title></head><h1>ARTICLE ${r.toLowerCase()}</h1><a NAME='${n}.50'></a>`;
    assert.deepEqual(statutoryHtmlIssues(`https://tcss.legis.texas.gov/resources/CN/htm/CN.${n}.htm#${n}.50`,html),[]);
    assert.deepEqual(statutoryHtmlIssues(`https://tcss.legis.texas.gov/resources/CN/htm/CN.${n}.htm`,html,[`${n}.51`]),[`ANCHOR_NOT_FOUND:${n}.51`]);
  }
  assert.ok(statutoryHtmlIssues('https://tcss.legis.texas.gov/resources/CN/htm/CN.16.htm','<title>ARTICLE I</title><h1>ARTICLE I</h1>').includes('EXPECTED_CONSTITUTION_ARTICLE_MISSING'));
});

test('numeric chapter checks use real body identity and decoded named/id anchors', () => {
  const html='<head><title>PROPERTY CODE CHAPTER 51.</title></head><h1>Chapter 51. Liens</h1><a ID="51.002"></a><a name=51.003></a>';
  const url='https://tcss.legis.texas.gov/resources/PR/htm/PR.51.htm';
  assert.deepEqual(statutoryHtmlIssues(url,html,['51%2E002','51.003']),[]);
  assert.deepEqual(statutoryHtmlIssues(url,html,['51.999']),['ANCHOR_NOT_FOUND:51.999']);
});
