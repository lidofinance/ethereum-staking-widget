import { BigNumber } from 'ethers';
import { formatEther, parseEther } from '@ethersproject/units';
import { useGasPrice } from './useGasPrice';

type UseMaxAmountArgs = {
  balance: BigNumber;
  gasLimit?: number;
  token?: string;
  padded?: boolean;
};

type useMaxAmountInput = (args: UseMaxAmountArgs) => string;

export const useMaxAmount: useMaxAmountInput = ({
  balance,
  gasLimit = 21000,
  token = 'ETH',
  padded = true,
}) => {
  const gasPrice = useGasPrice();
  if (!gasPrice || !balance) return '0.0';

  if (token !== 'ETH') {
    return formatEther(balance);
  }

  let maxAmount = formatEther(balance);
  if (padded) {
    const padding = BigNumber.from(parseEther('0.01'));
    const paddedAmount = balance
      .sub(padding)
      .sub(gasPrice.mul(BigNumber.from(gasLimit)));
    maxAmount = paddedAmount.gt(BigNumber.from(0))
      ? formatEther(paddedAmount)
      : '0.0';
  }

  return maxAmount;
};
