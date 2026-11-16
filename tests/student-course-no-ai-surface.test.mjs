import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const publicFiles = [
  'public/statecourse/student/index.html',
  'public/statecourse/student/student-portal.js',
  'public/statecourse/student/course/index.html',
  'public/statecourse/student/course/student-course.js',
  'public/statecourse/student/course/blocks/index.html',
  'public/statecourse/student/course/blocks/block-player.js',
  'public/statecourse/student/nmls-training/index.html',
  'public/statecourse/student/nmls-training/nmls-training.mjs',
  'public/statecourse/free-practice/index.html',
  'public/statecourse/free-practice.js',
  'public/statecourse/about/index.html',
  'public/statecourse/pricing/index.html',
  'dist/student/index.html',
  'dist/student/course/index.html',
  'dist/student/course/student-course.js',
  'dist/student/course/blocks/index.html',
  'dist/student/course/blocks/block-player.js',
  'dist/student/nmls-training/index.html',
  'dist/student/nmls-training/nmls-training.mjs',
  'dist/free-practice/index.html',
  'dist/free-practice.js',
  'dist/about/index.html',
  'dist/pricing/index.html',
];

const forbidden = /\bAI\b|artificial intelligence|OpenAI|ChatGPT|learning-coach|\/ai\/plans/i;

test('student and course surfaces do not advertise or mount AI features', () => {
  for (const file of publicFiles) {
    const source = readFileSync(file, 'utf8');
    assert.doesNotMatch(source, forbidden, file);
  }
});
