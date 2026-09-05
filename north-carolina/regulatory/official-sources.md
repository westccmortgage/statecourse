# North Carolina official-source ledger

**Control date:** 2026-09-04  
**Manifest:** `NC-PHASE0-2026-09-04-v1`  
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

The direct OAH PDF requests timed out in the research environment. Official titles, rule numbers,
history notes, and content anchors were inspected through the indexed official text, but PDF bytes
were not retained. No SHA-256, page rendering, or OCR-to-text-layer comparison is claimed. `NC-B01`
keeps filing blocked until that capture is done from a network that can download the files.

The April 2025 RELINC handbook displays a $100 broker application fee; Rule 58A .0302, effective
2026-04-01, sets $105. The rule controls. The handbook's Pearson single-section charge is therefore
treated as a filing-time check rather than frozen fact.

The August 19, 2026 license-count page has an indexed-label inconsistency. Detailed categories are
the reliable arithmetic: 77,507 active full + 4,080 active provisional = **81,587 active individual
brokers**; 15,465 inactive full + 5,119 inactive provisional = 20,584 inactive individuals; plus
17,492 firms and 247 limited nonresident commercial licenses = **119,910 total records**. These
figures establish market scale, not course demand or enrollment.
