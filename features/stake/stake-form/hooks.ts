import { ADDRESS_ZERO } from 'modules/web3';
import { useLidoSWR, useSDK, useSTETHContractRPC } from '@lido-sdk/react';

import { config } from 'config';
import { STRATEGY_CONSTANT } from 'consts/swr-strategies';

import { applyGasLimitRatioBigInt } from 'utils/apply-gas-limit-ratio';

type UseStethSubmitGasLimit = () => bigint;

export const useStethSubmitGasLimit: UseStethSubmitGasLimit = () => {
  const stethContractRPC = useSTETHContractRPC();

  const { chainId } = useSDK();
  const { data } = useLidoSWR(
    ['submit-gas-limit', chainId],
    async () => {
      const gasLimit = await stethContractRPC.estimateGas.submit(ADDRESS_ZERO, {
        from: config.ESTIMATE_ACCOUNT,
        value: config.ESTIMATE_AMOUNT,
      });
      // TODO: NEW SDK (gasLimit should be bigint)
      return applyGasLimitRatioBigInt(gasLimit?.toBigInt());
    },
    STRATEGY_CONSTANT,
  );

  return data ?? config.STAKE_GASLIMIT_FALLBACK;
};
