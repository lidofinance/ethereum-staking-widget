import { AddressZero } from '@ethersproject/constants';
import { useLidoSWR, useSDK, useSTETHContractRPC } from '@lido-sdk/react';
import { ESTIMATE_ACCOUNT, ESTIMATE_AMOUNT } from 'config';
import { STAKE_GASLIMIT_FALLBACK } from './stake-config';
import { BigNumber } from 'ethers';
import { STRATEGY_CONSTANT } from 'utils/swrStrategies';
import { useStakingLimitLevel } from 'shared/hooks/useStakingLimitLevel';
import { LIMIT_LEVEL } from 'types';
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
