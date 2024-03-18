import { TOKENS } from '@lido-sdk/constants';
import { BigNumber } from 'ethers';
import { standardFetcher } from './standardFetcher';
import { dynamics } from 'config';
import { prependBasePath } from './prependBasePath';

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
  const apiOneInchRatePath = `api/oneinch-rate?${params.toString()}`;
  const data = await standardFetcher<{
    rate: number;
    toReceive: string;
  }>(
    dynamics.ipfsMode
      ? `${dynamics.widgetApiBasePathForIpfs}/${apiOneInchRatePath}`
      : prependBasePath(apiOneInchRatePath),
  );
  return {
    rate: data.rate,
    toReceive: BigNumber.from(data.toReceive),
  };
};
