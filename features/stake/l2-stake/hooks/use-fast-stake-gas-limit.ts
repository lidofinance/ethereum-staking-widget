import { useQuery } from '@tanstack/react-query';
import { config } from 'config';
import { STRATEGY_CONSTANT } from 'consts/react-query-strategies';
import { ESTIMATE_AMOUNT, useLidoSDKL2 } from 'modules/web3';
import {
  LIDO_L2_FAST_STAKE_ETH_GAS_LIMIT_FALLBACK,
  LIDO_L2_STAKING_QUERY_SCOPE,
} from 'modules/l2-staking';
import { LIDO_ADDRESS } from 'config/groups/stake';

export const useFastStakeGasLimit = (): bigint => {
  const { l2Stake, chainId } = useLidoSDKL2();

  const { data } = useQuery({
    queryKey: [
      LIDO_L2_STAKING_QUERY_SCOPE,
      'fast-stake-gas-limit',
      { chainId },
    ],

    ...STRATEGY_CONSTANT,

    queryFn: () =>
      l2Stake.fastStakeEthEstimateGas({
        account: config.ESTIMATE_ACCOUNT,
        amount: ESTIMATE_AMOUNT,
        referral: LIDO_ADDRESS,
        minReceiveAmount: 0n,
        token: 'ETH',
      }),
  });

  return data ?? LIDO_L2_FAST_STAKE_ETH_GAS_LIMIT_FALLBACK;
};
