# Security

Version 0.1.x is the current supported line. This utility checks local byte consistency;
it is not a security approval, sandbox, secret scanner or attestation verifier. Use it
on a trusted stable filesystem and review selected data before sharing.

For a vulnerability, use GitHub's private vulnerability reporting interface if enabled.
If unavailable, contact the maintainer through an available private GitHub contact and
send only a synthetic summary until a private route is agreed. Do not publish credentials,
private files or active exploit details in an issue. No response SLA is promised.

Reports should name the affected version, expected/actual behavior and a minimal
reproduction. A manifest/log pair can be forged together by its author; that documented
trust limit is not a claim of authenticity. Unexpected file access, code execution or
input reflection would violate the intended boundary and merits investigation.
