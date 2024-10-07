import { BigNumber } from 'ethers';
import useSWR from 'swr';

import { useLidoSDK } from 'providers/lido-sdk';

export const useWstETHByStETHOnL2 = (steth: BigNumber | undefined) => {
  const { l2 } = useLidoSDK();

  const fetchSteth = async (amount: bigint) => {
    return await l2.steth.convertToShares(amount);
  };

  const { data, error, isValidating, mutate } = useSWR(
    // if key is null, SWR will not fetch any data.
    steth ? [steth.toBigInt()] : null,
    fetchSteth,
  );

  return {
    // Make usable for UnwrapStats component (in future can be used like bigint)
    data: typeof data !== 'undefined' ? BigNumber.from(data) : undefined,
    initialLoading: isValidating && !data && !error,
    loading: isValidating,
    error,
    update: mutate,
  };
};
