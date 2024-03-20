import { BigNumber } from 'ethers';
import { AddressZero } from '@ethersproject/constants';
import { useLidoSWR, useSDK, useSTETHContractRPC } from '@lido-sdk/react';

import { config } from 'config';
import { STRATEGY_CONSTANT } from 'consts/swr-strategies';

import { applyGasLimitRatio } from './utils';

type UseStethSubmitGasLimit = () => BigNumber;

export const useStethSubmitGasLimit: UseStethSubmitGasLimit = () => {
  const stethContractRPC = useSTETHContractRPC();

  const { chainId } = useSDK();
  const { data } = useLidoSWR(
    ['submit-gas-limit', chainId],
    async () => {
      const gasLimit = await stethContractRPC.estimateGas.submit(AddressZero, {
        from: config.ESTIMATE_ACCOUNT,
        value: config.ESTIMATE_AMOUNT,
      });
      return applyGasLimitRatio(gasLimit);
    },
    STRATEGY_CONSTANT,
  );

  return data ?? config.STAKE_GASLIMIT_FALLBACK;
};
