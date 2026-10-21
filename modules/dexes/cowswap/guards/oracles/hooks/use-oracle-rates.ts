import { useCallback } from 'react';

import { useMainnetOnlyWagmi } from 'modules/web3';

import {
  readSellTokenUsd as readSellTokenUsdClient,
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

  const readSellTokenUsd = useCallback(
    (params: OnTradeParamsPayload): Promise<number | null> =>
      readSellTokenUsdClient(publicClientMainnet, params, feedMaps),
    [publicClientMainnet, feedMaps],
  );

  return { verifyWithOracle, readSellTokenUsd };
};
