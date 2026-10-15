/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import {
  encodeFunctionData,
  getContract,
  parseEventLogs,
  size,
  zeroAddress,
  type Address,
  type TransactionReceipt,
} from 'viem';
import {
  ERROR_CODE,
  LidoSDKModule,
  Cache,
  getEncodableContract,
  invariant,
  NOOP,
  LIDO_L2_CONTRACT_ADDRESSES,
  Logger,
} from '@lidofinance/lido-ethereum-sdk/common';
import { bridgedWstethAbi } from '@lidofinance/lido-ethereum-sdk/l2';
import { wethABI } from 'abi/weth-abi';
// the estimate file, not the fees barrel: that one carries the hooks, which
// lead back to the SDK provider this module is created in
import { estimateSendFees } from 'modules/web3/fees/estimate';

import {
  L2_STAKING_ORACLE_POOL_ABI,
  L2_STAKING_RECEIVER_ABI,
  L2_STAKING_ORACLE_FEED_ABI,
} from './l2-staking-abi';
import {
  CCIP_ONRAMP_ABI,
  CCIP_ROUTER_ABI,
  CCIP_TOKEN_POOL_ABI,
} from './ccip-abi';
import {
  CCIP_ETHEREUM_CHAIN_SELECTOR,
  LIDO_L2_SLOW_STAKE_LANES,
  type L2SlowStakeLaneConfig,
} from './const';
import {
  applySlowStakeMaxFeeBuffer,
  buildSlowStakeCcipMessage,
  decodeFeeDtoOAmount,
  encodeFeeDtoO,
  encodeFeeOtoD,
} from './fee-codec';

import type {
  AccountValue,
  CHAINS,
  CommonTransactionProps,
  PopulatedTransaction,
  TransactionOptions,
  TransactionResult,
} from '@lidofinance/lido-ethereum-sdk/core';

import type {
  L2StakingReceiverContractType,
  L2StakingOracleFeedContractType,
  L2StakingOraclePoolContractType,
  L2FastStakeProps,
  ParsedL2FastStakeProps,
  L2WethContractType,
  L2ApproveWethProps,
  ParsedL2ApproveWethProps,
  CcipRouterContractType,
  CcipTokenPoolContractType,
  L2FastStakeResult,
  L2StakeState,
  L2SlowStakeConfig,
  L2SlowStakeFee,
  L2SlowStakeFeeProps,
  L2SlowStakeLimits,
  L2SlowStakeProps,
  L2SlowStakeResult,
  ParsedL2SlowStakeProps,
} from './types';

type TokenBucket = {
  tokens: bigint;
  lastUpdated: number;
  isEnabled: boolean;
  capacity: bigint;
  rate: bigint;
};

// Decorator arguments are evaluated while the class is being defined, before
// any static field of it exists, so these stay outside the class
const CACHE_TIME_CONSTANT = 30 * 60 * 1000; // 30 minutes
const CACHE_TIME_DYNAMIC = 5 * 60 * 1000; // 5 minutes
const L2_ORACLE_POOL_PRECISION = BigInt(1e18);

export class L2StakeModule extends LidoSDKModule {
  public L2_ORACLE_POOL_PRECISION = L2_ORACLE_POOL_PRECISION;
  public ETH_TOKEN_ADDRESS = zeroAddress;

  private static clampToZero = (value: bigint) => (value > 0n ? value : 0n);

  public static calcFastStakeWstethByEth(
    ethAmount: bigint,
    feeRate: bigint,
    price: bigint,
  ): bigint {
    const P = L2_ORACLE_POOL_PRECISION;
    invariant(price > 0n && feeRate < P, 'Invalid fast stake rate');
    const feeAmount = (ethAmount * feeRate) / P;
    return ((ethAmount - feeAmount) * P) / price;
  }

  // Exact inverse of calcFastStakeWstethByEth, rounded down:
  // returns max `eth` such that calcFastStakeWstethByEth(eth) <= wstethAmount.
  public static calcFastStakeEthByWsteth(
    wstethAmount: bigint,
    feeRate: bigint,
    price: bigint,
  ): bigint {
    const P = L2_ORACLE_POOL_PRECISION;
    invariant(price > 0n && feeRate < P, 'Invalid fast stake rate');

    // floor(net * P / price) <= wsteth  <=>  net * P < (wsteth + 1) * price
    const maxNetEth = ((wstethAmount + 1n) * price - 1n) / P;
    // net(eth) = eth - floor(eth * fee / P) <= maxNet  <=>  eth <= maxNet * P / (P - fee)
    return (maxNetEth * P) / (P - feeRate);
  }

  // The bucket is consumed by the token transfer, which is the stake plus the
  // return-leg budget: the stake caps are that much below the bucket
  public static calcSlowStakeLimits(
    bucket: TokenBucket,
    feeAmountDtoO: bigint,
  ): L2SlowStakeLimits {
    return {
      isEnabled: bucket.isEnabled,
      capacity: bucket.capacity,
      available: bucket.tokens,
      rate: bucket.rate,
      lastUpdated: bucket.lastUpdated,
      ...(bucket.isEnabled && {
        maxAmount: L2StakeModule.clampToZero(bucket.capacity - feeAmountDtoO),
        availableAmount: L2StakeModule.clampToZero(
          bucket.tokens - feeAmountDtoO,
        ),
      }),
    };
  }

  // Seconds until `amount` fits the bucket, the way the pool computes it: 0
  // when it fits now, undefined when it never will (above the capacity). A
  // lower bound: competing traffic in the meantime pushes it out
  public static calcSlowStakeWaitSeconds(
    limits: L2SlowStakeLimits,
    amount: bigint,
  ): number | undefined {
    if (limits.maxAmount === undefined || limits.availableAmount === undefined)
      return 0;
    if (amount > limits.maxAmount) return undefined;
    if (amount <= limits.availableAmount) return 0;
    if (limits.rate === 0n) return undefined;
    const missing = amount - limits.availableAmount;
    return Number((missing + limits.rate - 1n) / limits.rate);
  }

  @Logger('Contracts:')
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

  @Logger('Contracts:')
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

  @Logger('Contracts:')
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

  @Logger('Contracts:')
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

  @Logger('Contracts:')
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

  @Logger('Contracts:')
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

  // WETH is the receiver's WNATIVE: staking it, fast or slow, is approve +
  // stake with the token address, so one allowance to the receiver serves
  // both routes
  @Logger('Contracts:')
  @Cache(CACHE_TIME_CONSTANT, ['core.chain.id'])
  public async getWethContractAddress(): Promise<Address> {
    const { WNATIVE } = await this.getReceiverConstants();
    return WNATIVE;
  }

  @Logger('Contracts:')
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

  public async getWethAllowance(account?: AccountValue): Promise<bigint> {
    const parsedAccount = await this.core.useAccount(account);
    const [weth, receiver] = await Promise.all([
      this.getWethContract(),
      this.getL2StakingReceiverContractAddress(),
    ]);
    return weth.read.allowance([parsedAccount.address, receiver]);
  }

  public async approveWethEstimateGas(
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

  public async approveWethPopulateTx(
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

  public async approveWeth(
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
   * The SDK core prices every tx from a fee-history sample. Chains whose fee
   * model quotes send fees per tx (Linea) get the tx re-priced with that
   * quote; the others keep the core's price.
   */
  private async withChainFees<T extends TransactionOptions>(
    options: T,
    tx: { to: Address; data: `0x${string}`; value?: bigint },
  ): Promise<T> {
    const account =
      typeof options.account === 'string'
        ? options.account
        : options.account?.address;
    if (!account) return options;
    const sendFees = await estimateSendFees(
      this.core.publicClient,
      this.core.chain.id,
      { ...tx, account },
    );
    return sendFees ? { ...options, ...sendFees } : options;
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
    return L2StakeModule.calcFastStakeWstethByEth(ethAmount, feeRate, price);
  }

  @Cache(CACHE_TIME_DYNAMIC, ['core.chain.id'])
  public async getFastStakeEthByWsteth(wstethAmount: bigint): Promise<bigint> {
    const { feeRate, price } = await this.getFastStakeRate();
    return L2StakeModule.calcFastStakeEthByWsteth(wstethAmount, feeRate, price);
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
  ): Promise<TransactionResult<L2FastStakeResult>> {
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

    return this.core.performTransaction<L2FastStakeResult>({
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
      decodeResult: async (receipt) =>
        this.decodeFastStakeEvents(receipt, contract.address),
    });
  }

  // What the swap settled at: the wstETH received is the per-operation
  // figure, where a balance read would mix in whatever else the account holds
  public async decodeFastStakeEvents(
    receipt: TransactionReceipt,
    senderAddress?: Address,
  ): Promise<L2FastStakeResult> {
    const logs = await this.senderLogs(receipt, senderAddress);
    const [stake] = parseEventLogs({
      abi: L2_STAKING_RECEIVER_ABI,
      eventName: 'FastStake',
      logs,
    });
    invariant(
      stake,
      'FastStake event not found in the receipt',
      ERROR_CODE.TRANSACTION_ERROR,
    );
    const [referral] = parseEventLogs({
      abi: L2_STAKING_RECEIVER_ABI,
      eventName: 'Referral',
      logs,
    });
    const { user, token, amountIn, amountOut } = stake.args;
    return {
      user,
      token,
      amountIn,
      amountOut,
      referral: referral?.args.referral,
    };
  }

  // the receipt's logs from the sender contract only: a foreign contract in
  // the same transaction could emit a look-alike
  private async senderLogs(
    receipt: TransactionReceipt,
    senderAddress?: Address,
  ) {
    const sender =
      senderAddress ?? (await this.getL2StakingReceiverContractAddress());
    return receipt.logs.filter(
      (log) => log.address.toLowerCase() === sender.toLowerCase(),
    );
  }

  // ---------------------------------------------------------------------
  // Slow stake: one CCIP message to the L1 receiver, wstETH bridged back
  // ---------------------------------------------------------------------

  public getSlowStakeLaneConfig(): L2SlowStakeLaneConfig {
    const chainId = this.core.chain.id;
    const lane = LIDO_L2_SLOW_STAKE_LANES[chainId];
    invariant(
      lane,
      `Slow stake lane is not configured for chainId: ${chainId}`,
      ERROR_CODE.NOT_SUPPORTED,
    );
    return lane;
  }

  // The lane constants next to what the sender validates them against: the
  // receiver it routes to and the gas floor it enforces
  @Cache(CACHE_TIME_CONSTANT, ['core.chain.id'])
  public async getSlowStakeConfig(): Promise<L2SlowStakeConfig> {
    const lane = this.getSlowStakeLaneConfig();
    const receiverContract = await this.getL2StakingReceiverContract();
    const [receiver, { MIN_PROCESS_MESSAGE_GAS }] = await Promise.all([
      receiverContract.read.getReceiver([CCIP_ETHEREUM_CHAIN_SELECTOR]),
      this.getReceiverConstants(),
    ]);
    invariant(
      size(receiver) > 0,
      'L1 receiver is not set for the slow stake lane',
      ERROR_CODE.NOT_SUPPORTED,
    );
    invariant(
      BigInt(lane.gasLimit) >= MIN_PROCESS_MESSAGE_GAS,
      'Slow stake gas limit is below the sender floor',
      ERROR_CODE.NOT_SUPPORTED,
    );
    const feeDtoO = encodeFeeDtoO(lane.returnFee);
    return {
      destChainSelector: CCIP_ETHEREUM_CHAIN_SELECTOR,
      receiver,
      gasLimit: lane.gasLimit,
      feeDtoO,
      feeAmountDtoO: decodeFeeDtoOAmount(feeDtoO),
      minProcessMessageGas: MIN_PROCESS_MESSAGE_GAS,
    };
  }

  @Cache(CACHE_TIME_CONSTANT, ['core.chain.id'])
  public async getCcipRouterContract(): Promise<CcipRouterContractType> {
    const { CCIP_ROUTER } = await this.getReceiverConstants();
    return getEncodableContract(
      getContract({
        address: CCIP_ROUTER,
        abi: CCIP_ROUTER_ABI,
        client: this.core.keyedClient,
      }),
    );
  }

  // The lane's WETH pool, found the way the router finds it for a send:
  // router -> OnRamp of the destination -> pool of the source token
  @Cache(CACHE_TIME_CONSTANT, ['core.chain.id'])
  public async getCcipWethPoolContract(): Promise<CcipTokenPoolContractType> {
    const [router, { WNATIVE }] = await Promise.all([
      this.getCcipRouterContract(),
      this.getReceiverConstants(),
    ]);
    const onRampAddress = await router.read.getOnRamp([
      CCIP_ETHEREUM_CHAIN_SELECTOR,
    ]);
    invariant(
      onRampAddress !== zeroAddress,
      'CCIP lane to Ethereum is not configured on the router',
      ERROR_CODE.NOT_SUPPORTED,
    );
    const onRamp = getContract({
      address: onRampAddress,
      abi: CCIP_ONRAMP_ABI,
      client: this.core.keyedClient,
    });
    const poolAddress = await onRamp.read.getPoolBySourceToken([
      CCIP_ETHEREUM_CHAIN_SELECTOR,
      WNATIVE,
    ]);
    invariant(
      poolAddress !== zeroAddress,
      'CCIP has no pool for WETH on this lane',
      ERROR_CODE.NOT_SUPPORTED,
    );
    return getEncodableContract(
      getContract({
        address: poolAddress,
        abi: CCIP_TOKEN_POOL_ABI,
        client: this.core.keyedClient,
      }),
    );
  }

  // Whether either route is open, read live: a pause is exactly what a form
  // must see at once. The sender has no pause of its own; each lane closes
  // on one switch Lido's admin holds on the sender. The fast lane: the
  // oracle pool unset, or paused by its owner. The slow lane: the L1
  // receiver entry unset, and besides that CCIP's own gates, where the
  // router can drop the lane, the WETH pool can drop the chain, and the
  // pool's limiter can be set to a zero capacity. The L1 receiver has no
  // pause either, but there a stake fails at Lido's own gate, so the L1
  // stake limit and pause belong to the same check in the UI
  public async fetchStakeState(): Promise<L2StakeState> {
    const [sender, router, pool] = await Promise.all([
      this.getL2StakingReceiverContract(),
      this.getCcipRouterContract(),
      this.getCcipWethPoolContract(),
    ]);
    const [
      oraclePoolAddress,
      receiver,
      isCcipLaneSupported,
      isCcipPoolChainSupported,
      bucket,
    ] = await Promise.all([
      sender.read.getOraclePool(),
      sender.read.getReceiver([CCIP_ETHEREUM_CHAIN_SELECTOR]),
      router.read.isChainSupported([CCIP_ETHEREUM_CHAIN_SELECTOR]),
      pool.read.isSupportedChain([CCIP_ETHEREUM_CHAIN_SELECTOR]),
      pool.read.getCurrentOutboundRateLimiterState([
        CCIP_ETHEREUM_CHAIN_SELECTOR,
      ]),
    ]);

    const isOraclePoolSet = oraclePoolAddress !== zeroAddress;
    const isOraclePoolPaused = isOraclePoolSet
      ? await getContract({
          address: oraclePoolAddress,
          abi: L2_STAKING_ORACLE_POOL_ABI,
          client: this.core.keyedClient,
        }).read.paused()
      : false;
    const isCcipRateLimitOpen = !bucket.isEnabled || bucket.capacity > 0n;

    return {
      isFastLaneAvailable: isOraclePoolSet && !isOraclePoolPaused,
      isSlowLaneAvailable:
        size(receiver) > 0 &&
        isCcipLaneSupported &&
        isCcipPoolChainSupported &&
        isCcipRateLimitOpen,
    };
  }

  // Uncached: the bucket refills every second and a send consumes it. The
  // quote does not consult it, so a quoted stake can still bounce here
  public async fetchSlowStakeLimits(): Promise<L2SlowStakeLimits> {
    const [pool, { feeAmountDtoO }] = await Promise.all([
      this.getCcipWethPoolContract(),
      this.getSlowStakeConfig(),
    ]);
    const bucket = await pool.read.getCurrentOutboundRateLimiterState([
      CCIP_ETHEREUM_CHAIN_SELECTOR,
    ]);
    return L2StakeModule.calcSlowStakeLimits(bucket, feeAmountDtoO);
  }

  // Uncached: the quote a transaction is capped by must be current. Quoted
  // on the message the sender builds, so the price is the one the send sees.
  // The stake token is always the lane's WETH here: native is wrapped first
  public async fetchSlowStakeFee({
    amount,
    account,
  }: L2SlowStakeFeeProps): Promise<L2SlowStakeFee> {
    const amountValue = BigInt(amount);
    invariant(
      amountValue > 0n,
      'Slow stake amount must be positive',
      ERROR_CODE.INVALID_ARGUMENT,
    );
    const [router, config, token] = await Promise.all([
      this.getCcipRouterContract(),
      this.getSlowStakeConfig(),
      this.getWethContractAddress(),
    ]);
    const message = buildSlowStakeCcipMessage({
      receiver: config.receiver,
      recipient: account ?? zeroAddress,
      token,
      amount: amountValue,
      feeDtoO: config.feeDtoO,
      feeAmountDtoO: config.feeAmountDtoO,
      gasLimit: config.gasLimit,
    });
    const ccipFee = await router.read.getFee([
      config.destChainSelector,
      message,
    ]);
    return {
      ccipFee,
      maxFee: applySlowStakeMaxFeeBuffer(ccipFee),
      feeAmountDtoO: config.feeAmountDtoO,
      total: ccipFee + config.feeAmountDtoO,
      gasLimit: config.gasLimit,
    };
  }

  @Cache(CACHE_TIME_DYNAMIC, ['core.chain.id'])
  public async getSlowStakeFee(
    props: L2SlowStakeFeeProps,
  ): Promise<L2SlowStakeFee> {
    return this.fetchSlowStakeFee(props);
  }

  // The call as the sender reads it. The value fronts the stake (native
  // only), the return-leg budget and the whole fee cap: the cap is checked
  // against the live quote and what it does not spend comes back in the
  // same transaction, so fronting it is what makes a price tick harmless
  private async buildSlowStakeCall({
    token,
    amount,
    maxFee,
  }: ParsedL2SlowStakeProps) {
    const [contract, config, { WNATIVE }] = await Promise.all([
      this.getL2StakingReceiverContract(),
      this.getSlowStakeConfig(),
      this.getReceiverConstants(),
    ]);
    const tokenAddress = token === 'ETH' ? this.ETH_TOKEN_ADDRESS : WNATIVE;
    const feeOtoD = encodeFeeOtoD({
      maxFee,
      payInLink: false,
      gasLimit: config.gasLimit,
    });
    const params = [
      config.destChainSelector,
      tokenAddress,
      amount,
      feeOtoD,
      config.feeDtoO,
    ] as const;
    const value =
      (token === 'ETH' ? amount : 0n) + config.feeAmountDtoO + maxFee;
    return { contract, params, value };
  }

  public async slowStakeEstimateGas(
    props: Omit<
      L2SlowStakeProps,
      'callback' | 'waitForTransactionReceiptParameters'
    >,
    options?: TransactionOptions,
  ): Promise<bigint> {
    const parsed = await this.parseSlowStakeProps(props);
    const { contract, params, value } = await this.buildSlowStakeCall(parsed);
    return contract.estimateGas.slowStake(params, {
      account: parsed.account,
      ...options,
      value,
    });
  }

  public async slowStakePopulateTx(
    props: Omit<
      L2SlowStakeProps,
      'callback' | 'waitForTransactionReceiptParameters'
    >,
    options?: TransactionOptions,
  ): Promise<PopulatedTransaction> {
    const parsed = await this.parseSlowStakeProps(props);
    const { contract, params, value } = await this.buildSlowStakeCall(parsed);
    const encodedTx = contract.encode.slowStake(params, {
      account: parsed.account,
      ...options,
      value,
    });
    return { ...encodedTx, value, from: parsed.account.address };
  }

  public async slowStake(
    props: L2SlowStakeProps,
    options?: TransactionOptions,
  ): Promise<TransactionResult<L2SlowStakeResult>> {
    this.core.useWalletClient();
    const parsed = await this.parseSlowStakeProps(props);
    const { account, callback, token, amount, maxFee, ...rest } = parsed;
    const { contract, params, value } = await this.buildSlowStakeCall(parsed);
    const tx = {
      to: contract.address,
      data: encodeFunctionData({
        abi: L2_STAKING_RECEIVER_ABI,
        functionName: 'slowStake',
        args: params,
      }),
      value,
    };

    return this.core.performTransaction<L2SlowStakeResult>({
      ...rest,
      ...options,
      account,
      callback,
      getGasLimit: async (options) =>
        contract.estimateGas.slowStake(params, {
          ...(await this.withChainFees(options, tx)),
          value,
        }),
      sendTransaction: async (options) =>
        contract.write.slowStake(params, {
          ...(await this.withChainFees(options, tx)),
          value,
        }),
      decodeResult: async (receipt) =>
        this.decodeSlowStakeEvents(receipt, contract.address),
    });
  }

  // The message id is the handle for everything after the send: the CCIP
  // status and the L1 receiver's outcome are both keyed by it
  public async decodeSlowStakeEvents(
    receipt: TransactionReceipt,
    senderAddress?: Address,
  ): Promise<L2SlowStakeResult> {
    const [log] = parseEventLogs({
      abi: L2_STAKING_RECEIVER_ABI,
      eventName: 'SlowStake',
      logs: await this.senderLogs(receipt, senderAddress),
    });
    invariant(
      log,
      'SlowStake event not found in the receipt',
      ERROR_CODE.TRANSACTION_ERROR,
    );
    const { messageId, user, token, amount } = log.args;
    return { messageId, user, token, amount };
  }

  private async parseSlowStakeProps<
    TProps extends CommonTransactionProps & L2SlowStakeProps,
  >(props: TProps): Promise<ParsedL2SlowStakeProps> {
    return {
      ...props,
      account: await this.core.useAccount(props.account),
      amount: BigInt(props.amount),
      maxFee: BigInt(props.maxFee),
      callback: props.callback ?? NOOP,
    };
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
