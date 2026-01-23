import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { config } from 'config';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { IPFS_MANIFEST_URL } from 'consts/external-links';
import { getManifestKey, isManifestEntryValid } from 'config/external-config';
import { standardFetcher } from 'utils/standardFetcher';
import { useEarnState } from 'features/earn/shared/hooks/use-earn-state';
import { EARN_PATH } from 'consts/urls';

import {
  getBackwardCompatibleConfig,
  overrideManifestConfig,
  useFallbackManifestEntry,
} from './frontend-fallback';

import type { ExternalConfig, ManifestEntry } from './types';

export const useExternalConfigContext = (
  prefetchedManifest?: unknown,
): ExternalConfig => {
  const { isEarnDisabled, isEarnPartial, isVaultDisabled } = useEarnState();

  const { defaultChain, manifestOverride } = config;
  const fallbackData = useFallbackManifestEntry(
    prefetchedManifest,
    defaultChain,
    manifestOverride,
  );

  const queryResult = useQuery<ManifestEntry>({
    queryKey: ['external-config', { defaultChain, manifestOverride }],
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

        const entry = result[getManifestKey(defaultChain, manifestOverride)];
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
    const { config: rawConfig, ...rest } = queryResult.data ?? fallbackData;

    const cleanConfig = getBackwardCompatibleConfig(rawConfig);

    // Completely disables the Earn page unless some vaults are force-enabled via URL
    const overridePages = isEarnDisabled
      ? {
          pages: {
            [EARN_PATH]: {
              ...cleanConfig.pages[EARN_PATH],
              shouldDisable: true,
            },
          },
        }
      : undefined;

    const overrideEarnVaults = { earnVaults: [...cleanConfig.earnVaults] };

    if (isEarnPartial) {
      overrideEarnVaults.earnVaults.forEach((vault) => {
        vault.disabled = isVaultDisabled(vault.name);
      });
    }

    const overrideConfig = overrideManifestConfig(cleanConfig, {
      ...overridePages,
      ...overrideEarnVaults,
    });

    return { ...overrideConfig, ...rest, fetchMeta: queryResult };
  }, [
    queryResult,
    fallbackData,
    isEarnDisabled,
    isEarnPartial,
    isVaultDisabled,
  ]);
};
