// Copyright (c) 2026 Huzaifa Asif. MIT licensed.
import { capture, validateManifest, readSelected, parseDocument, timestamp,
  safeRelative, HandoffError, LIMITS } from './handoff.mjs';

const statuses = ['passed', 'failed', 'blocked', 'not-run'];
const nowUTC = () => new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
function ensure(condition, code) { if (!condition) throw new HandoffError(code); }
function shape(value, required, optional = []) {
  ensure(value !== null && typeof value === 'object' && !Array.isArray(value) &&
    required.every(k => Object.hasOwn(value, k)) &&
    Object.keys(value).every(k => [...required, ...optional].includes(k)), 'invalid-observation');
}
function id(value) { ensure(typeof value === 'string' && /^[a-z][a-z0-9-]{0,63}$/.test(value), 'invalid-observation-id'); }
function bounded(value) {
  ensure(Buffer.byteLength(JSON.stringify(value, null, 2) + '\n') <= LIMITS.jsonBytes, 'size-limit');
  return value;
}

// This records selected bytes, never a command. Check execution stays outside the tool.
export function startObservation(root, request, at = nowUTC()) {
  shape(request, ['schemaVersion', 'checkId', 'subjects', 'expiresAt']);
  ensure(request.schemaVersion === 1, 'unsupported-version'); id(request.checkId);
  ensure(timestamp(request.expiresAt) > timestamp(at), 'observation-expired');
  ensure(Array.isArray(request.subjects) && request.subjects.length > 0 &&
    request.subjects.length <= LIMITS.artifacts, 'invalid-observation');
  const artifacts = request.subjects.map(subject => {
    shape(subject, ['id', 'path']); return { ...subject, role: 'deliverable' };
  });
  const snapshot = capture(root, { schemaVersion: 1, artifacts, checks: [] }, at);
  return bounded({ schemaVersion: 1, kind: 'check-observation', checkId: request.checkId,
    expiresAt: request.expiresAt, snapshot });
}

export function finishObservation(root, request, at = nowUTC()) {
  shape(request, ['schemaVersion', 'sessionFile', 'status'], ['evidence']);
  ensure(request.schemaVersion === 1, 'unsupported-version');
  ensure(statuses.includes(request.status), 'invalid-observation-status');
  ensure(request.status !== 'passed' || request.evidence !== undefined, 'passed-without-evidence');
  const session = parseDocument(readSelected(root, request.sessionFile, LIMITS.jsonBytes));
  shape(session, ['schemaVersion', 'kind', 'checkId', 'expiresAt', 'snapshot']);
  ensure(session.schemaVersion === 1 && session.kind === 'check-observation', 'invalid-observation');
  id(session.checkId); validateManifest(session.snapshot);
  ensure(session.snapshot.checks.length === 0 &&
    session.snapshot.artifacts.every(a => a.role === 'deliverable' && a.expiresAt === undefined), 'invalid-observation');
  const start = timestamp(session.snapshot.capturedAt); const end = timestamp(at);
  ensure(timestamp(session.expiresAt) > start, 'invalid-observation');
  ensure(end >= start, 'future-capture');
  ensure(end < timestamp(session.expiresAt), 'observation-expired');
  const subjects = session.snapshot.artifacts;
  // The snapshot itself must not be a selected subject or evidence path.
  ensure(subjects.every(a => a.path !== request.sessionFile), 'observation-path-collision');
  const artifacts = subjects.map(({ id, path, role }) => ({ id, path, role }));
  if (request.evidence !== undefined) {
    shape(request.evidence, ['id', 'path'], ['expiresAt']); id(request.evidence.id);
    safeRelative(request.evidence.path);
    ensure(artifacts.length < LIMITS.artifacts, 'size-limit');
    ensure(subjects.every(a => a.id !== request.evidence.id && a.path !== request.evidence.path) &&
      request.evidence.path !== request.sessionFile, 'observation-path-collision');
    if (request.evidence.expiresAt !== undefined)
      ensure(timestamp(request.evidence.expiresAt) > end, 'expired-artifact');
  }
  if (request.evidence !== undefined) {
    artifacts.push({ ...request.evidence, role: 'evidence' });
  }
  const check = { id: session.checkId, status: request.status,
    subjects: subjects.map(a => a.id), subjectDigests: Object.fromEntries(subjects.map(a => [a.id, a.sha256])) };
  if (request.evidence !== undefined) check.evidence = request.evidence.id;
  // One bounded capture hashes the final subjects and evidence together. Return that
  // exact manifest so later capture cannot silently replace the observed log bytes.
  const manifest = capture(root, { schemaVersion: 1, artifacts, checks: [check] }, at);
  const issues = [];
  subjects.forEach((subject, index) => {
    const actual = manifest.artifacts[index];
    if (subject.sha256 !== actual.sha256 || subject.sizeBytes !== actual.sizeBytes)
      issues.push({ code: 'subject-changed-during-observation', kind: 'artifact', index });
  });
  const intervalChanged = issues.length > 0;
  if (request.status !== 'passed') issues.push({ code: 'check-' + request.status, kind: 'check', index: 0 });
  return bounded({ report: { schemaVersion: 1, outcome: issues.length ? 'attention' : 'recorded',
    declaredStatus: request.status, issues, assurance: 'self-reported-observation-only',
    testExecution: 'not-performed', remoteState: 'not-verified' },
  manifest: intervalChanged ? null : manifest });
}
