import { useAccount } from 'wagmi';
import {
  useWithdrawalQueueContractWeb3,
  useWithdrawalQueueContractRPC,
} from '@lido-sdk/react';

export const useWithdrawalsContract = () => {
  const contractWeb3 = useWithdrawalQueueContractWeb3();
  const contractRpc = useWithdrawalQueueContractRPC();

  const { address, chainId } = useAccount();

  return { contractWeb3, contractRpc, address, chainId };
};
