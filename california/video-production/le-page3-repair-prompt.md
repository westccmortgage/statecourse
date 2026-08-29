# Repair prompt — Loan Estimate Page 3

Source render (do not overwrite locally — this describes the fix to send to HeyGen):
"StateCourse_ Loan Estimate — Page 3_1080p.mp4" in the Drive video folder, 133s.

## What's actually broken

Frame-by-frame QC found the full page renders perfectly clean every time it's shown untouched
(0:00–0:33, and the avatar's closing "Key Comparison Metrics" card, both fine — leave them
alone). Every failure is in the camera's zoom/crop behavior across Scenes 3–7:

- **Scene 3 (In 5 Years) is missing outright.** At 0:33.5 the video cuts to a blank navy frame
  for about a second, then jumps straight into a crop that's already showing APR and TIP —
  there is no dedicated close-up on the In 5 Years row at all.
- **Scenes 4–5 (APR, TIP) are cropped off the left edge**, roughly 0:35–1:07. The crop is shifted
  right far enough that column labels are cut mid-word — "te (APR)", "ge (TIP)", "ons" instead of
  "Other Considerations" — for the entire span.
- **Scene 7 (Confirm Receipt) is badly broken**, around 1:27–1:39. The background turns flat grey
  instead of the document's white page, the "Confirm Receipt" section heading never appears (the
  view starts mid-sentence in the paragraph beneath it), and the signature line is spaced with
  large, uneven gaps that don't match the printed form at all.

This is the same failure pattern already hit twice on the Page 2 video: HeyGen's camera
zooming into sub-regions of the uploaded document is not reliable, even though the full,
untouched page renders correctly every single time. The fix that actually worked there was to
stop asking for camera zooms on document scenes entirely and do the framing in post-production
instead. Same approach here.

## Repair prompt (send to HeyGen against the existing project)

```
REPAIR THE EXISTING VIDEO.
DO NOT START A NEW CREATIVE CONCEPT.
DO NOT CHANGE THE NARRATION, THE SCRIPT, THE AVATAR SCENES, OR THE SCENE ORDER.

Project: "Loan Estimate — Page 3"

Keep Scene 1 (avatar introduction), Scene 2 (full document orientation), and Scene 8 (avatar
judgment point and close, including the "Key Comparison Metrics" card) exactly as rendered —
they are correct.

Scenes 3 through 7 — In 5 Years, APR, TIP, Other Considerations, and Confirm Receipt — must be
replaced with ONE CONTINUOUS STATIC SHOT of the complete, full Page 3 document, held without
any camera movement, zoom, pan, or crop for the entire duration of these five scenes. Do not
cut to a blank frame between them. Do not zoom into any row, section, or column at any point
during this span. The full page must remain visible, complete, and undistorted — matching
exactly how it already renders correctly during Scene 2 — from the start of the In 5 Years
narration through the end of the Confirm Receipt narration.

Do not draw any highlight box, outline, or margin label on the document during Scenes 3–7.
Highlights will be added downstream in post-production, the same way they were added to the
Page 2 video after its camera-zoom attempts also failed.

The narration audio for Scenes 3–7 does not change:

"First, In 5 Years. The first figure shows the total paid in principal, interest, mortgage
insurance, and loan costs after five years. The second shows how much principal has been paid
off. Together, they show the difference between total spending and principal reduction.

Next is the Annual Percentage Rate, or APR. APR is not the note rate. It expresses the cost of
credit, including interest and certain loan costs, as a yearly rate. Two loans with the same
note rate may have different APRs.

Below it is the Total Interest Percentage, or TIP. TIP shows the total interest paid over the
full loan term as a percentage of the amount borrowed.

Other Considerations covers practical terms, including appraisal, assumption, late-payment
charges, and servicing. Always check the Late Payment line and whether the lender intends to
service the loan or transfer servicing.

Finally, Confirm Receipt. The sentence above the signature explains that signing only confirms
receipt of the form. Signing this line does not mean the borrower accepts the loan. In fact,
the borrower is not required to sign the Loan Estimate."

QUALITY CONTROL BEFORE RENDERING

Verify internally: from the start of "First, In 5 Years" to the end of "...not required to sign
the Loan Estimate," the frame must never change composition — same crop, same zoom level, same
position, full page fully visible and undistorted, on every single frame. No blank frame, no
partial crop, no color/background change anywhere in this span. If the camera moves or the
composition changes even once during Scenes 3–7, reject and re-render before delivering.
```

## After the repaired render arrives

Same pipeline as the Page 2 video:
1. Download, spot-check the full-page hold is genuinely static across Scenes 3–7 (no drift, no
   stray crop).
2. Measure pixel coordinates for five highlight targets directly on that static frame: In 5
   Years row, APR row, TIP row, Other Considerations section (with Late Payment / Servicing
   called out in sequence), and the Confirm Receipt paragraph + signature line.
3. Time each highlight to the narration cues above, run `post-highlights.py` with a scene config
   the same way `le-page2-highlights.json` was built.
4. Re-encode to the series bitrate profile, build captions from the actual final render length
   (not the draft script), generate a poster, attach as a video on the LE Page 3 screen, test,
   deploy.
