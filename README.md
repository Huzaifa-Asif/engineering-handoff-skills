# Engineering Handoff Skills

Pass an engineering artifact to the next person with evidence tied to the bytes they
actually receive. This repository combines four portable skills with an original,
dependency-free offline tool for artifact snapshots, check bindings and retention review.
Version 0.4 adds explicit recipient-placement verification: compare every transferred
artifact against the untouched sender manifest after an intentional path/layout change.
Original digests, bindings, statuses, capture time and expiry are preserved.
Version 0.2 adds start/finish observations: record selected inputs before an authorized
check, compare final bytes, and receive a manifest with the exact reviewed evidence.
The helper never executes that check.
Version 0.3 adds required-check set review: compare separate saved manifests against
explicit subject/check requirements, detect cross-record conflicts and keep missing
or blocked work visible without merging evidence.

A saved “tests passed” log is easy to carry forward after the source changes. This tool
preserves the source hashes recorded at observation time, compares them with the handoff,
and flags stale evidence. It also keeps failed, blocked and not-run checks visible.

**Assurance limit:** a consistent report proves local byte consistency against a supplied
manifest. Logs and status declarations can be forged. This tool does not run tests,
verify authorship, establish semantic correctness or confirm a push, CI run or publication.

## Quick start

Requires Node.js 22 or newer. Tested versions and release status are recorded in
[validation](docs/validation.md). No installation, npm credentials, model API or network
is needed to run the tool. The package is private and is not an npm publication.

```sh
git clone https://github.com/Huzaifa-Asif/engineering-handoff-skills.git
cd engineering-handoff-skills
node examples/run.mjs
node examples/observe.mjs
node examples/review-set.mjs
node examples/transfer.mjs
```

The example captures synthetic files, verifies consistency, changes a deliverable and
confirms that both changed bytes and stale evidence are detected. It uses a temporary
directory and removes only that directory afterward. Example evidence is explicitly synthetic.

To inspect the manifest and report yourself (save only to new reviewed paths):

```sh
set -C  # shell noclobber: refuse to overwrite an existing output
node bin/handoff.mjs capture examples/basic plan.json --at 2026-10-22T22:00:00Z > examples/basic/manifest.json
node bin/handoff.mjs verify examples/basic manifest.json --at 2026-10-22T22:00:00Z
```

The fixed clock is for this reproducible example. Omit `--at` for a current review.
The CLI itself never writes files; stdout redirection is an explicit caller action.
Capture output includes paths and hashes. Verification output is redacted by construction:

```json
{
  "schemaVersion": 1,
  "outcome": "consistent",
  "artifactCount": 2,
  "recordedCheckCount": 1,
  "issues": [],
  "assurance": "local-byte-consistency-only",
  "testExecution": "not-performed",
  "remoteState": "not-verified"
}
```

## Receive artifacts under different paths

Keep the original saved manifest. State each original artifact ID and actual recipient
path, including every evidence file, in a new request:

```json
{
  "schemaVersion": 1,
  "manifestFile": "original-manifest.json",
  "placements": [
    { "artifactId": "source", "path": "payload/code.mjs" },
    { "artifactId": "tests", "path": "payload/check.mjs" },
    { "artifactId": "test-log", "path": "evidence/result.txt" }
  ]
}
```

```sh
node bin/handoff.mjs verify-transfer <recipient-root> transfer.json
```

Placements must cover the entire artifact set exactly once. Nothing is copied, extracted,
rewritten or recaptured. The fixed report uses original manifest indices and
`local-placement-consistency-only`; it omits private paths/IDs/content. Exit codes remain
0 consistent, 2 attention, 1 invalid input/operational error. Matching relocated bytes
does not prove imports/commands still work in the new layout or that a recipient check ran.
See [recipient usage/API/limits](docs/transfers.md) and run `node examples/transfer.mjs`.
The existing verify skill includes this receiving mode; no additional skill is needed.

## Require several checks across saved manifests

For a handoff needing both unit tests and syntax checks, select the exact manifests and
required IDs rather than accepting whichever passed log happens to be present:

```json
{
  "schemaVersion": 1,
  "manifestFiles": ["unit-tests.json", "syntax.json"],
  "requirements": [{ "subjectId": "source", "checkIds": ["unit-tests", "syntax"] }]
}
```

```sh
node bin/handoff.mjs review-set <root> review.json
```

Exit 0 means local consistency and passed declarations for all listed pairs; 2 means
attention; 1 is an input/operational error. The redacted report flags missing coverage,
conflicting identities/snapshots/checks and ordinary stale/expired/blocked records.
It never merges manifests, recaptures evidence or proves execution. Use
[review-required-checks](skills/review-required-checks/SKILL.md) for the agent workflow and
[the full contract/API](docs/review-set.md) for schemas, limits and troubleshooting.
`node examples/review-set.mjs` runs actual known synthetic unit/syntax commands outside
the helper and demonstrates complete coverage, missing checks and stale bytes.

## Record a new check without copying hashes

`node examples/observe.mjs` executes a known synthetic calculator test outside the
observation helper, records its actual exit/output, finishes the observation, verifies
the result and demonstrates drift detection. It operates only in its own temporary root.

For your own check, create a request naming the check, its subject IDs/paths and a future
session expiry. Use `observe-start`, perform the actual authorized check separately,
save reviewed/redacted evidence, then use `observe-finish` with the honest status. Save
the finish result's exact `manifest` field and verify it. If subjects changed, that field
is null; do not rewrite the session to suppress the finding. Failed/blocked/not-run
statuses remain explicit. Read [the request/API contract](docs/observations.md).

```js
import { startObservation, finishObservation } from './src/observation.mjs';
// Save the start session to a new selected file, run the separately authorized check,
// then finish with its actual status and reviewed evidence. No command is accepted.
const result = finishObservation('./handoff', {
  schemaVersion: 1, sessionFile: 'session.json', status: 'passed',
  evidence: { id: 'test-log', path: 'test-evidence.txt' }
});
// result.report is redacted; result.manifest contains selected paths/IDs/hashes.
// Save a present manifest exactly; do not recapture its evidence later.
```

Matching before/after bytes cannot detect restored-byte edits, forged logs/sessions,
environment changes or unselected dependencies. A status is still self-reported.

## Skills and supported packaging

| Skill | Use it when |
| --- | --- |
| [prepare-artifact-handoff](skills/prepare-artifact-handoff/SKILL.md) | Preparing selected files, actual check evidence and a reviewable handoff |
| [verify-artifact-handoff](skills/verify-artifact-handoff/SKILL.md) | Receiving/resuming a handoff or checking whether evidence became stale |
| [record-check-observation](skills/record-check-observation/SKILL.md) | Recording a new check with before/after subject hashing and reviewed evidence |
| [review-required-checks](skills/review-required-checks/SKILL.md) | Reviewing required subject/check coverage and conflicts across separate manifests |

The root `plugin.json` uses Agent Plugins schema 1.0.0 with fixed `skills/` discovery.
The skills also use the Agent Skills `SKILL.md` format. Keep the **whole checkout** when
using any skill: they rely on the shared `bin/`, `src/` and `docs/` files. Do not copy a
single skill folder into a global skills directory and expect the shared tool to follow.

For a client that accepts a local portable plugin, select the repository root through
that client's plugin installation UI and verify the four skill names appear. Client
support and installation paths vary; see the [current official packaging guide](https://developers.openai.com/plugins/build/plugins).
You can also explicitly provide the SKILL.md path to an agent with local file tools.
No host-client installation, marketplace acceptance or directory listing is claimed.
This is a local CLI/skills package, with no MCP server, hooks, authentication or hosted app.

## Use with real work

1. Select a stable local handoff root and explicit deliverables. Include configuration
   and dependency files needed to interpret each check.
2. Hash the subjects immediately before and after the authorized check. Preserve those
   observed hashes and a manually reviewed, redacted evidence summary.
3. Write a plan following [the contract](docs/contract.md). Do not substitute current
   hashes for the hashes observed when an old check ran.
4. Capture, then verify. Review any `attention` result before describing the work as ready.
5. Independently verify remote facts if the handoff claims a commit, push, exact-commit CI,
   release or publication. The offline report cannot establish any of them.

CLI: `node bin/handoff.mjs capture|verify|observe-start|observe-finish <root> <relative-json-path> [--at <UTC>]`.
Exit 0 means capture succeeded or verification is consistent; 2 means verification
completed with issues; 1 means invalid input/operational failure. A report's indices are
zero-based positions in the private input manifest. API exports are documented in
[the contract](docs/contract.md).

For observations, start succeeds with exit 0; finish returns 0 for recorded unchanged
passed status, 2 for attention, and 1 for schema/operational errors. Only its nested
report is redacted; session/manifest output contains selected metadata. Session expiry
refuses finish and leaves files intact.

## Boundaries and limitations

- Selected regular files only: no recursion, symlink traversal, downloads or archive extraction.
- 256 KiB input/output JSON, 100 artifacts/checks, 16 MiB/file and 64 MiB aggregate.
- Strict schema, path/time validation and fixed error codes. Verify reports omit paths,
  identifiers, digests and content. Capture manifests are deliberately not redacted.
- Expiry flags retention review. There is no automatic deletion, upload, database or telemetry.
- A secret-name guard is not a secret scanner. Review files before sharing. Hashes can
  reveal whether a guess matches a low-entropy private file.
- This is not a hostile-filesystem sandbox, cryptographic attestation, complete provenance
  system, test runner, release gate, permission engine or model-behavior certification.

## Alternatives and original scope

`sha256sum`/`shasum` already verify bytes; use them for a simple checksum list. in-toto
provides supply-chain metadata and verification with a larger trust model. Existing
skill evaluation harnesses measure model behavior and skill lift; this project does not.
The original contribution here is the small handoff contract and its conservative
workflow: recorded subject bindings, stale-evidence propagation, explicit blocked states,
retention flags and redacted reports in a portable skills bundle. No protocol novelty,
adoption or superiority claim. [Dated research and licensing](docs/research.md).

## Development and troubleshooting

```sh
npm run check
npm run build
```

These commands use built-in Node tools only and do not install packages. The build
creates an allowlisted distribution tree and deterministic SHA-256 file manifest.
Run the same checks inside the distribution to exercise packaged examples and resources.
The custom lint checks syntax, JSON, whitespace, skill links and local manifest shape;
it is not ESLint, a type checker or a full external schema validator. Source is plain JS.

If a path is refused, use an explicit regular file inside the selected root; do not
disable safeguards. For `invalid-binding`, supply hashes from the actual check observation.
For stale evidence, preserve the old result and rerun relevant checks only when authorized.
For expiry, review retention with the owner. For `size-limit`, choose a smaller handoff.
For `future-capture`, check the clock; do not backdate a current review to hide expiry.
For `required-check-missing`, preserve the incomplete set and obtain the actual required
observation only when authorized. For conflicts, review the originals instead of merging
JSON or changing IDs to suppress a finding. Use distinct IDs for different observations.
For `incomplete-placement`, establish the actual destination for every original artifact;
do not omit evidence or rewrite digests. For a changed recipient file, preserve the old
observation and reassess whether the layout/environment requires an authorized new check.
Do not paste private input to an issue: use a minimal synthetic reproduction.

For `subject-changed-during-observation`, preserve the original session/result and rerun
a new observation only when authorized. For `observation-expired`, start a new session
before a new check; do not backdate it. See [observation error semantics](docs/observations.md).

See [CONTRIBUTING](CONTRIBUTING.md), [conduct](CODE_OF_CONDUCT.md),
[security](SECURITY.md), [privacy](PRIVACY.md), [changelog](CHANGELOG.md) and
[evaluation guide](evaluations/README.md). Original code and prose are MIT licensed.
