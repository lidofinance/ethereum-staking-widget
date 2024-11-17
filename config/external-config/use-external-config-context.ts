import { useMemo } from 'react';

import { config } from 'config';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { IPFS_MANIFEST_URL } from 'consts/external-links';
import { useLidoQuery } from 'shared/hooks/use-lido-query';
import { standardFetcher } from 'utils/standardFetcher';

import {
  getBackwardCompatibleConfig,
  isManifestEntryValid,
  useFallbackManifestEntry,
} from './utils';
import type { ExternalConfig, ManifestEntry } from './types';

export const useExternalConfigContext = (
  prefetchedManifest?: unknown,
): ExternalConfig => {
  const defaultChain = config.defaultChain;
  const fallbackData = useFallbackManifestEntry(
    prefetchedManifest,
    config.defaultChain,
  );

  const queryResult = useLidoQuery<ManifestEntry>({
    queryKey: ['external-config', defaultChain],
    strategy: STRATEGY_LAZY,
    enabled: !!defaultChain,
    queryFn: async () => {
      try {
        const result = await standardFetcher<Record<string, any>>(
          IPFS_MANIFEST_URL,
          {
            headers: { Accept: 'application/json' },
          },
        );

        const entry = result[defaultChain.toString()];
        if (isManifestEntryValid(entry)) return entry;

        throw new Error(
          '[useExternalConfig] received invalid manifest',
          result,
        );
      } catch (err) {
        console.warn(
          '[useExternalConfigContext] while fetching external config:',
          err,
        );
        // This line is necessary so that useLidoQuery (useQuery) can handle the error and return undefined
        throw err;
      }
    },
  });

  return useMemo(() => {
    const { config, ...rest } = queryResult.data ?? fallbackData;
    const cleanConfig = getBackwardCompatibleConfig(config);
    return { ...cleanConfig, ...rest, fetchMeta: queryResult };
  }, [queryResult, fallbackData]);
};
