# Recipient placement research — October 26 MYT / October 25 UTC, 2026

## Demonstrated need

The v0.3.0 verifier reads each saved artifact's original relative path. A synthetic
reproduction captured a source/log pair, copied identical bytes into a receiver's
`payload/` directory under new names and verified the original manifest there. The
original layout was consistent; the recipient reported both files unavailable and stale
evidence. The recipient needs either the original layout or an explicit interpretation
of original IDs at the new paths. Rewriting the saved manifest or recapturing an old log
obscures the original record; filename guessing can select the wrong bytes.

There is no external adoption/demand claim or current issue/PR feedback. The evidence
is the actual existing API and a repeatable local gap. Existing maintenance was clear.

## Alternatives, architecture and license

- Preserve the sender's relative layout and use ordinary verification. This remains the
  simplest option when intentional relocation is unnecessary.
- [BagIt, RFC 8493](https://www.rfc-editor.org/info/rfc8493/) defines structured payload
  transfer and complete filename/checksum manifests. It is a broader established fit
  for packaging arbitrary payloads. This feature is not BagIt parsing/conversion or
  interoperability, and no RFC prose/code is copied. Checksums/transfer verification
  are established; no mechanism-novelty or superiority claim is made.
- Basic checksum utilities remain useful for byte comparisons when no check-status,
  subject-binding or retention contract is needed. This integration preserves that
  existing richer contract while using a recipient-selected exhaustive placement map.
- [Agent Skills specification](https://agentskills.io/specification) still supports
  named SKILL.md directories with YAML metadata/instructions. Extend the existing
  receiving skill rather than add a redundant top-level skill for one mode.
- Current [OpenAI plugin packaging](https://developers.openai.com/plugins/build/plugins)
  supports root plugin.json and fixed skills/ discovery. That portable architecture is
  retained without a hosted MCP server, hook, account mapping or installation change.

New implementation, synthetic fixtures, docs and artwork are original MIT material.
No dependency or third-party source/fixtures are copied or vendored. The RFC is a format
reference, not a license imported into this code. No legal/CLA/DCO acceptance is required.
This work is distinct from Plugin Widget Readiness Lab and abort-settlement-audit: it
verifies saved local handoff placements, not widget host contracts or abortable streams.

## Assurance

Only explicitly selected bounded recipient paths are read. The original saved manifest
is unchanged, with exact digests/bindings/statuses/capture time/expiry. No new observation
is created. The report cannot authenticate a sender/mapping or prove transport without
a trusted manifest. Changed layouts may break imports even when all bytes match; the
old check is not a new recipient-environment pass. See [transfers.md](transfers.md) for
strict schemas, indices, error/privacy/retention behavior and supported limits.
