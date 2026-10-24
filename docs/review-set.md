# Required-check set review v1

Version 0.3 adds read-only review across explicitly selected v1 manifests. An observation
finish emits one check. A recipient may need two independent observations of the same
source, such as unit tests and lint. Verifying each separately does not establish that
all expected checks exist or that their snapshots and identities agree. `review-set`
adds that explicit comparison without merging manifests or creating a new capture time.

## Request and invocation

```json
{
  "schemaVersion": 1,
  "manifestFiles": ["unit-manifest.json", "lint-manifest.json"],
  "requirements": [
    { "subjectId": "source", "checkIds": ["unit-tests", "syntax"] }
  ]
}
```

```sh
node bin/handoff.mjs review-set <root> <request-relative-path> [--at <UTC>]
node examples/review-set.mjs
```

The request supports exactly the fields shown. `manifestFiles` has 1–16 distinct safe
relative paths inside the selected root. `requirements` has 1–100 entries with distinct
subject IDs; each contains exactly `subjectId` and a nonempty distinct `checkIds` array.
There may be at most 100 required subject/check pairs in total. IDs follow the existing
`[a-z][a-z0-9-]{0,63}` rule. Requirements identify deliverables, not evidence files.

The API is `reviewSet(root, request, at?)` from `src/review-set.mjs`, accepting ordinary
parsed data, not hostile JavaScript getters/proxies. `SET_LIMITS` exposes set bounds.
The CLI also bounds its request to 256 KiB. Every selected manifest is schema-validated
before artifact ingestion, including future-time checks. Unknown fields, malformed JSON,
unsafe/secret-name paths, symlinks and missing control files are errors. Manifest files
cannot also be selected artifacts. Filesystem/API errors should be handled without
sharing raw private paths; CLI errors contain fixed codes only.

## Reconciliation and requirements

Artifact IDs are global within this selected set. Repeated IDs must agree on path, role,
digest, byte size and expiry. A path cannot acquire another ID in a different manifest.
Repeated check IDs must agree on status, evidence reference, subject set and bindings;
subject ordering and JSON property order do not matter. Use distinct check IDs for
different observations. Compatible repeated records are accepted; copies cannot turn
one check into another required identity. These are exact consistency comparisons,
not proof of a common author, execution or trustworthy identity assignment.

Every original manifest also undergoes ordinary local verification: changed/unavailable
bytes, expiry, stale bindings, non-passed status and no-recorded-check remain attention.
An otherwise valid check elsewhere does not erase an original manifest's issues. This
strict behavior preserves incomplete records instead of silently replacing them.

Each required subject must exist as a deliverable; each required check must exist, cover
that subject and declare passed. Local verification still has to accept its bytes and
binding. A conflicting record always makes the entire outcome attention, even if a
first record satisfies the requirement. No merged manifest, recapture, changed status
or execution inference is emitted.

## Report, limits and errors

The report contains `schemaVersion`, `outcome` (`consistent` or `attention`),
`manifestCount`, `artifactEntryCount`, `checkEntryCount`, `requiredPairCount`, `issues`,
and fixed assurance fields: `local-set-consistency-only`, `testExecution: not-performed`,
`remoteState: not-verified`. It contains no input-derived strings, paths, IDs, digests,
contents or raw errors. Counts/indices still disclose set structure; they are not anonymous.

Conflict/local-verification issues carry a zero-based `manifestIndex`, `kind` and `index`
into that manifest's artifacts or checks. Requirement issues carry `kind: requirement`,
`index` into the request requirements, and (except missing subject) `checkIndex` into its
check IDs. Codes include `conflicting-artifact`, `conflicting-path-identity`,
`conflicting-check`, `required-subject-missing`, `required-check-missing`,
`required-subject-uncovered`, `required-check-not-passed`, plus existing verification codes.

Exit 0 means consistent, 2 attention, 1 invalid input/operational failure. Errors include
`invalid-review-set`, `invalid-requirement`, `size-limit`, `future-capture`,
`review-set-path-collision` and existing parsing/path/schema codes. No report is emitted
on a control-document error, so a missing manifest cannot be mistaken for a completed set.

All selected control documents together are limited to 1 MiB, each to 256 KiB. There
may be at most 100 artifact entries and 100 check entries across all manifests, counting
repeats. Declared artifact sizes together and actual shared artifact ingestion each have
a 64 MiB budget; one file is limited to 16 MiB. Repeated reads are charged again. At
most one extra growth-detection sentinel byte per read may be inspected. The control
and artifact budgets are separate. If a file grew beyond the declared size, actual
ingestion still shares one budget across manifests; refused overflow becomes attention.
The emitted report must fit 256 KiB. These limits do not bound filesystem latency.

`readSelected` and `verify` now accept an optional fourth API argument `{remaining}`
for shared bounded artifact ingestion. It must hold an integer from 0 to 64 MiB and is
decremented before reading an accepted descriptor's size, including a later failed/racing
read. Empty files remain readable at zero. Callers should keep this object private and
fresh per review. Existing three-argument APIs and report schemas remain unchanged.

The tool assumes a stable trusted filesystem. It does not sandbox concurrent directory
renames, discover files/dependencies, execute commands, redact contents, authenticate
records, impose an organization policy, upload data or delete expired evidence. Selected
manifests can be forged; requirements can be incomplete. Remote commits/CI/releases,
semantic correctness and directory acceptance need separate evidence.
