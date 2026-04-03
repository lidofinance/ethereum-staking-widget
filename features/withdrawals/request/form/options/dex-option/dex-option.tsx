import {
  CowSwapWidget,
  CowSwapWidgetPalette,
  CowSwapWidgetParams,
  CowSwapWidgetProps,
  EthereumProvider,
  TradeType,
} from '@cowprotocol/widget-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { CowWidgetEvents } from '@cowprotocol/events';

import { LOCALE } from 'config/groups/locale';
import { useTheme } from 'styled-components';
import { ConnectorEventMap, useConnection, useWalletClient } from 'wagmi';
import { useAddressValidation } from 'providers/address-validation-provider';
import { themeDark, themeLight } from '@lidofinance/lido-ui';
import { useDappStatus } from 'modules/web3';
import { getContractAddress } from 'config/networks/contract-address';
import invariant from 'tiny-invariant';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_TX_EVENTS_TYPES } from 'consts/matomo';
import { LoaderStyled, DexWrapper } from './styles';

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
  boxShadow: '0 12px 12px 0 rgba(5, 43, 101, 0.06)',
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
  boxShadow: '0 12px 12px 0 rgba(5, 43, 101, 0.06)',
};

export const DexOption = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const { isTestnet, chainId } = useDappStatus();

  const { validateAddress } = useAddressValidation();
  const { data: walletClient } = useWalletClient();
  const { name: themeName } = useTheme();

  const daoAgentAddress = getContractAddress(chainId, 'daoAgent');
  invariant(
    daoAgentAddress,
    'DAO Agent address is not defined for current network',
  );

  const validate = useCallback(async () => {
    const isValid = await validateAddress(walletClient?.account.address);
    return isValid;
  }, [validateAddress, walletClient?.account.address]);

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
      baseUrl: 'https://staging.swap.cow.fi', // TODO: change to production

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
        whenPriceImpactIsHigherThan: 3, // 3%
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
      disableProgressBar: true,
      hideBridgeInfo: false,
      hideOrdersTable: false,
      hideNetworkSelector: true,
      locale: LOCALE,
      disableTokenImport: true,
      hooks: {
        onBeforeApproval: async () => {
          return await validate();
        },
        onBeforeWrapOrUnwrap: async () => {
          return await validate();
        },
        onBeforeTrade: async () => {
          return await validate();
        },
        onBeforeOrderCancel: async () => {
          return await validate();
        },
        onBeforeOrdersCancel: async () => {
          return await validate();
        },
      },
    }),
    [isTestnet, daoAgentAddress, themeName, validate],
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
    const handlers: CowSwapWidgetProps['listeners'] = [
      {
        event: CowWidgetEvents.ON_CHANGE_TRADE_PARAMS,
        handler: () => {
          setIsLoading(false);
        },
      },
      {
        event: CowWidgetEvents.ON_POSTED_ORDER,
        handler: async () => {
          trackMatomoEvent(MATOMO_TX_EVENTS_TYPES.withdrawalDexSwapPosted);
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
  }, []);

  return (
    <DexWrapper>
      <CowSwapWidget
        params={params}
        listeners={listeners}
        provider={provider}
      />
      <LoaderStyled $isVisible={isLoading} />
    </DexWrapper>
  );
};
