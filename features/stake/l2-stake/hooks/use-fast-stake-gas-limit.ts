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

const estimateStake = (l2Stake: L2StakeModule, token: L2StakableToken) =>
  l2Stake.fastStakeEthEstimateGas(stakeProps(token));

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

// representative tx for chain-specific fee quotes (L1 data fee, linea_estimateGas)
const populateTx = async (
  label: string,
  populate: () => Promise<{ to: Address; data?: Hex; value?: bigint }>,
): Promise<FeeEstimateTx | undefined> => {
  try {
    const { to, data, value } = await populate();
    if (!data) return undefined;
    return { account: config.ESTIMATE_ACCOUNT, to, data, value };
  } catch (error) {
    console.warn(`[fast-stake-gas-limit::${label}-tx]`, error);
    return undefined;
  }
};

export const useFastStakeGasLimit = () => {
  const { l2Stake, chainId, isL2Stake } = useLidoSDKL2();

  const { data } = useQuery({
    queryKey: [
      LIDO_L2_STAKING_QUERY_SCOPE,
      'fast-stake-gas-limit',
      { chainId },
    ],
    enabled: isL2Stake,
    ...STRATEGY_CONSTANT,

    queryFn: async () => {
      const [
        gasLimitEth,
        gasLimitWeth,
        gasLimitWethApprove,
        txEth,
        txWeth,
        txWethApprove,
      ] = await Promise.all([
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
        populateTx('eth', () =>
          l2Stake.fastStakeEthPopulateTx(stakeProps('ETH')),
        ),
        populateTx('weth', () =>
          l2Stake.fastStakeEthPopulateTx(stakeProps('WETH')),
        ),
        populateTx('weth-approve', () =>
          l2Stake.approveWethForFastStakePopulateTx({
            account: config.ESTIMATE_ACCOUNT,
            amount: ESTIMATE_AMOUNT,
          }),
        ),
      ]);

      return {
        gasLimitEth,
        gasLimitWeth,
        gasLimitWethApprove,
        txEth,
        txWeth,
        txWethApprove,
      };
    },
  });

  return {
    gasLimitEth: data?.gasLimitEth ?? LIDO_L2_FAST_STAKE_ETH_GAS_LIMIT_FALLBACK,
    gasLimitWeth:
      data?.gasLimitWeth ?? LIDO_L2_FAST_STAKE_WETH_GAS_LIMIT_FALLBACK,
    gasLimitWethApprove:
      data?.gasLimitWethApprove ?? LIDO_L2_WETH_APPROVE_GAS_LIMIT_FALLBACK,
    txEth: data?.txEth,
    txWeth: data?.txWeth,
    txWethApprove: data?.txWethApprove,
  };
};
