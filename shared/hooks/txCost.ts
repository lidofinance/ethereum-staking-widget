import { useEthPrice } from '@lido-sdk/react';
import { BigNumber } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import { weiToEth } from 'utils';
import { useGasPrice } from './useGasPrice';

type UseTxCostInWei = (gasLimit?: number) => BigNumber | undefined;

export const useTxCostInWei: UseTxCostInWei = (gasLimit) => {
  const gasPrice = useGasPrice();

  const [txCostInWei, seTxCostInWei] = useState<BigNumber>();

  const calculateTxCostInWei = useCallback(() => {
    if (!gasPrice || !gasLimit) return;

    const gasLimitBN = BigNumber.from(gasLimit);
    seTxCostInWei(gasLimitBN.mul(gasPrice));
  }, [gasLimit, gasPrice]);

  useEffect(() => {
    calculateTxCostInWei();
  }, [calculateTxCostInWei]);

  return txCostInWei;
};

type UseTxCostInUsd = (gasLimit?: number) => number | undefined;

export const useTxCostInUsd: UseTxCostInUsd = (gasLimit) => {
  const txCostInWei = useTxCostInWei(gasLimit);

  // useEthPrice hook works via mainnet chain!
  const { data: ethInUsd } = useEthPrice() as {
    data?: number;
    update: () => void;
  };

  const [txCostInUsd, setTxCostInUsd] = useState<number>();

  const calculateTxCostInUsd = useCallback(() => {
    if (!ethInUsd || !txCostInWei) return;

    const txCostInEth = weiToEth(txCostInWei);
    const txCostInUsd = txCostInEth * ethInUsd;
    setTxCostInUsd(txCostInUsd);
  }, [ethInUsd, txCostInWei]);

  useEffect(() => {
    calculateTxCostInUsd();
  }, [calculateTxCostInUsd]);

  return txCostInUsd;
};
