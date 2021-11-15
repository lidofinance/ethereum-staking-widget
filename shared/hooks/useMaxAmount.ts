import { BigNumber } from 'ethers';
import { formatEther, parseEther } from '@ethersproject/units';
import { useGasPrice } from './useGasPrice';

type UseMaxAmountArgs = {
  balance: BigNumber;
  gasLimit?: number;
  token?: string;
};

type useMaxAmountInput = (args: UseMaxAmountArgs) => string;

export const useMaxAmount: useMaxAmountInput = ({
  balance,
  gasLimit = 21000,
  token = 'ETH',
}) => {
  const gasPrice = useGasPrice();
  if (!gasPrice || !balance) return '0.0';

  if (token !== 'ETH') {
    return formatEther(balance);
  }

  const padding = BigNumber.from(parseEther('0.01'));
  const max = balance.sub(padding).sub(gasPrice.mul(BigNumber.from(gasLimit)));
  return max.gt(BigNumber.from(0)) ? formatEther(max) : '0.0';
};
