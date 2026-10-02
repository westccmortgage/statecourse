import {createPeCourseHandler} from './_lib/nmls-pe-course-http.mjs';
export const config={path:'/api/admin/pe-course'};
export default createPeCourseHandler('instructor');
