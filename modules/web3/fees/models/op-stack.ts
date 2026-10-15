import type { Chain, Client, Transport } from 'viem';
import { estimateMaxPriorityFeePerGas } from 'viem/actions';
import { estimateL1Fee } from 'viem/op-stack';

import { CONTRACT_NAMES } from 'config/networks/networks-map';
import { getContractAddress } from 'config/networks/contract-address';

import { GAS_FEE_MODEL } from '../model';
import { withBufferPercent } from '../params';
import type { FeeClient, FeeEstimateTx, FeeModelDefinition } from '../types';
import { getFeeHistoryMaxFee, withPriorityFeeFloor } from './fee-history';

// GasPriceOracle predeploy, the same address on every OP-stack chain; the
// network config entry is what the RPC proxy allows eth_call to
export const OP_STACK_GAS_PRICE_ORACLE_ADDRESS =
  '0x420000000000000000000000000000000000000F' as const;

/**
 * The L1 data fee is charged on top of gas and is part of neither
 * eth_estimateGas nor the fee history; the oracle quotes it per tx.
 */
export const getOpStackL1Fee = (
  client: FeeClient,
  chainId: number,
  tx: FeeEstimateTx,
): Promise<bigint> =>
  estimateL1Fee(client as Client<Transport, Chain>, {
    account: tx.account,
    to: tx.to,
    data: tx.data,
    value: tx.value,
    gasPriceOracleAddress:
      getContractAddress(chainId, CONTRACT_NAMES.L2GasPriceOracle) ??
      OP_STACK_GAS_PRICE_ORACLE_ADDRESS,
  });

// EIP-1559 execution fee from the fee history plus the buffered L1 data fee
export const opStackFeeModel: FeeModelDefinition = {
  model: GAS_FEE_MODEL.OpStack,
  // op-geth suggests a fixed minimum tip (0.001 gwei) that dwarfs both the
  // base fee and the sampled tip on chains like Optimism. A wallet pricing
  // the tx itself pays it, so the sample is floored at it for those; an
  // SDK-priced tx goes out with the sample and must not be quoted twenty
  // times over. No other chain's suggestion carries such information
  getMaxFee: async (client, params, { isWalletPriced }) => {
    const maxFee = await getFeeHistoryMaxFee(client, params);
    if (!isWalletPriced) return maxFee;
    // a missing suggestion must not block the quote
    const suggested = await estimateMaxPriorityFeePerGas(client).catch(
      () => 0n,
    );
    return withPriorityFeeFloor(maxFee, suggested, params);
  },
  getTxFees: async (client, tx, params, chainId) => ({
    l1Fee: withBufferPercent(
      await getOpStackL1Fee(client, chainId, tx),
      params.l1CostBufferPercent,
    ),
  }),
};
