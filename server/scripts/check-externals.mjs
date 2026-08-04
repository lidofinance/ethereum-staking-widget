// Post-build guard: every bare package the esbuild bundle imports at
// runtime (--packages=external keeps them unbundled) MUST be declared in
// server/package.json dependencies — the api Docker image installs ONLY
// those (`yarn workspaces focus api --production`). A miss surfaces only
// in the pod as ERR_MODULE_NOT_FOUND (that's how tiny-invariant slipped
// through), so fail the build instead.
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('../dist/index.js', import.meta.url), 'utf8');
const deps = Object.keys(
  JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
    .dependencies,
);

const externals = new Set(
  [...src.matchAll(/(?:from|import)\s*"([^"]+)"|require\("([^"]+)"\)/g)]
    .map((m) => m[1] ?? m[2])
    .filter((s) => s && !s.startsWith('node:') && !s.startsWith('.') && /^[@a-z]/.test(s))
    .map((s) => (s.startsWith('@') ? s.split('/').slice(0, 2).join('/') : s.split('/')[0])),
);

const missing = [...externals].filter((p) => !deps.includes(p));
if (missing.length > 0) {
  console.error(
    `check-externals: bundle imports packages missing from server/package.json dependencies: ${missing.join(', ')}`,
  );
  process.exit(1);
}
console.info(`check-externals: ok (${externals.size} external packages, all declared)`);
