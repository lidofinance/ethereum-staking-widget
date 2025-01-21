import { useQuery } from '@tanstack/react-query';
import { zeroAddress } from 'viem';
import { config } from 'config';
import { STRATEGY_CONSTANT } from 'consts/react-query-strategies';
import { useLidoSDK, ESTIMATE_AMOUNT } from 'modules/web3';

export const useStethSubmitGasLimit = (): bigint => {
  const { stake } = useLidoSDK();

  const { data } = useQuery({
    queryKey: ['submit-gas-limit', stake.core.chainId],
    ...STRATEGY_CONSTANT,
    queryFn: () =>
      stake.stakeEthEstimateGas({
        account: config.ESTIMATE_ACCOUNT,
        value: ESTIMATE_AMOUNT,
        referralAddress: zeroAddress,
      }),
  });

  return data ?? config.STAKE_GASLIMIT_FALLBACK;
};
