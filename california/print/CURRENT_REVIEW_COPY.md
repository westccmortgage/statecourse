# Current California review copies

These are newly paginated course texts, not a replacement for the separately identified 458-page archival Principles PDF under `final/`. No professor certification, DRE approval or filing is claimed. Before filing, the reviewing instructor must confirm the exact instructional version used for the course-specific certification.

The browser-free renderer reads the current full HTML, preserves the complete curriculum and formative materials, and verifies each text block against the resulting PDF. PDF text pagination differs from Chromium pagination; page count is not a substitute for instructional equivalence review.

| Course | Pages | PDF SHA-256 |
|---|---:|---|
| ca-real-estate-principles-45-v1 | 524 | `965d5445b479ae8e2d6e3c8dd15d845f05ddb1905941418a794f99b8326f8706` |
| ca-real-estate-practice-45-v1 | 444 | `8142ee953363fcc4445ef9c92c56916321aa41515d97df6c29af51d6eb4041a6` |
| ca-mortgage-loan-brokering-lending-45-v1 | 434 | `8749f5f37c292ce7beb8aec00dc6982db1e9c09dbbe5d523e78967891117fb7e` |

The machine-readable file identities are in `current-build.json`. Dossiers, RE313 page fields, SB1495 traceability and mail instructions must be regenerated with these PDFs. Run `node scripts/test-california-documents.mjs --prepare` to rebuild and synchronize; use the same command without `--prepare` for non-mutating checks. Python requires pypdf/reportlab; DejaVu fonts are required by the browser-free renderer. The archived file is never rewritten by this workflow.
