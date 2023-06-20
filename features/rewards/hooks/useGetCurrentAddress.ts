import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useSDK } from '@lido-sdk/react';
import debounce from 'lodash/debounce';
import { resolveEns, isValidEns, isValidAddress } from 'features/rewards/utils';

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
  const router = useRouter();

  // We'll get crashes from hekers if don't handle multiple parameters with same key
  const queryAddr = Array.isArray(router.query?.address)
    ? router.query?.address[0]
    : router.query?.address;

  const getEnsAddress = useCallback(async (value: string) => {
    setAddress('');

    setIsAddressResolving(true);
    const result = await resolveEns(value);
    setIsAddressResolving(false);

    if (result) setAddress(result);
  }, []);

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
    resolveInputValue(inputValue);
  }, [resolveInputValue, inputValue]);

  // Pick up an address
  useEffect(() => {
    // From a connected wallet
    if (account) setInputValue(account);
    // From query parameters
    if (queryAddr) setInputValue(queryAddr);
  }, [account, queryAddr, setInputValue]);

  return {
    address,
    inputValue,
    isAddressResolving,
    setInputValue,
  };
};
