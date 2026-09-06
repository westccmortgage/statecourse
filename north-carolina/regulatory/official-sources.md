# North Carolina official-source ledger

**Control date:** 2026-09-06
**Manifest:** `NC-PHASE0-2026-09-06-v2`
**Regulatory status:** Not approved. Enrollment and credit delivery are closed.

The machine-readable controlling record is
`config/north-carolina/regulatory-manifest.mjs`. It records authority class, exact official URL,
effective/revision date, retrieval date, pinpoint, evidence, supersession check, and transport/PDF
verification state for every source used in Phase 0.

## Authority order

1. North Carolina General Statutes.
2. Current North Carolina Administrative Code text published by OAH.
3. NCREC prescribed syllabus and current application portal/form.
4. NCREC guidance, used only to establish currency or explain a workflow.
5. NCREC market data, used only for market sizing.

No commercial school, law-firm summary, aggregator, or search snippet is controlling authority.

## Main controlling sources

| Subject | Authority | Pinpoint | Exact official source |
|---|---|---|---|
| Personal application | 21 NCAC 58A .0301-.0302 | application data, six-month criminal report, $105 | [OAH .0301](https://reports.oah.state.nc.us/ncac/title%2021%20-%20occupational%20licensing%20boards%20and%20commissions/chapter%2058%20-%20real%20estate%20commission/subchapter%20a/21%20ncac%2058a%20.0301.pdf), [OAH .0302](https://reports.oah.state.nc.us/ncac/title%2021%20-%20occupational%20licensing%20boards%20and%20commissions/chapter%2058%20-%20real%20estate%20commission/subchapter%20a/21%20ncac%2058a%20.0302.pdf) |
| Out-of-state license route | 21 NCAC 58A .0511 | (b)(1)-(2) | [OAH .0511](https://reports.oah.state.nc.us/ncac/title%2021%20-%20occupational%20licensing%20boards%20and%20commissions/chapter%2058%20-%20real%20estate%20commission/subchapter%20a/21%20ncac%2058a%20.0511.pdf) |
| Provider certification | G.S. 93A-34; 21 NCAC 58H .0202 | online certification; filing fields; $200/location | [Article 3](https://www3.ncleg.gov/EnactedLegislation/Statutes/HTML/ByArticle/Chapter_93A/Article_3.html), [OAH .0202](https://reports.oah.state.nc.us/ncac/title%2021%20-%20occupational%20licensing%20boards%20and%20commissions/chapter%2058%20-%20real%20estate%20commission/subchapter%20h/21%20ncac%2058h%20.0202.pdf) |
| Education director | 21 NCAC 58H .0203 | (a), (e)-(h) | [OAH .0203](https://reports.oah.state.nc.us/ncac/title%2021%20-%20occupational%20licensing%20boards%20and%20commissions/chapter%2058%20-%20real%20estate%20commission/subchapter%20h/21%20ncac%2058h%20.0203.pdf) |
| Student disclosure | 21 NCAC 58H .0204 | (a)-(c) | [OAH .0204](https://reports.oah.state.nc.us/ncac/title%2021%20-%20occupational%20licensing%20boards%20and%20commissions/chapter%2058%20-%20real%20estate%20commission/subchapter%20h/21%20ncac%2058h%20.0204.pdf) |
| Completion/reporting | 21 NCAC 58H .0207-.0208 | all paragraphs | [OAH .0207](https://reports.oah.state.nc.us/ncac/title%2021%20-%20occupational%20licensing%20boards%20and%20commissions/chapter%2058%20-%20real%20estate%20commission/subchapter%20h/21%20ncac%2058h%20.0207.pdf), [OAH .0208](https://reports.oah.state.nc.us/ncac/title%2021%20-%20occupational%20licensing%20boards%20and%20commissions/chapter%2058%20-%20real%20estate%20commission/subchapter%20h/21%20ncac%2058h%20.0208.pdf) |
| Instructor approval | 21 NCAC 58H .0302 | (a)-(d) | [OAH .0302](https://reports.oah.state.nc.us/ncac/title%2021%20-%20occupational%20licensing%20boards%20and%20commissions/chapter%2058%20-%20real%20estate%20commission/subchapter%20h/21%20ncac%2058h%20.0302.pdf) |
| Course approval/time | 21 NCAC 58H .0401 | (a)-(f), especially (c)(6) and (f)(2) | [OAH .0401](https://reports.oah.state.nc.us/ncac/title%2021%20-%20occupational%20licensing%20boards%20and%20commissions/chapter%2058%20-%20real%20estate%20commission/subchapter%20h/21%20ncac%2058h%20.0401.pdf) |
| Distance design | 21 NCAC 58H .0415 | (a)-(c) | [OAH .0415](https://reports.oah.state.nc.us/ncac/title%2021%20-%20occupational%20licensing%20boards%20and%20commissions/chapter%2058%20-%20real%20estate%20commission/subchapter%20h/21%20ncac%2058h%20.0415.pdf) |
| Prescribed curriculum | NCREC syllabus | March 2024, amended May 2026, 108 pages | [Official syllabus](https://www.ncrec.gov/Forms/Education/Prelicense_Course_Syllabus.pdf) |

## Verification limitations and conflict resolution

The September 6 capture attempted 19 unique PDF URLs representing 21 source entries. Sixteen OAH
URLs timed out and the NCREC syllabus returned HTTP 403. Two PDFs were retained and identity/hash
checked: April 2026 RELINC (36 pages) and L-09 (3 pages, revised July 2017). Cover/fee pages of RELINC
and all L-09 pages were visually checked against digital text. OCR is unnecessary for these clear
digital text layers. `captures/2026-09-06/capture-log.json` preserves requests, final URL where a
response arrived, content type, status, hashes and exact failures; `page-reviews.json` binds review
to the PDF and render hashes. Sources remain **INCOMPLETE** and `NC-B01` remains open.

The live RELINC replaced April 2025 at the same Pearson URL. Its April 2026 edition now agrees with
Rule 58A .0302 on $105 application and publishes $53 single-section / $63 comprehensive exam fees
on printed page 19 (PDF21). These are current published fees; booking charges and availability
still need the live booking workflow. The previous $50 single-section claim was stale.

Current official indexed .0101(7), .0302, .0401 and 58A .0511 were rechecked September 6. The correct
conversion is 50 instruction minutes per course hour; the 72-hour non-exam allocation is 3,600
actual instruction minutes. Broker equivalency and instructor experience remain pending the
individual NCREC decision. Indexed text is not represented as a retained PDF.

The August 19, 2026 license-count page has an indexed-label inconsistency. Detailed categories are
the reliable arithmetic: 77,507 active full + 4,080 active provisional = **81,587 active individual
brokers**; 15,465 inactive full + 5,119 inactive provisional = 20,584 inactive individuals; plus
17,492 firms and 247 limited nonresident commercial licenses = **119,910 total records**. These
figures establish market scale, not course demand or enrollment.
