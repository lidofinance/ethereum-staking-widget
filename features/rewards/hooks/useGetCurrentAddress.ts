import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import debounce from 'lodash/debounce';

import { useSDK } from '@lido-sdk/react';

import { resolveEns, isValidEns, isValidAddress } from 'features/rewards/utils';
import { useCurrentStaticRpcProvider } from 'shared/hooks/use-current-static-rpc-provider';

type UseGetCurrentAddress = () => {
  address: string;
  inputValue: string;
  isAddressResolving: boolean;
  setInputValue: (value: string) => void;
};

export const useGetCurrentAddress: UseGetCurrentAddress = () => {
  const [inputValue, setInputValueState] = useState('');
  const setInputValue = useCallback((value: string) => {
    setInputValueState(value.trim());
  }, []);
  const [isAddressResolving, setIsAddressResolving] = useState(false);
  const [address, setAddress] = useState('');

  const { account } = useSDK();
  const { staticRpcProvider } = useCurrentStaticRpcProvider();
  const { isReady, query } = useRouter();

  const getEnsAddress = useCallback(
    async (value: string) => {
      setAddress('');

      setIsAddressResolving(true);
      const result = await resolveEns(value, staticRpcProvider);
      setIsAddressResolving(false);

      if (result) setAddress(result);
    },
    [staticRpcProvider],
  );

  const resolveInputValue = useMemo(
    () =>
      debounce(async (value: string) => {
        if (value && isValidEns(value)) {
          await getEnsAddress(value);
        } else if (isValidAddress(value)) {
          setAddress(value);
        } else {
          setAddress('');
        }
      }, 200),
    [getEnsAddress, setAddress],
  );

  useEffect(() => {
    void resolveInputValue(inputValue);
  }, [resolveInputValue, inputValue]);

  // Pick up an address

  useEffect(() => {
    if (isReady) {
      const queryAddr = Array.isArray(query.address)
        ? query.address[0]
        : query.address;
      // From query parameters, more important
      if (queryAddr) {
        setInputValue(queryAddr);
        return;
      }
      // From a connected wallet
      if (account) setInputValue(account);
    }
  }, [account, query.address, isReady, setInputValue]);

  return {
    address,
    inputValue,
    isAddressResolving,
    setInputValue,
  };
};
