import { SWRConfiguration } from 'swr';
import { useLidoSWR as useLidoSWRDefault, SWRResponse } from '@lido-sdk/react';
import { standardFetcher } from 'utils/standardFetcher';

import { getOneConfig } from 'config/one-config/utils';
const { basePath = '' } = getOneConfig();

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
