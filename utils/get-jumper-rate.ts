import { BigNumber } from 'ethers';
import { TOKENS } from '@lido-sdk/constants';
import { standardFetcher } from './standardFetcher';

type JumperGetQuotePartial = {
  estimate: {
    toAmount: string;
  };
};

type RateToken = TOKENS.STETH | TOKENS.WSTETH | 'ETH';

type RateCalculationResult = { rate: number; toReceive: BigNumber };

const RATE_PRECISION = 1000000;

export const getJumperRate = async (
  amount: BigNumber,
  fromToken: RateToken,
  toToken: RateToken,
): Promise<RateCalculationResult> => {
  const basePath = 'https://li.quest/v1/quote';

  const params = new URLSearchParams({
    fromChain: 'ETH',
    toChain: 'ETH',
    fromToken,
    toToken,
    fromAddress: '0x11D00000000000000000000000000000000011D0',
    fromAmount: amount.toString(),
    source: 'lido',
  });

  const data = await standardFetcher<JumperGetQuotePartial>(
    `${basePath}?${params.toString()}`,
  );

  if (data && data.estimate && data.estimate.toAmount) {
    const toAmount = BigNumber.from(data.estimate.toAmount);
    const rate =
      toAmount.mul(BigNumber.from(RATE_PRECISION)).div(amount).toNumber() /
      RATE_PRECISION;
    return {
      rate,
      toReceive: toAmount,
    };
  }
  throw new Error('[getJumperRate] Could not get quote, invalid response body');
};
