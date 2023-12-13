import { useMemo } from 'react';
import { isDesktop } from 'react-device-detect';
import { useConnectorInfo } from 'reef-knot/web3-react';

const ONE_INCH_URL = 'https://app.1inch.io/#/1/swap/ETH/steth';
const LEDGER_LIVE_ONE_INCH_DESKTOP_DEEPLINK = 'ledgerlive://discover/1inch-lld';
const LEDGER_LIVE_ONE_INCH_MOBILE_DEEPLINK = 'ledgerlive://discover/1inch-llm';

export const use1inchLinkProps = () => {
  const { isLedgerLive } = useConnectorInfo();

  const linkProps = useMemo(() => {
    if (isLedgerLive) {
      const href = isDesktop
        ? LEDGER_LIVE_ONE_INCH_DESKTOP_DEEPLINK
        : LEDGER_LIVE_ONE_INCH_MOBILE_DEEPLINK;

      return {
        href,
        target: '_self',
      };
    } else {
      return {
        href: ONE_INCH_URL,
        target: '_blank',
        rel: 'noopener noreferrer',
      };
    }
  }, [isLedgerLive]);

  return linkProps;
};
