import { useDappStatus } from './use-dapp-status';

// In order to simplify side effects of switching wallets/chains
// we can remount by this key, resetting all internal states
export const useWagmiKey = () => {
  const { chainId, address } = useDappStatus();
  return `${address ?? 'NO_ADDRESS'}_${chainId}`;
};
