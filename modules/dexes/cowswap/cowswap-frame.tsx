import {
  CowSwapWidget,
  CowSwapWidgetPalette,
  CowSwapWidgetParams,
  CowSwapWidgetProps,
  TradeType,
} from '@cowprotocol/widget-react';
import { useCallback, useMemo } from 'react';
import { arbitrum, base, mainnet, sepolia } from 'viem/chains';
// eslint-disable-next-line import/no-extraneous-dependencies
import { CowWidgetEvents, OnTradeParamsPayload } from '@cowprotocol/events';
import { debounce } from 'lodash';
import { useTheme } from 'styled-components';
import { themeDark, themeLight } from '@lidofinance/lido-ui';

import { useDappStatus } from 'modules/web3';
import { LOCALE } from 'config/groups/locale';
import { useAddressValidation } from 'providers/address-validation-provider';
import { trackMatomoEvent } from 'utils/track-matomo-event';

import {
  MAX_SLIPPAGE,
  PARTNER_FEE_BPS,
  WHEN_PRICE_IMPACT_IS_HIGH_THAN,
  COWSWAP_BASE_URL,
  MAX_ORDER_AGE_MINUTES,
  TRADE_REPORT_EVENT_DEBOUNCE_MS,
} from './consts';
import {
  useCowSwapEthereumProvider,
  useCspBlocked,
  useIsGhAvailable,
  useLoadingStates,
} from './hooks';
import { useTradeGuard, TradeGuardModal } from './guards/trade';
import type { CowswapDefaultPair, CowswapProfile } from './profile';
import { shouldRefreshForSellToken } from './utils';
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

// widget card color per network: a light tint of the network color over the theme paper
const CHAIN_PAPER: Record<number, { light: string; dark: string }> = {
  [base.id]: { light: '#E9F0FF', dark: '#323C59' },
  [arbitrum.id]: { light: '#E3F5FF', dark: '#284459' },
};

const getCowSwapTheme = (
  themeName: string,
  chainId: number,
): CowSwapWidgetPalette => {
  const isDark = themeName === 'dark';
  const palette = isDark ? cowSwapThemeDark : cowSwapThemeLight;
  const paper = CHAIN_PAPER[chainId]?.[isDark ? 'dark' : 'light'];
  return paper ? { ...palette, paper } : palette;
};

export type CowswapFrameProps = {
  profile: CowswapProfile;
  refetchBalances: () => void;
  // subset of profile.chainIds still enabled, e.g. by the manifest
  chainIds?: readonly number[];
  // cancel the host Block bottom padding once loaded
  consumeBottomSpace?: boolean;
  // px, when the widget card is narrower than its iframe
  loaderMaxWidth?: number;
};

export const CowswapFrame: React.FC<CowswapFrameProps> = ({
  profile,
  refetchBalances,
  chainIds = profile.chainIds,
  consumeBottomSpace = true,
  loaderMaxWidth,
}) => {
  const {
    appCode,
    getDefaultPair,
    tokenLists,
    analytics,
    getNetworkTxConfig,
    tokenDecimals,
    oracleFeeds,
  } = profile;

  // throws on loading timeout/onError
  const { isLoading, isLoaded, onLoaded, onError, triggerRefresh, refreshId } =
    useLoadingStates();

  const { address, chainId, isTestnet } = useDappStatus();
  // dapp chain if enabled, else mainnet (sepolia on testnets)
  const widgetChainId = chainIds.includes(chainId)
    ? chainId
    : isTestnet
      ? sepolia.id
      : mainnet.id;
  const networkTxConfig = getNetworkTxConfig(widgetChainId);
  // shown as the error boundary fallback
  if (!networkTxConfig)
    throw new Error('CoW Swap is not enabled on this network');
  const { sellTokens, feeRecipient } = networkTxConfig;
  // set for every enabled network by createCowswapProfile
  const defaultPair = getDefaultPair(widgetChainId) as CowswapDefaultPair;
  const { validateAddress } = useAddressValidation();
  const { name: themeName } = useTheme();
  // Fall back to self-hosted token lists if GitHub is unavailable
  const isGithubAvailable = useIsGhAvailable(tokenLists.sell.url);
  // throw on CSP violation
  useCspBlocked();
  // throw on loading timeout

  const {
    modalState,
    handleModalClose,
    validateTrade,
    validateApproval,
    reportTradeParams,
    openTransactionGuardModal,
    openSigningErrorModal,
    verifySignedOrder,
    verifyApproval,
    rejectWrapOrUnwrap,
  } = useTradeGuard({
    isTestnet,
    tokenDecimals,
    oracleFeeds,
    quoteErrorEvent: analytics.quoteError,
  });

  const trackQuoteViewed = useMemo(
    () =>
      debounce(
        () => trackMatomoEvent(analytics.quoteViewed),
        TRADE_REPORT_EVENT_DEBOUNCE_MS,
      ),
    [analytics.quoteViewed],
  );

  const validate = useCallback(async () => {
    const isValid = await validateAddress(address);
    return isValid;
  }, [validateAddress, address]);

  const provider = useCowSwapEthereumProvider({
    verifySignedOrder,
    verifyApproval,
    openTransactionGuardModal,
    openSigningErrorModal,
    getNetworkTxConfig,
    appCode,
  });

  const params = useMemo<CowSwapWidgetParams>(
    () => ({
      //
      // Core options
      //
      appCode,
      standaloneMode: false,
      chainId: widgetChainId,
      baseUrl: COWSWAP_BASE_URL,

      //
      // Trading options
      //

      tradeType: TradeType.SWAP,
      enabledTradeTypes: [TradeType.SWAP],
      sell: {
        asset: defaultPair.sell,
      },
      buy: {
        asset: defaultPair.buy,
      },
      sellTokenLists: [
        isGithubAvailable
          ? tokenLists.sell.url
          : `${window.location.origin}/${tokenLists.sell.fallback}`,
      ],
      buyTokenLists: [
        isGithubAvailable
          ? tokenLists.buy.url
          : `${window.location.origin}/${tokenLists.buy.fallback}`,
      ],
      slippage: {
        max: MAX_SLIPPAGE,
      },
      partnerFee: {
        bps: PARTNER_FEE_BPS,
        recipient: feeRecipient,
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
      rootStyle: {
        height: 'var(--dynamicHeight, 432px)',
      },

      theme: getCowSwapTheme(themeName, widgetChainId),
      // enables opening explorer and `powered by cowswap` links
      // ONLY safe when used with pinned IPFS cowswap UI,
      // otherwise prone to security risks during domain takeover
      disableWindowOpen: false,
      disableSwitchingTokens: true,
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
          if (!(await validateApproval())) return false;
          return await validate();
        },
        // ETH ↔ WETH wrap/unwrap is not allowed; explain instead of failing silently
        onBeforeWrapOrUnwrap: rejectWrapOrUnwrap,
        onBeforeTrade: async (payload) => {
          if (!(await validateTrade(payload))) return false;

          trackMatomoEvent(analytics.swapStart);
          return await validate();
        },
        onBeforeOrderCancel: async () => {
          return await validate();
        },
        onBeforeOrdersCancel: async () => {
          return await validate();
        },
      },
      //ignored by widget but triggers refresh
      __EXTERNAL_REFRESH_ID__: refreshId,
    }),
    [
      appCode,
      defaultPair,
      tokenLists,
      analytics.swapStart,
      widgetChainId,
      isGithubAvailable,
      feeRecipient,
      themeName,
      refreshId,
      validateApproval,
      validate,
      validateTrade,
      rejectWrapOrUnwrap,
    ],
  );

  const listeners: CowSwapWidgetProps['listeners'] = useMemo(() => {
    const handlers: CowSwapWidgetProps['listeners'] = [
      {
        event: CowWidgetEvents.ON_POSTED_ORDER,
        handler: () => {
          trackMatomoEvent(analytics.swapPosted);
        },
      },
      {
        event: CowWidgetEvents.ON_FULFILLED_ORDER,
        handler: () => {
          void refetchBalances();
          trackMatomoEvent(analytics.swapFinish);
        },
      },
      {
        event: CowWidgetEvents.ON_CANCELLED_ORDER,
        handler: () => {
          trackMatomoEvent(analytics.swapCancel);
        },
      },
      {
        event: CowWidgetEvents.ON_EXPIRED_ORDER,
        handler: () => {
          trackMatomoEvent(analytics.swapCancel);
        },
      },
      {
        event: CowWidgetEvents.ON_CHANGE_TRADE_PARAMS,
        handler: (payload: OnTradeParamsPayload) => {
          trackQuoteViewed();
          // Force widget refresh to reset token selection outside the profile
          if (shouldRefreshForSellToken(payload, sellTokens)) {
            triggerRefresh();
            return;
          }
          reportTradeParams(payload);
        },
      },
    ];

    return handlers;
  }, [
    analytics,
    sellTokens,
    trackQuoteViewed,
    refetchBalances,
    reportTradeParams,
    triggerRefresh,
  ]);

  return (
    <>
      <DexWrapper $consumeBottomSpace={consumeBottomSpace && isLoaded}>
        <CowSwapWidget
          // remount with the loader reset: READY fires once per widget, params updates don't recreate it
          key={`${chainId}:${address ?? ''}`}
          provider={provider}
          params={params}
          listeners={listeners}
          enableSafeSdkBridge={false}
          onLoadingError={() =>
            onError(new Error('Failed to load CoW Swap widget'))
          }
          onReady={onLoaded}
        />
        <LoaderStyled $isVisible={isLoading} $maxWidth={loaderMaxWidth} />
      </DexWrapper>
      <TradeGuardModal state={modalState} onClose={handleModalClose} />
    </>
  );
};
