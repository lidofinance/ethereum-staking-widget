import {
  useWithdrawalQueueContractWeb3,
  useWithdrawalQueueContractRPC,
} from '@lido-sdk/react';
import { useWeb3 } from 'reef-knot/web3-react';

export const useWithdrawalsContract = () => {
  const contractWeb3 = useWithdrawalQueueContractWeb3();
  const contractRpc = useWithdrawalQueueContractRPC();

  const { account, chainId } = useWeb3();

  return { contractWeb3, contractRpc, account, chainId };
};
