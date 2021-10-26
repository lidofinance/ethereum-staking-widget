import { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { isLedgerDappBrowserProvider } from 'web3-ledgerhq-frame-connector';
import { SafeAppConnector } from '@gnosis.pm/safe-apps-web3-react';

const safeMultisigConnector =
  typeof window === 'undefined' ? null : new SafeAppConnector();

export const useUniqueConnector = (): boolean => {
  const [state, setState] = useState(false);

  useEffect(() => {
    const isLedger = isLedgerDappBrowserProvider();
    if (isLedger) return setState(true);

    const hasInjected =
      typeof window !== 'undefined' &&
      Object.prototype.hasOwnProperty.call(window, 'ethereum');
    const isDappBrowser = isMobile && hasInjected;
    if (isDappBrowser) return setState(true);

    (async () => {
      const isGnosis = await safeMultisigConnector?.isSafeApp();
      if (isGnosis) return setState(true);
    })();
  }, []);

  return state;
};
