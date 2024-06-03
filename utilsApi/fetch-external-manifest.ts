import { Cache } from 'memory-cache';
import { IPFS_MANIFEST_PATH } from 'consts/external-links';
import { responseTimeExternalMetricWrapper } from './fetchApiWrapper';
import { standardFetcher } from 'utils/standardFetcher';
import { config } from 'config';

export type ExternalConfigResult = {
  ___prefetch_manifest___: object | null;
  revalidate: number;
};

const cache = new Cache<
  typeof config.CACHE_EXTERNAL_CONFIG_KEY,
  ExternalConfigResult
>();

export const fetchExternalManifest = async () => {
  const cachedConfig = cache.get(config.CACHE_EXTERNAL_CONFIG_KEY);
  if (cachedConfig) return cachedConfig;

  let retries = 3;
  while (retries > 0) {
    try {
      const data = await responseTimeExternalMetricWrapper({
        payload: IPFS_MANIFEST_PATH,
        request: () =>
          standardFetcher<unknown>(IPFS_MANIFEST_PATH, {
            headers: { Accept: 'application/json' },
          }),
      });
      if (!data || typeof data !== 'object')
        throw new Error(`invalid config received: ${data}`);

      const result = {
        ___prefetch_manifest___: data,
        revalidate: config.DEFAULT_REVALIDATION,
      };

      cache.put(
        config.CACHE_EXTERNAL_CONFIG_KEY,
        result,
        config.CACHE_EXTERNAL_CONFIG_TTL,
      );

      console.debug(`[fetchExternalConfig] fetched external config`, result);

      return result;
    } catch (e) {
      console.error(`[fetchExternalConfig] failed to fetch external config`, e);
      retries -= 1;
    }
  }
  console.error(
    `[fetchExternalConfig] failed to fetch external config after retries, revalidation is set to ${config.ERROR_REVALIDATION}`,
  );
  return {
    revalidate: config.ERROR_REVALIDATION,
    ___prefetch_manifest___: null,
  };
};
