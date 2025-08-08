import invariant from 'tiny-invariant';

import { ETH_API_ROUTES, getEthApiPath } from 'consts/api';
import { LIDO_TOKENS_VALUES } from 'consts/tokens';

import { standardFetcher } from './standardFetcher';

type GetOneInchRateParams = {
  token: LIDO_TOKENS_VALUES;
  amount?: bigint;
};

export const getOneInchRate = async (params: GetOneInchRateParams) => {
  const { token, amount } = params;

  const urlParams = new URLSearchParams({ token });
  if (amount) urlParams.append('amount', amount.toString());
  const url = getEthApiPath(ETH_API_ROUTES.SWAP_ONE_INCH, urlParams);

  invariant(url, 'Missing URL for OneInch rate request');

  const data = await standardFetcher<{
    rate: number;
    toReceive: string;
    fromAmount: string;
  }>(url);

  return {
    rate: data.rate,
    toReceive: BigInt(data.toReceive),
  };
};
