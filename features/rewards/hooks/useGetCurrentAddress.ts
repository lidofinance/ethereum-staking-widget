import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import debounce from 'lodash/debounce';
import { usePublicClient } from 'wagmi';
import { isAddress, type PublicClient } from 'viem';

import { useDappStatus } from 'modules/web3';
import { resolveEns, isValidEns } from 'features/rewards/utils';
import { MATOMO_INPUT_EVENTS_TYPES } from 'consts/matomo';
import { trackMatomoEvent } from 'utils/track-matomo-event';

type UseGetCurrentAddress = () => {
  address: string;
  addressError: string;
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
  const [addressError, setAddressError] = useState('');

  const { isReady, query } = useRouter();
  const { address: account, chainId, isSupportedChain } = useDappStatus();
  // it works, but typing issue
  const publicClient = usePublicClient({ chainId: chainId }) as PublicClient;

  const getEnsAddress = useCallback(
    async (value: string) => {
      setAddress('');
      let result: string | null = null;
      let error: string | null = null;

      setIsAddressResolving(true);
      try {
        result = await resolveEns(value, publicClient);
      } catch (e) {
        console.error(e);
        error = 'An error happened during ENS name resolving';
      } finally {
        setIsAddressResolving(false);
      }

      if (result) {
        setAddress(result);
      } else if (error) {
        setAddressError(error);
      } else {
        setAddressError("The ENS name entered couldn't be found");
      }
    },
    [publicClient],
  );

  const resolveInputValue = useMemo(
    () =>
      debounce(async (value: string) => {
        if (value && isValidEns(value)) {
          await getEnsAddress(value);
        } else if (isAddress(value)) {
          setAddress(value);
          trackMatomoEvent(
            MATOMO_INPUT_EVENTS_TYPES.ethRewardsEnterAddressManually,
          );
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
      if (account && isSupportedChain) {
        setInputValue(account);
        trackMatomoEvent(MATOMO_INPUT_EVENTS_TYPES.ethRewardsEnterAddressAuto);
      }
    }
  }, [account, query.address, isReady, setInputValue, isSupportedChain]);

  return {
    address,
    addressError,
    inputValue,
    isAddressResolving,
    setInputValue,
  };
};
