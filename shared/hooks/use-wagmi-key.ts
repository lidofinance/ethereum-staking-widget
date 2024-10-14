import { useAccount } from 'wagmi';
import { config } from 'config';
import { useLidoSDK } from 'providers/lido-sdk';

// In order to simplify side effects of switching wallets/chains
// we can remount by this key, resetting all internal states
export const useWagmiKey = () => {
  const { address } = useAccount();
  const { chainId } = useLidoSDK();
  return `${address ?? 'NO_ADDRESS'}_${chainId ?? config.defaultChain}`;
};
