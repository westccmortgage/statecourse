// Resolve both supported URL namespaces without sending application APIs to static HTML.
const CDN_MEDIA=new Set([
 '/media/statecourse-intro.mp4',
 '/media/document-overview-loan-estimate-page-1.mp4',
 '/media/document-overview-loan-estimate-page-2.mp4',
 '/media/document-overview-loan-estimate-page-3.mp4',
 '/media/promissory-note-overview.mp4'
]);
export async function servePublicAssets(request,assets){
 const url=new URL(request.url);
 const rootPath=url.pathname==='/statecourse'?'/':url.pathname.startsWith('/statecourse/')?url.pathname.slice('/statecourse'.length):url.pathname;
 const safeMethod=request.method==='GET'||request.method==='HEAD';
 const applicationRoute=/^\/(?:api|\.netlify|_vinext|_next|auth|_auth)(?:\/|$)/.test(rootPath);
 if(!safeMethod||applicationRoute)return null;
 const hasExtension=rootPath.split('/').at(-1)?.includes('.');
 const operationalPage=/^\/(?:student|admin|enroll|payment)(?:\/|$)/.test(rootPath);
 if(operationalPage&&(!hasExtension||/\.html$/i.test(rootPath))&&url.hostname.endsWith('.chatgpt.site'))
  return Response.redirect(new URL(rootPath+url.search,'https://statecourse.com').href,302);
 if(!assets)return null;
 const assetUrl=new URL(url);assetUrl.pathname='/statecourse'+rootPath;
 if(!hasExtension)assetUrl.pathname=assetUrl.pathname.replace(/\/$/,'')+'/index.html';
 const response=await assets.fetch(new Request(assetUrl,request));
 if(response.status!==404)return response;
 if(CDN_MEDIA.has(rootPath)&&url.hostname.endsWith('.chatgpt.site'))
  return Response.redirect(new URL(rootPath,'https://statecourse.com').href,302);
 return null;
}
