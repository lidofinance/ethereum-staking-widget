import { useWeb3 } from 'reef-knot/web3-react';

import { getConfig } from 'config';
const { defaultChain } = getConfig();

// In order to simplify side effects of switching wallets/chains
// we can remount by this key, resetting all internal states
export const useWeb3Key = () => {
  const { account, chainId } = useWeb3();
  return `${account ?? 'NO_ACCOUNT'}_${chainId ?? defaultChain}`;
};
