import { useLidoSWR } from '@lido-sdk/react';

import { config } from 'config';
import { STRATEGY_CONSTANT } from 'consts/swr-strategies';
import { ADDRESS_ZERO, useDappStatus, useLidoSDK } from 'modules/web3';
import { applyGasLimitRatioBigInt } from 'utils/apply-gas-limit-ratio';

export const useStethSubmitGasLimit = (): bigint => {
  const { stake } = useLidoSDK();
  const { chainId } = useDappStatus();

  const { data } = useLidoSWR(
    ['submit-gas-limit', chainId],
    async () => {
      const stethContract = await stake.getContractStETH();
      const gasLimit = await stethContract.estimateGas.submit([ADDRESS_ZERO], {
        account: config.ESTIMATE_ACCOUNT,
        value: config.ESTIMATE_AMOUNT_BIGINT,
      });
      return applyGasLimitRatioBigInt(gasLimit);
    },
    STRATEGY_CONSTANT,
  );

  return data ?? config.STAKE_GASLIMIT_FALLBACK;
};
