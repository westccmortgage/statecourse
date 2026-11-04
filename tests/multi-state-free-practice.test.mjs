import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { PRACTICE_COLLECTIONS } from '../config/free-practice/collections.mjs';
import { WITHHELD_PRACTICE_COURSES } from '../config/free-practice-sources.mjs';
import { servePublicAssets } from '../worker/public-assets.mjs';

const dist = new URL('../dist/', import.meta.url);
const read = relative => fs.readFileSync(new URL(relative, dist), 'utf8');
const manifest = JSON.parse(read('data/free-practice-catalog.json'));
const targetStates = ['TX','FL','CO','AZ','NC','GA','PA','WA','NY'];
const origin = 'https://statecourse-course.crdpartners2020.chatgpt.site';
const assets = {fetch(request) {
  const url = new URL(request.url);
  try { return new Response(read(url.pathname.replace(/^\/statecourse\//,''))); }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return new Response('Missing asset', {status:404});
  }
}};

test('all state practice cards, canonicals, sitemap entries and public endpoints agree', async () => {
  const directory = read('free-practice/index.html');
  const sitemap = read('sitemap.xml');
  const registry = JSON.parse(read('data/state-registry.json'));
  assert.equal(new Set(manifest.states.map(state=>state.route)).size,manifest.states.length);
  for (const code of targetStates) assert.ok(manifest.states.some(state=>state.state_code===code),code);
  for (const state of manifest.states) {
    const {state_name:name,state_code:code,route,question_count:count} = state;
    assert.ok(directory.includes(`href="../${route}"`));
    assert.ok(sitemap.includes(`<loc>https://statecourse.com/${route}</loc>`));
    const response = await servePublicAssets(new Request(origin+'/'+route), assets);
    assert.equal(response?.status,200,route);
    assert.equal(response.headers.has('Location'),false,route);
    const page = await response.text();
    assert.ok(page.includes(`<title>Free ${name} Real Estate Practice Questions | StateCourse</title>`));
    assert.ok(page.includes(`rel="canonical" href="https://statecourse.com/${route}"`));
    assert.ok(page.includes(`data-free-practice data-state="${code}"`));
    assert.ok(page.includes(`Try ${count} original ${name} real estate practice questions`));
    assert.match(page,/Free practice\. No account required\..*original StateCourse educational questions.*not an official state exam.*does not create enrollment.*licensing credit.*completion certificate/);
    assert.doesNotMatch(page, /(?:href|action)="[^"]*(?:\/student\/|\/enroll\/|\/payment\/|\/certificates\/)|(?:state-approved|regulator-approved|guaranteed pass)/i);
    assert.ok(registry.states.some(entry=>entry.state_code===code));
  }
});

test('target banks preserve their state, all explanations, and four gradeable choices', async () => {
  const allIds = new Set();
  for (const code of targetStates) {
    const state = manifest.states.find(entry=>entry.state_code===code);
    let count = 0;
    for (const sample of manifest.samples.filter(entry=>entry.state_code===code)) {
      const response = await servePublicAssets(new Request(origin+'/'+sample.practice_url), assets);
      assert.equal(response?.status,200,sample.practice_url);
      const bank = await response.json();
      assert.equal(bank.course_id,sample.course_id);
      assert.equal(bank.state_code,code);
      assert.equal(bank.state_name,state.state_name);
      assert.equal(bank.questions.length,sample.question_count);
      count += bank.questions.length;
      for (const question of bank.questions) {
        assert.ok(question.id.startsWith(bank.course_id+':'));
        assert.equal(allIds.has(question.id),false,question.id);
        allIds.add(question.id);
        assert.equal(new Set(question.choices).size,4);
        assert.ok(question.prompt.trim() && question.explanation.trim());
        assert.ok(Number.isInteger(question.solution) && question.choices[question.solution]);
        if(bank.practice_only){
          assert.ok(question.category);
          assert.ok(question.sources.length);
          for(const source of question.sources){
            assert.ok(source.reference);
            assert.equal(new URL(source.url).protocol,'https:');
          }
        }
      }
    }
    assert.equal(count,state.question_count);
    assert.ok(count>=100,code);
  }
});

test('new collections do not create enrollment offerings or publish the withheld Washington bank', () => {
  const courseCatalog = JSON.parse(read('data/course-catalog.json'));
  const courseIds = courseCatalog.categories.flatMap(category=>category.programs??[])
    .flatMap(program=>program.courses??[]).map(course=>course.course_id);
  for (const collection of PRACTICE_COLLECTIONS) {
    assert.equal(courseIds.includes(collection.id),false);
    assert.equal(manifest.samples.find(sample=>sample.course_id===collection.id)?.practice_only,true);
  }
  const contexts = JSON.parse(read('learning-coach-library.json')).contexts;
  for (const id of WITHHELD_PRACTICE_COURSES) {
    assert.ok(courseIds.includes(id));
    assert.equal(manifest.samples.some(sample=>sample.course_id===id),false);
    assert.equal(contexts.some(context=>context.courseId===id),false);
    assert.equal(fs.existsSync(new URL(`free-practice/courses/${id}.json`,dist)),false);
    assert.equal(fs.existsSync(new URL(`free-practice/lessons/${id}/`,dist)),false);
  }
});

test('Pennsylvania public licensing uses current requirements and matches coach source digest', () => {
  const bank=JSON.parse(read('free-practice/courses/pa-real-estate-fundamentals-30.json'));
  const lesson=bank.lessons.find(entry=>entry.id==='module-01');
  const markdown=read(lesson.content_url);
  assert.match(markdown,/75 qualifying education hours/);
  assert.match(markdown,/within five years/);
  const questions=bank.questions.filter(question=>question.lesson_id===lesson.id);
  assert.equal(questions.length,11);
  assert.ok(questions.some(question=>question.choices[question.solution].includes('75 qualifying hours')));
  assert.ok(questions.some(question=>question.prompt.includes('five-year')));
  assert.ok(questions.every(question=>!/exceeds the minimum|ten-year education window/.test(question.explanation)));
  const context=JSON.parse(read('learning-coach-library.json')).contexts.find(entry=>entry.courseId===bank.course_id && entry.lessonId===lesson.id);
  assert.equal(context.lessonDigest,lesson.sha256);
});
