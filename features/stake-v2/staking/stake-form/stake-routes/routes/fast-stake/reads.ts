import invariant from 'tiny-invariant';
import { encodeFunctionData, erc20Abi, zeroAddress, type Address } from 'viem';
import { LIDO_L2_CONTRACT_ADDRESSES } from '@lidofinance/lido-ethereum-sdk/common';
import type { Config } from 'wagmi';

import { config } from 'config';
import { LIDO_ADDRESS } from 'config/groups/stake';
import { TOKENS } from 'consts/tokens';
import {
  L2_STAKING_ORACLE_FEED_ABI,
  L2_STAKING_ORACLE_POOL_ABI,
  L2_STAKING_RECEIVER_ABI,
  calcFastStakeEthByWsteth,
} from 'modules/l2-staking';
import { ESTIMATE_AMOUNT, type FeeEstimateTx } from 'modules/web3';

import { getClient, getTokenAddressOrThrow } from '../../../../../utils';

export const getStakeReceiver = (chainId: number) => {
  const receiver =
    chainId in LIDO_L2_CONTRACT_ADDRESSES
      ? LIDO_L2_CONTRACT_ADDRESSES[
          chainId as keyof typeof LIDO_L2_CONTRACT_ADDRESSES
        ]?.stakeReceiver
      : undefined;
  invariant(receiver, `No fast stake on chain ${chainId}`);
  return receiver;
};

const readOraclePool = (wagmiConfig: Config, chainId: number) =>
  getClient(wagmiConfig, chainId).readContract({
    address: getStakeReceiver(chainId),
    abi: L2_STAKING_RECEIVER_ABI,
    functionName: 'getOraclePool',
  });

const readPoolRate = async (
  wagmiConfig: Config,
  chainId: number,
  pool: Address,
) => {
  const client = getClient(wagmiConfig, chainId);
  const [feeRate, oracle] = await Promise.all([
    client.readContract({
      address: pool,
      abi: L2_STAKING_ORACLE_POOL_ABI,
      functionName: 'getFee',
    }),
    client.readContract({
      address: pool,
      abi: L2_STAKING_ORACLE_POOL_ABI,
      functionName: 'getOracle',
    }),
  ]);
  const price = await client.readContract({
    address: oracle,
    abi: L2_STAKING_ORACLE_FEED_ABI,
    functionName: 'getLatestAnswer',
  });
  return { feeRate, price };
};

/**
 * Fast stake rate of an L2: the pool fee and the oracle price (the same
 * contracts the SDK reads, on this chain). Public: the quote data.
 */
export const readFastStakeRate = async (wagmiConfig: Config, chainId: number) =>
  readPoolRate(
    wagmiConfig,
    chainId,
    await readOraclePool(wagmiConfig, chainId),
  );

/** the pool's wstETH, valued in ETH at its rate: what can be staked now */
export const readFastStakeLiquidity = async (
  wagmiConfig: Config,
  chainId: number,
) => {
  const pool = await readOraclePool(wagmiConfig, chainId);
  const [{ feeRate, price }, wstethLiquidity] = await Promise.all([
    readPoolRate(wagmiConfig, chainId, pool),
    getClient(wagmiConfig, chainId).readContract({
      address: getTokenAddressOrThrow(chainId, TOKENS.wsteth),
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [pool],
    }),
  ]);
  return calcFastStakeEthByWsteth(wstethLiquidity, feeRate, price);
};

/** WETH the stake receiver may take from `account` */
export const readWethAllowance = (
  wagmiConfig: Config,
  chainId: number,
  account: Address,
) =>
  getClient(wagmiConfig, chainId).readContract({
    address: getTokenAddressOrThrow(chainId, TOKENS.weth),
    abi: erc20Abi,
    functionName: 'allowance',
    args: [account, getStakeReceiver(chainId)],
  });

/** a representative fast stake, for the chain's L1 data fee quote */
export const fastStakeEstimateTx = (chainId: number): FeeEstimateTx => ({
  account: config.ESTIMATE_ACCOUNT,
  to: getStakeReceiver(chainId),
  data: encodeFunctionData({
    abi: L2_STAKING_RECEIVER_ABI,
    functionName: 'fastStakeReferral',
    args: [zeroAddress, ESTIMATE_AMOUNT, 0n, LIDO_ADDRESS],
  }),
  value: ESTIMATE_AMOUNT,
});
