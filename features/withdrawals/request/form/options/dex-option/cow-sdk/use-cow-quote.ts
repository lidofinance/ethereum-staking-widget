import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { formatUnits, type Address } from 'viem';

import { useDappStatus } from 'modules/web3';
import { QUOTE_REFRESH_INTERVAL, WHEN_PRICE_IMPACT_IS_HIGH_THAN } from '../consts';

import { cowApi } from './cow-api';
import { buildAppData } from './cow-app-data';
import type { CowQuoteResponse } from './types';

type UseCowQuoteProps = {
  sellToken: Address;
  buyToken: Address;
  sellAmount: bigint | null;
  sellDecimals: number;
  buyDecimals: number;
  receiver: Address | undefined;
  daoAgentAddress: string;
};

type QuoteResult = {
  quote: CowQuoteResponse | undefined;
  buyAmount: bigint | null;
  feeAmount: bigint | null;
  rate: string | null;
  priceImpact: number | null;
  isHighImpact: boolean;
  isLoading: boolean;
  error: Error | null;
};

export const useCowQuote = ({
  sellToken,
  buyToken,
  sellAmount,
  sellDecimals,
  buyDecimals,
  receiver,
  daoAgentAddress,
}: UseCowQuoteProps): QuoteResult => {
  const { chainId } = useDappStatus();

  const { fullAppData, appDataHash } = useMemo(
    () => buildAppData(daoAgentAddress),
    [daoAgentAddress],
  );

  const enabled = !!(sellAmount && sellAmount > 0n && receiver);

  const {
    data: quote,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      'cow-quote',
      chainId,
      sellToken,
      buyToken,
      sellAmount?.toString(),
      receiver,
    ],
    queryFn: () =>
      cowApi.getQuote(chainId, {
        sellToken,
        buyToken,
        from: receiver!,
        receiver: receiver!,
        sellAmountBeforeFee: sellAmount!.toString(),
        kind: 'sell',
        partiallyFillable: false,
        appData: fullAppData,
        appDataHash,
        signingScheme: 'eip712',
      }),
    enabled,
    refetchInterval: QUOTE_REFRESH_INTERVAL,
    staleTime: QUOTE_REFRESH_INTERVAL,
    retry: 1,
  });

  const buyAmount = quote ? BigInt(quote.quote.buyAmount) : null;
  const feeAmount = quote ? BigInt(quote.quote.feeAmount) : null;

  // Simple rate: buyAmount / (sellAmount - feeAmount)
  const rate = useMemo(() => {
    if (!sellAmount || !buyAmount || !feeAmount) return null;
    const effectiveSell = sellAmount - feeAmount;
    if (effectiveSell <= 0n) return null;
    const rateNum =
      Number(formatUnits(buyAmount, buyDecimals)) /
      Number(formatUnits(effectiveSell, sellDecimals));
    return rateNum.toFixed(6);
  }, [sellAmount, buyAmount, feeAmount, sellDecimals, buyDecimals]);

  // Price impact estimate: compare vs 1:1 for same-decimals tokens
  // For cross-type pairs (stETH→USDC) impact is less meaningful,
  // so we rely on CoW's verified quote quality
  const priceImpact = useMemo(() => {
    if (!sellAmount || !buyAmount || !feeAmount) return null;
    if (sellDecimals !== buyDecimals) return null; // can't compute for cross-type
    const effectiveSell = sellAmount - feeAmount;
    if (effectiveSell <= 0n) return null;
    // Impact = 1 - (buyAmount / effectiveSell)
    const impact =
      (1 - Number(buyAmount) / Number(effectiveSell)) * 100;
    return Math.max(0, impact);
  }, [sellAmount, buyAmount, feeAmount, sellDecimals, buyDecimals]);

  const isHighImpact =
    priceImpact !== null && priceImpact > WHEN_PRICE_IMPACT_IS_HIGH_THAN;

  return {
    quote,
    buyAmount,
    feeAmount,
    rate,
    priceImpact,
    isHighImpact,
    isLoading: isLoading && enabled,
    error: error as Error | null,
  };
};
