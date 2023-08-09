import { useSDK } from '@lido-sdk/react';
import { useCallback, useEffect, useState } from 'react';

export const useENSAddress = (): string | undefined => {
  const [ensAddress, setEnsAddress] = useState<string>();

  const { account, providerRpc } = useSDK();

  const getEnsAddress = useCallback(async () => {
    if (!providerRpc || !account) {
      return;
    }

    try {
      const _ensAddress = await providerRpc.lookupAddress(account);

      if (_ensAddress) {
        setEnsAddress(_ensAddress);
      } else {
        setEnsAddress(account);
      }
    } catch (e) {
      console.error(e);
      setEnsAddress(account);
    }
  }, [providerRpc, account]);

  useEffect(() => {
    void getEnsAddress();
  }, [getEnsAddress, account]);

  return ensAddress;
};
