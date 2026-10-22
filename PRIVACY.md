# Privacy and retention

The CLI reads only the explicitly selected plan/manifest and its listed local files.
It performs no network calls, telemetry, authentication, recursive collection, database
storage or automatic deletion. It writes results only to stdout/stderr; the caller owns
any redirection and retention. Temporary test/example directories are synthetic and are
removed by their own runners.

Verification output contains fixed codes, counts and zero-based indices. Capture output
contains file paths, hashes and supplied metadata: review it before sharing. Artifact
contents are not scanned or redacted. A name guard blocks common secret/configuration
paths but cannot recognize all sensitive files. Hashes of low-entropy content can leak
information through guessing. Use a minimal manually reviewed evidence summary instead
of raw logs, and never include credentials or private account/session material.

`expiresAt` is an explicit review boundary, not automatic deletion or a guaranteed
organizational retention policy. At expiry the tool flags attention and leaves files
intact. Remove files only within separately authorized scope. GitHub and any agent client
used to access this repository have their own privacy practices.
