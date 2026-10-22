import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
const files = [];
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'dist', 'node_modules', 'coverage'].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    assert(!e.isSymbolicLink(), 'Source symlinks are unsupported');
    if (e.isDirectory()) walk(p); else files.push(p);
  }
}
walk('.');
for (const file of files) {
  if (file.endsWith('.mjs')) {
    const r = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
  }
  if (/\.(?:mjs|md|json|yml)$/.test(file)) {
    const value = fs.readFileSync(file, 'utf8');
    assert(!/[ \t]+$/m.test(value), `${file}: trailing whitespace`);
    assert(value.endsWith('\n'), `${file}: missing final newline`);
    if (file.endsWith('.json')) JSON.parse(value);
  }
}
for (const name of fs.readdirSync('skills')) {
  const text = fs.readFileSync(`skills/${name}/SKILL.md`, 'utf8');
  assert(text.startsWith(`---\nname: ${name}\ndescription: `));
  assert(/\nlicense: MIT\n/.test(text));
  assert(text.split('\n').length < 200);
  for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
    if (!match[1].includes('://')) assert(fs.existsSync(path.resolve('skills', name, match[1])), 'Broken skill reference');
  }
}
const plugin = JSON.parse(fs.readFileSync('plugin.json', 'utf8'));
assert.deepEqual(Object.keys(plugin).sort(), ['$schema', 'name', 'version', 'description', 'author', 'repository', 'license'].sort());
assert.equal(plugin.name, 'engineering-handoff-skills');
assert.equal(plugin.license, 'MIT');
assert.equal(plugin.version, JSON.parse(fs.readFileSync('package.json', 'utf8')).version);
console.log(`Syntax, JSON, whitespace, skill references and local manifest checks passed (${files.length} files).`);
