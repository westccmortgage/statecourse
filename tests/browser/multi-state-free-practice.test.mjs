// Run after bash site/build.sh with PRACTICE_PLAYWRIGHT_MODULE and PRACTICE_CHROMIUM set.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = fileURLToPath(new URL('../../dist/', import.meta.url));
const manifest = JSON.parse(await fs.readFile(path.join(root,'data/free-practice-catalog.json'),'utf8'));
const {chromium} = await import(pathToFileURL(process.env.PRACTICE_PLAYWRIGHT_MODULE));
const types = {'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json'};

test('anonymous desktop and mobile practice reaches feedback for all nine states', async () => {
  const server = http.createServer(async (request,response) => {
    const url = new URL(request.url,'http://localhost');
    const file = path.resolve(root,'.'+url.pathname+(url.pathname.endsWith('/')?'index.html':''));
    if (!file.startsWith(root)) { response.writeHead(404).end(); return; }
    try {
      const body = await fs.readFile(file);
      response.writeHead(200,{'Content-Type':types[path.extname(file)]??'application/octet-stream'}).end(body);
    } catch { response.writeHead(404).end(); }
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base = 'http://127.0.0.1:'+server.address().port;
  let browser;
  try {
    browser = await chromium.launch({executablePath:process.env.PRACTICE_CHROMIUM,args:['--no-sandbox','--disable-dev-shm-usage']});
    for (const viewport of [{width:1366,height:850},{width:390,height:844}]) {
      const page = await browser.newPage({viewport});
      page.setDefaultTimeout(8000);
      const errors = [];
      const restricted = [];
      page.on('pageerror',error=>errors.push(error.message));
      page.on('request',request=>{
        if (request.method() !== 'GET' || /\/(?:enroll|payment|student\/sign-in|certificates)(?:\/|\?|$)/.test(request.url())) {
          restricted.push(request.url());
        }
      });
      await page.goto(base+'/');
      for (const code of ['FL','GA','NY']) {
        await page.locator(`#homeStateSelect option[value="${code}"]`).waitFor({state:'attached'});
        assert.equal(await page.locator(`#homeStateSelect option[value="${code}"]`).isDisabled(),false);
      }
      await page.goto(base+'/free-practice/');
      for (const code of ['TX','FL','CO','AZ','NC','GA','PA','WA','NY']) {
        const state = manifest.states.find(state=>state.state_code===code);
        await page.locator(`a[href="../${state.route}"]`).click();
        assert.equal(new URL(page.url()).pathname,'/'+state.route);
        await page.locator('#practiceQuiz legend').waitFor();
        assert.equal(await page.locator('#practiceStateSelect').inputValue(),code);
        const sample = manifest.samples.find(sample=>sample.state_code===code);
        const bank = JSON.parse(await fs.readFile(path.join(root,sample.practice_url),'utf8'));
        await page.locator(`#practiceAnswerForm input[value="${bank.questions[0].solution}"]`).check();
        await page.getByRole('button',{name:'Check answer'}).click();
        assert.match(await page.locator('#practiceFeedback').innerText(),/Correct\./);
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
        await page.getByRole('link',{name:'Browse all practice states'}).click();
      }
      const other = manifest.samples.find(sample=>sample.state_code==='TX').course_id;
      await page.goto(base+'/free-practice/new-york/?state=TX&course='+other);
      await page.locator('#practiceQuiz legend').waitFor();
      assert.equal(await page.locator('#practiceStateSelect').inputValue(),'NY');
      assert.match(await page.locator('#practiceCourseTitle').innerText(),/New York/);
      await page.locator('#practiceStateSelect').selectOption('FL');
      await page.waitForURL(url=>url.pathname==='/free-practice/florida/');
      await page.locator('#practiceQuiz legend').waitFor();
      assert.match(await page.locator('#practiceCourseTitle').innerText(),/Florida/);
      assert.deepEqual(errors,[]);
      assert.deepEqual(restricted,[]);
      await page.close();
    }
  } finally {
    await browser?.close();
    await new Promise(resolve=>server.close(resolve));
  }
});
