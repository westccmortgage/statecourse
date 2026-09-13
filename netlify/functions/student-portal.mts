import { handleStudentPortal } from './_lib/student-portal-handler.mjs';
import { studentJsonRequest } from './_lib/student-json-adapter.mjs';

export const config = { path: ['/api/student/portal', '/.netlify/functions/student-portal'] };
export default async function studentPortal(request: Request): Promise<Response> {
  return studentJsonRequest(request,['GET','POST','PATCH'],handleStudentPortal);
}
