import {
  CowSwapWidget,
  CowSwapWidgetPalette,
  CowSwapWidgetParams,
  CowSwapWidgetProps,
  TradeType,
} from '@cowprotocol/widget-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
// eslint-disable-next-line import/no-extraneous-dependencies
import { CowWidgetEvents, OnTradeParamsPayload } from '@cowprotocol/events';

import { LOCALE } from 'config/groups/locale';
import { STRATEGY_IMMUTABLE } from 'consts/react-query-strategies';
import { useTheme } from 'styled-components';
import { useWalletClient } from 'wagmi';
import { useAddressValidation } from 'providers/address-validation-provider';
import { themeDark, themeLight } from '@lidofinance/lido-ui';
import {
  useDappStatus,
  useEthereumBalance,
  useStethBalance,
  useWstethBalance,
} from 'modules/web3';
import { getContractAddress } from 'config/networks/contract-address';
import invariant from 'tiny-invariant';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_TX_EVENTS_TYPES } from 'consts/matomo';
import {
  DEX_SELL_TOKEN_LIST_URL,
  DEX_BUY_TOKEN_LIST_URL,
} from 'consts/external-links';

import {
  MAX_SLIPPAGE,
  PARTNER_FEE_BPS,
  WHEN_PRICE_IMPACT_IS_HIGH_THAN,
} from './consts';
import { LoaderStyled, DexWrapper, SellAmountWarning } from './styles';
import { useCowSwapEthereumProvider } from './use-cow-swap-ethereum-provider';
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

export const DexOption = () => {
  const { refetch: refetchSteth } = useStethBalance();
  const { refetch: refetchWsteth } = useWstethBalance();
  const { refetch: refetchEth } = useEthereumBalance();
  // state to trigger refreshes to memoized params
  const [refreshId, setRefreshId] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [cspBlocked, setCspBlocked] = useState<Error | null>(null);

  const refreshBalances = useCallback(() => {
    void Promise.allSettled([refetchSteth(), refetchWsteth(), refetchEth()]);
  }, [refetchEth, refetchSteth, refetchWsteth]);

  // Fall back to self-hosted token lists if GitHub is unavailable
  const { data: isGithubAvailable = true } = useQuery({
    queryKey: ['dex-token-list-availability'],
    ...STRATEGY_IMMUTABLE,
    queryFn: () =>
      fetch(DEX_SELL_TOKEN_LIST_URL, { method: 'HEAD' })
        .then((res) => res.ok)
        .catch(() => false),
  });

  useEffect(() => {
    const handler = (e: SecurityPolicyViolationEvent) => {
      if (
        (e.violatedDirective === 'child-src' ||
          e.violatedDirective === 'frame-src') &&
        e.blockedURI.includes('cow.fi')
      ) {
        setCspBlocked(new Error('CSP blocked CoW widget iframe'));
      }
    };
    document.addEventListener('securitypolicyviolation', handler);
    return () =>
      document.removeEventListener('securitypolicyviolation', handler);
  }, []);

  if (cspBlocked) throw cspBlocked;

  const { isTestnet, chainId } = useDappStatus();

  const { validateAddress } = useAddressValidation();
  const { data: walletClient } = useWalletClient();
  const { name: themeName } = useTheme();

  const daoAgentAddress = getContractAddress(chainId, 'daoAgent');
  invariant(
    daoAgentAddress,
    'DAO Agent address is not defined for current network',
  );

  const {
    modalState,
    handleModalClose,
    validateTrade,
    sellLimitStatus,
    reportSellAmount,
    checkSellLimit,
  } = useTradeGuard({
    walletAddress: walletClient?.account.address,
    isTestnet,
  });

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
      baseUrl: 'https://swap.cow.fi',

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

      //
      // UI options
      //

      width: '100%',
      height: '432px',
      theme: themeName === 'dark' ? cowSwapThemeDark : cowSwapThemeLight,

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
    // eslint-disable-next-line  react-hooks/exhaustive-deps
    [
      isTestnet,
      daoAgentAddress,
      themeName,
      validate,
      validateTrade,
      isGithubAvailable,
      refreshId,
    ],
  );

  const provider = useCowSwapEthereumProvider();

  const listeners: CowSwapWidgetProps['listeners'] = useMemo(() => {
    const handlers: CowSwapWidgetProps['listeners'] = [
      {
        event: CowWidgetEvents.ON_POSTED_ORDER,
        handler: async () => {
          trackMatomoEvent(MATOMO_TX_EVENTS_TYPES.withdrawalDexSwapPosted);
        },
      },
      {
        event: CowWidgetEvents.ON_FULFILLED_ORDER,
        handler: () => {
          refreshBalances();
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
        handler: (params: OnTradeParamsPayload) => {
          // Check sell amount against max threshold (QA can only lower)
          reportSellAmount(Number(params.sellTokenAmount?.units));

          // Workaround: refresh params if user changes sell token
          const { sellToken } = params;
          if (
            !sellToken ||
            sellToken.symbol.toLowerCase() === 'steth' ||
            sellToken.symbol.toLowerCase() === 'wsteth'
          )
            return;
          setRefreshId((id) => id + 1);
        },
      },
    ];

    return handlers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshBalances]);

  return (
    <>
      <DexWrapper>
        <CowSwapWidget
          params={params}
          listeners={listeners}
          provider={provider}
          onReady={() => setIsLoading(false)}
        />
        <LoaderStyled $isVisible={isLoading} />
      </DexWrapper>
      {sellLimitStatus.exceeded && (
        <SellAmountWarning>
          Maximum sell amount is{' '}
          {sellLimitStatus.maxSellUnits.toLocaleString()} tokens per
          transaction
        </SellAmountWarning>
      )}
      <TradeGuardModal state={modalState} onClose={handleModalClose} />
    </>
  );
};
