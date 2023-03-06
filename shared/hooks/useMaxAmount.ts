import { BigNumber } from 'ethers';
import { formatEther, parseEther } from '@ethersproject/units';
import { useMaxGasPrice } from './useMaxGasPrice';

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
  // use maxFeePerGas https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1559.md
  const maxGasPrice = useMaxGasPrice();
  if (!maxGasPrice || !limit) return '0.0';

  if (token !== 'ETH') {
    return formatEther(limit);
  }

  const padAmount = maxGasPrice
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
