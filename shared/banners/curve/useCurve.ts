import { useLidoSWR } from '@lido-sdk/react';

import { getOneConfig } from 'config/one-config/utils';
const { ethAPIBasePath } = getOneConfig();

import { standardFetcher } from 'utils/standardFetcher';

import { CurveResponse } from './types';

export const useCurve = () => {
  return useLidoSWR<CurveResponse>(
    `${ethAPIBasePath ?? ''}/v1/pool/curve/steth-eth/apr/last`,
    standardFetcher,
  );
};
