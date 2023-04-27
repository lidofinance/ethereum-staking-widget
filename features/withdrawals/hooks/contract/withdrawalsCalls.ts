import { BigNumber } from 'ethers';
import { useContractSWR } from '@lido-sdk/react';

import { useWithdrawalsContract } from './useWithdrawalsContract';

export const useRequestsStatusByIds = (requestIds?: BigNumber[]) => {
  const { contractRpc } = useWithdrawalsContract();

  return useContractSWR({
    contract: contractRpc,
    method: 'getWithdrawalStatus',
    params: [requestIds],
    shouldFetch: !!requestIds,
  });
};

export const useUnfinalizedStETH = () => {
  const { contractRpc } = useWithdrawalsContract();

  return useContractSWR({
    contract: contractRpc,
    method: 'unfinalizedStETH',
  });
};

export const useUnfinalizedRequests = () => {
  const { contractRpc } = useWithdrawalsContract();

  return useContractSWR({
    contract: contractRpc,
    method: 'unfinalizedRequestNumber',
  });
};

export const useIsBunkerMode = () => {
  const { contractRpc } = useWithdrawalsContract();

  return useContractSWR({
    contract: contractRpc,
    method: 'isBunkerModeActive',
  });
};

export const useIsPaused = () => {
  const { contractRpc } = useWithdrawalsContract();

  return useContractSWR({
    contract: contractRpc,
    method: 'isPaused',
  });
};

export const useMaxAmount = () => {
  const { contractRpc } = useWithdrawalsContract();

  return useContractSWR({
    contract: contractRpc,
    method: 'MAX_STETH_WITHDRAWAL_AMOUNT',
  });
};

export const useMinAmount = () => {
  const { contractRpc } = useWithdrawalsContract();

  return useContractSWR({
    contract: contractRpc,
    method: 'MIN_STETH_WITHDRAWAL_AMOUNT',
  });
};
