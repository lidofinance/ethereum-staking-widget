import { BigNumber } from 'ethers';
import useSWR from 'swr';

import { useLidoSDK } from 'modules/web3';

export const useStETHByWstETHOnL2 = (wsteth: BigNumber | undefined) => {
  const { l2 } = useLidoSDK();

  const { data, error, isValidating, mutate } = useSWR(
    // if key is null, SWR will not fetch any data.
    wsteth
      ? ['[swr:use-steth-by-wsteth-l2]', wsteth.toBigInt(), l2.core.chainId]
      : null,
    (_key: string, amount: bigint) => {
      return l2.steth.convertToSteth(amount);
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
