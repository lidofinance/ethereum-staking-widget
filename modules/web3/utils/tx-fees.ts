import { hexToBigInt, toHex } from 'viem';
import type {
  Address,
  Chain,
  Client,
  GetFeeHistoryReturnType,
  Hex,
  Transport,
} from 'viem';
import { getFeeHistory } from 'viem/actions';
import { estimateL1Fee } from 'viem/op-stack';

import {
  BASE_FEE_MULTIPLIER,
  GAS_FEE_MODEL,
  L1_COST_BUFFER_PERCENT,
  OP_STACK_GAS_PRICE_ORACLE_ADDRESS,
  getGasFeeModel,
} from '../consts/gas-fee-model';

export type FeeClient = Client<Transport, Chain | undefined>;

// A representative transaction for chains that price txs individually
export type FeeEstimateTx = {
  account: Address;
  to: Address;
  data: Hex;
  value?: bigint;
};

export type MaxFeeData = {
  lastBaseFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  maxFeePerGas: bigint;
};

// Chain-specific additions on top of the fee-history price
export type TxFees = {
  // replaces the fee-history price when the chain quotes a tx-specific price
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  // chain's own gas limit for the tx when it returns one
  gasLimit?: bigint;
  // charged on top of gasLimit * price
  l1Fee: bigint;
};

export const FEE_HISTORY_BLOCK_COUNT = 5;
// we look back at fees of the bottom 25% txs
export const FEE_HISTORY_REWARD_PERCENTILES = [25];

const withBufferPercent = (value: bigint, percent: bigint) =>
  (value * (100n + percent)) / 100n;

export const feeHistoryToMaxFee = ({
  reward,
  baseFeePerGas,
}: Pick<GetFeeHistoryReturnType, 'reward' | 'baseFeePerGas'>): MaxFeeData => {
  const maxPriorityFeePerGas =
    reward && reward.length > 0
      ? reward.map((fees) => fees[0] ?? 0n).reduce((sum, fee) => sum + fee) /
        BigInt(reward.length)
      : 0n;
  const lastBaseFeePerGas = baseFeePerGas[0] ?? 0n;

  return {
    lastBaseFeePerGas,
    maxPriorityFeePerGas,
    maxFeePerGas:
      lastBaseFeePerGas * BASE_FEE_MULTIPLIER + maxPriorityFeePerGas,
  };
};

export const getFeeHistoryMaxFee = async (
  client: FeeClient,
): Promise<MaxFeeData> =>
  feeHistoryToMaxFee(
    await getFeeHistory(client, {
      blockCount: FEE_HISTORY_BLOCK_COUNT,
      blockTag: 'pending',
      rewardPercentiles: FEE_HISTORY_REWARD_PERCENTILES,
    }),
  );

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
 * Linea: base fee is fixed and the tip covers the L1 data cost of this very tx.
 * linea_estimateGas is what wallets use, and the price it returns is what the
 * sequencer wants; the fee-history sample is unrelated to it.
 */
export const getLineaTxFees = async (
  client: FeeClient,
  tx: FeeEstimateTx,
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
      lastBaseFeePerGas * BASE_FEE_MULTIPLIER + maxPriorityFeePerGas,
    gasLimit: hexToBigInt(result.gasLimit),
  };
};

/**
 * OP-stack: the L1 data fee is charged on top of gas and is not part of
 * eth_estimateGas or the fee history; the GasPriceOracle quotes it per tx.
 */
export const getOpStackL1Fee = (
  client: FeeClient,
  tx: FeeEstimateTx,
): Promise<bigint> =>
  estimateL1Fee(client as Client<Transport, Chain>, {
    account: tx.account,
    to: tx.to,
    data: tx.data,
    value: tx.value,
    gasPriceOracleAddress: OP_STACK_GAS_PRICE_ORACLE_ADDRESS,
  });

/**
 * Tx-specific fee components for an upper-bound tx cost. Falls back to no
 * additions when the chain-specific call fails, so the UI is never blocked.
 */
export const estimateTxFees = async (
  client: FeeClient,
  chainId: number,
  tx: FeeEstimateTx,
): Promise<TxFees> => {
  switch (getGasFeeModel(chainId)) {
    case GAS_FEE_MODEL.Linea: {
      try {
        const fees = await getLineaTxFees(client, tx);
        const maxPriorityFeePerGas = withBufferPercent(
          fees.maxPriorityFeePerGas,
          L1_COST_BUFFER_PERCENT,
        );
        return {
          maxFeePerGas:
            fees.lastBaseFeePerGas * BASE_FEE_MULTIPLIER + maxPriorityFeePerGas,
          maxPriorityFeePerGas,
          gasLimit: fees.gasLimit,
          l1Fee: 0n,
        };
      } catch (error) {
        console.warn('[tx-fees::linea]', error);
        return { l1Fee: 0n };
      }
    }
    case GAS_FEE_MODEL.OpStack: {
      try {
        const l1Fee = await getOpStackL1Fee(client, tx);
        return { l1Fee: withBufferPercent(l1Fee, L1_COST_BUFFER_PERCENT) };
      } catch (error) {
        console.warn('[tx-fees::op-stack]', error);
        return { l1Fee: 0n };
      }
    }
    default:
      return { l1Fee: 0n };
  }
};

// Chains where the tx itself changes the quoted cost
export const isTxSpecificFeeModel = (chainId?: number) => {
  const model = getGasFeeModel(chainId);
  return model === GAS_FEE_MODEL.Linea || model === GAS_FEE_MODEL.OpStack;
};
