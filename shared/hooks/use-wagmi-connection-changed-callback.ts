import { useEffect, useRef } from 'react';
import { useConnection } from 'wagmi';

// Triggered when chain id or wallet address changed
// except the case if initial connect
export const useWagmiConnectionChangedCallback = (callback: () => void) => {
  const { address, chainId } = useConnection();
  const prevConnectStateRef = useRef([address, chainId]);

  useEffect(() => {
    const [prevAddress, prevChainId] = prevConnectStateRef.current;
    if (prevAddress && prevChainId) {
      callback();
    }
    prevConnectStateRef.current = [address, chainId];
  }, [address, chainId, callback]);
};
