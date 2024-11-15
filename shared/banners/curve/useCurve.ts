import { ETH_API_ROUTES, getEthApiPath } from 'consts/api';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { useLidoQuery, UseLidoQueryResult } from 'shared/hooks/use-lido-query';
import { standardFetcher } from 'utils/standardFetcher';

import { CurveResponse } from './types';

export const useCurve = (): UseLidoQueryResult<CurveResponse> => {
  const url = getEthApiPath(ETH_API_ROUTES.CURVE_APR);

  return useLidoQuery<CurveResponse>({
    queryKey: ['curve-apr', url],
    queryFn: () => standardFetcher<CurveResponse>(url),
    strategy: STRATEGY_LAZY,
  });
};
