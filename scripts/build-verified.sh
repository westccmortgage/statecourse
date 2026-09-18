#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ "${SITES_ENV_READY:-}" != "1" ]]; then
  exec "${script_dir}/sites-env.sh" -- "$0" "$@"
fi

vinext="${SITES_PROJECT_ROOT}/node_modules/.bin/vinext"
if [[ ! -x "${vinext}" ]]; then
  echo "vinext is unavailable. Run npm run install:ci and wait for it to finish before building." >&2
  exit 69
fi

echo "Running verified vinext build..."
node "${SITES_PROJECT_ROOT}/scripts/generate-national-platform.mjs"
# REMOVED 2026-08-20. This line ran export-california-source-temp.mjs, which copied the
# entire california/ tree - including all six final-exam answer keys - into
# public/__statecourse_private_export_8f3c1a7d/california-source.json, i.e. straight onto
# the live site. RE 303: "Under no circumstances shall the final exam be furnished directly
# to the students." Publishing the keys would have invalidated every examination.
# The script is retained for the GitHub-artifact route only and must never be wired into a
# build again; tests/no-answer-key-published.test.mjs now fails the suite if it is.
if command -v timeout >/dev/null 2>&1; then
  timeout \
    --signal=TERM \
    --kill-after="${SITES_BUILD_KILL_AFTER:-10s}" \
    "${SITES_BUILD_TIMEOUT:-3m}" \
    "${vinext}" build
else
  "${vinext}" build
fi

# Oversize production videos are delivered from the StateCourse CDN. Sites keeps
# their lightweight posters, captions, transcripts, and players without duplicating
# media objects that exceed its 25 MiB per-file artifact limit.
#
# Only the marketing intro is listed. The California course videos used to be here too; they
# now go out over signed Cloudflare Stream, so they never enter the public tree and there is
# nothing to strip. A course video reappearing in this list would mean it had been republished.
rm -f \
  "${SITES_PROJECT_ROOT}/dist/media/statecourse-intro.mp4" \
  "${SITES_PROJECT_ROOT}/dist/client/statecourse/media/statecourse-intro.mp4"

oversize_file="$(find "${SITES_PROJECT_ROOT}/dist" -type f -size +25M -print -quit)"
if [[ -n "${oversize_file}" ]]; then
  echo "Sites artifact contains a file larger than 25 MiB: ${oversize_file}" >&2
  exit 66
fi

"${script_dir}/validate-artifact.sh"
