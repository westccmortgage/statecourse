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
  /* Later migrations widen earlier tables; those columns are real too. */
  for (const match of strip(combined).matchAll(/alter\s+table\s+([a-z_][a-z0-9_]*)\s+add\s+column\s+(?:if\s+not\s+exists\s+)?([a-z_][a-z0-9_]*)/gi)) {
    columnsFor.get(match[1].toLowerCase())?.add(match[2].toLowerCase());
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
    for (const match of body.matchAll(/\bupdate\s+([a-z_][a-z0-9_]*)\s+set\b/gi)) {
      const table = match[1].toLowerCase();
      assert.ok(createdTables.has(table), `${file.name}: updates "${table}", which no migration creates`);
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
