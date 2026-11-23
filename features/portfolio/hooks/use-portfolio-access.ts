import { useRouter } from 'next/router';

import { useConfig } from 'config';
import { isDisabledPath } from 'config/external-config/disabled-path';
import { PORTFOLIO_PATH } from 'consts/urls';
import { useIsLedgerLive } from 'modules/web3';

const LEDGER_LIVE_APP = 'ledger-live';

// the page asks for no data until it is known to be offered here
export const usePortfolioAccess = () => {
  const { isReady, query } = useRouter();
  const isLedgerLive = useIsLedgerLive();
  const { pages } = useConfig().externalConfig;

  // the URL flag is read directly: the shared app flag lands a render later
  const isBlocked =
    isLedgerLive ||
    query.app === LEDGER_LIVE_APP ||
    isDisabledPath(PORTFOLIO_PATH, pages);

  return {
    isAllowed: isReady && !isBlocked,
    // the URL is not read yet
    isPending: !isReady && !isBlocked,
  };
};
