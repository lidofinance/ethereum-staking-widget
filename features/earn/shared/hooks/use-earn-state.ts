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
    // If earn is fully disabled, no vault is enabled
    if (earnState === EARN_STATES.DISABLED) return false;

    // If earn is fully enabled, all vaults are enabled
    if (earnState === EARN_STATES.ENABLED) return true;

    // Respect disabled flag from external config
    const vaultConfig = earnVaults.find((vault) => vault.name === vaultName);
    if (!vaultConfig || vaultConfig.disabled) return false;

    return isVaultEnabledByUrl(vaultName);
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
  const { query } = useRouter();
  const isIframe = useIsIframe();

  // Parse enabled vaults from URL param: ?earn=vault1,vault2
  let vaultsEnabledByUrl: string[] = [];
  if (
    query.earn &&
    typeof query.earn === 'string' &&
    !EARN_STATE_KEYWORDS.includes(query.earn as any) // Only treat as vault names if it's not a keyword (enabled/disabled)
  ) {
    vaultsEnabledByUrl = query.earn.split(',');
  }

  const someVaultsEnabledByURL = vaultsEnabledByUrl.length > 0;
  const isEarnEnabledByURL = query.earn === EARN_STATES.ENABLED;
  const isEarnDisabledByURL = query.earn === EARN_STATES.DISABLED;

  const isEarnDisabledByRuntimeContext =
    (isIframe && !isEarnEnabledByURL && !someVaultsEnabledByURL) ||
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
