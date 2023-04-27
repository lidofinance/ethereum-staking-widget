import { standardFetcher } from 'utils/standardFetcher';
import { responseTimeExternalMetricWrapper } from 'utilsApi';
import { serverLogger } from './serverLogger';
import { BigNumber } from 'ethers';

type oneInchFetchResponse = {
  toTokenAmount: string;
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
  serverLogger.debug('Getting exchange rate from 1inch');
  const api = `https://api-lido.1inch.io/v5.0/1/swap`;
  const query = new URLSearchParams({
    fromTokenAddress: fromTokenAddress,
    toTokenAddress: toTokenAddress,
    amount: amount.toString(),
    slippage: '1',
    fromAddress: fromTokenAddress,
  });
  const url = `${api}?${query.toString()}`;
  console.log('url', url);
  const data = await responseTimeExternalMetricWrapper({
    payload: api,
    request: () => standardFetcher<oneInchFetchResponse>(url),
  });

  if (!data || !data.toTokenAmount) {
    serverLogger.error('Request to 1inch failed');
    return null;
  }

  const rate =
    BigNumber.from(data.toTokenAmount)
      .mul(BigNumber.from(100000))
      .div(amount)
      .toNumber() / 100000;
  serverLogger.debug('Rate on 1inch: ' + rate);

  return rate;
};
