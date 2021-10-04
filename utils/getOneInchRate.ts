import { standardFetcher } from './standardFetcher';

type GetOneInchRateStats = (
  fromTokenAddress: string,
  toTokenAddress: string,
  amount: number,
) => Promise<Response>;

export const getOneInchRate: GetOneInchRateStats = async (
  fromTokenAddress,
  toTokenAddress,
  amount,
) => {
  const api = `https://api.1inch.exchange/v3.0/1/quote`;
  const query = new URLSearchParams({
    fromTokenAddress: fromTokenAddress,
    toTokenAddress: toTokenAddress,
    amount: amount.toString(),
  });
  const url = `${api}?${query.toString()}`;

  return standardFetcher(url);
};
