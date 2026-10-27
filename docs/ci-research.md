# CI observation review — October 28 MYT / October 27 UTC, 2026

## Concrete need and scope

The v0.5.0 program report records release creation being sent before tag CI completed:
a failed local verification command did not stop the following tool action. Branch CI
had passed and tag CI later passed, but the intended sequencing gate was not enforced.
The existing artifact/placement tools cannot evaluate a saved CI claim's exact context,
required jobs, attempt binding, completeness or observation freshness.

This original extension adds bounded offline CI-observation consistency review plus
explicit conditional caller guidance. It cannot authenticate GitHub, enforce a caller
that ignores results, grant approval or publish. Actual branch/tag completion and a
same-invocation stop-on-failed-proof fence are separately required for this release.

## Dated primary research and alternatives

- [GitHub workflow-run REST API](https://docs.github.com/en/rest/actions/workflow-runs#get-a-workflow-run)
  supplies repository, workflow path, head ref/SHA, event, run ID/attempt and state.
  Public prior-run metadata was inspected read-only to verify those actual field names.
- [Attempt-specific workflow jobs](https://docs.github.com/en/rest/actions/workflow-jobs#list-jobs-for-a-workflow-run-attempt)
  supplies a total count and per-job IDs/run/attempt/SHA/state. Complete selection and
  matching context matter; a job list borrowed from another attempt is not equivalent.
- Direct exact-run API/CLI inspection with correct conditional sequencing remains a
  suitable alternative. This helper makes consistency checks repeatable for saved
  minimal handoff evidence; it does not replace live inspection or infer required policy.
- [GitHub environment protection](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments)
  can enforce server-side deployment rules. That is stronger enforcement than an offline
  report. No environment, security setting, credential, reviewer or policy is changed here.
- [Agent Skills](https://agentskills.io/specification) and current
  [portable OpenAI plugin packaging](https://developers.openai.com/plugins/build/plugins)
  support the existing SKILL.md/root plugin.json/skills layout. The existing verify skill
  gains this evidence mode; no new overlapping skill, MCP server, hook or auth mapping.

CI gating and workflow/job validation are established concepts, not new mechanisms.
The original contribution is a bounded saved-claim contract, exact-context/attempt/job/
freshness reconciliation and fixed private-value-free reports within this handoff bundle.
No external adoption/demand or superiority claim. Documentation/API fields are referenced,
not copied implementation; original code/tests/fixtures/prose/artwork remain MIT.
There are no third-party project dependencies or new legal/CLA/DCO agreements. This is
distinct from MCP Input Roundtrip Lab and tool-call-budget-audit; their scopes/content,
unpublished candidates and npm gates are untouched.

## Assurance boundary

Only two explicit bounded regular metadata files are read. Reports omit input values
and state local-ci-evidence-consistency-only, remoteState not-verified, testExecution
not-performed, publication not-performed and approval not-granted. Snapshots can be
forged, stale relative to actual remote state, or derived from an incomplete policy.
Required human/user authorization, tag authenticity/target and live CI must be verified
separately. See [the strict contract and caller fence](ci-observations.md).
