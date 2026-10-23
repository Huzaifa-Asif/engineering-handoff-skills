# Observation workflow research — 2026-10-24 MYT

Evidence is local and concrete: v0.1.1's preparation skill requires users to compute
before/after file hashes and transcribe `subjectDigests` by hand. Its capture command
correctly preserves old bindings but cannot create a new observation interval. The new
workflow automates that bookkeeping and captures final evidence bytes without adding
command execution, signing or a new repository. No open repository issue/PR was available
on 2026-10-23 UTC. This is author workflow evidence, not external adoption or market proof.

## Alternatives and scope

- [in-toto getting started](https://in-toto.io/docs/getting-started/) describes both
  command-running steps and split `in-toto-record start/stop` operations. It already
  records materials/products and offers signed link/layout verification. Use it when
  supply-chain trust or attestations are required. The before/after mechanism is not new.
- [in-toto Link predicate](https://github.com/in-toto/attestation/blob/main/spec/predicates/link.md)
  models a step, its materials/products, optional command and byproducts. This project
  does not implement that format or claim equivalent trust.
- [SLSA provenance v1.2](https://slsa.dev/spec/v1.2/build-provenance) records build-definition
  inputs and resolved dependencies. Use a trusted builder/provenance system when the
  producer identity or execution history must be verified.
- Ordinary `shasum`/`sha256sum` with scripts can automate hashes. This original helper
  instead integrates selected-file bounds, interval drift, honest status handling,
  exact evidence snapshotting, session expiry and existing handoff v1 manifests.

These sources were consulted on 2026-10-23 UTC. No upstream implementation was copied
or vendored. The helper/skill/tests/docs are original MIT work. in-toto/SLSA are linked
as alternatives, not imported dependencies; no signing keys, legal terms, CLA/DCO or
authentication changes are required. The runtime remains Node built-ins only.

## Current architecture

The [Agent Skills specification](https://agentskills.io/specification) and current
[OpenAI plugin packaging guide](https://developers.openai.com/plugins/build/plugins)
continue to support SKILL.md directories and a portable root plugin manifest with fixed
skills discovery. The new skill retains the full-checkout requirement and readable
environment guidance, avoiding the earlier optional-field validator mismatch. No MCP
server, hook, client installation, marketplace submission or directory acceptance is added.

`src/observation.mjs` reuses the existing schema/time/path/size/capture contract. Start
records explicit subjects; finish compares their final hashes and returns a captured
manifest only when they match. A selected log is never interpreted. The CLI accepts no
command string. Known synthetic test execution lives only in the example/test runners.
This does not duplicate today's MCP Event Contract Lab, npm stream-part-lifecycle,
Stream Usage Reconciler or MCP Subscription Sentinel.

Limit: an author can forge sessions/status/logs, restore modified bytes before finish,
omit dependencies or change the runtime environment. The workflow removes manual hash
transcription; it does not create execution proof or a security approval.
