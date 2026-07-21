import invariant from 'tiny-invariant';

import { ManifestSchema } from './validate';

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

// `shouldRedirectToRoot` was removed with getStaticProps: manifest-driven
// page disabling is runtime-only now (Navigation + ExternalForbiddenRoute
// providers read the same external config on the client).
