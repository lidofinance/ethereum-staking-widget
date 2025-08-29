import { getAddress } from 'viem';

import { config } from 'config';
import { TOKENS, getTokenAddress } from 'config/networks/token-address';
import { standardFetcher } from './standardFetcher';
import { CHAINS } from '@lidofinance/lido-ethereum-sdk/common';

type BebopGetQuotePartial = {
  routes: {
    quote: {
      buyTokens: Record<
        string,
        {
          amount: string;
          amountBeforeFee: string;
        }
      >;
      sellTokens: Record<
        string,
        {
          amount: string;
          priceBeforeFee: number;
        }
      >;
    };
  }[];
};

type RateCalculationResult = { rate: number; toReceive: bigint };

export const getBebopRate = async (
  amount: bigint,
  fromToken: TOKENS,
  toToken: TOKENS,
): Promise<RateCalculationResult> => {
  const basePath = 'https://api.bebop.xyz/router/ethereum/v1/quote';

  const sell_tokens = getAddress(
    getTokenAddress(CHAINS.Mainnet, fromToken) as string,
  );
  const buy_tokens = getAddress(
    getTokenAddress(CHAINS.Mainnet, toToken) as string,
  );

  const params = new URLSearchParams({
    sell_tokens,
    buy_tokens,
    taker_address: config.ESTIMATE_ACCOUNT,
    sell_amounts: amount.toString(),
    approval_type: 'Standard',
    source: 'lido',
  });

  const data = await standardFetcher<BebopGetQuotePartial>(
    `${basePath}?${params.toString()}`,
  );

  const bestRoute = data.routes.sort(
    (r1, r2) =>
      r2.quote.sellTokens[sell_tokens].priceBeforeFee -
      r1.quote.sellTokens[sell_tokens].priceBeforeFee,
  )[0];

  if (
    bestRoute &&
    bestRoute.quote.sellTokens[sell_tokens] &&
    bestRoute.quote.buyTokens[buy_tokens]
  ) {
    const rate = data.routes[0].quote.sellTokens[sell_tokens].priceBeforeFee;

    const toAmount = BigInt(
      data.routes[0].quote.buyTokens[buy_tokens].amountBeforeFee,
    );
    return {
      rate,
      toReceive: toAmount,
    };
  }
  throw new Error('[getBebopRate] Could not get quote, invalid response body');
};
