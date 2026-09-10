# Cloudflare Stream production delivery

StateCourse course videos use Cloudflare Stream as private, authenticated course assets. The
browser never receives a permanent downloadable MP4 URL or chooses a Stream UID.

## Required order

1. Activate the Cloudflare Images & Stream plan on the StateCourse Cloudflare account.
2. Upload the reviewed final MP4 and wait until Stream reports it ready.
3. Upload the reviewed English WebVTT caption file.
4. Set the video's allowed origins to `statecourse.com` and `www.statecourse.com`.
5. Require signed URLs for the video.
6. Create a Stream signing key. Store the key id and private JWK only in the Netlify production
   environment; never commit them.
7. Add the Stream UID to `CLOUDFLARE_STREAM_VIDEO_MAP`, keyed by the stable asset key in
   `config/stream-media.mjs`. A video released through the administration console skips this
   step and steps 2 to 5 and 9 with it — see
   [Administration console](../admin/administration-console.md). This order remains the record
   for the two reviewed Texas videos, which still resolve from the code registry and the
   environment map.
8. Apply `database/018_cloudflare_stream_delivery.sql`.
9. Switch the reviewed course media entry from native delivery to `cloudflare-stream`, regenerate
   its block map, run all validations, deploy, and verify with a real authorized review account.
10. Remove the shipped MP4, VTT and poster from the public site only after the protected player has
    passed production verification.

## Runtime secrets

- `CLOUDFLARE_STREAM_CUSTOMER_CODE`
- `CLOUDFLARE_STREAM_KEY_ID`
- `CLOUDFLARE_STREAM_SIGNING_JWK`
- `CLOUDFLARE_STREAM_VIDEO_MAP`

The private JWK and Supabase service-role key are function-only secrets. Production requests use
the existing HttpOnly StateCourse session cookies. The playback endpoint checks the authenticated
user, enrollment, active access grant or regulator-review grant, course binding and server-owned
asset allowlist before minting a one-hour signed playback URL.

## Evidence and credit boundary

`video_token_issues` records each successful authorization. `video_playback_events` records
append-only player events, including a 15-second heartbeat, position, duration and playback rate.
The unique client sequence prevents retry duplication.

Both evidence tables have Row Level Security enabled and explicitly revoke browser-role access.
Only the server-side service credential may write after the enrollment or reviewer grant is checked.

These records do not award regulatory credit and do not gate navigation. If a state later requires
video attendance, that state needs a separate, rule-specific server derivation; browser claims must
never set completion directly.

## Accessibility and failure behavior

Captions live with the Stream asset and are selectable in the Cloudflare player. A plain-text
equivalent is served from `/api/stream/transcript` only after the same enrollment authorization.
The player never autoplays. If Stream, authentication or evidence storage is unavailable, the page
shows a clear error and leaves course progression unchanged because these Texas videos are
supplementary.

## Rotation and incident response

If the private signing JWK is exposed, revoke its Stream signing key, create a new key, update both
Netlify variables, and redeploy. If a video is replaced, upload a new Stream object and update only
the server-side UID map; keep the stable StateCourse asset key when the instructional identity is
unchanged. Never reuse a Stream UID for unrelated course material.
