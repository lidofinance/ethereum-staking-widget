import { useLidoSWR } from '@lido-sdk/react';
import { standardFetcher } from 'utils/standardFetcher';
import getConfig from 'next/config';

import { CurveResponse } from './types';

const { publicRuntimeConfig } = getConfig();
const { ethAPIBasePath } = publicRuntimeConfig;

export const useCurve = () => {
  return useLidoSWR<CurveResponse>(
    `${ethAPIBasePath ?? ''}/v1/pool/curve/steth-eth/apr/last`,
    standardFetcher,
  );
};
