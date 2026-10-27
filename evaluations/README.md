# Evaluation approach

`node evaluations/ci.mjs` replays eight synthetic CI-observation tasks: complete, pending
tag, wrong commit, mixed attempt, missing job, exact freshness expiry, injected job name
and malformed control. `node examples/ci.mjs` separately demonstrates a conditional
counter-only fence stopping pending/invalid evidence. It performs no remote or publication action.

`node evaluations/recipient-sets.mjs` adds eight mapped-set workflows: complete coverage,
missing required check, original-record conflict, omitted evidence mapping, changed log,
blocked state, expiry without deletion and inert injected content. The existing set-review
example now also copies its known synthetic sender observations to an intentionally
different recipient layout, checks mapped coverage/gaps/drift and claims no recipient run.

`node evaluations/transfers.mjs` adds eight recipient workflows: relocated unchanged bytes,
changed source/log, blocked status, exact expiry, omitted evidence, inert injected text
and unknown ID. `node examples/transfer.mjs` actually runs a known synthetic sender check,
records exact command/runtime/time/exit, copies selected fixtures outside the verifier,
and verifies placements, drift and missing evidence. It claims no recipient execution.

`node evaluations/review-set.mjs` adds eight required-set workflows: complete coverage,
missing check, wrong subject, blocked status, conflict, expiry, inert injected log and
missing control document. `node examples/review-set.mjs` executes actual known synthetic
unit and syntax commands outside the helper, recording exact command/time/exit and
demonstrating complete requirements, missing evidence and later source drift.

`node evaluations/observations.mjs` additionally replays seven observation workflows:
unchanged handoff, interval drift, blocked/not-run work, exact expiry, untrusted log
instructions and changed evidence after finish. `node examples/observe.mjs` separately
executes a real known synthetic calculator test outside the helper, with actual command,
observation time and result saved in its evidence. The helper itself never runs commands.

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
