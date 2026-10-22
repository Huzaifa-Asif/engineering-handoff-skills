# Report semantics

Reports contain fixed codes, counts and zero-based manifest indices, never file contents,
paths, identifiers, digests, raw JSON parser messages or OS exception text.

| Code | Meaning | Next action |
| --- | --- | --- |
| `bytes-changed` | Actual size or SHA-256 differs from the manifest | Preserve observation; inspect change and rerun relevant checks |
| `stale-evidence` | Subject binding differs, or a subject/evidence artifact is invalid | Do not count that recorded pass as current evidence |
| `check-failed` | Recorded check failed | Fix or disclose failure |
| `check-blocked` | Recorded check was blocked | Preserve exact blocker; do permitted independent work |
| `check-not-run` | No completed observation | Run only if authorized or disclose |
| `no-recorded-check` | Deliverable has no covering check | Explain the assurance gap |
| `expired-artifact` | Artifact expiry is at/before review time | Apply the owner's retention decision; no deletion occurs |
| `file-unavailable` | Selected file cannot be read | Restore/select authorized bytes; raw error is withheld |
| `symlink-refused` / `unsafe-path` | Selected path crosses a protected boundary | Use explicit regular files inside the chosen root |
| `size-limit` | An input exceeds a documented bound | Select a smaller explicit handoff; do not disable the bound |

Schema failures go to stderr as a single fixed code and exit 1. They are not an
attention report. Missing CLI input files report `operation-failed` to avoid reflecting
paths. Full schema, bounds and time semantics: [contract](../../../docs/contract.md).
