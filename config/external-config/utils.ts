import invariant from 'tiny-invariant';
import { config } from 'config';

import { ManifestSchema, ManifestConfigPages } from './validate';

import type { Manifest, ManifestConfigPage } from './types';

import FallbackLocalManifest from 'IPFS.json';

export const getManifestKey = (
  defaultChain: number,
  manifestOverride?: string,
) =>
  `${defaultChain}` +
  (typeof manifestOverride === 'string' ? `-${manifestOverride}` : '');

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
  const chainSettings = manifest?.[`${defaultChain}`];
  const pages = chainSettings?.config?.pages;
  const isDisabled =
    !!pages?.[currentPath as ManifestConfigPage]?.shouldDisable;
  // https://nextjs.org/docs/messages/gsp-redirect-during-prerender
  const isBuild = process.env.npm_lifecycle_event === 'build';

  return currentPath !== ManifestConfigPages.Stake && isDisabled && !isBuild;
};
