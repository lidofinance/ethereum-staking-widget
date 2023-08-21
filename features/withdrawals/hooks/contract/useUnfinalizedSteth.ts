import { useContractSWR } from '@lido-sdk/react';

import { useWithdrawalsContract } from './useWithdrawalsContract';
import { STRATEGY_LAZY } from 'utils/swrStrategies';

export const useUnfinalizedStETH = () => {
  const { contractRpc } = useWithdrawalsContract();

  return useContractSWR({
    contract: contractRpc,
    method: 'unfinalizedStETH',
    config: STRATEGY_LAZY,
  });
};
