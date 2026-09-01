# The volume that goes to the Department

This directory holds the exact PDF that was measured, certified and referenced everywhere else in
the submission. It is a copy, byte for byte, of the build output at
`california/print/ca-real-estate-principles-45-v1-course-text.pdf`. Nothing here was rebuilt,
re-rendered or edited to make the copy.

| | |
|---|---|
| File | `Real_Estate_Principles_45_Hour_Final_458pp.pdf` |
| Course | Real Estate Principles, 45 hours (`ca-real-estate-principles-45-v1`) |
| Pages | **458** |
| SHA-256 | `f9968a7d2fad6bec8e4d233541912bcbca24c7cdcabddaa6997f7bbab8eab4ef` |
| Bytes | 6,441,134 |

**Why the hash is written down.** The builder renders through headless Chromium, so a rebuild of
identical content can produce a file with a different hash. The hash above identifies *this* file —
the one the professor certifies, the one RE 313 counts at 458 pages, the one the timed outline is
measured against. If a future build is submitted instead, it is a different artifact and the
certification and page references have to be re-checked against it.

**It replaced a 456-page volume on 23 August 2026.** That volume stated two rules its own worked
examples did not follow — a mechanics lien priority waterfall that put the lien ahead of deeds of
trust recorded years before the work commenced, and a homestead exemption example that applied the
unadjusted figure printed in Code of Civil Procedure § 704.730 as if it were the current one. Both
were corrected against the primary text, which is what added the two pages. The superseded
`…_456pp.pdf` was deleted rather than kept, so that no file in this directory carries a page count
that is not the page count of the book inside it.

**A second pass the same day narrowed six summary sentences** that still said a mechanics lien
"can outrank a deed of trust recorded before it" without naming the condition under which it does.
The page count did not move; the bytes and the hash did, which is the reason a hash is recorded
here at all. The hash above is the current one.

**`california/print/*.pdf` is gitignored; this file is not.** The build outputs are regenerated
and not tracked. This one is tracked on purpose, because it is a submitted deliverable rather than
a build product.
