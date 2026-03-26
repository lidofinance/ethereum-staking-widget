import {
  CowSwapWidget,
  CowSwapWidgetPalette,
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
import { themeDark, themeLight } from '@lidofinance/lido-ui';
import { useDappStatus } from 'modules/web3';
import { getContractAddress } from 'config/networks/contract-address';
import invariant from 'tiny-invariant';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_TX_EVENTS_TYPES } from 'consts/matomo';

const cowSwapThemeDark: CowSwapWidgetPalette = {
  baseTheme: 'dark',
  primary: themeDark.colors.primary,
  background: themeDark.colors.background,
  paper: '#2D2D35',
  text: themeDark.colors.text,
  warning: themeDark.colors.warning,
  alert: themeDark.colors.warningBackground,
  danger: themeDark.colors.error,
  info: themeDark.colors.error,
  success: themeDark.colors.success,
};

const cowSwapThemeLight: CowSwapWidgetPalette = {
  baseTheme: 'light',
  primary: themeLight.colors.primary,
  background: '#F2F2F2',
  paper: themeLight.colors.foreground,
  text: themeLight.colors.text,
  warning: themeLight.colors.warning,
  alert: themeLight.colors.warningBackground,
  danger: themeLight.colors.error,
  info: themeLight.colors.error,
  success: themeLight.colors.success,
};

export const DexOption = () => {
  const [isQueried, setIsQueried] = useState(false);
  const { isTestnet, chainId } = useDappStatus();

  const { validateAddress } = useAddressValidation();
  const { data: walletClient } = useWalletClient();
  const { name: themeName } = useTheme();

  const daoAgentAddress = getContractAddress(chainId, 'daoAgent');
  invariant(
    daoAgentAddress,
    'DAO Agent address is not defined for current network',
  );

  const params = useMemo<CowSwapWidgetParams>(
    () => ({
      //
      // Core options
      //
      appCode: 'Lido Staking Widget',
      standaloneMode: false,
      // for testnets only sepolia
      chainId: isTestnet ? 11155111 : 1,
      // test app
      baseUrl: 'https://swap-dev-git-feat-widget-lido-1-cowswap-dev.vercel.app',

      //
      // Trading options
      //

      tradeType: TradeType.SWAP,
      enabledTradeTypes: [TradeType.SWAP],
      sell: {
        asset: 'STETH',
      },
      buy: {
        asset: 'ETH',
      },
      // temp for testing
      sellTokenLists: [
        'https://raw.githubusercontent.com/lidofinance/ethereum-staking-widget/refs/heads/feature/si-2468-dex-withdrawal-integration/public/token-lists/withdrawals-dex-sell-tokenlist.json',
      ],
      buyTokenLists: [
        'https://raw.githubusercontent.com/lidofinance/ethereum-staking-widget/refs/heads/feature/si-2468-dex-withdrawal-integration/public/token-lists/withdrawals-dex-buy-tokenlist.json',
      ],
      slippage: {
        max: 300, // 3%
      },
      partnerFee: {
        bps: 30,
        // Lido DAO treasury
        recipient: daoAgentAddress,
      },
      disableTrade: {
        whenPriceImpactIsUnknown: true,
        whenPriceImpactIsHigherThan: 3,
      },
      disableCrossChainSwap: true,

      //
      // UI options
      //

      width: '100%',
      height: '432px',
      theme: themeName === 'dark' ? cowSwapThemeDark : cowSwapThemeLight,
      hideRecentTokens: true,
      hideFavoriteTokens: true,
      disableToastMessages: true,
      disableProgressBar: false,
      hideBridgeInfo: false,
      hideOrdersTable: false,
      hideNetworkSelector: true,
    }),
    [isTestnet, daoAgentAddress, themeName],
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

    const handlers: CowSwapWidgetProps['listeners'] = [
      {
        event: CowWidgetEvents.ON_POSTED_ORDER,
        handler: async () => {
          trackMatomoEvent(MATOMO_TX_EVENTS_TYPES.withdrawalDexSwapPosted);
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
        event: CowWidgetEvents.ON_FULFILLED_ORDER,
        handler: () => {
          trackMatomoEvent(MATOMO_TX_EVENTS_TYPES.withdrawalClaimFinish);
        },
      },
      {
        event: CowWidgetEvents.ON_CANCELLED_ORDER,
        handler: () => {
          trackMatomoEvent(MATOMO_TX_EVENTS_TYPES.withdrawalDexSwapCancel);
        },
      },
      {
        event: CowWidgetEvents.ON_EXPIRED_ORDER,
        handler: () => {
          trackMatomoEvent(MATOMO_TX_EVENTS_TYPES.withdrawalDexSwapCancel);
        },
      },
    ];

    return handlers;
  }, [isQueried, validateAddress, walletClient?.account.address]);

  return (
    <CowSwapWidget params={params} listeners={listeners} provider={provider} />
  );
};
