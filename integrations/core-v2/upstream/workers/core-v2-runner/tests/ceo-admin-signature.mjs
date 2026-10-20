/* THE DOOR'S PROOF OF CALLER.
 *
 * The CEO Admin door no longer trusts a JWT, because the only one that would
 * verify is signed with this project's own secret. It checks an HMAC over the
 * request body with a secret shared for this door alone. These checks pin that
 * proof: what it accepts, everything it refuses, and one fixed vector the
 * administrative application's test pins too, so the signer on one side and
 * the verifier on the other cannot drift apart without both suites saying so.
 */
import { harness, closeNetwork } from "../../core-v2/tests/harness.mjs";
import { MINIMUM_SECRET_LENGTH, WINDOW_SECONDS, sign, verify } from "../ceo-admin/signature.ts";

const tripped = closeNetwork();
const t = harness("the door's proof of caller: an HMAC over the body, with a secret lent for nothing else");

const SECRET = "contract-vector-secret-0123456789abcdef";
const NOW = 1790000000;
const BODY = JSON.stringify({ op: "preflight", adminOwnerUserId: "00000000-0000-4000-8000-000000000001" });
const VECTOR = "49fb2d8408f8fc702360c78e6cbc41812a4b8c281787a383667955bfff2f60e6";

t.section("the signature both systems compute");
t.check("the fixed contract vector: this exact secret, time and body sign to this exact hex (the Admin's test pins the same)",
  sign(SECRET, String(NOW), BODY) === VECTOR, sign(SECRET, String(NOW), BODY));
t.check("a request signed that way is accepted", verify(SECRET, String(NOW), VECTOR, BODY, NOW) === null);
t.check("…anywhere inside the window", verify(SECRET, String(NOW), VECTOR, BODY, NOW + WINDOW_SECONDS) === null
  && verify(SECRET, String(NOW), VECTOR, BODY, NOW - WINDOW_SECONDS) === null);

t.check("the Python factory adapter and Core verifier share the exact byte contract",
  sign('s'.repeat(32), '1790650000', '{"op":"get_work_order","work_order_id":"synthetic-order"}')
    === '6c33d2f345c2432baa4b519e9e9f81b66969a51d7b79e5245421188d8b7353eb');

t.section("everything it refuses");
t.check("a body changed by one character", verify(SECRET, String(NOW), VECTOR, BODY.replace("preflight", "preflighT"), NOW) !== null);
t.check("a timestamp changed after signing", verify(SECRET, String(NOW + 1), VECTOR, BODY, NOW) !== null);
t.check("a request older than the window", verify(SECRET, String(NOW), VECTOR, BODY, NOW + WINDOW_SECONDS + 1) !== null);
t.check("a request from further ahead than the window", verify(SECRET, String(NOW), VECTOR, BODY, NOW - WINDOW_SECONDS - 1) !== null);
t.check("a signature made with another secret", verify(`${SECRET}x`, String(NOW), VECTOR, BODY, NOW) !== null);
t.check("no signature, and a malformed one", verify(SECRET, String(NOW), null, BODY, NOW) !== null
  && verify(SECRET, String(NOW), VECTOR.toUpperCase(), BODY, NOW) !== null && verify(SECRET, String(NOW), VECTOR.slice(1), BODY, NOW) !== null);
t.check("no timestamp, and one that is not ten digits of seconds", verify(SECRET, null, VECTOR, BODY, NOW) !== null
  && verify(SECRET, `${NOW}000`, VECTOR, BODY, NOW) !== null);
t.check("a door whose secret is unset or shorter than the minimum opens for nobody, whatever is signed with it",
  verify(undefined, String(NOW), VECTOR, BODY, NOW) !== null
  && verify("short", String(NOW), sign("short", String(NOW), BODY), BODY, NOW) !== null
  && verify("s".repeat(MINIMUM_SECRET_LENGTH - 1), String(NOW), sign("s".repeat(MINIMUM_SECRET_LENGTH - 1), String(NOW), BODY), BODY, NOW) !== null);

t.section("what the door does with it");
const door = await import("node:fs").then((fs) => fs.readFileSync(new URL("../../../supabase/functions/core-v2-ceo-admin/index.ts", import.meta.url), "utf8"));
t.check("the door verifies the signature before it reads the operation or opens the record",
  door.indexOf("verify(Deno.env.get(\"CEO_ADMIN_DOOR_SECRET\")") > -1
  && door.indexOf("verify(Deno.env.get(\"CEO_ADMIN_DOOR_SECRET\")") < door.indexOf("const op =")
  && door.indexOf("verify(Deno.env.get(\"CEO_ADMIN_DOOR_SECRET\")") < door.indexOf("EdgeDatabase.connect("));
t.check("the submitter comes from the deployment, never from the request", /Deno\.env\.get\("CORE_V2_CEO_ADMIN_SUBMITTER"\)/.test(door)
  && !/authorization/i.test(door.replace(/\/\*[\s\S]*?\*\//g, "")));
const config = await import("node:fs").then((fs) => fs.readFileSync(new URL("../../../supabase/config.toml", import.meta.url), "utf8"));
t.check("the platform's JWT check is off for this door alone, and declared rather than assumed",
  /\[functions\.core-v2-ceo-admin\]\s*\nverify_jwt = false/.test(config));

const tickDoor = await import("node:fs").then((fs) => fs.readFileSync(new URL("../../../supabase/functions/core-v2-runner-tick/index.ts", import.meta.url), "utf8"));
t.check("the CEO Admin wake-up uses the exact secret header the runner tick door accepts",
  door.includes('"x-core-v2-runner": key')
  && /const SECRET_HEADER = "x-core-v2-runner";/.test(tickDoor)
  && !door.includes('"x-core-v2-runner-secret": key'));

t.check("an idempotent retry wakes the existing workflow again instead of creating a second one",
  /if \(already\) \{[\s\S]*const woke = await knock\(\);[\s\S]*created: false,[\s\S]*wokeRunner: woke/.test(door));

t.check("status reads the budget ledger's real columns, not obsolete aliases",
  door.includes("reserved::text as reserved")
  && door.includes("settled::text as spent")
  && door.includes("stopped_reason")
  && !door.includes("spent::text as spent, currency, state"));

t.check("nothing in this suite tried to reach a network", tripped() === 0, `${tripped()} attempts`);
t.finish();
