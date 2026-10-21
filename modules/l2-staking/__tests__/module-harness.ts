import {
  encodeAbiParameters,
  parseEventLogs,
  type AbiEvent,
  type Address,
  type Hash,
  type Log,
  type PublicClient,
} from 'viem';
import {
  CHAINS,
  LIDO_L2_CONTRACT_ADDRESSES,
} from '@lidofinance/lido-ethereum-sdk/common';
import type { LidoSDKCore } from '@lidofinance/lido-ethereum-sdk/core';

import { L2StakeModule } from '../l2-staking-module';

export const P = 10n ** 18n;
export const FEE = 10n ** 15n; // 0.1%
export const PRICE = 12n * 10n ** 17n; // 1 wstETH = 1.2 ETH
export const LIQUIDITY = 7n * 10n ** 18n + 123_456_789n; // pool wstETH balance

export const ACCOUNT: Address = '0x00000000000000000000000000000000000000aa';
export const REFERRAL: Address = '0x00000000000000000000000000000000000000bb';
export const POOL: Address = '0x00000000000000000000000000000000000000cc';
export const FEED: Address = '0x00000000000000000000000000000000000000dd';
export const WETH: Address = '0x00000000000000000000000000000000000000ee';
export const LINK: Address = '0x00000000000000000000000000000000000000f1';
export const CCIP_ROUTER: Address =
  '0x00000000000000000000000000000000000000f2';
export const CCIP_ONRAMP: Address =
  '0x00000000000000000000000000000000000000f3';
export const CCIP_POOL: Address = '0x00000000000000000000000000000000000000f4';
export const L1_RECEIVER: Address =
  '0x6F357d53d6bE3238180316BA5F8f11467e164588';
export const L1_RECEIVER_BYTES = encodeAbiParameters(
  [{ type: 'address' }],
  [L1_RECEIVER],
);
export const CCIP_FEE_QUOTE = 414_816_763_674_386n; // ~0.000415 ETH
// the outbound bucket of the lane's WETH pool
export const CCIP_BUCKET = {
  tokens: 60n * P,
  lastUpdated: 1_792_070_773,
  isEnabled: true,
  capacity: 90n * P + 75n * 10n ** 16n,
  rate: 25_208_333_333_333_333n,
};
export const TX_HASH: Hash =
  '0x1111111111111111111111111111111111111111111111111111111111111111';
// linea_estimateGas reply: 7 wei base fee, 0x100 tip
export const LINEA_QUOTE = {
  gasLimit: '0x30000',
  baseFeePerGas: '0x7',
  priorityFeePerGas: '0x100',
};

export const l2Addresses = (chainId: CHAINS) => {
  const addresses = LIDO_L2_CONTRACT_ADDRESSES[chainId];
  if (!addresses?.wsteth || !addresses.stakeReceiver)
    throw new Error(`no L2 staking addresses for ${chainId}`);
  return { wsteth: addresses.wsteth, stakeReceiver: addresses.stakeReceiver };
};

export type ReadCall = {
  address: Address;
  functionName: string;
  args?: unknown[];
};

export type LogsRequest = {
  address: Address;
  fromBlock: bigint;
  toBlock: bigint;
  event?: { name: string };
  args?: Record<string, unknown>;
};

export type ChainStub = {
  // replies by function name on top of the defaults
  reads?: Record<string, unknown>;
  // eth_getLogs replies, per request
  logs?: (request: LogsRequest) => unknown[];
  receipts?: Record<string, { blockNumber: bigint; logs: unknown[] }>;
  blockNumber?: bigint;
};

type ModuleOptions = ChainStub & {
  // the Ethereum side, when a test reaches it
  l1?: ChainStub;
  // the CCIP API, as a fetch stand-in
  fetcher?: typeof fetch;
  ccipApiBaseUrl?: string;
  logsBlockRange?: number;
};

// The log and receipt side of a public client stand-in. Like viem, getLogs
// hands back decoded logs: the raw logs the test supplies are decoded with
// the requested event and filtered by its args
export const createLogsClient = ({
  logs,
  receipts = {},
  blockNumber = 100n,
}: Omit<ChainStub, 'reads'>) => ({
  getLogs: vi.fn(async (request: LogsRequest) =>
    parseEventLogs({
      abi: [request.event as AbiEvent],
      args: request.args,
      logs: (logs?.(request) ?? []) as Log[],
    }),
  ),
  getBlockNumber: vi.fn(async () => blockNumber),
  getTransactionReceipt: vi.fn(async ({ hash }: { hash: string }) => {
    const receipt = receipts[hash];
    if (!receipt) throw new Error(`no receipt for ${hash}`);
    return receipt;
  }),
});

// A public client stand-in over a lookup table of reads, logs and receipts
export const createChainClient = ({ reads = {}, ...rest }: ChainStub) => ({
  readContract: vi.fn(async ({ functionName }: ReadCall) => {
    if (!(functionName in reads))
      throw new Error(`unexpected read: ${functionName}`);
    return reads[functionName];
  }),
  ...createLogsClient(rest),
});

// The module only needs `core` for its clients, account and chain: a plain
// stub keeps real viem encoding in the loop while the RPC is a lookup table
export const createModule = (
  chainId: CHAINS = CHAINS.Base,
  {
    reads: readOverrides,
    logs,
    receipts,
    blockNumber,
    l1,
    fetcher,
    ccipApiBaseUrl,
    logsBlockRange,
  }: ModuleOptions = {},
) => {
  const reads: Record<string, unknown> = {
    getOraclePool: POOL,
    getOracle: FEED,
    getFee: FEE,
    getLatestAnswer: PRICE,
    TOKEN: LIDO_L2_CONTRACT_ADDRESSES[chainId]?.wsteth,
    WNATIVE: WETH,
    MIN_PROCESS_MESSAGE_GAS: 200_000,
    LINK_TOKEN: LINK,
    CCIP_ROUTER,
    balanceOf: LIQUIDITY,
    getReceiver: L1_RECEIVER_BYTES,
    getOnRamp: CCIP_ONRAMP,
    getPoolBySourceToken: CCIP_POOL,
    getCurrentOutboundRateLimiterState: CCIP_BUCKET,
    isChainSupported: true,
    isSupportedChain: true,
    paused: false,
    ...readOverrides,
  };
  const publicClient = {
    readContract: vi.fn(async ({ address, functionName }: ReadCall) => {
      // the pool fee and the CCIP quote share a name; tell them apart by
      // the contract asked
      if (functionName === 'getFee' && address === CCIP_ROUTER)
        return readOverrides?.ccipGetFee ?? CCIP_FEE_QUOTE;
      if (!(functionName in reads))
        throw new Error(`unexpected read: ${functionName}`);
      return reads[functionName];
    }),
    estimateContractGas: vi.fn(async () => 120_000n),
    // raw RPC for chain-specific fee quotes (linea_estimateGas)
    request: vi.fn(async () => LINEA_QUOTE),
    ...createLogsClient({ logs, receipts, blockNumber }),
  };
  const l1PublicClient = l1 ? createChainClient(l1) : undefined;
  const walletClient = { writeContract: vi.fn(async () => TX_HASH) };
  const core = {
    chain: { id: chainId },
    chainId,
    logMode: 'none',
    publicClient,
    keyedClient: { public: publicClient, wallet: walletClient },
    useAccount: vi.fn(async (account?: Address) => ({
      address: account ?? ACCOUNT,
      type: 'json-rpc',
    })),
    useWalletClient: vi.fn(() => walletClient),
    // Mirrors the SDK: estimate, then send with the estimated gas, then
    // decode the receipt when asked to
    performTransaction: vi.fn(
      async (props: {
        account: { address: Address };
        getGasLimit: (options: object) => Promise<bigint>;
        sendTransaction: (options: object) => Promise<Hash>;
        decodeResult?: (receipt: unknown) => Promise<unknown>;
      }) => {
        const gas = await props.getGasLimit({ account: props.account });
        const hash = await props.sendTransaction({
          account: props.account,
          gas,
        });
        const receipt = { logs: [] };
        const result = await props.decodeResult?.(receipt).catch(() => {
          return undefined;
        });
        return { hash, receipt, result };
      },
    ),
  };
  const l2Stake = new L2StakeModule({
    core: core as unknown as LidoSDKCore,
    l1PublicClient: l1PublicClient as unknown as PublicClient | undefined,
    fetcher,
    ccipApiBaseUrl,
    logsBlockRange,
  });
  return { l2Stake, core, publicClient, walletClient, l1PublicClient };
};
