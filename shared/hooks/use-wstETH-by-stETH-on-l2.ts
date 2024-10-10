import { BigNumber } from 'ethers';
import useSWR from 'swr';

import { useLidoSDK } from 'providers/lido-sdk';

export const useWstETHByStETHOnL2 = (steth: BigNumber | undefined) => {
  const { l2 } = useLidoSDK();

  const { data, error, isValidating, mutate } = useSWR(
    // if key is null, SWR will not fetch any data.
    steth
      ? ['[swr:use-wsteth-by-steth-l2]', steth.toBigInt(), l2.core.chainId]
      : null,
    (_key: string, amount: bigint) => {
      return l2.steth.convertToShares(amount);
    },
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
