import type { Plugin } from 'vite';

import { sitemapXml } from '../../shared/seo';

/**
 * Emit `sitemap.xml` at build time, listing every prerendered route.
 * URLs use the `__PUBLIC_ORIGIN__` placeholder — nginx `sub_filter`
 * rewrites them to the per-env absolute origin at response time.
 */
export const emitSitemapPlugin = (): Plugin => {
  return {
    name: 'emit-sitemap',
    apply: 'build',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: sitemapXml(),
      });
    },
  };
};
