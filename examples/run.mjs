// Run a complete synthetic handoff without writing inside the checkout.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { capture, verify } from '../src/handoff.mjs';
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'handoff-example-'));
try {
  fs.cpSync(fileURLToPath(new URL('./basic/', import.meta.url)), root, { recursive: true });
  const plan = JSON.parse(fs.readFileSync(path.join(root, 'plan.json'), 'utf8'));
  const manifest = capture(root, plan, '2026-10-22T22:00:00Z');
  assert.equal(verify(root, manifest, '2026-10-22T22:00:00Z').outcome, 'consistent');
  fs.appendFileSync(path.join(root, 'source.txt'), '\nChanged after observation.');
  const result = verify(root, manifest, '2026-10-22T22:00:00Z');
  assert.equal(result.outcome, 'attention');
  assert(result.issues.some(i => i.code === 'stale-evidence'));
  console.log('Example passed: consistent handoff, then changed bytes and stale evidence.');
} finally { fs.rmSync(root, { recursive: true, force: true }); }
