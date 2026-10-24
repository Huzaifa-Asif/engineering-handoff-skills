// Copyright (c) 2026 Huzaifa Asif. MIT licensed.
import { validateManifest, verify, readSelected, parseDocument, timestamp,
  safeRelative, HandoffError, LIMITS } from './handoff.mjs';

export const SET_LIMITS = Object.freeze({ manifests: 16, controlBytes: 1024 * 1024,
  artifactEntries: 100, checkEntries: 100, requiredPairs: 100 });
const id = value => typeof value === 'string' && /^[a-z][a-z0-9-]{0,63}$/.test(value);
const ensure = (condition, code) => { if (!condition) throw new HandoffError(code); };
function shape(value, keys) {
  ensure(value !== null && typeof value === 'object' && !Array.isArray(value) &&
    Object.keys(value).length === keys.length && keys.every(k => Object.hasOwn(value, k)), 'invalid-review-set');
}
const artifactKey = a => JSON.stringify([a.path, a.role, a.sha256, a.sizeBytes, a.expiresAt ?? null]);
const checkKey = c => JSON.stringify([c.status, c.evidence ?? null,
  [...c.subjects].sort().map(s => [s, c.subjectDigests[s]])]);

// Review separate records as records: never manufacture a merged capture timestamp,
// replace a recorded binding, upgrade status or execute artifact contents.
export function reviewSet(root, request, at = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')) {
  shape(request, ['schemaVersion', 'manifestFiles', 'requirements']);
  ensure(request.schemaVersion === 1, 'unsupported-version');
  const now = timestamp(at);
  ensure(Array.isArray(request.manifestFiles) && request.manifestFiles.length > 0 &&
    request.manifestFiles.length <= SET_LIMITS.manifests &&
    new Set(request.manifestFiles).size === request.manifestFiles.length, 'invalid-review-set');
  request.manifestFiles.forEach(safeRelative);
  ensure(Array.isArray(request.requirements) && request.requirements.length > 0 &&
    request.requirements.length <= SET_LIMITS.requiredPairs, 'invalid-review-set');
  const requiredSubjects = new Set(); let pairs = 0;
  for (const r of request.requirements) {
    shape(r, ['subjectId', 'checkIds']);
    ensure(id(r.subjectId) && !requiredSubjects.has(r.subjectId) && Array.isArray(r.checkIds) &&
      r.checkIds.length > 0 && r.checkIds.every(id) &&
      new Set(r.checkIds).size === r.checkIds.length, 'invalid-requirement');
    requiredSubjects.add(r.subjectId); pairs += r.checkIds.length;
    ensure(pairs <= SET_LIMITS.requiredPairs, 'size-limit');
  }
  let controlBytes = 0, artifactEntries = 0, checkEntries = 0, artifactBytes = 0;
  // Validate every control document and enforce aggregate bounds before reading any
  // artifact bytes. Repeated artifact entries count again: verification reads again.
  const manifests = request.manifestFiles.map(file => {
    const bytes = readSelected(root, file, Math.min(LIMITS.jsonBytes, SET_LIMITS.controlBytes - controlBytes));
    controlBytes += bytes.length;
    const manifest = parseDocument(bytes); validateManifest(manifest);
    ensure(timestamp(manifest.capturedAt) <= now, 'future-capture');
    artifactEntries += manifest.artifacts.length; checkEntries += manifest.checks.length;
    artifactBytes += manifest.artifacts.reduce((sum, a) => sum + a.sizeBytes, 0);
    ensure(artifactEntries <= SET_LIMITS.artifactEntries && checkEntries <= SET_LIMITS.checkEntries &&
      artifactBytes <= LIMITS.totalBytes, 'size-limit');
    return manifest;
  });
  const issues = [], artifacts = new Map(), paths = new Map(), checks = new Map();
  manifests.forEach((m, manifestIndex) => {
    m.artifacts.forEach((a, index) => {
      const old = artifacts.get(a.id);
      if (old && artifactKey(old) !== artifactKey(a))
        issues.push({ code: 'conflicting-artifact', kind: 'artifact', manifestIndex, index });
      if (paths.has(a.path) && paths.get(a.path) !== a.id)
        issues.push({ code: 'conflicting-path-identity', kind: 'artifact', manifestIndex, index });
      if (!old) artifacts.set(a.id, a);
      if (!paths.has(a.path)) paths.set(a.path, a.id);
    });
    m.checks.forEach((c, index) => {
      if (checks.has(c.id) && checkKey(checks.get(c.id)) !== checkKey(c))
        issues.push({ code: 'conflicting-check', kind: 'check', manifestIndex, index });
      if (!checks.has(c.id)) checks.set(c.id, c);
    });
  });
  // Selected manifests cannot also be artifacts in another selected record.
  ensure(!manifests.some(m => m.artifacts.some(a => request.manifestFiles.includes(a.path))), 'review-set-path-collision');
  const budget = { remaining: LIMITS.totalBytes };
  manifests.forEach((m, manifestIndex) => {
    for (const issue of verify(root, m, at, budget).issues) issues.push({ ...issue, manifestIndex });
  });
  request.requirements.forEach((r, index) => {
    if (artifacts.get(r.subjectId)?.role !== 'deliverable')
      issues.push({ code: 'required-subject-missing', kind: 'requirement', index });
    r.checkIds.forEach((checkId, checkIndex) => {
      const c = checks.get(checkId);
      const code = !c ? 'required-check-missing' : !c.subjects.includes(r.subjectId)
        ? 'required-subject-uncovered' : c.status !== 'passed' ? 'required-check-not-passed' : null;
      if (code) issues.push({ code, kind: 'requirement', index, checkIndex });
    });
  });
  const result = { schemaVersion: 1, outcome: issues.length ? 'attention' : 'consistent',
    manifestCount: manifests.length, artifactEntryCount: artifactEntries, checkEntryCount: checkEntries,
    requiredPairCount: pairs, issues, assurance: 'local-set-consistency-only',
    testExecution: 'not-performed', remoteState: 'not-verified' };
  ensure(Buffer.byteLength(JSON.stringify(result, null, 2) + '\n') <= LIMITS.jsonBytes, 'size-limit');
  return result;
}
