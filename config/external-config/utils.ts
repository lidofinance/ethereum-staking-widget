import invariant from 'tiny-invariant';

import { ManifestSchema, type ManifestKey } from './validate';

import type { ManifestConfig } from './types';

import FallbackLocalManifest from 'REMOTE_CONFIG_MANIFEST.json';

export const getManifestKey = (
  defaultChain: number,
  manifestOverride?: string,
): ManifestKey =>
  (`${defaultChain}` +
    (typeof manifestOverride === 'string'
      ? `-${manifestOverride}`
      : '')) as ManifestKey;

export const getLocalFallbackManifest = () => {
  const fallbackParsing = ManifestSchema.safeParse(FallbackLocalManifest);
  invariant(
    fallbackParsing.success,
    `Local fallback manifest is invalid: ${fallbackParsing.error?.message}`,
  );
  return fallbackParsing.data;
};

// `shouldRedirectToRoot` was removed with getStaticProps: manifest-driven
// page disabling is runtime-only now (Navigation + ExternalForbiddenRoute
// providers read the same external config on the client).

// Route part of a router path or IPFS hash path: no query, no hash and no
// trailing slash, so `/earn/?tab=deposit` and `/earn` compare equal
const normalizePath = (path: string): string => {
  const route = path.split(/[?#]/u, 1)[0] ?? '';
  return route.replace(/\/+$/u, '') || '/';
};

// A path is disabled when its route is a disabled page key or a child of one.
// Query values are ignored: `/wrap?next=/earn` is the wrap page. `/` is only
// matched exactly, and the schema guarantees the stake page is never disabled
export const isDisabledPath = (
  path: string,
  pages: ManifestConfig['pages'],
): boolean => {
  const route = normalizePath(path);
  return Object.entries(pages).some(([pathKey, page]) => {
    if (!page?.shouldDisable) return false;
    const key = normalizePath(pathKey);
    return route === key || (key !== '/' && route.startsWith(`${key}/`));
  });
};
