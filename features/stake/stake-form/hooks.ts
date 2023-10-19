import { AddressZero } from '@ethersproject/constants';
import { useLidoSWR, useSDK, useSTETHContractRPC } from '@lido-sdk/react';
import { ESTIMATE_ACCOUNT, STETH_SUBMIT_GAS_LIMIT_DEFAULT } from 'config';
import { parseEther } from '@ethersproject/units';
import { BigNumber } from 'ethers';
import { STRATEGY_CONSTANT } from 'utils/swrStrategies';
import { useStakingLimitLevel } from 'shared/hooks/useStakingLimitLevel';
import { LIMIT_LEVEL } from 'types';
import { SUBMIT_EXTRA_GAS_TRANSACTION_RATIO } from './utils';

const ESTIMATE_AMOUNT = parseEther('0.001');
const PRECISION = 10 ** 6;

type UseStethSubmitGasLimit = () => BigNumber;

const fallback = BigNumber.from(
  STETH_SUBMIT_GAS_LIMIT_DEFAULT * SUBMIT_EXTRA_GAS_TRANSACTION_RATIO,
);

export const applyGasLimitRatio = (gasLimit: BigNumber): BigNumber =>
  gasLimit.mul(SUBMIT_EXTRA_GAS_TRANSACTION_RATIO * PRECISION).div(PRECISION);

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

  return data ?? fallback;
};

export const useStakingLimitWarn = () => {
  const limitLevel = useStakingLimitLevel();

  const limitWarning =
    limitLevel === LIMIT_LEVEL.WARN
      ? 'Stake limit is almost exhausted. Your transaction may not go through.'
      : '';

  const limitError =
    limitLevel === LIMIT_LEVEL.WARN
      ? 'Stake limit is exhausted. Please wait until the limit is restored.'
      : '';

  return {
    limitError,
    limitWarning,
    limitReached: limitLevel === LIMIT_LEVEL.REACHED,
  };
};
