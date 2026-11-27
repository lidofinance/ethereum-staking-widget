import type { QueryClient, QueryKey } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import { erc20Abi, parseEther, type Address } from 'viem';
import { StethAbi } from '@lidofinance/lido-ethereum-sdk/stake';
import type { Config } from 'wagmi';
import { getPublicClient } from 'wagmi/actions';

import { config } from 'config';
import { getTokenAddress } from 'config/networks/token-address';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { TOKENS } from 'consts/tokens';
import {
  composeMaxTxCost,
  estimateMaxFee,
  estimateTxFees,
  hasTxSpecificFees,
  type FeeEstimateTx,
} from 'modules/web3';
import { LIMIT_LEVEL } from 'types';

import { isContractCode } from '../wallet';

// Chain-explicit reads: every read takes its chain, never the wallet's, so
// a form can span every supported chain at once

export const getClient = (wagmiConfig: Config, chainId: number) => {
  const client = getPublicClient(wagmiConfig, { chainId });
  invariant(client, `No public client for chain ${chainId}`);
  return client;
};

export const getTokenAddressOrThrow = (chainId: number, token: string) => {
  const address = getTokenAddress(
    chainId,
    token as Parameters<typeof getTokenAddress>[1],
  );
  invariant(address, `No ${token} on chain ${chainId}`);
  return address;
};

/**
 * A read that outlives the route context polling (gas limits, prices):
 * served from its own cache entry while fresh.
 */
export const cachedRead = <T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  queryFn: () => Promise<T>,
  staleTime = STRATEGY_LAZY.staleTime,
) => queryClient.query({ queryKey, queryFn, staleTime });

export const readTokenBalance = (
  wagmiConfig: Config,
  { token, chainId }: { token: string; chainId: number },
  account: Address,
) => {
  const client = getClient(wagmiConfig, chainId);
  return token === TOKENS.eth
    ? client.getBalance({ address: account })
    : client.readContract({
        address: getTokenAddressOrThrow(chainId, token),
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [account],
      });
};

export type StakeLimitInfo = {
  isStakingPaused: boolean;
  isStakingLimitSet: boolean;
  /** ETH Lido takes right now; 0 while paused or exhausted */
  currentStakeLimit: bigint;
  maxStakeLimit: bigint;
  level: LIMIT_LEVEL;
};

// below a quarter of the max: almost exhausted
const WARN_THRESHOLD_RATIO = 4n;

export const getLimitLevel = (maxLimit: bigint, currentLimit: bigint) => {
  if (currentLimit === 0n) return LIMIT_LEVEL.REACHED;
  if (maxLimit / currentLimit >= WARN_THRESHOLD_RATIO) return LIMIT_LEVEL.WARN;
  return LIMIT_LEVEL.SAFE;
};

// QA helpers: localStorage `getStakeLimitFullInfo` overrides the read, e.g.
// {"currentStakeLimit":"0","maxStakeLimit":"150000"}
const readStakeLimitMock = (): StakeLimitInfo | null => {
  if (!config.enableQaHelpers || typeof window === 'undefined') return null;
  const mock = window.localStorage.getItem('getStakeLimitFullInfo');
  if (!mock) return null;
  try {
    const parsed = JSON.parse(mock);
    const currentStakeLimit = parseEther(String(parsed.currentStakeLimit));
    const maxStakeLimit = parseEther(String(parsed.maxStakeLimit));
    return {
      isStakingPaused: !!parsed.isStakingPaused,
      isStakingLimitSet: parsed.isStakingLimitSet ?? true,
      currentStakeLimit,
      maxStakeLimit,
      level: getLimitLevel(maxStakeLimit, currentStakeLimit),
    };
  } catch (error) {
    console.warn('[stake-v2] stake limit mock is not valid JSON', error);
    return null;
  }
};

/** Lido's stake limit on an L1, with its level */
export const readStakeLimitInfo = async (
  wagmiConfig: Config,
  chainId: number,
): Promise<StakeLimitInfo> => {
  const mock = readStakeLimitMock();
  if (mock) return mock;

  const [isStakingPaused, isStakingLimitSet, currentStakeLimit, maxStakeLimit] =
    await getClient(wagmiConfig, chainId).readContract({
      address: getTokenAddressOrThrow(chainId, TOKENS.steth),
      abi: StethAbi,
      functionName: 'getStakeLimitFullInfo',
    });
  return {
    isStakingPaused,
    isStakingLimitSet,
    currentStakeLimit,
    maxStakeLimit,
    level: getLimitLevel(maxStakeLimit, currentStakeLimit),
  };
};

type ReadMaxTxCostArgs = {
  queryClient: QueryClient;
  wagmiConfig: Config;
  chainId: number;
  gasLimit: bigint;
  /** a representative tx, for chains that price txs individually (L1 fee) */
  tx?: FeeEstimateTx;
  /** an EIP-5792 wallet prices the batch itself */
  isAA: boolean;
};

/**
 * Upper-bound ETH cost of a tx on `chainId`: gas limit times the chain's
 * max price, plus the L1 data fee where the chain charges one. The price
 * shares its cache entry with useMaxGasPrice.
 */
export const readMaxTxCost = async ({
  queryClient,
  wagmiConfig,
  chainId,
  gasLimit,
  tx,
  isAA,
}: ReadMaxTxCostArgs) => {
  const client = getClient(wagmiConfig, chainId);
  const isTxFeesNeeded = !!tx && hasTxSpecificFees(chainId);
  const [{ maxFeePerGas }, txFees] = await Promise.all([
    cachedRead(
      queryClient,
      ['max-gas-price', { chainId, isWalletPriced: isAA }],
      () => estimateMaxFee(client, chainId, { isWalletPriced: isAA }),
    ),
    isTxFeesNeeded && tx
      ? cachedRead(queryClient, ['stake-v2', 'tx-fees', { chainId, tx }], () =>
          estimateTxFees(client, chainId, tx),
        )
      : undefined,
  ]);
  const cost = composeMaxTxCost({
    gasLimit,
    maxGasPrice: maxFeePerGas,
    txFees,
    isTxFeesNeeded,
  });
  invariant(cost !== undefined, `No tx cost on chain ${chainId}`);
  return cost;
};

/** what spending tokenIn needs: its balance, and the ETH balance for gas */
export type SpendBalances = {
  balance: bigint;
  etherBalance: bigint;
};

export const readSpendBalances = async (
  wagmiConfig: Config,
  tokenIn: { token: string; chainId: number },
  account: Address,
): Promise<SpendBalances> => {
  const ethIn = { token: TOKENS.eth, chainId: tokenIn.chainId };
  if (tokenIn.token === TOKENS.eth) {
    const balance = await readTokenBalance(wagmiConfig, ethIn, account);
    return { balance, etherBalance: balance };
  }
  const [balance, etherBalance] = await Promise.all([
    readTokenBalance(wagmiConfig, tokenIn, account),
    readTokenBalance(wagmiConfig, ethIn, account),
  ]);
  return { balance, etherBalance };
};

type ReadIsSmartAccountArgs = {
  queryClient: QueryClient;
  wagmiConfig: Config;
  chainId: number;
  account: Address;
  /** EIP-5792 atomic batches on `chainId` */
  isAA: boolean;
};

/**
 * AA or contract wallet on `chainId`: its gas can be sponsored. Read on the
 * given chain, not the dapp chain: an account can be a contract on one
 * chain and an EOA on another. The code is cached for the session.
 */
export const readIsSmartAccount = async ({
  queryClient,
  wagmiConfig,
  chainId,
  account,
  isAA,
}: ReadIsSmartAccountArgs) => {
  if (isAA) return true;
  const code = await cachedRead(
    queryClient,
    ['stake-v2', 'account-code', { chainId, account }],
    async () =>
      (await getClient(wagmiConfig, chainId).getCode({ address: account })) ??
      null,
    Infinity,
  );
  return isContractCode(code ?? undefined);
};
