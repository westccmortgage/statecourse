import { STREAM_MEDIA, streamMedia as resolveStreamMedia } from "../config/stream-media.mjs";

export type StreamMediaDefinition = Readonly<{
  assetKey: string;
  courseId: string;
  deliveryId: string;
  screenId: string;
  label: string;
  durationSeconds: number;
  transcriptFile: string;
}>;

export { STREAM_MEDIA };

export function streamMedia(assetKey: string): StreamMediaDefinition | null {
  return resolveStreamMedia(assetKey) as StreamMediaDefinition | null;
}
