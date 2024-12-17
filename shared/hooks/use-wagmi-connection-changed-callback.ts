import { useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';

// Triggered when chain id or wallet address changed
// except the case if initial connect
export const useWagmiConnectionChangedCallback = (callback: () => void) => {
  const { address, chainId } = useAccount();
  const prevConnectStateRef = useRef([address, chainId]);

  useEffect(() => {
    const [prevAddress, prevChainId] = prevConnectStateRef.current;
    if (prevAddress && prevChainId) {
      callback();
    }
    prevConnectStateRef.current = [address, chainId];
  }, [address, chainId, callback]);
};
