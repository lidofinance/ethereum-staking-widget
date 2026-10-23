import { base, optimism, linea, arbitrum } from 'wagmi/chains';
import { parseEther, parseGwei, type Address } from 'viem';
import { CHAINS } from 'config/chains';

export const LIDO_L2_STAKING_QUERY_SCOPE = 'L2_STAKING_QUERY_SCOPE';

export const LIDO_L2_STAKING_CHAINS = [base, optimism, linea, arbitrum];

export const LIDO_L2_STAKING_CHAIN_IDS = LIDO_L2_STAKING_CHAINS.map(
  (chain) => chain.id,
) as CHAINS[];

// TODO: recheck (L2 might not be affected) after GLAMSTERDAM fork

// Used only when estimation fails. Sized to the highest measured chain
// (Arbitrum, which includes L1 data cost) with ~10% headroom. Measured 2026-10:
// ETH stake 178k-251k, WETH stake 178k-255k, WETH approve 29k-59k
export const LIDO_L2_FAST_STAKE_ETH_GAS_LIMIT_FALLBACK = 275_000n;
export const LIDO_L2_FAST_STAKE_WETH_GAS_LIMIT_FALLBACK = 285_000n;
export const LIDO_L2_WETH_APPROVE_GAS_LIMIT_FALLBACK = 65_000n;

// The slow stake's L2 gas: wrap or pull, the CCIP send and the refund. Not
// estimated by the form (the send fronts the CCIP fee in value), so these
// stand in for every chain. Sized from the one measured send (261k on
// Optimism, 2026-08) with headroom; re-measure once the lane sees traffic
export const LIDO_L2_SLOW_STAKE_ETH_GAS_LIMIT_FALLBACK = 400_000n;
export const LIDO_L2_SLOW_STAKE_WETH_GAS_LIMIT_FALLBACK = 400_000n;

export const isSupportedLidoL2StakingChain = (chainId: number) => {
  return LIDO_L2_STAKING_CHAIN_IDS.includes(chainId);
};

// Slow stake: one CCIP message per user from the L2 to the shared L1
// receiver, which stakes and hands wstETH to the lane's native bridge back.
// The destination is Ethereum on every lane. A CCIP chain selector is an
// identifier Chainlink assigns, unrelated to the chain id and not derivable
// from it; the source of truth is smartcontractkit/chain-selectors. The
// sender validates it at runtime: getReceiver(selector) must be set
export const CCIP_ETHEREUM_CHAIN_SELECTOR = 5009297550715157269n;

// The CCIP fee is quoted right before the send and checked against the cap
// the user signed at execution, so the cap carries headroom for a price tick
// in between. Whatever is not spent is refunded within the same transaction,
// so the headroom costs nothing
export const LIDO_L2_SLOW_STAKE_MAX_FEE_BUFFER_BPS = 12_000n;
export const BPS_PRECISION = 10_000n;

// The native L1->L2 bridge budget for the wstETH on the way back, encoded by
// the lane's FeeCodec layout. The bytes are frozen into the message: a wrong
// shape passes the L2 checks and strands the stake on L1
export type L2SlowStakeReturnFee =
  | { bridge: 'op-stack'; l2Gas: number }
  | {
      bridge: 'arbitrum';
      maxSubmissionCost: bigint;
      maxGas: number;
      gasPriceBid: bigint;
    }
  | { bridge: 'linea' };

export type L2SlowStakeLaneConfig = {
  // the lane's own CCIP selector, as its OnRamp reports it; the source
  // side of every message it sends
  sourceChainSelector: bigint;
  // L1 gas committed for the receiver's ccipReceive: unwrap, stake, wrap,
  // bridge. Bought, not refunded; under-sizing it parks the stake on L1
  gasLimit: number;
  returnFee: L2SlowStakeReturnFee;
};

// The gas limits are sized from fork measurements of the L1 leg (2026-06:
// Optimism ~685k, Base ~664k, Arbitrum ~329k, Linea ~267k at l2Gas 100k)
// with the repricing hedge and monitoring headroom the protocol's own sync
// path runs. The Arbitrum retryable is priced at a 0.001 ETH submission cost
// and a 0.05 gwei bid; the unused part of that budget is burned, not
// refunded, so it is kept close to what the lane needs
export const LIDO_L2_SLOW_STAKE_LANES: Partial<
  Record<number, L2SlowStakeLaneConfig>
> = {
  [CHAINS.Optimism]: {
    sourceChainSelector: 3734403246176062136n,
    gasLimit: 1_000_000,
    returnFee: { bridge: 'op-stack', l2Gas: 100_000 },
  },
  [CHAINS.Base]: {
    sourceChainSelector: 15971525489660198786n,
    gasLimit: 1_000_000,
    returnFee: { bridge: 'op-stack', l2Gas: 100_000 },
  },
  [CHAINS.Arbitrum]: {
    sourceChainSelector: 4949039107694359620n,
    gasLimit: 1_000_000,
    returnFee: {
      bridge: 'arbitrum',
      maxSubmissionCost: parseEther('0.001'),
      maxGas: 100_000,
      gasPriceBid: parseGwei('0.05'),
    },
  },
  [CHAINS.Linea]: {
    sourceChainSelector: 4627098889531055414n,
    gasLimit: 500_000,
    returnFee: { bridge: 'linea' },
  },
};

// What a slow stake asks of the user: nothing yet, something, nothing any
// more. The stage says where it is within that
export const L2_SLOW_STAKE_OUTCOME = {
  inflight: 'inflight',
  error: 'error',
  success: 'success',
} as const;

// Where a slow stake is, from the one transaction the user signed to the
// wstETH on the L2. The three error stages are ones someone can act on: a
// transport failure is executed by hand on CCIP, a parked stake is retried
// on L1, a failed relay is replayed or redeemed on the L2
export const L2_SLOW_STAKE_STAGE = {
  // the L2 transaction is mined; CCIP has not listed the message yet
  sent: 'sent',
  // listed by CCIP, not executed on Ethereum yet
  inTransit: 'in_transit',
  // staked on Ethereum, the wstETH is on the bridge back and not landed
  bridging: 'bridging',
  // CCIP could not execute it on Ethereum; manual execution may be open
  transportFailed: 'transport_failed',
  // executed, but the stake inside failed: the funds sit at the receiver
  parked: 'parked',
  // the wstETH reached the L2 bridge, but the relay to the user failed
  relayFailed: 'relay_failed',
  // the bridge no longer tracks the return and its landing has no key to
  // read by: redeemed by hand, or expired
  unresolved: 'unresolved',
  // wstETH credited to the user on the L2
  delivered: 'delivered',
  // the parked funds are gone from the receiver: retried, or recovered by
  // the DAO; telling the two apart takes an event scan
  recovered: 'recovered',
} as const;

// Where the wstETH lands on each L2, read by key: the OP-stack messenger
// predeploy, the Arbitrum retryable precompile, the Linea message service
export const OP_STACK_L2_CROSS_DOMAIN_MESSENGER: Address =
  '0x4200000000000000000000000000000000000007';
export const ARBITRUM_RETRYABLE_TX_PRECOMPILE: Address =
  '0x000000000000000000000000000000000000006E';
export const LINEA_L2_MESSAGE_SERVICE: Address =
  '0x508Ca82Df566dCD1B0DE8296e70a96332cD644ec';
// inboxL1L2MessageStatus: 0 unknown, 1 anchored, 2 claimed
export const LINEA_MESSAGE_STATUS_CLAIMED = 2n;
