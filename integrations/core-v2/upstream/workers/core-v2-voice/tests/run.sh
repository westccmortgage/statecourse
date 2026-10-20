#!/usr/bin/env bash
set -euo pipefail
test_dir="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
node --experimental-strip-types --no-warnings --test "$@" "$test_dir"/*.test.mjs
