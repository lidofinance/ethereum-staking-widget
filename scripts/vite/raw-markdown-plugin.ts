import type { Plugin } from 'vite';

/**
 * `.md` files were loaded through webpack's `raw-loader`; mirror that by
 * serving them as raw strings without touching the import sites
 * (Vite's native alternative would be a `?raw` suffix on every import).
 */
export const rawMarkdownPlugin = (): Plugin => {
  return {
    name: 'raw-markdown',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('.md')) return null;
      return {
        code: `export default ${JSON.stringify(code)};`,
        map: null,
      };
    },
  };
};
