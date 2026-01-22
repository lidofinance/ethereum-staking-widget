import { useRouter } from 'next/router';
import { useIsIframe } from 'shared/hooks/use-is-iframe';
import { useUrlEnabledVaults } from './use-url-enabled-vaults';

export const useIsEarnDisabled = () => {
  const { query } = useRouter();
  const isIframe = useIsIframe();

  const { enabledVaults } = useUrlEnabledVaults();

  const someVaultsForceEnabled = enabledVaults.length > 0;
  const isEarnExplicitlyEnabled = query.earn === 'enabled';
  const isEarnExplicitlyDisabled = query.earn === 'disabled';

  // Earn page is disabled if:
  // - In iframe context
  //   and 'earn=enabled' is not explicitly set in URL  (opt-in required)
  // - OR 'earn=disabled' query parameter is explicitly set (opt-out)
  // - BUT some specific vaults can be force-enabled by URL, which keeps Earn page enabled
  return {
    isEarnDisabled:
      (isIframe && !isEarnExplicitlyEnabled) || isEarnExplicitlyDisabled,
    someVaultsForceEnabled,
  };
};
