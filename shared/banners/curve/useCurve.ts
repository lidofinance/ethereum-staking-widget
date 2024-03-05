import { useLidoSWR } from '@lido-sdk/react';

import { config } from 'config';

import { standardFetcher } from 'utils/standardFetcher';

import { CurveResponse } from './types';

export const useCurve = () => {
  return useLidoSWR<CurveResponse>(
    `${config.ethAPIBasePath ?? ''}/v1/pool/curve/steth-eth/apr/last`,
    standardFetcher,
  );
};
