import { useCallback, useMemo, useState } from 'react';
import { parseUnits, formatUnits, type Address } from 'viem';
import { useWalletClient } from 'wagmi';
import styled from 'styled-components';
import invariant from 'tiny-invariant';

import { Button, DataTableRow, InlineLoader } from '@lidofinance/lido-ui';
import {
  useDappStatus,
  useStethBalance,
  useWstethBalance,
  useEthereumBalance,
} from 'modules/web3';
import { getContractAddress } from 'config/networks/contract-address';

import { SELL_TOKENS, BUY_TOKENS, getDefaultSellToken, getDefaultBuyToken } from './cow-tokens';
import { useCowQuote } from './use-cow-quote';
import { useCowApproval } from './use-cow-approval';
import { useCowOrder } from './use-cow-order';
import { useCowOrderStatus } from './use-cow-order-status';
import type { TokenInfo } from './types';

// --- Styled components ---

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 0;
`;

const TokenRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TokenSelect = styled.select`
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid var(--lido-color-border);
  background: var(--custom-background-secondary);
  color: var(--lido-color-text);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  min-width: 100px;
`;

const AmountInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid var(--lido-color-border);
  background: var(--custom-background-secondary);
  color: var(--lido-color-text);
  font-size: 16px;
  outline: none;

  &:focus {
    border-color: var(--lido-color-primary);
  }

  &::placeholder {
    color: var(--lido-color-textSecondary);
  }
`;

const EstimatedOutput = styled.div`
  font-size: 14px;
  color: var(--lido-color-textSecondary);
  min-width: 120px;
  text-align: right;
`;

const Arrow = styled.div`
  text-align: center;
  font-size: 20px;
  color: var(--lido-color-textSecondary);
`;

const QuoteInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 16px;
  border-radius: 10px;
  background: var(--custom-background-secondary);
`;

const StatusBanner = styled.div<{ $variant: 'pending' | 'success' | 'error' }>`
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
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
  font-size: 12px;
  text-align: center;
`;

const HighImpactWarning = styled.div`
  color: var(--lido-color-warning);
  font-size: 12px;
  padding: 8px;
  border-radius: 8px;
  background: var(--lido-color-warningBackground);
  text-align: center;
`;

// --- Component ---

export const DexOptionSdk = () => {
  const { chainId } = useDappStatus();
  const { data: walletClient } = useWalletClient();
  const { refetch: refetchSteth } = useStethBalance();
  const { refetch: refetchWsteth } = useWstethBalance();
  const { refetch: refetchEth } = useEthereumBalance();

  const daoAgentAddress = getContractAddress(chainId, 'daoAgent');
  invariant(daoAgentAddress, 'DAO Agent address is not defined for current network');

  // Token selection
  const sellTokens = SELL_TOKENS[chainId] ?? SELL_TOKENS[1];
  const buyTokens = BUY_TOKENS[chainId] ?? BUY_TOKENS[1];
  const [sellToken, setSellToken] = useState<TokenInfo>(getDefaultSellToken(chainId));
  const [buyToken, setBuyToken] = useState<TokenInfo>(getDefaultBuyToken(chainId));

  // Amount input
  const [amountStr, setAmountStr] = useState('');
  const sellAmount = useMemo(() => {
    if (!amountStr || isNaN(Number(amountStr))) return null;
    try {
      return parseUnits(amountStr, sellToken.decimals);
    } catch {
      return null;
    }
  }, [amountStr, sellToken.decimals]);

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
  const { signAndSubmit, isSubmitting, orderUid, error: orderError, reset: resetOrder } =
    useCowOrder({ quote, receiver });

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
    setAmountStr('');
  }, [resetOrder]);

  // Disable swap when price impact too high
  const tradeDisabled = isHighImpact || !quote || !sellAmount;

  return (
    <Wrapper>
      {/* Sell token */}
      <TokenRow>
        <TokenSelect
          value={sellToken.symbol}
          onChange={(e) => {
            const t = sellTokens.find((t) => t.symbol === e.target.value);
            if (t) setSellToken(t);
          }}
        >
          {sellTokens.map((t) => (
            <option key={t.symbol} value={t.symbol}>
              {t.symbol}
            </option>
          ))}
        </TokenSelect>
        <AmountInput
          type="text"
          inputMode="decimal"
          placeholder="0.0"
          value={amountStr}
          onChange={(e) => {
            const val = e.target.value;
            if (/^[0-9]*[.,]?[0-9]*$/.test(val)) {
              setAmountStr(val.replace(',', '.'));
            }
          }}
          disabled={!!orderUid && !isTerminal}
        />
      </TokenRow>

      <Arrow>↓</Arrow>

      {/* Buy token */}
      <TokenRow>
        <TokenSelect
          value={buyToken.symbol}
          onChange={(e) => {
            const t = buyTokens.find((t) => t.symbol === e.target.value);
            if (t) setBuyToken(t);
          }}
        >
          {buyTokens.map((t) => (
            <option key={t.symbol} value={t.symbol}>
              {t.symbol}
            </option>
          ))}
        </TokenSelect>
        <EstimatedOutput>
          {quoteLoading && <InlineLoader />}
          {!quoteLoading && buyAmount !== null && (
            <>≈ {Number(formatUnits(buyAmount, buyToken.decimals)).toFixed(6)} {buyToken.symbol}</>
          )}
        </EstimatedOutput>
      </TokenRow>

      {/* Quote details */}
      {quote && !orderUid && (
        <QuoteInfo>
          {rate && (
            <DataTableRow
              title="Rate"
              data-testid="cowSdkRate"
            >
              1 {sellToken.symbol} ≈ {rate} {buyToken.symbol}
            </DataTableRow>
          )}
          {feeAmount !== null && (
            <DataTableRow
              title="Fee"
              data-testid="cowSdkFee"
            >
              {Number(formatUnits(feeAmount, sellToken.decimals)).toFixed(6)} {sellToken.symbol}
            </DataTableRow>
          )}
          {priceImpact !== null && (
            <DataTableRow
              title="Price Impact"
              data-testid="cowSdkImpact"
            >
              {priceImpact.toFixed(2)}%
            </DataTableRow>
          )}
        </QuoteInfo>
      )}

      {/* High impact warning */}
      {isHighImpact && (
        <HighImpactWarning>
          Price impact is too high ({priceImpact?.toFixed(2)}%). Trade disabled for your protection.
        </HighImpactWarning>
      )}

      {/* Errors */}
      {quoteError && <ErrorText>{quoteError.message}</ErrorText>}
      {orderError && <ErrorText>{orderError.message}</ErrorText>}

      {/* Order status */}
      {orderUid && status === 'open' && (
        <StatusBanner $variant="pending">
          Order pending... Waiting for CoW Protocol to fill your order.
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
      {!orderUid && needsApproval && (
        <Button
          fullwidth
          loading={isApproving}
          disabled={isApproving}
          onClick={approve}
          data-testid="cowSdkApproveBtn"
        >
          {isApproving ? 'Approving...' : `Approve ${sellToken.symbol}`}
        </Button>
      )}

      {!orderUid && !needsApproval && (
        <Button
          fullwidth
          loading={isSubmitting || quoteLoading}
          disabled={tradeDisabled || isSubmitting}
          onClick={signAndSubmit}
          data-testid="cowSdkSwapBtn"
        >
          {isSubmitting ? 'Signing...' : 'Swap'}
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
