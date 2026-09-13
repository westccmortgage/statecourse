import { readFile, mkdir, writeFile, rm, readdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { nmlsTrainingDefinition } from '../config/nmls-training-definition.mjs';
import { verifyNmlsPublicArtifact } from './verify-nmls-public-artifact.mjs';

// Offline packaging only. Uses the locally installed Netlify bundling library,
// not the CLI, login state, environment files or deployment APIs.
const root=fileURLToPath(new URL('../',import.meta.url));
const require=createRequire(import.meta.url);
const modulePath=process.env.NMLS_ZISI_MODULE||require.resolve('@netlify/zip-it-and-ship-it');
const {zipFunction}=await import(pathToFileURL(modulePath).href);
const libraryRequire=createRequire(modulePath);
const toml=libraryRequire('toml');
const settings=toml.parse(await readFile(resolve(root,'netlify.toml'),'utf8'));
const global=settings.functions||{};
const config={'*':{includedFiles:global.included_files||[],
 ...(global.node_bundler?{nodeBundler:global.node_bundler}:{}),
 ...(global.external_node_modules?{externalNodeModules:global.external_node_modules}:{})}};
const targets=['student-nmls-training.mts','admin-workspace.mjs','enroll-training.mts','student-portal.mts'];
const destination=resolve(root,'.netlify/functions-bundle-audit');
await mkdir(destination,{recursive:true});
// Remove only this audit's four generated outputs before dependency tracing.
// Retaining unpacked bundles inside the source tree causes NFT to discover
// recursive copies as dynamic file dependencies, even during a single run.
for(const target of targets)await rm(resolve(destination,target.replace(/\.[^.]+$/,'')),{recursive:true,force:true});
const results=[];
const definition=nmlsTrainingDefinition();
const glob=libraryRequire('fast-glob');
const included=await glob(global.included_files||[],{cwd:root,onlyFiles:true});
for(const target of targets){
 const name=target.replace(/\.[^.]+$/,'');
 const bundle=await zipFunction(resolve(root,'netlify/functions',target),resolve(destination,name),{
  archiveFormat:'zip',basePath:root,config,
 });
 if(!bundle)throw Error(`No bundle produced for ${target}`);
 assert.equal(bundle.runtimeAPIVersion,2,`${target} must use the current Request/Response API`);
 assert.equal(bundle.bundlerErrors?.length||0,0);assert.equal(bundle.bundlerWarnings?.length||0,0);
 const taskRoot=resolve(destination,name,'unpacked');
 await mkdir(taskRoot,{recursive:true});
 execFileSync('/usr/bin/unzip',['-q',bundle.path,'-d',taskRoot]);
 const packagedFiles=await readdir(taskRoot,{recursive:true});
 assert.equal(packagedFiles.some(file=>/(?:^|\/)(?:\.env[^/]*|\.git|\.netlify|credentials)(?:\/|$)/.test(file)),false,
  `${target}: no credentials, repository metadata or nested audit output may be packaged`);
 for(const file of included)assert.deepEqual(await readFile(resolve(taskRoot,file)),await readFile(resolve(root,file)),`${target}: ${file}`);
 const smoke=JSON.parse(execFileSync(process.execPath,[resolve(root,'scripts/smoke-nmls-function-bundle.mjs'),name],{
  cwd:taskRoot,env:{TZ:'UTC'},input:JSON.stringify(definition),encoding:'utf8',timeout:30000,
 }));
 // Keep the actual deployable archive, not an unpacked sibling which later
 // function tracing could mistake for a second copy of dynamic content.
 await rm(taskRoot,{recursive:true,force:true});
 bundle.audit={includedFilesVerified:included.length,smoke};
 results.push(bundle);
 console.log(JSON.stringify({name:bundle.name,path:bundle.path,mainFile:bundle.mainFile,
  runtimeAPIVersion:bundle.runtimeAPIVersion,bundler:bundle.bundler,config:bundle.config,
  bundlerErrors:bundle.bundlerErrors,bundlerWarnings:bundle.bundlerWarnings,audit:bundle.audit}));
}
await writeFile(resolve(destination,'bundle-results.json'),JSON.stringify(results,null,2));
const publicArtifact=verifyNmlsPublicArtifact({artifactRoot:resolve(root,settings.build.publish)});
assert.equal(publicArtifact.ok,true,JSON.stringify(publicArtifact.violations));
await writeFile(resolve(destination,'audit-summary.json'),JSON.stringify({
 mode:'offline_library_packaging_with_mocked_auth_and_database',
 liveDeploymentVerified:false,liveDatabaseVerified:false,functions:results.map(b=>({name:b.name,
  runtimeAPIVersion:b.runtimeAPIVersion,bundler:b.bundler,routes:b.config.path,...b.audit})),publicArtifact,
},null,2));
console.log(JSON.stringify({functionBundlesVerified:results.length,publicArtifact}));
