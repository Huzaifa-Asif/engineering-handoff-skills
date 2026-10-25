// Known synthetic check and copying happen outside the read-only transfer verifier.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { startObservation, finishObservation } from '../src/observation.mjs';
import { verifyTransfer } from '../src/transfer.mjs';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'handoff-transfer-example-'));
const sender = path.join(root, 'sender'), receiver = path.join(root, 'receiver');
const save = (base, name, value) => fs.writeFileSync(path.join(base, name), value, { flag: 'wx' });
try {
  fs.mkdirSync(sender); fs.mkdirSync(receiver); fs.mkdirSync(path.join(receiver, 'payload')); fs.mkdirSync(path.join(receiver, 'evidence'));
  save(sender, 'calculator.mjs', 'export const add = (a, b) => a + b;\n');
  save(sender, 'calculator.test.mjs', "import {add} from './calculator.mjs'; import assert from 'node:assert/strict';\n" +
    "import test from 'node:test'; test('add', () => assert.equal(add(2, 3), 5));\n");
  const session = startObservation(sender, { schemaVersion: 1, checkId: 'unit-tests',
    subjects: [{ id: 'source', path: 'calculator.mjs' }, { id: 'tests', path: 'calculator.test.mjs' }],
    expiresAt: new Date(Date.now() + 600000).toISOString().replace(/\.\d{3}Z$/, 'Z') });
  save(sender, 'session.json', JSON.stringify(session));
  const run = spawnSync(process.execPath, ['--test', '--test-reporter=tap', 'calculator.test.mjs'],
    { cwd: sender, encoding: 'utf8', timeout: 10000, maxBuffer: 1024 * 1024 });
  assert.equal(run.status, 0, 'Known synthetic sender check failed');
  save(sender, 'result.txt', `Node: ${process.version}\nCommand: node --test --test-reporter=tap calculator.test.mjs\n` +
    `ObservedAt: ${new Date().toISOString()}\nExit: ${run.status}\n${run.stdout}`);
  const result = finishObservation(sender, { schemaVersion: 1, sessionFile: 'session.json', status: 'passed',
    evidence: { id: 'test-log', path: 'result.txt' } });
  assert.equal(result.report.outcome, 'recorded');
  save(receiver, 'original-manifest.json', JSON.stringify(result.manifest));
  for (const [from, to] of [['calculator.mjs', 'payload/code.mjs'], ['calculator.test.mjs', 'payload/check.mjs'],
    ['result.txt', 'evidence/result.txt']]) fs.copyFileSync(path.join(sender, from), path.join(receiver, to), fs.constants.COPYFILE_EXCL);
  const request = { schemaVersion: 1, manifestFile: 'original-manifest.json', placements: [
    { artifactId: 'source', path: 'payload/code.mjs' }, { artifactId: 'tests', path: 'payload/check.mjs' },
    { artifactId: 'test-log', path: 'evidence/result.txt' }] };
  save(receiver, 'transfer.json', JSON.stringify(request));
  assert.equal(verifyTransfer(receiver, request).outcome, 'consistent');
  // The renamed test still imports calculator.mjs: byte consistency does not mean
  // it runs in this new layout. No recipient execution success is claimed.
  fs.appendFileSync(path.join(receiver, 'payload/code.mjs'), '// changed after receipt\n');
  assert(verifyTransfer(receiver, request).issues.some(i => i.code === 'stale-evidence'));
  assert.throws(() => verifyTransfer(receiver, { ...request, placements: request.placements.slice(0, 2) }), /incomplete-placement/);
  console.log('Transfer example passed: actual sender test, explicit placements, unchanged receipt, drift and missing evidence. Recipient execution not performed.');
} finally { fs.rmSync(root, { recursive: true, force: true }); }
