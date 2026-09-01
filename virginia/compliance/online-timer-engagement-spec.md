# Online Course Timer and Active-Engagement Specification

**Regulatory basis:** 18VAC135-20-10 defines a class/clock hour as 50 minutes of instruction. 18VAC135-20-362(A) requires a mechanism reasonably ensuring active engagement for each class hour. A490-0214PRE requires timer evidence for online/distance learning.

## Time model

- 60 numbered hours.
- Each hour requires at least 3,000 seconds of verified active instructional time.
- Course total requires at least 180,000 seconds.
- Time is calculated server-side from validated event intervals, not from a client-displayed clock alone.
- Final-exam time does not enter instructional-time totals.
- Time from overlapping/concurrent sessions is never double-counted.

## Active interval requirements

An interval may count only when:

1. The authenticated course session is current.
2. The required content is in the foreground.
3. The learner has not crossed the idle threshold.
4. The content event sequence is valid.
5. Media, if used, is playing at an approved speed and visible/audible as designed.
6. No concurrent counted session exists.
7. The server receives and validates heartbeats and interactions.

## Pause triggers

- Browser tab/app loses foreground visibility.
- Idle threshold of five minutes is reached.
- Network heartbeat is lost beyond the grace period.
- Session authentication expires.
- Required interaction remains unanswered.
- Media is skipped, accelerated beyond policy, or jumps ahead.
- Concurrent session is detected.
- Administrator/proctor pauses the session.

The learner receives a clear pause notice and must re-engage or re-authenticate. Paused time is excluded.

## Engagement gates

Every hour includes:

- at least two meaningful interactions;
- one scored application check;
- a changed-fact retry after a missed check;
- sequential content gating;
- no completion until both 3,000 active seconds and the mastery gate pass.

Meaningful interactions may include source navigation, calculation entry, document annotation, ordered sequence, classification, scenario decision, or written explanation. Decorative clicks do not count.

## Minimum event log

- Student and enrollment identifiers
- Course, version, hour, content block
- Session/device identifiers
- Server timestamp and monotonic sequence
- Start, heartbeat, foreground/background, idle, pause, resume, interaction, answer, retry, and completion events
- Media position and speed where applicable
- Counted and excluded seconds with reason
- IP/device risk signal consistent with privacy policy
- Administrator overrides with reason and approver
- Final accumulated hour/course time
- Record checksum/version

## Completion algorithm

An hour completes only if:

- validated active seconds ≥ 3,000;
- required blocks are complete;
- required interactions are valid;
- engagement check/remediation gate is satisfied;
- no unresolved integrity exception exists.

Course completion requires all 60 hour-completion records. Manual credit requires documented evidence, reason, certified approval, and immutable audit history.

## Attachment 7 evidence set

1. Architecture description and timer logic.
2. Screenshots of running, paused, idle, retry, and completed states.
3. Sample student event log for one complete hour.
4. Calculation showing counted versus excluded time.
5. Concurrent-session and background-tab tests.
6. Media skip/speed tests.
7. Network interruption and resume test.
8. Administrator override audit.
9. Sample 60-hour aggregate record.
10. Release/version and test sign-off.

## Acceptance tests

- 49:59 active time cannot complete an hour.
- Ten minutes backgrounded adds zero counted time.
- Five idle minutes pause the clock.
- Two simultaneous sessions never produce more than real elapsed active time.
- Refresh/relogin resumes from server total without adding time.
- Skipped media does not grant block completion.
- Missed check cannot complete until alternate remediation passes.
- Course completion cannot issue before 180,000 validated seconds.
