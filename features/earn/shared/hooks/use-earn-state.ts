import { useConfig } from 'config/use-config';
import { EARN_PATH } from 'consts/urls';
import { useRouter } from 'next/router';
import { useIsIframe } from 'shared/hooks/use-is-iframe';

export const EARN_STATES = {
  ENABLED: 'enabled',
  DISABLED: 'disabled',
  PARTIAL: 'partial',
} as const;

type EarnStateKey = keyof typeof EARN_STATES;
type EarnStateValue = (typeof EARN_STATES)[EarnStateKey];

const EARN_STATE_KEYWORDS = [
  EARN_STATES.ENABLED,
  EARN_STATES.DISABLED,
] as const;

/**
 * Helper to cache earn param in global scope to prevent loss in iframe rerenders
 */
const getCachedEarnParam = () => {
  if (typeof window === 'undefined') return undefined;
  return (window as any).__earnParamCache__;
};

const setCachedEarnParam = (value: string | undefined) => {
  if (typeof window === 'undefined') return;
  (window as any).__earnParamCache__ = value;
};

/**
 * Determines the overall earn state based on runtime context and external configuration.
 *
 * Combines runtime state (URL parameters, iframe context) with external config to determine
 * whether earn features are enabled, disabled, or partially enabled.
 *
 * State rules:
 * - **disabled**: Earn is disabled by config or in iframe context (unless opted in via URL) or when `earn=disabled` is set
 * - **partial**: Specific vaults are force-enabled via URL (e.g., `earn=vault1,vault2`)
 * - **enabled**: Earn is fully enabled (default or when `earn=enabled` is explicitly set)
 */
export const useEarnState = () => {
  const { pages, earnVaults } = useConfig().externalConfig;

  const earnRuntimeState = useEarnRuntimeState();
  const {
    isEarnDisabledByRuntimeContext,
    someVaultsEnabledByURL,
    isVaultEnabledByUrl,
  } = earnRuntimeState;

  const isEarnDisabledByConfig = pages[EARN_PATH]?.shouldDisable ?? false;

  const isEarnDisabled =
    isEarnDisabledByRuntimeContext || isEarnDisabledByConfig;

  const isEarnPartial = !isEarnDisabled && someVaultsEnabledByURL;

  let earnState: EarnStateValue;
  if (isEarnPartial) {
    earnState = EARN_STATES.PARTIAL;
  } else if (isEarnDisabled) {
    earnState = EARN_STATES.DISABLED;
  } else {
    earnState = EARN_STATES.ENABLED;
  }

  const isVaultEnabled = (vaultName: string) => {
    // Respect disabled flag from external config
    // If a vault is marked as disabled in config, it cannot be re-enabled via URL
    const vaultConfig = earnVaults.find((vault) => vault.name === vaultName);
    if (!vaultConfig || vaultConfig.disabled) return false;

    // If earn is fully disabled, no vault is enabled
    if (earnState === EARN_STATES.DISABLED) return false;

    // If earn is fully enabled, all vaults are enabled
    if (earnState === EARN_STATES.ENABLED) return true;

    return earnState === EARN_STATES.PARTIAL && isVaultEnabledByUrl(vaultName);
  };

  const isVaultDisabled = (vaultName: string) => !isVaultEnabled(vaultName);

  const earnVaultsEnabled = earnVaults.filter((vault) =>
    isVaultEnabled(vault.name),
  );

  return {
    ...earnRuntimeState,
    earnState,
    earnVaults,
    earnVaultsEnabled,
    isEarnEnabled: earnState === EARN_STATES.ENABLED,
    isEarnDisabled,
    isEarnPartial,
    isEarnVaultsForceEnabledByURL: someVaultsEnabledByURL,
    isVaultEnabled,
    isVaultDisabled,
  };
};

/**
 * Determines the earn state at runtime based on URL parameters and iframe context.
 *
 * **WARNING: It doesn't rely on external config, therefore it may not reflect the final earn state!**
 */
export const useEarnRuntimeState = () => {
  const { query, isReady } = useRouter();
  const isIframe = useIsIframe();

  // Cache the earn query param to prevent it from being lost on rerenders in iframe
  // (Next.js Router can have unstable query params in iframe due to History API limitations)
  if (isReady && query.earn && typeof query.earn === 'string') {
    setCachedEarnParam(query.earn);
  }

  // Use cached value if current query.earn is undefined, but we had it before
  const earnParam = query.earn || getCachedEarnParam();

  // Parse enabled vaults from URL param: ?earn=vault1,vault2
  let vaultsEnabledByUrl: string[] = [];
  if (
    isReady &&
    earnParam &&
    typeof earnParam === 'string' &&
    !EARN_STATE_KEYWORDS.includes(earnParam as any) // Only treat as vault names if it's not a keyword (enabled/disabled)
  ) {
    vaultsEnabledByUrl = earnParam.split(',');
  }

  const someVaultsEnabledByURL = vaultsEnabledByUrl.length > 0;
  const isEarnEnabledByURL = isReady && earnParam === EARN_STATES.ENABLED;
  const isEarnDisabledByURL = isReady && earnParam === EARN_STATES.DISABLED;

  const isEarnDisabledByRuntimeContext =
    (isReady && isIframe && !isEarnEnabledByURL && !someVaultsEnabledByURL) ||
    isEarnDisabledByURL;

  const isVaultEnabledByUrl = (vaultName: string) =>
    vaultsEnabledByUrl.includes(vaultName);

  const isVaultDisabledByUrl = (vaultName: string) =>
    !isVaultEnabledByUrl(vaultName);

  return {
    isEarnDisabledByRuntimeContext,
    someVaultsEnabledByURL,
    vaultsEnabledByUrl,
    isVaultEnabledByUrl,
    isVaultDisabledByUrl,
  };
};
