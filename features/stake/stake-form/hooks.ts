import { config } from 'config';
import { STRATEGY_CONSTANT } from 'consts/react-query-strategies';
import { useLidoQuery } from 'shared/hooks/use-lido-query';
import { ADDRESS_ZERO, useDappStatus, useLidoSDK } from 'modules/web3';
import { applyGasLimitRatioBigInt } from 'utils/apply-gas-limit-ratio';

export const useStethSubmitGasLimit = (): bigint => {
  const { stake } = useLidoSDK();
  const { chainId } = useDappStatus();

  const { data } = useLidoQuery({
    queryKey: ['submit-gas-limit', chainId],
    queryFn: async () => {
      const stethContract = await stake.getContractStETH();
      const gasLimit = await stethContract.estimateGas.submit([ADDRESS_ZERO], {
        account: config.ESTIMATE_ACCOUNT,
        value: config.ESTIMATE_AMOUNT_BIGINT,
      });
      return applyGasLimitRatioBigInt(gasLimit);
    },
    strategy: STRATEGY_CONSTANT,
    enabled: !!chainId,
  });

  return data ?? config.STAKE_GASLIMIT_FALLBACK;
};
