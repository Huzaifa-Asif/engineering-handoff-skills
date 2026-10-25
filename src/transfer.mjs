// Copyright (c) 2026 Huzaifa Asif. MIT licensed.
import { validateManifest, verify, readSelected, parseDocument, safeRelative,
  HandoffError, LIMITS } from './handoff.mjs';

const ensure = (condition, code) => { if (!condition) throw new HandoffError(code); };
function shape(value, keys) {
  ensure(value !== null && typeof value === 'object' && !Array.isArray(value) &&
    Object.keys(value).length === keys.length && keys.every(k => Object.hasOwn(value, k)), 'invalid-transfer');
}

// Interpret only explicit recipient placements. Never rewrite the saved manifest,
// recapture bytes, discover alternatives or substitute new observation bindings.
export function verifyTransfer(root, request, at) {
  shape(request, ['schemaVersion', 'manifestFile', 'placements']);
  ensure(request.schemaVersion === 1, 'unsupported-version');
  safeRelative(request.manifestFile);
  ensure(Array.isArray(request.placements) && request.placements.length > 0 &&
    request.placements.length <= LIMITS.artifacts, 'invalid-placement');
  const selected = new Map(), paths = new Set();
  for (const placement of request.placements) {
    shape(placement, ['artifactId', 'path']); safeRelative(placement.path);
    ensure(typeof placement.artifactId === 'string' && !selected.has(placement.artifactId) &&
      !paths.has(placement.path), 'invalid-placement');
    ensure(placement.path !== request.manifestFile, 'transfer-path-collision');
    selected.set(placement.artifactId, placement.path); paths.add(placement.path);
  }
  const original = parseDocument(readSelected(root, request.manifestFile, LIMITS.jsonBytes));
  const byId = validateManifest(original);
  ensure(selected.size === byId.size && [...selected.keys()].every(id => byId.has(id)), 'incomplete-placement');
  // Keep original artifact order for report indices. All fields except the in-memory
  // path survive unchanged, including original capture time, roles and retention.
  const placed = { ...original, artifacts: original.artifacts.map(a => ({ ...a, path: selected.get(a.id) })) };
  return { ...verify(root, placed, at), assurance: 'local-placement-consistency-only' };
}
