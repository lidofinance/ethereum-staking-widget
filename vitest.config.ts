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
  'pages',
  'providers',
  'scripts',
  'shared',
  'styles',
  'types',
  'utils',
  'utilsApi',
].map((dirName) => ({
  find: dirName,
  replacement: resolve(projectRoot, dirName),
}));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      ...projectAliases,
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
  test: {
    environment: 'node',
    exclude: ['test/**', 'node_modules/**', '.next/**'],
    globals: true,
    include: ['**/*.{test,tests,spec}.{ts,tsx,js,jsx}'],
    setupFiles: ['./vitest.setup.ts'],
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
