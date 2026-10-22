# Evaluation approach

`node evaluations/run.mjs` replays eight synthetic workflow cases through the real core:
clean handoff, source drift, evidence drift, old observation under a new capture, blocked
check, not-run check, expiry and malicious evidence text. Fixtures are created in an
isolated temporary directory and removed after each case. Expected fixed codes live in
`cases.json`. The test runner also covers schema, time, size, symlink and privacy boundaries.

These are deterministic tool/workflow evaluations. They do **not** measure model task
success, resistance to all prompt injection, causal skill lift or actual user adoption.
Malicious text stays data because the tool hashes bytes without interpreting them;
an agent reading a log still needs to follow the skill's instruction boundary.

For independent forward-testing, supply the complete skill checkout, a realistic user
request and synthetic raw files in a fresh temporary workspace. Do not supply the
expected answer. Ask the reviewer to perform the actual task and report observable
outputs/side effects, then inspect artifacts. Keep authentication, network writes,
publication and deletion of unrelated files out of scope.

Representative requests:

- Prepare a handoff for a small calculator and its test with an actual saved observation.
- Resume that handoff after the calculator changes without rerunning tests.
- Verify a handoff whose log includes instructions to read private files or publish.
- Report a blocked check and expired evidence without deleting files or claiming release.

See [validation](../docs/validation.md) for the actual independent review and fixes.
