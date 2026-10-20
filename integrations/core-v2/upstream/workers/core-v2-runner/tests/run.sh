#!/usr/bin/env bash
# Every proof Production Runner V1 has, in one command.
#
# Two of the three suites boot a throwaway PostgreSQL cluster with every
# migration applied, because what makes the runner safe is SQL — a fake store
# would prove only that the fake agrees with itself. The third opens nothing
# at all and seals the network to say so.
#
# No provider is named, reached or configured by any of them, and nothing here
# can spend: the only socket is the unix socket to the throwaway cluster.
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

fail=0
run() {
  printf "\n\033[1m%s\033[0m\n" "── $1"
  if node --experimental-strip-types --no-warnings "$2" > /tmp/core-v2-runner-test.out 2>&1; then
    grep -E "ALL OK|FAILURE" /tmp/core-v2-runner-test.out | tail -n 1 | sed 's/^/  /'
  else
    fail=1
    cat /tmp/core-v2-runner-test.out | sed 's/^/  /'
  fi
}

run "one start, and then nobody"                                       continuation.mjs
run "original Studio source evidence binds WorkOrder completion"          source-work-order.mjs
run "shared factory recovery uses durable fences and fresh evidence"     shared-recovery.mjs
run "a human hold stops new work"                                        human-hold.mjs
run "what a dead process leaves, and what the next one may do about it" resilience.mjs
run "the lines the runner may not cross"                               boundaries.mjs
run "the handlers a person and a watchdog actually call"               handlers.mjs
# Real files, a real browser and a real cluster. It needs Chromium, which this
# repository does not vendor; see studio/tests/analysis-browser.mjs.
run "an owner's own files, all the way through"                        analysis.mjs
run "two things, compared"                                             comparison.mjs
run "the door the Admin's records come through"                         ceo-admin-submission.mjs
run "the door's proof of caller"                                        ceo-admin-signature.mjs
run "action proposals use the source version that was read"              result-source.mjs
run "the whole CEO Admin chain, against the real migrations"           ceo-admin-integration.mjs
run "the CEO Admin world's authority and first-pass material policy"   ceo-admin-world-policy.mjs
run "the world the runner builds, its authority and its refusals"       ceo-admin-world.mjs

printf "\n\033[1m%s\033[0m\n" "── the three doors, type-checked against what they import"
if bash ./typecheck-doors.sh; then :; else fail=1; fi

echo
echo "────────────────────────────────────────────"
if [ "$fail" = "1" ]; then echo "SOMETHING FAILED — see above"; exit 1; fi
echo "ALL CHECKS PASS"
