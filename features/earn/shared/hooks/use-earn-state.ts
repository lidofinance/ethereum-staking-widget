import { useConfig } from 'config/use-config';
import { EARN_PATH } from 'consts/urls';
import { useRouter } from 'next/router';
import { useIsLedgerLive } from 'shared/hooks/useIsLedgerLive';

import {
  type EarnStateValue,
  EARN_STATES,
  computeEarnRuntimeState,
} from '../utils/earn-state-utils';

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
 * Combines runtime state (URL parameters, Ledger Live detection) with external config to determine
 * whether earn features are enabled, disabled, or partially enabled.
 *
 * State rules (opt-out):
 * - **disabled**: Earn is disabled by config, by Ledger Live, or when `?earn=disabled` is set
 * - **partial**: Specific vaults are force-disabled via URL (e.g., `?earn=vault1,vault2`)
 * - **enabled**: Earn is fully enabled (default for all integrations except Ledger Live)
 */
export const useEarnState = () => {
  const { pages, earnVaults } = useConfig().externalConfig;

  // useIsLedgerLive adds the Wagmi connector check on top of the appFlag-based check in
  // useEarnRuntimeState. Both are needed: the flag persists across iframe rerenders,
  // while the connector check covers cases before ?app=ledger-live is set in the URL.
  const isLedgerLive = useIsLedgerLive();
  const earnRuntimeState = useEarnRuntimeState();
  const { someVaultsDisabledByURL, isVaultDisabledByUrl } = earnRuntimeState;
  const isEarnDisabledByRuntimeContext =
    earnRuntimeState.isEarnDisabledByRuntimeContext || isLedgerLive;

  const isEarnDisabledByConfig = pages[EARN_PATH]?.shouldDisable ?? false;

  const isEarnDisabled =
    isEarnDisabledByRuntimeContext || isEarnDisabledByConfig;

  const isEarnPartial = !isEarnDisabled && someVaultsDisabledByURL;

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

    // In PARTIAL state: vault is enabled only if it's NOT in the URL-disabled list
    return (
      earnState === EARN_STATES.PARTIAL && !isVaultDisabledByUrl(vaultName)
    );
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
    isEarnVaultsForceDisabledByURL: someVaultsDisabledByURL,
    isVaultEnabled,
    isVaultDisabled,
  };
};

/**
 * Determines the earn state at runtime based on URL parameters and Ledger Live detection.
 *
 * **WARNING: It doesn't rely on external config, therefore it may not reflect the final earn state!**
 */
export const useEarnRuntimeState = () => {
  const { query, isReady } = useRouter();
  // query.app is read directly from the router (not useAppFlag/useIsLedgerLive) because this
  // hook is called from useExternalConfigContext inside ConfigProvider, before Web3Provider
  // (Wagmi) is mounted. The full connector-based check is applied separately in useEarnState.
  // Reading from query directly (vs AppFlagProvider) also works during SSR.
  const isLedgerLiveByFlag = query.app === 'ledger-live';

  // Cache the earn query param to prevent it from being lost on rerenders in iframe
  // (Next.js Router can have unstable query params in iframe due to History API limitations)
  if (isReady && query.earn && typeof query.earn === 'string') {
    setCachedEarnParam(query.earn);
  }

  // Use cached value if current query.earn is undefined, but we had it before
  const earnParam = query.earn || getCachedEarnParam();

  return computeEarnRuntimeState({
    isLedgerLive: isLedgerLiveByFlag,
    earnParam: typeof earnParam === 'string' ? earnParam : undefined,
    isReady,
  });
};
