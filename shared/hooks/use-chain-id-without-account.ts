import { useState, useEffect } from 'react';

const checkWindowDotEthereum = () =>
  Object.prototype.hasOwnProperty.call(window, 'ethereum');

export const useChainIdWithoutAccount = () => {
  const [chainId, setChainId] = useState<number | null>(null);

  useEffect(() => {
    const fetchChainId = async () => {
      if (!checkWindowDotEthereum()) return;

      try {
        const chainIdHex = await window?.ethereum?.request({
          method: 'eth_chainId',
        });

        if (!chainIdHex) return;

        const chainId = parseInt(chainIdHex, 16);
        setChainId(chainId);
      } catch {
        /* noop */
      }
    };

    void fetchChainId();

    // Handler for chain changes
    const handleChainChanged = (chainIdHex?: string | null | undefined) => {
      if (!chainIdHex) return;

      const chainId = parseInt(chainIdHex, 16);
      setChainId(chainId);
    };

    if (checkWindowDotEthereum()) {
      window?.ethereum?.on('chainChanged', handleChainChanged);
    }

    // Cleanup listener on component unmount
    return () => {
      if (!checkWindowDotEthereum()) return;

      window?.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  return chainId;
};
