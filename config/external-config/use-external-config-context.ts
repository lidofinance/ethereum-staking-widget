import { useMemo } from 'react';
import useSWR from 'swr';

import { STRATEGY_LAZY } from 'consts/swr-strategies';
import { getConfig } from '../get-config';
import { standardFetcher } from 'utils/standardFetcher';
import { isManifestEntryValid } from 'utils/validate-ipfs-json';
import { IPFS_MANIFEST_URL } from 'consts/external-links';
import { getBackwardCompatibleConfig, useFallbackManifestEntry } from './utils';

import type { ExternalConfig, ManifestEntry } from './types';

const onFetchError = (error: unknown) => {
  console.warn(
    '[useExternalConfigContext] while fetching external config:',
    error,
  );
};

export const useExternalConfigContext = (
  prefetchedManifest?: unknown,
): ExternalConfig => {
  const { defaultChain } = getConfig();
  const fallbackData = useFallbackManifestEntry(
    prefetchedManifest,
    defaultChain,
  );

  const swr = useSWR<ManifestEntry>(
    ['swr:external-config', defaultChain],
    async () => {
      const result = await standardFetcher<Record<string, any>>(
        IPFS_MANIFEST_URL,
        {
          headers: { Accept: 'application/json' },
        },
      );
      const entry = result[defaultChain.toString()];
      if (isManifestEntryValid(entry)) return entry;
      throw new Error(
        '[useExternalConfigContext] received invalid manifest',
        result,
      );
    },
    {
      ...STRATEGY_LAZY,
      onError: onFetchError,
    },
  );

  return useMemo(() => {
    const { config, ...rest } = swr.data ?? fallbackData;
    const cleanConfig = getBackwardCompatibleConfig(config);
    return { ...cleanConfig, ...rest, fetchMeta: swr };
  }, [swr, fallbackData]);
};
