import { getAddress } from 'viem';
import { LIDO_TOKENS } from '@lidofinance/lido-ethereum-sdk';

import { config } from 'config';
import { standardFetcher } from './standardFetcher';

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

// TODO: temp
type TOKENS =
  | Exclude<(typeof LIDO_TOKENS)[keyof typeof LIDO_TOKENS], 'unstETH'>
  | 'LDO';

// TODO: temp
const TOKEN_ADDRESSES: Record<TOKENS, string> = {
  stETH: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
  wstETH: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
  ETH: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  LDO: '0x5a98fcbea516cf06857215779fd812ca3bef1b32',
};

// TODO: temp
const getRateTokenAddress = (token: TOKENS): string => {
  return TOKEN_ADDRESSES[token] || '';
};

export const getBebopRate = async (
  amount: bigint,
  fromToken: TOKENS,
  toToken: TOKENS,
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
