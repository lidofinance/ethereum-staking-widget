import { useQuery } from '@tanstack/react-query';
import { zeroAddress } from 'viem';
import { config } from 'config';
import { ESTIMATE_AMOUNT } from 'config/groups/web3';
import { STRATEGY_CONSTANT } from 'consts/react-query-strategies';
import { useLidoSDK } from 'modules/web3';
import { applyGasLimitRatio } from 'utils/apply-gas-limit-ratio';

export const useStethSubmitGasLimit = (): bigint => {
  const { stake } = useLidoSDK();

  const { data } = useQuery({
    queryKey: ['submit-gas-limit', stake.core.chainId],
    enabled: !!stake.core && !!stake.core.chainId,
    ...STRATEGY_CONSTANT,
    queryFn: async () => {
      const stethContract = await stake.getContractStETH();
      const gasLimit = await stethContract.estimateGas.submit([zeroAddress], {
        account: config.ESTIMATE_ACCOUNT,
        value: ESTIMATE_AMOUNT,
      });
      return applyGasLimitRatio(gasLimit);
    },
  });

  return data ?? config.STAKE_GASLIMIT_FALLBACK;
};
