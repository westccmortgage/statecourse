/*
 * Two worked examples in Principles Assignment 05, and the rules they are supposed to follow.
 *
 * Both were wrong in the same way: the prose stated a rule correctly and the arithmetic beneath it
 * did something else, and nothing in the build could tell.
 *
 * The priority waterfall put a mechanics lien whose work commenced in 2023 AHEAD of deeds of trust
 * recorded in 2019 and 2022. Civil Code § 8450 gives the lien priority over an encumbrance that
 * "attaches after commencement of the work of improvement", or that was unrecorded at commencement
 * and unknown to the claimant — and over nothing else. Relation-back moves the lien back in time;
 * it does not move it to the front of the line. The example's own explanation said so two lines
 * below the table that contradicted it.
 *
 * The homestead example applied the $600,000 printed in Code of Civil Procedure § 704.730(a)(1) as
 * the operative ceiling, concluded $600,000, and then said the figure was "before the annual CPI
 * adjustment which would raise it further" — which is to say it announced its own answer as wrong
 * in the sentence after giving it. Subdivision (b) adjusts both printed amounts every January since
 * 2022, and neither adjusted amount is printed anywhere in the section.
 *
 * So the tests below do not check for wording. The waterfall test derives the correct order from
 * the example's OWN facts under § 8450's rule and checks the printed table against it, and checks
 * the running balances as arithmetic. The homestead tests check that no adjusted figure is asserted
 * anywhere the course could be read as stating one.
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const ROOT = path.resolve(import.meta.dirname, "..");
const LESSON = path.join(ROOT, "california/ca-real-estate-principles-45-v1/curriculum/lesson-05.md");
const lesson = () => fs.readFileSync(LESSON, "utf8");

const money = (value) => Number(String(value).replace(/[^0-9]/g, ""));

/* Every `| … |` row of the table that follows `marker`, as arrays of trimmed cells, header and
   rule dropped. Reading the tables rather than asserting a literal block is what lets the test
   still mean something after the prose around it is rewritten. */
function tableAfter(text, marker) {
  const start = text.indexOf(marker);
  assert.notEqual(start, -1, `the lesson no longer contains ${JSON.stringify(marker)}`);
  const rows = [];
  for (const line of text.slice(start + marker.length).split("\n")) {
    if (line.startsWith("|")) rows.push(line.split("|").slice(1, -1).map((cell) => cell.trim()));
    else if (rows.length > 0) break;
  }
  assert.ok(rows.length > 2, `no table follows ${JSON.stringify(marker)}`);
  /* The marker IS the header row, so the first line captured is the `|---|` rule. */
  return rows.slice(1);
}

/* The facts of the example: what was recorded, when, for how much — and, for the mechanics lien,
   when the work commenced, which is the date § 8450 actually measures from. */
function waterfallFacts() {
  const text = lesson();
  const liens = tableAfter(text, "| Recorded | Lien | Amount |").map(([recorded, name, amount]) => {
    const commenced = /work commenced (\d{4})/.exec(name);
    return {
      recorded: Number(recorded),
      name,
      amount: money(amount),
      isTax: /propert(y|ies) tax/i.test(name),
      /* § 8450 measures a mechanics lien from commencement of the work. Everything else is
         measured from when it attached, which the example gives as the recording year. */
      priorityDate: commenced ? Number(commenced[1]) : Number(recorded),
    };
  });
  assert.equal(liens.length, 5, "the waterfall example no longer has five liens");
  assert.ok(liens.some((lien) => /mechanics lien/i.test(lien.name)), "the example no longer contains a mechanics lien");
  const sale = money(/sells at a forced sale for \*\*(\$[\d,]+)\*\*/.exec(text)?.[1] ?? "");
  assert.ok(sale > 0, "the sale price is no longer stated");
  return { liens, sale };
}

test("the waterfall pays the liens in the order the governing rules produce", () => {
  const { liens } = waterfallFacts();

  /* Revenue and Taxation Code § 2192.1: property taxes and public improvement assessments have
     priority over all other liens "regardless of the time of their creation". Everything else is
     first in time, first in right, on the date its priority is measured from. */
  const expected = [
    ...liens.filter((lien) => lien.isTax),
    ...liens.filter((lien) => !lien.isTax).sort((a, b) => a.priorityDate - b.priorityDate || a.recorded - b.recorded),
  ];

  const paid = tableAfter(lesson(), "| Order | Lien |");
  assert.equal(paid.length, liens.length, "the payment table does not have one row per lien");

  for (const [index, row] of paid.entries()) {
    const want = expected[index];
    const cell = row[1];
    const marker = want.isTax
      ? /propert(y|ies) tax/i
      : /mechanics lien/i.test(want.name)
        ? /mechanics lien/i
        : new RegExp(`${want.recorded}`);
    assert.match(
      cell,
      marker,
      `payment position ${index + 1} is "${cell}" and the rules put "${want.name}" there. ` +
        "A mechanics lien takes its priority from commencement of the work under Civil Code § 8450 — " +
        "which places it ahead of what attached after the work began and behind what was already attached.",
    );
  }
});

test("relation-back never lifts the mechanics lien over an encumbrance already attached", () => {
  /* The exact defect, stated as its own invariant so that a future edit cannot reintroduce it by
     rewriting the table alone. */
  const { liens } = waterfallFacts();
  const lien = liens.find((entry) => /mechanics lien/i.test(entry.name));
  const paid = tableAfter(lesson(), "| Order | Lien |").map((row) => row[1]);
  const lienAt = paid.findIndex((cell) => /mechanics lien/i.test(cell));
  assert.notEqual(lienAt, -1, "the mechanics lien is no longer in the payment table");

  for (const earlier of liens.filter((entry) => !entry.isTax && entry.recorded < lien.priorityDate)) {
    const at = paid.findIndex((cell) => cell.includes(String(earlier.recorded)));
    assert.notEqual(at, -1, `${earlier.name} is no longer in the payment table`);
    assert.ok(
      at < lienAt,
      `${earlier.name} attached in ${earlier.recorded}, before the work commenced in ${lien.priorityDate}, ` +
        `so Civil Code § 8450 does not reach it — but the waterfall pays it after the mechanics lien`,
    );
  }
});

test("the waterfall's running balances are arithmetic", () => {
  const { sale } = waterfallFacts();
  let balance = sale;
  for (const row of tableAfter(lesson(), "| Order | Lien |")) {
    /* The last row reads "**$1,700 of $88,000**" — what was paid is the first figure, and what was
       owed is the second. Taking the first is the point of the row. */
    const paid = money(/\$[\d,]+/.exec(row[row.length - 2])?.[0] ?? "");
    const shown = money(row[row.length - 1]);
    balance -= paid;
    assert.equal(shown, balance, `after paying ${row[1]} the balance should be ${balance}, and the table says ${shown}`);
  }
  assert.equal(balance, 0, "the waterfall does not distribute the whole sale price");
});

test("the lesson quotes § 8450's operative words rather than paraphrasing them", () => {
  const text = lesson();
  assert.match(text, /attaches \*\*after commencement of the work of improvement\*\*|attaches after commencement of the work of improvement/);
  assert.match(text, /unrecorded at the commencement of the work of improvement/);
  assert.match(text, /Civil Code § 8450/);
  assert.match(text, /§ 2192\.1/, "the property-tax position in the waterfall names no authority");
});

test("no assessment repeats the proposition the waterfall used to state", () => {
  /* The bank item that teaches relation-back has to say what it does NOT do, because that is the
     half a student gets wrong. */
  const bank = fs.readFileSync(path.join(ROOT, "config/california/principles-question-bank.mjs"), "utf8");
  const item = bank.slice(bank.indexOf("What makes this lien distinctive in priority terms?"));
  const rationale = /rationale: "([^"]+)"/.exec(item)?.[1] ?? "";
  assert.match(rationale, /commencement/i, "the mechanics lien rationale no longer names commencement");
  assert.match(
    rationale,
    /already attached|not.*promot|does not reach/i,
    "the mechanics lien rationale does not say what relation-back fails to reach",
  );
});

/* ── homestead ────────────────────────────────────────────────────────────────────────────── */

const BASE_CEILING = "$600,000";
const BASE_FLOOR = "$300,000";

test("the printed § 704.730 amounts are taught as base figures, not as current ones", () => {
  const text = lesson();
  const section = text.slice(text.indexOf("### 2.8"), text.indexOf("### 2.9"));
  assert.ok(section.includes(BASE_CEILING) && section.includes(BASE_FLOOR), "the section no longer states the statutory figures");
  assert.match(section, /base figures|base amounts|amounts as enacted/i, "the printed figures are not identified as base figures");
  assert.match(section, /adjusted ceiling/i);
  assert.match(section, /adjusted floor/i);
  assert.match(section, /Department of Industrial Relations/, "the index's publisher is not named");
  assert.match(section, /does not give the answer|not printed in the section/i);
});

test("no worked example concludes with an unadjusted figure as the exemption", () => {
  const text = lesson();
  /* The sentence the defect lived in read: "so **$600,000**, before the annual CPI adjustment
     which would raise it further." Any construction that states one of the printed amounts AS the
     exemption is the same defect wearing different words. */
  const forbidden = [
    /so \*\*\$600,000\*\*/,
    /the exemption is \$600,000/i,
    /the exemption is \$300,000/i,
    /exemption (?:figure )?(?:here )?is (?:therefore )?\*\*\$600,000\*\*/i,
    /capped at \$600,000, or \$300,000 — so/i,
  ];
  for (const pattern of forbidden) {
    assert.doesNotMatch(text, pattern, `a worked example states ${pattern} as the exemption, which § 704.730(b) adjusts`);
  }
  /* And it must positively teach the six inputs, or it is not teaching the calculation either. */
  const example = text.slice(text.indexOf("### 2.10"), text.indexOf("### 2.11"));
  for (const part of [/base figures/i, /annual inflation adjustment/i, /countywide median/i, /adjusted ceiling/i, /adjusted floor/i]) {
    assert.match(example, part, `the worked example omits ${part}`);
  }
});

test("the course does not claim the current exemption can be read off the statute", () => {
  const text = lesson();
  assert.doesNotMatch(
    text,
    /comes from the current statute and nowhere else/i,
    "the course still says the amount comes from the statute alone, which is not true where a CPI input is required",
  );
  const item = fs.readFileSync(path.join(ROOT, "config/california/principles-final-exam-bank.mjs"), "utf8");
  const homestead = item.slice(item.indexOf("704.730 sets the homestead exemption"), item.indexOf("704.730 sets the homestead exemption") + 2000);
  assert.doesNotMatch(
    homestead,
    /comes from the current statute rather than/i,
    "the examination still keys an answer to the statute alone",
  );
  assert.match(homestead, /cannot be given from the code alone|base figures rather than the adjusted/i);
});

test("no adjusted homestead figure is stated anywhere in the California build", () => {
  /* An adjusted amount would have to have been computed here, because no authority publishes one:
     § 703.150(e)'s publication duty reaches § 703.140(b) and the article beginning at § 704.010,
     and EJ-156 carries no homestead figure. The register records that finding; this checks that no
     document quietly supplies a number anyway. */
  const register = fs.readFileSync(path.join(ROOT, "california/regulatory/primary-text-readings.md"), "utf8");
  assert.match(register, /EJ-156/);
  assert.match(register, /carries no homestead figure/i);
  assert.match(register, /§ 703\.150/);

  /* Scoped to the sentence rather than to a window: what must not exist is a sentence that offers
     a dollar amount AS the adjusted ceiling, the adjusted floor, or the exemption itself. The
     statutory base amounts and the example's own county median are the three figures the material
     is entitled to state. */
  const ALLOWED = new Set([600000, 300000, 655000]);
  for (const file of [LESSON, path.join(ROOT, "config/california/principles-final-exam-bank.mjs")]) {
    const text = fs.readFileSync(file, "utf8");
    for (const sentence of text.split(/(?<=[.:;])\s+|\n/)) {
      if (!/adjusted ceiling|adjusted floor|the exemption|exemption figure|homestead exemption/i.test(sentence)) continue;
      for (const match of sentence.matchAll(/\$([\d,]{6,})/g)) {
        assert.ok(
          ALLOWED.has(money(match[1])),
          `${path.basename(file)} offers $${money(match[1]).toLocaleString("en-US")} as an exemption amount: ` +
            `${JSON.stringify(sentence.trim().slice(0, 160))}. No authority this project has read publishes an ` +
            "adjusted § 704.730 amount, so none may be printed.",
        );
      }
    }
  }
});

test("no lesson claims a mechanics lien outranks a recorded instrument without saying when", () => {
  /*
   * The residual half of the priority defect, and the reason it survived the first correction.
   *
   * The waterfall was fixed and the § 8450 quotation added, while four summary sentences elsewhere
   * still read "a lien recorded later can outrank a deed of trust recorded before it" with no
   * condition attached. Each is defensible on its own — a deed of trust CAN be recorded before the
   * lien and still lose, if it attached after the work commenced — but read alone each one teaches
   * the thing § 8450 does not say, which is that relation-back beats whatever came first.
   *
   * So the rule enforced here is about what a sentence must carry, not about what it must avoid: a
   * sentence that claims a mechanics lien outranks something has to name the condition under which
   * it does. That is checkable, it does not dictate wording, and it covers courses that cite no
   * section as well as the one that does.
   */
  const OUTRANKS = /\b(outrank|takes? priority over|nonetheless take priority)/i;
  /* Any sentence making a priority claim ABOUT a mechanics lien, however it refers to one — by name,
     by the relation-back label, or by the commencement date the doctrine turns on. */
  const LIEN = /mechanic|relation.back|relates? back|commencement of the work|work commenced|work of improvement/i;
  /* And the conditions that make such a claim true. "The new deed of trust" earns its place: in a
     refinance the new deed of trust is recorded now, after work already begun, so it is inside
     § 8450(a)(1) by the facts of the scenario rather than by a stated condition. */
  const QUALIFIED = /after (?:the )?(?:work |improvement )?commenc|attached after|attaches after|recorded in between|the new deed of trust|already attached|8450/i;

  const offenders = [];
  for (const course of fs.readdirSync(path.join(ROOT, "california"), { withFileTypes: true })) {
    const dir = path.join(ROOT, "california", course.name, "curriculum");
    if (!course.isDirectory() || !fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir).filter((name) => /^lesson-\d+\.md$/.test(name))) {
      const text = fs.readFileSync(path.join(dir, file), "utf8");
      /* Newlines are joined first — a markdown sentence wraps, and splitting on the wrap would
         separate the claim from the lien it is about, which is how the first version of this test
         passed over the very sentences it was written for. Table cells then split on the pipe. */
      const flat = text.replace(/\n[>\s]*/g, " ");
      for (const sentence of flat.split(/(?<=[.!?])\s+|\|/)) {
        if (!OUTRANKS.test(sentence) || !LIEN.test(sentence)) continue;
        if (QUALIFIED.test(sentence)) continue;
        offenders.push(`${course.name}/${file}: ${sentence.trim().slice(0, 150)}`);
      }
    }
  }
  assert.deepEqual(
    offenders,
    [],
    "these sentences say a mechanics lien outranks something without saying when it does:\n  " + offenders.join("\n  "),
  );
});
