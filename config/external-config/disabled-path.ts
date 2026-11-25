import type { ManifestConfig } from './types';

// Route part of a router path or IPFS hash path: no query, no hash and no
// trailing slash, so `/earn/?tab=deposit` and `/earn` compare equal
const normalizePath = (path: string): string => {
  const route = path.split(/[?#]/u, 1)[0] ?? '';
  return route.replace(/\/+$/u, '') || '/';
};

// A path is disabled when its route is a disabled page key or a child of one.
// Query values are ignored: `/wrap?next=/earn` is the wrap page. `/` is only
// matched exactly; it is disabled only at runtime by URL params, never by the manifest
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
