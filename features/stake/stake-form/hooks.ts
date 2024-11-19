import { config } from 'config';
import { ESTIMATE_AMOUNT } from 'config/groups/web3';
import { STRATEGY_CONSTANT } from 'consts/react-query-strategies';
import { useLidoQuery } from 'shared/hooks/use-lido-query';
import { ADDRESS_ZERO, useDappStatus, useLidoSDK } from 'modules/web3';
import { applyGasLimitRatio } from 'utils/apply-gas-limit-ratio';

export const useStethSubmitGasLimit = (): bigint => {
  const { stake } = useLidoSDK();
  const { chainId } = useDappStatus();

  const { data } = useLidoQuery({
    queryKey: ['submit-gas-limit', chainId],
    queryFn: async () => {
      const stethContract = await stake.getContractStETH();
      const gasLimit = await stethContract.estimateGas.submit([ADDRESS_ZERO], {
        account: config.ESTIMATE_ACCOUNT,
        value: ESTIMATE_AMOUNT,
      });
      return applyGasLimitRatio(gasLimit);
    },
    strategy: STRATEGY_CONSTANT,
    enabled: !!chainId,
  });

  return data ?? config.STAKE_GASLIMIT_FALLBACK;
};
