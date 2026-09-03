import type { Plugin } from 'vite';

/**
 * Build/dev-time counterpart of `shims/shim-guard.ts`: warns whenever any
 * module resolves an import to one of the next-* shims, naming the importer,
 * so every shim consumer is visible right in `vite dev` / `vite build`
 * output. The config alias rewrites `next/router` → `shims/next-router.tsx`
 * before user plugins run, so both the raw specifier and the rewritten path
 * are matched. Passive: always returns null, resolution is untouched.
 */
export const shimUsageReporterPlugin = (root: string): Plugin => {
  const seen = new Set<string>();
  return {
    name: 'next-shim-usage-reporter',
    // rolldown-vite resolves `resolve.alias` natively before normal JS
    // plugins — 'pre' is required for this hook to see next/* specifiers.
    enforce: 'pre',
    resolveId(source, importer) {
      const isShimTarget =
        /^next(\/|$)/.test(source) || source.includes('/shims/next-');
      if (!isShimTarget || !importer) return null;
      // shims importing each other / shim-guard is not a usage
      if (importer.includes('/shims/')) return null;

      const what = source.includes('/shims/next-')
        ? `shims/${source.split('/').pop()}`
        : source;
      const from = importer.startsWith(root)
        ? importer.slice(root.length + 1)
        : importer;
      const key = `${what} <- ${from}`;
      if (seen.has(key)) return null;
      seen.add(key);

      console.warn(
        `\n⚠️  [next-shim] ${what} is imported by:\n` +
          `   ${from}\n` +
          `   App code must not use next/* (see shims/shim-guard.ts); ` +
          `dependency-side usages are expected but should stay known.\n`,
      );
      return null;
    },
  };
};
