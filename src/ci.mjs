// Copyright (c) 2026 Huzaifa Asif. MIT licensed.
import { readSelected, parseDocument, timestamp, safeRelative, HandoffError, LIMITS } from './handoff.mjs';

export const CI_LIMITS = Object.freeze({ jobs: 100, requiredJobs: 32, maxAgeSeconds: 86400 });
const statuses = ['queued', 'in_progress', 'completed', 'waiting', 'pending', 'requested'];
const conclusions = ['success', 'failure', 'neutral', 'cancelled', 'skipped', 'timed_out', 'action_required', 'stale', 'startup_failure'];
const ensure = (condition, code) => { if (!condition) throw new HandoffError(code); };
const text = (v, max) => typeof v === 'string' && v.length > 0 && v.length <= max &&
  v.trim().length > 0 && !/[\x00-\x1f\x7f]/.test(v);
const sha = v => typeof v === 'string' && /^[a-f0-9]{40}$/.test(v);
const positive = v => Number.isSafeInteger(v) && v > 0;
const repo = v => text(v, 140) && /^[A-Za-z0-9-]+\/[A-Za-z0-9_.-]+$/.test(v);
const workflow = v => text(v, 160) && /^\.github\/workflows\/[A-Za-z0-9_.-]+\.ya?ml$/.test(v);
function shape(v, keys, code) {
  ensure(v !== null && typeof v === 'object' && !Array.isArray(v) &&
    Object.keys(v).length === keys.length && keys.every(k => Object.hasOwn(v, k)), code);
}
function state(v) { return statuses.includes(v.status) && (v.conclusion === null || conclusions.includes(v.conclusion)); }
function validateObservation(v) {
  shape(v, ['schemaVersion', 'observedAt', 'repository', 'workflow', 'ref', 'event', 'commit',
    'runId', 'attempt', 'status', 'conclusion', 'totalJobs', 'jobs'], 'invalid-ci-observation');
  ensure(v.schemaVersion === 1 && repo(v.repository) && workflow(v.workflow) && text(v.ref, 240) &&
    text(v.event, 64) && sha(v.commit) && positive(v.runId) && positive(v.attempt) && state(v) &&
    Number.isSafeInteger(v.totalJobs) && v.totalJobs >= 0 && v.totalJobs <= CI_LIMITS.jobs &&
    Array.isArray(v.jobs) && v.jobs.length <= CI_LIMITS.jobs, 'invalid-ci-observation');
  timestamp(v.observedAt); const ids = new Set();
  for (const job of v.jobs) {
    shape(job, ['id', 'runId', 'attempt', 'commit', 'name', 'status', 'conclusion'], 'invalid-ci-observation');
    ensure(positive(job.id) && !ids.has(job.id) && positive(job.runId) && positive(job.attempt) &&
      sha(job.commit) && text(job.name, 160) && state(job), 'invalid-ci-observation'); ids.add(job.id);
  }
}

// Saved observations are claims, not authenticated API results or permission to publish.
// This function performs bounded local consistency review only; it never calls GitHub.
export function reviewCI(root, request, at = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')) {
  shape(request, ['schemaVersion', 'repository', 'commit', 'workflow', 'event', 'branch', 'tag',
    'maxAgeSeconds', 'requiredJobs', 'branchFile', 'tagFile'], 'invalid-ci-request');
  ensure(request.schemaVersion === 1 && repo(request.repository) && sha(request.commit) &&
    workflow(request.workflow) && ['push', 'workflow_dispatch'].includes(request.event) &&
    text(request.branch, 240) && text(request.tag, 240) && request.branch !== request.tag &&
    Number.isSafeInteger(request.maxAgeSeconds) && request.maxAgeSeconds > 0 &&
    request.maxAgeSeconds <= CI_LIMITS.maxAgeSeconds && Array.isArray(request.requiredJobs) &&
    request.requiredJobs.length > 0 && request.requiredJobs.length <= CI_LIMITS.requiredJobs &&
    request.requiredJobs.every(n => text(n, 160)) &&
    new Set(request.requiredJobs).size === request.requiredJobs.length, 'invalid-ci-request');
  safeRelative(request.branchFile); safeRelative(request.tagFile);
  ensure(request.branchFile !== request.tagFile, 'duplicate-ci-file'); const now = timestamp(at);
  const observations = [request.branchFile, request.tagFile].map(file => {
    const v = parseDocument(readSelected(root, file, LIMITS.jsonBytes)); validateObservation(v); return v;
  });
  const issues = [];
  const issue = (code, observationIndex, kind = 'observation', index) => {
    const value = { code, kind, observationIndex }; if (index !== undefined) value.index = index; issues.push(value);
  };
  if (observations[0].runId === observations[1].runId) issue('duplicate-ci-run', 1);
  observations.forEach((v, observationIndex) => {
    for (const field of ['repository', 'workflow', 'commit', 'event'])
      if (v[field] !== request[field]) issue('ci-' + field + '-mismatch', observationIndex);
    if (v.ref !== (observationIndex === 0 ? request.branch : request.tag)) issue('ci-ref-mismatch', observationIndex);
    const observed = timestamp(v.observedAt);
    if (observed > now) issue('future-ci-observation', observationIndex);
    if (now - observed >= request.maxAgeSeconds * 1000) issue('expired-ci-observation', observationIndex);
    if (v.status !== 'completed' || v.conclusion !== 'success') issue('ci-run-not-successful', observationIndex);
    if (v.totalJobs !== v.jobs.length) issue('incomplete-ci-jobs', observationIndex);
    v.jobs.forEach((j, index) => {
      if (j.runId !== v.runId || j.attempt !== v.attempt || j.commit !== v.commit)
        issue('ci-job-context-mismatch', observationIndex, 'job', index);
      if (v.status === 'completed' && j.status !== 'completed')
        issue('ci-job-not-completed', observationIndex, 'job', index);
    });
    request.requiredJobs.forEach((name, index) => {
      const matches = v.jobs.filter(j => j.name === name);
      if (matches.length !== 1) issue(matches.length ? 'ambiguous-required-ci-job' : 'missing-required-ci-job', observationIndex, 'required-job', index);
      else if (matches[0].status !== 'completed' || matches[0].conclusion !== 'success')
        issue('required-ci-job-not-successful', observationIndex, 'required-job', index);
    });
  });
  const report = { schemaVersion: 1, outcome: issues.length ? 'attention' : 'consistent',
    observationCount: 2, requiredJobCount: request.requiredJobs.length, issues,
    assurance: 'local-ci-evidence-consistency-only', remoteState: 'not-verified',
    testExecution: 'not-performed', publication: 'not-performed', approval: 'not-granted' };
  ensure(Buffer.byteLength(JSON.stringify(report, null, 2) + '\n') <= LIMITS.jsonBytes, 'size-limit');
  return report;
}
