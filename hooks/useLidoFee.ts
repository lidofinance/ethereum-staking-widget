import { SWRResponse, useLidoSWR } from '@lido-sdk/react';
import getConfig from 'next/config';
import { standardFetcher } from 'utils/standardFetcher';

const { serverRuntimeConfig } = getConfig();
const { basePath } = serverRuntimeConfig;

export const useLidoApr = (): SWRResponse<Response, unknown> => {
  return useLidoSWR(`${basePath ?? ''}/api/steth-apr`, standardFetcher);
};
