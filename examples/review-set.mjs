// Two real, known synthetic checks, executed outside the read-only review tool.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { startObservation, finishObservation } from '../src/observation.mjs';
import { reviewSet } from '../src/review-set.mjs';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'handoff-set-example-'));
const write = (name, text) => fs.writeFileSync(path.join(root, name), text, { flag: 'wx' });
try {
  write('calculator.mjs', 'export const add = (a, b) => a + b;\n');
  write('calculator.test.mjs', "import {add} from './calculator.mjs'; import assert from 'node:assert/strict';\n" +
    "import test from 'node:test'; test('add', () => assert.equal(add(2, 3), 5));\n");
  for (const [checkId, args] of [['unit-tests', ['--test', '--test-reporter=tap', 'calculator.test.mjs']],
    ['syntax', ['--check', 'calculator.mjs']]]) {
    const session = startObservation(root, { schemaVersion: 1, checkId,
      subjects: [{ id: 'source', path: 'calculator.mjs' },
        ...(checkId === 'unit-tests' ? [{ id: 'tests', path: 'calculator.test.mjs' }] : [])],
      expiresAt: new Date(Date.now() + 600000).toISOString().replace(/\.\d{3}Z$/, 'Z') });
    write(`${checkId}-session.json`, JSON.stringify(session));
    // This command is fixed by the example, never taken from a saved log/request.
    const run = spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8', timeout: 10000, maxBuffer: 1024 * 1024 });
    assert.equal(run.status, 0, 'Known synthetic check failed');
    write(`${checkId}.txt`, `Node: ${process.version}\nCommand: node ${args.join(' ')}\n` +
      `ObservedAt: ${new Date().toISOString()}\nExit: ${run.status}\n${run.stdout}`);
    const result = finishObservation(root, { schemaVersion: 1, sessionFile: `${checkId}-session.json`,
      status: 'passed', evidence: { id: `${checkId}-log`, path: `${checkId}.txt` } });
    assert.equal(result.report.outcome, 'recorded'); write(`${checkId}.json`, JSON.stringify(result.manifest));
  }
  const request = { schemaVersion: 1, manifestFiles: ['unit-tests.json', 'syntax.json'],
    requirements: [{ subjectId: 'source', checkIds: ['unit-tests', 'syntax'] }] };
  write('review.json', JSON.stringify(request));
  assert.equal(reviewSet(root, request).outcome, 'consistent');
  const missing = { ...request, manifestFiles: ['unit-tests.json'] };
  assert(reviewSet(root, missing).issues.some(i => i.code === 'required-check-missing'));
  fs.appendFileSync(path.join(root, 'calculator.mjs'), '// changed after checks\n');
  assert(reviewSet(root, request).issues.some(i => i.code === 'stale-evidence'));
  console.log('Set review example passed: actual unit/syntax checks, required coverage, missing check and stale bytes.');
} finally { fs.rmSync(root, { recursive: true, force: true }); }
