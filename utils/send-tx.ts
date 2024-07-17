import type {
  JsonRpcBatchProvider,
  Web3Provider,
} from '@ethersproject/providers';
import type { PopulatedTransaction } from 'ethers';

import { getFeeData } from './getFeeData';
import { estimateGas } from './estimate-gas';
import { applyGasLimitRatio } from 'utils/apply-gas-limit-ratio';

export type SendTxOptions = {
  tx: PopulatedTransaction;
  isMultisig: boolean;
  walletProvider: Web3Provider;
  staticProvider: JsonRpcBatchProvider;
  shouldApplyGasLimitRatio?: boolean;
};

export const sendTx = async ({
  tx,
  isMultisig,
  staticProvider,
  walletProvider,
  shouldApplyGasLimitRatio = false,
}: SendTxOptions) => {
  if (isMultisig)
    return walletProvider.getSigner().sendUncheckedTransaction(tx);

  const { maxFeePerGas, maxPriorityFeePerGas } =
    await getFeeData(staticProvider);

  tx.maxFeePerGas = maxFeePerGas;
  tx.maxPriorityFeePerGas = maxPriorityFeePerGas;

  const gasLimit = await estimateGas(tx, staticProvider);

  tx.gasLimit = shouldApplyGasLimitRatio
    ? applyGasLimitRatio(gasLimit)
    : gasLimit;

  return walletProvider.getSigner().sendTransaction(tx);
};
