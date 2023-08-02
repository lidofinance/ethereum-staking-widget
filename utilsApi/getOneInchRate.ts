import { standardFetcher } from 'utils/standardFetcher';
import { responseTimeExternalMetricWrapper } from 'utilsApi';
import { BigNumber } from 'ethers';

type oneInchFetchResponse = {
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
  const api = `https://api-lido.1inch.io/v5.2/1/quote`;
  const query = new URLSearchParams({
    src: fromTokenAddress,
    dst: toTokenAddress,
    amount: amount.toString(),
  });
  const url = `${api}?${query.toString()}`;
  const data = await responseTimeExternalMetricWrapper({
    payload: api,
    request: () => standardFetcher<oneInchFetchResponse>(url),
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
