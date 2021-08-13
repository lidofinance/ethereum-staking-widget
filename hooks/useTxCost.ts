import { BigNumber } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import { useGasPrice } from './useGasPrice';

type UseTxCost = (gasLimit?: number) => BigNumber | undefined;

export const useTxCostInWei: UseTxCost = (gasLimit) => {
  const gasPrice = useGasPrice();

  const [txCost, setTxCost] = useState<BigNumber>();

  const calculateTxCost = useCallback(() => {
    if (!gasPrice || !gasLimit) {
      return;
    }

    const gasLimitBN = BigNumber.from(gasLimit);
    setTxCost(gasLimitBN.mul(gasPrice));
  }, [gasLimit, gasPrice]);

  useEffect(() => {
    calculateTxCost();
  }, [calculateTxCost]);

  return txCost;
};
