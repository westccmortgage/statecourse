#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../../.."
node integrations/core-v2/scripts/verify-upstream.mjs
node --experimental-strip-types --no-warnings --test integrations/core-v2/statecourse/tests/*.test.mjs
# These upstream suites are self-contained and seal outbound access themselves.
for suite in registry expansion blindness routing-outcomes independence acceptance evidence-scope recovery follow-up budgets studio-configuration transcripts ceo-admin runtime-incident completion video-episode markevita-adapter nothing-real network-guard cli-entry; do
  node --experimental-strip-types --no-warnings "integrations/core-v2/upstream/workers/core-v2/tests/$suite.mjs"
done
