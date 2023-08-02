import { useLidoSWR } from '@lido-sdk/react';

import { dynamics } from 'config';
import { standardFetcher } from 'utils/standardFetcher';

import { BalancerResponse } from './types';

export const useBalancer = () => {
  return useLidoSWR<BalancerResponse>(
    `${dynamics.ethAPIBasePath ?? ''}/v1/pool/balancer/wsteth-weth/apr/last`,
    standardFetcher,
  );
};
