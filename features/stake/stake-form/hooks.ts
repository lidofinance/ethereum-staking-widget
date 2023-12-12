import { AddressZero } from '@ethersproject/constants';
import { useLidoSWR, useSDK, useSTETHContractRPC } from '@lido-sdk/react';
import {
  ESTIMATE_ACCOUNT,
  ESTIMATE_AMOUNT,
  STAKE_GASLIMIT_FALLBACK,
} from 'config';
import { BigNumber } from 'ethers';
import { STRATEGY_CONSTANT } from 'utils/swrStrategies';
import { applyGasLimitRatio } from './utils';

type UseStethSubmitGasLimit = () => BigNumber;

export const useStethSubmitGasLimit: UseStethSubmitGasLimit = () => {
  const stethContractRPC = useSTETHContractRPC();

  const { chainId } = useSDK();
  const { data } = useLidoSWR(
    ['submit-gas-limit', chainId],
    async () => {
      const gasLimit = await stethContractRPC.estimateGas.submit(AddressZero, {
        from: ESTIMATE_ACCOUNT,
        value: ESTIMATE_AMOUNT,
      });
      return applyGasLimitRatio(gasLimit);
    },
    STRATEGY_CONSTANT,
  );

  return data ?? STAKE_GASLIMIT_FALLBACK;
};
