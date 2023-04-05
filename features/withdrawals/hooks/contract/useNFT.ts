import { useCallback } from 'react';
import { useSDK } from '@lido-sdk/react';

import { useWithdrawalsContract } from './useWithdrawalsContract';

export const useAddNFT = () => {
  const { contractRpc } = useWithdrawalsContract();
  const { providerWeb3, onError, account } = useSDK();

  const handleAdd = useCallback(async () => {
    const provider = providerWeb3?.provider;
    if (!provider?.request || !account) return false;

    try {
      const [symbol, name] = await Promise.all([
        contractRpc.symbol(),
        contractRpc.name(),
      ]);

      const result = await provider.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: contractRpc.address,
            symbol,
            name,
            decimals: 0,
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      });

      return !!result;
    } catch (error) {
      onError(error);
      return false;
    }
  }, [providerWeb3?.provider, account, contractRpc, onError]);

  const canAdd = !!providerWeb3?.provider.isMetaMask;
  const addNft = canAdd ? handleAdd : undefined;

  return { addNft };
};
