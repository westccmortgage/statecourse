#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
# Reuse the unchanged upstream's minimal Node declarations.
sed -n '/^cat > "$work\/globals.d.ts"/,/^DTS$/p' "$root/upstream/workers/core-v2-runtime/tests/typecheck.sh" | sed '1d;$d' > "$work/globals.d.ts"
sed -n '/^cat > "$work\/modules.d.ts"/,/^DTS$/p' "$root/upstream/workers/core-v2-runtime/tests/typecheck.sh" | sed '1d;$d' > "$work/modules.d.ts"
tsc --noEmit --target es2022 --module preserve --moduleResolution bundler --strict --allowImportingTsExtensions --skipLibCheck "$root/statecourse/pack.ts" "$work/globals.d.ts" "$work/modules.d.ts"
