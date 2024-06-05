import { STRATEGY_LAZY } from 'consts/swr-strategies';
import { getConfig } from '../get-config';
import { standardFetcher } from 'utils/standardFetcher';
import { IPFS_MANIFEST_URL } from 'consts/external-links';
import { isManifestEntryValid, useFallbackManifestEntry } from './utils';
import { ExternalConfig, ManifestEntry } from './types';
import useSWR from 'swr';
import { useMemo } from 'react';

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
      fallbackData: fallbackData,
      onError: onFetchError,
    },
  );

  return useMemo(() => {
    const { config, ...rest } = swr.data ?? fallbackData;

    return { ...config, ...rest, fetchMeta: swr };
  }, [swr, fallbackData]);
};
