import invariant from 'tiny-invariant';

import { ManifestSchema, type ManifestKey } from './validate';

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
