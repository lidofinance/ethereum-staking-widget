import { BigNumber } from 'ethers';
import { formatEther, parseEther } from '@ethersproject/units';
import { useGasPrice } from './useGasPrice';

type UseMaxAmountArgs = {
  limit?: BigNumber;
  gasLimit?: number;
  token?: string;
  padded?: boolean | ((padAmount: BigNumber) => boolean);
};

type useMaxAmountInput = (args: UseMaxAmountArgs) => string;

export const useMaxAmount: useMaxAmountInput = ({
  limit,
  gasLimit = 21000,
  token = 'ETH',
  padded = true,
}) => {
  const gasPrice = useGasPrice();
  if (!gasPrice || !limit) return '0.0';

  if (token !== 'ETH') {
    return formatEther(limit);
  }

  const padAmount = gasPrice
    .mul(BigNumber.from(gasLimit))
    .add(BigNumber.from(parseEther('0.01')));

  if (typeof padded === 'function' ? padded(padAmount) : padded) {
    const paddedAmount = limit.sub(padAmount);
    return paddedAmount.gt(BigNumber.from(0))
      ? formatEther(paddedAmount)
      : '0.0';
  }

  return formatEther(limit);
};
