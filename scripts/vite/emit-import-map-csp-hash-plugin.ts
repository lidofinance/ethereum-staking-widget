import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Plugin } from 'vite';

import { parseHtml } from './parse-html';
import { walkIndexHtml } from './walk-index-html';

/**
 * Emit `importmap-csp-hash.txt` into the build output: the sha256 CSP
 * source of the inline import map that vite-plugin-sri-gen injects into
 * every HTML file. The nginx entrypoint splices it into the runtime CSP's
 * script-src — an enforcing CSP without it blocks the import map, and
 * module-graph SRI silently disappears (documented fail-open of the
 * plugin). A single header-level hash only works if the map is
 * byte-identical across all prerendered HTML files, so divergence fails
 * the build rather than silently un-verifying some routes.
 */
export const emitImportMapCspHashPlugin = (root: string): Plugin => {
  const distDir = resolve(root, 'dist');
  return {
    name: 'emit-import-map-csp-hash',
    apply: 'build',
    enforce: 'post',
    async closeBundle() {
      const files = await walkIndexHtml(distDir);
      const hashes = new Set<string>();
      for (const file of files) {
        const doc = parseHtml(await readFile(file, 'utf-8'));
        const importMaps = doc
          .querySelectorAll('script')
          .filter((el) => el.getAttribute('type') === 'importmap');
        if (importMaps.length !== 1) {
          throw new Error(
            `emit-import-map-csp-hash: expected exactly one import map in ${file}, found ${importMaps.length}`,
          );
        }
        hashes.add(
          createHash('sha256').update(importMaps[0].innerHTML).digest('base64'),
        );
      }
      if (hashes.size !== 1) {
        throw new Error(
          `emit-import-map-csp-hash: import maps diverge across HTML files (${hashes.size} variants) — a single CSP hash cannot cover them`,
        );
      }
      await writeFile(
        resolve(distDir, 'importmap-csp-hash.txt'),
        `sha256-${[...hashes][0]}\n`,
      );
    },
  };
};
