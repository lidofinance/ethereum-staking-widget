import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { config } from 'config';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { IPFS_MANIFEST_URL } from 'consts/external-links';
import { isManifestEntryValid } from 'config/external-config';
import { standardFetcher } from 'utils/standardFetcher';
import {
  getBackwardCompatibleConfig,
  useFallbackManifestEntry,
} from './frontend-fallback';

import type { ExternalConfig, ManifestEntry } from './types';
import { useRouter } from 'next/router';

export const useExternalConfigContext = (
  prefetchedManifest?: unknown,
): ExternalConfig => {
  const { query } = useRouter();
  // for embed - opt in
  // for others -  opt out
  const isEarnDisabled =
    (query.embed != undefined && query.earn !== 'enabled') ||
    query.earn === 'disabled';

  const defaultChain = config.defaultChain;
  const fallbackData = useFallbackManifestEntry(
    prefetchedManifest,
    defaultChain,
  );

  const queryResult = useQuery<ManifestEntry>({
    queryKey: ['external-config', defaultChain],
    ...STRATEGY_LAZY,
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
        // This line is necessary so that useQuery can handle the error and return undefined
        throw err;
      }
    },
  });

  return useMemo(() => {
    const override = isEarnDisabled
      ? {
          pages: {
            '/earn': {
              shouldDisable: true,
            },
          },
        }
      : undefined;

    const { config, ...rest } = queryResult.data ?? fallbackData;
    const cleanConfig = getBackwardCompatibleConfig(config, override);
    return { ...cleanConfig, ...rest, fetchMeta: queryResult };
  }, [isEarnDisabled, queryResult, fallbackData]);
};
