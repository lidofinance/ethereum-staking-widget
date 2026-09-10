import invariant from 'tiny-invariant';
import { config } from 'config';

import { ManifestSchema, type ManifestKey } from './validate';

import type { Manifest, ManifestConfig, ManifestConfigPage } from './types';

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

export const shouldRedirectToRoot = (
  currentPath: string,
  manifest: Manifest | null,
): boolean => {
  const { defaultChain } = config;
  const chainSettings = manifest?.[getManifestKey(defaultChain)];
  const pages = chainSettings?.config?.pages;
  const isDisabled =
    !!pages?.[currentPath as ManifestConfigPage]?.shouldDisable;
  // https://nextjs.org/docs/messages/gsp-redirect-during-prerender
  const isBuild = process.env.npm_lifecycle_event === 'build';

  return isDisabled && !isBuild;
};

// A path is disabled when it contains any disabled page key. `/` is contained
// in every path, but the schema guarantees the stake page is never disabled
export const isDisabledPath = (
  path: string,
  pages: ManifestConfig['pages'],
): boolean =>
  Object.entries(pages).some(
    ([pathKey, page]) => page?.shouldDisable && path.includes(pathKey),
  );
