import { useRouter } from 'next/router';
import { useIsIframe } from 'shared/hooks/use-is-iframe';

// Earn states:
// - 'partial': Some vaults are force-enabled via URL (earn=vault1,vault2)
// - 'disabled': Earn is completely disabled
// - 'enabled': Earn is fully enabled
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

export const useEarnState = () => {
  const { query } = useRouter();
  const isIframe = useIsIframe();

  // Parse enabled vaults from URL param: ?earn=vault1,vault2
  let enabledVaults: string[] = [];
  if (
    query.earn &&
    typeof query.earn === 'string' &&
    !EARN_STATE_KEYWORDS.includes(query.earn as any) // Only treat as vault names if it's not a keyword (enabled/disabled)
  ) {
    enabledVaults = query.earn.split(',');
  }

  const isEarnVaultsForceEnabledByURL = enabledVaults.length > 0;
  const isEarnEnabledByURL = query.earn === EARN_STATES.ENABLED;
  const isEarnDisabledByURL = query.earn === EARN_STATES.DISABLED;

  // Earn page is disabled when:
  // - in iframe context, BUT it can be opt-in via URL
  // - if 'earn=disabled' query parameter is explicitly set (opt-out)
  //
  // Earn page is partially enabled if:
  // - specific vaults are force-enabled via URL (earn=vault1,vault2)
  //
  // Earn page is fully enabled with all vaults when:
  // - OR 'earn=enabled' is explicitly set in URL (opt-in)
  // - in all other cases (default behavior)

  const isEarnDisabled =
    (isIframe && !isEarnEnabledByURL && !isEarnVaultsForceEnabledByURL) ||
    isEarnDisabledByURL;

  const isEarnPartial = isEarnVaultsForceEnabledByURL;

  let earnState: EarnStateValue;
  if (isEarnPartial) {
    earnState = EARN_STATES.PARTIAL;
  } else if (isEarnDisabled) {
    earnState = EARN_STATES.DISABLED;
  } else {
    earnState = EARN_STATES.ENABLED;
  }

  return {
    earnState,
    isEarnEnabled: earnState === EARN_STATES.ENABLED,
    isEarnDisabled,
    isEarnPartial,
    isEarnVaultsForceEnabledByURL,
    enabledVaults,
    isVaultEnabled: (vaultName: string) => enabledVaults.includes(vaultName),
    isVaultDisabled: (vaultName: string) => !enabledVaults.includes(vaultName),
  };
};
