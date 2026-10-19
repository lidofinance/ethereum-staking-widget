import type { Address, Chain, Client, Hex, Transport } from 'viem';

import type { GAS_FEE_MODEL } from './model';
import type { FeeParams } from './params';

export type FeeClient = Client<Transport, Chain | undefined>;

// A representative transaction for chains that price txs individually
export type FeeEstimateTx = {
  account: Address;
  to: Address;
  data: Hex;
  value?: bigint;
};

// The max price for any tx on a chain and its parts
export type MaxFeeData = {
  lastBaseFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  maxFeePerGas: bigint;
};

// Tx-specific parts of the cost, on top of or instead of the max price
export type TxFees = {
  // replaces the chain-wide max price when the chain quotes a tx-specific one
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  // the chain's own gas limit for the tx when it returns one
  gasLimit?: bigint;
  // charged on top of gasLimit * price
  l1Fee: bigint;
};

// Fees to send a tx with when the chain needs its own pricing
export type SendFees = {
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
};

// How the tx will be priced, for the models where that changes the cost
export type MaxFeeOptions = {
  // The wallet prices the tx itself (an EIP-5792 batch) rather than the SDK
  // with the sampled tip; OP-stack quotes the node's suggested tip for those
  isWalletPriced?: boolean;
};

/**
 * One fee model = how a family of chains prices transactions. Every value a
 * model applies comes from `FeeParams`, so a chain or a model is tuned in
 * `params.ts`, not here.
 */
export type FeeModelDefinition = {
  model: GAS_FEE_MODEL;
  // upper-bound price for any tx on the chain
  getMaxFee: (
    client: FeeClient,
    params: FeeParams,
    options: MaxFeeOptions,
  ) => Promise<MaxFeeData>;
  // tx-specific parts; absent when the chain-wide price is the whole story
  getTxFees?: (
    client: FeeClient,
    tx: FeeEstimateTx,
    params: FeeParams,
    chainId: number,
  ) => Promise<TxFees>;
  // fees to send with, replacing the SDK core's; absent keeps the core's
  getSendFees?: (
    client: FeeClient,
    tx: FeeEstimateTx,
    params: FeeParams,
  ) => Promise<SendFees>;
};
