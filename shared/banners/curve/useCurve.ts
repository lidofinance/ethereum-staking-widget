import invariant from 'tiny-invariant';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { ETH_API_ROUTES, getEthApiPath } from 'consts/api';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { standardFetcher } from 'utils/standardFetcher';

import { CurveResponse } from './types';

export const useCurve = (): UseQueryResult<CurveResponse> => {
  const url = getEthApiPath(ETH_API_ROUTES.CURVE_APR);

  return useQuery<CurveResponse>({
    queryKey: ['curve-apr', url],
    enabled: !!url,
    queryFn: () => {
      invariant(url, 'Missing URL for curve APR request');
      return standardFetcher<CurveResponse>(url);
    },
    ...STRATEGY_LAZY,
  });
};
