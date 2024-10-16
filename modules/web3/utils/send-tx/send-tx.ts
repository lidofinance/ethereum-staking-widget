import type {
  JsonRpcBatchProvider,
  Web3Provider,
} from '@ethersproject/providers';
import type { PopulatedTransaction } from 'ethers';
import { applyGasLimitRatio } from 'utils/apply-gas-limit-ratio';

import { getFeeData } from './get-fee-data';
import { estimateGas } from './estimate-gas';
import { applyRoundUpGasLimit } from './apply-round-up-gas-limit';

export type SendTxOptions = {
  tx: PopulatedTransaction;
  isMultisig: boolean;
  walletProvider: Web3Provider;
  staticProvider: JsonRpcBatchProvider;
  shouldApplyGasLimitRatio?: boolean;
  shouldRoundUpGasLimit?: boolean;
};

export const sendTx = async ({
  tx,
  isMultisig,
  staticProvider,
  walletProvider,
  shouldApplyGasLimitRatio = false,
  shouldRoundUpGasLimit = false,
}: SendTxOptions) => {
  if (!isMultisig) {
    const { maxFeePerGas, maxPriorityFeePerGas } =
      await getFeeData(staticProvider);

    tx.maxFeePerGas = maxFeePerGas;
    tx.maxPriorityFeePerGas = maxPriorityFeePerGas;

    const gasLimit = await estimateGas(tx, staticProvider);

    tx.gasLimit = shouldApplyGasLimitRatio
      ? applyGasLimitRatio(gasLimit)
      : gasLimit;

    tx.gasLimit = shouldRoundUpGasLimit
      ? applyRoundUpGasLimit(tx.gasLimit)
      : gasLimit;
  }
  return walletProvider.getSigner().sendUncheckedTransaction(tx);
};
