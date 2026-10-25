# Handoff contract v1

Version 0.4 adds [recipient-placement verification](transfers.md). Only an ephemeral
verification view substitutes explicit recipient paths; saved evidence is never changed.

Version 0.3 adds [required-check set review](review-set.md) over separate v1 manifests.
It does not merge or recapture records; all original capture timestamps remain intact.
Optional shared read-budget arguments are described in that API reference.

Version 0.2 adds a separate [check-observation workflow](observations.md) producing this
existing manifest format. Capture/verify v1 inputs and semantics remain supported.

Both plan and manifest are UTF-8 JSON objects, limited to 256 KiB. Unknown fields are
rejected. JSON follows `JSON.parse` semantics (duplicate object keys use the final value);
producers should emit unique keys. `schemaVersion` must be numeric `1`.

`artifacts`: 1–100 objects, each with a unique `id`, unique `path`, and `role` of
`deliverable` or `evidence`. IDs match `[a-z][a-z0-9-]{0,63}`. Paths are relative,
nonempty, at most 240 characters, with no empty/dot/parent segments, backslash, colon,
ASCII control characters or absolute paths. Common secret/configuration names are
refused case-insensitively: `.env` variants, `.git`, `.aws`, `.ssh`, `.npmrc`, `.netrc`,
`credentials`, `auth.json`, `id_rsa`, `id_ed25519`. This is a conservative name guard,
not a content secret scanner. Any other selected file can contain secrets.

Only regular files are accepted. Selected path components and the root itself cannot
be symlinks. There is no recursive discovery, URL handling or archive extraction.
Root ancestors are resolved by the OS; select a trusted stable root. Parent component
checks are not race-free against another process renaming directories. Do not use on
an adversarially changing filesystem; a snapshot or sandbox belongs outside this tool.

Each file is limited to 16 MiB, with a 64 MiB aggregate budget. Reads are bounded even
if a file grows, and descriptor size/mtime/ctime are checked after reading. On verify,
the default budget charges the accepted descriptor size before reading, including a
read that later fails a race check. At most one extra growth-detection sentinel byte
per artifact may be inspected. This applies to ordinary and recipient verification.
each read receives the remaining aggregate allowance; empty files remain valid at the
exact budget boundary, while nonempty overflow is refused before content ingestion.
Each manifest artifact additionally contains `sizeBytes` (nonnegative safe integer)
and `sha256` (64 lowercase hex characters). Capture computes them from selected bytes.
The pretty-serialized capture result, including its trailing newline, must also fit the
256 KiB JSON limit; expansion beyond that bound is rejected before stdout is emitted.

An artifact may have `expiresAt`: strict UTC `YYYY-MM-DDTHH:MM:SSZ`, with a real calendar
date. Capture refuses artifacts already expired at capture time. Verify flags expiry
at the exact boundary; it does not delete or rewrite anything. No implicit TTL exists.

`checks`: 0–100 objects with unique `id`, `status` (`passed`, `failed`, `blocked`, `not-run`),
`subjects` (1–100 unique IDs of deliverables), and `subjectDigests` (an object whose exact
keys are the subject IDs and values are their SHA-256 digests **at observation time**).
Optional `evidence` must reference an evidence artifact; it is required for `passed`.
Capture preserves the supplied bindings. It never upgrades a status or retroactively
binds old evidence to changed source. Verify compares the bindings and current artifacts.

A manifest adds `capturedAt`, a strict UTC timestamp. Verify rejects capture timestamps
later than the review time. Default review/capture time is current UTC rounded down to
seconds. `--at` is available for disclosed historical reviews and reproducible examples.
No per-check execution time is machine-validated: put it in the reviewed evidence file.

## Assurance and privacy

The result can show that selected bytes match a saved snapshot and that self-reported
observations refer to those bytes. It cannot show that tests ran, that assertions are
correct, that all dependencies were selected, or that a remote commit/CI/release exists.
No network, process execution, telemetry, storage database, auth, deletion or signing.
Capture emits paths and digests; verification emits only fixed codes, counts and indices.
Nothing scans/redacts artifact content. Shell redirection is the caller's explicit write.

The exported functions `capture`, `verify`, `parseDocument`, `readSelected`, `timestamp`
and `safeRelative` throw `HandoffError` with stable codes for policy/schema violations.
Filesystem errors may propagate from `capture`/`readSelected`; CLI output redacts them.
The API expects ordinary data from `parseDocument`; it is not intended for hostile JS
objects with getters/proxies. Input documents and returned data are not executed.
