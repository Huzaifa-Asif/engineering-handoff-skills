# Recipient-set composition — October 27 MYT / October 26 UTC, 2026

## Concrete unfinished workflow

The v0.4.0 receiving guide explicitly documents that transfer verification accepts one
manifest and does not compose mapped-set requirements. A synthetic reproduction saved
two independent check manifests, moved identical source/log bytes to renamed recipient
paths and ran set review: original paths were unavailable; adding placements was rejected
as invalid-review-set. Separate single-transfer reports cannot establish that every
required check exists or reconcile conflicting original records across the set.

The original extension adds one optional placements field to the existing review-set
request. It reuses transfer schema validation and preserves set reconciliation before
recipient-path substitution. This closes the documented composition gap without a new
repository, command, skill or npm package. No external demand/adoption claim is made.

## Alternatives and current architecture

- Preserve the sender's relative layout and use existing set review. Prefer this when
  relocation is unnecessary; it remains fully supported.
- Review each transfer separately and manually reconcile requirements/conflicts. This
  works for small tasks, but splits one recipient question across records and manual
  coverage checks. Editing/merging manifests or recapturing old logs is not a substitute.
- [in-toto layouts, signed links and artifact rules](https://in-toto.io/docs/getting-started/)
  address broader authenticated supply-chain policy. Its
  [Apache-2.0 license](https://github.com/in-toto/in-toto/blob/develop/LICENSE) was inspected;
  no implementation/prose is copied or vendored. Multi-record policy and checksum
  verification are established; no protocol novelty or superiority is claimed here.
- [Agent Skills](https://agentskills.io/specification) supports focused named workflows
  in SKILL.md directories. The existing required-check skill gains this recipient mode
  instead of adding another overlapping discovery entry.
- Current [OpenAI portable plugin packaging](https://developers.openai.com/plugins/build/plugins)
  uses root plugin.json and skills/ discovery. This architecture is retained with no
  hosted MCP server, hook, authentication mapping or client configuration change.

Original implementation, tests, synthetic fixtures, prose and artwork remain MIT. No
third-party dependency/code/private data, paid resource, legal agreement or installation
is introduced. The work does not inspect MCP catalogs or audit stream error envelopes;
today's apps/npm code, content ownership, unpublished candidates and gates are untouched.

## Chosen assurance boundary

An exhaustive map covers the union of selected artifact IDs, including every evidence
file, once. Original conflicts and required gaps stay findings. The map changes only
bounded read targets; it does not create a new capture time or observation. All repeated
reads share one charged budget, including failed/racing reads. Reports keep fixed codes
and original indices, without private values. A consistent mapped set cannot show that
path-dependent code runs in the recipient layout, authenticate records/mappings or verify
remote state. See [the exact mode contract](review-set.md#recipient-placements).
