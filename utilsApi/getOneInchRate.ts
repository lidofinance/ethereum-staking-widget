import { standardFetcher } from 'utils/standardFetcher';
import { responseTimeExternalMetricWrapper } from 'utilsApi';
import { serverLogger } from './serverLogger';

type oneInchFetchResponse = {
  toTokenAmount: string;
};

type GetOneInchRateStats = (
  fromTokenAddress: string,
  toTokenAddress: string,
  amount: number,
) => Promise<number | null>;

export const getOneInchRate: GetOneInchRateStats = async (
  fromTokenAddress,
  toTokenAddress,
  amount,
) => {
  serverLogger.debug('Getting exchange rate from 1inch');
  const api = `https://api.1inch.exchange/v3.0/1/quote`;
  const query = new URLSearchParams({
    fromTokenAddress: fromTokenAddress,
    toTokenAddress: toTokenAddress,
    amount: amount.toString(),
  });
  const url = `${api}?${query.toString()}`;

  const data = await responseTimeExternalMetricWrapper(() =>
    standardFetcher<oneInchFetchResponse>(url),
  )(api);

  if (!data || !data.toTokenAmount) {
    serverLogger.error('Request to 1inch failed');
    return null;
  }
  const rate = parseFloat(data.toTokenAmount) / amount;
  serverLogger.debug('Rate on 1inch: ' + rate);

  return rate;
};
