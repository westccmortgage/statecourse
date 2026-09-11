import test from 'node:test';
import assert from 'node:assert/strict';
import account from '../netlify/functions/student-account.mjs';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const origin='https://statecourse.com';
const user={id:'existing-user',email:'person@example.test'};
function request(body, cookie='', from=origin) { return new Request(origin+'/api/student/account',{method:'POST',headers:{origin:from,'content-type':'application/json',cookie},body:JSON.stringify(body)}); }
async function mock(run, reply) {
 const oldFetch=globalThis.fetch, oldNetlify=globalThis.Netlify, saved={...process.env};
 const vars={SUPABASE_URL:'https://project.example.test',SUPABASE_ANON_KEY:'sb_publishable_example',SUPABASE_SERVICE_ROLE_KEY:'sb_secret_example',STATECOURSE_BASE_URL:origin};
 Object.assign(process.env,vars);globalThis.Netlify={env:{get:k=>vars[k]}};
 const calls=[];
 globalThis.fetch=async(url,options={})=>{
  const call={url,options,body:options.body?JSON.parse(options.body):undefined};calls.push(call);
  const override=reply?.(call);if(override)return override;
  if(url.includes('/rest/'))return new Response(null,{status:204});
  if(url.includes('/settings'))return Response.json({external:{google:true}});
  if(url.includes('/token'))return Response.json({user,access_token:'verified.user.access.token',refresh_token:'refresh-token'});
  if(url.includes('/user'))return Response.json(user);
  return Response.json({});
 };
 try{await run(calls);}finally{globalThis.fetch=oldFetch;globalThis.Netlify=oldNetlify;for(const k of Object.keys(process.env))if(!(k in saved))delete process.env[k];Object.assign(process.env,saved);}
}
test('cross-origin requests cannot send email or change credentials',async()=>mock(async calls=>{assert.equal((await account(request({action:'forgot',email:user.email},'','https://other.test'))).status,403);assert.equal(calls.length,0);}));
test('forgot password requests the approved production redirect and returns no account details',async()=>mock(async calls=>{const r=await account(request({action:'forgot',email:user.email}));assert.equal(r.status,200);assert.equal(calls.length,1);assert.equal(new URL(calls[0].url).searchParams.get('redirect_to'),origin+'/student/sign-in/');assert.equal(calls[0].options.headers.authorization,undefined);assert.equal((await r.json()).message,'If an account uses that email, a password reset link will be sent.');}));
test('reset requires a reset token; an existing browser session alone is insufficient',async()=>mock(async calls=>{assert.equal((await account(request({action:'reset',password:'new-long-password'},'__Host-sc_access=old'))).status,401);assert.equal(calls.length,0);}));
test('forged or expired reset token never reaches password update',async()=>mock(async calls=>{const r=await account(request({action:'reset',password:'new-long-password',recoveryToken:'forged.access.token.value'}));assert.equal(r.status,401);assert.equal((await r.json()).error,'reset_link_expired');assert.equal(calls.some(x=>x.options.method==='PUT'),false);},()=>Response.json({code:'bad_jwt'},{status:401})));
test('valid reset updates only the verified token owner, revokes refresh sessions and clears browser cookies',async()=>mock(async calls=>{const r=await account(request({action:'reset',password:'new-long-password',recoveryToken:'verified.recovery.access.token',userId:'other-user'}));assert.equal(r.status,200);const update=calls.find(x=>x.options.method==='PUT');assert.deepEqual(update.body,{password:'new-long-password'});assert.equal(update.options.headers.authorization,'Bearer verified.recovery.access.token');assert.ok(calls.some(x=>x.url.endsWith('logout?scope=global')));assert.ok(r.headers.getSetCookie().every(x=>x.includes('Max-Age=0')));assert.equal(JSON.stringify(await r.json()).includes('token'),false);}));
test('short new password is rejected before contacting Auth',async()=>mock(async calls=>{assert.equal((await account(request({action:'reset',password:'short'}))).status,400);assert.equal(calls.length,0);}));
test('changing password requires an authenticated session',async()=>mock(async calls=>{assert.equal((await account(request({action:'change',password:'new-long-password',currentPassword:'old'}))).status,401);assert.equal(calls.length,0);}));
test('incorrect current password cannot update the account',async()=>mock(async calls=>{const r=await account(request({action:'change',password:'new-long-password',currentPassword:'wrong'},'__Host-sc_access=valid-session'));assert.equal(r.status,401);assert.equal((await r.json()).error,'current_password_incorrect');assert.equal(calls.some(x=>x.options.method==='PUT'),false);},call=>call.url.includes('/token')?Response.json({code:'invalid_credentials'},{status:400}):null));
test('current password is checked against the session email, not an email supplied by the browser',async()=>mock(async calls=>{const r=await account(request({action:'change',email:'attacker@example.test',password:'new-long-password',currentPassword:'current'},'__Host-sc_access=valid-session'));assert.equal(r.status,200);assert.equal(calls.find(x=>x.url.includes('/token')).body.email,user.email);}));
test('different reauthenticated user is refused',async()=>mock(async calls=>{assert.equal((await account(request({action:'change',password:'new-long-password',currentPassword:'current'},'__Host-sc_access=valid-session'))).status,401);assert.equal(calls.some(x=>x.options.method==='PUT'),false);},call=>call.url.includes('/token')?Response.json({user:{id:'different-user'},access_token:'different-token'}):null));
test('Google start sets HttpOnly PKCE verifier and fixed callback, not an arbitrary return URL',async()=>mock(async()=>{const r=await account(request({action:'google_start',destination:'https://attacker.test'}));assert.equal(r.status,200);const url=new URL((await r.json()).url);assert.equal(url.searchParams.get('redirect_to'),origin+'/student/sign-in/');assert.equal(url.searchParams.get('code_challenge_method'),'s256');assert.equal(url.searchParams.get('code_challenge').length,43);const cookies=r.headers.getSetCookie();assert.match(cookies[0],/HttpOnly; Secure; SameSite=Lax/);}));
test('disabled Google provider does not produce a broken authorization redirect',async()=>mock(async()=>{const r=await account(request({action:'google_start'}));assert.equal(r.status,503);assert.equal((await r.json()).error,'google_not_configured');},()=>Response.json({external:{google:false}})));
test('OAuth code without browser verifier cannot establish a session',async()=>mock(async calls=>{assert.equal((await account(request({action:'google_finish',code:'stolen-code'}))).status,401);assert.equal(calls.length,0);}));
test('OAuth exchange verifies the user and returns only HttpOnly session cookies, never staff roles',async()=>mock(async calls=>{const verifier='a'.repeat(43);const r=await account(request({action:'google_finish',code:'valid-code'},'__Host-sc_pkce='+verifier));assert.equal(r.status,200);assert.equal(calls[0].body.code_verifier,verifier);assert.ok(calls.some(x=>x.url.endsWith('/user')));assert.deepEqual(await r.json(),{ok:true});assert.ok(r.headers.getSetCookie().some(x=>x.startsWith('__Host-sc_access=')&&x.includes('HttpOnly; Secure')));}));
test('rate limit remains a rate limit',async()=>mock(async()=>{assert.equal((await account(request({action:'forgot',email:user.email}))).status,429);},()=>Response.json({},{status:429})));
test('successful password update is not reported as failed when global signout fails',async()=>mock(async()=>{const r=await account(request({action:'reset',password:'new-long-password',recoveryToken:'verified.recovery.access.token'}));assert.equal(r.status,200);assert.equal((await r.json()).sessionsRevoked,false);},call=>call.url.includes('/logout')?Response.json({},{status:503}):null));

test('recovery callback removes the original token URL and forwards before normal sign-in',()=>{
 const fragment='#type=recovery&access_token=mail-token', actions=[];
 const doc={documentElement:{dataset:{}},addEventListener(){throw new Error('Recovery should navigate immediately');}};
 vm.runInNewContext(readFileSync(new URL('../public/statecourse/student/auth-entry.js',import.meta.url),'utf8'),{URLSearchParams,document:doc,location:{hash:fragment,search:'',pathname:'/student/sign-in/',replace:path=>actions.push(['navigate',path])},history:{replaceState:(_,__,path)=>actions.push(['clean',path])}});
 assert.equal(doc.documentElement.dataset.authCallback,'true');
 assert.deepEqual(actions,[['clean','/student/sign-in/'],['navigate','/student/password/'+fragment]]);
});
async function passwordUI(mismatch=false){
 const elements=new Map(), calls=[];let submit;
 const el=id=>{if(!elements.has(id))elements.set(id,{value:'',type:'password',setAttribute(){},removeAttribute(){},focus(){},addEventListener:(name,fn)=>{if(id==='passwordForm'&&name==='submit')submit=fn;},reportValidity:()=>true,reset(){}});return elements.get(id);};
 vm.runInNewContext(readFileSync(new URL('../public/statecourse/student/password/password.js',import.meta.url),'utf8'),{URLSearchParams,document:{getElementById:el},location:{hash:'#type=recovery&access_token=verified.recovery.token',pathname:'/student/password/',search:''},history:{replaceState:(_,__,path)=>calls.push({clean:path})},fetch:async(url,options)=>{calls.push({url,body:JSON.parse(options.body)});return{ok:true,json:async()=>({ok:true,sessionsRevoked:true})};}});
 el('newPassword').value='new-password-value';el('confirmPassword').value=mismatch?'different-password':'new-password-value';
 await submit({preventDefault(){}});return{calls,elements};
}
test('recovery form strips URL tokens, posts reset proof and gives sign-in instructions',async()=>{const{calls,elements}=await passwordUI();assert.deepEqual(calls[0],{clean:'/student/password/'});assert.equal(calls[1].body.action,'reset');assert.equal(calls[1].body.recoveryToken,'verified.recovery.token');assert.equal(elements.get('passwordForm').hidden,true);assert.match(elements.get('message').textContent,/password has been changed/);});
test('mismatched password confirmation sends no request',async()=>{const{calls,elements}=await passwordUI(true);assert.equal(calls.length,1);assert.match(elements.get('message').textContent,/do not match/);});
