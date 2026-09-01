import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const databaseDir = path.join(root, "database");
const files = fs.readdirSync(databaseDir).filter((name) => name.endsWith(".sql")).sort();
const sql = files.map((name) => ({ name, body: fs.readFileSync(path.join(databaseDir, name), "utf8") }));
const combined = sql.map((file) => file.body).join("\n");

const strip = (body) => body.replace(/--[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "");

const createdTables = new Set(
  [...strip(combined).matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?([a-z_][a-z0-9_]*)/gi)]
    .map((match) => match[1].toLowerCase()),
);

/* No Postgres is available in this environment, so a migration that names a table no
   migration creates cannot fail until it reaches a real database — which for a write
   inside a function means it fails in production, on the path it was written to
   protect. Migration 006 shipped exactly that defect: four inserts into
   "lms_audit_events", a table that exists nowhere, one of them on the study-time
   heartbeat path. This test is the substitute for running the migrations. */
test("every table written by a migration is created by a migration", () => {
  const columnsFor = new Map();
  for (const match of strip(combined).matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?([a-z_][a-z0-9_]*)\s*\(([\s\S]*?)\n\);/gi)) {
    const table = match[1].toLowerCase();
    const columns = new Set();
    for (const line of match[2].split("\n")) {
      const name = line.trim().match(/^([a-z_][a-z0-9_]*)\s+/i);
      if (name && !/^(primary|unique|foreign|constraint|check|exclude)$/i.test(name[1])) columns.add(name[1].toLowerCase());
    }
    columnsFor.set(table, columns);
  }
  /* Later migrations widen earlier tables; those columns are real too. One ALTER may add
     several columns in a single statement, so the statement is captured whole and every
     "add column" clause inside it is read — matching only the first would leave the rest
     silently unchecked, which is the drift this test exists to catch. */
  for (const statement of strip(combined).matchAll(/alter\s+table\s+([a-z_][a-z0-9_]*)\s+([\s\S]*?);/gi)) {
    const columns = columnsFor.get(statement[1].toLowerCase());
    if (!columns) continue;
    for (const added of statement[2].matchAll(/add\s+column\s+(?:if\s+not\s+exists\s+)?([a-z_][a-z0-9_]*)/gi)) {
      columns.add(added[1].toLowerCase());
    }
  }

  for (const file of sql) {
    const body = strip(file.body);
    for (const match of body.matchAll(/insert\s+into\s+([a-z_][a-z0-9_]*)\s*\(([^)]*)\)/gi)) {
      const table = match[1].toLowerCase();
      assert.ok(createdTables.has(table), `${file.name}: inserts into "${table}", which no migration creates`);
      const known = columnsFor.get(table);
      if (!known) continue;
      for (const column of match[2].split(",").map((item) => item.trim().toLowerCase()).filter(Boolean)) {
        assert.ok(known.has(column), `${file.name}: inserts into ${table}.${column}, which that table does not have`);
      }
    }
    /* Migration 006 also replaced record_california_heartbeat with a body that read
       lms_active_sessions.last_seen_at and credited_seconds — neither column exists.
       Update targets are checked by column for the same reason inserts are. */
    for (const match of body.matchAll(/\bupdate\s+([a-z_][a-z0-9_]*)\s+set\b([\s\S]*?)(?:\bwhere\b|;)/gi)) {
      const table = match[1].toLowerCase();
      assert.ok(createdTables.has(table), `${file.name}: updates "${table}", which no migration creates`);
      const known = columnsFor.get(table);
      if (!known) continue;
      for (const assignment of match[2].matchAll(/(?:^|,)\s*([a-z_][a-z0-9_]*)\s*=/g)) {
        assert.ok(known.has(assignment[1].toLowerCase()),
          `${file.name}: sets ${table}.${assignment[1]}, which that table does not have`);
      }
    }
    /* A function that reads a column the table does not have fails just as hard as one
       that writes it. Row variables are typed %rowtype from the table, so a field read
       off one is checked the same way. */
    for (const match of body.matchAll(/declare([\s\S]*?)\bbegin\b/gi)) {
      for (const declaration of match[1].matchAll(/\b(v_[a-z0-9_]+)\s+([a-z_][a-z0-9_]*)%rowtype/gi)) {
        const known = columnsFor.get(declaration[2].toLowerCase());
        if (!known) continue;
        const reads = new RegExp(`\\b${declaration[1]}\\.([a-z_][a-z0-9_]*)`, "gi");
        for (const read of body.matchAll(reads)) {
          assert.ok(known.has(read[1].toLowerCase()),
            `${file.name}: reads ${declaration[1]}.${read[1]}, which ${declaration[2]} does not have`);
        }
      }
    }
  }
});

test("the regulatory audit trail has exactly one table, and migrations write to it by name", () => {
  assert.ok(createdTables.has("lms_regulatory_audit"));
  assert.ok(!createdTables.has("lms_audit_events"), "a second audit table would split the regulatory trail");
  assert.doesNotMatch(combined, /lms_audit_events/, "a migration still names the audit table that does not exist");
});

test("migration files are numbered and explained", () => {
  for (const file of sql) {
    assert.match(file.name, /^\d{3}_[a-z0-9_]+\.sql$/, `${file.name} is not a numbered migration`);
    assert.match(file.body, /^--[^\n]+/m, `${file.name} carries no comment explaining what it changes`);
  }
});
