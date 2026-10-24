# Validation record

## 0.3.0 required-check set review — 2026-10-25 MYT

Local macOS arm64 / Node.js v24.18.1 source and built-package checks passed:

- 82 tests, 23 deterministic workflows and three examples. The set example actually
  executes fixed synthetic unit/syntax commands outside the helper and records their
  exact command/time/runtime/exit. Syntax selects source; unit tests also select tests.
- Custom syntax/JSON/whitespace/skill-link/manifest lint, distribution build, packaged
  check and `git diff --check`. No TypeScript checker applies to plain JavaScript.
- Both bundled skill-creator and Agent Skills reference validators passed all four
  skills in source and built-package trees (16 checks), using the existing isolated
  PyYAML 6.0.3 / skills-ref 0.1.1 tools. No installation or system-Python change today.
- New set-review module 100% line/branch/function coverage. Core 100% lines/functions,
  98.02% branches; observation/CLI 100%; aggregate branches 99.01%.
- Zero runtime/development/optional project dependencies. Production import review
  found only relative modules and fs/path/crypto built-ins; no network, subprocess or
  dynamic evaluation in the core. No third-party vulnerability scanner result is claimed.

Independent forward testing ran real synthetic unit and newline/whitespace lint commands
with separate observations, reviewed complete/incomplete/blocked/conflicting/injected/
expired/malformed records, and found no blocker. Instrumented independent budget testing
confirmed that five actual 16 MiB artifact reads with declared sizes of one byte each
ingested exactly 64 MiB and refused the fifth; failed/racing reads consumed allowance,
while empty files remained readable at zero. The review emitted no input-derived strings,
did not execute log requests, and did not delete expired evidence. Final independent
disposition and exact remote commit/CI/archive results are recorded in the release report.

These are tool/workflow tests and representative independent skill tasks, not model-level
success/lift, execution authentication, client installation or directory acceptance.
The requested runtime model/reasoning selection remains unexposed and unverified.
Launch drafts are outside the checkout and build tree; staged paths and archive entries
are inspected before the first push. Earlier validation records are preserved below.

## 0.2.0 check observations — 2026-10-24 MYT

Local checks on macOS arm64, Node.js v24.18.1:

- 59 tests passed, including new start/finish, status, schema, path, clock, expiry,
  injection, redaction, evidence-change and byte-restoration limitation cases.
- Eight existing and seven new observation workflow replays passed. These are
  deterministic tool/task cases; no model-level success or causal skill lift is claimed.
- Both examples passed. The new example actually runs a known synthetic calculator test
  outside the helper, records its command/time/exit/output and verifies the finish manifest.
- Custom syntax/JSON/whitespace/skill-reference/manifest lint, build and packaged checks
  passed. There are no project runtime or development dependencies and no install step.
- Both validators passed for all three source and packaged skills: bundled quick_validate.py
  with PyYAML 6.0.3, and Agent Skills skills-ref 0.1.1. Existing isolated verification tools
  were reused; neither Python tool is a project dependency.
- Local test coverage: observation module 100% lines/branches/functions; existing core
  100% lines/functions, 97.87% branches; CLI 100% lines/branches/functions. This measures
  executed paths, not authenticity, correctness of logs, or complete dependency selection.

Independent new-code review and forward-testing returned GO within the documented
self-reported snapshot scope. A real synthetic calculator test ran; source drift removed
the finish manifest; malicious log instructions stayed inert and canaries were absent
from reports; blocked status stayed blocked; expiry rejected finish without deleting files
or reading subject/evidence artifacts. 99 subjects plus evidence round-tripped; 100 plus
evidence was refused. Malformed-session errors stayed redacted. The reviewer requested
accurate evidence time/command text in the example; both were added. Release docs were updated.

Exact commit, CI, downloaded release-asset hashes and final independent disposition are
recorded in the release report. No host-client installation, marketplace publication,
remote execution proof or npm publication is claimed. Model/reasoning selection remains
unexposed and unverified on this executor. Earlier version records below are retained.

## 0.1.1 metadata compatibility patch

The optional `compatibility` frontmatter field was moved into each skill's readable
body, preserving the full-checkout, Node.js 22+ and local-filesystem guidance. The current
Agent Skills specification permits the field, but the bundled Codex skill-creator
validator rejects it. The patch avoids that validator friction without changing the
runtime, API, skill scope or assurance limits. The v0.1.0 tag/release remains preserved.

Validation on macOS arm64, Node.js v24.18.1:

- Both source skills passed the unchanged bundled `quick_validate.py`, using PyYAML
  6.0.3 installed from official PyPI in a temporary isolated Python 3.14 environment.
- Both source skills passed the Agent Skills `skills-ref` 0.1.1 reference validator
  (`agentskills validate`) installed in the same temporary environment.
- Both packaged skills also passed the bundled validator.
- `npm run check`, build and packaged checks passed: 38 tests, eight workflow cases,
  the runnable example and custom lint. No project dependencies were installed.

Exact-commit CI, independent patch review and release asset checks are recorded in the
patch release report. Earlier validation history below is retained as history, including
the initial unavailable validator and the subsequently demonstrated field mismatch.

## 0.1.0 original implementation

Local validation performed on 2026-10-22 UTC (2026-10-23 MYT), macOS arm64,
Node.js v24.18.1:

- `npm run check`: custom syntax/JSON/whitespace/link/manifest lint, 38 tests, runnable
  synthetic example and eight deterministic workflow cases passed.
- `npm run build`: allowlisted distribution and deterministic SHA-256 manifest created.
- `npm run check --prefix dist/engineering-handoff-skills`: packaged resources, 38 tests,
  example and eight cases passed.
- `node --experimental-test-coverage --test test/*.test.mjs`: core 100% lines/functions,
  97.85% branches; CLI 100% lines/branches/functions. Coverage measures executed code,
  not semantic correctness or model effectiveness.

An independent reviewer ran actual synthetic skill tasks in an isolated temporary root:
prepare a small calculator/test handoff, execute the toy test, record before/after
subject hashes, modify the source, preserve blocked status, reach exact expiry, and
handle a malicious saved log requesting private-file access/publication. The saved log
was hashed only, no marker command ran, private canary text did not appear in reports,
expiry left files intact, and public release remained `not-verified`.

Initial independent verdict was NO-GO for two concrete bugs: exact aggregate size
incorrectly rejected a trailing empty file, and capture could produce JSON larger than
its verifier accepts. Both were fixed with regressions. Re-review independently confirmed
the exact 64 MiB boundary, one-byte overflow rejected before content ingestion, oversized
capture rejected with no partial stdout, and a 262,081-byte accepted manifest round-trip.
Final code/skill verdict: GO within the documented scope, with no remaining blocker found.

The CI workflow targets Node.js 22 and 24 on Ubuntu and macOS. Exact remote commit,
workflow conclusion and release status are recorded in the release report after push;
local checks alone do not prove remote success. No host-client plugin installation,
marketplace submission or directory acceptance is claimed. Model-level task success and
causal skill lift were not measured. The requested runtime model/reasoning setting could
not be inspected or changed in this execution context.

The bundled skill-creator `quick_validate.py` was attempted for both skills but could
not run because this executor lacks PyYAML. No dependency was installed to conceal that
gap. The repository's local skill-name/frontmatter/reference checks and independent
task review passed; they are not a claim that the bundled validator ran successfully.
