# Washington requirements traceability

This is the Phase 0 mapping, not a claim of curriculum approval. `Confirmed` means the cited primary
authority says the requirement. `Interpretation` is deliberately qualified. `Regulator confirmation`
means no filing or enrollment decision may rely on it until the agency answers in writing.

| Requirement | Authority / pinpoint | Classification | Evidence artifact | Current result |
|---|---|---|---|---|
| Same-or-lesser reciprocity level | DOL reciprocity page, opening | Confirmed | personal license route | Request Managing Broker; DOL decides equivalence |
| Active/good standing now or within 6 months; WA law exam only | WAC 308-124A-720(1) | Confirmed | personal license route | User fact appears eligible; official history required |
| Official history fields | DOL reciprocity page, Requirements | Confirmed | personal license route | User must order official DRE history |
| Fundamentals 60 hours | DOL Fundamentals Rev. 5/2022, pp. 1-12 | Confirmed | SHA-256 source lock; gap audit | Total correct; objective audit incomplete |
| Practices 30 hours | DOL Practices effective 03-18-2009, pp. 1-9 | Confirmed | SHA-256 source lock; gap audit | Material content gaps |
| Three hours FH/consumer protection inside Fundamentals | RCW 18.85.101(1)(c); DOL Fundamentals prescribed objectives | Confirmed | course engine/module 09 | Hours present; objective alignment incomplete |
| Comprehensive exams: 3 questions/hour, minimum 90, 70% | WAC 308-124H-820(8) | Confirmed | engine computed requirement | 180-item and 90-item finals missing |
| Current materials and objective/practice relation | WAC 308-124H-820(9), (11) | Confirmed | curriculum gap audit | Not yet fully traced |
| School approval and administrator | WAC 308-124H-880, -890, -895; RE-623-121 R/12/25 | Confirmed | filing index/data sheet | No approval/ID; package has placeholders |
| No promotion for credit before approval | WAC 308-124H-880 | Confirmed | enrollment gate | Closed |
| Instructor technique qualification | WAC 308-124H-960 | Confirmed | qualification dossier | Training/experience evidence required |
| California license supports subject competency | RE-623-125 R/8/23 p.2 | Regulator confirmation | DOL inquiry | Form is not explicit about issuing state |
| Distance method controls | WAC 308-124H-830/-835/-840/-845; BPD-600-002B R/9/21 | Confirmed | delivery narrative/gates | Several controls unimplemented |
| Five-year student/publication records | WAC 308-124H-895(4), -935 | Confirmed | records policy outline | Policy prepared; system proof pending |
| Independent proctor | WAC 308-124H-820(8), -840 and current forms | Interpretation | exam administration note | No express requirement located; silence is not a guarantee |
| Foreign LLC and 16-digit UBI | RE-623-121 p.2; WAC 308-124H-890 | Regulator confirmation | DOL inquiry | Do not guess or file placeholder |
| Private Vocational School applicability | RCW28C.10.030; WAC490-105-030; Workforce Board guidance | Regulator confirmation | Request sent2026-09-06 | Resolve actual physical-presence/direct-marketing facts; universal written-determination prerequisite withdrawn |
| Education school versus brokerage firm | RE-623-121; DOL firm page | Confirmed | phase-0 status | Separate regimes |

## Source quality controls

- All controlling URLs are official Washington government sources.
- Six current PDFs are byte-hash pinned: two curricula and four application forms.
- Live lock requires final HTTP success, expected title/content marker, PDF magic, PDF content type and hash;
  it rejects short pages and common soft-404 text.
- Extracted text-layer page counts were reconciled to visible page counts: Fundamentals 12, Practices 9,
  school 3, instructor 4, course 3, distance 2. The visible titles and revision labels matched the text
  extraction. No OCR-only conflict was found in the reviewed title/revision/hour fields.
- `--offline` never reports a live URL check as passed.
