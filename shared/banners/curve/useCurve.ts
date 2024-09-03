import { useLidoSWR } from '@lido-sdk/react';

import { standardFetcher } from 'utils/standardFetcher';

import { CurveResponse } from './types';
import { ETH_API_ROUTES, getEthApiPath } from 'consts/api';

export const useCurve = () => {
  return useLidoSWR<CurveResponse>(
    getEthApiPath(ETH_API_ROUTES.CURVE_APR),
    standardFetcher,
  );
};
