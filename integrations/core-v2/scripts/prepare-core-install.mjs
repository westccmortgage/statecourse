import {writeFile} from 'node:fs/promises';
import {verifiedInstallation} from '../installation/package.mjs';
const args=process.argv.slice(2);
if(args.length>1 || (args.length===1 && !args[0].endsWith('.sql')))throw new Error('optional_new_sql_output_path_required');
const {sql,manifest}=await verifiedInstallation();
if(args[0])await writeFile(args[0],sql,{flag:'wx',mode:0o600});
console.log(JSON.stringify({target:manifest.target.projectId,migrationCount:manifest.migrationCount,bundleSha256:manifest.bundleSha256,application:'not_applied',...(args[0]?{file:args[0]}:{})},null,2));
