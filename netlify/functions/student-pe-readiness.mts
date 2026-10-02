import {createPeCourseHandler} from './_lib/nmls-pe-course-http.mjs';
export const config={path:'/api/student/pe-readiness'};
export default createPeCourseHandler('student');
