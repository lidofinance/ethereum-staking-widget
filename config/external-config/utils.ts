import invariant from 'tiny-invariant';
import { config } from 'config';

import { ManifestSchema, type ManifestKey } from './validate';

import type { Manifest, ManifestConfigPage } from './types';

import FallbackLocalManifest from 'REMOTE_CONFIG_MANIFEST.json';

export const getManifestKey = (
  defaultChain: number,
  manifestOverride?: string,
): ManifestKey =>
  (`${defaultChain}` +
    (typeof manifestOverride === 'string'
      ? `-${manifestOverride}`
      : '')) as ManifestKey;

// The one place the deployment's entry key is derived from config. Server
// admission, page props and the browser query must all read the same entry,
// base (`1`) or override (`1-staging`), or they disagree on policy.
export const getConfiguredManifestKey = (): ManifestKey =>
  getManifestKey(config.defaultChain, config.manifestOverride);

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
  const chainSettings = manifest?.[getConfiguredManifestKey()];
  const pages = chainSettings?.config?.pages;
  const isDisabled =
    !!pages?.[currentPath as ManifestConfigPage]?.shouldDisable;
  // https://nextjs.org/docs/messages/gsp-redirect-during-prerender
  const isBuild = process.env.npm_lifecycle_event === 'build';

  return isDisabled && !isBuild;
};
