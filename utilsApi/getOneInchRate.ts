import { standardFetcher } from 'utils/standardFetcher';

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
  const api = `https://api.1inch.exchange/v3.0/1/quote`;
  const query = new URLSearchParams({
    fromTokenAddress: fromTokenAddress,
    toTokenAddress: toTokenAddress,
    amount: amount.toString(),
  });
  const url = `${api}?${query.toString()}`;

  const data = (await standardFetcher(url)) as oneInchFetchResponse;

  if (!data || !data.toTokenAmount) {
    return null;
  }

  return parseFloat(data.toTokenAmount) / amount;
};
