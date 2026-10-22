// Copyright (c) 2026 Huzaifa Asif. MIT licensed.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

export const LIMITS = Object.freeze({ jsonBytes: 262144, artifacts: 100, checks: 100,
  fileBytes: 16 * 1024 * 1024, totalBytes: 64 * 1024 * 1024 });
const ID = /^[a-z][a-z0-9-]{0,63}$/;
const SHA = /^[a-f0-9]{64}$/;
const STATUS = ['passed', 'failed', 'blocked', 'not-run'];
const FORBIDDEN = /^(?:\.env(?:\..*)?|\.git|\.aws|\.ssh|\.npmrc|\.netrc|credentials|auth\.json|id_rsa|id_ed25519)$/i;

export class HandoffError extends Error {
  constructor(code) { super(code); this.name = 'HandoffError'; this.code = code; }
}
function requireThat(condition, code) { if (!condition) throw new HandoffError(code); }
function record(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function shape(value, required, optional = []) {
  requireThat(record(value) && required.every(k => Object.hasOwn(value, k)) &&
    Object.keys(value).every(k => [...required, ...optional].includes(k)), 'invalid-schema');
}
export function timestamp(value) {
  requireThat(typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value), 'invalid-time');
  const ms = Date.parse(value);
  requireThat(Number.isFinite(ms) && new Date(ms).toISOString() === value.replace('Z', '.000Z'), 'invalid-time');
  return ms;
}
export function safeRelative(value) {
  requireThat(typeof value === 'string' && value.length > 0 && value.length <= 240 &&
    !value.includes('\\') && !value.includes(':') && !/[\x00-\x1f\x7f]/.test(value) &&
    !path.posix.isAbsolute(value), 'unsafe-path');
  const parts = value.split('/');
  requireThat(parts.every(p => p && p !== '.' && p !== '..' && !FORBIDDEN.test(p)), 'unsafe-path');
  return parts;
}

// Read only selected regular files. No traversal, URL fetching, subprocesses or file writes.
// Component checks are defense in depth, not a sandbox against hostile concurrent renames.
export function readSelected(root, relative, maximum = LIMITS.fileBytes) {
  const parts = safeRelative(relative);
  const base = path.resolve(root);
  requireThat(!fs.lstatSync(base).isSymbolicLink() && fs.statSync(base).isDirectory(), 'invalid-root');
  let current = base;
  for (let i = 0; i < parts.length; i++) {
    current = path.join(current, parts[i]);
    const stat = fs.lstatSync(current);
    requireThat(!stat.isSymbolicLink(), 'symlink-refused');
    requireThat(i === parts.length - 1 ? stat.isFile() : stat.isDirectory(), 'not-regular-file');
  }
  const fd = fs.openSync(current, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW ?? 0));
  try {
    const before = fs.fstatSync(fd);
    requireThat(before.isFile(), 'not-regular-file');
    requireThat(before.size <= maximum, 'size-limit');
    // Bound reads even if another process grows a file after fstat.
    const buffer = Buffer.alloc(Math.min(before.size + 1, maximum + 1));
    let length = 0;
    while (length < buffer.length) {
      const n = fs.readSync(fd, buffer, length, buffer.length - length, null);
      if (n === 0) break;
      length += n;
    }
    const after = fs.fstatSync(fd);
    requireThat(length === before.size && after.size === before.size &&
      after.mtimeMs === before.mtimeMs && after.ctimeMs === before.ctimeMs, 'file-changed-during-read');
    return buffer.subarray(0, length);
  } finally { fs.closeSync(fd); }
}

export function parseDocument(bytes) {
  requireThat(bytes.byteLength <= LIMITS.jsonBytes, 'size-limit');
  try {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    return JSON.parse(text);
  } catch { throw new HandoffError('invalid-json'); }
}
function validate(doc, manifest) {
  shape(doc, ['schemaVersion', 'artifacts', 'checks'], manifest ? ['capturedAt'] : []);
  requireThat(doc.schemaVersion === 1, 'unsupported-version');
  if (manifest) { requireThat(Object.hasOwn(doc, 'capturedAt'), 'invalid-schema'); timestamp(doc.capturedAt); }
  requireThat(Array.isArray(doc.artifacts) && doc.artifacts.length > 0 &&
    doc.artifacts.length <= LIMITS.artifacts && Array.isArray(doc.checks) &&
    doc.checks.length <= LIMITS.checks, 'invalid-schema');
  const byId = new Map(); const paths = new Set(); let size = 0;
  for (const a of doc.artifacts) {
    shape(a, ['id', 'path', 'role', ...(manifest ? ['sha256', 'sizeBytes'] : [])], ['expiresAt']);
    requireThat(typeof a.id === 'string' && ID.test(a.id) && !byId.has(a.id), 'invalid-artifact-id');
    safeRelative(a.path);
    requireThat(!paths.has(a.path), 'duplicate-path'); paths.add(a.path);
    requireThat(['deliverable', 'evidence'].includes(a.role), 'invalid-role');
    if (a.expiresAt !== undefined) timestamp(a.expiresAt);
    if (manifest) {
      requireThat(typeof a.sha256 === 'string' && SHA.test(a.sha256) &&
        Number.isSafeInteger(a.sizeBytes) && a.sizeBytes >= 0 && a.sizeBytes <= LIMITS.fileBytes, 'invalid-digest');
      size += a.sizeBytes; requireThat(size <= LIMITS.totalBytes, 'size-limit');
    }
    byId.set(a.id, a);
  }
  const ids = new Set();
  for (const c of doc.checks) {
    shape(c, ['id', 'status', 'subjects', 'subjectDigests'], ['evidence']);
    requireThat(typeof c.id === 'string' && ID.test(c.id) && !ids.has(c.id), 'invalid-check-id'); ids.add(c.id);
    requireThat(STATUS.includes(c.status) && Array.isArray(c.subjects) && c.subjects.length > 0 &&
      c.subjects.length <= LIMITS.artifacts && new Set(c.subjects).size === c.subjects.length &&
      c.subjects.every(id => typeof id === 'string' && byId.get(id)?.role === 'deliverable'), 'invalid-check');
    requireThat(c.evidence === undefined || (typeof c.evidence === 'string' && byId.get(c.evidence)?.role === 'evidence'), 'invalid-evidence');
    requireThat(c.status !== 'passed' || c.evidence !== undefined, 'passed-without-evidence');
    requireThat(record(c.subjectDigests) && Object.keys(c.subjectDigests).length === c.subjects.length &&
      c.subjects.every(id => Object.hasOwn(c.subjectDigests, id) && typeof c.subjectDigests[id] === 'string' &&
        SHA.test(c.subjectDigests[id])), 'invalid-binding');
  }
  return byId;
}

export function capture(root, plan, at = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')) {
  validate(plan, false); const now = timestamp(at); let total = 0;
  const artifacts = plan.artifacts.map(a => {
    const bytes = readSelected(root, a.path, Math.min(LIMITS.fileBytes, LIMITS.totalBytes - total)); total += bytes.length;
    requireThat(total <= LIMITS.totalBytes, 'size-limit');
    requireThat(a.expiresAt === undefined || timestamp(a.expiresAt) > now, 'expired-artifact');
    return { ...a, sizeBytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') };
  });
  // Bindings must come from the observation, never manufactured at capture time.
  // A stale binding remains stale so verification can report it.
  const result = structuredClone({ schemaVersion: 1, capturedAt: at, artifacts, checks: plan.checks });
  // CLI uses this exact serialization; never emit a document its parser will refuse.
  requireThat(Buffer.byteLength(JSON.stringify(result, null, 2) + '\n') <= LIMITS.jsonBytes, 'size-limit');
  return result;
}

export function verify(root, manifest, at = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')) {
  const byId = validate(manifest, true); const now = timestamp(at);
  requireThat(timestamp(manifest.capturedAt) <= now, 'future-capture');
  let total = 0; const issues = []; const invalid = new Set();
  const issue = (code, kind, index) => issues.push({ code, kind, index });
  manifest.artifacts.forEach((a, index) => {
    if (a.expiresAt !== undefined && timestamp(a.expiresAt) <= now) {
      issue('expired-artifact', 'artifact', index); invalid.add(a.id);
    }
    try {
      const bytes = readSelected(root, a.path, Math.min(LIMITS.fileBytes, LIMITS.totalBytes - total)); total += bytes.length;
      requireThat(total <= LIMITS.totalBytes, 'size-limit');
      if (bytes.length !== a.sizeBytes || createHash('sha256').update(bytes).digest('hex') !== a.sha256) {
        issue('bytes-changed', 'artifact', index); invalid.add(a.id);
      }
    } catch (error) {
      issue(error instanceof HandoffError ? error.code : 'file-unavailable', 'artifact', index); invalid.add(a.id);
    }
  });
  manifest.checks.forEach((c, index) => {
    if (c.status !== 'passed') issue('check-' + c.status, 'check', index);
    if (c.subjects.some(id => c.subjectDigests[id] !== byId.get(id).sha256 || invalid.has(id)) || invalid.has(c.evidence))
      issue('stale-evidence', 'check', index);
  });
  manifest.artifacts.forEach((a, index) => {
    if (a.role === 'deliverable' && !manifest.checks.some(c => c.subjects.includes(a.id)))
      issue('no-recorded-check', 'artifact', index);
  });
  return { schemaVersion: 1, outcome: issues.length ? 'attention' : 'consistent',
    artifactCount: manifest.artifacts.length, recordedCheckCount: manifest.checks.length, issues,
    assurance: 'local-byte-consistency-only', testExecution: 'not-performed', remoteState: 'not-verified' };
}
