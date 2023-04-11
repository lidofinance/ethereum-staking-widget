import { useEthPrice } from '@lido-sdk/react';
import { BigNumber } from 'ethers';
import { useMemo } from 'react';
import { weiToEth } from 'utils';
import { useMaxGasPrice } from './useMaxGasPrice';

type UseTxCostInUsd = (gasLimit?: number) => number | undefined;

export const useTxCostInUsd: UseTxCostInUsd = (gasLimit) => {
  const gasPrice = useMaxGasPrice();
  // useEthPrice hook works via mainnet chain!
  const { data: ethInUsd } = useEthPrice();

  return useMemo(() => {
    if (!ethInUsd || !gasPrice) return undefined;
    const gasLimitBN = BigNumber.from(gasLimit).mul(gasPrice);
    const txCostInEth = weiToEth(gasLimitBN);
    return txCostInEth * ethInUsd;
  }, [ethInUsd, gasPrice, gasLimit]);
};
