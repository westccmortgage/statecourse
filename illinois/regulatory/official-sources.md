# Illinois official-source manifest

Snapshot: **IL-PHASE0-SOURCE-LOCK-2026-09-06-v2**
Initial review September 4; focused curriculum/legal audit and byte capture **September 6, 2026**. Entries retain their true retrieval dates; this is not a claim that every September 4 source was re-fetched.

Added: **IL-ACT-1**, Act 1-10 definitions, and **IL-CURR-45MB**, the [one-page45h Managing Broker curriculum](https://idfpr.illinois.gov/content/dam/soi/en/web/idfpr/forms/dre/45hrbrokermanagementprelicensecourse.pdf). Current Part 1450 compilation includes the July 13, 2026 amendment to 1450.770; education1105/1175 source notes remain July 7, 2025. The calendar-year2024 data report was previously mislabeled FY2024; its source ID is retained for compatibility.

The controlling structured record is `config/illinois/source-lock.json`. This page is its reviewer index. Secondary commercial pages were not used as controlling authority.

| ID | Authority | Official source | Revision/effective date | Controlling pinpoints |
|---|---|---|---|---|
| IL-ACT-5 | Illinois statute | [225 ILCS 454, Article 5](https://www.ilga.gov/legislation/ILCS/details?ActID=1364&ActName=Real+Estate+License+Act+of+2000.&ChapAct=225+ILCS+454/&Chapter=PROFESSIONS,+OCCUPATIONS,+AND+BUSINESS+OPERATIONS&ChapterID=24&MajorTopic=REGULATION&SeqEnd=3100000&SeqStart=450000) | endorsement effective 2026-01-01 | §§5-27, 5-28, 5-60.1, 5-60.5, 5-70 |
| IL-RULE-1450 | Illinois administrative rule | [68 Ill. Adm. Code Part 1450](https://www.ilga.gov/agencies/JCAR/EntirePart?titlepart=06801450) | compilation through 2026-07-13; section-specific notes | §§1450.100, .130, .400, .410, .460, .570, .770, .1100-.1180 |
| IL-FORM-ENDORSEMENT | Current agency form | [Form IL 505-0347](https://idfpr.illinois.gov/content/dam/soi/en/web/idfpr/forms/dre/real-estate-endorsement-application.pdf) | Rev. 7/25 | PDF pp. 2-7 |
| IL-FORM-PROVIDER | Current agency form | [Form IL 505-0767](https://idfpr.illinois.gov/content/dam/soi/en/web/idfpr/forms/dre/form-505-0767.pdf) | Rev. 3/2025 | PDF pp. 2-7 |
| IL-FORM-COURSE | Current agency form | [Form IL 505-0645](https://idfpr.illinois.gov/content/dam/soi/en/web/idfpr/forms/dre/form-505-0645.pdf) | 8/25 | PDF p. 2 |
| IL-CURR-END-BROKER | Mandatory curriculum | [30-hour Broker endorsement](https://idfpr.illinois.gov/content/dam/soi/en/web/idfpr/forms/dre/30-hour-real-estate-broker-endorsement-curriculum-12-10-2024.pdf) | accepted for applications from 2025-01-01 | PDF pp. 1-2 |
| IL-CURR-END-MB | Mandatory curriculum | [30-hour Managing Broker endorsement](https://idfpr.illinois.gov/content/dam/soi/en/web/idfpr/forms/dre/30-hour-real-estate-managing-broker-endorsement-curriculum-12-10-2024.pdf) | accepted for applications from 2025-01-01 | PDF pp. 1-3 |
| IL-CURR-75 | Mandatory curriculum | [75-hour Broker prelicense](https://idfpr.illinois.gov/content/dam/soi/en/web/idfpr/forms/dre/real-estate-broker-75-hour-pre-license-curriculum-final-jan-1-2020.pdf) | 2020-01-01; still on current IDFPR hub | PDF pp. 1-7 |
| IL-CURR-45POST | Mandatory curriculum | [45-hour Broker post-license](https://idfpr.illinois.gov/content/dam/soi/en/web/idfpr/forms/dre/real-estate-broker-45-hour-post-license-curriculum-final.pdf) | 2020-01-01; still on current IDFPR hub | PDF pp. 1-12 |
| IL-INSTRUCTOR-REQ | Agency guidance | [Pre-license instructor requirements](https://idfpr.illinois.gov/content/dam/soi/en/web/idfpr/forms/dre/prelicense-instr-req-2022.pdf) | Rev. Dec. 2022; current hub link | PDF p. 1 |
| IL-INSTRUCTOR-TRAINING-LIST | Agency registry | [Approved instructor-training programs](https://idfpr.illinois.gov/dre/education/resch512.html) | live registry | provider list |
| IL-PSI-2026 | Designated testing vendor | [2026 PSI candidate booklet](https://test-takers.psiexams.com/api/content/bulletin/4655) | 2026-06-24 | PDF pp. 2-12 |
| IL-SOS-FORM-LLC455 | Secretary of State form | [LLC-45.5](https://www.ilsos.gov/content/dam/publications/pdf_publications/llc455.pdf) | March 2026 edition | PDF pp. 1-2 |
| IL-DATA-FY2024 | Agency report | [2024 Annual Disciplinary Report](https://idfpr.illinois.gov/content/dam/soi/en/web/idfpr/forms/ar/may-2025-pa-100-0286.pdf) | published May 2025; table refers to calendar year | PDF pp.85-86 |
| IL-DATA-BOARD-202603 | Agency minutes | [March 12, 2026 Board minutes](https://idfpr.illinois.gov/content/dam/soi/en/web/idfpr/profs/meetings/minutes/2026-03-12-read-open-minutes.pdf) | counts as of February 2026 | PDF p. 2 |
| CA-DRE-USER-LICENSE | Other-state agency record | [California DRE license 01385024](https://www2.dre.ca.gov/PublicASP/pplinfo.asp?License_id=01385024) | live public record | type, status, issue and expiry dates, comment |
| CA-BPC-10131 | Other-state statute | [California BPC §10131](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=BPC&sectionNum=10131.) | effective 2019-01-01 | subsections (a)-(e) |

## Retrieval validation

Every entry was opened from the official publisher or the testing vendor linked by IDFPR. The expected document title, controlling content, revision footer/effective note where present, and page count were checked. The current IDFPR hub was used to reject obsolete-looking-but-still-current false positives: the 2020 curricula remain current links as of retrieval. For the critical endorsement, provider, course, and Broker-endorsement PDFs, extracted text was reconciled to page boundaries and a rendered-page spot check. No scanned PDF was treated as reliable from OCR alone.

The legacy validation flags are human-review metadata. The actual byte evidence is in `config/illinois/source-evidence.json`: nine PDFs and the official curriculum hub have hashes and content markers verified against saved originals. Act 1 and Part 1450 rejected byte download with HTTP403 but were reviewed through official web text; they remain explicitly without local byte locks. This distinguishes research review from reproducible capture. The source-foundation audit records the remaining topic-level citation gaps.
