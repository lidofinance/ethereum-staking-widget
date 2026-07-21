// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { resolve } from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const projectRoot = resolve(__dirname);
const projectAliases = [
  'abi',
  'config',
  'consts',
  'features',
  'modules',
  'networks',
  'providers',
  'scripts',
  'shared',
  'styles',
  'types',
  'utils',
].map((dirName) => ({
  find: dirName,
  replacement: resolve(projectRoot, dirName),
}));

// Same shims the Vite build uses (vite.config.ts) — tests exercising
// `config/*` reach `next/config` etc. through them, so the old
// vitest.setup.ts mock is gone.
const nextShims = ['router', 'link', 'head', 'config', 'dynamic', 'app'].map(
  (mod) => ({
    find: new RegExp(`^next/${mod}(\\.js)?$`),
    replacement: resolve(
      projectRoot,
      'shims',
      `next-${mod}.${mod === 'app' ? 'ts' : 'tsx'}`,
    ),
  }),
);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      ...projectAliases,
      ...nextShims,
      {
        find: /^next$/,
        replacement: resolve(projectRoot, 'shims', 'next-types.ts'),
      },
      {
        find: 'assets',
        replacement: resolve(projectRoot, 'assets'),
      },
      {
        find: 'IPFS.json',
        replacement: resolve(projectRoot, 'IPFS.json'),
      },
      {
        find: 'build-info.json',
        replacement: resolve(projectRoot, 'build-info.json'),
      },
      {
        find: 'env-dynamics.mjs',
        replacement: resolve(projectRoot, 'env-dynamics.mjs'),
      },
    ],
  },
  define: {
    __IPFS_MODE__: JSON.stringify(false),
  },
  test: {
    environment: 'node',
    exclude: ['test/**', 'node_modules/**', 'dist/**', 'server/**'],
    globals: true,
    include: ['**/*.{test,tests,spec}.{ts,tsx,js,jsx}'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text', 'html', 'lcov'],
      // Report only files actually exercised by tests. The suite is sparse, so
      // instrumenting the whole project would drown the summary in 0%-covered
      // files. Pass an explicit path (e.g. `--coverage.all`) for a full sweep.
      all: false,
      exclude: [
        '**/*.{test,tests,spec}.{ts,tsx,js,jsx}',
        '**/__tests__/**',
        '**/*.d.ts',
      ],
    },
  },
});
