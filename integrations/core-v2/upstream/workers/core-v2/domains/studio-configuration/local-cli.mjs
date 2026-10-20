import {evaluateConfiguration} from './pack.ts';
import {readFileSync} from 'node:fs';
// Local proof transport only. No network, no database, no providers.
globalThis.fetch=()=>{throw new Error('Network sealed');};
console.log(JSON.stringify(await evaluateConfiguration(JSON.parse(readFileSync(0,'utf8')))));
