import { useContractSWR } from '@lido-sdk/react';

import { useWithdrawalsContract } from './useWithdrawalsContract';

export const useUnfinalizedStETH = () => {
  const { contractRpc } = useWithdrawalsContract();

  return useContractSWR({
    contract: contractRpc,
    method: 'unfinalizedStETH',
  });
};

// TODO merge useIsBunkerMode && useIsPaused into single status hook
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
