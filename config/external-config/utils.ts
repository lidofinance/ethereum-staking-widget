import { config } from 'config';
import {
  Manifest,
  ManifestConfig,
  ManifestConfigPage,
  ManifestConfigPageEnum,
  ManifestEntry,
} from 'config/external-config';

export const getManifestKey = (
  defaultChain: number,
  manifestOverride?: string,
) =>
  `${defaultChain}` +
  (typeof manifestOverride === 'string' ? `-${manifestOverride}` : '');

export const isMultiChainBannerValid = (config: object) => {
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

export const isFeatureFlagsValid = (config: object) => {
  // allow empty config
  if (!('featureFlags' in config) || !config.featureFlags) return true;

  // only objects
  return !(typeof config.featureFlags !== 'object');
};

export const isEnabledDexesValid = (config: object) => {
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

export const isPagesValid = (config: object) => {
  if (!('pages' in config)) {
    return true;
  }

  const pages = config.pages as ManifestConfig['pages'];
  if (pages && typeof pages === 'object') {
    // INFO: exclude possible issue when stack interface can be deactivated
    return !pages[ManifestConfigPageEnum.Stake]?.shouldDisable;
  }

  return false;
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

// Use in Next backend side
export const shouldRedirectToRoot = (
  currentPath: string,
  manifest: Manifest | null,
): boolean => {
  const { defaultChain } = config;
  const chainSettings = manifest?.[`${defaultChain}`];
  const pages = chainSettings?.config?.pages;
  const isDeactivate =
    !!pages?.[currentPath as ManifestConfigPage]?.shouldDisable;
  // https://nextjs.org/docs/messages/gsp-redirect-during-prerender
  const isBuild = process.env.npm_lifecycle_event === 'build';

  return (
    currentPath !== ManifestConfigPageEnum.Stake && isDeactivate && !isBuild
  );
};
