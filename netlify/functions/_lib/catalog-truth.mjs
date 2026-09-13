import fs from "node:fs/promises";
import path from "node:path";
import { getCourseCatalog, getPackageCatalog } from "../../../config/course-catalog.mjs";
import { STREAM_MEDIA } from "../../../config/stream-media.mjs";
import { dbRequest } from "./db.mjs";
import { COURSE_IDENTITIES } from "../../../config/course-identities.mjs";
import { NMLS_TRAINING_COURSE } from "../../../config/nmls-course-identity.mjs";

/*
 * What the catalog actually is, as opposed to what any one file says it is.
 *
 * Six places describe StateCourse courses and they do not agree:
 *
 *   public/statecourse/data/course-catalog.json   what visitors are shown
 *   config/course-catalog.mjs                     what checkout can sell, driven by env vars
 *   courses (table)                               what enrollment and delivery join against
 *   regulatory_course_versions (table)            lifecycle, hours, credit
 *   config/regulatory-course-versions.json        the same lifecycle, in the repository
 *   config/state-regulatory-controls.json         regulator detail, and the only id bridge
 *
 * They also use different identifiers for the same course: the public catalog calls
 * Virginia's course va-principles-practices-v1 and checkout calls it va-salesperson.
 * state-regulatory-controls.json carries payment_product_id for four courses; for the rest
 * there is no bridge at all.
 *
 * This module reports that. It matches on an exact id or on a declared payment_product_id
 * and on nothing else — an inferred match would turn a real gap into a reassuring row —
 * and it states every disagreement it finds rather than picking a winner.
 *
 * It reads. It never writes approval_status, enrollment_enabled, or any lifecycle field:
 * those move when a regulator moves them, and a console that could set them would make the
 * catalog less trustworthy, not more.
 */

const ROOT = path.resolve(process.cwd());

async function readJson(relative) {
  try {
    return JSON.parse(await fs.readFile(path.join(ROOT, relative), "utf8"));
  } catch {
    return null;
  }
}

/* A missing table is reported as unavailable rather than as an empty catalog: "the
   database says this course does not exist" and "the database could not be reached" lead
   an operator to opposite conclusions. */
async function readTable(query) {
  try {
    return { rows: (await dbRequest(query)) || [], available: true, error: null };
  } catch (error) {
    return { rows: [], available: false, error: String(error?.message || "database_unavailable") };
  }
}

function publicRows(catalog) {
  if (!catalog?.categories) return [];
  return catalog.categories.flatMap((category) => (category.programs || []).flatMap(
    (program) => (program.courses || []).map((course) => ({
      categoryId: category.category_id,
      programId: program.program_id,
      courseId: course.course_id,
      state: course.state_id || program.state_code || null,
      title: course.course_title || null,
      requiredHours: course.required_hours ?? null,
      approvalStatus: course.approval_status ?? null,
      approvalNumber: course.approval_number ?? null,
      enrollmentEnabled: course.enrollment_enabled === true,
      operatingMode: course.operating_mode || null,
      price: course.price ?? null,
      route: course.route || null,
    })),
  ));
}

/* id -> id, declared rather than guessed. */
function bridge(controls) {
  const map = new Map();
  for (const [regulatoryId, entry] of Object.entries(controls?.states || {})) {
    if (entry?.payment_product_id) map.set(entry.payment_product_id, regulatoryId);
  }
  return map;
}

function discrepancy(code, detail) {
  return { code, detail };
}

/*
 * The reconciliation rules, exported so they can be tested directly.
 *
 * config/course-catalog.mjs reads its environment variables once, when the module loads, so
 * a test cannot make the checkout catalog say something new by setting a variable. Testing
 * the rules against constructed rows is the honest way to cover cases the current
 * environment does not produce.
 */
export function assessCourseRow(row) {
  const found = [];
  const { publicEntry, payment, dbCourse, dbVersions, regulatoryFile } = row;

  const declaredFreeTraining = publicEntry?.courseId === NMLS_TRAINING_COURSE.id && publicEntry.state === 'US' &&
    publicEntry.categoryId === 'mortgage' && publicEntry.operatingMode === 'free_training' && publicEntry.enrollmentEnabled === false && publicEntry.price === null;
  if (publicEntry && !payment && !declaredFreeTraining) {
    found.push(discrepancy("public_without_checkout",
      "Listed in the public catalog with no course in the checkout catalog, so a visitor cannot buy it."));
  }
  if (payment && !publicEntry) {
    found.push(discrepancy("checkout_without_public",
      "Sellable by the checkout catalog but absent from the public catalog."));
  }
  if (payment && !dbCourse) {
    found.push(discrepancy("checkout_without_course_record",
      "The checkout catalog names a course with no row in the courses table; enrollment would fail on the foreign key."));
  }
  if (payment && dbCourse && payment.approvalStatus !== dbCourse.approval_status) {
    found.push(discrepancy("approval_status_mismatch",
      `Environment says ${payment.approvalStatus}; courses.approval_status says ${dbCourse.approval_status}.`));
  }
  if (payment && dbCourse && payment.enrollmentEnabled !== dbCourse.enrollment_enabled) {
    found.push(discrepancy("enrollment_flag_mismatch",
      `Environment says enrollment ${payment.enrollmentEnabled ? "enabled" : "disabled"}; `
      + `courses.enrollment_enabled says ${dbCourse.enrollment_enabled ? "enabled" : "disabled"}.`));
  }
  if (publicEntry && payment && publicEntry.enrollmentEnabled !== payment.enrollmentEnabled) {
    found.push(discrepancy("public_enrollment_claim_mismatch",
      `The public catalog shows enrollment ${publicEntry.enrollmentEnabled ? "open" : "closed"} `
      + `while checkout has it ${payment.enrollmentEnabled ? "open" : "closed"}.`));
  }
  if (payment?.enrollmentEnabled && !payment.price.test && !payment.price.live) {
    found.push(discrepancy("enrollment_enabled_without_price",
      "Enrollment is enabled and no price is configured, so checkout refuses every attempt."));
  }
  if (payment?.price.live && payment.approvalStatus !== "approved") {
    found.push(discrepancy("live_price_before_approval",
      `A live price is configured while approval status is ${payment.approvalStatus}.`));
  }
  if (payment && !regulatoryFile && !dbVersions.length) {
    found.push(discrepancy("no_regulatory_version_record",
      "No lifecycle record in config/regulatory-course-versions.json or regulatory_course_versions."));
  }
  if (regulatoryFile && dbVersions.length) {
    const dbStatuses = new Set(dbVersions.map((version) => version.lifecycle_status));
    if (!dbStatuses.has(regulatoryFile.status)) {
      found.push(discrepancy("regulatory_status_mismatch",
        `The repository file says ${regulatoryFile.status}; the database says ${[...dbStatuses].join(", ") || "nothing"}.`));
    }
  }
  if (publicEntry?.approvalNumber && !dbCourse?.regulatory_approval_number) {
    found.push(discrepancy("published_approval_number_unbacked",
      "The public catalog shows an approval number that the courses table does not carry."));
  }
  return found;
}

/*
 * Video is reported per course because "which courses have video and is it actually
 * deliverable" is a catalog question, and because the code registry and the console
 * registry can disagree — an asset in one and not the other is the failure mode worth
 * seeing early.
 */
function videoFor(courseIds, codeRegistry, consoleAssets, readiness, placements) {
  const ids = new Set(courseIds.filter(Boolean));
  const inCode = Object.values(codeRegistry)
    .filter((media) => ids.has(media.courseId))
    .map((media) => ({ assetKey: media.assetKey, screenId: media.screenId, source: "code_registry" }));
  const inConsole = consoleAssets
    .filter((asset) => ids.has(asset.course_id))
    .map((asset) => {
      const ready = readiness.find((entry) => entry.asset_key === asset.asset_key) || null;
      const placement = placements.find((entry) => entry.asset_key === asset.asset_key) || null;
      return {
        assetKey: asset.asset_key,
        screenId: asset.screen_id,
        source: "admin_console",
        uploadComplete: Boolean(asset.stream_uid),
        releaseReady: ready?.release_ready === true,
        outstandingGates: ready?.outstanding_gates || null,
        placement: placement?.placement_status || "none",
      };
    });
  const codeKeys = new Set(inCode.map((entry) => entry.assetKey));
  const consoleKeys = new Set(inConsole.map((entry) => entry.assetKey));
  return {
    codeRegistry: inCode,
    console: inConsole,
    onlyInCodeRegistry: [...codeKeys].filter((key) => !consoleKeys.has(key)),
    onlyInConsole: [...consoleKeys].filter((key) => !codeKeys.has(key)),
  };
}

export async function buildCatalogTruth() {
  const [publicCatalog, regulatoryFile, controls, portfolio] = await Promise.all([
    readJson("public/statecourse/data/course-catalog.json"),
    readJson("config/regulatory-course-versions.json"),
    readJson("config/state-regulatory-controls.json"),
    readJson("video-production/portfolio.json"),
  ]);

  const [courses, versions, assets, readiness, placements] = await Promise.all([
    readTable("courses?select=id,state,name,product_type,approval_status,enrollment_enabled,regulatory_approval_number,updated_at&order=id.asc"),
    readTable("regulatory_course_versions?select=course_id,version,lifecycle_status,required_hours,approval_number,enrollment_enabled,regulatory_credit_enabled,effective_date,expiration_date&order=course_id.asc"),
    readTable("video_assets?select=asset_key,course_id,delivery_id,screen_id,label,duration_seconds,stream_uid,created_at&order=asset_key.asc"),
    readTable("video_release_readiness?select=asset_key,required_gates,passed_gates,outstanding_gates,release_ready"),
    readTable("current_video_placements?select=asset_key,placement_status,recorded_at"),
  ]);

  const paymentCourses = getCourseCatalog();
  const publicEntries = publicRows(publicCatalog);
  const paymentToRegulatory = bridge(controls);

  const dbCourseById = new Map(courses.rows.map((course) => [course.id, course]));
  const publicById = new Map(publicEntries.map((entry) => [entry.courseId, entry]));
  const regulatoryById = new Map((regulatoryFile?.courses || []).map((entry) => [entry.course_id, entry]));

  const claimedPublic = new Set();
  const rows = [];
  const publicIdentityFor = (canonicalId,state) => Object.entries(COURSE_IDENTITIES)
    .find(([,identity]) => identity.id===canonicalId && identity.state===state)?.[0] || null;
  const versionsFor = ids => versions.rows.filter(version => ids.includes(version.course_id));

  for (const payment of paymentCourses) {
    const regulatoryId = paymentToRegulatory.get(payment.id) || null;
    /* Exact id first; the declared bridge second. Nothing else — a course whose public and
       checkout ids differ with no declared bridge is reported as two unmatched rows, which
       is what it is. */
    const publicIdentity = publicIdentityFor(payment.id,payment.state);
    const publicEntry = publicById.get(payment.id) || (publicIdentity ? publicById.get(publicIdentity) : null) || null;
    if (publicEntry) claimedPublic.add(publicEntry.courseId);

    const dbCourse = dbCourseById.get(payment.id) || null;
    const ids = [...new Set([payment.id,regulatoryId,publicEntry?.courseId].filter(Boolean))];
    const dbVersions = versionsFor(ids);
    const regulatoryFileEntry = regulatoryById.get(regulatoryId || "") || regulatoryById.get(payment.id) || null;

    const row = {
      key: payment.id,
      state: payment.state,
      name: payment.name,
      matchedBy: publicEntry ? (publicEntry.courseId===payment.id ? "exact_id" : "declared_course_identity") : (regulatoryId ? "payment_product_id" : "unmatched"),
      publicEntry,
      payment: {
        id: payment.id,
        approvalStatus: payment.approvalStatus,
        enrollmentEnabled: payment.enrollmentEnabled,
        price: payment.price,
        envKey: payment.envKey,
      },
      dbCourse,
      dbVersions,
      regulatoryFile: regulatoryFileEntry,
      regulatoryControls: controls?.states?.[regulatoryId || ""] || null,
      video: videoFor(ids, STREAM_MEDIA, assets.rows, readiness.rows, placements.rows),
    };
    row.discrepancies = assessCourseRow(row);
    rows.push(row);
  }

  /* Public entries with no checkout counterpart are the largest single gap and get their
     own rows rather than a footnote. */
  for (const entry of publicEntries) {
    if (claimedPublic.has(entry.courseId)) continue;
    const identity = COURSE_IDENTITIES[entry.courseId];
    const canonicalId = identity?.state===entry.state ? identity.id : entry.courseId;
    const ids = [...new Set([entry.courseId,canonicalId].filter(Boolean))];
    const dbCourse = dbCourseById.get(canonicalId) || dbCourseById.get(entry.courseId) || null;
    const row = {
      key: canonicalId,
      state: entry.state,
      name: entry.title,
      matchedBy: canonicalId===entry.courseId ? "public_only" : "declared_course_identity",
      publicEntry: entry,
      payment: null,
      dbCourse,
      dbVersions: versionsFor(ids),
      regulatoryFile: regulatoryById.get(canonicalId) || regulatoryById.get(entry.courseId) || null,
      regulatoryControls: controls?.states?.[canonicalId] || controls?.states?.[entry.courseId] || null,
      video: videoFor(ids, STREAM_MEDIA, assets.rows, readiness.rows, placements.rows),
    };
    row.discrepancies = assessCourseRow(row);
    rows.push(row);
  }

  /* A course record carrying video but named by no catalog is invisible to both lists and
     is the case that produced tx-law-of-agency-30-v1. */
  const catalogued = new Set(rows.flatMap((row) => [row.key,row.publicEntry?.courseId,row.payment?.id].filter(Boolean)));
  const videoCourseIds = new Set([
    ...Object.values(STREAM_MEDIA).map((media) => media.courseId),
    ...assets.rows.map((asset) => asset.course_id),
  ]);
  for (const courseId of videoCourseIds) {
    if (catalogued.has(courseId)) continue;
    const dbCourse = dbCourseById.get(courseId) || null;
    const row = {
      key: courseId,
      state: dbCourse?.state || null,
      name: dbCourse?.name || courseId,
      matchedBy: "video_only",
      publicEntry: null,
      payment: null,
      dbCourse,
      dbVersions: versions.rows.filter((version) => version.course_id === courseId),
      regulatoryFile: regulatoryById.get(courseId) || null,
      regulatoryControls: null,
      video: videoFor([courseId], STREAM_MEDIA, assets.rows, readiness.rows, placements.rows),
      discrepancies: [discrepancy("course_carries_video_without_catalog_entry",
        "Video is registered against this course id, which appears in neither the public catalog nor the checkout catalog.")],
    };
    rows.push(row);
  }

  rows.sort((left, right) => String(left.state || "ZZ").localeCompare(String(right.state || "ZZ"))
    || String(left.key).localeCompare(String(right.key)));

  const sellable = rows.filter((row) => row.payment).length;
  return {
    generatedAt: new Date().toISOString(),
    /* Said explicitly because a table of courses next to the word "approved" reads as an
       approval list, and this is an inventory of what the systems say. */
    disclaimer: "An inventory of what each system currently records. It is not a list of "
      + "regulator approvals and it grants none.",
    sources: {
      publicCatalog: { available: Boolean(publicCatalog), courseCount: publicEntries.length },
      checkoutCatalog: { available: true, courseCount: paymentCourses.length, packageCount: getPackageCatalog().length },
      coursesTable: { available: courses.available, error: courses.error, rowCount: courses.rows.length },
      regulatoryVersionsTable: { available: versions.available, error: versions.error, rowCount: versions.rows.length },
      regulatoryVersionsFile: { available: Boolean(regulatoryFile), courseCount: (regulatoryFile?.courses || []).length },
      stateRegulatoryControls: { available: Boolean(controls), courseCount: Object.keys(controls?.states || {}).length },
      videoConsole: { available: assets.available, error: assets.error, assetCount: assets.rows.length },
      videoCodeRegistry: { assetCount: Object.keys(STREAM_MEDIA).length },
      videoPortfolio: portfolio
        ? { asOf: portfolio.as_of, builtStates: portfolio.built_state_count, courses: portfolio.course_count }
        : null,
    },
    summary: {
      rows: rows.length,
      publiclyListed: publicEntries.length,
      sellable,
      enrollmentEnabled: paymentCourses.filter((course) => course.enrollmentEnabled).length,
      approvedInEnvironment: paymentCourses.filter((course) => course.approvalStatus === "approved").length,
      rowsWithDiscrepancies: rows.filter((row) => row.discrepancies.length).length,
      discrepancyCounts: rows.flatMap((row) => row.discrepancies).reduce((counts, item) => {
        counts[item.code] = (counts[item.code] || 0) + 1;
        return counts;
      }, {}),
    },
    rows,
  };
}
