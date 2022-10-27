import { SWRResponse, useLidoSWR } from '@lido-sdk/react';
import { standardFetcher } from 'utils/standardFetcher';
import getConfig from 'next/config';

import { CurveResponse } from './types';

const { serverRuntimeConfig } = getConfig();
const { ethAPIBasePath } = serverRuntimeConfig;

export const useBalancer = () => {
  const { data } = useLidoSWR(
    `${ethAPIBasePath ?? ''}/api/eth-ap1r`,
    standardFetcher,
  ) as SWRResponse<CurveResponse>;

  const apy = data?.data;

  return apy;
};
