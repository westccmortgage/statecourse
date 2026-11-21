import { requireStudentSession,sessionCookies } from './_lib/student-session.mjs';
import { requireSameOrigin,parseJson } from './_lib/http.mjs';
import { saveCourseInterest } from './_lib/course-interest.mjs';

export default async function handler(req) {
  const headers=new Headers({'content-type':'application/json','cache-control':'no-store, private'});
  try {
    if(req.method!=='POST')return new Response(JSON.stringify({error:'method_not_allowed'}),{status:405,headers});
    const body=await req.text();
    if(body.length>4096)return new Response(JSON.stringify({error:'request_too_large'}),{status:413,headers});
    const event={headers:Object.fromEntries(req.headers),body};
    requireSameOrigin(event);
    const auth=await requireStudentSession(event);
    if(auth.refreshedSession)for(const cookie of sessionCookies(auth.refreshedSession))headers.append('set-cookie',cookie);
    const input=parseJson(event);
    const entry=await saveCourseInterest(auth.student.id,input);
    return new Response(JSON.stringify({saved:true,entry,notificationRequested:input.notify===true}),{status:200,headers});
  } catch(error) {
    const status=Number(error.statusCode)||500;
    return new Response(JSON.stringify({error:status>=500?'learning_path_unavailable':error.message}),{status,headers});
  }
}
export const config={path:'/api/student/learning-path'};
