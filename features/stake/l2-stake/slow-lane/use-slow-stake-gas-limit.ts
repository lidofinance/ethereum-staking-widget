import { useQuery } from '@tanstack/react-query';
import type { Address, Hex } from 'viem';
import { config } from 'config';
import { STRATEGY_CONSTANT } from 'consts/react-query-strategies';
import {
  ESTIMATE_AMOUNT,
  useLidoSDKL2,
  type FeeEstimateTx,
} from 'modules/web3';
import {
  LIDO_L2_SLOW_STAKE_ETH_GAS_LIMIT_FALLBACK,
  LIDO_L2_SLOW_STAKE_WETH_GAS_LIMIT_FALLBACK,
  LIDO_L2_STAKING_QUERY_SCOPE,
  type L2StakeModule,
} from 'modules/l2-staking';
import type { L2StakableToken } from 'modules/l2-staking/types';

// The send fronts the CCIP fee in value, which the estimate account does not
// hold, so the L2 gas is not estimated: the lane constants stand for it. The
// calldata is still populated, for the chains that price a tx by it (the L1
// data fee); the cap does not change its size
const stakeProps = (token: L2StakableToken) => ({
  account: config.ESTIMATE_ACCOUNT,
  amount: ESTIMATE_AMOUNT,
  maxFee: 0n,
  token,
});

const populateTx = async (
  label: string,
  populate: () => Promise<{ to: Address; data?: Hex; value?: bigint }>,
): Promise<FeeEstimateTx | undefined> => {
  try {
    const { to, data, value } = await populate();
    if (!data) return undefined;
    return { account: config.ESTIMATE_ACCOUNT, to, data, value };
  } catch (error) {
    console.warn(`[slow-stake-gas-limit::${label}-tx]`, error);
    throw error;
  }
};

const populate = (l2Stake: L2StakeModule, token: L2StakableToken) =>
  l2Stake.slowStakePopulateTx(stakeProps(token));

export const useSlowStakeGasLimit = () => {
  const { l2Stake, chainId, isL2Stake } = useLidoSDKL2();

  const { data: txs } = useQuery({
    queryKey: [LIDO_L2_STAKING_QUERY_SCOPE, 'slow-stake-txs', { chainId }],
    enabled: isL2Stake,
    ...STRATEGY_CONSTANT,
    queryFn: async () => {
      const [txEth, txWeth] = await Promise.all([
        populateTx('eth', () => populate(l2Stake, 'ETH')),
        populateTx('weth', () => populate(l2Stake, 'WETH')),
      ]);
      return { txEth, txWeth };
    },
  });

  return {
    gasLimitEth: LIDO_L2_SLOW_STAKE_ETH_GAS_LIMIT_FALLBACK,
    gasLimitWeth: LIDO_L2_SLOW_STAKE_WETH_GAS_LIMIT_FALLBACK,
    txEth: txs?.txEth,
    txWeth: txs?.txWeth,
  };
};
