export const ONE_INCH_RATE_LIMIT = 1.004;

export const API_LIDO_1INCH = `https://api-lido.1inch.io/v5.2/1/quote`;

export type GetOneInchRateApiUrl = (
  fromTokenAddress: string,
  toTokenAddress: string,
  amount: string,
) => {
  api: string;
  url: string;
};

export const getOneInchRateApiUrl: GetOneInchRateApiUrl = (
  fromTokenAddress,
  toTokenAddress,
  amount,
) => {
  const query = new URLSearchParams({
    src: fromTokenAddress,
    dst: toTokenAddress,
    amount: amount.toString(),
  });
  const url = `${API_LIDO_1INCH}?${query.toString()}`;

  return { api: API_LIDO_1INCH, url };
};
