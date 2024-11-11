import { getAddress } from 'ethers/lib/utils.js';
import { CHAINS, getTokenAddress, TOKENS } from '@lido-sdk/constants';
import { config } from 'config';
import { standardFetcher } from './standardFetcher';

import { TOKENS_WITHDRAWABLE } from '../features/withdrawals/types/tokens-withdrawable';
import { TOKENS_WRAPPABLE } from '../features/wsteth/shared/types';

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

type RateToken = TOKENS_WITHDRAWABLE | TOKENS_WRAPPABLE;

type RateCalculationResult = { rate: number; toReceive: bigint };

const getRateTokenAddress = (token: RateToken) =>
  token === 'ETH'
    ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    : getTokenAddress(CHAINS.Mainnet, token as TOKENS);

export const getBebopRate = async (
  amount: bigint,
  fromToken: RateToken,
  toToken: RateToken,
): Promise<RateCalculationResult> => {
  const basePath = 'https://api.bebop.xyz/router/ethereum/v1/quote';

  const sell_tokens = getAddress(getRateTokenAddress(fromToken));
  const buy_tokens = getAddress(getRateTokenAddress(toToken));

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
