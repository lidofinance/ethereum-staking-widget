import { useWithdrawalDex } from './use-withdrawal-dex';
import { CowswapDex } from 'shared/dexes/cowswap';
import { useDappStatus } from 'modules/web3';

import {
  DEX_SELL_TOKEN_LIST_URL,
  DEX_SELL_TOKEN_LIST_URL_FALLBACK,
  DEX_BUY_TOKEN_LIST_URL,
  DEX_BUY_TOKEN_LIST_URL_FALLBACK,
  useRefetchBalances,
  getNetworkTxConfig,
} from './cowswap';

export const DexWithdrawal = () => {
  const { integration } = useWithdrawalDex();
  const refetchBalances = useRefetchBalances();
  const { chainId } = useDappStatus();
  const networkTxConfig = getNetworkTxConfig(chainId);

  // eslint-disable-next-line sonarjs/no-small-switch
  switch (integration) {
    case 'cowswap':
      return (
        <CowswapDex
          sellTokenListUrl={DEX_SELL_TOKEN_LIST_URL}
          buyTokenListUrl={DEX_BUY_TOKEN_LIST_URL}
          sellTokenListUrlFallback={DEX_SELL_TOKEN_LIST_URL_FALLBACK}
          buyTokenListUrlFallback={DEX_BUY_TOKEN_LIST_URL_FALLBACK}
          refetchBalances={refetchBalances}
          networkTxConfig={networkTxConfig}
        />
      );
    default:
      return null;
  }
};
