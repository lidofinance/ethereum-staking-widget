import { useMemo } from 'react';
import { isDesktop } from 'react-device-detect';
import { useConnectorInfo } from 'reef-knot/web3-react';

const LEDGER_LIVE_ONE_INCH_DESKTOP_DEEPLINK = 'ledgerlive://discover/1inch-lld';
const LEDGER_LIVE_ONE_INCH_MOBILE_DEEPLINK = 'ledgerlive://discover/1inch-llm';

export const use1inchDeepLinkProps = () => {
  const { isLedgerLive } = useConnectorInfo();

  return useMemo(() => {
    if (isLedgerLive) {
      const href = isDesktop
        ? LEDGER_LIVE_ONE_INCH_DESKTOP_DEEPLINK
        : LEDGER_LIVE_ONE_INCH_MOBILE_DEEPLINK;

      return {
        href,
        target: '_self',
      };
    } else {
      return {};
    }
  }, [isLedgerLive]);
};
