// Additive checks for the existing local-only native acceptance harness. Call
// after a fresh actor page is idle and while observed work is paused. Serve
// /student/pe-course/reading.mjs alongside course.mjs in the fixture file map.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chunkLesson,readingChunkIndex} from '../../public/statecourse/student/pe-course/reading.mjs';
const lessons=JSON.parse(await fs.readFile(new URL('../../config/nmls/pe-course/lessons.json',import.meta.url)));
const units=JSON.parse(await fs.readFile(new URL('../../config/nmls/pe-course/units.json',import.meta.url)));
export async function assertPeReadingBrowser(page,{unitId='1A'}={}){
 const unit=units.find(u=>u.unit===unitId),chunks=chunkLesson(lessons[unit.module],unit.module),start=readingChunkIndex(chunks,{unitId});
 const anchor=async()=>page.locator('#lesson').getAttribute('data-anchor');
 assert.equal(await page.locator('#unit option').count(),25);assert.equal(await anchor(),chunks[start].id);
 assert.equal(await page.locator('#readingOutline a').count(),chunks.length);
 assert.ok((await page.locator('#lesson').textContent()).length<=4200);
 const before=await page.locator('#progress').textContent(),requests=[];
 const onRequest=request=>{if(request.method()==='POST'&&new URL(request.url()).pathname.startsWith('/api/')){const op=request.postDataJSON()?.operation;if(!op?.startsWith('policy-'))requests.push({url:request.url(),operation:op});}};
 page.on('request',onRequest);
 try{
  await page.locator('#readingContinue').click();assert.equal(await anchor(),chunks[start+1].id);
  assert.equal(await page.locator('#lesson').evaluate(node=>node===document.activeElement),true);
  assert.equal(new URL(page.url()).hash,'#'+chunks[start+1].id);
  await page.locator('#readingPrevious').click();assert.equal(await anchor(),chunks[start].id);
  await page.locator('.reading-outline summary').click();await page.locator('#readingOutline a').last().click();
  assert.equal(await anchor(),chunks.at(-1).id);assert.equal(await page.locator('#readingContinue').isDisabled(),true);
  assert.equal(await page.locator('#readingContinue').textContent(),'End of module reading');
  await page.goBack();await page.waitForFunction(id=>document.getElementById('lesson').dataset.anchor===id,chunks[start].id);
  await page.goForward();await page.waitForFunction(id=>document.getElementById('lesson').dataset.anchor===id,chunks.at(-1).id);
  await page.locator('#readingUnitStart').click();assert.equal(await anchor(),chunks[start].id);
  assert.equal(await page.locator('#progress').textContent(),before);assert.deepEqual(requests,[],'Reading navigation must not send observation/completion/contribution requests');
 }finally{page.off('request',onRequest);}
 await page.locator('#readingContinue').click();const saved=await anchor();await page.reload();await page.locator('#activity').waitFor({state:'visible'});await page.waitForFunction(()=>!document.getElementById('unit').disabled);
 assert.equal(await anchor(),saved);assert.equal(await page.locator('#study').textContent(),'Start observed work');
 await page.locator('#readingUnitStart').click();
 return ['Bounded source slice, full outline, focus and stable reading anchors','Previous/continue/Back/Forward send no course mutation and make no credit claim','Reload preserves actor/unit reading position and observed work stays paused'];
}
