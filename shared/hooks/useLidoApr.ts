import { SWRResponse, useLidoSWR } from '@lido-sdk/react';
import getConfig from 'next/config';
import { standardFetcher } from 'utils/standardFetcher';

const { serverRuntimeConfig } = getConfig();
const { basePath } = serverRuntimeConfig;

export const useLidoApr = (): SWRResponse<unknown> => {
  return useLidoSWR(
    `${basePath ?? ''}/api/sma-steth-apr`,
    standardFetcher,
  ) as SWRResponse<unknown>;
};
