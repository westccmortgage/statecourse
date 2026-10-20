import pg from 'pg';
import {readFile} from 'node:fs/promises';
import {createServerApplication} from './application.mjs';
import {createHttpServer} from './http.mjs';

// Optional server-owned JSON contains declarations/routing, never API keys.
// No file, pool or provider is consulted while the bridge is disabled.
async function start() {
 let declaration={};
 if(process.env.CORE_V2_BRIDGE_ENABLED==='true' && process.env.CORE_V2_RUNTIME_CONFIG_FILE)
  declaration=JSON.parse(await readFile(process.env.CORE_V2_RUNTIME_CONFIG_FILE,'utf8'));
 const app=createServerApplication({Pool:pg.Pool,providerConfig:declaration.config,familyProviders:declaration.familyProviders});
 const port=Number(process.env.CORE_V2_PORT||8789);
 if(!Number.isInteger(port)||port<1024||port>65535)throw new Error();
 const server=createHttpServer({handle:app.handle,allowedOrigin:process.env.STATECOURSE_ORIGIN||'https://statecourse.invalid'});
 server.on('error',()=>{process.stderr.write('Core bridge listener unavailable.\n');void app.close();process.exitCode=1;});
 server.listen(port,'127.0.0.1');
 for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>server.close(()=>{void app.close();}));
}
start().catch(()=>{process.stderr.write('Core bridge startup refused; check server configuration.\n');process.exitCode=1;});
