# Changelog

## 0.4.0 — 2026-10-26 MYT

- Add verify-transfer CLI/API for exhaustive explicit recipient placements under a
  changed local layout without rewriting/recapturing original evidence.
- Preserve original hashes/bindings/statuses/time/expiry and report artifact indices;
  refuse incomplete/ambiguous mappings and keep all existing selected-file bounds.
- Extend existing verify skill with recipient workflow and path-dependent behavior
  limitations. Add actual synthetic sender-test example, regressions and workflow evals.
- Retain four portable skills, prior v1 formats/APIs/commands, MIT and zero dependencies.
- Charge the default verification budget before ingestion, including failed/racing reads.

## 0.3.0 — 2026-10-25 MYT

- Add bounded review-set command/API and review-required-checks skill for explicit
  required subject/check pairs across separate saved observation manifests.
- Detect cross-manifest artifact/path/check conflicts; preserve missing, non-passed,
  stale and expired evidence without merging or manufacturing capture timestamps.
- Share a charged artifact read budget across repeated manifest verifications. Add
  runnable two-check example, representative workflows, regression cases and API guide.
- Preserve v1 formats, prior commands/releases, MIT notices and dependency-free runtime.

## 0.2.0 — 2026-10-24 MYT

- Add bounded observe-start/observe-finish commands and startObservation/finishObservation
  APIs for before/after subject hashing around a separately authorized check.
- Produce a directly verifiable finish manifest with exact evidence bytes; refuse to
  emit a manifest when subjects drift. Preserve failed, blocked and not-run declarations.
- Add explicit session expiry without deletion, strict selected-file/schema/time limits,
  redacted nested reports, record-check-observation skill and a real toy-test example.
- Retain capture/verify v1, release history, dependency-free runtime and assurance limits.

## 0.1.1 — 2026-10-23 MYT

- Move each skill's optional `compatibility` frontmatter guidance into its readable body.
  The current Agent Skills specification permits the field, but the bundled Codex
  skill-creator validator rejects it. Both skills retain the full-checkout, Node.js 22+
  and local-filesystem requirements without that avoidable validator friction.
- Preserve the v0.1.0 release/tag and all runtime behavior, APIs and assurance limits.

## 0.1.0 — 2026-10-23 MYT

- Add prepare/verify handoff skills and the original bounded offline capture/verify tool.
- Preserve observation-time subject digests; propagate changed/expired evidence to checks.
- Keep passed, failed, blocked and not-run observations distinct.
- Add redacted reports, selected-file protections, synthetic examples and workflow evaluations.
- Package using the portable root plugin manifest and fixed skills directory.

See validation and release records for actual executed checks and publication status.
