import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import { LIDO_L2_CONTRACT_ADDRESSES } from '@lidofinance/lido-ethereum-sdk/common';
import { WstethABI } from '@lidofinance/lido-ethereum-sdk/wrap';
import { useConfig, type Config } from 'wagmi';
import { getPublicClient } from 'wagmi/actions';

import { getTokenAddress } from 'config/networks/token-address';
import { isSupportedL2Chain } from 'consts/chains';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { TOKENS } from 'consts/tokens';
import {
  L2_STAKING_ORACLE_FEED_ABI,
  L2_STAKING_ORACLE_POOL_ABI,
  L2_STAKING_RECEIVER_ABI,
  calcFastStakeWstethByEth,
} from 'modules/l2-staking';
import { ONE_stETH } from 'modules/web3';

type EthToWstethRate =
  // L1: stake gives stETH 1:1, wrapped at the wstETH rate
  | { type: 'wrap'; wstethPerSteth: bigint }
  // L2: fast stake from the receiver's pool, fee included
  | { type: 'fast-stake'; feeRate: bigint; price: bigint };

const readEthToWstethRate = async (
  wagmiConfig: Config,
  chainId: number,
): Promise<EthToWstethRate> => {
  const client = getPublicClient(wagmiConfig, { chainId });
  invariant(client, `No public client for chain ${chainId}`);

  if (!isSupportedL2Chain(chainId)) {
    const wsteth = getTokenAddress(chainId, TOKENS.wsteth);
    invariant(wsteth, `No wstETH on chain ${chainId}`);
    const wstethPerSteth = await client.readContract({
      address: wsteth,
      abi: WstethABI,
      functionName: 'getWstETHByStETH',
      args: [ONE_stETH],
    });
    return { type: 'wrap', wstethPerSteth };
  }

  // the same contracts the SDK reads, but on this chain, not the wallet's
  const receiver =
    chainId in LIDO_L2_CONTRACT_ADDRESSES
      ? LIDO_L2_CONTRACT_ADDRESSES[
          chainId as keyof typeof LIDO_L2_CONTRACT_ADDRESSES
        ]?.stakeReceiver
      : undefined;
  invariant(receiver, `No fast stake on chain ${chainId}`);

  const pool = await client.readContract({
    address: receiver,
    abi: L2_STAKING_RECEIVER_ABI,
    functionName: 'getOraclePool',
  });
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
  return { type: 'fast-stake', feeRate, price };
};

const convert = (rate: EthToWstethRate, eth: bigint) =>
  rate.type === 'wrap'
    ? (eth * rate.wstethPerSteth) / ONE_stETH
    : calcFastStakeWstethByEth(eth, rate.feeRate, rate.price);

/**
 * wstETH that staking ETH gives on `chainId`, the chain of tokenIn, not the
 * wallet's. `ethToWsteth` is undefined while the rate loads or if it fails.
 */
export const useEthToWsteth = (chainId: number) => {
  const wagmiConfig = useConfig();

  const { data: rate } = useQuery({
    queryKey: ['stake-v2', 'eth-to-wsteth-rate', { chainId }],
    queryFn: () => readEthToWstethRate(wagmiConfig, chainId),
    ...STRATEGY_LAZY,
  });

  const ethToWsteth = useCallback(
    (eth: bigint) => (rate ? convert(rate, eth) : undefined),
    [rate],
  );

  return rate ? ethToWsteth : undefined;
};
