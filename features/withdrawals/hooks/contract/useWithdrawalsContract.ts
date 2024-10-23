import {
  useWithdrawalQueueContractWeb3,
  useWithdrawalQueueContractRPC,
} from '@lido-sdk/react';
import { useDappStatus } from 'modules/web3';

export const useWithdrawalsContract = () => {
  const contractWeb3 = useWithdrawalQueueContractWeb3();
  const contractRpc = useWithdrawalQueueContractRPC();

  const { address } = useDappStatus();

  return { contractWeb3, contractRpc, address };
};
