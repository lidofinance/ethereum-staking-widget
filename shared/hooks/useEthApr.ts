import { SWRResponse, useLidoSWR } from '@lido-sdk/react';
import getConfig from 'next/config';
import { standardFetcher } from 'utils/standardFetcher';

const { serverRuntimeConfig } = getConfig();
const { basePath } = serverRuntimeConfig;

export const useEthApr = (): SWRResponse<unknown> => {
  return useLidoSWR(
    `${basePath ?? ''}/api/eth-apr`,
    standardFetcher,
  ) as SWRResponse<unknown>;
};
