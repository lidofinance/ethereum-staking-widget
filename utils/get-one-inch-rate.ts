import invariant from 'tiny-invariant';
import { z } from 'zod';

import { ETH_API_ROUTES, getEthApiPath } from 'consts/api';
import { LIDO_TOKENS_VALUES } from 'consts/tokens';

import { standardFetcher } from './standardFetcher';
import { BIGINT_STRING_SCHEMA } from './zod';

const ONE_INCH_RATE_SCHEMA = z.object({
  rate: z.number(),
  toReceive: BIGINT_STRING_SCHEMA,
});

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

  const data = ONE_INCH_RATE_SCHEMA.parse(await standardFetcher<unknown>(url));

  return {
    rate: data.rate,
    toReceive: BigInt(data.toReceive),
  };
};
