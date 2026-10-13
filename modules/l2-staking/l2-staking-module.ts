/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { Address, encodeFunctionData, getContract, zeroAddress } from 'viem';
import {
  ERROR_CODE,
  LidoSDKModule,
  Cache,
  getEncodableContract,
  invariant,
  NOOP,
  LIDO_L2_CONTRACT_ADDRESSES,
} from '@lidofinance/lido-ethereum-sdk/common';
import { bridgedWstethAbi } from '@lidofinance/lido-ethereum-sdk/l2';
import { wethABI } from 'abi/weth-abi';
import {
  GAS_FEE_MODEL,
  getGasFeeModel,
} from 'modules/web3/consts/gas-fee-model';
import { getLineaTxFees } from 'modules/web3/utils/tx-fees';

import {
  L2_STAKING_ORACLE_POOL_ABI,
  L2_STAKING_RECEIVER_ABI,
  L2_STAKING_ORACLE_FEED_ABI,
} from './l2-staking-abi';

import type {
  L2StakingReceiverContractType,
  L2StakingOracleFeedContractType,
  L2StakingOraclePoolContractType,
  L2FastStakeProps,
  ParsedL2FastStakeProps,
  L2WethContractType,
  L2ApproveWethProps,
  ParsedL2ApproveWethProps,
} from './types';

import type {
  AccountValue,
  CHAINS,
  CommonTransactionProps,
  PopulatedTransaction,
  TransactionOptions,
  TransactionResult,
} from '@lidofinance/lido-ethereum-sdk/core';
const L2_ORACLE_POOL_PRECISION = BigInt(1e18);

export const calcFastStakeWstethByEth = (
  ethAmount: bigint,
  feeRate: bigint,
  price: bigint,
): bigint => {
  const P = L2_ORACLE_POOL_PRECISION;
  invariant(price > 0n && feeRate < P, 'Invalid fast stake rate');
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
  public ETH_TOKEN_ADDRESS = zeroAddress;

  @Cache(CACHE_TIME_CONSTANT, ['core.chain.id'])
  public async getL2StakingReceiverContractAddress(): Promise<Address> {
    const chainId = this.core.chain.id as CHAINS;
    const receiver =
      chainId in LIDO_L2_CONTRACT_ADDRESSES
        ? LIDO_L2_CONTRACT_ADDRESSES[chainId]?.stakeReceiver
        : undefined;
    invariant(
      receiver,
      `L2 Staking receiver contract not found for chainId: ${chainId}`,
      ERROR_CODE.NOT_SUPPORTED,
    );
    return receiver;
  }

  @Cache(CACHE_TIME_CONSTANT, ['core.chain.id'])
  public async getL2StakingWstethContractAddress(): Promise<Address> {
    const chainId = this.core.chain.id as CHAINS;
    const wsteth =
      chainId in LIDO_L2_CONTRACT_ADDRESSES
        ? LIDO_L2_CONTRACT_ADDRESSES[chainId]?.wsteth
        : undefined;
    invariant(
      wsteth,
      `L2 wsteth contract not found for chainId: ${chainId}`,
      ERROR_CODE.NOT_SUPPORTED,
    );
    return wsteth;
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

  //   @Logger('Contracts:')
  @Cache(CACHE_TIME_CONSTANT, ['core.chain.id'])
  public async getReceiverConstants(): Promise<{
    TOKEN: Address;
    WNATIVE: Address;
    MIN_PROCESS_MESSAGE_GAS: bigint;
    LINK_TOKEN: Address;
    CCIP_ROUTER: Address;
  }> {
    const receiverContract = await this.getL2StakingReceiverContract();

    const [TOKEN, WNATIVE, MIN_PROCESS_MESSAGE_GAS, LINK_TOKEN, CCIP_ROUTER] =
      await Promise.all([
        receiverContract.read.TOKEN(),
        receiverContract.read.WNATIVE(),
        receiverContract.read.MIN_PROCESS_MESSAGE_GAS(),
        receiverContract.read.LINK_TOKEN(),
        receiverContract.read.CCIP_ROUTER(),
      ]);
    return {
      TOKEN,
      WNATIVE,
      MIN_PROCESS_MESSAGE_GAS: BigInt(MIN_PROCESS_MESSAGE_GAS),
      LINK_TOKEN,
      CCIP_ROUTER,
    };
  }

  // WETH is the receiver's WNATIVE: staking it is approve + fastStake with the token address
  @Cache(CACHE_TIME_CONSTANT, ['core.chain.id'])
  public async getWethContractAddress(): Promise<Address> {
    const { WNATIVE } = await this.getReceiverConstants();
    return WNATIVE;
  }

  @Cache(CACHE_TIME_CONSTANT, ['core.chain.id'])
  public async getWethContract(): Promise<L2WethContractType> {
    const address = await this.getWethContractAddress();
    return getEncodableContract(
      getContract({
        address,
        abi: wethABI,
        client: this.core.keyedClient,
      }),
    );
  }

  public async getWethAllowanceForFastStake(
    account?: AccountValue,
  ): Promise<bigint> {
    const parsedAccount = await this.core.useAccount(account);
    const [weth, receiver] = await Promise.all([
      this.getWethContract(),
      this.getL2StakingReceiverContractAddress(),
    ]);
    return weth.read.allowance([parsedAccount.address, receiver]);
  }

  public async approveWethForFastStakeEstimateGas(
    props: Omit<
      L2ApproveWethProps,
      'callback' | 'waitForTransactionReceiptParameters'
    >,
    options?: TransactionOptions,
  ): Promise<bigint> {
    const { amount, account } = await this.parseApproveProps(props);
    const [weth, receiver] = await Promise.all([
      this.getWethContract(),
      this.getL2StakingReceiverContractAddress(),
    ]);
    return weth.estimateGas.approve([receiver, amount], {
      account,
      ...options,
    });
  }

  public async approveWethForFastStakePopulateTx(
    props: Omit<
      L2ApproveWethProps,
      'callback' | 'waitForTransactionReceiptParameters'
    >,
    options?: TransactionOptions,
  ): Promise<PopulatedTransaction> {
    const { amount, account } = await this.parseApproveProps(props);
    const [weth, receiver] = await Promise.all([
      this.getWethContract(),
      this.getL2StakingReceiverContractAddress(),
    ]);
    const encodedTx = weth.encode.approve([receiver, amount], {
      account,
      ...options,
    });
    return { ...encodedTx, from: account.address };
  }

  public async approveWethForFastStake(
    props: L2ApproveWethProps,
    options?: TransactionOptions,
  ): Promise<TransactionResult> {
    this.core.useWalletClient();
    const { account, callback, amount, ...rest } =
      await this.parseApproveProps(props);
    const [weth, receiver] = await Promise.all([
      this.getWethContract(),
      this.getL2StakingReceiverContractAddress(),
    ]);
    const params = [receiver, amount] as const;
    const tx = {
      to: weth.address,
      data: encodeFunctionData({
        abi: wethABI,
        functionName: 'approve',
        args: params,
      }),
    };

    return this.core.performTransaction({
      ...rest,
      ...options,
      account,
      callback,
      getGasLimit: async (options) =>
        weth.estimateGas.approve(params, await this.withChainFees(options, tx)),
      sendTransaction: async (options) =>
        weth.write.approve(params, await this.withChainFees(options, tx)),
    });
  }

  /**
   * The SDK core prices every tx from a fee-history sample (2x base fee + 25th
   * percentile tip). On Linea the base fee is fixed and the tip is the L1 data
   * cost of this very tx: the sample is noise there and gets charged in full,
   * so the tx is re-priced with linea_estimateGas, as wallets do. Other chains
   * keep the core's price.
   */
  private async withChainFees<T extends TransactionOptions>(
    options: T,
    tx: { to: Address; data: `0x${string}`; value?: bigint },
  ): Promise<T> {
    if (getGasFeeModel(this.core.chain.id) !== GAS_FEE_MODEL.Linea) {
      return options;
    }
    const account =
      typeof options.account === 'string'
        ? options.account
        : options.account?.address;
    if (!account) return options;
    try {
      const { maxFeePerGas, maxPriorityFeePerGas } = await getLineaTxFees(
        this.core.publicClient,
        { ...tx, account },
      );
      return { ...options, maxFeePerGas, maxPriorityFeePerGas };
    } catch (error) {
      console.warn('[l2-staking::linea-fees]', error);
      return options;
    }
  }

  //   @Logger('Contracts:')

  @Cache(CACHE_TIME_DYNAMIC, ['core.chain.id'])
  public async getFastStakeFee(): Promise<bigint> {
    const oraclePool = await this.getL2StakingReceiverOraclePoolContract();
    const fee = await oraclePool.read.getFee();
    return fee;
  }

  // Uncached: the quote a transaction is checked against must be current.
  // A zero price or a fee of 100%+ is rejected here, so a bad feed answer
  // surfaces as a failed read instead of a division by zero in a component
  public async fetchFastStakeRate(): Promise<{
    feeRate: bigint;
    price: bigint;
  }> {
    const oraclePool = await this.getL2StakingReceiverOraclePoolContract();
    const oracleFeed = await this.getL2StakingReceiverOracleFeedContract();

    const [feeRate, price] = await Promise.all([
      oraclePool.read.getFee(),
      oracleFeed.read.getLatestAnswer(),
    ]);
    invariant(
      price > 0n && feeRate < L2_ORACLE_POOL_PRECISION,
      'Invalid fast stake rate',
    );
    return { feeRate, price };
  }

  // less cache, price/fee can change periodically
  @Cache(CACHE_TIME_DYNAMIC, ['core.chain.id'])
  public async getFastStakeRate(): Promise<{ feeRate: bigint; price: bigint }> {
    return this.fetchFastStakeRate();
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

  // NB!: no cache for this
  // TODO: cache busting mechanism in SDK
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

  @Cache(CACHE_TIME_CONSTANT, ['core.chain.id'])
  public async fastStakeEthEstimateGas(
    props: Omit<
      L2FastStakeProps,
      'callback' | 'waitForTransactionReceiptParameters'
    >,
    options?: TransactionOptions,
  ): Promise<bigint> {
    const { referral, amount, token, minReceiveAmount, account } =
      await this.parseProps(props);
    const contract = await this.getL2StakingReceiverContract();

    let tokenAddress;
    if (token === 'ETH') {
      tokenAddress = this.ETH_TOKEN_ADDRESS;
    } else {
      const { WNATIVE } = await this.getReceiverConstants();
      tokenAddress = WNATIVE;
    }

    const gasLimit = await contract.estimateGas.fastStakeReferral(
      [tokenAddress, amount, minReceiveAmount, referral],
      {
        account,
        ...options,
        value: token === 'ETH' ? amount : 0n,
      },
    );

    return gasLimit;
  }

  public async fastStakeEthPopulateTx(
    props: Omit<
      L2FastStakeProps,
      'callback' | 'waitForTransactionReceiptParameters'
    >,
    options?: TransactionOptions,
  ): Promise<PopulatedTransaction> {
    const { referral, amount, token, minReceiveAmount, account } =
      await this.parseProps(props);
    const contract = await this.getL2StakingReceiverContract();

    let tokenAddress;
    if (token === 'ETH') {
      tokenAddress = this.ETH_TOKEN_ADDRESS;
    } else {
      const { WNATIVE } = await this.getReceiverConstants();
      tokenAddress = WNATIVE;
    }

    const encodedTx = contract.encode.fastStakeReferral(
      [tokenAddress, amount, minReceiveAmount, referral],
      {
        account,
        ...options,
        value: token === 'ETH' ? amount : 0n,
      },
    );
    return { ...encodedTx, from: account.address };
  }

  public async fastStakeEth(
    props: L2FastStakeProps,
    options?: TransactionOptions,
  ): Promise<TransactionResult> {
    this.core.useWalletClient();
    const {
      account,
      callback,
      token,
      amount,
      minReceiveAmount,
      referral,
      ...rest
    } = await this.parseProps(props);
    const contract = await this.getL2StakingReceiverContract();
    const params = [
      token === 'ETH'
        ? this.ETH_TOKEN_ADDRESS
        : (await this.getReceiverConstants()).WNATIVE,
      amount,
      minReceiveAmount,
      referral,
    ] as const;

    const value = token === 'ETH' ? amount : 0n;
    const tx = {
      to: contract.address,
      data: encodeFunctionData({
        abi: L2_STAKING_RECEIVER_ABI,
        functionName: 'fastStakeReferral',
        args: params,
      }),
      value,
    };

    return this.core.performTransaction({
      ...rest,
      ...options,
      account,
      callback,
      getGasLimit: async (options) =>
        contract.estimateGas.fastStakeReferral(params, {
          ...(await this.withChainFees(options, tx)),
          value,
        }),
      sendTransaction: async (options) =>
        contract.write.fastStakeReferral(params, {
          ...(await this.withChainFees(options, tx)),
          value,
        }),
      // decodeResult: (receipt) =>
      //   this.unwrapParseEvents(receipt, account.address),
    });
  }

  private async parseApproveProps<TProps extends L2ApproveWethProps>(
    props: TProps,
  ): Promise<ParsedL2ApproveWethProps> {
    return {
      ...props,
      account: await this.core.useAccount(props.account),
      amount: BigInt(props.amount),
      callback: props.callback ?? NOOP,
    };
  }

  private async parseProps<
    TProps extends CommonTransactionProps & L2FastStakeProps,
  >(props: TProps): Promise<ParsedL2FastStakeProps> {
    return {
      ...props,
      referral: props.referral ?? zeroAddress,
      account: await this.core.useAccount(props.account),
      // TODO: use parseValue for SDK
      amount: BigInt(props.amount),
      minReceiveAmount: BigInt(props.minReceiveAmount),
      callback: props.callback ?? NOOP,
    };
  }
}
