// Exercises the shipped availability script and generated course markup without creating enrollments.
import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
if (!process.argv[2]) throw new Error('Pass the absolute path to the installed jsdom/lib/api.js.');
const {JSDOM} = await import(pathToFileURL(process.argv[2]));
const root = new URL('../public/statecourse/', import.meta.url);
const script = await fs.readFile(new URL('course-training.js', root), 'utf8');
const page = await fs.readFile(new URL('real-estate/california/pre-license/principles/index.html', root), 'utf8');
assert.match(page, /data-training-offering="ca-real-estate-principles-45"/);
assert.match(page, /type="module" src="[^"]*course-training\.js"/);
let checks = 2;
for (const scenario of [
  {label:'enabled matching course', ok:true, training:{available:true,courses:[{id:'ca-real-estate-principles-45'}]}, visible:true},
  {label:'another course only', ok:true, training:{available:true,courses:[{id:'tx-law-of-agency-30-v1'}]}, visible:false},
  {label:'disabled course', ok:true, training:{available:true,courses:[]}, visible:false},
  {label:'unreadable decisions', ok:true, training:{available:false,courses:[]}, visible:false},
  {label:'failed endpoint', ok:false, visible:false}
]) {
  const dom = new JSDOM(page, {url:'https://statecourse.test/real-estate/california/pre-license/principles/',runScripts:'outside-only'});
  const {window:w} = dom, calls = [];
  w.fetch = async (url, options) => { calls.push({url,options});return {ok:scenario.ok,json:async()=>({training:scenario.training})}; };
  try {
    await w.eval('(async()=>{'+script+'})()');
    const offer=w.document.querySelector('[data-training-offering]');
    assert.equal(!offer.hidden, scenario.visible, scenario.label);checks++;
    assert.equal(calls.length,1);assert.equal(calls[0].url,'/api/payments/config');
    assert.equal(calls[0].options.credentials,'omit');assert.equal(calls[0].options.method,undefined);checks+=4;
    if (scenario.visible) {
      assert.equal(offer.querySelector('a').getAttribute('href'),'/student/sign-in/');
      assert.match(offer.textContent,/does not earn licensing or continuing education credit/);
      assert.equal(offer.querySelectorAll('a').length,2);checks+=3;
    }
  } finally {dom.window.close();}
}
console.log(JSON.stringify({domChecks:checks,passed:checks,externalRequests:0,enrollmentsCreated:0}));
