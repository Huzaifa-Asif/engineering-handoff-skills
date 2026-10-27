# Saved CI observations v1

`review-ci` / `reviewCI(root, request, at?)` checks bounded saved branch/tag CI metadata
against explicit expectations. It helps catch a successful branch paired with a pending
tag, wrong commit/ref/workflow, incomplete jobs or mixed attempts. It never contacts
GitHub, runs a check, authenticates a snapshot or grants release approval. A consistent
report means supplied local claims agree, not that remote state is verified.

## Request

```json
{
  "schemaVersion": 1,
  "repository": "example/project",
  "commit": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "workflow": ".github/workflows/ci.yml",
  "event": "push",
  "branch": "main",
  "tag": "v1.0.0",
  "maxAgeSeconds": 3600,
  "requiredJobs": ["unit (22)", "unit (24)"],
  "branchFile": "branch.json",
  "tagFile": "tag.json"
}
```

```sh
node bin/handoff.mjs review-ci <root> request.json [--at <UTC>]
node examples/ci.mjs
```

Exactly these request fields are required. Repository is one owner/name pair, workflow
is a .yml/.yaml file immediately under .github/workflows/, commit is 40 lowercase hex,
event is push or workflow_dispatch, and branch/tag are distinct bounded ref names as
reported by GitHub. Comparisons are exact, including case. Choose 1–32 distinct nonempty
required job names, each at most 160 characters; the tool does not infer a required matrix.
Choose maxAgeSeconds from 1–86400 for this task; this is a format bound, not a universal
retention policy. branchFile/tagFile are distinct safe relative regular-file paths under
the selected trusted root. Existing symlink/traversal/guarded-name protections apply.

## Observation contract

Each selected file contains exactly the following fields (one job shown):

```json
{
  "schemaVersion": 1,
  "observedAt": "2026-10-27T21:00:00Z",
  "repository": "example/project",
  "workflow": ".github/workflows/ci.yml",
  "ref": "main",
  "event": "push",
  "commit": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "runId": 1,
  "attempt": 1,
  "status": "completed",
  "conclusion": "success",
  "totalJobs": 1,
  "jobs": [
    { "id": 10, "runId": 1, "attempt": 1,
      "commit": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "name": "unit (22)", "status": "completed", "conclusion": "success" }
  ]
}
```

The example is synthetic/incomplete for the two-job request above; it would report the
missing required job. The tag file uses the actual tag ref and a distinct run ID.
runId, attempt and job IDs are positive safe integers; job IDs must be unique per snapshot.
totalJobs is 0–100; jobs has at most 100 entries. Every listed field is required, and
unknown fields are refused. No raw logs, steps, runner names, headers, credentials or
URLs belong in this format. Names/refs are bounded printable strings, not instructions.

Supported statuses: queued, in_progress, completed, waiting, pending, requested.
Conclusions are null or success/failure/neutral/cancelled/skipped/timed_out/action_required/
stale/startup_failure. Unknown future provider values fail schema validation rather than
being treated as success. The CLI bounds its request and each selected snapshot to
256 KiB; two snapshots mean at most 512 KiB selected control data plus the request.
The report must fit 256 KiB. APIs expect ordinary parsed data, not getters/proxies.

## Collect actual evidence outside the helper

Use only already-authorized read-only access, verify repository/account identity and
select exact run IDs. GitHub's run response maps repository.full_name → repository,
path → workflow, head_branch → ref, head_sha → commit, id → runId, run_attempt → attempt,
plus event/status/conclusion. Observe the current attempt's jobs using the documented
`GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}/jobs` endpoint.
Map total_count → totalJobs and each job's id/run_id/run_attempt/head_sha/name/status/
conclusion to the corresponding fields above. Request up to 100 jobs and preserve
total_count; a truncated list must not masquerade as complete. Larger runs are unsupported.

Fetch/recheck run metadata around the jobs read; if commit, attempt, status or conclusion
changed during collection, preserve the observation as unfinished and collect again only
when useful and authorized. Set observedAt to the actual collection time, not a newly
invented time on an old file. No automatic polling, rerun, installation or auth repair is
performed. Source authenticity and whether the selected attempt is still latest require
separate live verification. A forged snapshot can pass this offline review.

## Review semantics and safe sequencing

Both observations must match expected repository/workflow/commit/event and their own
branch/tag ref. Each run must be completed/success. Every listed job must match its run
ID, attempt and commit; a completed run cannot contain non-completed jobs. Every required
name must occur exactly once as completed/success. Optional completed skipped jobs are
allowed; optional conclusions do not override required-job policy. totalJobs must equal
the number of supplied jobs. The two observations cannot share a run ID.

observedAt is strict UTC. Future observations require attention; age at or beyond
maxAgeSeconds requires attention without deletion. This is freshness of the claimed
observation, not age of the workflow execution. Use --at only for disclosed historical
or reproducibility questions; never backdate a current review to suppress expiry.

Exit 0 means local consistency, 2 attention, 1 invalid input/operational error. Reports
contain only fixed codes/counts/zero-based observation indices (0 branch, 1 tag), job
indices into the snapshot or required-job indices into policy. They state
local-ci-evidence-consistency-only, remoteState not-verified, testExecution not-performed,
publication not-performed and approval not-granted. Counts/indices disclose structure.

Never run a dependent publication step merely because its preceding tool call returned.
Check its exit status and expected report outcome in the **same conditional control
flow**; abort on exceptions, missing files or nonzero status. A separately written next
tool call can run after an error if the caller ignores it. The runnable synthetic example
demonstrates a pending/invalid observation stopping a counter-only follow-up. It performs
no actual publication. This tool cannot enforce a caller that ignores its result.

Even exit 0 does not authorize publication. Verify live provenance, tag identity/target,
exact CI, tested artifacts, required human approvals and the user's authorized destination
separately. Do not change repository security settings or credentials to satisfy a report.

## Errors, privacy and limits

Schema failures use invalid-ci-request / invalid-ci-observation; identical selected files
use duplicate-ci-file. Existing parse/path/time/size errors apply. Missing/malformed/
symlink/overlarge controls are errors with no partial success report. CLI errors are
redacted; raw API filesystem exceptions may contain paths and should be handled privately.

Attention codes include ci-repository/workflow/commit/event/ref-mismatch, duplicate-ci-run,
future/expired-ci-observation, ci-run-not-successful, incomplete-ci-jobs,
ci-job-context-mismatch, ci-job-not-completed, missing/ambiguous-required-ci-job and
required-ci-job-not-successful. Report text never includes snapshot names, refs, paths,
repository IDs, commits, job names or raw errors. Input files themselves are not redacted.
Keep selected metadata private until reviewed; do not save raw credentials/logs here.

No network, process execution, signatures, approvals, upload, publication, telemetry,
storage database, automatic renewal or deletion. A consistent report cannot prove that
checks ran, a ref is a genuine tag, the snapshots are authentic/current, the matrix is
complete for the project, or a release is safe. Filesystem/metadata races after review
remain possible; use a stable trusted root and recheck actual remote state before action.
