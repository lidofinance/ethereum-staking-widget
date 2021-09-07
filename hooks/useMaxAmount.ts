import { BigNumber } from 'ethers';
import { formatEther, parseEther } from '@ethersproject/units';
import { useGasPrice } from './useGasPrice';

type UseMaxAmountArgs = {
  balance: BigNumber;
  gasLimit?: number;
};

type useMaxAmountInput = (args: UseMaxAmountArgs) => string;

export const useMaxAmount: useMaxAmountInput = ({
  balance,
  gasLimit = 21000,
}) => {
  const gasPrice = useGasPrice();
  if (!gasPrice || !balance) return '0.0';

  const padding = BigNumber.from(parseEther('0.01'));
  const max = balance.sub(padding).sub(gasPrice.mul(BigNumber.from(gasLimit)));
  return max.gt(BigNumber.from(0)) ? formatEther(max) : '0.0';
};
