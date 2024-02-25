import { useLidoSWR } from '@lido-sdk/react';

import { getConfig } from 'config';
const { ethAPIBasePath } = getConfig();

import { standardFetcher } from 'utils/standardFetcher';

import { CurveResponse } from './types';

export const useCurve = () => {
  return useLidoSWR<CurveResponse>(
    `${ethAPIBasePath ?? ''}/v1/pool/curve/steth-eth/apr/last`,
    standardFetcher,
  );
};
