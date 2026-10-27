// Explicitly synthetic saved CI metadata. No GitHub access or real publication.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { reviewCI } from '../src/ci.mjs';
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'handoff-ci-example-'));
const at = '2026-10-27T21:01:00Z';
const request = { schemaVersion: 1, repository: 'example/project', commit: 'a'.repeat(40),
  workflow: '.github/workflows/ci.yml', event: 'push', branch: 'main', tag: 'v1.0.0',
  maxAgeSeconds: 3600, requiredJobs: ['unit (22)', 'unit (24)'], branchFile: 'branch.json', tagFile: 'tag.json' };
const observations = [request.branch, request.tag].map((ref, i) => ({ schemaVersion: 1,
  observedAt: '2026-10-27T21:00:00Z', repository: request.repository, workflow: request.workflow,
  ref, event: request.event, commit: request.commit, runId: i + 1, attempt: 1,
  status: 'completed', conclusion: 'success', totalJobs: 2,
  jobs: request.requiredJobs.map((name, j) => ({ id: 10 + i * 2 + j, runId: i + 1,
    attempt: 1, commit: request.commit, name, status: 'completed', conclusion: 'success' })) }));
const save = () => observations.forEach((v, i) => fs.writeFileSync(path.join(root, i ? 'tag.json' : 'branch.json'), JSON.stringify(v)));
try {
  fs.writeFileSync(path.join(root, 'request.json'), JSON.stringify(request));
  // The counter represents a synthetic follow-up, not permission to perform a release.
  let syntheticFollowUps = 0;
  const guardedFollowUp = () => {
    const report = reviewCI(root, request, at);
    if (report.outcome !== 'consistent') return false;
    syntheticFollowUps++; return true;
  };
  observations[1].status = 'in_progress'; observations[1].conclusion = null; save();
  assert.equal(guardedFollowUp(), false); assert.equal(syntheticFollowUps, 0);
  fs.writeFileSync(path.join(root, 'tag.json'), '{malformed');
  assert.throws(guardedFollowUp); assert.equal(syntheticFollowUps, 0);
  observations[1].status = 'completed'; observations[1].conclusion = 'success'; save();
  assert.equal(guardedFollowUp(), true); assert.equal(syntheticFollowUps, 1);
  assert.equal(reviewCI(root, request, at).approval, 'not-granted');
  observations[1].jobs[0].attempt = 2; save();
  assert(reviewCI(root, request, at).issues.some(i => i.code === 'ci-job-context-mismatch'));
  assert(reviewCI(root, request, '2026-10-27T22:00:00Z').issues.some(i => i.code === 'expired-ci-observation'));
  assert(fs.existsSync(path.join(root, 'tag.json')));
  console.log('Synthetic CI example passed: pending/invalid stop the dependent step, matching claims proceed, mixed attempts and expiry remain attention. No remote verification or publication performed.');
} finally { fs.rmSync(root, { recursive: true, force: true }); }
