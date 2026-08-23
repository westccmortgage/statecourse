# The volume that goes to the Department

This directory holds the exact PDF that was measured, certified and referenced everywhere else in
the submission. It is a copy, byte for byte, of the build output at
`california/print/ca-real-estate-principles-45-v1-course-text.pdf`. Nothing here was rebuilt,
re-rendered or edited to make the copy.

| | |
|---|---|
| File | `Real_Estate_Principles_45_Hour_Final_456pp.pdf` |
| Course | Real Estate Principles, 45 hours (`ca-real-estate-principles-45-v1`) |
| Pages | **456** |
| SHA-256 | `bf68d531ac0a30211ceb24c6218e13125db53b9d50125e1b46f5d5b5525dda1c` |
| Bytes | 6,402,073 |
| Built from | commit `0f4bc36` by `scripts/build-california-print-volume.mjs` |

**Why the hash is written down.** The builder renders through headless Chromium, so a rebuild of
identical content can produce a file with a different hash. The hash above identifies *this* file —
the one the professor certifies, the one RE 313 counts at 456 pages, the one the timed outline is
measured against. If a future build is submitted instead, it is a different artifact and the
certification and page references have to be re-checked against it.

**`california/print/*.pdf` is gitignored; this file is not.** The build outputs are regenerated
and not tracked. This one is tracked on purpose, because it is a submitted deliverable rather than
a build product.
