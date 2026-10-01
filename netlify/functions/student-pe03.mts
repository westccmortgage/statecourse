import { createPe03Handler } from './_lib/nmls-pe-http.mjs';
export const config = { path: '/api/student/pe03' };
export default createPe03Handler('student');
