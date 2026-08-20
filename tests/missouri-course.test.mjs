import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import PREEXAM_BANK from "../config/missouri/preexam-48-question-bank.mjs";
import MREP_BANK from "../config/missouri/mrep-24-question-bank.mjs";
import {
  MISSOURI_COMMISSION_FINAL_PASSING_PERCENT,
  MISSOURI_COURSE_IDS,
  MISSOURI_MREP_COURSE_ID,
  MISSOURI_MREP_TOPICS,
  MISSOURI_PREEXAM_COURSE_ID,
  getMissouriAssessment,
  getMissouriCourse,
  getMissouriModule,
  missouriCourseCompletion,
  missouriEducationReadiness,
  publicMissouriAssessment,
  scoreMissouriAssessment
} from "../config/missouri-course-engine.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const preexam = getMissouriCourse(MISSOURI_PREEXAM_COURSE_ID);
const mrep = getMissouriCourse(MISSOURI_MREP_COURSE_ID);
const banks = { [MISSOURI_PREEXAM_COURSE_ID]: PREEXAM_BANK, [MISSOURI_MREP_COURSE_ID]: MREP_BANK };
const allDone = (course) => course.modules.map((m) => ({ module_id: m.id, status: "completed" }));

test("Missouri requires two courses and the engine serves both", () => {
  assert.deepEqual(MISSOURI_COURSE_IDS, [MISSOURI_PREEXAM_COURSE_ID, MISSOURI_MREP_COURSE_ID]);
  assert.equal(preexam.clockHours, 48);
  assert.equal(mrep.clockHours, 24);
  assert.equal(getMissouriCourse("mo-broker-preexam-48-v1"), null);
  assert.equal(getMissouriCourse(""), null);
});

test("a Missouri clock hour is 60 minutes containing at least 50 of instruction", () => {
  /* Not Maine's or Wisconsin's 60 minutes of instruction, and not Virginia's 50-minute hour.
     20 CSR 2250-7.070(2). */
  for (const course of [preexam, mrep]) {
    assert.equal(course.minutesPerClockHour, 60);
    assert.equal(course.instructionMinutesPerClockHour, 50);
    assert.equal(course.maxRecessMinutesPerClockHour, 10);
    assert.equal(course.instructionMinutes, course.clockHours * 50);
    assert.equal(
      course.instructionMinutesPerClockHour + course.maxRecessMinutesPerClockHour,
      course.minutesPerClockHour
    );
  }
});

test("each course's hours run 1..N exactly once, with no gap and no overlap", () => {
  for (const course of [preexam, mrep]) {
    const claimed = [];
    for (const module of course.modules) {
      assert.equal(module.lastHour, module.firstHour + module.hours - 1, `${module.id}: lastHour disagrees`);
      assert.equal(module.instructionMinutes, module.hours * 50, `${module.id}: instruction minutes`);
      for (let hour = module.firstHour; hour <= module.lastHour; hour += 1) claimed.push(hour);
    }
    claimed.sort((a, b) => a - b);
    assert.deepEqual(claimed, Array.from({ length: course.clockHours }, (_, i) => i + 1),
      `${course.courseId}: hour coverage`);
  }
});

test("the two courses have DIFFERENT content authorities and the payload says which", () => {
  /* This is the whole reason Missouri needs a two-course engine. 6.060(1) delegates the 48-hour
     course to the testing service's outline; 6.060(2) lists sixteen topics for the MREP course. */
  assert.equal(preexam.contentAuthorityIsCommission, false);
  assert.equal(preexam.commissionTopics, null);
  assert.match(preexam.contentAuthority, /professional testing service/);
  assert.match(preexam.contentAuthority, /HAS NOT been read|has NOT been read|not been read/i);

  assert.equal(mrep.contentAuthorityIsCommission, true);
  assert.equal(mrep.commissionTopics.length, 16);
  assert.match(mrep.contentAuthority, /sixteen topics/);
  assert.match(mrep.contentAuthority, /allocates no hours/);
});

test("all sixteen Commission MREP topics are transcribed and every one is carried by a module", () => {
  assert.equal(MISSOURI_MREP_TOPICS.length, 16);
  assert.deepEqual(MISSOURI_MREP_TOPICS.map((t) => t.code), "ABCDEFGHIJKLMNOP".split(""));
  const covered = new Set(mrep.modules.flatMap((m) => m.commissionTopics));
  assert.equal(covered.size, 16, "a Commission topic is carried by no module");
  const known = new Set(MISSOURI_MREP_TOPICS.map((t) => t.code));
  assert.deepEqual([...covered].filter((c) => !known.has(c)), [], "a module claims a topic the rule does not list");
});

test("the 48-hour course claims no Commission topic, because the rule lists none for it", () => {
  for (const module of preexam.modules) {
    assert.deepEqual(module.commissionTopics, [],
      `${module.id}: the pre-examination course must not claim a Commission topic list it does not have`);
  }
});

test("the MREP bank's topic tags agree with the module table", () => {
  for (const module of mrep.modules) {
    assert.deepEqual(MREP_BANK[module.id].commissionTopics, module.commissionTopics,
      `${module.id}: bank tags and module table disagree`);
  }
});

test("the 75 percent is attributed to the Commission and the 80 percent to StateCourse", () => {
  /* Getting this backwards in either direction misstates the regulator. */
  for (const course of [preexam, mrep]) {
    assert.equal(course.commissionFinalPassingPercent, 75);
    assert.equal(course.engagementPassingPercent, 80);
    const commission = course.commissionRequirements.join(" ");
    assert.match(commission, /75 percent/, "the final passing standard must be listed as the Commission's");
    assert.match(commission, /20 CSR 2250-7\.080\(1\)\(E\)/);
    assert.doesNotMatch(commission, /80 percent/, "the engagement threshold must not appear as a Commission requirement");

    const decisions = course.stateCourseDecisions.join(" ");
    assert.match(decisions, /80 percent/, "the engagement threshold must be recorded as a StateCourse decision");
    assert.match(decisions, /prescribes no in-module assessment/);
  }
  assert.equal(MISSOURI_COMMISSION_FINAL_PASSING_PERCENT, 75);
});

test("the final examination structure records both forms and the no-duplication rule", () => {
  /* 20 CSR 2250-7.080(1)(B). A build that ships one form should fail here, not at submission. */
  for (const course of [preexam, mrep]) {
    assert.equal(course.finalExam.forms, 2);
    assert.deepEqual(course.finalExam.formNames, ["primary", "alternate"]);
    assert.equal(course.finalExam.minimumItemsPerForm, 50);
    assert.equal(course.finalExam.noDuplicationBetweenForms, true);
    assert.equal(course.finalExam.passingPercent, 75);
    assert.equal(course.finalExam.certificateDeliveryDays, 10);
    assert.equal(course.finalExam.prescribedByRule, true);
  }
});

test("the Commission requirements record the facts that were actually read", () => {
  const lines = preexam.commissionRequirements.join(" ");
  assert.match(lines, /six months prior to the date of application/, "the § 339.040.6 window must be recorded");
  assert.match(lines, /339\.040\.6/);
  assert.match(lines, /minimum of 4 years/, "the four-year retention period must be recorded");
  assert.match(lines, /31 July and 31 January/, "the completion-time reporting duty must be recorded");
  assert.equal(preexam.recordRetentionYears, 4);
  assert.equal(preexam.educationValidityMonths, 6);
});

test("neither course claims approval or credit", () => {
  for (const course of [preexam, mrep]) {
    assert.match(course.approvalStatus, /Not approved/);
    assert.match(course.approvalStatus, /No Missouri pre-license credit is available/);
    assert.equal(course.version, "1.0-submission-draft");
  }
});

test("every module has a curriculum file that exists, with the right hour heading", () => {
  for (const course of [preexam, mrep]) {
    for (const module of course.modules) {
      const file = path.join(root, module.curriculumPath);
      assert.ok(fs.existsSync(file), `${module.curriculumPath} is missing`);
      const text = fs.readFileSync(file, "utf8");
      const heading = text.match(/^## Hours (\d{1,2})[–-](\d{1,2}) · /m);
      assert.ok(heading, `${module.curriculumPath}: no '## Hours N–M ·' heading`);
      assert.equal(Number(heading[1]), module.firstHour, `${module.curriculumPath}: first hour`);
      assert.equal(Number(heading[2]), module.lastHour, `${module.curriculumPath}: last hour`);
    }
  }
});

test("every curriculum file states the course is not approved and carries no credit", () => {
  for (const course of [preexam, mrep]) {
    for (const module of course.modules) {
      const text = fs.readFileSync(path.join(root, module.curriculumPath), "utf8");
      assert.match(text, /Not approved/, `${module.curriculumPath}: no approval-status line`);
      assert.match(text, /No Missouri pre-license credit is available/, `${module.curriculumPath}: no credit disclaimer`);
    }
  }
});

test("every 48-hour curriculum file records that the topic list is not the Commission's", () => {
  /* A file that stated a topic list without this would read as though the Commission had set it. */
  for (const module of preexam.modules) {
    const text = fs.readFileSync(path.join(root, module.curriculumPath), "utf8").replace(/\s+/g, " ");
    assert.match(text, /20 CSR 2250-6\.060\(1\)/, `${module.curriculumPath}: no content-basis citation`);
    assert.match(text, /has not read that outline|which this project has not read/i,
      `${module.curriculumPath}: the unread outline must be stated`);
  }
});

test("every MREP curriculum file names the Commission topics it carries", () => {
  for (const module of mrep.modules) {
    const text = fs.readFileSync(path.join(root, module.curriculumPath), "utf8").replace(/\s+/g, " ");
    assert.match(text, /\*\*Commission topics covered:\*\*/, `${module.curriculumPath}: no topic line`);
    for (const code of module.commissionTopics) {
      assert.match(text, new RegExp(`20 CSR 2250-6\\.060\\(2\\)\\(${code}\\)|·\\s*\\(${code}\\)`),
        `${module.curriculumPath}: does not name topic (${code})`);
    }
    assert.match(text, /allocates no hours/, `${module.curriculumPath}: hour allocation not attributed`);
  }
});

test("both banks have eleven items per module with four distinct choices, correct at index 0", () => {
  assert.equal(Object.keys(PREEXAM_BANK).length, 9);
  assert.equal(Object.keys(MREP_BANK).length, 6);
  for (const [courseId, bank] of Object.entries(banks)) {
    for (const [id, entry] of Object.entries(bank)) {
      assert.ok(entry.applied, `${courseId} ${id}: no applied item`);
      assert.equal(entry.engagement.length, 5, `${courseId} ${id}: engagement count`);
      assert.equal(entry.remediation.length, 5, `${courseId} ${id}: remediation count`);
      for (const item of [entry.applied, ...entry.engagement, ...entry.remediation]) {
        assert.equal(item.choices.length, 4, `${courseId} ${id}: not four choices`);
        assert.equal(new Set(item.choices).size, 4, `${courseId} ${id}: a choice repeats`);
        assert.equal(item.correctChoice, 0, `${courseId} ${id}: authored answer not at index 0`);
        assert.ok(item.prompt.trim().length > 20, `${courseId} ${id}: prompt too short`);
        assert.ok(item.rationale.trim().length > 40, `${courseId} ${id}: rationale too short`);
      }
    }
  }
});

test("bank subjects match the engine's module titles", () => {
  for (const course of [preexam, mrep]) {
    for (const module of course.modules) {
      assert.equal(banks[course.courseId][module.id].subject, module.title,
        `${course.courseId} ${module.id}: bank subject and module title disagree`);
    }
  }
});

test("delivery permutes the choices and the correct index moves with them", () => {
  for (const course of [preexam, mrep]) {
    for (const module of course.modules) {
      for (const kind of ["applied", "engagement", "remediation"]) {
        const assessment = getMissouriAssessment(course.courseId, module.id, kind);
        const authored = kind === "applied"
          ? [banks[course.courseId][module.id].applied]
          : banks[course.courseId][module.id][kind];
        assessment.items.forEach((item, index) => {
          assert.equal(item.choices[item.correctChoice], authored[index].choices[0],
            `${item.id}: permuted correct index does not point at the authored answer`);
        });
      }
    }
  }
});

test("the two courses' item ids do not collide, so their permutations differ", () => {
  /* The permutation key includes the course id. Without it the two courses' module-01 engagement
     item 01 would share a key, and a bug in one course would be invisible in the other. */
  const a = getMissouriAssessment(MISSOURI_PREEXAM_COURSE_ID, "module-01", "engagement");
  const b = getMissouriAssessment(MISSOURI_MREP_COURSE_ID, "module-01", "engagement");
  assert.notEqual(a.items[0].id, b.items[0].id);
  assert.match(a.items[0].id, /^mo-salesperson-preexam-48-v1-module-01-engagement-01$/);
  assert.match(b.items[0].id, /^mo-real-estate-practice-24-v1-module-01-engagement-01$/);
});

test("the correct answer's delivered position is spread across all four indices", () => {
  const landings = [0, 0, 0, 0];
  let total = 0;
  for (const course of [preexam, mrep]) {
    for (const module of course.modules) {
      for (const kind of ["applied", "engagement", "remediation"]) {
        for (const item of getMissouriAssessment(course.courseId, module.id, kind).items) {
          landings[item.correctChoice] += 1;
          total += 1;
        }
      }
    }
  }
  assert.equal(total, 99 + 66);
  assert.ok(landings[0] < total * 0.45, `the correct answer stays at index 0 in ${landings[0]} of ${total}`);
  for (const [index, count] of landings.entries()) {
    assert.ok(count > 0, `no item delivers its correct answer at index ${index}`);
  }
});

test("the permutation is stable across calls", () => {
  const first = getMissouriAssessment(MISSOURI_MREP_COURSE_ID, "module-03", "engagement");
  const second = getMissouriAssessment(MISSOURI_MREP_COURSE_ID, "module-03", "engagement");
  assert.deepEqual(first.items.map((i) => i.choices), second.items.map((i) => i.choices));
  assert.deepEqual(first.items.map((i) => i.correctChoice), second.items.map((i) => i.correctChoice));
});

test("the public assessment carries no answer key", () => {
  for (const course of [preexam, mrep]) {
    for (const module of course.modules) {
      for (const kind of ["applied", "engagement", "remediation"]) {
        const view = publicMissouriAssessment(getMissouriAssessment(course.courseId, module.id, kind));
        const serialised = JSON.stringify(view);
        assert.doesNotMatch(serialised, /correctChoice/, `${course.courseId} ${module.id} ${kind}: exposes correctChoice`);
        assert.doesNotMatch(serialised, /rationale/, `${course.courseId} ${module.id} ${kind}: exposes a rationale`);
        for (const item of view.items) {
          assert.equal(Object.keys(item).sort().join(","), "choices,id,prompt");
        }
      }
    }
  }
});

test("scoring rejects coercible non-answers rather than recording choice 0", () => {
  const assessment = getMissouriAssessment(MISSOURI_PREEXAM_COURSE_ID, "module-03", "engagement");
  for (const bad of [null, "", false, [], undefined, {}, "1.5", " ", "0x1", NaN, 1.5, -1, 4]) {
    const answers = new Array(assessment.items.length).fill(0);
    answers[3] = bad;
    assert.equal(scoreMissouriAssessment(assessment, answers), null,
      `scoring accepted ${String(bad)} as a selection`);
  }
  assert.equal(scoreMissouriAssessment(assessment, [0, 1]), null);
  assert.equal(scoreMissouriAssessment(assessment, "0,1,2,3,4"), null);
  assert.equal(scoreMissouriAssessment(null, [0]), null);
});

test("scoring accepts a numeric string, because a form field returns one", () => {
  const assessment = getMissouriAssessment(MISSOURI_MREP_COURSE_ID, "module-01", "engagement");
  const scored = scoreMissouriAssessment(assessment, assessment.items.map((i) => String(i.correctChoice)));
  assert.equal(scored.percent, 100);
  assert.equal(scored.passed, true);
});

test("the engagement threshold is 80 percent and the applied threshold is 100", () => {
  const engagement = getMissouriAssessment(MISSOURI_MREP_COURSE_ID, "module-02", "engagement");
  assert.equal(engagement.passingPercent, 80);
  const answers = engagement.items.map((i) => i.correctChoice);
  answers[0] = (answers[0] + 1) % 4;
  assert.equal(scoreMissouriAssessment(engagement, answers).percent, 80);
  assert.equal(scoreMissouriAssessment(engagement, answers).passed, true);
  answers[1] = (answers[1] + 1) % 4;
  assert.equal(scoreMissouriAssessment(engagement, answers).passed, false);

  const applied = getMissouriAssessment(MISSOURI_PREEXAM_COURSE_ID, "module-09", "applied");
  assert.equal(applied.passingPercent, 100);
  assert.equal(applied.items.length, 1);
  assert.equal(scoreMissouriAssessment(applied, [(applied.items[0].correctChoice + 1) % 4]).passed, false);
});

test("partial instruction credits only the hours completed", () => {
  const three = missouriCourseCompletion(MISSOURI_PREEXAM_COURSE_ID,
    ["module-01", "module-02", "module-03"].map((id) => ({ module_id: id, status: "completed" })));
  assert.equal(three.creditedClockHours, 5 + 6 + 6);
  assert.equal(three.creditedInstructionMinutes, 17 * 50);
  assert.equal(three.instructionComplete, false);
  assert.match(three.certificateBlockedBy, /Not all 48 clock hours completed \(17 of 48\)/);
});

test("a module in progress is not credited", () => {
  const mixed = missouriCourseCompletion(MISSOURI_MREP_COURSE_ID, [
    { module_id: "module-01", status: "completed" },
    { module_id: "module-02", status: "in_progress" },
    { module_id: "module-03", status: null },
    { module_id: "module-04" }
  ]);
  assert.equal(mixed.completedModules, 1);
  assert.equal(mixed.creditedClockHours, 4);
});

test("all instruction is not course completion — the final examination gates it at the Commission's 75", () => {
  const instructionOnly = missouriCourseCompletion(MISSOURI_MREP_COURSE_ID, allDone(mrep));
  assert.equal(instructionOnly.instructionComplete, true);
  assert.equal(instructionOnly.courseComplete, false);
  assert.match(instructionOnly.certificateBlockedBy, /final examination has not been taken/);

  const failed = missouriCourseCompletion(MISSOURI_MREP_COURSE_ID, allDone(mrep), { finalExamPercent: 74 });
  assert.equal(failed.courseComplete, false);
  assert.match(failed.certificateBlockedBy, /74 percent, below the Commission's 75 percent standard in 20 CSR 2250-7\.080\(1\)\(E\)/);

  assert.equal(missouriCourseCompletion(MISSOURI_MREP_COURSE_ID, allDone(mrep), { finalExamPercent: 75 }).finalExamPassed, true);
});

test("course completion is still not a certificate without a Commission approval number", () => {
  const complete = missouriCourseCompletion(MISSOURI_PREEXAM_COURSE_ID, allDone(preexam), { finalExamPercent: 88 });
  assert.equal(complete.courseComplete, true);
  assert.equal(complete.certificateEligible, false);
  assert.match(complete.certificateBlockedBy, /no pre-license credit exists to certify/);

  const approved = missouriCourseCompletion(MISSOURI_PREEXAM_COURSE_ID, allDone(preexam),
    { finalExamPercent: 88, approvalNumber: "MREC-EXAMPLE-0000" });
  assert.equal(approved.certificateEligible, true);
  assert.equal(approved.certificateBlockedBy, null);
});

test("a non-numeric final examination score does not pass the gate", () => {
  for (const bad of ["100", null, undefined, true, {}, [100]]) {
    const result = missouriCourseCompletion(MISSOURI_MREP_COURSE_ID, allDone(mrep),
      { finalExamPercent: bad, approvalNumber: "X" });
    assert.equal(result.finalExamPassed, false, `a ${typeof bad} score passed the gate`);
    assert.equal(result.certificateEligible, false);
  }
});

test("completing the MREP course covers all sixteen Commission topics", () => {
  const complete = missouriCourseCompletion(MISSOURI_MREP_COURSE_ID, allDone(mrep),
    { finalExamPercent: 90, approvalNumber: "X" });
  assert.equal(complete.commissionTopicsCovered.length, 16);
  assert.deepEqual(complete.commissionTopicsCovered, "ABCDEFGHIJKLMNOP".split(""));
});

test("the 48-hour course reports no Commission topic coverage, because it has none", () => {
  const complete = missouriCourseCompletion(MISSOURI_PREEXAM_COURSE_ID, allDone(preexam),
    { finalExamPercent: 90, approvalNumber: "X" });
  assert.equal(complete.commissionTopicsCovered, null);
});

test("education readiness requires BOTH courses", () => {
  const onlyOne = missouriEducationReadiness({
    [MISSOURI_PREEXAM_COURSE_ID]: { courseComplete: true, certificateEligible: true, completedOn: "2026-06-01" }
  });
  assert.equal(onlyOne.allCoursesComplete, false);
  assert.match(onlyOne.readinessBlockedBy, /Missouri Real Estate Practice Course/);
  assert.equal(onlyOne.requiredCourses.length, 2);
});

test("the § 339.040.6 six-month window is computed from the EARLIEST completion", () => {
  /* The binding date is whichever course finished first, because each certificate must be within
     six months of the application. Students lose entire courses to this. */
  const stale = missouriEducationReadiness({
    [MISSOURI_PREEXAM_COURSE_ID]: { courseComplete: true, certificateEligible: true, completedOn: "2026-01-10" },
    [MISSOURI_MREP_COURSE_ID]: { courseComplete: true, certificateEligible: true, completedOn: "2026-02-01" }
  }, { applicationDate: "2026-08-01" });
  assert.equal(stale.educationWindow.earliestCompletion, "2026-01-10");
  assert.equal(stale.educationWindow.windowClosesOn, "2026-07-10");
  assert.equal(stale.educationWindow.withinWindow, false);
  assert.match(stale.readinessBlockedBy, /within six months prior to the date of application/);

  const fresh = missouriEducationReadiness({
    [MISSOURI_PREEXAM_COURSE_ID]: { courseComplete: true, certificateEligible: true, completedOn: "2026-05-10" },
    [MISSOURI_MREP_COURSE_ID]: { courseComplete: true, certificateEligible: true, completedOn: "2026-06-01" }
  }, { applicationDate: "2026-08-01" });
  assert.equal(fresh.educationWindow.withinWindow, true);
  assert.equal(fresh.readinessBlockedBy, null);
});

test("readiness with no application date reports the window as unknown rather than guessing", () => {
  const noDate = missouriEducationReadiness({
    [MISSOURI_PREEXAM_COURSE_ID]: { courseComplete: true, certificateEligible: true, completedOn: "2026-05-10" },
    [MISSOURI_MREP_COURSE_ID]: { courseComplete: true, certificateEligible: true, completedOn: "2026-06-01" }
  });
  assert.equal(noDate.educationWindow, null);
  assert.equal(noDate.allCoursesComplete, true);
  assert.equal(noDate.readinessBlockedBy, null);
});

test("getMissouriModule and getMissouriAssessment refuse unknown ids", () => {
  assert.equal(getMissouriModule(MISSOURI_MREP_COURSE_ID, "module-07"), null);
  assert.equal(getMissouriModule("mo-broker-48", "module-01"), null);
  assert.equal(getMissouriAssessment(MISSOURI_MREP_COURSE_ID, "module-07", "engagement"), null);
  assert.equal(getMissouriAssessment(MISSOURI_PREEXAM_COURSE_ID, "module-01", "final-exam"), null);
  assert.ok(getMissouriModule(MISSOURI_PREEXAM_COURSE_ID, "module-09"));
});

test("no authored answer states a figure from a source this project did not read", () => {
  /* § 339.010, § 339.100, § 339.105, 20 CSR 2250 ch. 1-5 and 8, every Commission-prescribed form,
     and Missouri's foreclosure, probate, lien, tax, landlord-tenant and statute-of-frauds chapters.
     A distractor may of course state a figure — that is what makes it wrong. */
  const unread = /339\.010|339\.100|339\.105|broker disclosure form|foreclosure|probate|mechanic's lien|landlord-tenant|statute of frauds/i;
  for (const [courseId, bank] of Object.entries(banks)) {
    for (const [id, entry] of Object.entries(bank)) {
      for (const item of [entry.applied, ...entry.engagement, ...entry.remediation]) {
        const authored = `${item.choices[0]} ${item.rationale}`;
        if (!unread.test(authored)) continue;
        const asserts = authored.match(/\b\d+\s*(days?|business days?|years?|months?)\b/gi) || [];
        /* "six months" is § 339.040.6, which WAS read, and "ten days" / "four years" are 7.080 and
           7.010, which were read. Only flag a period asserted alongside an unread source. */
        const suspicious = asserts.filter((phrase) => !/six months|ten days|10 days|four years|4 years|thirty days|30 days/i.test(phrase));
        assert.deepEqual(suspicious, [],
          `${courseId} ${id}: an authored answer touching an unread source states a period: ${suspicious.join(", ")}`);
      }
    }
  }
});

test("the routing language is actually present where a source was not read", () => {
  /* The negative test above passes trivially if nothing mentions the unread sources at all. */
  for (const bank of Object.values(banks)) {
    const serialised = JSON.stringify(bank);
    assert.match(serialised, /not read from primary text for this project/);
  }
  assert.match(JSON.stringify(PREEXAM_BANK), /testing service/);
  assert.match(JSON.stringify(MREP_BANK), /Commission-prescribed form|prescribed by the Commission/i);
});

test("no authored answer describes either course as approved", () => {
  for (const bank of Object.values(banks)) {
    assert.doesNotMatch(JSON.stringify(bank), /Commission[- ]approved course|state[- ]approved|is approved for credit/i);
  }
});

test("the primary-text readings file records the structural finding and the named gaps", () => {
  const readings = fs.readFileSync(path.join(root, "missouri/regulatory/primary-text-readings.md"), "utf8").replace(/\s+/g, " ");
  assert.match(readings, /20 CSR 2250-6\.060\(1\)/);
  assert.match(readings, /detailed content outline/);
  assert.match(readings, /has NOT been read/i);
  assert.match(readings, /six months prior to the date of application/);
  assert.match(readings, /seventy-five percent/);
  /* Every one of the sixteen MREP topics must appear, or the transcription is incomplete. */
  for (const topic of MISSOURI_MREP_TOPICS) {
    assert.match(readings, new RegExp(`\\(${topic.code}\\)\\s*${topic.topic.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`),
      `the readings file does not transcribe topic (${topic.code}) ${topic.topic}`);
  }
  assert.match(readings, /What was NOT read/);
});
