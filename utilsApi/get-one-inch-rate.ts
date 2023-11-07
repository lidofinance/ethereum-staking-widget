import { BigNumber } from 'ethers';

import { standardFetcher } from 'utils/standardFetcher';
import { responseTimeExternalMetricWrapper } from 'utilsApi';

export const API_LIDO_1INCH = `https://api-lido.1inch.io/v5.2/1/quote`;

export type OneInchFetchResponse = {
  toAmount: string;
};

type GetOneInchRateStats = (
  fromTokenAddress: string,
  toTokenAddress: string,
  amount: BigNumber,
) => Promise<number | null>;

export const getOneInchRate: GetOneInchRateStats = async (
  fromTokenAddress,
  toTokenAddress,
  amount,
) => {
  console.debug('[getOneInchRate] Started fetching...');
  const query = new URLSearchParams({
    src: fromTokenAddress,
    dst: toTokenAddress,
    amount: amount.toString(),
  });
  const url = `${API_LIDO_1INCH}?${query.toString()}`;

  const respData = await responseTimeExternalMetricWrapper({
    payload: API_LIDO_1INCH,
    request: () => standardFetcher<OneInchFetchResponse>(url),
  });

  if (!respData || !respData.toAmount) {
    console.error('[getOneInchRate] Request to 1inch failed');
    return null;
  }

  const rate =
    BigNumber.from(respData.toAmount)
      .mul(BigNumber.from(100000))
      .div(amount)
      .toNumber() / 100000;
  console.debug('[getOneInchRate] Rate on 1inch:', rate);
  return rate;
};
