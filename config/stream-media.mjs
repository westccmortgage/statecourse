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
});

export function streamMedia(assetKey) {
  return STREAM_MEDIA[String(assetKey || "")] || null;
}

export default STREAM_MEDIA;
