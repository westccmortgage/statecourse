/**
 * A course that exists only where test fixtures are enabled.
 *
 * The problem this solves. A branch deploy pointed at the production database is not data
 * isolation: the console reaches every real course, and a test placement lands on a real
 * screen. Real isolation would be a second database. Short of that, this is the next
 * honest thing — a course that production cannot see and that a scoped account cannot
 * leave.
 *
 * Two independent mechanisms, either of which alone would be enough:
 *
 *   1. This delivery is registered only when STATECOURSE_ENABLE_TEST_FIXTURES is "true".
 *      That variable is set on the branch deploy and nowhere else, so production's screen
 *      index does not contain this course and a placement onto it cannot be reserved there.
 *   2. Its state is ZZ, which is not a jurisdiction. A staff binding scoped to ZZ passes
 *      requireCourseInScope for this course and fails it for every real one, so the test
 *      account cannot reach a live course even by editing the request.
 *
 * The screens are deliberately dull. This exists to be placed onto, not to teach.
 */

export const CONSOLE_TEST_COURSE_ID = "zz-console-test-course";
export const CONSOLE_TEST_STATE = "ZZ";

export const CONSOLE_TEST_DELIVERY = Object.freeze({
  courseId: CONSOLE_TEST_COURSE_ID,
  moduleId: "module-01",
  version: "1.0",
  blocks: Object.freeze([
    Object.freeze({
      id: "zz01u1",
      sequence: 1,
      required: false,
      code: "ZZ-TEST",
      title: "Console test block",
      learningObjective: "Exercise the administration console against a course that is not real.",
      screens: Object.freeze([
        Object.freeze({
          id: "zz01u1-s1",
          sequence: 1,
          type: "instruction",
          title: "Test instruction screen",
          content: "This screen exists so a video can be placed on it during testing.",
        }),
        Object.freeze({
          id: "zz01u1-s2",
          sequence: 2,
          type: "instruction",
          title: "Second test instruction screen",
          content: "A second target, so replacing a video onto an occupied screen can be exercised.",
        }),
        Object.freeze({
          id: "zz01u1-s3",
          sequence: 3,
          type: "practice",
          title: "Test practice screen",
          content: "Not an instruction screen, so placement onto it must be refused.",
        }),
      ]),
    }),
  ]),
});

/** Registered only where the fixture flag is set. Production leaves this empty. */
export function testDeliveries() {
  return String(process.env.STATECOURSE_ENABLE_TEST_FIXTURES || "").trim() === "true"
    ? [CONSOLE_TEST_DELIVERY]
    : [];
}

export default Object.freeze({ CONSOLE_TEST_COURSE_ID, CONSOLE_TEST_STATE, testDeliveries });
