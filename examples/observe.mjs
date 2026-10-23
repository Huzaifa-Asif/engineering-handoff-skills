// A real, known synthetic check is executed outside the observation helper.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { startObservation, finishObservation } from '../src/observation.mjs';
import { verify } from '../src/handoff.mjs';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'handoff-observe-example-'));
try {
  const source = 'export const total = (subtotal, tax) => subtotal + tax;\n';
  const tests = "import {total} from './calculator.mjs'; import assert from 'node:assert/strict';\n" +
    "import test from 'node:test'; test('total', () => assert.equal(total(20, 3), 23));\n";
  fs.writeFileSync(path.join(root, 'calculator.mjs'), source, { flag: 'wx' });
  fs.writeFileSync(path.join(root, 'calculator.test.mjs'), tests, { flag: 'wx' });
  const expiresAt = new Date(Date.now() + 600000).toISOString().replace(/\.\d{3}Z$/, 'Z');
  const session = startObservation(root, { schemaVersion: 1, checkId: 'calculator-tests', expiresAt,
    subjects: [{ id: 'source', path: 'calculator.mjs' }, { id: 'tests', path: 'calculator.test.mjs' }] });
  fs.writeFileSync(path.join(root, 'session.json'), JSON.stringify(session), { flag: 'wx' });
  // Only the known code above runs. Selected logs/requests cannot supply this command.
  const run = spawnSync(process.execPath, ['--test', '--test-reporter=tap', 'calculator.test.mjs'],
    { cwd: root, encoding: 'utf8', timeout: 10000, maxBuffer: 1024 * 1024 });
  assert.equal(run.status, 0, 'Synthetic calculator check did not pass');
  fs.writeFileSync(path.join(root, 'test-evidence.txt'),
    `Node ${process.version}\nObservedAt: ${new Date().toISOString()}\n` +
    `Command: node --test --test-reporter=tap calculator.test.mjs\nExit: ${run.status}\n${run.stdout}`,
    { flag: 'wx' });
  const request = { schemaVersion: 1, sessionFile: 'session.json', status: 'passed',
    evidence: { id: 'check-log', path: 'test-evidence.txt' } };
  const result = finishObservation(root, request);
  assert.equal(result.report.outcome, 'recorded');
  fs.writeFileSync(path.join(root, 'manifest.json'), JSON.stringify(result.manifest), { flag: 'wx' });
  assert.equal(verify(root, result.manifest).outcome, 'consistent');
  fs.appendFileSync(path.join(root, 'calculator.mjs'), '// Changed after the check.\n');
  assert.equal(finishObservation(root, request).manifest, null);
  assert(verify(root, result.manifest).issues.some(i => i.code === 'stale-evidence'));
  console.log('Observation example passed: actual toy check, byte bindings, finish manifest and drift detection.');
} finally { fs.rmSync(root, { recursive: true, force: true }); }
