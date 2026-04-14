import { useCallback, useMemo, useState } from 'react';
import { type Address } from 'viem';
import { useWalletClient } from 'wagmi';
import styled from 'styled-components';
import invariant from 'tiny-invariant';

import {
  Button,
  DataTable,
  DataTableRow,
  InlineLoader,
  Option,
  Eth,
  Steth,
  Wsteth,
} from '@lidofinance/lido-ui';
import {
  useDappStatus,
  useStethBalance,
  useWstethBalance,
  useEthereumBalance,
} from 'modules/web3';
import { getContractAddress } from 'config/networks/contract-address';
import { InputAmount } from 'shared/components/input-amount';
import { FormatToken } from 'shared/formatters';
import { Connect } from 'shared/wallet';
import { WarningBanner } from 'shared/banners/info-banner';
import { SelectIconStyle } from 'shared/hook-form/controls/token-select-hook-form/styles';

import {
  SELL_TOKENS,
  BUY_TOKENS,
  getDefaultSellToken,
  getDefaultBuyToken,
} from './cow-tokens';
import { useCowQuote } from './use-cow-quote';
import { useCowApproval } from './use-cow-approval';
import { useCowOrder } from './use-cow-order';
import { useCowOrderStatus } from './use-cow-order-status';
import type { TokenInfo } from './types';

// --- Token icon map ---

const TOKEN_ICONS: Record<string, JSX.Element> = {
  ETH: <Eth />,
  WETH: <Eth />,
  stETH: <Steth />,
  wstETH: <Wsteth />,
};

// --- Styled components (matching project patterns) ---

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.md}px;
`;

const InputRow = styled.div`
  display: flex;
  align-items: stretch;
  gap: ${({ theme }) => theme.spaceMap.sm}px;
`;

const SelectWrapper = styled.div`
  flex-shrink: 0;
`;

const InputWrapper = styled.div`
  flex: 1;
  min-width: 0;
`;

const OutputRow = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;
  background: var(--custom-background-secondary);
`;

const OutputLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizesMap.xxs}px;
  color: var(--lido-color-textSecondary);
`;

const OutputValue = styled.span`
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
  font-weight: 700;
  color: var(--lido-color-text);
`;

const StatusBanner = styled.div<{ $variant: 'pending' | 'success' | 'error' }>`
  padding: 12px 16px;
  border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;
  font-size: ${({ theme }) => theme.fontSizesMap.xxs}px;
  text-align: center;
  background: ${({ $variant }) =>
    $variant === 'success'
      ? 'var(--lido-color-success)'
      : $variant === 'error'
        ? 'var(--lido-color-error)'
        : 'var(--custom-background-secondary)'};
  color: ${({ $variant }) =>
    $variant === 'pending' ? 'var(--lido-color-text)' : 'white'};
`;

const ErrorText = styled.div`
  color: var(--lido-color-error);
  font-size: ${({ theme }) => theme.fontSizesMap.xxs}px;
  text-align: center;
`;

const ArrowDown = styled.div`
  text-align: center;
  font-size: 20px;
  color: var(--lido-color-textSecondary);
  line-height: 1;
`;

// --- Component ---

export const DexOptionSdk = () => {
  const { chainId, isWalletConnected, isDappActive } = useDappStatus();
  const { data: walletClient } = useWalletClient();
  const { data: stethBalance } = useStethBalance();
  const { data: wstethBalance } = useWstethBalance();
  const { refetch: refetchSteth } = useStethBalance();
  const { refetch: refetchWsteth } = useWstethBalance();
  const { refetch: refetchEth } = useEthereumBalance();

  const daoAgentAddress = getContractAddress(chainId, 'daoAgent');
  invariant(
    daoAgentAddress,
    'DAO Agent address is not defined for current network',
  );

  // Token selection
  const sellTokens = SELL_TOKENS[chainId] ?? SELL_TOKENS[1];
  const buyTokens = BUY_TOKENS[chainId] ?? BUY_TOKENS[1];
  const [sellToken, setSellToken] = useState<TokenInfo>(
    getDefaultSellToken(chainId),
  );
  const [buyToken, setBuyToken] = useState<TokenInfo>(
    getDefaultBuyToken(chainId),
  );

  // Amount input (bigint, managed by InputAmount)
  const [sellAmount, setSellAmount] = useState<bigint | null>(null);

  const maxBalance = useMemo(() => {
    if (sellToken.symbol === 'stETH') return stethBalance;
    if (sellToken.symbol === 'wstETH') return wstethBalance;
    return undefined;
  }, [sellToken.symbol, stethBalance, wstethBalance]);

  const receiver = walletClient?.account?.address as Address | undefined;

  // Quote
  const {
    quote,
    buyAmount,
    feeAmount,
    rate,
    priceImpact,
    isHighImpact,
    isLoading: quoteLoading,
    error: quoteError,
  } = useCowQuote({
    sellToken: sellToken.address,
    buyToken: buyToken.address,
    sellAmount,
    sellDecimals: sellToken.decimals,
    buyDecimals: buyToken.decimals,
    receiver,
    daoAgentAddress,
  });

  // Approval
  const { needsApproval, isApproving, approve } = useCowApproval({
    token: sellToken.address,
    amount: sellAmount,
  });

  // Order
  const {
    signAndSubmit,
    isSubmitting,
    orderUid,
    error: orderError,
    reset: resetOrder,
  } = useCowOrder({ quote, receiver });

  // Order status
  const refreshBalances = useCallback(() => {
    void Promise.allSettled([refetchSteth(), refetchWsteth(), refetchEth()]);
  }, [refetchSteth, refetchWsteth, refetchEth]);

  const { status, isTerminal } = useCowOrderStatus({
    orderUid,
    onFulfilled: refreshBalances,
  });

  // New swap after completion
  const handleNewSwap = useCallback(() => {
    resetOrder();
    setSellAmount(null);
  }, [resetOrder]);

  // Disable swap when price impact too high
  const tradeDisabled = isHighImpact || !quote || !sellAmount;
  const isOrderActive = !!orderUid && !isTerminal;

  // Rate as bigint for FormatToken
  const rateBigint = useMemo(() => {
    if (!rate) return null;
    try {
      return BigInt(Math.round(Number(rate) * 10 ** buyToken.decimals));
    } catch {
      return null;
    }
  }, [rate, buyToken.decimals]);

  return (
    <Wrapper>
      {/* Sell: token select + amount input */}
      <InputRow>
        <SelectWrapper>
          <SelectIconStyle
            icon={TOKEN_ICONS[sellToken.symbol]}
            value={sellToken.symbol}
            onChange={(value) => {
              const t = sellTokens.find((tk) => tk.symbol === value);
              if (t) {
                setSellToken(t);
                setSellAmount(null);
              }
            }}
            disabled={isOrderActive}
          >
            {sellTokens.map((t) => (
              <Option
                key={t.symbol}
                value={t.symbol}
                leftDecorator={TOKEN_ICONS[t.symbol]}
              >
                {t.symbol}
              </Option>
            ))}
          </SelectIconStyle>
        </SelectWrapper>
        <InputWrapper>
          <InputAmount
            value={sellAmount}
            onChange={setSellAmount}
            maxValue={maxBalance}
            decimals={sellToken.decimals}
            label={`${sellToken.symbol} amount`}
            disabled={isOrderActive}
            fullwidth
            data-testid="cowSdkAmountInput"
          />
        </InputWrapper>
      </InputRow>

      <ArrowDown>↓</ArrowDown>

      {/* Buy: token select + estimated output */}
      <InputRow>
        <SelectWrapper>
          <SelectIconStyle
            icon={TOKEN_ICONS[buyToken.symbol]}
            value={buyToken.symbol}
            onChange={(value) => {
              const t = buyTokens.find((tk) => tk.symbol === value);
              if (t) setBuyToken(t);
            }}
            disabled={isOrderActive}
          >
            {buyTokens.map((t) => (
              <Option
                key={t.symbol}
                value={t.symbol}
                leftDecorator={TOKEN_ICONS[t.symbol]}
              >
                {t.symbol}
              </Option>
            ))}
          </SelectIconStyle>
        </SelectWrapper>
        <OutputRow>
          <OutputLabel>You receive</OutputLabel>
          <OutputValue>
            {quoteLoading && <InlineLoader />}
            {!quoteLoading && buyAmount !== null && (
              <FormatToken
                amount={buyAmount}
                symbol={buyToken.symbol}
                approx
                decimals={buyToken.decimals}
                data-testid="cowSdkBuyAmount"
              />
            )}
            {!quoteLoading && buyAmount === null && '—'}
          </OutputValue>
        </OutputRow>
      </InputRow>

      {/* Quote details */}
      {quote && !orderUid && (
        <DataTable data-testid="cowSdkQuoteInfo">
          {rateBigint !== null && (
            <DataTableRow title="Exchange rate" data-testid="cowSdkRate">
              1 {sellToken.symbol} ={' '}
              <FormatToken
                amount={rateBigint}
                symbol={buyToken.symbol}
                decimals={buyToken.decimals}
              />
            </DataTableRow>
          )}
          {feeAmount !== null && (
            <DataTableRow title="Network fee" data-testid="cowSdkFee">
              <FormatToken
                amount={feeAmount}
                symbol={sellToken.symbol}
                decimals={sellToken.decimals}
              />
            </DataTableRow>
          )}
          {priceImpact !== null && (
            <DataTableRow title="Price impact" data-testid="cowSdkImpact">
              {priceImpact.toFixed(2)}%
            </DataTableRow>
          )}
        </DataTable>
      )}

      {/* High impact warning */}
      {isHighImpact && (
        <WarningBanner>
          Price impact is too high ({priceImpact?.toFixed(2)}%). Trade disabled
          for your protection.
        </WarningBanner>
      )}

      {/* Errors */}
      {quoteError && <ErrorText>{quoteError.message}</ErrorText>}
      {orderError && <ErrorText>{orderError.message}</ErrorText>}

      {/* Order status */}
      {orderUid && status === 'open' && (
        <StatusBanner $variant="pending">
          Order pending… Waiting for CoW Protocol to fill your order.
        </StatusBanner>
      )}
      {orderUid && status === 'fulfilled' && (
        <StatusBanner $variant="success">
          Order fulfilled! Your swap has been completed.
        </StatusBanner>
      )}
      {orderUid && (status === 'expired' || status === 'cancelled') && (
        <StatusBanner $variant="error">
          Order {status}. Please try again.
        </StatusBanner>
      )}

      {/* Action buttons */}
      {!isWalletConnected && <Connect fullwidth />}

      {isWalletConnected && !orderUid && needsApproval && (
        <Button
          fullwidth
          loading={isApproving}
          disabled={isApproving || !isDappActive}
          onClick={approve}
          data-testid="cowSdkApproveBtn"
        >
          {isApproving ? 'Approving…' : `Approve ${sellToken.symbol}`}
        </Button>
      )}

      {isWalletConnected && !orderUid && !needsApproval && (
        <Button
          fullwidth
          loading={isSubmitting || quoteLoading}
          disabled={tradeDisabled || isSubmitting || !isDappActive}
          onClick={signAndSubmit}
          data-testid="cowSdkSwapBtn"
        >
          {isSubmitting ? 'Signing…' : 'Swap'}
        </Button>
      )}

      {isTerminal && (
        <Button
          fullwidth
          variant="outlined"
          onClick={handleNewSwap}
          data-testid="cowSdkNewSwapBtn"
        >
          New Swap
        </Button>
      )}
    </Wrapper>
  );
};
