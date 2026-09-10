import { dbRequest } from "./db.mjs";

/*
 * Putting a console-released video onto the screen a student actually sees.
 *
 * The gap this closes. Placing a video through the console wrote a database row and
 * changed what the playback endpoint would authorize — but the lesson payload still came
 * from the static block maps in config/, which only a developer can edit. So a placed
 * asset was authorized for playback and appeared nowhere: the claim that a video could be
 * placed without a code change was true of authorization and false of delivery, which is
 * the half a student can see.
 *
 * The overlay is applied at read time and nothing is cached. That is what makes withdrawal
 * work: `console_video_delivery` lists only assets that are placed, release-ready, uploaded
 * and carrying both text equivalents, so a withdrawal or a later failing gate drops the row
 * and the next lesson load simply does not find it.
 */

/** Cloudflare's player and the block maps both speak "M:SS". */
export function displayDuration(seconds) {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

/*
 * The shape a block map would have carried, built from a database row.
 *
 * The three release conditions that are data rather than judgement are set here rather
 * than copied from the row: a console asset is never required, never blocking and never
 * autoplaying, and the schema refuses a placement that says otherwise, so there is no
 * value to read.
 */
export function consoleVideoEntry(row) {
  return Object.freeze({
    provider: "cloudflare-stream",
    assetKey: row.asset_key,
    captionLanguage: row.captions_language || "en",
    label: row.label,
    duration: displayDuration(row.duration_seconds),
    required: false,
    nonBlocking: true,
    autoplay: false,
    controls: true,
    keyboardAccessible: true,
    captionsSelectable: true,
    source: "admin_console",
  });
}

/*
 * Rows eligible for one delivery unit, keyed by screen.
 *
 * A failure here returns an empty map rather than throwing. A student in the middle of a
 * lesson must not lose the whole payload because the console's view is briefly
 * unavailable; the worst acceptable outcome is that a console-placed video is missing from
 * that one load, which is the same thing withdrawal does deliberately.
 */
export async function consoleVideosForDelivery(courseId, deliveryId) {
  if (!courseId || !deliveryId) return new Map();
  try {
    const rows = await dbRequest(
      `console_video_delivery?course_id=eq.${encodeURIComponent(courseId)}`
        + `&delivery_id=eq.${encodeURIComponent(deliveryId)}`
        + "&select=asset_key,course_id,delivery_id,screen_id,label,duration_seconds,captions_language",
    );
    const byScreen = new Map();
    for (const row of rows || []) {
      if (row?.screen_id) byScreen.set(row.screen_id, consoleVideoEntry(row));
    }
    return byScreen;
  } catch (error) {
    console.error("Console video overlay unavailable; serving block-map media", courseId, deliveryId, error?.message);
    return new Map();
  }
}

/*
 * Merge the overlay into an already-built payload.
 *
 * A console entry replaces whatever the block map put on that screen rather than appending
 * to it. Two videos on one instruction screen is not a state anyone chose, and reserving
 * an occupied screen already requires naming what is being displaced — so by the time a
 * row reaches here, the replacement is a decision that was recorded.
 *
 * Kept separate from the fetch so it can be tested as a pure function.
 */
export function applyConsoleVideos(blocks, byScreen) {
  if (!byScreen?.size) return blocks;
  return blocks.map((block) => ({
    ...block,
    screens: block.screens.map((screen) => {
      const entry = byScreen.get(screen.id);
      return entry ? { ...screen, videos: [entry] } : screen;
    }),
  }));
}
