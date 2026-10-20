import { useEffect, useRef } from 'react';
import { useConnection } from 'wagmi';

export type ResetMode = 'off' | 'chainId' | 'walletAddress' | 'all';

// Triggered when chain id or wallet address changed
// except the case if initial connect
export const useWagmiConnectionChangedCallback = (
  callback: () => void,
  resetMode: ResetMode,
) => {
  const { address, chainId } = useConnection();
  const prevConnectStateRef = useRef([address, chainId] as const);
  const prevResetModeRef = useRef(resetMode);
  prevResetModeRef.current = resetMode;

  useEffect(() => {
    if (prevResetModeRef.current === 'off') {
      return;
    }

    const [prevAddress, prevChainId] = prevConnectStateRef.current;

    if (prevAddress && prevChainId) {
      const chainIdChanged = prevChainId !== chainId;
      const addressChanged = prevAddress !== address;
      if (prevResetModeRef.current === 'chainId' && chainIdChanged) {
        callback();
      }

      if (prevResetModeRef.current === 'walletAddress' && addressChanged) {
        callback();
      }

      if (
        prevResetModeRef.current === 'all' &&
        (addressChanged || chainIdChanged)
      ) {
        callback();
      }
    }

    prevConnectStateRef.current = [address, chainId] as const;
  }, [address, callback, chainId]);
};
