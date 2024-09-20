import { useMemo } from 'react';
import { useContractSWR, contractHooksFactory } from '@lido-sdk/react';
import { WithdrawalQueueAbiFactory } from '@lido-sdk/contracts';
import { CHAINS, getWithdrawalQueueAddress } from '@lido-sdk/constants';

import { useWithdrawalsContract } from './useWithdrawalsContract';
import { STRATEGY_LAZY } from 'consts/swr-strategies';

export const useUnfinalizedStETH = () => {
  const { contractRpc } = useWithdrawalsContract();

  const sepoliaContractRPC = useMemo(() => {
    const withdrawalQueue = contractHooksFactory(
      WithdrawalQueueAbiFactory,
      () => getWithdrawalQueueAddress(CHAINS.Sepolia),
    );
    return withdrawalQueue.useContractRPC;
  }, []);

  return useContractSWR({
    contract: contractRpc ? contractRpc : sepoliaContractRPC,
    // contract: useWithdrawalQueueContractRPC,
    method: 'unfinalizedStETH',
    config: STRATEGY_LAZY,
  });
};
