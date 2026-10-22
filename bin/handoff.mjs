#!/usr/bin/env node
// Copyright (c) 2026 Huzaifa Asif. MIT licensed.
import { capture, verify, readSelected, parseDocument, HandoffError, LIMITS } from '../src/handoff.mjs';

const [command, root, documentPath, ...rest] = process.argv.slice(2);
try {
  if (!['capture', 'verify'].includes(command) || !root || !documentPath ||
    !(rest.length === 0 || (rest.length === 2 && rest[0] === '--at'))) throw new HandoffError('usage');
  const doc = parseDocument(readSelected(root, documentPath, LIMITS.jsonBytes));
  const result = command === 'capture' ? capture(root, doc, rest[1]) : verify(root, doc, rest[1]);
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  process.exitCode = command === 'verify' && result.outcome === 'attention' ? 2 : 0;
} catch (error) {
  // Never reflect file paths, JSON values, parser excerpts or OS error messages.
  process.stderr.write(JSON.stringify({ error: error instanceof HandoffError ? error.code : 'operation-failed' }) + '\n');
  process.exitCode = 1;
}
