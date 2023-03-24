import { useSDK } from '@lido-sdk/react';

import {
  useWithdrawalRequestNFTRPC,
  useWithdrawalRequestNFTWeb3,
} from 'customSdk/contracts';

export const useWithdrawalsContract = () => {
  const contractWeb3 = useWithdrawalRequestNFTWeb3();
  const contractRpc = useWithdrawalRequestNFTRPC();

  const { account, chainId } = useSDK();

  return { contractWeb3, contractRpc, account, chainId };
};
