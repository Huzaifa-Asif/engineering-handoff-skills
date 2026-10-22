# Research and architecture decision — 2026-10-23 MYT

## Problem evidence

This is a workflow need observed in the author's engineering program: source artifacts,
saved tests and completion reports move across local workspaces and agents. The next
recipient needs to know whether the bytes still match a recorded observation, which
checks never ran, and which remote facts remain unverified. This is not evidence of
third-party adoption, a broad market survey or a newly discovered protocol defect.

Official guidance consulted on 2026-10-22 UTC:

- [Agent Skills specification](https://agentskills.io/specification): skills are directories
  with SKILL.md metadata/instructions and optional executable/supporting resources.
- [Using scripts in skills](https://agentskills.io/skill-creation/using-scripts): deterministic
  helpers should expose useful interfaces and document dependencies.
- [OpenAI skill packaging](https://developers.openai.com/plugins/build/skills) and
  [portable plugin packaging](https://developers.openai.com/plugins/build/plugins): root
  plugin.json and fixed skills/ discovery; client-specific distribution is separate from
  a portable package. A directory listing is not implied by repository publication.
- [Node.js release schedule](https://github.com/nodejs/Release): runtime support changes;
  this repository targets Node 22/24 and records exact CI rather than promising all Node versions.

## Alternatives reviewed

| Alternative | Appropriate use | Why this small tool still has a scope |
| --- | --- | --- |
| `sha256sum` / `shasum` | Simple checksum creation and verification | No check-status/subject/evidence/retention model |
| [in-toto](https://github.com/in-toto/in-toto) | Supply-chain integrity metadata and verification | A stronger, broader provenance/trust system; this utility intentionally offers only local consistency |
| [skill-eval-harness](https://github.com/adewale/skill-eval-harness) | Paired model evaluations, trace artifacts and runner adapters | This project neither invokes models nor measures skill lift |
| [agent-eval-harness](https://github.com/opendatahub-io/agent-eval-harness) | Model/agent evaluation and analysis workflows | Broader evaluation orchestration; handoff observations are not behavioral eval scores |
| Author's [plugin-package-inspector](https://github.com/Huzaifa-Asif/plugin-package-inspector) | Plugin packaging preflight | This handoff tool does not inspect plugin contents or judge installability |
| Author's [plugin-permission-diff](https://github.com/Huzaifa-Asif/plugin-permission-diff) | Capability changes between plugin revisions | This tool has no permission diff or network/CSP/auth analysis |

The need is narrower than a generic evaluation harness or security scanner. No novelty
claim for hashing, manifests or evidence binding. Original code implements a small
selected-file contract with stale-evidence propagation and portable workflow instructions.

## Architecture and licensing

Use Node built-ins and plain `.mjs` for the local helper: no runtime/dev dependencies,
install lifecycle, credentials, remote server, paid service or model invocation. The CLI
has capture/verify operations only. The library separates bounded file reads, schema
validation, snapshot construction and reports. It never parses evidence content as code.

The repository code, prose, fixtures and diagram assets are newly authored under MIT.
No upstream source, private/company code or third-party fixture content was copied.
Alternative projects are linked for comparison, not vendored; their licenses confer
no license on this project's original code. Third-party names/trademarks remain theirs.
The cover uses an original composition informed by the user's permitted Grafana series
pixels; it contains no Grafana mark or extracted third-party artwork. Public standards
are implemented from documented format requirements, not copied as code.

Node.js source/runtime has its own license; GitHub Actions used by CI have their own
upstream licenses. No CLA, DCO, new terms acceptance or security/authentication change is
part of this repository. A future hosted/marketplace distribution would need a fresh
architecture and permissions review; none is claimed here.
