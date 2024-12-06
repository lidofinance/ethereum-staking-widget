import { Cache } from 'memory-cache';
import { IPFS_MANIFEST_URL } from 'consts/external-links';
import { responseTimeExternalMetricWrapper } from './fetchApiWrapper';
import { standardFetcher } from 'utils/standardFetcher';

import { config } from 'config';
import {
  ManifestEntry,
  Manifest,
  ManifestConfigPage,
  ManifestConfig,
} from 'config/external-config';
import {
  ManifestConfigPageList,
  ManifestConfigPageEnum,
} from 'config/external-config';

import FallbackLocalManifest from 'IPFS.json' assert { type: 'json' };

export type ExternalConfigResult = {
  ___prefetch_manifest___: object | null;
};

const cache = new Cache<
  typeof config.CACHE_EXTERNAL_CONFIG_KEY,
  ExternalConfigResult
>();

const isMultiChainBannerValid = (config: object) => {
  // allow empty config
  if (!('multiChainBanner' in config) || !config.multiChainBanner) return true;

  if (!Array.isArray(config.multiChainBanner)) return false;

  const multiChainBanner = config.multiChainBanner;

  if (
    !multiChainBanner.every(
      (chainId) => typeof chainId === 'number' && chainId > 0,
    )
  )
    return false;

  return !(new Set(multiChainBanner).size !== multiChainBanner.length);
};

const isFeatureFlagsValid = (config: object) => {
  // allow empty config
  if (!('featureFlags' in config) || !config.featureFlags) return true;

  // only objects
  return !(typeof config.featureFlags !== 'object');
};

export const isManifestEntryValid = (
  entry?: unknown,
): entry is ManifestEntry => {
  if (
    // entry = {}
    entry &&
    typeof entry === 'object' &&
    // entry.config = {}
    'config' in entry &&
    typeof entry.config === 'object' &&
    entry.config
  ) {
    const config = entry.config;

    return [
      isEnabledDexesValid,
      isMultiChainBannerValid,
      isFeatureFlagsValid,
      isPagesValid,
    ]
      .map((validator) => validator(config))
      .every((isValid) => isValid);
  }
  return false;
};

const isEnabledDexesValid = (config: object) => {
  if (
    !(
      'enabledWithdrawalDexes' in config &&
      Array.isArray(config.enabledWithdrawalDexes)
    )
  )
    return false;

  const enabledWithdrawalDexes = config.enabledWithdrawalDexes;

  if (
    !enabledWithdrawalDexes.every(
      (dex) => typeof dex === 'string' && dex !== '',
    )
  )
    return false;

  return new Set(enabledWithdrawalDexes).size === enabledWithdrawalDexes.length;
};

const isPagesValid = (config: object) => {
  if (!('pages' in config)) {
    return true;
  }

  const pages = config.pages as ManifestConfig['pages'];
  if (pages && typeof pages === 'object') {
    const pagesKeysList = Object.keys(pages) as ManifestConfigPage[];
    if (
      !pagesKeysList.every((pagesKey) => ManifestConfigPageList.has(pagesKey))
    ) {
      return false;
    }

    // INFO: exclude possible issue when stack interface can be deactivated
    return !pages[ManifestConfigPageEnum.Stake]?.shouldDeactivate;
  }

  return false;
};

export const isManifestValid = (
  manifest: unknown,
  chain: number,
): manifest is Manifest => {
  const stringChain = chain.toString();
  if (manifest && typeof manifest === 'object' && stringChain in manifest)
    return isManifestEntryValid(
      (manifest as Record<string, unknown>)[stringChain],
    );
  return false;
};

export const fetchExternalManifest = async () => {
  const cachedConfig = cache.get(config.CACHE_EXTERNAL_CONFIG_KEY);
  if (cachedConfig) return cachedConfig;

  // for IPFS build we use local manifest
  // this allows local CID verification
  if (config.ipfsMode) {
    return {
      ___prefetch_manifest___: FallbackLocalManifest,
    };
  }

  let retries = 3;
  while (retries > 0) {
    try {
      const data = await responseTimeExternalMetricWrapper({
        payload: IPFS_MANIFEST_URL,
        request: () =>
          standardFetcher<unknown>(IPFS_MANIFEST_URL, {
            headers: { Accept: 'application/json' },
          }),
      });
      if (
        !data ||
        typeof data !== 'object' ||
        !isManifestValid(data, config.defaultChain)
      ) {
        throw new Error(`invalid config received: ${data}`);
      }

      const result = {
        ___prefetch_manifest___: data,
      };

      cache.put(
        config.CACHE_EXTERNAL_CONFIG_KEY,
        result,
        config.CACHE_EXTERNAL_CONFIG_TTL,
      );

      console.debug(
        `[fetchExternalManifest] fetched external manifest`,
        result,
      );

      return result;
    } catch (error) {
      console.error(
        `[fetchExternalManifest] failed to fetch external manifest`,
        error,
      );
      retries -= 1;
    }
  }
  console.error(
    `[fetchExternalManifest] failed to fetch external manifest after retries`,
  );

  return {
    ___prefetch_manifest___: FallbackLocalManifest,
  };
};
