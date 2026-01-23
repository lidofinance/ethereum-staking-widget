import { useRouter } from 'next/router';
import { useIsIframe } from 'shared/hooks/use-is-iframe';
import { useUrlEnabledVaults } from './use-url-enabled-vaults';

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

  const isEarnDisabled =
    (isIframe && !isEarnEnabledByURL && !isEarnPartialByURL) ||
    (isEarnPartialByURL && !someVaultsForceEnabled) ||
    isEarnDisabledByURL;

  const isEarnPartial = isEarnPartialByURL && someVaultsForceEnabled;

  // Earn page is disabled if:
  // - In iframe context
  //   and 'earn=enabled' or 'earn=partial' is not explicitly set in URL  (opt-in required)
  // - OR 'earn=disabled' query parameter is explicitly set (opt-out)
  // - BUT some specific vaults can be force-enabled by URL, which keeps Earn page enabled in partial mode
  //
  // Earn states:
  // - 'partial': Some vaults are force-enabled via URL (earn=partial with vaults)
  // - 'disabled': Earn is completely disabled
  // - 'enabled': Earn is fully enabled
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
