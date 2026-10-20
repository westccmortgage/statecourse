import {readFile,readdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const base=new URL('../',import.meta.url),root=new URL('upstream/',base);
const lock=JSON.parse(await readFile(new URL('upstream-lock.json',base),'utf8'));
const actual=[];
async function walk(dir,prefix='') {for(const name of await readdir(dir)) {const path=prefix+name,url=new URL(name,dir);if((await stat(url)).isDirectory())await walk(new URL(name+'/',dir),path+'/');else actual.push(path);}}
await walk(root);
assert.deepEqual(actual.sort(),Object.keys(lock.files).sort(),'Snapshot file set differs from upstream lock');
for(const [path,hash] of Object.entries(lock.files))assert.equal(createHash('sha256').update(await readFile(new URL(path,root))).digest('hex'),hash,`Upstream byte mismatch: ${path}`);
console.log(`Verified ${actual.length} unchanged upstream files at ${lock.commit}`);
