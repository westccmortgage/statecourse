import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SECTION_PLANS } from '../config/florida/course-i-curriculum.mjs';
import { validateFloridaManuscript } from '../scripts/lib/florida-manuscripts.mjs';

test('all nineteen canonical manuscripts retain section identity and the prescribed objective order',()=>{
  for(const section of SECTION_PLANS){
    const file=`../florida/fl-sales-associate-course-i-63-v1/curriculum/${String(section.number).padStart(2,'0')}-${section.slug}.md`;
    const text=readFileSync(new URL(file,import.meta.url),'utf8');
    assert.deepEqual(validateFloridaManuscript(section,text),[],file);
  }
});

test('the manuscript validator rejects a missing, duplicate or cross-state objective identity',()=>{
  const section=SECTION_PLANS[3];
  const text=readFileSync(new URL('../florida/fl-sales-associate-course-i-63-v1/curriculum/04-authorized-relationships-duties-disclosure.md',import.meta.url),'utf8');
  for(const changed of [
    text.replace(/^### Objective 4\.8.*$/m,''),
    text.replace('### Objective 4.8','### Objective 4.7'),
    text.replace('# FREC Course I — Section 4:','# Another State — Section 4:'),
    text.replaceAll('not approved','approved')
  ]) assert.ok(validateFloridaManuscript(section,changed).length>0);
});
