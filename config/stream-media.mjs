/**
 * Server-owned allowlist for private course video delivery.
 *
 * The browser sends only a stable asset key. The Stream UID remains an environment mapping, and
 * this registry binds each asset to the one course, delivery unit and screen allowed to request it.
 */
export const STREAM_MEDIA = Object.freeze({
  "tx-iabs-1-2-document-overview": Object.freeze({
    assetKey: "tx-iabs-1-2-document-overview",
    courseId: "tx-law-of-agency-30-v1",
    deliveryId: "module-02",
    screenId: "t02u5-s1",
    label: "Information About Brokerage Services — IABS 1-2 document overview",
    durationSeconds: 195,
    transcriptFile: "private-media/texas/tx-iabs-1-2-document-overview.txt",
  }),
  "tx-intermediary-brokerage": Object.freeze({
    assetKey: "tx-intermediary-brokerage",
    courseId: "tx-law-of-agency-30-v1",
    deliveryId: "module-06",
    screenId: "t06u3-s1",
    label: "Texas Intermediary Brokerage",
    durationSeconds: 194,
    transcriptFile: "private-media/texas/tx-intermediary-brokerage.txt",
  }),
  /*
   * California mortgage document overviews.
   *
   * These four shipped as public MP4s under /media/, which published the narration — the whole
   * text of a lesson — to anyone with the URL, while the Texas videos of the same kind were
   * delivered privately. One course cannot protect its instruction while another gives the same
   * thing away; these now take the same signed path. Their Stream UIDs come from the environment
   * mapping like every other asset, so until the uploads exist the screens simply carry no video.
   */
  "ca-promissory-note-overview": Object.freeze({
    assetKey: "ca-promissory-note-overview",
    courseId: "ca-mortgage-loan-brokering-lending-45",
    deliveryId: "assignment-02",
    screenId: "a2-b3-s1",
    label: "The Promissory Note (document overview)",
    durationSeconds: 147,
    transcriptFile: "private-media/california/ca-promissory-note-overview.txt",
  }),
  "ca-loan-estimate-page-1": Object.freeze({
    assetKey: "ca-loan-estimate-page-1",
    courseId: "ca-mortgage-loan-brokering-lending-45",
    deliveryId: "assignment-09",
    screenId: "a9-b1-s2",
    label: "Loan Estimate — Page 1 (document overview)",
    durationSeconds: 119,
    transcriptFile: "private-media/california/ca-loan-estimate-page-1.txt",
  }),
  "ca-loan-estimate-page-2": Object.freeze({
    assetKey: "ca-loan-estimate-page-2",
    courseId: "ca-mortgage-loan-brokering-lending-45",
    deliveryId: "assignment-09",
    screenId: "a9-b1-s2",
    label: "Loan Estimate — Page 2 (closing cost details)",
    durationSeconds: 169,
    transcriptFile: "private-media/california/ca-loan-estimate-page-2.txt",
  }),
  "ca-loan-estimate-page-3": Object.freeze({
    assetKey: "ca-loan-estimate-page-3",
    courseId: "ca-mortgage-loan-brokering-lending-45",
    deliveryId: "assignment-09",
    screenId: "a9-b1-s2",
    label: "Loan Estimate — Page 3 (comparisons and signature)",
    durationSeconds: 133,
    transcriptFile: "private-media/california/ca-loan-estimate-page-3.txt",
  }),
});

export function streamMedia(assetKey) {
  return STREAM_MEDIA[String(assetKey || "")] || null;
}

export default STREAM_MEDIA;
