import { useCallback } from 'react';

import { useMainnetOnlyWagmi } from 'modules/web3';

import { verifyWithOracle as verifyWithOracleClient } from '../utils';
import type { OnTradeParamsPayload, OracleResult } from '../types';

export const useOracleRates = () => {
  const { publicClientMainnet } = useMainnetOnlyWagmi();

  const verifyWithOracle = useCallback(
    (params: OnTradeParamsPayload): Promise<OracleResult> =>
      verifyWithOracleClient(publicClientMainnet, params),
    [publicClientMainnet],
  );

  return { verifyWithOracle };
};
