import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { config } from 'config';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { REMOTE_CONFIG_MANIFEST_URL } from 'consts/external-links';
import { API_ROUTES } from 'consts/api';
import { standardFetcher } from 'utils/standardFetcher';
import { useEarnRuntimeState } from 'features/earn/shared/hooks/use-earn-state';
import { EARN_PATH } from 'consts/urls';

import {
  overrideManifestConfig,
  useFallbackManifestEntry,
} from './frontend-fallback';
import { ManifestSchema } from './validate';
import { getManifestKey } from './utils';
import type { ExternalConfig, ManifestConfig, ManifestEntry } from './types';

// IPFS builds (no backend) and legacy builds (no CONFIG_MANIFEST_PATH) fetch
// the manifest from github; file mode serves it from the own API route
const getManifestUrl = (): string => {
  if (config.ipfsMode || !config.useConfigManifestFile) {
    return REMOTE_CONFIG_MANIFEST_URL;
  }

  const BASE_URL = typeof window === 'undefined' ? '' : window.location.origin;

  return `${BASE_URL}${config.basePath ?? ''}/${API_ROUTES.CONFIG_MANIFEST}`;
};

export const useExternalConfigContext = (
  prefetchedManifest?: unknown,
): ExternalConfig => {
  const { isEarnDisabledByRuntimeContext } = useEarnRuntimeState();

  const { defaultChain, manifestOverride } = config;
  const fallbackData = useFallbackManifestEntry(
    prefetchedManifest,
    defaultChain,
    manifestOverride,
  );

  const manifestUrl = getManifestUrl();

  const queryResult = useQuery<ManifestEntry>({
    queryKey: [
      'external-config',
      { defaultChain, manifestOverride, manifestUrl },
    ],
    ...STRATEGY_LAZY,
    enabled: !!defaultChain,
    queryFn: async () => {
      try {
        const result = await standardFetcher<Record<string, any>>(manifestUrl, {
          headers: { Accept: 'application/json' },
        });

        const manifestKey = getManifestKey(defaultChain, manifestOverride);

        const parseResult = ManifestSchema.safeParse(result);

        if (parseResult.success) {
          const entry = parseResult.data[manifestKey];
          if (entry) return entry;
        }

        throw new Error(
          `[useExternalConfig] received invalid manifest ${
            parseResult.success
              ? `entry ${manifestKey} is missing`
              : parseResult.error.message
          }`,
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
    const { config: cleanConfig, ...rest } = queryResult.data ?? fallbackData;

    const EARN_CONFIG = cleanConfig.pages[EARN_PATH];

    // TODO: replace this logic with useEarnState hook, which is a single source of truth for Earn state.
    // Current blocker: the Navigation component (navigation.tsx) uses external config to disable pages,
    // we don't want to couple it with specific Earn state logic.
    const overridePages: Partial<ManifestConfig> | undefined =
      isEarnDisabledByRuntimeContext
        ? {
            pages: {
              [EARN_PATH]: {
                showNew: EARN_CONFIG?.showNew ?? false,
                sections: EARN_CONFIG?.sections ?? [],
                shouldDisable: true,
              },
            },
          }
        : undefined;

    const overrideConfig = overrideManifestConfig(cleanConfig, {
      ...overridePages,
    });

    return { ...overrideConfig, ...rest, fetchMeta: queryResult };
  }, [queryResult, fallbackData, isEarnDisabledByRuntimeContext]);
};
