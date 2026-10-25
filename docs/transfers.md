# Recipient placement verification v1

Version 0.4 supports explicitly relocated recipient files without rewriting their saved
manifest. Ordinary `verify` remains appropriate when the original relative layout is
preserved. Use `verify-transfer` only when the recipient intentionally chose a different
layout and can state where **every** original artifact was placed.

## Request and usage

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
node bin/handoff.mjs verify-transfer <recipient-root> <request-relative-path> [--at <UTC>]
node examples/transfer.mjs
```

Exactly `schemaVersion`, `manifestFile` and `placements` are accepted. Each placement
has exactly `artifactId` and `path`. It cannot supply a new digest, role, status, expiry
or binding. There must be 1–100 distinct artifact IDs and distinct destination path
strings, covering the original artifact set exactly once, including evidence. No missing,
unknown, extra or duplicate IDs are accepted. Mapping order is irrelevant. A destination
cannot be the selected manifest file. Paths follow the original safe-relative policy:
regular files within one selected trusted root, no symlinks, traversal, URLs or guarded
credential/configuration names. Physical aliases through case folding/hardlinks are not
deduplicated or authenticated; select intentional placements on a stable trusted filesystem.

Both request and selected manifest are individually bounded to 256 KiB by the CLI.
API users supply ordinary parsed data, not hostile JavaScript getters/proxies. The
manifest still has its original 100-artifact/100-check/16 MiB-file/64 MiB aggregate limits.
Actual artifact ingestion retains ordinary verification's bounded aggregate allowance.
Controls have their own individual limits. No recursive discovery, extraction, copy,
network, command execution, credential discovery, telemetry, persistence or deletion occurs.

## Preserved evidence

`verifyTransfer(root, request, at?)` is exported from `src/transfer.mjs`. It reads the
explicit original manifest, validates its schema and all original path metadata, then
constructs a temporary in-memory view with only artifact paths replaced by the selected
destinations. Original artifact order, IDs, roles, digests, byte sizes, retention expiry,
capture timestamp, checks, statuses and observation-time bindings remain unchanged.
Ordinary `verify` processes that view. The saved manifest and all artifacts are read-only.
No replacement manifest is returned. Original paths are not used as read targets unless
explicitly selected as recipient destinations.

Changed bytes or evidence are still stale. A stale original binding is never repaired
by relocation. Failed, blocked and not-run declarations remain visible. Exact expiry
flags attention without deleting or renewing anything; future captures remain errors.
The optional review time follows the original strict UTC rules and defaults to now.
Use historical overrides only for disclosed historical/reproducibility questions.

## Output and troubleshooting

The ordinary fixed-code report shape is retained, with assurance set to
`local-placement-consistency-only`. Counts/indices may disclose structure, but no path,
artifact ID, digest, log text or raw filesystem error is emitted. `testExecution` remains
`not-performed` and `remoteState` remains `not-verified`. Every artifact/check issue index
refers to the **original manifest order**, not the placements array. Exit 0 means locally
consistent, 2 attention, 1 invalid input or operational failure.

- `invalid-transfer`: wrong object shape/unknown fields.
- `invalid-placement`: wrong mapping shape/count, duplicate IDs/path strings or nonstring ID.
- `incomplete-placement`: mapping does not cover exactly the original artifact IDs.
- `transfer-path-collision`: a mapped destination is the selected manifest itself.
- Existing `unsafe-path`, schema, parsing, time and size error codes remain applicable.
- Missing/symlink/overlarge artifacts are attention issues as in ordinary verification;
  missing/invalid/symlink/overlarge control manifests are errors with no partial report.

On a missing placement, establish the actual selected destination rather than dropping
it. On changed bytes, preserve the old observation and investigate or obtain a new check
within existing authorization. CLI errors are redacted; raw API filesystem exceptions
may contain private paths and should be handled privately. Neither name guards nor
hashing scan/redact file contents. Review originals and maps before sharing.

## Limits of the result

Relocation does not prove transport integrity without a trusted original manifest;
the sender can forge manifest and evidence together. It does not authenticate who placed
a file, prove the log's command ran, infer missing dependencies, or check semantic behavior.
A layout change can break imports or commands even when all bytes match. A consistent
recipient report preserves the original observation; it is **not** a passing check in
the new environment. Reassess path-sensitive behavior separately when authorized.

No BagIt parsing/conversion or checksum-tool interoperability is claimed. For unchanged
layouts use ordinary verification. For multi-manifest requirements use `review-set` in
the original layout; transfer verification currently accepts one manifest and does not
add mapped-set composition. No remote commit/CI/release/directory status is inferred.
