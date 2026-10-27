#!/usr/bin/env node
// Copyright (c) 2026 Huzaifa Asif. MIT licensed.
import { capture, verify, readSelected, parseDocument, HandoffError, LIMITS } from '../src/handoff.mjs';
import { startObservation, finishObservation } from '../src/observation.mjs';
import { reviewSet } from '../src/review-set.mjs';
import { verifyTransfer } from '../src/transfer.mjs';
import { reviewCI } from '../src/ci.mjs';

const [command, root, documentPath, ...rest] = process.argv.slice(2);
try {
  if (!['capture', 'verify', 'observe-start', 'observe-finish', 'review-set', 'verify-transfer', 'review-ci'].includes(command) || !root || !documentPath ||
    !(rest.length === 0 || (rest.length === 2 && rest[0] === '--at'))) throw new HandoffError('usage');
  const doc = parseDocument(readSelected(root, documentPath, LIMITS.jsonBytes));
  const operations = { capture, verify, 'observe-start': startObservation, 'observe-finish': finishObservation,
    'review-set': reviewSet, 'verify-transfer': verifyTransfer, 'review-ci': reviewCI };
  const result = operations[command](root, doc, rest[1]);
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  process.exitCode = (['verify', 'review-set', 'verify-transfer', 'review-ci'].includes(command) && result.outcome === 'attention') ||
    (command === 'observe-finish' && result.report.outcome === 'attention') ? 2 : 0;
} catch (error) {
  // Never reflect file paths, JSON values, parser excerpts or OS error messages.
  process.stderr.write(JSON.stringify({ error: error instanceof HandoffError ? error.code : 'operation-failed' }) + '\n');
  process.exitCode = 1;
}
