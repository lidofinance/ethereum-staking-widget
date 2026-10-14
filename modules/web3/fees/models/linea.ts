import { hexToBigInt, toHex } from 'viem';
import type { Hex } from 'viem';

import { GAS_FEE_MODEL } from '../model';
import { withBufferPercent, type FeeParams } from '../params';
import type {
  FeeClient,
  FeeEstimateTx,
  FeeModelDefinition,
  MaxFeeData,
} from '../types';
import { getFeeHistoryMaxFee } from './fee-history';

type LineaEstimateGasResult = {
  gasLimit: Hex;
  baseFeePerGas: Hex;
  priorityFeePerGas: Hex;
};

type RawRequest = (args: {
  method: string;
  params: unknown[];
}) => Promise<unknown>;

/**
 * Linea's own quote for a tx: fixed base fee, a tip covering the L1 data cost
 * of this very tx, and a gas limit. It is what wallets use and what the
 * sequencer wants; the fee-history sample is unrelated to it.
 */
export const getLineaQuote = async (
  client: FeeClient,
  tx: FeeEstimateTx,
  params: FeeParams,
): Promise<MaxFeeData & { gasLimit: bigint }> => {
  const result = (await (client.request as unknown as RawRequest)({
    method: 'linea_estimateGas',
    params: [
      {
        from: tx.account,
        to: tx.to,
        data: tx.data,
        value: toHex(tx.value ?? 0n),
      },
    ],
  })) as LineaEstimateGasResult;

  const lastBaseFeePerGas = hexToBigInt(result.baseFeePerGas);
  const maxPriorityFeePerGas = hexToBigInt(result.priorityFeePerGas);

  return {
    lastBaseFeePerGas,
    maxPriorityFeePerGas,
    maxFeePerGas:
      lastBaseFeePerGas * params.baseFeeMultiplier + maxPriorityFeePerGas,
    gasLimit: hexToBigInt(result.gasLimit),
  };
};

export const lineaFeeModel: FeeModelDefinition = {
  model: GAS_FEE_MODEL.Linea,
  // without a tx there is nothing better than the fee history
  getMaxFee: getFeeHistoryMaxFee,
  // the quote replaces the chain-wide price; its tip is buffered since it
  // follows the L1 base fee, and its gas limit is taken when larger
  getTxFees: async (client, tx, params) => {
    const quote = await getLineaQuote(client, tx, params);
    const maxPriorityFeePerGas = withBufferPercent(
      quote.maxPriorityFeePerGas,
      params.l1CostBufferPercent,
    );
    return {
      maxFeePerGas:
        quote.lastBaseFeePerGas * params.baseFeeMultiplier +
        maxPriorityFeePerGas,
      maxPriorityFeePerGas,
      gasLimit: quote.gasLimit,
      l1Fee: 0n,
    };
  },
  // The SDK core prices every tx from the fee-history sample; on Linea that
  // sample is noise and the whole tip offered gets charged, so a tx is sent
  // with the exact quote, as wallets do
  getSendFees: async (client, tx, params) => {
    const { maxFeePerGas, maxPriorityFeePerGas } = await getLineaQuote(
      client,
      tx,
      params,
    );
    return { maxFeePerGas, maxPriorityFeePerGas };
  },
};
