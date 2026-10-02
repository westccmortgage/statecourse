import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chunkLesson,readingChunkIndex,readingBookmarkKey,READING_CHUNK_LIMIT} from '../public/statecourse/student/pe-course/reading.mjs';
const digest=value=>createHash('sha256').update(value).digest('hex');
const lessonBytes=await fs.readFile(new URL('../config/nmls/pe-course/lessons.json',import.meta.url));
const unitBytes=await fs.readFile(new URL('../config/nmls/pe-course/units.json',import.meta.url));
const lessons=JSON.parse(lessonBytes),units=JSON.parse(unitBytes);
const preserved={PE01:'c24fb0290b5cf916c20b072cb65666fcc5922b3e7d32b42737a0bcd396e16adf',PE02:'f7edd8de770f67454bc6bd1c96a292a5c392613b4dbf4c3633a5a7dfc2c4f309',PE03:'ce5bf743412700296b5587ceed92d76521e14af5dfb440465587705a1ebc0ece',PE04:'aeb63a634c02ef87a6f26010c2716099058b3d82f2520e464ad9b3bcac81c186',PE05:'9f6cf7db3696d8344e9449edfcf9000ea9ae51ab201de70626938fab6dccbcdc',PE06:'dcc18417330a58e0f05c86de887bdf79dba1324ed6aa964c5b5a2bf9279c270c',PE07:'71da1ae3af8b67a60c739b8029ec274dd88c53cb16cad0d8ef028201359bc1bb',PE08:'b2c8ff0f9359b47145f1cb1ac1d952c7d4c563e028c34ec6c83a1e012ceede42'};
function verifyPreserved(source){for(const [id,hash] of Object.entries(preserved))assert.equal(digest(source[id]),hash,`${id}: manuscript changed`);}
test('all eight original manuscript hashes and exact 25-unit file bytes stay pinned',()=>{
 assert.equal(digest(lessonBytes),'55fe516447fdcc67d0dd77101799988c2a5d01dbd9e0455c4d349a58d724e289');
 assert.equal(digest(unitBytes),'b705b44701ad9e2bac1585e92e4a55f222f60f35499699ce31b9010dcea94663');
 assert.equal(units.length,25);assert.equal(Object.keys(lessons).length,8);verifyPreserved(lessons);
 for(const unit of units)assert.equal(unit.sourceHash,preserved[unit.module]);
 assert.throws(()=>verifyPreserved({...lessons,PE01:lessons.PE01+' '}),/manuscript changed/,'negative control must catch source drift');
});
test('bounded, deterministic slices partition every source byte without omission or duplication',()=>{
 for(const [id,text] of Object.entries(lessons)){
  const chunks=chunkLesson(text,id);assert.ok(chunks.length>20);assert.equal(new Set(chunks.map(c=>c.id)).size,chunks.length);
  assert.equal(chunks.map(c=>c.text).join(''),text);assert.equal(digest(chunks.map(c=>c.text).join('')),preserved[id]);
  assert.deepEqual(chunks,chunkLesson(text,id));let offset=0;
  for(const chunk of chunks){assert.equal(chunk.start,offset);assert.equal(chunk.text,text.slice(chunk.start,chunk.end));assert.ok(chunk.text.length>0&&chunk.text.length<=READING_CHUNK_LIMIT);offset=chunk.end;assert.match(chunk.id,/^pe0[1-8]-reading-[a-z0-9]+$/);}
  assert.equal(offset,text.length);
 }
});
test('all 25 unit defaults point to their actual source heading, with URL then bookmark precedence',()=>{
 for(const unit of units){
  const chunks=chunkLesson(lessons[unit.module],unit.module);const i=readingChunkIndex(chunks,{unitId:unit.unit});
  assert.match(chunks[i].text,new RegExp(`^## Unit ${unit.unit}\\b`));
  assert.equal(readingChunkIndex(chunks,{unitId:unit.unit,anchor:'not-a-source-anchor',saved:chunks.at(-1).id}),chunks.length-1);
  assert.equal(readingChunkIndex(chunks,{unitId:unit.unit,anchor:chunks[0].id,saved:chunks.at(-1).id}),0);
  assert.equal(readingChunkIndex(chunks,{unitId:unit.unit,saved:'stale-anchor'}),i);
 }
});
test('bookmark keys isolate actor, role, course, unit and source revision',()=>{
 const key={role:'student',courseId:'course-a',actorId:'actor-a',unitId:'1A',sourceHash:'hash-a'},base=readingBookmarkKey(key);
 for(const field of Object.keys(key))assert.notEqual(readingBookmarkKey({...key,[field]:key[field]+'-other'}),base);
});
test('long paragraphs, Unicode, CRLF and fenced heading-like text remain lossless and bounded',()=>{
 const source='# Header\r\n\r\n## Unit 1A Exact heading\r\n\r\n'+('alpha 🧭 beta '.repeat(100))+'\r\n\r\n```\r\n## Not a source heading\r\n'+('sample '.repeat(100))+'\r\n```\r\n';
 const chunks=chunkLesson(source,'PE01',{limit:128});assert.equal(chunks.map(c=>c.text).join(''),source);
 assert.ok(chunks.every(c=>c.text.length<=128&&!/^[\uDC00-\uDFFF]/.test(c.text)&&!/[\uD800-\uDBFF]$/.test(c.text)));
 assert.equal(chunks.flatMap(c=>c.headings).some(h=>h.title==='Not a source heading'),false);
 assert.deepEqual(chunkLesson('','PE01'),[]);assert.throws(()=>chunkLesson(source,'../bad'));assert.throws(()=>chunkLesson(source,'PE01',{limit:20}));
});
