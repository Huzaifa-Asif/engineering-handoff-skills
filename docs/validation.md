# Validation record

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
