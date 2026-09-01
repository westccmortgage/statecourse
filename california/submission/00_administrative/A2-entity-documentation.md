# A2 — Entity documentation

**RE 303 checklist item 3.** One set of entity documents serves all three applications; each course package cross-references this sheet rather than duplicating it. If DRE prefers a full set behind each application, photocopy this section twice more — nothing in it is application-specific.

## The applicant

| Field | Value |
|---|---|
| Legal name | **StateCourse LLC** |
| Entity type | **California domestic limited liability company** |
| California Secretary of State file number | **B20260376786** |
| Date filed | **August 18, 2026** |
| Principal office | 150 E Olive Avenue, Suite 112, Burbank, CA 91502 |
| Mailing address | 407 N Pacific Coast Highway, Unit 1028, Redondo Beach, CA 90277 |
| Agent for service of process | Anatoliy Kanevsky, 407 N Pacific Coast Highway, Unit 1028, Redondo Beach, CA 90277 |
| Management | Member-managed — all LLC members |
| Organizer | Anatoliy Kanevsky |

## Document submitted

**Articles of Organization, stamped FILED by the California Secretary of State on August 18, 2026, file number B20260376786.**
Held at `california/dre-sources/ca-articles-of-organization-B20260376786.pdf`.

This is the document RE 303 item 3 asks for: a corporation document issued by the California Secretary of State establishing the applicant entity.

## Two addresses, and which goes where

The Articles give **Burbank** as the principal office and **Redondo Beach** as the mailing address. Both are real and both are used, but never interchangeably:

| Where | Which address | Why |
|---|---|---|
| RE 306 item 4 — classroom facility | Burbank (principal office), annotated "no classroom instruction" | The field asks for a facility; there is no classroom, and the principal office is the honest answer with the annotation |
| RE 306 item 5 — mailing address | Redondo Beach | It is the mailing address of record |
| RE 313 — school address | Redondo Beach | Students and DRE correspond to the mailing address |
| RE 311 — sponsoring entity address | Redondo Beach | Same reason |
| RE 311 — course location | Burbank | The school's location; the course itself is correspondence/internet |

Getting this wrong in one place and right in another is the single easiest way to generate a deficiency letter, which is why it is written down rather than remembered.

## Federal employer identification number

**An EIN has been issued to the entity.** The number is deliberately **not recorded in this repository** and appears in no source file, configuration file, or generated page. Where a form asks for it, it is entered by hand from the IRS CP 575 notice. It is a tax identifier needed by the bank and by payment processing rather than by the education platform, and the project rule against production secrets in source control covers it.

## The Wyoming entity is not the applicant

An earlier plan used a Wyoming LLC. **That entity is not the applicant, appears nowhere in this submission, and every analysis that depended on it has been withdrawn** — including the earlier conclusion about RE 304, which is superseded by A6. The Wyoming record is retained in `california/dre-sources/wyoming-articles-of-organization.pdf` for an unrelated purpose and must not be filed with DRE.
