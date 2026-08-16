# Distance-education timing, engagement and interaction controls

## Required-time model

- Total course: 3,300 minutes.
- Instruction: exactly 3,000 required minutes, allocated by official topic weight.
- Quizzes/final: 300 required minutes maximum scheduled assessment budget (9.09% of total).
- Case work is embedded in the instructional allocations shown in the outline.

## Server-authoritative timer

Each unit has a minimum instructional budget. Every 30 seconds the client sends a signed heartbeat containing enrollment, unit, session, visibility/focus, recent interaction and monotonic sequence. The server credits only valid intervals. The browser never sends a “minutes complete” total.

Time pauses when the page is backgrounded, the device sleeps, connectivity lapses, the idle threshold is reached, media/content is skipped beyond its gate, or another active session conflicts. Reconnection cannot backfill unverified time. Accessibility-approved alternate interactions produce equivalent events.

## Engagement evidence

Required events include page/section completion, glossary/reference use, practice response, knowledge check and checkpoint. The system varies interaction type to avoid meaningless click cadence. Students see credited/remaining minutes by topic and can challenge discrepancies.

## Interaction

- **Student-content:** linked vocabulary, primary-source references, calculations, branching scenarios, cases, quizzes and remediation.
- **Student-instructor:** “Ask the Instructor,” case feedback, remediation review and scheduled office access. Named channels/SLA pending before filing.
- **Student-system:** progress, timer reason codes, accessibility support and error recovery.

## Timing study

Before filing/launch, representative pilot users complete the course without artificial waiting. Capture active reading, interactions, calculations, cases and assessments by unit. Report median, mean, standard deviation, range, completion blockers, accessibility paths and sample profile. Adjust content—not merely timers—until average instructional completion is consistent with 3,000 minutes. Submit study method/results and retain raw de-identified evidence. **Timing-study results are pending.**

## Audit export

Export includes enrollment, content version, unit, start/end, credited seconds, pause reason, events, device/session pseudonym, assessment windows, corrections and reviewer. Corrections append a signed delta; they never overwrite raw events.

