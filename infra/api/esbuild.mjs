import esbuild from 'esbuild';
import { rm, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const outFile = resolve('infra/api/dist/server.cjs');
await rm(dirname(outFile), { recursive: true, force: true });
await mkdir(dirname(outFile), { recursive: true });

await esbuild.build({
  entryPoints: ['infra/api/server.ts'],
  outfile: outFile,
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: ['node20'],
  sourcemap: true,
  logLevel: 'info'
});
