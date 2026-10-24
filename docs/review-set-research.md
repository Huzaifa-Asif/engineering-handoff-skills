# Required-check set review research — October 25 MYT / October 24 UTC, 2026

## Concrete need

In v0.2.0, `observe-finish` creates one manifest per check. `verify` reports whether
one manifest is locally consistent, including any recorded coverage. It has no recipient
requirements input and cannot tell whether a second expected check is missing across
otherwise consistent manifests. Naive JSON merging can replace statuses/bindings or
hide incompatible source snapshots. The repository has no external adoption or issue
evidence for this feature; this is a demonstrated local workflow gap, not a popularity claim.

## Alternatives and architecture

- [in-toto getting started](https://in-toto.io/docs/getting-started/) describes layouts,
  authorized functionaries, signed links and artifact rules. It is the stronger fit when
  supply-chain policy, authenticated identities and enforced steps are needed. Its
  [Apache-2.0 license](https://github.com/in-toto/in-toto/blob/develop/LICENSE) was checked;
  no in-toto code or documentation is copied or vendored here. Rule-based verification
  and multi-step evidence are established concepts, not novel claims of this project.
- Independent calls to the existing verifier remain appropriate for unrelated manifests.
  This tool adds a shared root/identity vocabulary, exact conflict checks and an explicit
  required-pair list when those records belong to one recipient's handoff. It never
  manufactures a merged observation or a common capture timestamp.
- [Agent Skills](https://agentskills.io/specification) defines named skill directories
  with YAML frontmatter and Markdown, plus optional supporting resources. A focused
  `review-required-checks` skill guides selection, honest outcomes and permission boundaries.
- Current [OpenAI plugin packaging](https://developers.openai.com/plugins/build/plugins)
  supports portable root `plugin.json` and `skills/`, with optional MCP servers and
  OpenAI extensions. The existing root layout is retained; no MCP server, hook,
  registered mapping, client installation or public-directory submission is needed or claimed.

The original implementation, synthetic fixtures, prose and artwork are MIT licensed.
No new third-party dependency, paid service, company code or infrastructure is used.
This feature checks saved handoff records; it does not replay plugin tool traces or audit
stream sequence/lifecycle protocols, so today's apps/npm programs remain separate.

## Chosen boundary

Read only explicitly selected bounded manifests and artifacts in one stable trusted root.
Count repeated reads/entries; preserve non-passed statuses, expiry and stale evidence.
Report fixed codes and indices rather than private paths/log text. Requirements remain
self-selected and may be incomplete; records can be forged. Nothing proves a check ran,
infers dependency coverage, verifies remote publication or approves release. The exact
schemas, bounds, conflict semantics and failure handling are in [review-set.md](review-set.md).
