import { useLidoSWR } from '@lido-sdk/react';
import { standardFetcher } from 'utils/standardFetcher';
import getConfig from 'next/config';

import { BalancerResponse } from './types';

const { publicRuntimeConfig } = getConfig();
const { ethAPIBasePath } = publicRuntimeConfig;

export const useBalancer = () => {
  return useLidoSWR<BalancerResponse>(
    `${ethAPIBasePath ?? ''}/v1/pool/balancer/wsteth-weth/apr/last`,
    standardFetcher,
  );
};
