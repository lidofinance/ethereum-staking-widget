/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { Address, getContract } from 'viem';
import {
  ERROR_CODE,
  LidoSDKModule,
  Cache,
  getEncodableContract,
  invariant,
} from '@lidofinance/lido-ethereum-sdk/common';
import { bridgedWstethAbi } from '@lidofinance/lido-ethereum-sdk/l2';

import {
  L2_STAKING_ORACLE_POOL_ABI,
  L2_STAKING_RECEIVER_ABI,
  L2_STAKING_ORACLE_FEED_ABI,
} from './l2-staking-abi';
import { LIDO_L2_STAKING_CONTRACT_MAP } from './const';

import type {
  L2StakingReceiverContractType,
  L2StakingOracleFeedContractType,
  L2StakingOraclePoolContractType,
} from './types';

const L2_ORACLE_POOL_PRECISION = BigInt(1e18);

export const calcFastStakeWstethByEth = (
  ethAmount: bigint,
  feeRate: bigint,
  price: bigint,
): bigint => {
  const P = L2_ORACLE_POOL_PRECISION;
  const feeAmount = (ethAmount * feeRate) / P;
  return ((ethAmount - feeAmount) * P) / price;
};

// Exact inverse of calcFastStakeWstethByEth, rounded down:
// returns max `eth` such that calcFastStakeWstethByEth(eth) <= wstethAmount.
export const calcFastStakeEthByWsteth = (
  wstethAmount: bigint,
  feeRate: bigint,
  price: bigint,
): bigint => {
  const P = L2_ORACLE_POOL_PRECISION;
  invariant(price > 0n && feeRate < P, 'Invalid fast stake rate');

  // floor(net * P / price) <= wsteth  <=>  net * P < (wsteth + 1) * price
  const maxNetEth = ((wstethAmount + 1n) * price - 1n) / P;
  // net(eth) = eth - floor(eth * fee / P) <= maxNet  <=>  eth <= maxNet * P / (P - fee)
  return (maxNetEth * P) / (P - feeRate);
};

const CACHE_TIME_CONSTANT = 30 * 60 * 1000; // 30 minutes
const CACHE_TIME_DYNAMIC = 5 * 60 * 1000; // 5 minutes

export class L2StakeModule extends LidoSDKModule {
  public L2_ORACLE_POOL_PRECISION = L2_ORACLE_POOL_PRECISION;

  @Cache(CACHE_TIME_CONSTANT, ['core.chain.id'])
  public async getL2StakingReceiverContractAddress(): Promise<Address> {
    const chainId = this.core.chain.id;
    const contractMap =
      chainId in LIDO_L2_STAKING_CONTRACT_MAP
        ? LIDO_L2_STAKING_CONTRACT_MAP[
            chainId as keyof typeof LIDO_L2_STAKING_CONTRACT_MAP
          ]
        : undefined;
    invariant(
      contractMap,
      `L2 Staking contract not found for chainId: ${chainId}`,
      ERROR_CODE.NOT_SUPPORTED,
    );
    return contractMap.L2stakingReceiver;
  }

  @Cache(CACHE_TIME_CONSTANT, ['core.chain.id'])
  public async getL2StakingWstethContractAddress(): Promise<Address> {
    const chainId = this.core.chain.id;
    const contractMap =
      chainId in LIDO_L2_STAKING_CONTRACT_MAP
        ? LIDO_L2_STAKING_CONTRACT_MAP[
            chainId as keyof typeof LIDO_L2_STAKING_CONTRACT_MAP
          ]
        : undefined;
    invariant(
      contractMap,
      `L2 Staking contract not found for chainId: ${chainId}`,
      ERROR_CODE.NOT_SUPPORTED,
    );
    return contractMap.L2wstETH;
  }

  //   @Logger('Contracts:')
  @Cache(CACHE_TIME_CONSTANT, ['core.chain.id'])
  public async getL2StakingReceiverContract(): Promise<L2StakingReceiverContractType> {
    const address = await this.getL2StakingReceiverContractAddress();
    return getEncodableContract(
      getContract({
        address,
        abi: L2_STAKING_RECEIVER_ABI,
        client: this.core.keyedClient,
      }),
    );
  }

  //   @Logger('Contracts:')
  @Cache(CACHE_TIME_CONSTANT, ['core.chain.id'])
  public async getL2StakingReceiverOraclePoolContract(): Promise<L2StakingOraclePoolContractType> {
    const receiverContract = await this.getL2StakingReceiverContract();

    const oraclePoolAddress = await receiverContract.read.getOraclePool();
    return getEncodableContract(
      getContract({
        address: oraclePoolAddress,
        abi: L2_STAKING_ORACLE_POOL_ABI,
        client: this.core.keyedClient,
      }),
    );
  }

  //   @Logger('Contracts:')
  @Cache(CACHE_TIME_CONSTANT, ['core.chain.id'])
  public async getL2StakingReceiverOracleFeedContract(): Promise<L2StakingOracleFeedContractType> {
    const poolContract = await this.getL2StakingReceiverOraclePoolContract();

    const oracleFeedAddress = await poolContract.read.getOracle();
    return getEncodableContract(
      getContract({
        address: oracleFeedAddress,
        abi: L2_STAKING_ORACLE_FEED_ABI,
        client: this.core.keyedClient,
      }),
    );
  }

  @Cache(CACHE_TIME_DYNAMIC, ['core.chain.id'])
  public async getFastStakeFee(): Promise<bigint> {
    const oraclePool = await this.getL2StakingReceiverOraclePoolContract();
    const fee = await oraclePool.read.getFee();
    return fee;
  }

  // less cache, price/fee can change periodically
  @Cache(CACHE_TIME_DYNAMIC, ['core.chain.id'])
  public async getFastStakeRate(): Promise<{ feeRate: bigint; price: bigint }> {
    const oraclePool = await this.getL2StakingReceiverOraclePoolContract();
    const oracleFeed = await this.getL2StakingReceiverOracleFeedContract();

    const [feeRate, price] = await Promise.all([
      oraclePool.read.getFee(),
      oracleFeed.read.getLatestAnswer(),
    ]);
    return { feeRate, price };
  }

  @Cache(CACHE_TIME_DYNAMIC, ['core.chain.id'])
  public async getFastStakeWstethByEth(ethAmount: bigint): Promise<bigint> {
    const { feeRate, price } = await this.getFastStakeRate();
    return calcFastStakeWstethByEth(ethAmount, feeRate, price);
  }

  @Cache(CACHE_TIME_DYNAMIC, ['core.chain.id'])
  public async getFastStakeEthByWsteth(wstethAmount: bigint): Promise<bigint> {
    const { feeRate, price } = await this.getFastStakeRate();
    return calcFastStakeEthByWsteth(wstethAmount, feeRate, price);
  }

  @Cache(CACHE_TIME_DYNAMIC, ['core.chain.id'])
  public async getFastStakeLiquidity(): Promise<{
    wsteth: bigint;
    eth: bigint;
  }> {
    const poolAddress = (await this.getL2StakingReceiverOraclePoolContract())
      .address;
    const wstethAddress = await this.getL2StakingWstethContractAddress();
    const wstethContract = getContract({
      address: wstethAddress,
      abi: bridgedWstethAbi,
      client: this.core.keyedClient,
    });
    const wstethLiquidity = await wstethContract.read.balanceOf([poolAddress]);
    const ethLiquidity = await this.getFastStakeEthByWsteth(wstethLiquidity);
    return { wsteth: wstethLiquidity, eth: ethLiquidity };
  }
}
