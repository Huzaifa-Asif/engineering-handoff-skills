// Deterministic allowlisted distribution tree; no installs or network.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
const names = ['src', 'bin', 'skills', 'docs', 'examples', 'evaluations', 'test', 'scripts',
  'README.md', 'LICENSE', 'CONTRIBUTING.md', 'CODE_OF_CONDUCT.md', 'SECURITY.md', 'PRIVACY.md',
  'CHANGELOG.md', 'package.json', 'plugin.json'];
const dest = 'dist/engineering-handoff-skills';
fs.rmSync(dest, { recursive: true, force: true }); fs.mkdirSync(dest, { recursive: true });
const entries = [];
function copy(relative) {
  const stat = fs.lstatSync(relative);
  if (stat.isSymbolicLink()) throw new Error('Distribution symlink refused');
  if (stat.isDirectory()) {
    for (const name of fs.readdirSync(relative).sort()) copy(path.join(relative, name));
    return;
  }
  if (!stat.isFile()) throw new Error('Nonregular distribution file');
  const bytes = fs.readFileSync(relative);
  const output = path.join(dest, relative); fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, bytes);
  entries.push({ path: relative.replaceAll(path.sep, '/'), sizeBytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex') });
}
names.forEach(copy);
entries.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
fs.writeFileSync(path.join(dest, 'BUILD-MANIFEST.json'), JSON.stringify({ schemaVersion: 1, entries }, null, 2) + '\n');
console.log(`Built ${entries.length} allowlisted files plus BUILD-MANIFEST.json.`);
