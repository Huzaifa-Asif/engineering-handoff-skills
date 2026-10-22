# Changelog

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
