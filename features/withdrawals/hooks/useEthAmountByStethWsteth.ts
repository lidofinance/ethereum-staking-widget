import { parseEther } from '@ethersproject/units';
import { BigNumber } from 'ethers';
import { useMemo } from 'react';
import { useContractSWR, useWSTETHContractRPC } from '@lido-sdk/react';

import { isValidEtherValue } from 'utils/isValidEtherValue';
import { STRATEGY_LAZY } from 'utils/swrStrategies';

type useEthAmountByInputProps = {
  isSteth: boolean;
  input?: string;
};

export const useEthAmountByStethWsteth = ({
  isSteth,
  input,
}: useEthAmountByInputProps) => {
  const isValidValue =
    input && !isNaN(Number(input)) && isValidEtherValue(input);
  const inputBN = useMemo(
    () => (isValidValue ? parseEther(input) : BigNumber.from(0)),
    [input, isValidValue],
  );

  const wsteth = isSteth ? undefined : inputBN;
  const { data: stethByWstethBalance, loading } = useContractSWR({
    contract: useWSTETHContractRPC(),
    method: 'getStETHByWstETH',
    params: [wsteth],
    shouldFetch: !!wsteth,
    config: STRATEGY_LAZY,
  });

  const result = { amount: stethByWstethBalance, loading };
  if (!isValidValue) result.amount = undefined;
  if (isSteth) result.amount = inputBN;
  return result;
};
