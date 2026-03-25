import {
  CowSwapWidget,
  CowSwapWidgetParams,
  CowSwapWidgetProps,
  EthereumProvider,
  TradeType,
} from '@cowprotocol/widget-react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { CowWidgetEvents } from '@cowprotocol/events';

import { useMemo, useState } from 'react';
import { useTheme } from 'styled-components';
import { ConnectorEventMap, useConnection, useWalletClient } from 'wagmi';
import { useAddressValidation } from 'providers/address-validation-provider';

export const DexOption = () => {
  const [isQueried, setIsQueried] = useState(false);

  const { validateAddress } = useAddressValidation();
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

  const listeners: CowSwapWidgetProps['listeners'] = useMemo(() => {
    const tryValidateAddress = async () => {
      // prevents spam to validation api on every event
      try {
        if (isQueried) return;
        setIsQueried(true);
        await validateAddress(walletClient?.account.address);
      } catch {
        setIsQueried(false);
      }
    };

    const res: CowSwapWidgetProps['listeners'] = [
      {
        event: CowWidgetEvents.ON_POSTED_ORDER,
        handler: async () => {
          // TODO: matomo
          await tryValidateAddress();
        },
      },
      {
        event: CowWidgetEvents.ON_ONCHAIN_TRANSACTION,
        handler: async () => {
          await tryValidateAddress();
        },
      },
      {
        event: CowWidgetEvents.ON_PRESIGNED_ORDER,
        handler: async () => {
          await tryValidateAddress();
        },
      },
    ];

    return res;
  }, [isQueried, validateAddress, walletClient?.account.address]);

  return (
    <CowSwapWidget params={params} listeners={listeners} provider={provider} />
  );
};
