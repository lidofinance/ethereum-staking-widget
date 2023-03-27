import { parseEther } from '@ethersproject/units';
import { BigNumber } from 'ethers';

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
  const inputBN = isValidValue ? parseEther(input) : BigNumber.from(0);
  const stethByWstethBalance = useStethByWsteth(isSteth ? undefined : inputBN);

  if (!isValidValue) return BigNumber.from(0);

  if (isSteth) return BigNumber.from(1)?.mul(inputBN);
  else return stethByWstethBalance;
};
