import { BigNumber } from 'ethers';

import { secretConfig } from 'config';
import { standardFetcher } from 'utils/standardFetcher';
import { responseTimeExternalMetricWrapper } from 'utilsApi';

const ONE_INCH_API_KEY = secretConfig.oneInchApiKey as string;
const ONE_INCH_API_ENDPOINT = 'https://api.1inch.dev/swap/v5.2/1/quote';
const RATE_PRECISION = 1000000;

export type OneInchFetchResponse = {
  toAmount: string;
};

export type GetOneInchRateResult = { rate: number; toAmount: BigNumber };

export type GetOneInchRateStats = (
  fromTokenAddress: string,
  toTokenAddress: string,
  amount: BigNumber,
) => Promise<GetOneInchRateResult | null>;

export const getOneInchRate: GetOneInchRateStats = async (
  fromTokenAddress,
  toTokenAddress,
  amount,
) => {
  console.debug('[getOneInchRate] Started fetching...');
  if (!ONE_INCH_API_KEY) console.warn('[getOneInchRate] missing 1inch Api Key');

  const query = new URLSearchParams({
    src: fromTokenAddress,
    dst: toTokenAddress,
    amount: amount.toString(),
  });
  const url = `${ONE_INCH_API_ENDPOINT}?${query.toString()}`;

  const respData = await responseTimeExternalMetricWrapper({
    payload: ONE_INCH_API_ENDPOINT,
    request: () =>
      standardFetcher<OneInchFetchResponse>(url, {
        headers: { Authorization: `Bearer ${ONE_INCH_API_KEY}` },
      }),
  });

  const toAmount = BigNumber.from(respData.toAmount);

  const rate =
    toAmount.mul(BigNumber.from(RATE_PRECISION)).div(amount).toNumber() /
    RATE_PRECISION;

  console.debug('[getOneInchRate] Rate on 1inch:', rate);
  return { rate, toAmount };
};
