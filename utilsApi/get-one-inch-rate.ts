import { BigNumber } from 'ethers';

import { getOneInchRateApiUrl } from 'config/one-inch';
import { standardFetcher } from 'utils/standardFetcher';
import { responseTimeExternalMetricWrapper } from 'utilsApi';

export type OneInchFetchResponse = {
  toAmount: string;
};

type GetOneInchRateStats = (
  fromTokenAddress: string,
  toTokenAddress: string,
  amount: BigNumber,
) => Promise<number | null>;

// DEPRECATED: In future will be delete!!!
export const getOneInchRate: GetOneInchRateStats = async (
  fromTokenAddress,
  toTokenAddress,
  amount,
) => {
  console.debug('[getOneInchRate] Started fetching...');
  const { api, url } = getOneInchRateApiUrl(
    fromTokenAddress,
    toTokenAddress,
    amount.toString(),
  );

  const data = await responseTimeExternalMetricWrapper({
    payload: api,
    request: () => standardFetcher<OneInchFetchResponse>(url),
  });

  if (!data || !data.toAmount) {
    console.error('[getOneInchRate] Request to 1inch failed');
    return null;
  }

  const rate =
    BigNumber.from(data.toAmount)
      .mul(BigNumber.from(100000))
      .div(amount)
      .toNumber() / 100000;
  console.debug('[getOneInchRate] Rate on 1inch:', rate);
  return rate;
};
