import { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { isLedgerDappBrowserProvider } from 'web3-ledgerhq-frame-connector';
import { safeMultisigConnector } from 'config/connectors';

export const useUniqueConnector = (): boolean => {
  const [state, setState] = useState(false);

  useEffect(() => {
    const isLedger = isLedgerDappBrowserProvider();
    if (isLedger) return setState(true);

    const hasInjected = typeof window !== 'undefined' && !!window.ethereum;
    const isDappBrowser = isMobile && hasInjected;
    if (isDappBrowser) return setState(true);

    (async () => {
      const isGnosis = !!(await safeMultisigConnector?.isSafeApp());
      if (isGnosis) return setState(true);
    })();
  }, []);

  return state;
};
