import { resolve } from 'node:path';
import type { Plugin } from 'vite';

/**
 * Importer-scoped resolution seam for 'styled-components' (see
 * `shims/styled-components.ts` for the why).
 *
 * - app code           → shims/styled-components.ts (re-exports the real one)
 * - node_modules code  → real package (lido-ui / reef-knot peer dep)
 * - the shim itself    → real package (so the pass-through terminates)
 *
 * Only the bare specifier is rewritten; subpaths ('styled-components/macro')
 * are not used in app code and fall through untouched. Type resolution is
 * unaffected — app files keep importing the 'styled-components' specifier,
 * so @types/styled-components applies as before.
 */
export const styledComponentsSeamPlugin = (root: string): Plugin => {
  const shimPath = resolve(root, 'shims/styled-components.ts');
  return {
    name: 'styled-components-seam',
    // rolldown-vite resolves bare specifiers natively before normal JS
    // plugins — 'pre' is required to intercept the specifier at all.
    enforce: 'pre',
    resolveId(source, importer) {
      if (source !== 'styled-components' || !importer) return null;
      if (importer.includes('node_modules')) return null;
      if (importer === shimPath) return null;
      return shimPath;
    },
  };
};
