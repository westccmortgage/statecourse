# Alaska and Texas coach correction — October 19, 2026, Los Angeles

Requested scope: correct the real coach samples that attributed Alaska representation duties to citations not containing them and contradicted Texas broker sponsorship permissions. Authored curricula and source text are unchanged.

Both existing provider adapters now require 1–3 evidence entries, each pairing the exact explanation text with a supplied source ID and a short verbatim excerpt. The server rejects invented/absent quotes, wrong citations, evidence-free answers, and explanation text outside these entries, then returns the existing public response shape. The shared instruction requires preserving conditions/exceptions and forbids adding duties or requirements from memory. Provenance checks do not prove logical entailment; manual source review remains necessary. Refusals use no fabricated sources. Existing model, 800-output-token limit, 15-second timeout, provider keys, $1/day reservation ledger and access controls remain unchanged.

Prepublication validation:66 coach/provider/library/DOM/private-endpoint/SQL tests passed, zero skipped, including real embedded SQL. Lint827 files, zero errors,116 existing warnings; site build/private artifact scan and5 answer-key protection checks passed. Negative regression cases reject unsupported Alaska duty quotations and an ungrounded Texas prohibition. Provider HTTP fixtures were updated to the new internal evidence protocol. This patch is based on main aaf5885, preserving the newer Core integration and documentation.

Real generation and source review on the published release remain to be completed. Reg B semantic finding is separate and remains open. No course approval, assessed answer, grade, completion or regulated launch is changed.
