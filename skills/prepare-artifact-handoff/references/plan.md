# Plan contract

The authoritative field definitions and limits are in [the root contract](../../../docs/contract.md).
Use only synthetic data when learning the workflow; runnable files are in `examples/basic`.

```json
{
  "schemaVersion": 1,
  "artifacts": [
    {"id": "source", "path": "src/app.mjs", "role": "deliverable"},
    {"id": "tests", "path": "evidence/tests.txt", "role": "evidence", "expiresAt": "2027-01-01T00:00:00Z"}
  ],
  "checks": [{
    "id": "unit-tests", "status": "passed", "subjects": ["source"],
    "evidence": "tests",
    "subjectDigests": {"source": "<64 lowercase hex characters observed when this check ran>"}
  }]
}
```

The placeholder is intentionally invalid; replace it with an actual SHA-256 digest.
For a failed, blocked or not-run check, keep the selected subject hashes and set the
honest status; evidence is optional. A blocked operation does not become passed because
its artifacts are present. Check records are self-reported observations, not attestations.

Hash a selected file using an available local SHA-256 tool, for example
`shasum -a 256 src/app.mjs` on macOS or `sha256sum src/app.mjs` on Linux.
Hash all files that affect the check. A single source file is insufficient for a test
that also depends on an unrecorded configuration file. Avoid a changing live workspace.
