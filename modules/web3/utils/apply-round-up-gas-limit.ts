import {
  TransactionCallbackStage,
  type TransactionCallback,
} from '@lidofinance/lido-ethereum-sdk/core';

export const applyRoundUpTxParameter = (number: bigint): bigint =>
  // 94567 -> 94 -> 94000 -> 94999
  // 1709123456 -> 1709123 -> 1709123000 -> 1709123999
  (number / 1_000n) * 1_000n + 999n;

/**
 * A step's stage callback that signs with the gas estimate rounded up, or
 * `fallback` when the SDK has none, unless the callback returned its own.
 * Wrap the callback a stepwise flow's `sendStep` passes to the SDK, so the
 * gas limit belongs to the step and the flow's stage callbacks stay UI only.
 */
export const withRoundUpGasLimit =
  (callback: TransactionCallback, fallback: bigint): TransactionCallback =>
  async (props) => {
    const gasLimit = await callback(props);
    if (
      props.stage !== TransactionCallbackStage.SIGN ||
      typeof gasLimit === 'bigint'
    )
      return gasLimit;
    return applyRoundUpTxParameter(props.payload ?? fallback);
  };
