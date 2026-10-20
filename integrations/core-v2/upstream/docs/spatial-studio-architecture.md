# Measured Decision Spatial Intelligence Studio

## Product boundary

Studio is the governed bridge between physical-property evidence and an Apple Vision Pro experience. It is not a generic file manager and it does not let AI silently turn suggestions into facts.

The production path is:

1. Capture: phone photos, video, 360 media, plans, records, USDZ, or Reality assets.
2. Organize: assign every source to an organization, property, building, level, and space.
3. Preserve: keep the original in a private immutable storage path and record provenance.
4. Analyze: create a server-side job using selected evidence and a versioned processing profile.
5. Review: present suggestions beside the exact source; a named human accepts, edits, or rejects each suggestion.
6. Package: freeze a release manifest that references only approved evidence and review records.
7. Experience: a native visionOS client reads the manifest and private signed media URLs.

## Security boundary

- Supabase Auth supplies the user identity.
- Row Level Security limits all records to organization membership.
- Storage bucket `property-evidence` is private.
- Provider API keys exist only in a server-side Edge Function or worker.
- The browser never receives a provider secret or service-role key.
- Signed media URLs are short-lived and issued after an authorization check.
- AI output is stored in `ai_suggestions`, separate from `verified_observations`.
- A Vision package can only be marked `approved` by an authorized human reviewer.

## AI processing contract

Input includes evidence IDs, a processing-profile version, allowed tasks, and the requesting user. The worker resolves private files, validates MIME type and size, invokes the approved model, validates structured output, and writes suggestions with source references and model provenance.

Allowed early outputs:

- source-grounded visible observations;
- candidate room/object labels;
- contradictions and missing-evidence questions;
- candidate spatial anchors for human placement;
- summaries that preserve uncertainty.

Disallowed outputs:

- code-compliance certification;
- structural, environmental, or medical diagnosis;
- appraisal or final valuation;
- percentage-of-completion claims without an approved deterministic method;
- autonomous lending, insurance, construction, or safety decisions.

## Decisions and the record as it stood

Every AI observation stays a suggestion until a person rules on it, and a ruling is never overwritten (migration `076`).

- **A verdict on a marker** (confirmed, incorrect, needs more evidence, or a pin placed by hand) is one row in `marker_reviews`, written only through `record_marker_review`, which names the signed-in person and their email. Confirming is open to owners, admins, reviewers and project managers; contributors may place pins. A marker is identified by its capture and its words (`MDAIMarkers360.key`), so a verdict given on a laptop lands on the same pin in a headset.
- **A room or reading approval** writes a row to `approval_history` from a database trigger, whichever client made the change. Reopening adds a row; the confirmation before it stays. Approvals that existed before the table were backfilled from the audit trail; a confirmed room with no recorded moment gets no row rather than an invented one.
- **Both tables refuse UPDATE, DELETE and TRUNCATE** for every role, including the service role. A withdrawn cost keeps `superseded_at`.

The Studio's day picker (`studio/asof360.js`) rebuilds any earlier day from those rows, read-only:

- a capture counts from the day it was **shot** (`captured_at`); the upload day is shown beside it when later;
- readings, verdicts, approvals and costs count from the day they were **recorded**;
- when nothing happened for a while, the last state stands until the next file or decision;
- each room says how old its newest capture was on the chosen day, or that nothing had been captured yet.

Room markers live in the evidence Studio (`/studio/?evidence=1`, the "Project evidence" link). The project analysis app opens 360 clips at a moment but establishes no bearing, so it draws no markers by design.

## Apple Vision Pro contract

The web Studio exports a platform-neutral manifest. A separate native visionOS application will:

- authenticate the user;
- request an authorized manifest version;
- resolve signed media and spatial-asset URLs;
- render the property/space graph;
- place approved annotations and evidence panels;
- allow review notes and return them to Studio;
- work from a downloaded release snapshot when offline use is authorized.

The web prototype does not generate an installable visionOS application, a USDZ model, or a real digital twin. Those require a capture pipeline and a native RealityKit/SwiftUI client.

## Delivery phases

### Phase 1 — operational web slice

Auth, private storage, property/space/evidence records, human review, audit log, and draft Vision manifest.

### Phase 2 — AI evidence worker

Versioned analysis profiles, structured output validation, job retries, cost controls, suggestion review, and provenance.

### Phase 3 — spatial capture

360 ingestion, photogrammetry or room-plan pipeline where supported, spatial anchors, and derived-asset versioning.

### Phase 4 — visionOS pilot

Native client, authenticated package sync, room navigation, evidence overlays, review capture, and one-property field test.

Status: the native client exists in [`visionos/`](../visionos/README.md). Done in code and compiled in CI: authentication, approved-package sync, room navigation, 360° immersive viewing with anchored observation overlays. Not done: review capture (no server door accepts a note from the headset yet), offline packages, and the one-property field test, which has not been run. Until that test is run, nothing about the client is presented as working on a device.

## Definition of a real pilot

One property is a successful pilot when ten named spaces can be opened in Studio, each source can be traced to its original, AI suggestions can be reviewed individually, a release can be approved by a named person, and the same approved release can be navigated in Vision Pro without exposing private media publicly.
