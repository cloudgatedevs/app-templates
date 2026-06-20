// Static import-graph checker.
// Walks the import graph from src/main.jsx, resolving @/ -> src/ and relative
// imports, and asserts every LOCAL import resolves to an existing file and every
// named import exists as an export in the target file.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const ENTRY = path.join(SRC, 'main.jsx');

const EXTS = ['', '.js', '.jsx', '.ts', '.tsx', '.mjs'];
const errors = [];

function resolveLocal(spec, fromFile) {
  let base;
  if (spec.startsWith('@/')) base = path.join(SRC, spec.slice(2));
  else if (spec.startsWith('./') || spec.startsWith('../')) base = path.resolve(path.dirname(fromFile), spec);
  else return null; // package import — skip
  for (const ext of EXTS) {
    const p = base + ext;
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  }
  for (const ext of EXTS.filter(Boolean)) {
    const p = path.join(base, 'index' + ext);
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  }
  return null;
}

// Collect exported names (named + default + re-exports via export *).
function collectExports(file, seen = new Set()) {
  if (seen.has(file)) return new Set();
  seen.add(file);
  const src = fs.readFileSync(file, 'utf8');
  const names = new Set();
  let m;

  const re1 = /export\s+(?:async\s+)?(?:function|class|const|let|var)\s+([A-Za-z0-9_$]+)/g;
  while ((m = re1.exec(src))) names.add(m[1]);

  const re2 = /export\s*\{([^}]*)\}(?:\s*from\s*['"][^'"]+['"])?/g;
  while ((m = re2.exec(src))) {
    m[1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((piece) => {
        const as = piece.split(/\s+as\s+/);
        names.add((as[1] || as[0]).trim());
      });
  }

  if (/export\s+default/.test(src)) names.add('default');

  // export * from './x' -> pull names recursively
  const re3 = /export\s*\*\s*from\s*['"]([^'"]+)['"]/g;
  while ((m = re3.exec(src))) {
    const target = resolveLocal(m[1], file);
    if (target) for (const n of collectExports(target, seen)) names.add(n);
  }
  return names;
}

function parseImports(src) {
  const out = [];
  // import ... from 'x'
  const re = /import\s+([^;]*?)\s+from\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(src))) {
    out.push({ clause: m[1], spec: m[2] });
  }
  // side-effect imports: import 'x'
  const re2 = /import\s*['"]([^'"]+)['"]/g;
  while ((m = re2.exec(src))) {
    out.push({ clause: '', spec: m[1] });
  }
  return out;
}

function namedFromClause(clause) {
  const names = [];
  const braces = clause.match(/\{([^}]*)\}/);
  if (braces) {
    braces[1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((piece) => {
        const parts = piece.split(/\s+as\s+/);
        names.push(parts[0].trim());
      });
  }
  const defaultMatch = clause.replace(/\{[^}]*\}/, '').replace(/\*\s+as\s+\w+/, '').trim();
  const first = defaultMatch.split(',')[0]?.trim();
  if (first && !first.startsWith('{')) names.push('default');
  return names;
}

const visited = new Set();
function walk(file) {
  if (visited.has(file)) return;
  visited.add(file);
  const src = fs.readFileSync(file, 'utf8');
  for (const { clause, spec } of parseImports(src)) {
    if (spec.startsWith('@/') || spec.startsWith('./') || spec.startsWith('../')) {
      const target = resolveLocal(spec, file);
      if (!target) {
        errors.push(`${path.relative(ROOT, file)}: cannot resolve import '${spec}'`);
        continue;
      }
      // check named exports for code files (skip css/json/assets)
      if (/\.(jsx?|tsx?|mjs)$/.test(target)) {
        const wanted = namedFromClause(clause).filter((n) => n !== 'default');
        if (wanted.length) {
          const exported = collectExports(target);
          for (const n of wanted) {
            if (!exported.has(n)) {
              errors.push(
                `${path.relative(ROOT, file)}: import { ${n} } not exported by ${path.relative(ROOT, target)}`,
              );
            }
          }
        }
        walk(target);
      }
    }
  }
}

walk(ENTRY);

if (errors.length) {
  console.error(`Import-graph check FAILED with ${errors.length} problem(s):`);
  errors.forEach((e) => console.error('  - ' + e));
  process.exit(1);
} else {
  console.log(`Import-graph check PASSED. Visited ${visited.size} local module(s).`);
}
