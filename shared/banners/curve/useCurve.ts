import { useLidoSWR } from '@lido-sdk/react';

import { dynamics } from 'config';
import { standardFetcher } from 'utils/standardFetcher';

import { CurveResponse } from './types';

export const useCurve = () => {
  return useLidoSWR<CurveResponse>(
    `${dynamics.ethAPIBasePath ?? ''}/v1/pool/curve/steth-eth/apr/last`,
    standardFetcher,
  );
};
