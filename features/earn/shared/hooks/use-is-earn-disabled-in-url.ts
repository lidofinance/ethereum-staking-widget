import { useRouter } from 'next/router';
import { useIsIframe } from 'shared/hooks/use-is-iframe';
import { useUrlEnabledVaults } from './use-url-enabled-vaults';

// Earn states:
// - 'partial': Some vaults are force-enabled via URL (earn=partial with vaults)
// - 'disabled': Earn is completely disabled
// - 'enabled': Earn is fully enabled
export const EARN_STATES = {
  ENABLED: 'enabled',
  DISABLED: 'disabled',
  PARTIAL: 'partial',
} as const;

type EarnStateKey = keyof typeof EARN_STATES;
type EarnStateValue = (typeof EARN_STATES)[EarnStateKey];

export const useIsEarnDisabled = () => {
  const { query } = useRouter();
  const isIframe = useIsIframe();

  const { enabledVaults } = useUrlEnabledVaults();

  const someVaultsForceEnabled = enabledVaults.length > 0;
  const isEarnEnabledByURL = query.earn === EARN_STATES.ENABLED;
  const isEarnPartialByURL = query.earn === EARN_STATES.PARTIAL;
  const isEarnDisabledByURL = query.earn === EARN_STATES.DISABLED;

  // Earn page is disabled if:
  // - In iframe context
  //   and 'earn=enabled' or 'earn=partial' is not explicitly set in URL  (opt-in required)
  // - OR 'earn=partial' query parameter is explicitly set, BUT no vaults are force-enabled via URL
  // - OR 'earn=disabled' query parameter is explicitly set (opt-out)
  //
  // Earn page is partially enabled if:
  // - 'earn=partial' query parameter is explicitly set, AND some specific vaults are force-enabled by URL
  //
  // Otherwise and by default, Earn page is fully enabled

  const isEarnDisabled =
    (isIframe && !isEarnEnabledByURL && !isEarnPartialByURL) ||
    (isEarnPartialByURL && !someVaultsForceEnabled) ||
    isEarnDisabledByURL;

  const isEarnPartial = isEarnPartialByURL && someVaultsForceEnabled;

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
    isEarnDisabled,
    isEarnPartial,
    someVaultsForceEnabled,
  };
};
