import { BigNumber } from 'ethers';
import useSWR from 'swr';

import { useLidoSDK } from 'providers/lido-sdk';

export const useStETHByWstETHOnL2 = (wsteth: BigNumber | undefined) => {
  const { l2 } = useLidoSDK();

  const fetchSteth = async (amount: bigint) => {
    return await l2.steth.convertToSteth(amount);
  };

  const { data, error, isValidating, mutate } = useSWR(
    wsteth ? [wsteth.toBigInt()] : null,
    fetchSteth,
  );

  return {
    // Make usable for UnwrapStats component (in future can be used like bigint)
    data: data ? BigNumber.from(data) : undefined,
    initialLoading: isValidating && !data && !error,
    loading: isValidating,
    error,
    update: mutate,
  };
};
