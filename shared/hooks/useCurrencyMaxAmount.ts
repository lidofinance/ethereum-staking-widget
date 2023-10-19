import { BigNumber } from 'ethers';
import { formatEther, parseEther } from '@ethersproject/units';
import { useMaxGasPrice } from './useMaxGasPrice';
import { useMemo } from 'react';

type UseMaxAmountArgs = {
  limit?: BigNumber;
  gasLimit?: BigNumber;
  token?: string;
  padded?: boolean | ((padAmount: BigNumber) => boolean);
};

// TODO deprecate
export const useCurrencyMaxAmount = ({
  limit,
  gasLimit = BigNumber.from(21000),
  token = 'ETH',
  padded = true,
}: UseMaxAmountArgs): string => {
  // use maxFeePerGas https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1559.md
  const maxGasPrice = useMaxGasPrice();

  const maxAmount = useMemo(() => {
    if (!limit) return '0.0';

    if (token !== 'ETH') return formatEther(limit);

    if (!maxGasPrice) return '0.0';

    const padAmount = maxGasPrice
      .mul(gasLimit)
      .add(BigNumber.from(parseEther('0.01')));

    if (typeof padded === 'function' ? padded(padAmount) : padded) {
      const paddedAmount = limit.sub(padAmount);
      return paddedAmount.gt(BigNumber.from(0))
        ? formatEther(paddedAmount)
        : '0.0';
    }

    return formatEther(limit);
  }, [gasLimit, limit, maxGasPrice, padded, token]);

  return maxAmount;
};
