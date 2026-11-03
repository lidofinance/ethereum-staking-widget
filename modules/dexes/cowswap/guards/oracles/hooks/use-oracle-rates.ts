import { useCallback } from 'react';

import { useMainnetOnlyWagmi } from 'modules/web3';

import {
  readNetworkCostAllowance as readNetworkCostAllowanceClient,
  readSellTokenUsd as readSellTokenUsdClient,
  verifyWithOracle as verifyWithOracleClient,
  type NetworkCostChain,
  type OracleFeedMaps,
} from '../utils';
import type { OnTradeParamsPayload, OracleResult } from '../types';

export const useOracleRates = (
  feedMaps: OracleFeedMaps,
  { isMainnet, isTestnet }: NetworkCostChain,
) => {
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

  const readNetworkCostAllowance = useCallback(
    (params: OnTradeParamsPayload): Promise<number> =>
      readNetworkCostAllowanceClient(publicClientMainnet, params, feedMaps, {
        isMainnet,
        isTestnet,
      }),
    [publicClientMainnet, feedMaps, isMainnet, isTestnet],
  );

  return { verifyWithOracle, readSellTokenUsd, readNetworkCostAllowance };
};
