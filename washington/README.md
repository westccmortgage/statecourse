# Washington StateCourse

Status on 2026-09-06: **Phase 0 baseline and objective audit complete; curriculum remediation, submission and enrollment NO-GO.**

This directory contains two different things:

- an inherited 90-hour curriculum draft; and
- the current regulatory and filing baseline built from Washington primary sources.

The current DOL prescribed curricula fix **60 hours of Real Estate Fundamentals** and **30 hours of Real
Estate Practices**. The inherited draft has not yet passed objective-level conformity. It is not approved,
must not be sold for Washington credit, and must not issue completion certificates.

Start with:

1. `regulatory/phase-0-status.md`
2. `regulatory/requirements-traceability.md`
3. `submission/filing-index.md`
4. `HANDOFF.md`
5. `regulatory/objective-build-plan.md` and both `*-objective-matrix.md` files

The objective inventory retains both source PDFs, all 282 printed records and 151 mandatory subordinate
anchors. Fundamentals has 161 detailed substantive objectives plus ten introduction rollups; its Career
items 8–9 split one sentence, and its instructor-resource record is optional. Practices has 109 objectives.
No objective is signed off as fully covered and the planned 4,500 active minutes are not measured delivery.

Machine-readable provenance is in `config/washington/regulatory-manifest.mjs`. Verify it with
`node scripts/washington-source-lock.mjs` (live) or `--offline` (structure/freshness only).
