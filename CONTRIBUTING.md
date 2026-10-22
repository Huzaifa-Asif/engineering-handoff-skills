# Contributing

Discuss substantial changes in an issue, and include a synthetic reproduction with any
bug report. Keep behavior scoped to selected local files and preserve the assurance
limits. Do not add network calls, command execution, credential discovery, automatic
deletion or installation to the core workflow.

Run `npm run check` and `npm run build`; then run `npm run check` inside
`dist/engineering-handoff-skills`. Add meaningful regression cases for behavior changes,
update the contract and changelog, and preserve MIT notices. Keep the runtime dependency-free
unless a separately reviewed need justifies a change. Never use private/employer data,
real secrets, paid services or production systems in tests. No CLA or DCO is introduced.

Follow [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). A consistent report must never be
renamed to imply release approval or successful test execution.
