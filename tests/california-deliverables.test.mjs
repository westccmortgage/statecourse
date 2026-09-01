/*
 * The deliverable ledger, and the reason it exists.
 *
 * The release gate ran seventeen checks, passed all seventeen, and printed GRANTED while the
 * SB 1495 traceability, the review credentials and the signature sheets did not exist. Nothing
 * was wrong with any check. The defect was structural: a gate assembled only from checks can
 * report on what someone remembered to write a check for, and absence has no check to fail.
 *
 * These tests hold the fix in place. What they mostly assert is that the ledger cannot be
 * satisfied by accident — not by an empty file, not by a file with the right name and the
 * wrong contents, and not by the gate deciding on its own that a deliverable does not count.
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  FIRST_FILING,
  PROGRAMS,
  REQUIRED_DELIVERABLES,
  allDeliverables,
  deliverablesFor,
  program,
} from "../config/california/regulatory-manifest.mjs";
import { outstanding, statusOf, submissionStatus } from "../lib/deliverable-status.mjs";

const HANDBOOK_ITEMS = REQUIRED_DELIVERABLES.filter((entry) => entry.handbookItem !== null);

test("every item the Course Provider Handbook requires has a deliverable", () => {
  /* The Handbook's list, in the Handbook's words, as the required-items page states it. If an
     entry here has no deliverable, the submission is missing something the Department asked
     for and nothing in this repository would have said so. */
  const required = [
    "Completed Pre-License Course Approval Application (RE 306).",
    "Corporation Documents, if applicable, as filed with the Secretary of State.",
    "Fictitious Business Name Statement (FBNS), if applicable, as filed with the County Clerk's office.",
    "Consent to Service of Process (RE 304) if the school is out of state.",
    "Copies of all student instructional materials and copyright authorizations as necessary.",
    "Textbook Certification letter from a college/university professor.",
    "Pre-License Instructor Certification (RE 336) with supporting documentation.",
    "General Information Page (RE 313 serves as a template).",
    "Timed Course Outline.",
    "Student Final Exam Instructions.",
    "Exam Proctor/monitor Instructions.",
    "Student Version of the Final Exam.",
    "Instructor Version of the Final Exam along with corresponding answer key.",
    "Student AND Regulator log-in and password for courses/final exams offered online/mobile app.",
    "Pre-License Course Completion Certificate (RE 311 serves as a template).",
  ];
  const carried = HANDBOOK_ITEMS.map((entry) => entry.handbookItem);
  for (const item of required) {
    assert.ok(carried.includes(item), `no deliverable carries the Handbook item: ${item}`);
  }
});

test("no deliverable is optional, and each names an owner and a work order section", () => {
  for (const entry of REQUIRED_DELIVERABLES) {
    assert.equal(entry.mandatory, true, `${entry.id} is not mandatory`);
    assert.ok(["build", "human"].includes(entry.owner), `${entry.id} has owner "${entry.owner}"`);
    /* §7A and §7B: instructor qualification and reviewer access were one section, and a reader
       could reasonably have taken either for the other. A letter suffix is how two deliverables
       stay attached to the same work order section without either closing the other. */
    assert.match(entry.section, /^§\d+[A-Za-z]?$/, `${entry.id} does not name a work order section`);
    assert.ok(entry.evidence.length > 0, `${entry.id} names no evidence`);
  }
});

test("a human-owned deliverable says what the human must do", () => {
  /* "Blocked on a person" is not an instruction. Each one has to say which person and what
     they produce, or the reader is left to guess whose desk it is on. */
  for (const entry of REQUIRED_DELIVERABLES.filter((item) => item.owner === "human")) {
    assert.ok(entry.note && entry.note.length > 40, `${entry.id} is owned by a human and explains nothing`);
  }
});

test("SB 1495 attaches to the practice course and to no other", () => {
  const sb1495 = PROGRAMS.filter((entry) => entry.sb1495);
  assert.equal(sb1495.length, 1);
  assert.match(sb1495[0].title, /practice/i);

  const practice = deliverablesFor(sb1495[0].courseId);
  assert.ok(practice.some((entry) => entry.id === "sb1495-traceability"));
  for (const other of PROGRAMS.filter((entry) => !entry.sb1495)) {
    assert.ok(
      !deliverablesFor(other.courseId).some((entry) => entry.id === "sb1495-traceability"),
      `${other.title} carries an SB 1495 deliverable and is not a practice course`,
    );
  }
});

test("a program is addressable by course id, catalog id or packet directory", () => {
  for (const entry of PROGRAMS) {
    assert.equal(program(entry.courseId), entry);
    assert.equal(program(entry.catalogId), entry);
    assert.equal(program(entry.packageDir), entry);
  }
  assert.equal(program("ca-nothing"), null);
});

test("program course ids are course ids, not array indices", () => {
  /* They were "0", "1" and "2" for a while: the manifest read an array with Object.entries and
     took the index for the key. Every deliverable path is built from this value. */
  for (const entry of PROGRAMS) {
    assert.match(entry.courseId, /^ca-[a-z-]+-45-v1$/, `courseId is "${entry.courseId}"`);
    assert.match(entry.catalogId, /^ca-[a-z-]+-45$/);
  }
});

test("evidence paths are substituted per program, with nothing left unfilled", () => {
  for (const entry of allDeliverables()) {
    for (const file of entry.evidence) {
      assert.ok(!file.path.includes("{"), `${entry.id} left a placeholder in ${file.path}`);
    }
  }
});

test("a once-only deliverable is counted once across the whole submission", () => {
  const once = REQUIRED_DELIVERABLES.filter((entry) => entry.scope === "once").map((entry) => entry.id);
  assert.ok(once.length > 0);
  for (const id of once) {
    assert.equal(allDeliverables().filter((entry) => entry.id === id).length, 1, `${id} is counted more than once`);
  }
});

test("the first filing is one course, and it is a course that exists", () => {
  /* DRE advises a first-time applicant to file one course rather than three, so a deficiency
     is found once. The named course has to be real, or the advice is being followed on paper
     only. */
  const entry = program(FIRST_FILING.courseId);
  assert.ok(entry, `the first filing names ${FIRST_FILING.courseId}, which is not a program`);
  assert.equal(entry.packageDir, FIRST_FILING.packageDir);
  assert.equal(entry.title, FIRST_FILING.title);
});

/* ── what the evaluator will and will not accept ───────────────────────────────────────── */

const withTempFile = (name, contents, run) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "deliverable-"));
  const full = path.join(dir, name);
  fs.writeFileSync(full, contents);
  try {
    run(path.relative(path.resolve(import.meta.dirname, ".."), full));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
};

test("an empty file does not satisfy a deliverable", () => {
  withTempFile("stub.md", "# TODO\n", (relative) => {
    const status = statusOf({
      id: "stub",
      label: "stub",
      section: "§1",
      owner: "build",
      note: null,
      evidence: [{ path: relative, mustContain: [] }],
    });
    assert.equal(status.satisfied, false);
    assert.match(status.missing[0].reason, /is \d+ bytes, which is not a document/);
  });
});

test("a file that exists but does not say the required thing does not satisfy it", () => {
  withTempFile("page.md", `# General Information Page\n\n${"Content. ".repeat(60)}`, (relative) => {
    const status = statusOf({
      id: "stub",
      label: "stub",
      section: "§4",
      owner: "build",
      note: null,
      evidence: [{ path: relative, mustContain: ["Compliant with SB 1495"] }],
    });
    assert.equal(status.satisfied, false);
    assert.match(status.missing[0].reason, /does not state "Compliant with SB 1495"/);
  });
});

test("a content requirement against a PDF reports that it was not checked, rather than passing", () => {
  /* The quiet failure this avoids: reading a PDF's bytes, finding no match for a phrase that
     is plainly printed in it, and either failing wrongly or — worse — matching on compressed
     noise and passing. It says it cannot check instead. */
  withTempFile("volume.pdf", "%PDF-1.4\n".padEnd(400, "x"), (relative) => {
    const status = statusOf({
      id: "stub",
      label: "stub",
      section: "§5",
      owner: "build",
      note: null,
      evidence: [{ path: relative, mustContain: ["implicit bias"] }],
    });
    assert.equal(status.satisfied, false);
    assert.match(status.missing[0].reason, /not a text file this can read/);
  });
});

test("a missing file is reported as missing rather than skipped", () => {
  const status = statusOf({
    id: "stub",
    label: "stub",
    section: "§1",
    owner: "build",
    note: null,
    evidence: [{ path: "california/submission/nothing-here.md", mustContain: [] }],
  });
  assert.equal(status.satisfied, false);
  assert.equal(status.missing[0].reason, "does not exist");
});

test("outstanding work is grouped by section and split by owner", () => {
  const groups = outstanding(submissionStatus());
  for (const group of groups) {
    assert.ok(["build", "human"].includes(group.owner));
    assert.match(group.section, /^§\d+/);
    assert.ok(group.reasons.length > 0, `${group.label} is outstanding for no stated reason`);
  }
  /* Sorted by section so a reader works down the list in the order the work order sets it. */
  const sections = groups.map((group) => Number(group.section.replace(/[^\d]/g, "")));
  assert.deepEqual(sections, [...sections].sort((a, b) => a - b));
});

test("the submission status covers every program and reports both outcomes honestly", () => {
  const statuses = submissionStatus();
  assert.equal(statuses.length, allDeliverables().length);
  for (const entry of statuses) {
    assert.equal(typeof entry.satisfied, "boolean");
    assert.equal(entry.satisfied, entry.missing.length === 0);
  }
  /* Every program is represented. A ledger that quietly dropped a course would read as a
     shorter list rather than as an error. */
  const programs = new Set(statuses.map((entry) => entry.program).filter(Boolean));
  for (const entry of PROGRAMS) assert.ok(programs.has(entry.courseId), `${entry.title} has no deliverables`);
});
