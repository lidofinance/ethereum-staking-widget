import {
  useSTETHContractRPC,
  useWSTETHContractRPC,
  useSTETHBalance,
  useWSTETHBalance,
  useContractSWR,
} from '@lido-sdk/react';
import { useClaimData } from 'features/withdrawals/contexts/claim-data-context';
import { useWithdrawals } from 'features/withdrawals/contexts/withdrawals-context';
import { useUnfinalizedStETH } from 'features/withdrawals/hooks';
import { useCallback, useMemo } from 'react';
import { useIsLedgerLive } from 'shared/hooks/useIsLedgerLive';
import { useAwaiter } from 'shared/hooks/use-awaiter';

import { STRATEGY_LAZY } from 'utils/swrStrategies';
import {
  MAX_REQUESTS_COUNT_LEDGER_LIMIT,
  MAX_REQUESTS_COUNT,
} from 'features/withdrawals/withdrawals-constants';
import { SetIntermediateValidationResults } from './types';

type UseRequestFormDataContextValue = {
  setIntermediateValidationResults: SetIntermediateValidationResults;
};

// Provides all data fetching for form to function
export const useRequestFormNetworkData = ({
  setIntermediateValidationResults,
}: UseRequestFormDataContextValue) => {
  const { revalidate: revalidateClaimData } = useClaimData();
  // useTotalSupply is bugged and switches to undefined for 1 render
  const { data: stethTotalSupply } = useContractSWR({
    contract: useSTETHContractRPC(),
    method: 'totalSupply',
    config: STRATEGY_LAZY,
  });
  const { maxAmount: maxAmountPerRequestSteth, minAmount: minUnstakeSteth } =
    useWithdrawals();
  const wstethContract = useWSTETHContractRPC();
  const { data: balanceSteth, update: stethUpdate } = useSTETHBalance();
  const { data: balanceWSteth, update: wstethUpdate } = useWSTETHBalance();
  const { data: unfinalizedStETH, update: unfinalizedStETHUpdate } =
    useUnfinalizedStETH();

  const isLedgerLive = useIsLedgerLive();
  const maxRequestCount = isLedgerLive
    ? MAX_REQUESTS_COUNT_LEDGER_LIMIT
    : MAX_REQUESTS_COUNT;

  const { data: maxAmountPerRequestWSteth } = useContractSWR({
    contract: wstethContract,
    method: 'getWstETHByStETH',
    params: [maxAmountPerRequestSteth],
    shouldFetch: !!maxAmountPerRequestSteth,
    config: STRATEGY_LAZY,
  });
  const { data: minUnstakeWSteth } = useContractSWR({
    contract: wstethContract,
    method: 'getWstETHByStETH',
    params: [minUnstakeSteth],
    shouldFetch: !!minUnstakeSteth,
    config: STRATEGY_LAZY,
  });

  const revalidateRequestFormData = useCallback(async () => {
    await Promise.allSettled([
      stethUpdate(),
      wstethUpdate(),
      revalidateClaimData(),
      unfinalizedStETHUpdate(),
    ]);
  }, [stethUpdate, unfinalizedStETHUpdate, revalidateClaimData, wstethUpdate]);

  const networkData = useMemo(
    () => ({
      balanceSteth,
      balanceWSteth,
      maxAmountPerRequestSteth,
      maxAmountPerRequestWSteth,
      minUnstakeSteth,
      minUnstakeWSteth,
      stethTotalSupply,
      unfinalizedStETH,
      maxRequestCount,
      revalidateRequestFormData,
      setIntermediateValidationResults,
    }),
    [
      balanceSteth,
      balanceWSteth,
      maxAmountPerRequestSteth,
      maxAmountPerRequestWSteth,
      minUnstakeSteth,
      minUnstakeWSteth,
      stethTotalSupply,
      unfinalizedStETH,
      maxRequestCount,
      revalidateRequestFormData,
      setIntermediateValidationResults,
    ],
  );

  const networkDataAwaited = useMemo(() => {
    if (
      !networkData.balanceSteth ||
      !networkData.balanceWSteth ||
      !networkData.maxAmountPerRequestSteth ||
      !networkData.maxAmountPerRequestWSteth ||
      !networkData.minUnstakeSteth ||
      !networkData.minUnstakeWSteth ||
      !networkData.stethTotalSupply ||
      !networkData.unfinalizedStETH ||
      !networkData.maxRequestCount
    ) {
      return undefined;
    }
    return networkData;
  }, [networkData]);

  const networkDataAwaiter = useAwaiter(networkDataAwaited);

  return {
    networkData,
    networkDataPromise: networkDataAwaiter.awaiter,
  };
};
