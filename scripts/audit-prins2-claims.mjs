/**
 * TX Principles II — mechanical claim-to-source audit.
 *
 * THE ENGINE MOVED; THIS COMMAND DID NOT. Everything this script used to contain now lives in
 * scripts/lib/tx-claim-audit.mjs, shared with the other Texas courses. The name of this file and
 * the ledger it writes are recorded in the Principles II content freeze, so neither may change;
 * only the body moved. The extracted engine produces this course's ledger byte for byte, and that
 * was verified against a copy of the pre-extraction output rather than assumed.
 *
 * WHAT THIS PROVES, AND WHAT IT CANNOT. It proves the MECHANICAL half of the audit: that every
 * citation in the curriculum names a section present in a held source, and that every verbatim
 * quotation attributed to a source is present in that source's text. It cannot prove that a
 * paraphrase preserves legal meaning, that an exception has not been taught as a general rule, or
 * that a provision was in force on the project date. Those are recorded per claim by review.
 *
 * Usage: node scripts/audit-prins2-claims.mjs [--json <path>]
 * Exit status is non-zero if any citation resolves to a section not present in a held source.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { runClaimAudit } from "./lib/tx-claim-audit.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HOME = "texas/tx-principles-real-estate-ii-30-v1";

const { failures } = runClaimAudit({
  root,
  curriculumDir: path.join(root, HOME, "curriculum"),
  outPath: path.join(root, HOME, "claim-audit.json"),
  generatedBy: "scripts/audit-prins2-claims.mjs",
  generatedFor: "Texas Principles of Real Estate II",
});

process.exitCode = failures.length ? 1 : 0;
