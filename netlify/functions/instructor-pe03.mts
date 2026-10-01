import { createPe03Handler } from './_lib/nmls-pe-http.mjs';
export const config = { path: '/api/admin/pe03' };
export default createPe03Handler('instructor');
