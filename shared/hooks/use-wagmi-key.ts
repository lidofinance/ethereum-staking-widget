import { useAccount } from 'wagmi';
import { config } from 'config';

// In order to simplify side effects of switching wallets/chains
// we can remount by this key, resetting all internal states
export const useWagmiKey = () => {
  const { address, chainId } = useAccount();
  return `${address ?? 'NO_ADDRESS'}_${chainId ?? config.defaultChain}`;
};
