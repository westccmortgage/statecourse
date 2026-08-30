#!/usr/bin/env bash
# Florida regression baseline — is the Florida branch adding any test failure that main does not
# already have?
#
# WHY THIS EXISTS AS A SCRIPT. Phase 0 v1 answered that question by running `node --test` on both
# sides WITHOUT the documented build, got 33 failures on each, and called it a baseline. It was not
# one: it measured a state neither CI nor a developer is ever in, and the number moved to 19 the
# moment the build was actually run. A baseline nobody can reproduce exactly is a number, not
# evidence. This script is the reproduction.
#
# WHAT IT DOES. Installs once, then builds and tests BOTH the current branch and a clean worktree of
# origin/main, using the repository's own documented sequence, and diffs the two sorted failure
# lists. It exits non-zero only if the branch has a failure main does not.
#
# WHAT IT DOES NOT DO. It does not pretend the platform is green. `npm run build` currently exits 1
# on main — scripts/build-verified.sh calls scripts/sync-california-pdf-downloads.mjs, which has
# never existed in this repository — and 19 tests fail on both sides as a result. That is a
# pre-existing defect recorded in docs/florida/regression-baseline.md, and this script reports it
# rather than working around it.
#
# Usage:  bash scripts/florida-regression-baseline.sh

set -uo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
work="${TMPDIR:-/tmp}/florida-baseline.$$"
base="${work}/main"
mkdir -p "${work}"

branch="$(git -C "${root}" branch --show-current)"
echo "== Florida regression baseline =="
echo "   branch : ${branch}"
echo "   base   : origin/main"
echo

cleanup() {
  git -C "${root}" worktree remove "${base}" --force >/dev/null 2>&1
  git -C "${root}" worktree prune >/dev/null 2>&1
}
trap cleanup EXIT

if [[ ! -x "${root}/node_modules/.bin/vinext" ]]; then
  echo "-- dependencies absent; running the documented install"
  (cd "${root}" && npm run install:ci) || { echo "install failed"; exit 1; }
fi

run_suite() {
  # $1 = checkout dir, $2 = label, $3 = output file for the sorted failure list
  echo "-- ${2}: build"
  (cd "$1" && npm run build) >"${work}/${2}-build.log" 2>&1
  local build_status=$?
  if [[ ${build_status} -ne 0 ]]; then
    echo "   build exited ${build_status} — $(grep -oE "Cannot find module '[^']*'" "${work}/${2}-build.log" | head -1)"
  fi
  echo "-- ${2}: tests"
  (cd "$1" && node --test tests/*.test.mjs) >"${work}/${2}-test.log" 2>&1
  grep -E '^not ok' "${work}/${2}-test.log" | sed 's/^not ok [0-9]* - //' | sort >"$3"
  local totals
  totals="$(grep -E '^# (tests|pass|fail)' "${work}/${2}-test.log" | tr '\n' ' ')"
  echo "   ${totals}"
}

echo "-- creating a clean worktree of origin/main"
git -C "${root}" fetch origin main --quiet
git -C "${root}" worktree add "${base}" origin/main >/dev/null 2>&1 || { echo "could not create worktree"; exit 1; }
ln -s "${root}/node_modules" "${base}/node_modules"

run_suite "${base}" "main" "${work}/main-failures.txt"
run_suite "${root}" "branch" "${work}/branch-failures.txt"

# The SB 1495 traceability test rewrites a tracked California file when no print volume exists.
# That is churn from the incomplete build, not a Florida change, and must never be committed.
git -C "${root}" checkout -- california/submission/02_Real_Estate_Practice/07-sb1495-traceability.md 2>/dev/null

echo
echo "== result =="
echo "   main   : $(wc -l <"${work}/main-failures.txt" | tr -d ' ') failures"
echo "   branch : $(wc -l <"${work}/branch-failures.txt" | tr -d ' ') failures"

introduced="$(comm -13 "${work}/main-failures.txt" "${work}/branch-failures.txt")"
fixed="$(comm -23 "${work}/main-failures.txt" "${work}/branch-failures.txt")"

if [[ -n "${fixed}" ]]; then
  echo
  echo "   no longer failing on the branch:"
  echo "${fixed}" | sed 's/^/     - /'
fi

# Anything tracked and modified that is not Florida-owned is a leak from a build side effect.
leaked="$(git -C "${root}" status --porcelain | grep -vE '^\?\?' \
  | grep -vE '(florida/|config/florida/|docs/florida/|scripts/florida-|tests/florida-)' || true)"
if [[ -n "${leaked}" ]]; then
  echo
  echo "   WARNING — non-Florida tracked files are modified and must not be committed:"
  echo "${leaked}" | sed 's/^/     /'
fi

if [[ -n "${introduced}" ]]; then
  echo
  echo "   REGRESSIONS INTRODUCED BY THIS BRANCH:"
  echo "${introduced}" | sed 's/^/     - /'
  exit 1
fi

echo
echo "   no regression: every branch failure is already present on main."
echo "   NOTE: this does not mean the platform is green. See docs/florida/regression-baseline.md."
exit 0
