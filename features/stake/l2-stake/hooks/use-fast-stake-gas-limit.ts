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
  LIDO_L2_FAST_STAKE_ETH_GAS_LIMIT_FALLBACK,
  LIDO_L2_FAST_STAKE_WETH_GAS_LIMIT_FALLBACK,
  LIDO_L2_WETH_APPROVE_GAS_LIMIT_FALLBACK,
  LIDO_L2_STAKING_QUERY_SCOPE,
  type L2StakeModule,
} from 'modules/l2-staking';
import type { L2StakableToken } from 'modules/l2-staking/types';
import { LIDO_ADDRESS } from 'config/groups/stake';

// the WETH estimate relies on the estimate account holding WETH and
// an allowance for the receiver, see config ESTIMATE_ACCOUNT.
// The estimate account holds no wstETH, so the mint writes a cold storage
// slot: the limit is an upper bound for real stakers by design.
const stakeProps = (token: L2StakableToken) => ({
  account: config.ESTIMATE_ACCOUNT,
  amount: ESTIMATE_AMOUNT,
  referral: LIDO_ADDRESS as Address,
  minReceiveAmount: 0n,
  token,
});

const approveProps = {
  account: config.ESTIMATE_ACCOUNT,
  amount: ESTIMATE_AMOUNT,
};

// Served while the estimates load and after they failed; never cached as an
// estimate, see the queries below
const FALLBACK_GAS_LIMITS = {
  gasLimitEth: LIDO_L2_FAST_STAKE_ETH_GAS_LIMIT_FALLBACK,
  gasLimitWeth: LIDO_L2_FAST_STAKE_WETH_GAS_LIMIT_FALLBACK,
  gasLimitWethApprove: LIDO_L2_WETH_APPROVE_GAS_LIMIT_FALLBACK,
};

const estimateStake = (l2Stake: L2StakeModule, token: L2StakableToken) =>
  l2Stake.fastStakeEthEstimateGas(stakeProps(token));

// Logs which call failed and lets the failure reach the query, so the query
// fails and is retried instead of caching a fallback as an estimate
const warnOnFailure = async <T>(
  label: string,
  run: () => Promise<T>,
): Promise<T> => {
  try {
    return await run();
  } catch (error) {
    console.warn(`[fast-stake-gas-limit::${label}]`, error);
    throw error;
  }
};

// representative tx for chain-specific fee quotes (L1 data fee, linea_estimateGas)
const populateTx = async (
  label: string,
  populate: () => Promise<{ to: Address; data?: Hex; value?: bigint }>,
): Promise<FeeEstimateTx | undefined> => {
  const { to, data, value } = await warnOnFailure(`${label}-tx`, populate);
  if (!data) return undefined;
  return { account: config.ESTIMATE_ACCOUNT, to, data, value };
};

export const useFastStakeGasLimit = () => {
  const { l2Stake, chainId, isL2Stake } = useLidoSDKL2();

  const { data: gasLimits } = useQuery({
    queryKey: [
      LIDO_L2_STAKING_QUERY_SCOPE,
      'fast-stake-gas-limit',
      { chainId },
    ],
    enabled: isL2Stake,
    ...STRATEGY_CONSTANT,
    placeholderData: FALLBACK_GAS_LIMITS,
    queryFn: async () => {
      const [gasLimitEth, gasLimitWeth, gasLimitWethApprove] =
        await Promise.all([
          warnOnFailure('eth', () => estimateStake(l2Stake, 'ETH')),
          warnOnFailure('weth', () => estimateStake(l2Stake, 'WETH')),
          warnOnFailure('weth-approve', () =>
            l2Stake.approveWethForFastStakeEstimateGas(approveProps),
          ),
        ]);
      return { gasLimitEth, gasLimitWeth, gasLimitWethApprove };
    },
  });

  // Quoted apart from the estimates, so a failed estimate does not drop the
  // tx-specific parts (the L1 data fee) from the cost
  const { data: txs } = useQuery({
    queryKey: [LIDO_L2_STAKING_QUERY_SCOPE, 'fast-stake-txs', { chainId }],
    enabled: isL2Stake,
    ...STRATEGY_CONSTANT,
    queryFn: async () => {
      const [txEth, txWeth, txWethApprove] = await Promise.all([
        populateTx('eth', () =>
          l2Stake.fastStakeEthPopulateTx(stakeProps('ETH')),
        ),
        populateTx('weth', () =>
          l2Stake.fastStakeEthPopulateTx(stakeProps('WETH')),
        ),
        populateTx('weth-approve', () =>
          l2Stake.approveWethForFastStakePopulateTx(approveProps),
        ),
      ]);
      return { txEth, txWeth, txWethApprove };
    },
  });

  return {
    // the placeholder while loading, the fallback after a failed estimate
    ...(gasLimits ?? FALLBACK_GAS_LIMITS),
    txEth: txs?.txEth,
    txWeth: txs?.txWeth,
    txWethApprove: txs?.txWethApprove,
  };
};
