import {createNetlifyBackgroundHandler} from '../../integrations/core-v2/server/netlify.mjs';
const environment=new Proxy({}, {get:(_target,name)=>globalThis.Netlify?.env.get(name)});
const handle=createNetlifyBackgroundHandler({environment});
const handler=async request=>handle(request);
export default handler;
export const config={background:true,path:'/api/admin/core/background'};
