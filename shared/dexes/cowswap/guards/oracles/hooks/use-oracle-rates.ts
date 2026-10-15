import { useCallback } from 'react';

import { useMainnetOnlyWagmi } from 'modules/web3';

import {
  verifyWithOracle as verifyWithOracleClient,
  type OracleFeedMaps,
} from '../utils';
import type { OnTradeParamsPayload, OracleResult } from '../types';

export const useOracleRates = (feedMaps: OracleFeedMaps) => {
  const { publicClientMainnet } = useMainnetOnlyWagmi();

  const verifyWithOracle = useCallback(
    (params: OnTradeParamsPayload): Promise<OracleResult> =>
      verifyWithOracleClient(publicClientMainnet, params, feedMaps),
    [publicClientMainnet, feedMaps],
  );

  return { verifyWithOracle };
};
