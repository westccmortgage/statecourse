import assert from "node:assert/strict";
import test from "node:test";

import { legacyHandler as catalogHandler } from "../netlify/functions/admin-catalog.mjs";
import { assessCourseRow, buildCatalogTruth } from "../netlify/functions/_lib/catalog-truth.mjs";
import { COURSE_ID, createStore, getEvent, postEvent, withConsoleMock } from "./fixtures/admin-console/harness.mjs";

/*
 * A trustworthy catalog is one that reports disagreement rather than resolving it.
 *
 * Six sources describe StateCourse courses and they use different identifiers for the same
 * course. A view that quietly picked a winner would read as authoritative and be wrong; the
 * assertions below are about the reporting staying honest.
 */

test("the catalog endpoint reads and cannot be written to", { concurrency: false }, async () => {
  await withConsoleMock(createStore(), async () => {
    const read = await catalogHandler(getEvent());
    assert.equal(read.statusCode, 200);
    assert.equal(JSON.parse(read.body).readOnly, true);
    assert.equal((await catalogHandler(postEvent({ approvalStatus: "approved" }))).statusCode, 405);
  });
});

test("it says in the payload that it is an inventory and not an approval list", { concurrency: false }, async () => {
  await withConsoleMock(createStore(), async () => {
    const body = JSON.parse((await catalogHandler(getEvent())).body);
    assert.match(body.disclaimer, /not a list of regulator approvals/i);
  });
});

test("the gap between what is advertised and what can be bought is reported, not hidden", { concurrency: false }, async () => {
  await withConsoleMock(createStore(), async () => {
    const truth = await buildCatalogTruth();
    /* The public catalog carries thirty courses; the checkout catalog carries ten. The
       twenty without a checkout counterpart are the single largest fact about this
       catalog, and each gets its own row. */
    assert.ok(truth.summary.publiclyListed > truth.summary.sellable);
    const orphans = truth.rows.filter((row) => row.discrepancies.some((item) => item.code === "public_without_checkout"));
    assert.ok(orphans.length >= 15, `expected many unsellable public courses, found ${orphans.length}`);
    assert.ok(orphans.every((row) => row.payment === null));
  });
});

test("courses are matched by an exact id or a declared identity, never by resemblance", { concurrency: false }, async () => {
  await withConsoleMock(createStore(), async () => {
    const truth = await buildCatalogTruth();
    /* Virginia's two identifiers are explicitly declared as the same state course. */
    const checkout = truth.rows.find((row) => row.key === "va-salesperson");
    const advertised = truth.rows.find((row) => row.key === "va-principles-practices-v1");
    assert.ok(checkout, "the checkout row is missing");
    assert.equal(advertised,undefined,"declared identity must not create a duplicate row");
    assert.equal(checkout.publicEntry.courseId,'va-principles-practices-v1');
    assert.equal(checkout.matchedBy,'declared_course_identity');
  });
});

test("a video course with a declared public identity is one row and retains its video", { concurrency: false }, async () => {
  await withConsoleMock(createStore(), async () => {
    const truth = await buildCatalogTruth();
    /* The public and delivery ids are both retained on one row. */
    const row = truth.rows.find((entry) => entry.key === COURSE_ID);
    assert.ok(row, "the video-bearing course record is missing from the report");
    assert.equal(row.matchedBy, "declared_course_identity");
    assert.equal(row.publicEntry.courseId,'tx-law-of-agency-30');
    assert.ok(row.discrepancies.some((item) => item.code === "public_without_checkout"));
    assert.equal(truth.rows.some(entry=>entry.key==='tx-law-of-agency-30'),false);
    assert.ok(row.video.codeRegistry.length >= 2);
  });
});

test("environment and database disagreeing about approval is named as a disagreement", { concurrency: false }, async () => {
  const store = createStore();
  store.courses.push({
    id: "me-sales-agent",
    state: "ME",
    name: "Maine Real Estate Sales Agent Pre-License Course",
    product_type: "real_estate_prelicense",
    /* The database has been advanced and the environment variable has not. */
    approval_status: "approved",
    enrollment_enabled: true,
    regulatory_approval_number: "ME-2026-001",
    updated_at: "2026-09-01T00:00:00.000Z",
  });
  await withConsoleMock(store, async () => {
    const truth = await buildCatalogTruth();
    const row = truth.rows.find((entry) => entry.key === "me-sales-agent");
    const codes = row.discrepancies.map((item) => item.code);
    assert.ok(codes.includes("approval_status_mismatch"), codes.join(","));
    assert.ok(codes.includes("enrollment_flag_mismatch"), codes.join(","));
    /* Neither side is adopted as the answer. */
    assert.equal(row.payment.approvalStatus, "submission_draft");
    assert.equal(row.dbCourse.approval_status, "approved");
  });
});

/* Built rather than fetched: the checkout catalog freezes its environment variables when
   the module loads, so these states cannot be produced by setting one mid-test. */
function row(overrides = {}) {
  return {
    key: "test-course",
    state: "TX",
    name: "Test course",
    publicEntry: null,
    payment: null,
    dbCourse: null,
    dbVersions: [],
    regulatoryFile: null,
    ...overrides,
  };
}

const payment = (overrides = {}) => ({
  id: "test-course",
  approvalStatus: "submission_draft",
  enrollmentEnabled: false,
  price: { test: null, live: null },
  envKey: "TEST_COURSE",
  ...overrides,
});

test("a live price configured before approval is reported", { concurrency: false }, () => {
  const found = assessCourseRow(row({
    payment: payment({ price: { test: 9900, live: 19900 } }),
    dbCourse: { approval_status: "submission_draft", enrollment_enabled: false },
    dbVersions: [{ lifecycle_status: "development" }],
  }));
  assert.ok(found.some((item) => item.code === "live_price_before_approval"), JSON.stringify(found));
});

test("enrollment enabled with no price is reported, because checkout would refuse every attempt", { concurrency: false }, () => {
  const found = assessCourseRow(row({
    payment: payment({ approvalStatus: "approved", enrollmentEnabled: true }),
    dbCourse: { approval_status: "approved", enrollment_enabled: true },
    dbVersions: [{ lifecycle_status: "approved" }],
  }));
  assert.ok(found.some((item) => item.code === "enrollment_enabled_without_price"), JSON.stringify(found));
});

test("a checkout course with no row in the courses table is reported", { concurrency: false }, () => {
  const found = assessCourseRow(row({ payment: payment(), dbCourse: null }));
  assert.ok(found.some((item) => item.code === "checkout_without_course_record"), JSON.stringify(found));
});

test("a published approval number the courses table does not carry is reported", { concurrency: false }, () => {
  const found = assessCourseRow(row({
    publicEntry: { enrollmentEnabled: false, approvalNumber: "TX-2026-0001" },
    payment: payment(),
    dbCourse: { approval_status: "submission_draft", enrollment_enabled: false, regulatory_approval_number: null },
    dbVersions: [{ lifecycle_status: "development" }],
  }));
  assert.ok(found.some((item) => item.code === "published_approval_number_unbacked"), JSON.stringify(found));
});

test("a row where every source agrees carries no disagreement", { concurrency: false }, () => {
  const found = assessCourseRow(row({
    publicEntry: { enrollmentEnabled: false, approvalNumber: null },
    payment: payment({ price: { test: 9900, live: null } }),
    dbCourse: { approval_status: "submission_draft", enrollment_enabled: false, regulatory_approval_number: null },
    dbVersions: [{ lifecycle_status: "development" }],
    regulatoryFile: { status: "development" },
  }));
  assert.deepEqual(found, []);
});

test("an unreachable database is reported as unavailable, not as an empty catalog", { concurrency: false }, async () => {
  const store = createStore();
  await withConsoleMock(store, async () => {
    /* Supabase stops answering after the doubles are installed. */
    const working = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      if (String(input).includes("/rest/v1/courses")) throw new Error("connection reset");
      return working(input, init);
    };
    const truth = await buildCatalogTruth();
    assert.equal(truth.sources.coursesTable.available, false);
    assert.ok(truth.sources.coursesTable.error);
    /* The checkout catalog is still readable, so the report is partial rather than absent. */
    assert.equal(truth.sources.checkoutCatalog.available, true);
    assert.ok(truth.rows.length > 0);
  });
});

test("the report counts what it found and does not round it into a headline", { concurrency: false }, async () => {
  await withConsoleMock(createStore(), async () => {
    const truth = await buildCatalogTruth();
    const counted = Object.values(truth.summary.discrepancyCounts).reduce((total, value) => total + value, 0);
    const actual = truth.rows.flatMap((row) => row.discrepancies).length;
    assert.equal(counted, actual);
    assert.equal(truth.summary.rows, truth.rows.length);
    assert.equal(
      truth.summary.rowsWithDiscrepancies,
      truth.rows.filter((row) => row.discrepancies.length).length,
    );
  });
});

test("catalog path writes only session, audit and security accounting, never catalog records", { concurrency: false }, async () => {
  await withConsoleMock(createStore(), async (calls) => {
    await catalogHandler(getEvent());
    const writes = calls.filter((call) => call.url.pathname.startsWith("/rest/v1/")
      && ["POST", "PATCH", "PUT", "DELETE"].includes(call.method)
      /* The session upsert and the audit row are the two writes the request makes, and
         neither touches a catalog record. */
      && !call.url.pathname.endsWith("/students")
      && !call.url.pathname.endsWith("/admin_console_actions")
      && !(call.url.pathname.endsWith("/rpc/statecourse_staff_security") && ["rate","check","audit"].includes(call.body?.op)));
    assert.deepEqual(writes.map((call) => `${call.method} ${call.url.pathname}`), []);
  });
});
