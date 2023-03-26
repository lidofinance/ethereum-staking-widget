import { parseEther } from '@ethersproject/units';
import { BigNumber } from 'ethers';

import { useStethByWsteth } from 'shared/hooks';
import { isValidEtherValue } from 'utils/isValidEtherValue';

type useEthAmountByInputProps = {
  isSteth: boolean;
  input?: string;
};

export const useEthAmountByInput = ({
  isSteth,
  input,
}: useEthAmountByInputProps) => {
  const inputBN = parseEther(input || '0');
  const stethByWstethBalance = useStethByWsteth(isSteth ? undefined : inputBN);

  const isValidValue =
    input && !isNaN(Number(input)) && isValidEtherValue(input);

  const ethAmount = BigNumber.from(1)?.mul(
    isValidValue ? inputBN : BigNumber.from(0),
  );

  if (isSteth) return ethAmount;
  else return stethByWstethBalance;
};
