import {
  CowSwapWidget,
  CowSwapWidgetParams,
  EthereumProvider,
  TradeType,
} from '@cowprotocol/widget-react';

import { useMemo } from 'react';
import { useTheme } from 'styled-components';
import { ConnectorEventMap, useConnection, useWalletClient } from 'wagmi';

export const DexOption = () => {
  const { data: walletClient } = useWalletClient();
  const { name: themeName } = useTheme();

  const params = useMemo<CowSwapWidgetParams>(
    () => ({
      appCode: 'Lido Staking Widget',

      // test app
      baseUrl: 'https://swap-dev-git-feat-widget-lido-1-cowswap-dev.vercel.app',
      // temp for testing
      sellTokenLists: [
        'https://raw.githubusercontent.com/lidofinance/ethereum-staking-widget/refs/heads/feature/si-2468-dex-withdrawal-integration/public/token-lists/withdrawals-dex-sell-tokenlist.json',
      ],
      buyTokenLists: [
        'https://raw.githubusercontent.com/lidofinance/ethereum-staking-widget/refs/heads/feature/si-2468-dex-withdrawal-integration/public/token-lists/withdrawals-dex-buy-tokenlist.json',
      ],
      partnerFee: {
        bps: 30,
        // Lido DAO treasury
        recipient: '0x3e40d73eb977dc6a537af587d48316fee66e9c8c',
      },
      hideRecentTokens: true,
      hideFavoriteTokens: true,
      disableTrade: {
        whenPriceImpactIsUnknown: true,
        whenPriceImpactIsHigherThan: 3,
      },
      slippage: {
        max: 300, // 3%
      },
      chainId: 1, // 1 (Mainnet), 100 (Gnosis), 11155111 (Sepolia)
      disableCrossChainSwap: true,
      sell: {
        // Sell token. Optionally add amount for sell orders
        asset: 'STETH',
      },
      buy: {
        // Buy token. Optionally add amount for buy orders
        asset: 'ETH',
      },
      tradeType: TradeType.SWAP, // TradeType.SWAP, TradeType.LIMIT or TradeType.ADVANCED

      enabledTradeTypes: [
        // TradeType.SWAP, TradeType.LIMIT and/or TradeType.ADVANCED
        TradeType.SWAP,
      ],
      width: '100%',
      theme: themeName === 'dark' ? 'dark' : 'light', // light/dark or provide your own color palette
      standaloneMode: false,
      disableToastMessages: true,
      disableProgressBar: false,
      hideBridgeInfo: false,
      hideOrdersTable: false,
    }),
    [themeName],
  );

  const { connector } = useConnection();

  const provider: EthereumProvider | undefined = useMemo(() => {
    if (!walletClient || !connector) return undefined;

    return {
      request: (args: any): Promise<any> => walletClient.request(args),
      on: (eventName: any, arg: any) => {
        connector?.emitter.on(eventName as keyof ConnectorEventMap, arg);
      },
    };
  }, [walletClient, connector]);

  return <CowSwapWidget params={params} provider={provider} />;
};
