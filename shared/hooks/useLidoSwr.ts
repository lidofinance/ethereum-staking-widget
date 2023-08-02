import { useLidoSWR as useLidoSWRDefault, SWRResponse } from '@lido-sdk/react';
import { SWRConfiguration } from 'swr';
import getConfig from 'next/config';
import { standardFetcher } from 'utils/standardFetcher';

const { serverRuntimeConfig } = getConfig();
const { basePath } = serverRuntimeConfig;

export const useLidoSWR = function <D = unknown, E = unknown>(
  path: string | null,
  config?: SWRConfiguration,
): SWRResponse<D, E> {
  return useLidoSWRDefault<D, E>(
    path ? `${basePath ?? ''}${path}` : null,
    standardFetcher,
    config,
  );
};
