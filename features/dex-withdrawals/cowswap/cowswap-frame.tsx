import {
  CowSwapWidget,
  CowSwapWidgetPalette,
  CowSwapWidgetParams,
  CowSwapWidgetProps,
  TradeType,
} from '@cowprotocol/widget-react';
import { useCallback, useMemo } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { CowWidgetEvents, OnTradeParamsPayload } from '@cowprotocol/events';

import { LOCALE } from 'config/groups/locale';
import { useTheme } from 'styled-components';
import { useWalletClient } from 'wagmi';
import { useAddressValidation } from 'providers/address-validation-provider';
import { themeDark, themeLight } from '@lidofinance/lido-ui';
import { useDappStatus } from 'modules/web3';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_TX_EVENTS_TYPES } from 'consts/matomo';

import {
  MAX_SLIPPAGE,
  PARTNER_FEE_BPS,
  DEX_SELL_TOKEN_LIST_URL,
  DEX_BUY_TOKEN_LIST_URL,
  WHEN_PRICE_IMPACT_IS_HIGH_THAN,
  LIDO_APP_CODE,
  COWSWAP_BASE_URL,
  MAX_ORDER_AGE_MINUTES,
} from './consts';
import { LoaderStyled, DexWrapper } from './styles';
import {
  useCowSwapEthereumProvider,
  useCspBlocked,
  useFeeRecipient,
  useIsGhAvailable,
  useLoadingStates,
  useRefetchBalances,
} from './hooks';

import { useTradeGuard, TradeGuardModal } from './trade-guard';

const cowSwapThemeDark: CowSwapWidgetPalette = {
  baseTheme: 'dark',
  primary: themeDark.colors.primary,
  background: themeDark.colors.background,
  paper: '#2D2D35',
  text: themeDark.colors.text,
  warning: themeDark.colors.warning,
  alert: themeDark.colors.warningBackground,
  danger: themeDark.colors.error,
  info: themeDark.colors.warning,
  success: themeDark.colors.success,
  // boxShadow: '0 12px 12px 0 rgba(5, 43, 101, 0.06)', // TODO: wait fix from CowSwap team
  boxShadow: 'none',
};

const cowSwapThemeLight: CowSwapWidgetPalette = {
  baseTheme: 'light',
  primary: themeLight.colors.primary,
  background: '#F2F2F2',
  paper: themeLight.colors.foreground,
  text: themeLight.colors.text,
  warning: themeLight.colors.warning,
  alert: themeLight.colors.warning,
  danger: themeLight.colors.error,
  info: themeLight.colors.warning,
  success: themeLight.colors.success,
  // boxShadow: '0 12px 12px 0 rgba(5, 43, 101, 0.06)', // TODO: wait fix from CowSwap team
  boxShadow: 'none',
};

export const CowswapFrame = () => {
  // throws on loading timeout/onError
  const { isLoading, onLoaded, onError } = useLoadingStates();

  const { isTestnet } = useDappStatus();
  const { validateAddress } = useAddressValidation();
  const { data: walletClient } = useWalletClient();
  const { name: themeName } = useTheme();
  // Fall back to self-hosted token lists if GitHub is unavailable
  const isGithubAvailable = useIsGhAvailable();
  const refreshBalances = useRefetchBalances();
  const daoAgentAddress = useFeeRecipient();
  // throw on CSP violation
  useCspBlocked();
  // throw on loading timeout

  const {
    modalState,
    handleModalClose,
    validateTrade,
    validateApproval,
    reportTradeParams,
    checkSellLimit,
    openTransactionGuardModal,
    verifySignedOrder,
  } = useTradeGuard({
    isTestnet,
  });

  const validate = useCallback(async () => {
    const isValid = await validateAddress(walletClient?.account.address);
    return isValid;
  }, [validateAddress, walletClient?.account.address]);

  const provider = useCowSwapEthereumProvider(
    verifySignedOrder,
    openTransactionGuardModal,
  );

  const params = useMemo<CowSwapWidgetParams>(
    () => ({
      //
      // Core options
      //
      appCode: LIDO_APP_CODE,
      standaloneMode: false,
      // for testnets only sepolia
      chainId: isTestnet ? 11155111 : 1,
      baseUrl: COWSWAP_BASE_URL,

      //
      // Trading options
      //

      // TODO: disable more features after package update
      tradeType: TradeType.SWAP,
      enabledTradeTypes: [TradeType.SWAP],
      sell: {
        asset: 'STETH',
      },
      buy: {
        asset: 'ETH',
      },
      sellTokenLists: [
        isGithubAvailable
          ? DEX_SELL_TOKEN_LIST_URL
          : `${window.location.origin}/token-lists/withdrawals-dex-sell-tokenlist.json`,
      ],
      buyTokenLists: [
        isGithubAvailable
          ? DEX_BUY_TOKEN_LIST_URL
          : `${window.location.origin}/token-lists/withdrawals-dex-buy-tokenlist.json`,
      ],
      slippage: {
        max: MAX_SLIPPAGE,
      },
      partnerFee: {
        bps: PARTNER_FEE_BPS,
        recipient: daoAgentAddress,
      },
      disableTrade: {
        whenPriceImpactIsUnknown: true,
        whenPriceImpactIsHigherThan: WHEN_PRICE_IMPACT_IS_HIGH_THAN,
      },
      disableCrossChainSwap: true,
      disableCustomRecipient: true,
      disableEIP2612Permits: true,
      disableInfiniteApprove: true,
      forcedOrderDeadline: MAX_ORDER_AGE_MINUTES,

      //
      // UI options
      //

      width: '100%',
      height: '432px',
      theme: themeName === 'dark' ? cowSwapThemeDark : cowSwapThemeLight,
      disableWindowOpen: true,
      disablePostedOrderConfirmationModal: true,
      disableTokenImport: true,
      disablePostTradeTips: true,
      hideRecentTokens: true,
      hideFavoriteTokens: true,
      disableToastMessages: true,
      disableProgressBar: false,
      sounds: {
        postOrder: null,
        orderExecuted: null,
        orderError: null,
      },
      hideBridgeInfo: false,
      hideOrdersTable: false,
      hideNetworkSelector: true,
      locale: LOCALE,

      hooks: {
        onBeforeApproval: async () => {
          if (!(await checkSellLimit())) return false;
          if (!(await validateApproval())) return false;

          return await validate();
        },
        onBeforeWrapOrUnwrap: async () => {
          if (!(await checkSellLimit())) return false;

          return await validate();
        },
        onBeforeTrade: async (payload) => {
          if (!(await checkSellLimit())) return false;
          if (!(await validateTrade(payload))) return false;

          trackMatomoEvent(MATOMO_TX_EVENTS_TYPES.withdrawalDexSwapStart);
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
    [
      isTestnet,
      isGithubAvailable,
      daoAgentAddress,
      themeName,
      checkSellLimit,
      validateApproval,
      validate,
      validateTrade,
    ],
  );

  const listeners: CowSwapWidgetProps['listeners'] = useMemo(() => {
    const handlers: CowSwapWidgetProps['listeners'] = [
      {
        event: CowWidgetEvents.ON_POSTED_ORDER,
        handler: () => {
          trackMatomoEvent(MATOMO_TX_EVENTS_TYPES.withdrawalDexSwapPosted);
        },
      },
      {
        event: CowWidgetEvents.ON_FULFILLED_ORDER,
        handler: () => {
          void refreshBalances();
          trackMatomoEvent(MATOMO_TX_EVENTS_TYPES.withdrawalDexSwapFinish);
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
      {
        event: CowWidgetEvents.ON_CHANGE_TRADE_PARAMS,
        handler: (payload: OnTradeParamsPayload) => {
          reportTradeParams(payload);
        },
      },
    ];

    return handlers;
  }, [refreshBalances, reportTradeParams]);

  return (
    <>
      <DexWrapper>
        <CowSwapWidget
          provider={provider}
          params={params}
          listeners={listeners}
          enableSafeSdkBridge={false}
          onLoadingError={() =>
            onError(new Error('Failed to load CoW Swap widget'))
          }
          onReady={onLoaded}
        />
        <LoaderStyled $isVisible={isLoading} />
      </DexWrapper>
      <TradeGuardModal state={modalState} onClose={handleModalClose} />
    </>
  );
};
