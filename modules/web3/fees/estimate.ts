import { getGasFeeModel } from './model';
import { FEE_MODELS } from './models';
import { getFeeParams } from './params';
import type {
  FeeClient,
  FeeEstimateTx,
  FeeModelDefinition,
  MaxFeeData,
  MaxFeeOptions,
  SendFees,
  TxFees,
} from './types';

/**
 * Entry points over the fee models. Callers never branch on the chain: the
 * model picked for the chain decides which RPC quotes are taken, and
 * `getFeeParams` which values shape them.
 */

export const getFeeModel = (chainId?: number): FeeModelDefinition =>
  FEE_MODELS[getGasFeeModel(chainId)];

// Whether the chain prices txs individually, so a tx is needed for a full quote
export const hasTxSpecificFees = (chainId?: number): boolean =>
  !!getFeeModel(chainId).getTxFees;

// Upper-bound price for any tx on the chain
export const estimateMaxFee = (
  client: FeeClient,
  chainId: number,
  options: MaxFeeOptions = {},
): Promise<MaxFeeData> =>
  getFeeModel(chainId).getMaxFee(client, getFeeParams(chainId), options);

// Tx-specific parts of the cost. Falls back to none when the chain's quote
// fails, so the UI is never blocked; the fallback is logged
export const estimateTxFees = async (
  client: FeeClient,
  chainId: number,
  tx: FeeEstimateTx,
): Promise<TxFees> => {
  const model = getFeeModel(chainId);
  if (!model.getTxFees) return { l1Fee: 0n };
  try {
    return await model.getTxFees(client, tx, getFeeParams(chainId), chainId);
  } catch (error) {
    console.warn(`[fees::${model.model}] tx fees quote failed`, error);
    return { l1Fee: 0n };
  }
};

// Fees to send a tx with; undefined keeps the SDK core's own pricing
export const estimateSendFees = async (
  client: FeeClient,
  chainId: number,
  tx: FeeEstimateTx,
): Promise<SendFees | undefined> => {
  const model = getFeeModel(chainId);
  if (!model.getSendFees) return undefined;
  try {
    return await model.getSendFees(client, tx, getFeeParams(chainId));
  } catch (error) {
    console.warn(`[fees::${model.model}] send fees quote failed`, error);
    return undefined;
  }
};

type ComposeMaxTxCostArgs = {
  gasLimit?: bigint;
  // the chain-wide max price
  maxGasPrice?: bigint;
  // the tx-specific parts, once quoted
  txFees?: TxFees;
  // whether the chain quotes tx-specific parts for this tx at all
  isTxFeesNeeded: boolean;
};

/**
 * The upper-bound cost of a tx: the larger of the given and the chain's gas
 * limit, times the tx-specific price when there is one and the chain-wide
 * price otherwise, plus the L1 data fee. Undefined while anything needed is
 * missing: an understated cost is worse than a late one.
 */
export const composeMaxTxCost = ({
  gasLimit,
  maxGasPrice,
  txFees,
  isTxFeesNeeded,
}: ComposeMaxTxCostArgs): bigint | undefined => {
  if (gasLimit === undefined) return undefined;
  if (isTxFeesNeeded && !txFees) return undefined;
  const price = txFees?.maxFeePerGas ?? maxGasPrice;
  if (price === undefined) return undefined;
  const chainGasLimit = txFees?.gasLimit;
  const effectiveGasLimit =
    chainGasLimit !== undefined && chainGasLimit > gasLimit
      ? chainGasLimit
      : gasLimit;
  return effectiveGasLimit * price + (txFees?.l1Fee ?? 0n);
};
