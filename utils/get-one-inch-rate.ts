import { BigNumber } from 'ethers';
import { TOKENS } from '@lido-sdk/constants';
import { config } from 'config';
import { standardFetcher } from './standardFetcher';

type GetOneInchRateParams = {
  token: TOKENS.STETH | TOKENS.WSTETH | 'ETH';
  amount?: BigNumber;
};

export const getOneInchRate = async ({
  token,
  amount,
}: GetOneInchRateParams) => {
  const params = new URLSearchParams({ token });
  if (amount) params.append('amount', amount.toString());
  const url = `${config.ethAPIBasePath}/v1/swap/one-inch?${params.toString()}`;
  const data = await standardFetcher<{
    rate: number;
    toReceive: string;
  }>(url);
  return {
    rate: data.rate,
    toReceive: BigNumber.from(data.toReceive),
  };
};
