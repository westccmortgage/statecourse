import { handleTrainingEnrollment } from './_lib/enroll-training-handler.mjs';
import { studentJsonRequest } from './_lib/student-json-adapter.mjs';

// Preserve both the public route and the existing Netlify rewrite destination.
export const config = { path: ['/api/enroll/training', '/.netlify/functions/enroll-training'] };
export default async function enrollTraining(request: Request): Promise<Response> {
  return studentJsonRequest(request,['POST'],handleTrainingEnrollment);
}
