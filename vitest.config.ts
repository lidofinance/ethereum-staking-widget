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
      {
        find: 'assets/earn',
        replacement: resolve(projectRoot, 'test-utils/mocks/assets-earn.tsx'),
      },
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
  },
});
