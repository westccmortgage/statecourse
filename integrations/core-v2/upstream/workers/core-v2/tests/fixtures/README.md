# fixtures

## markevita-runtime-facts.json

Incident facts a real MARKEVITA episode produced, not a shape typed by hand.
`markevita-adapter.mjs` reads them so that a field either repository renames is
caught by a test instead of at three in the morning.

Four states of one fixture episode:

| key | what it is |
| --- | --- |
| `qa_before` | a master assembled and never measured |
| `qa_after` | the same episode after the quality pass really ran |
| `valid_silence` | a silent master of an episode that asked for no sound |
| `unknown_paid_outcome` | a paid submission whose outcome nobody has read |

Produced in the markevita repository from the episode fixture in
`pipeline/tests/test_completion_adapter.py`, through the runtime adapter in
`pipeline/serial/completion.py`. A single episode directory can be dumped
straight from disk with `pipeline/tools/dump_incident_facts.py`, which runs no
stage and contacts no provider.

The digests differ every time the fixture is rebuilt, and nothing in the suite
depends on their value — only on whether they moved.
