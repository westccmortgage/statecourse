const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async()=>{
 const root=path.resolve('public/statecourse');
 const server=http.createServer((req,res)=>{let p=decodeURIComponent(new URL(req.url,'http://local').pathname);if(p.endsWith('/'))p+='index.html';let f=path.join(root,p);if(!f.startsWith(root)||!fs.existsSync(f)){res.writeHead(404).end();return;}res.setHeader('content-type',p.endsWith('.js')?'application/javascript':p.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(f));});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE ? {executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox','--disable-dev-shm-usage']} : {})});const page=await browser.newPage({viewport:{width:1100,height:850}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.route('**/api/staff/security',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,owner:true,factors:[{id:'test-factor',name:'Authenticator'}]})}));
  await page.goto(origin+'/staff/sign-in/');await page.locator('#mfa').waitFor({state:'visible'});
  assert.equal(await page.locator('#login').isHidden(),true);
  assert.equal(await page.locator('#ticketLabel').isHidden(),true);
  await page.unroute('**/api/staff/security');
  await page.route('**/api/staff/security',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,owner:true,factors:[]})}));
  await page.reload();assert.equal(await page.locator('#mfa').isHidden(),true);
  // Execute the action client against a controlled denied-then-authorized API.
  await page.addScriptTag({url:origin+'/staff/action-proof.js'});
  let executions=0;let received;
  await page.route('**/api/admin/workspace',async route=>{
    const proof=route.request().headers()['x-statecourse-action-proof'];
    if(!proof)return route.fulfill({status:403,contentType:'application/json',body:'{"error":"fresh_action_authorization_required"}'});
    executions++;return route.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'});
  });
  await page.unroute('**/api/staff/security');
  await page.route('**/api/staff/security',async route=>{
    if(route.request().method()==='GET')return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,factors:[{id:'test-factor',name:'Authenticator'}]})});
    received=route.request().postDataJSON();return route.fulfill({status:200,contentType:'application/json',body:'{"ok":true,"actionProof":"test-one-use"}'});
  });
  const pending=page.evaluate(()=>fetch('/api/admin/workspace',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'publish',course:'test'})}).then(r=>r.json()));
  await page.locator('dialog').waitFor();assert.equal(executions,0);await page.getByLabel('Authenticator code').fill('123456');
  assert.equal(await page.getByText('Review the requested change').isVisible(),true);
  await page.getByRole('button',{name:'Verify and approve'}).click();assert.equal((await pending).ok,true);
  assert.equal(executions,1);assert.match(received.intent,/^[a-f0-9]{64}$/);assert.deepEqual(errors,[]);
  console.log('PASS: staff page renders; no-factor flow stays closed; action waits for explicit MFA; exact request is retried once; no browser errors.');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e.message);process.exit(1)});
