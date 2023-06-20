import { useWeb3 } from 'reef-knot/web3-react';
import { useIsContract } from 'shared/hooks';

export const useIsMultisig = () => {
  const { account } = useWeb3();
  const { isContract, loading } = useIsContract(account ?? undefined);
  return [isContract, loading];
};
