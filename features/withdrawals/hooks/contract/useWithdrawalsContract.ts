import { useWeb3 } from 'reef-knot';

import {
  useWithdrawalRequestNFTRPC,
  useWithdrawalRequestNFTWeb3,
} from 'customSdk/contracts';

export const useWithdrawalsContract = () => {
  const contractWeb3 = useWithdrawalRequestNFTWeb3();
  const contractRpc = useWithdrawalRequestNFTRPC();

  const { account, chainId } = useWeb3();

  return { contractWeb3, contractRpc, account, chainId };
};
