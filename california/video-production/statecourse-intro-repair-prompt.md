# Repair prompt — StateCourse intro video ("digital textbook" line)

Source video: `public/statecourse/media/statecourse-intro.mp4` (87.34s, same avatar/voice/branded
set as the Loan Estimate document-overview series). Caption file:
`public/statecourse/media/statecourse-intro.vtt`.

## The problem

At 0:54.689–0:58.374 the narration says the course is "a serious digital textbook." That was
never accurate once the block-based learning model shipped (learning-objective screens, worked
practice problems, retrieval checks, applied assignments, mastery checks — not a text you read
page by page), and it undersells what the platform actually does. Everything else in that
sentence — "clear explanations, real-world transactions, state-specific law, practical examples,
knowledge checks, and human instructor support" — is still true and needs no change.

Do not touch the caption file until the new audio exists: captions must always match the actual
spoken narration, so `statecourse-intro.vtt` gets updated from the corrected script only after
the repaired render lands, using the same trim discipline as the Page 2 video (captions must
match the final render's real timing, not a draft script).

## Repair prompt (send to HeyGen against the existing project)

```
REPAIR THE EXISTING VIDEO.
DO NOT START A NEW CREATIVE CONCEPT.
DO NOT CHANGE THE AVATAR, VOICE, SET, BRANDING, PACING, OR ANY OTHER SENTENCE.

Project: StateCourse intro video ("Real Estate Licensing, State by State")

ABOUT 0:54–0:58, replace only this sentence:

OLD: "You learn through a serious digital textbook built around clear explanations,
real-world transactions, state-specific law, practical examples, knowledge checks,
and human instructor support when you need it."

NEW: "You learn through a focused, block-based course built around clear explanations,
real-world transactions, state-specific law, practical examples, knowledge checks,
and human instructor support when you need it."

Only the four words "a serious digital textbook" change, to "a focused, block-based course."
Every other word in the sentence, and every other sentence in the video, stays exactly as
rendered. Keep the same delivery, tone, and pacing as the surrounding narration. The replacement
phrase is shorter than the original — do not stretch or pad it; let the avatar's natural pacing
absorb the difference.

Re-render only the affected segment if the platform supports a partial re-render; otherwise
re-render the full video with this single sentence corrected and nothing else changed.
```

## After the repaired render arrives

1. Download, spot-check the corrected sentence plays back correctly and nothing else drifted.
2. Regenerate `statecourse-intro.vtt` for cues covering that sentence from the actual rendered
   audio (do not hand-edit timings from the script — confirm against the render, the way the
   Page 2 captions were trimmed to the actual final length rather than a draft).
3. Replace `public/statecourse/media/statecourse-intro.mp4` and the `.vtt`, run the test suite
   and `site/build.sh`, commit, push, verify the live deploy.
