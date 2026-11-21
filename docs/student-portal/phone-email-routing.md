# StateCourse phone → school email

Owner request (2026-11-21): send school assistant call information to
**info@statecourse.com**, not the shared CRM.

## Route

ElevenLabs school agent → signed `POST https://statecourse.com/api/phone/post-call`
→ private Netlify Forms submission `statecourse-phone-calls`
→ Netlify email notification to `info@statecourse.com`.

The notification contains the summary, extracted contact/message details, caller
number when available, time/duration, transcript and authenticated ElevenLabs
conversation link. No audio attachment, tool payload, dynamic variable, password
or service credential is forwarded. Netlify stores submissions in its protected
Forms dashboard; this is not a CRM or a regulatory student record.

## Settings and rollback

- Baseline: Netlify form detection disabled, no forms or submission notifications.
  It is now enabled. The `info@statecourse.com` recipient was confirmed using the
  specific confirmation email in the connected school's inbox. The detected form is
  `statecourse-phone-calls`; the notification is scoped to this form only.
- Prior per-agent post-call webhook: disabled school profile
  `97b2ce047f7e4d4a8b50bc3c67c5345e`. It must remain disabled.
- New school-only webhook: `f19eeca2e9164a75ae03add71ee980d8`, label
  `StateCourse — email info@statecourse.com`, target `/api/phone/post-call`.
  Only transcript events are enabled; retries are enabled. Other
  agents and the shared workspace default remain unchanged.
- New environment variable: `STATECOURSE_ELEVENLABS_WEBHOOK_SECRET`. Original:
  unset. Created as secret, Functions scope, Production context only. New value
  SHA-256: `88d195997174c07d1adcec497d0bf40b1b2a9ce65f301070fcf3adaefa4813ba`.
  No existing credential was replaced. No secret value belongs in this file.
- Rollback: pin this agent back to the prior disabled school profile and publish
  that change. This stops forwarding, retains call history, and requires no
  deletion of messages, credentials, numbers or shared integrations. Restore form
  detection to disabled only if no other school form has since been added.

## Verification and limits

- Local build and 14 targeted tests pass, including eight signed-webhook tests;
  five public-build privacy checks also pass. Tests cover signature tampering,
  stale/future signatures, other agents/numbers, outbound calls, oversized and
  malformed bodies, retryable submission errors and sequential duplicate events.
- The runtime accepts only this agent; a phone event must also name the school's
  inbound number. Same-agent web preview messages can exercise the full delivery
  path. Destination fields supplied by callers cannot change the email recipient.
- Delivery receipts cache IDs/timestamps only. Sequential retries are suppressed;
  concurrent deliveries or a network failure after acceptance can still produce
  duplicate mail. Forms spam filtering can hold a legitimate message; verify
  submissions/inbox before claiming delivery.
- Production deploy `6b01e7661d286bc840f71769` (commit `6faa684eee427f09fcc470e8fe652d389c77656b`) registered form `6b01e7996a70e9555d0d96bd`.
- QA conversation `conv_2101m7zq6qccf2w9xf03nyebp6bz` ended at 10:51 Pacific. Delivery `48c8ba42bd904ad2bbab66b623c0440f` returned HTTP 200 at 10:52:04, one attempt, 1.30 seconds. Forms accepted one submission. Actual message `1a1ff73950d25e3b`, subject `StateCourse — phone assistant message`, arrived in the school INBOX at 10:52:06 Pacific, addressed to `info@statecourse.com`; transcript, summary, conversation ID and protected link matched. This was a web preview delivery check, not a new telephone call.
- The first email contained the summary and full transcript but omitted the separate extracted-message field. Compatibility now accepts the configured analysis-item ID and the documented result-list shape as well as the older named field; targeted regression coverage was added. A fresh runtime check will verify the extraction after deploy.
- No SQL, student Auth, course approval, payment or BioSig control is changed.

Security review rejected broad environment-variable retrieval before any values
were returned. This route uses native Forms notifications and one newly created
webhook signing value instead of retrieving existing mail credentials.
