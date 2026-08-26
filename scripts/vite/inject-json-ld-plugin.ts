import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Plugin } from 'vite';

import { ROUTE_META } from '../../shared/seo';
import { walkIndexHtml } from './walk-index-html';

/**
 * After the prerender plugin writes `dist/<route>/index.html`, splice in
 * any `jsonLd` from `ROUTE_META[<route>]` as a
 * `<script type="application/ld+json">` before `</head>`. The
 * vite-prerender-plugin `head.elements` API only supports void elements
 * (no children), so JSON-LD is post-processed here. `<` is escaped to
 * `\\u003c` so data can never break out of the script element.
 */
export const injectJsonLdPlugin = (root: string): Plugin => {
  const distDir = resolve(root, 'dist');
  return {
    name: 'inject-json-ld',
    apply: 'build',
    enforce: 'post',
    async closeBundle() {
      const files = await walkIndexHtml(distDir);
      for (const file of files) {
        const routePath =
          file.slice(distDir.length).replace(/\/index\.html$/, '') || '/';
        const jsonLd = ROUTE_META[routePath]?.jsonLd;
        if (!jsonLd) continue;
        const html = await readFile(file, 'utf-8');
        const json = JSON.stringify(jsonLd).replace(/</g, '\\u003c');
        const script = `<script type="application/ld+json">${json}</script>`;
        await writeFile(file, html.replace('</head>', `${script}</head>`));
      }
    },
  };
};
