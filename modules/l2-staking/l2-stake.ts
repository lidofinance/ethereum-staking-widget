/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import {
  BaseError,
  ContractFunctionRevertedError,
  TransactionReceiptNotFoundError,
  decodeAbiParameters,
  encodeFunctionData,
  erc20Abi,
  getContract,
  hexToBigInt,
  isAddressEqual,
  parseEventLogs,
  size,
  zeroAddress,
  zeroHash,
  type Address,
  type Hash,
  type PublicClient,
  type TransactionReceipt,
} from 'viem';
import { getL2TransactionHashes } from 'viem/op-stack';
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
// the estimate file, not the fees barrel: that one carries the hooks, which
// lead back to the SDK provider this module is created in
import { estimateSendFees } from 'modules/web3/fees/estimate';

import { L2_STAKING_RECEIVER_ABI } from './abi/l2-staking-receiver';
import { L2_STAKING_ORACLE_POOL_ABI } from './abi/l2-staking-oracle-pool';
import { L2_STAKING_ORACLE_FEED_ABI } from './abi/l2-staking-oracle-feed';
import {
  CCIP_ONRAMP_ABI,
  CCIP_ROUTER_ABI,
  CCIP_TOKEN_POOL_ABI,
} from './abi/ccip';
import {
  CCIP_ETHEREUM_CHAIN_SELECTOR,
  L2_SLOW_STAKE_STAGE,
  L2_SLOW_STAKE_OUTCOME,
  OP_STACK_L2_CROSS_DOMAIN_MESSENGER,
  ARBITRUM_RETRYABLE_TX_PRECOMPILE,
  LINEA_L2_MESSAGE_SERVICE,
  LINEA_MESSAGE_STATUS_CLAIMED,
  LIDO_L2_SLOW_STAKE_LANES,
  type L2SlowStakeLaneConfig,
} from './const';
import {
  applySlowStakeMaxFeeBuffer,
  buildSlowStakeCcipMessage,
  decodeFeeDtoOAmount,
  decodeSlowStakeData,
  encodeFeeDtoO,
  encodeFeeOtoD,
} from './utils/fee-codec';
import {
  CCIP_MESSAGE_STATUS,
  CcipApiClient,
  getCcipExplorerMessageUrl,
  type CcipMessage,
} from './utils/ccip-api';
import { L1_STAKING_RECEIVER_ABI } from './abi/l1-staking-receiver';
import {
  OP_STACK_L2_CROSS_DOMAIN_MESSENGER_ABI,
  ARBITRUM_INBOX_ABI,
  ARBITRUM_BRIDGE_ABI,
  ARBITRUM_RETRYABLE_TX_ABI,
  LINEA_MESSAGE_SERVICE_ABI,
} from './abi/bridges';
import {
  ARBITRUM_L1_MESSAGE_TYPE_SUBMIT_RETRYABLE,
  calculateArbitrumRetryableCreationId,
  decodeArbitrumSubmitRetryableMessage,
} from './utils/arbitrum-retryable';
import { groupSlowStakeStatuses } from './utils/slow-stake-stacks';
import { L2SlowStakeLookupError, type L2SlowStakeLookupSource } from './errors';

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
  L2StakeModuleProps,
  L1StakingReceiverContractType,
  L1FailedMessage,
  L2SlowStakeSent,
  L2SlowStakeStatus,
  L2SlowStakeReturnLeg,
  L2SlowStakeApiLookupProps,
  L2SlowStakeLatestProps,
  L2SlowStakeLatest,
} from './types';

type TokenBucket = {
  tokens: bigint;
  lastUpdated: number;
  isEnabled: boolean;
  capacity: bigint;
  rate: bigint;
};

// receipt logs by emitter, case-insensitively
const isFrom = (address: Address) => (log: { address: Address }) =>
  isAddressEqual(log.address, address);

type L1ReceiverLogs = ReturnType<
  typeof parseEventLogs<typeof L1_STAKING_RECEIVER_ABI>
>;

// what the receiver's receipt on L1 says about one message
type L1Outcome =
  | {
      kind: 'succeeded';
      l1TxHash: Hash;
      l1BlockNumber: bigint;
      stakedAmount: bigint;
      receiverLogs: L1ReceiverLogs;
    }
  | {
      kind: 'failed';
      l1TxHash: Hash;
      l1BlockNumber: bigint;
      failedMessage: L1FailedMessage;
    };

type L2SlowStakeStatusBase = L2SlowStakeSent & { ccipExplorerUrl: string };

// executed on Ethereum, the wstETH handed to the bridge back
type L2SlowStakeStaked = {
  l1TxHash: Hash;
  l1BlockNumber: bigint;
  stakedAmount: bigint;
  returnLeg: L2SlowStakeReturnLeg;
};

// Decorator arguments are evaluated while the class is being defined, before
// any static field of it exists, so these stay outside the class
const CACHE_TIME_CONSTANT = 30 * 60 * 1000; // 30 minutes
const CACHE_TIME_DYNAMIC = 5 * 60 * 1000; // 5 minutes
const L2_ORACLE_POOL_PRECISION = BigInt(1e18);

export class L2StakeModule extends LidoSDKModule {
  public L2_ORACLE_POOL_PRECISION = L2_ORACLE_POOL_PRECISION;
  public ETH_TOKEN_ADDRESS = zeroAddress;

  private readonly l1PublicClient?: PublicClient;
  private readonly ccipApi: CcipApiClient;

  constructor(props: L2StakeModuleProps) {
    super(props);
    this.l1PublicClient = props.l1PublicClient;
    this.ccipApi = new CcipApiClient({
      baseUrl: props.ccipApiBaseUrl,
      fetcher: props.fetcher,
    });
  }

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
        abi: erc20Abi,
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
        abi: erc20Abi,
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
    return receipt.logs.filter(isFrom(sender));
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
      !isAddressEqual(onRampAddress, zeroAddress),
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
      !isAddressEqual(poolAddress, zeroAddress),
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

    const isOraclePoolSet = !isAddressEqual(oraclePoolAddress, zeroAddress);
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

  // ---------------------------------------------------------------------
  // Slow stake status: the one transaction the user signed, followed across
  // CCIP, the L1 receiver and the bridge back. Three sources, each with its
  // own blind spot: the CCIP API knows transport and execution but not
  // whether the stake inside worked; the receiver on L1 knows that; the
  // L2 knows whether the wstETH arrived
  // ---------------------------------------------------------------------

  public getCcipApiBaseUrl(): string {
    return this.ccipApi.baseUrl;
  }

  public getCcipExplorerMessageUrl(messageId: Hash): string {
    return getCcipExplorerMessageUrl(messageId);
  }

  private getL1PublicClient(): PublicClient {
    invariant(
      this.l1PublicClient,
      'Slow stake status needs an L1 public client',
      ERROR_CODE.NOT_SUPPORTED,
    );
    return this.l1PublicClient;
  }

  // the receiver, from the sender's own routing entry
  @Cache(CACHE_TIME_CONSTANT, ['core.chain.id'])
  public async getL1StakingReceiverAddress(): Promise<Address> {
    const { receiver } = await this.getSlowStakeConfig();
    const [address] = decodeAbiParameters([{ type: 'address' }], receiver);
    return address;
  }

  @Cache(CACHE_TIME_CONSTANT, ['core.chain.id'])
  public async getL1StakingReceiverContract(): Promise<L1StakingReceiverContractType> {
    return getContract({
      address: await this.getL1StakingReceiverAddress(),
      abi: L1_STAKING_RECEIVER_ABI,
      client: this.getL1PublicClient(),
    });
  }

  @Cache(CACHE_TIME_CONSTANT, ['core.chain.id'])
  public async getL1WstethAddress(): Promise<Address> {
    const receiver = await this.getL1StakingReceiverContract();
    return this.lookup('l1', () => receiver.read.WSTETH());
  }

  // The user's sends on this L2 from the CCIP API: the lane's own list,
  // filtered by the account that signed the send. No block range to pick
  // and no log scan, but `origin` is the signer, so a smart account or a
  // Safe is not found here. Oldest first
  public async getSlowStakeSentFromCcipApi(
    props: L2SlowStakeApiLookupProps,
  ): Promise<L2SlowStakeSent[]> {
    const found = await this.findUserMessages(props);
    return found.map(({ sent }) => sent);
  }

  // The user's newest sends from the CCIP API with where each one is, as
  // three stacks (still moving, needing attention, done), newest first in
  // each. Resolved only up to the limit; the messages already fetched are
  // reused, so nothing is read twice
  public async getLatestSlowStakeStatusesFromCcipApi({
    limit,
    ...props
  }: L2SlowStakeApiLookupProps &
    L2SlowStakeLatestProps): Promise<L2SlowStakeLatest> {
    const found = await this.findUserMessages(props);
    const selected =
      limit === undefined ? found : limit > 0 ? found.slice(-limit) : [];
    const statuses = await Promise.all(
      selected.map(({ sent, message }) =>
        this.resolveSlowStakeStatus(sent, message),
      ),
    );
    return {
      ...groupSlowStakeStatuses(statuses.reverse()),
      hasMore: found.length > selected.length,
    };
  }

  private async findUserMessages({
    account,
    pageSize = 100,
    maxPages = 10,
  }: L2SlowStakeApiLookupProps): Promise<
    { sent: L2SlowStakeSent; message: CcipMessage }[]
  > {
    const [sender, config, lane, { WNATIVE }] = await Promise.all([
      this.getL2StakingReceiverContractAddress(),
      this.getSlowStakeConfig(),
      Promise.resolve(this.getSlowStakeLaneConfig()),
      this.getReceiverConstants(),
    ]);
    const summaries = [];
    let cursor: string | undefined;
    for (let page = 0; page < maxPages; page += 1) {
      const list = await this.lookup('ccip-api', () =>
        this.ccipApi.listMessages({
          sender,
          sourceChainSelector: lane.sourceChainSelector,
          destChainSelector: config.destChainSelector,
          limit: pageSize,
          cursor,
        }),
      );
      summaries.push(
        ...list.data.filter((entry) => isAddressEqual(entry.origin, account)),
      );
      if (!list.pagination.hasNextPage || !list.pagination.cursor) break;
      cursor = list.pagination.cursor;
    }
    // the payload (the recipient and the amount) and the send block are on
    // the message itself
    const messages = await Promise.all(
      summaries.map((entry) => this.fetchCcipMessage(entry.messageId)),
    );
    const found = messages.flatMap((message) => {
      if (!message) return [];
      const { recipient, amount } = decodeSlowStakeData(message.data);
      return [
        {
          message,
          sent: {
            messageId: message.messageId,
            user: recipient,
            token: WNATIVE,
            amount,
            sendTxHash: message.sendTransactionHash,
            sendBlockNumber: BigInt(message.sendBlockNumber),
          },
        },
      ];
    });
    // the API lists newest first
    return found.sort((a, b) =>
      a.sent.sendBlockNumber < b.sent.sendBlockNumber ? -1 : 1,
    );
  }

  public async getSlowStakeStatus(
    sent: L2SlowStakeSent,
  ): Promise<L2SlowStakeStatus> {
    return this.resolveSlowStakeStatus(sent);
  }

  // By message id alone, e.g. one the user kept: the send is rebuilt from
  // the API's copy of the message. Null while the API does not list it
  public async getSlowStakeStatusByMessageId(
    messageId: Hash,
  ): Promise<L2SlowStakeStatus | null> {
    const message = await this.fetchCcipMessage(messageId);
    if (!message) return null;
    invariant(
      message.sourceNetworkInfo.chainId === this.core.chain.id,
      `Message ${messageId} was sent from chain ${message.sourceNetworkInfo.chainId}, not ${this.core.chain.id}`,
      ERROR_CODE.NOT_SUPPORTED,
    );
    const { recipient, amount } = decodeSlowStakeData(message.data);
    const { WNATIVE } = await this.getReceiverConstants();
    return this.resolveSlowStakeStatus(
      {
        messageId,
        user: recipient,
        token: WNATIVE,
        amount,
        sendTxHash: message.sendTransactionHash,
        sendBlockNumber: BigInt(message.sendBlockNumber),
      },
      message,
    );
  }

  // The L1 transaction that retries a parked stake: permissionless, sent
  // with an Ethereum wallet, paid by whoever sends it
  public async retryFailedMessagePopulateTx(
    failedMessage: L1FailedMessage,
  ): Promise<{ to: Address; data: `0x${string}` }> {
    return {
      to: await this.getL1StakingReceiverAddress(),
      data: encodeFunctionData({
        abi: L1_STAKING_RECEIVER_ABI,
        functionName: 'retryFailedMessage',
        args: [failedMessage],
      }),
    };
  }

  // One stake, one step at a time, each step read by the key the step
  // before handed over: the CCIP message names the L1 receipt, the
  // receipt's bridge logs name the L2 landing. Reads by hash and by key
  // only; nothing is scanned, since few RPCs serve historic eth_getLogs
  private async resolveSlowStakeStatus(
    sent: L2SlowStakeSent,
    message?: CcipMessage | null,
  ): Promise<L2SlowStakeStatus> {
    const base = {
      ...sent,
      ccipExplorerUrl: getCcipExplorerMessageUrl(sent.messageId),
    };
    const ccip = message ?? (await this.fetchCcipMessage(sent.messageId));
    if (!ccip) {
      return {
        ...base,
        outcome: L2_SLOW_STAKE_OUTCOME.inflight,
        stage: L2_SLOW_STAKE_STAGE.sent,
      };
    }
    if (ccip.status === CCIP_MESSAGE_STATUS.failed) {
      return {
        ...base,
        outcome: L2_SLOW_STAKE_OUTCOME.error,
        stage: L2_SLOW_STAKE_STAGE.transportFailed,
        ccipStatus: ccip.status,
        readyForManualExecution: ccip.readyForManualExecution,
      };
    }
    const l1TxHash = ccip.receiptTransactionHash;
    if (ccip.status !== CCIP_MESSAGE_STATUS.success || !l1TxHash) {
      return {
        ...base,
        outcome: L2_SLOW_STAKE_OUTCOME.inflight,
        stage: L2_SLOW_STAKE_STAGE.inTransit,
        ccipStatus: ccip.status,
      };
    }
    // Executed on Ethereum: CCIP's success is the OffRamp's, not the
    // stake's. The receiver's own verdict is in the same receipt
    const l1 = this.getL1PublicClient();
    const receipt = await this.lookup(
      'l1',
      () => l1.getTransactionReceipt({ hash: l1TxHash }),
      sent.messageId,
    );
    const outcome = await this.readL1Outcome(sent.messageId, receipt);
    if (outcome.kind === 'failed') return this.resolveFailed(base, outcome);
    const returnLeg = await this.readReturnLeg(receipt, outcome.receiverLogs);
    return this.resolveReturnLeg(base, {
      l1TxHash: outcome.l1TxHash,
      l1BlockNumber: outcome.l1BlockNumber,
      stakedAmount: outcome.stakedAmount,
      returnLeg,
    });
  }

  // The receiver's verdict and the amount it staked, from the logs of the
  // L1 execution receipt. The adapters run by delegatecall, so the bridge's
  // own event is emitted from the receiver too
  private async readL1Outcome(
    messageId: Hash,
    receipt: TransactionReceipt,
  ): Promise<L1Outcome> {
    const [receiverAddress, wsteth] = await Promise.all([
      this.getL1StakingReceiverAddress(),
      this.getL1WstethAddress(),
    ]);
    const receiverLogs = parseEventLogs({
      abi: L1_STAKING_RECEIVER_ABI,
      logs: receipt.logs.filter(isFrom(receiverAddress)),
    });
    const verdict = receiverLogs.find(
      (log) =>
        (log.eventName === 'MessageSucceeded' ||
          log.eventName === 'MessageFailed' ||
          log.eventName === 'MessageRecovered') &&
        log.args.messageId === messageId,
    );
    invariant(
      verdict,
      `The receiver reported nothing for message ${messageId} in ${receipt.transactionHash}`,
      ERROR_CODE.READ_ERROR,
    );
    if (verdict.eventName === 'MessageFailed') {
      return {
        kind: 'failed',
        l1TxHash: receipt.transactionHash,
        l1BlockNumber: receipt.blockNumber,
        failedMessage: verdict.args.message,
      };
    }
    const handover = parseEventLogs({
      abi: erc20Abi,
      eventName: 'Transfer',
      logs: receipt.logs.filter(isFrom(wsteth)),
    }).find((log) => isAddressEqual(log.args.from, receiverAddress));
    invariant(
      handover,
      `No wstETH left the receiver for message ${messageId} in ${receipt.transactionHash}`,
      ERROR_CODE.READ_ERROR,
    );
    return {
      kind: 'succeeded',
      l1TxHash: receipt.transactionHash,
      l1BlockNumber: receipt.blockNumber,
      stakedAmount: handover.args.value,
      receiverLogs,
    };
  }

  // A failed stake parks the funds at the receiver until someone retries
  // it, or the DAO recovers them. Both clear the failed-message slot, so a
  // clear slot after a failure means one of the two happened; which one
  // is in the receiver's events, and this flow does not scan for them
  private async resolveFailed(
    base: L2SlowStakeStatusBase,
    outcome: Extract<L1Outcome, { kind: 'failed' }>,
  ): Promise<L2SlowStakeStatus> {
    const receiver = await this.getL1StakingReceiverContract();
    const failedHash = await this.lookup(
      'l1',
      () => receiver.read.getFailedMessageHash([base.messageId]),
      base.messageId,
    );
    const { l1TxHash, l1BlockNumber } = outcome;
    if (failedHash !== zeroHash) {
      return {
        ...base,
        outcome: L2_SLOW_STAKE_OUTCOME.error,
        stage: L2_SLOW_STAKE_STAGE.parked,
        l1TxHash,
        l1BlockNumber,
        failedMessage: outcome.failedMessage,
      };
    }
    return {
      ...base,
      outcome: L2_SLOW_STAKE_OUTCOME.success,
      stage: L2_SLOW_STAKE_STAGE.recovered,
      l1TxHash,
      l1BlockNumber,
    };
  }

  // The key the L1 receipt leaves for the wstETH's way back: the bridge's
  // own log of the send, turned into what the L2 side is read by
  private async readReturnLeg(
    receipt: TransactionReceipt,
    receiverLogs: L1ReceiverLogs,
  ): Promise<L2SlowStakeReturnLeg> {
    const { bridge } = this.getSlowStakeLaneConfig().returnFee;
    const l1TxHash = receipt.transactionHash;
    switch (bridge) {
      case 'op-stack': {
        // the portal logs the deposit; the deposit transaction's hash on
        // the L2 is a function of that log
        const [l2TxHash, ...rest] = getL2TransactionHashes({
          logs: receipt.logs,
        });
        invariant(
          l2TxHash && rest.length === 0,
          `Expected one portal deposit in ${l1TxHash}, found ${rest.length + (l2TxHash ? 1 : 0)}`,
          ERROR_CODE.READ_ERROR,
        );
        return { bridge, l2TxHash };
      }
      case 'arbitrum': {
        // the receiver logs the inbox message number; the inbox and the
        // bridge log every field the ticket id is derived from
        const sentEvent = receiverLogs.find(
          (log) => log.eventName === 'ArbitrumL1toL2MessageSent',
        );
        invariant(
          sentEvent?.eventName === 'ArbitrumL1toL2MessageSent',
          `No Arbitrum message in ${l1TxHash}`,
          ERROR_CODE.READ_ERROR,
        );
        const messageNumber = hexToBigInt(sentEvent.args.messageId);
        const inboxLog = parseEventLogs({
          abi: ARBITRUM_INBOX_ABI,
          eventName: 'InboxMessageDelivered',
          logs: receipt.logs,
        }).find((log) => log.args.messageNum === messageNumber);
        const bridgeLog = parseEventLogs({
          abi: ARBITRUM_BRIDGE_ABI,
          eventName: 'MessageDelivered',
          logs: receipt.logs,
        }).find((log) => log.args.messageIndex === messageNumber);
        invariant(
          inboxLog &&
            bridgeLog &&
            bridgeLog.args.kind === ARBITRUM_L1_MESSAGE_TYPE_SUBMIT_RETRYABLE,
          `No retryable submission ${messageNumber} in ${l1TxHash}`,
          ERROR_CODE.READ_ERROR,
        );
        return {
          bridge,
          ticketId: calculateArbitrumRetryableCreationId({
            l2ChainId: BigInt(this.core.chain.id),
            messageNumber,
            from: bridgeLog.args.sender,
            l1BaseFee: bridgeLog.args.baseFeeL1,
            ...decodeArbitrumSubmitRetryableMessage(inboxLog.args.data),
          }),
        };
      }
      case 'linea': {
        const [sentLog, ...rest] = parseEventLogs({
          abi: LINEA_MESSAGE_SERVICE_ABI,
          eventName: 'MessageSent',
          logs: receipt.logs,
        });
        invariant(
          sentLog && rest.length === 0,
          `Expected one Linea message in ${l1TxHash}, found ${rest.length + (sentLog ? 1 : 0)}`,
          ERROR_CODE.READ_ERROR,
        );
        return { bridge, messageHash: sentLog.args._messageHash };
      }
    }
  }

  // Where the wstETH is on its way back, read from the L2 by the key:
  // landed and credited, landed and failed to credit, or not landed yet
  private async resolveReturnLeg(
    base: L2SlowStakeStatusBase,
    staked: L2SlowStakeStaked,
  ): Promise<L2SlowStakeStatus> {
    const { returnLeg } = staked;
    const bridging: L2SlowStakeStatus = {
      ...base,
      ...staked,
      outcome: L2_SLOW_STAKE_OUTCOME.inflight,
      stage: L2_SLOW_STAKE_STAGE.bridging,
    };
    const relayFailed = (l2TxHash?: Hash): L2SlowStakeStatus => ({
      ...base,
      ...staked,
      outcome: L2_SLOW_STAKE_OUTCOME.error,
      stage: L2_SLOW_STAKE_STAGE.relayFailed,
      l2TxHash,
    });
    const delivered = (l2TxHash?: Hash): L2SlowStakeStatus => ({
      ...base,
      ...staked,
      outcome: L2_SLOW_STAKE_OUTCOME.success,
      stage: L2_SLOW_STAKE_STAGE.delivered,
      l2TxHash,
    });
    switch (returnLeg.bridge) {
      case 'op-stack': {
        // The deposit transaction relays the message through the L2
        // messenger; the messenger says whether the relay went through, a
        // failed one is replayable
        const receipt = await this.getReceiptIfMined('l2', returnLeg.l2TxHash);
        if (!receipt) return bridging;
        if (receipt.status === 'reverted')
          return relayFailed(returnLeg.l2TxHash);
        const relay = parseEventLogs({
          abi: OP_STACK_L2_CROSS_DOMAIN_MESSENGER_ABI,
          logs: receipt.logs.filter(isFrom(OP_STACK_L2_CROSS_DOMAIN_MESSENGER)),
        });
        if (!relay.some((log) => log.eventName === 'RelayedMessage'))
          return relayFailed(returnLeg.l2TxHash);
        await this.assertWstethMinted(receipt, base.user);
        return delivered(returnLeg.l2TxHash);
      }
      case 'arbitrum': {
        // The ticket's creation receipt logs the auto-redeem it scheduled;
        // that retry transaction, when it went through, is the landing. A
        // ticket still alive after that waits for a redeem by hand
        const creation = await this.getReceiptIfMined('l2', returnLeg.ticketId);
        if (!creation) return bridging;
        if (creation.status === 'reverted')
          return relayFailed(returnLeg.ticketId);
        const scheduled = parseEventLogs({
          abi: ARBITRUM_RETRYABLE_TX_ABI,
          eventName: 'RedeemScheduled',
          logs: creation.logs.filter(isFrom(ARBITRUM_RETRYABLE_TX_PRECOMPILE)),
        }).find((log) => log.args.ticketId === returnLeg.ticketId);
        const retry = scheduled
          ? await this.getReceiptIfMined('l2', scheduled.args.retryTxHash)
          : null;
        if (retry?.status === 'success') {
          await this.assertWstethMinted(retry, base.user);
          return delivered(retry.transactionHash);
        }
        if (await this.isRetryableTicketAlive(returnLeg.ticketId))
          return relayFailed(retry?.transactionHash);
        return {
          ...base,
          ...staked,
          outcome: L2_SLOW_STAKE_OUTCOME.error,
          stage: L2_SLOW_STAKE_STAGE.unresolved,
        };
      }
      case 'linea': {
        // the L2 message service tracks the claim by the message hash; the
        // claim transaction itself has no key to be read by
        const status = await this.lookup('l2', () =>
          this.core.publicClient.readContract({
            address: LINEA_L2_MESSAGE_SERVICE,
            abi: LINEA_MESSAGE_SERVICE_ABI,
            functionName: 'inboxL1L2MessageStatus',
            args: [returnLeg.messageHash],
          }),
        );
        return status === LINEA_MESSAGE_STATUS_CLAIMED ? delivered() : bridging;
      }
    }
  }

  // the landing credits the user: the wstETH mint is in the same receipt
  private async assertWstethMinted(
    receipt: TransactionReceipt,
    user: Address,
  ): Promise<void> {
    const wsteth = await this.getL2StakingWstethContractAddress();
    const mint = parseEventLogs({
      abi: erc20Abi,
      eventName: 'Transfer',
      logs: receipt.logs.filter(isFrom(wsteth)),
    }).find(
      (log) =>
        isAddressEqual(log.args.from, zeroAddress) &&
        isAddressEqual(log.args.to, user),
    );
    invariant(
      mint,
      `No wstETH minted to ${user} in ${receipt.transactionHash}`,
      ERROR_CODE.READ_ERROR,
    );
  }

  // null while the transaction is not mined; a transport failure is a
  // lookup failure, not a status
  private async getReceiptIfMined(
    source: L2SlowStakeLookupSource,
    hash: Hash,
  ): Promise<TransactionReceipt | null> {
    const client =
      source === 'l1' ? this.getL1PublicClient() : this.core.publicClient;
    try {
      return await client.getTransactionReceipt({ hash });
    } catch (error) {
      if (error instanceof TransactionReceiptNotFoundError) return null;
      throw new L2SlowStakeLookupError(
        source,
        `Slow stake status read failed (${source})`,
        { cause: error },
      );
    }
  }

  // the precompile answers by ticket id while the ticket exists, and
  // reverts (NoTicketWithID) once it was redeemed or expired
  private async isRetryableTicketAlive(ticketId: Hash): Promise<boolean> {
    try {
      await this.core.publicClient.readContract({
        address: ARBITRUM_RETRYABLE_TX_PRECOMPILE,
        abi: ARBITRUM_RETRYABLE_TX_ABI,
        functionName: 'getTimeout',
        args: [ticketId],
      });
      return true;
    } catch (error) {
      if (
        error instanceof BaseError &&
        error.walk((cause) => cause instanceof ContractFunctionRevertedError)
      )
        return false;
      throw new L2SlowStakeLookupError(
        'l2',
        'Slow stake status read failed (l2)',
        { cause: error },
      );
    }
  }

  private async fetchCcipMessage(messageId: Hash): Promise<CcipMessage | null> {
    return this.lookup(
      'ccip-api',
      () => this.ccipApi.getMessage(messageId),
      messageId,
    );
  }

  // a source that does not answer is a lookup failure, not a stake status
  private async lookup<T>(
    source: L2SlowStakeLookupSource,
    read: () => Promise<T>,
    messageId?: Hash,
  ): Promise<T> {
    try {
      return await read();
    } catch (error) {
      if (error instanceof L2SlowStakeLookupError) throw error;
      throw new L2SlowStakeLookupError(
        source,
        `Slow stake status read failed (${source})`,
        { messageId, cause: error },
      );
    }
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
