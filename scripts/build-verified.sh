#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ "${SITES_ENV_READY:-}" != "1" ]]; then
  exec "${script_dir}/sites-env.sh" -- "$0" "$@"
fi

command -v timeout || {
  echo "build-verified.sh requires GNU timeout." >&2
  exit 69
}

vinext="${SITES_PROJECT_ROOT}/node_modules/.bin/vinext"
if [[ ! -x "${vinext}" ]]; then
  echo "vinext is unavailable. Run npm run install:ci and wait for it to finish before building." >&2
  exit 69
fi

echo "Running bounded vinext build..."
node "${SITES_PROJECT_ROOT}/scripts/generate-national-platform.mjs"
node "${script_dir}/sync-california-pdf-downloads.mjs"
node "${script_dir}/export-california-source-temp.mjs"
timeout \
  --signal=TERM \
  --kill-after="${SITES_BUILD_KILL_AFTER:-10s}" \
  "${SITES_BUILD_TIMEOUT:-3m}" \
  "${vinext}" build

# The production introduction video is delivered from the StateCourse CDN.
# Sites keeps the lightweight poster, captions, transcript, and player without
# duplicating the 31 MB media object in its 25 MB-per-file artifact.
rm -f \
  "${SITES_PROJECT_ROOT}/dist/media/statecourse-intro.mp4" \
  "${SITES_PROJECT_ROOT}/dist/client/statecourse/media/statecourse-intro.mp4"

oversize_file="$(find "${SITES_PROJECT_ROOT}/dist" -type f -size +25M -print -quit)"
if [[ -n "${oversize_file}" ]]; then
  echo "Sites artifact contains a file larger than 25 MiB: ${oversize_file}" >&2
  exit 66
fi

"${script_dir}/validate-artifact.sh"
