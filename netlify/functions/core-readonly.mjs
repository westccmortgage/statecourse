import {createNetlifyHandler} from '../../integrations/core-v2/server/netlify.mjs';

const environment=new Proxy({}, {get:(_target,name)=>globalThis.Netlify?.env.get(name)});
const handle=createNetlifyHandler({environment});
const handler=async request=>handle(request);
export default handler;
export const config={path:[
 '/api/admin/core/health',
 '/api/admin/core/observations',
 '/api/admin/core/observations/:runId',
]};
