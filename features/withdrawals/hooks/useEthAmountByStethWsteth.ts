import { parseEther } from '@ethersproject/units';
import { BigNumber } from 'ethers';
import { useMemo } from 'react';

import { useStethByWsteth } from 'shared/hooks';
import { isValidEtherValue } from 'utils/isValidEtherValue';

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

  const stethByWstethBalance = useStethByWsteth(isSteth ? undefined : inputBN);

  if (!isValidValue) return undefined;
  if (isSteth) return inputBN;
  return stethByWstethBalance;
};
