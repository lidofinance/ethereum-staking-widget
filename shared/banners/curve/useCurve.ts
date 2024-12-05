import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { ETH_API_ROUTES, getEthApiPath } from 'consts/api';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { standardFetcher } from 'utils/standardFetcher';

import { CurveResponse } from './types';

export const useCurve = (): UseQueryResult<CurveResponse> => {
  const url = getEthApiPath(ETH_API_ROUTES.CURVE_APR);

  return useQuery<CurveResponse>({
    queryKey: ['curve-apr', url],
    queryFn: () => standardFetcher<CurveResponse>(url),
    ...STRATEGY_LAZY,
  });
};
