import { BigNumber } from 'ethers';
import { getAddress } from 'ethers/lib/utils.js';
import { CHAINS, TOKENS, getTokenAddress } from '@lido-sdk/constants';
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

type RateToken = TOKENS.STETH | TOKENS.WSTETH | 'ETH';

type RateCalculationResult = { rate: number; toReceive: BigNumber };

const getRateTokenAddress = (token: RateToken) =>
  token === 'ETH'
    ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    : getTokenAddress(CHAINS.Mainnet, token);

export const getBebopRate = async (
  amount: BigNumber,
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

    const toAmount = BigNumber.from(
      data.routes[0].quote.buyTokens[buy_tokens].amountBeforeFee,
    );
    return {
      rate,
      toReceive: toAmount,
    };
  }
  throw new Error('[getBebopRate] Could not get quote, invalid response body');
};
