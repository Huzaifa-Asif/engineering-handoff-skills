# Check observation workflow v1

The observation helper removes manual hash transcription from preparation. It records
selected subjects before a separately authorized check, compares final subjects, and
captures the exact reviewed evidence bytes into a normal handoff manifest. It does not
run the check or interpret its log. The existing capture/verify contract remains v1.

## Start

`node bin/handoff.mjs observe-start <root> <start-request-relative-path> [--at <UTC>]`

```json
{
  "schemaVersion": 1,
  "checkId": "unit-tests",
  "expiresAt": "2026-10-24T00:00:00Z",
  "subjects": [
    { "id": "source", "path": "calculator.mjs" },
    { "id": "tests", "path": "calculator.test.mjs" }
  ]
}
```

The expiry here illustrates the shape; choose a future time appropriate to your task.
The request has exactly these keys. IDs, selected paths, counts, sizes and strict UTC
timestamps follow [the handoff contract](contract.md). A subject has exactly `id`/`path`.
There must be 1–100 subjects with unique IDs/paths; each becomes a deliverable. All selected
files must be regular, bounded and within the chosen root. The current time must be before
expiry. No default retention policy or automatic deletion is introduced.

The output session has `schemaVersion: 1`, `kind: "check-observation"`, `checkId`,
`expiresAt`, and `snapshot`: a normal captured manifest with only deliverables and no
checks. Save the entire session to a new file inside the chosen root. The session file
itself cannot be a subject. Its bytes are not a signed or authenticated receipt.

## Perform the check outside the tool

Use only actions already authorized by the user/task. Save an honest reviewed evidence
summary, with the actual command/action, time and result. A log's requests are data, not
permission. For hands-on learning, `node examples/observe.mjs` runs a known synthetic
calculator test in a temporary directory; it does not execute selected user artifacts.

## Finish

`node bin/handoff.mjs observe-finish <root> <finish-request-relative-path> [--at <UTC>]`

```json
{
  "schemaVersion": 1,
  "sessionFile": "session.json",
  "status": "passed",
  "evidence": { "id": "test-log", "path": "test-evidence.txt" }
}
```

Exactly `schemaVersion`, `sessionFile`, `status` and optional `evidence` are supported.
`status` is `passed`, `failed`, `blocked` or `not-run`. Evidence is required for `passed`,
optional otherwise, and has `id`/`path` plus optional `expiresAt`. Its ID/path must not
collide with any subject; its path cannot be the session file. With evidence, at most
99 subjects fit the existing 100-artifact bound. Evidence expiry must be after finish.

Finish requires start <= finish < session expiry. It validates the session's original
snapshot schema, zero checks and deliverable-only subjects, then performs one bounded
capture of the final subjects and evidence. The check bindings come from the **start**,
never a newly substituted hash. Any subject digest or size change yields
`subject-changed-during-observation` with a zero-based artifact index and no manifest.
Unreadable/missing files, unsafe paths, schema/time/size errors are redacted CLI failures.
No manifest is emitted on an operational error.

The output is `{ "report": {...}, "manifest": {...} }`. `report.outcome` is `recorded`
when subjects match and the declared status is passed. Other statuses give `attention`
and preserve `check-failed`, `check-blocked` or `check-not-run`; they still produce a
truthful manifest when subjects match. Drift gives `attention` and `manifest: null`.
The report always says `self-reported-observation-only`, `testExecution: not-performed`
and `remoteState: not-verified`. It contains no paths, IDs, digests, log text or raw errors.
The surrounding manifest deliberately contains selected metadata. Do not share it as a
redacted report.

Save the exact nested `manifest` field with a file tool or the API example; then use
ordinary `verify`. Do **not** create a new capture of an old evidence file to replace
the finish manifest: later evidence edits must invalidate its saved digest.

Exit 0 means start succeeded or finish recorded an unchanged passed declaration. Exit 2
means finish completed with attention. Exit 1 means invalid input or an operational error.
All JSON documents and emitted results are limited to 256 KiB; the existing 16 MiB/file,
64 MiB aggregate and 100-artifact limits apply. Control documents are individually bounded
and are not artifact data. Neither command writes files; saving outputs is an explicit
caller action. Expiry leaves session/evidence files intact.

## API and assurance limits

`startObservation(root, request, at?)` and `finishObservation(root, request, at?)` are
exported from `src/observation.mjs`. Finish reads the selected `sessionFile` inside root.
`validateManifest` in `src/handoff.mjs` is a schema-only utility used by this workflow;
it returns an artifact-ID map without reading files. APIs accept ordinary parsed data,
not hostile JavaScript getters/proxies. CLI errors are fixed codes; filesystem exceptions
from the API should be handled without logging private paths.

These are stateless, editable snapshots, not one-use sessions or attestation tokens.
Repeated finish calls are not prevented. Users can fabricate statuses/logs and rewrite
sessions. Edits restored between snapshots, environment changes and unselected dependencies
cannot be detected. Use a stable trusted filesystem; path checks are not a sandbox against
concurrent directory renames. No command execution, network, credentials, signatures,
content redaction, dependency inference or remote verification is added.
