import {
  CowSwapWidget,
  CowSwapWidgetParams,
  EthereumProvider,
  TradeType,
} from '@cowprotocol/widget-react';
import { RequestFormInputType } from 'features/withdrawals/request/request-form-context';
import { ONE_stETH } from 'modules/web3';
import { useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { useTheme } from 'styled-components';
import { formatEther } from 'viem';
import { useConnection, useWalletClient } from 'wagmi';

export const DexOption = () => {
  const [token, amount] = useWatch<RequestFormInputType, ['token', 'amount']>({
    name: ['token', 'amount'],
  });
  const { data: walletClient } = useWalletClient();
  const { name: themeName } = useTheme();

  const params = useMemo<CowSwapWidgetParams>(
    () => ({
      appCode: 'Lido Staking Widget', // Name of your app (max 50 characters)
      width: '100%', // Width in pixels (or 100% to use all available space)
      height: '640px',
      chainId: 1, // 1 (Mainnet), 100 (Gnosis), 11155111 (Sepolia)
      tokenLists: [
        // All default enabled token lists. Also see https://tokenlists.org
        'https://files.cow.fi/tokens/CowSwap.json',
      ],
      tradeType: TradeType.SWAP, // TradeType.SWAP, TradeType.LIMIT or TradeType.ADVANCED
      sell: {
        // Sell token. Optionally add amount for sell orders
        asset: token,
        amount: formatEther(amount ?? ONE_stETH),
      },
      buy: {
        // Buy token. Optionally add amount for buy orders
        asset: 'ETH',
      },
      enabledTradeTypes: [
        // TradeType.SWAP, TradeType.LIMIT and/or TradeType.ADVANCED
        TradeType.SWAP,
        TradeType.LIMIT,
        TradeType.ADVANCED,
      ],
      theme: themeName === 'dark' ? 'dark' : 'light', // light/dark or provide your own color palette
      standaloneMode: false,
      disableToastMessages: true,
      disableProgressBar: false,
      hideBridgeInfo: false,
      hideOrdersTable: false,
      images: {},
      sounds: {},
      customTokens: [],
    }),
    [token, amount, themeName],
  );

  const { connector } = useConnection();

  const provider: EthereumProvider | undefined = useMemo(() => {
    if (!walletClient || !connector) return undefined;

    return {
      request: (args): Promise<any> => walletClient.request(args as any),
      on: (eventName, arg) => {
        connector?.emitter.on(eventName as any, arg as any);
      },
    };
  }, [walletClient, connector]);

  return <CowSwapWidget params={params} provider={provider} />;
};
