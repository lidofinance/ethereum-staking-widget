import { useQuery } from '@tanstack/react-query';
import { config } from 'config';
import { STRATEGY_CONSTANT } from 'consts/react-query-strategies';
import { ESTIMATE_AMOUNT, useLidoSDKL2 } from 'modules/web3';
import {
  LIDO_L2_FAST_STAKE_ETH_GAS_LIMIT_FALLBACK,
  LIDO_L2_FAST_STAKE_WETH_GAS_LIMIT_FALLBACK,
  LIDO_L2_WETH_APPROVE_GAS_LIMIT_FALLBACK,
  LIDO_L2_STAKING_QUERY_SCOPE,
  type L2StakeModule,
} from 'modules/l2-staking';
import type { L2StakableToken } from 'modules/l2-staking/types';
import { LIDO_ADDRESS } from 'config/groups/stake';

// the WETH estimate relies on the estimate account holding WETH and
// an allowance for the receiver, see config ESTIMATE_ACCOUNT
const estimateStake = (l2Stake: L2StakeModule, token: L2StakableToken) =>
  l2Stake.fastStakeEthEstimateGas({
    account: config.ESTIMATE_ACCOUNT,
    amount: ESTIMATE_AMOUNT,
    referral: LIDO_ADDRESS,
    minReceiveAmount: 0n,
    token,
  });

const withFallback = async (
  label: string,
  estimate: () => Promise<bigint>,
  fallback: bigint,
) => {
  try {
    return await estimate();
  } catch (error) {
    console.warn(`[fast-stake-gas-limit::${label}]`, error);
    return fallback;
  }
};

export const useFastStakeGasLimit = () => {
  const { l2Stake, chainId } = useLidoSDKL2();

  const { data } = useQuery({
    queryKey: [
      LIDO_L2_STAKING_QUERY_SCOPE,
      'fast-stake-gas-limit',
      { chainId },
    ],

    ...STRATEGY_CONSTANT,

    queryFn: async () => {
      const [gasLimitEth, gasLimitWeth, gasLimitWethApprove] =
        await Promise.all([
          withFallback(
            'eth',
            () => estimateStake(l2Stake, 'ETH'),
            LIDO_L2_FAST_STAKE_ETH_GAS_LIMIT_FALLBACK,
          ),
          withFallback(
            'weth',
            () => estimateStake(l2Stake, 'WETH'),
            LIDO_L2_FAST_STAKE_WETH_GAS_LIMIT_FALLBACK,
          ),
          withFallback(
            'weth-approve',
            () =>
              l2Stake.approveWethForFastStakeEstimateGas({
                account: config.ESTIMATE_ACCOUNT,
                amount: ESTIMATE_AMOUNT,
              }),
            LIDO_L2_WETH_APPROVE_GAS_LIMIT_FALLBACK,
          ),
        ]);

      return { gasLimitEth, gasLimitWeth, gasLimitWethApprove };
    },
  });

  return {
    gasLimitEth: data?.gasLimitEth ?? LIDO_L2_FAST_STAKE_ETH_GAS_LIMIT_FALLBACK,
    gasLimitWeth:
      data?.gasLimitWeth ?? LIDO_L2_FAST_STAKE_WETH_GAS_LIMIT_FALLBACK,
    gasLimitWethApprove:
      data?.gasLimitWethApprove ?? LIDO_L2_WETH_APPROVE_GAS_LIMIT_FALLBACK,
  };
};
