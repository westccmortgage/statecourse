# Georgia handoff

## Current state

- Branch: `relay-georgia`, based on the then-current `origin/main` at `2bc2d37`.
- Phase 0: complete after the Georgia test passes and the online content verifier reports either exact `LOCKED` or a disclosed `LOCKED_WITH_MANUAL_VERIFICATION` limited to an explicit HTTP 401/403/429 publisher block with a fresh manual reading. DNS, connection, timeout, or other download failure is never eligible for that status; offline mode is deliberately never a pass.
- Curriculum: not authorized and not begun.
- Applications: not filed.
- Regulatory approvals: none asserted or recorded.
- Commercial/public launch: NO-GO.

## Decisions that must survive handoff

1. Georgia is the next state after Florida because both the market and the owner's personal broker route are attractive.
2. The selected first personal filing is a **$170 inactive Georgia Broker reciprocity application** based on the California broker license, subject to GREC review.
3. Legal Florida residence—not a Florida MLO license—activates the Georgia Law and Practice exam fork.
4. A Georgia broker license does not confer instructor approval. Instructor, school, course, and GNPEC are distinct gates.
5. The separate June 2024 65-point instructor workbook is guidance, not an approval formula. The 53–55 estimate is reproducible only from unverified assumptions (15 license + 0 teaching + 3–5 degree + 35 experience); the two required courses are prerequisites, not points.
6. GREC must approve the computer-based method before curriculum development. Do not copy an existing state's course engine and call it Georgia compliant.
7. Reciprocity certification comes from every licensing jurisdiction and must cover examination, prelicense/CE compliance, good standing, and discipline. The criminal-report rule also has an FBI escalation path.
8. The active firm/affiliation paths are separate. Associate-broker activation needs the active Georgia broker's signed Section C and certification of a written affiliation agreement. A qualifying broker needs the entity-specific role and authority to bind the firm in a contested case. Open Firm says $275, current-rule arithmetic says $200, and a foreign LLC currently has a $235 Secretary of State filing; never hide or guess through those conflicts.
9. Only multiple-choice format, at least four choices, and at least 100 questions form the safe harbor from exam submission. The 13 content buckets, two secure forms, proctoring, scheduling, passing-score, security, and retake rules are independent mandates. Course content still needs the 15 fixed subjects, ethics, written work, proficiency assessments, and the precisely defined pilot.
10. Do not treat source reachability, a submitted form, or a course code as approval.

## External blockers

- GREC comparability/issuance decision for the California broker license.
- Owner-supplied certifications from every real-estate licensing jurisdiction, current law-enforcement background report/FBI escalation if triggered, lawful-presence evidence, disclosures, signature, and payment.
- GREC answer on instructor prerequisite equivalence and evidence scoring.
- GNPEC written exemption/authorization classification.
- Current school form and fee confirmation.
- Written GREC direction on asynchronous methodology, proctoring, passing score, separate exam day, identity/e-signature, pilot evidence, vendor onboarding, reporting, and completion evidence.

## Next work after written answers

Update the phase-zero control without erasing the old uncertainty; attach the written response; assemble broker and instructor evidence; then build the school application. Curriculum comes only after the methodology is authorized. Any future launch must independently verify both GREC and GNPEC status and keep enrollment/payment/credit closed until then.

## Verification

Run:

```text
node scripts/verify-georgia-source-lock.mjs --offline
node --test tests/georgia-phase-zero.test.mjs
```

Offline verification exits unverified by design. Run without `--offline` for content verification. Exact downloadable files must match hash, bytes, MIME, and signature; dynamic pages must match semantic anchors. Only an explicit HTTP 401, 403, or 429 publisher block can produce `LOCKED_WITH_MANUAL_VERIFICATION`, and only when a fresh manual reading exists. DNS, connection, timeout, and generic download failures remain `UNVERIFIED`; redirects must remain on the official allowlist. Any drift, unallowlisted redirect, or soft-404 is a failure and every filing/commerce gate stays closed.
