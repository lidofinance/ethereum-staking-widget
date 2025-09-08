import {
  TransactionCallback,
  TransactionCallbackStage,
  TransactionCallbackProps as sendTransactionCallbackProps,
} from '@lidofinance/lido-ethereum-sdk/core';
import type {
  Address,
  Hash,
  GetCallsStatusReturnType,
  TransactionReceipt,
} from 'viem';

export type AACall = { to: Address; data?: Hash; value?: bigint };

type CommonCallbackProps = {
  isAA: boolean;
};

export type onSignCallbackProps = {
  stage: TransactionCallbackStage.SIGN;
  payload?: bigint;
};
export type onReceiptCallbackProps = {
  stage: TransactionCallbackStage.RECEIPT;
  payload?: Hash; // txHash in case of legacy sendTransaction
  callId?: string; // callId in case of EIP-5792 sendCalls
  txHashOrCallId?: Hash;
};
export type onSuccessCallbackProps = {
  stage: TransactionCallbackStage.DONE;
  payload?: bigint;
  txHash?: Hash;
};
export type onMultisigDoneCallbackProps = {
  stage: TransactionCallbackStage.MULTISIG_DONE;
};
export type onFailureCallbackProps = {
  stage: TransactionCallbackStage.ERROR;
  payload?: unknown; // defined in SDK and is meant to contain error, but not actually used anywhere
  error?: unknown;
};
export type onPermitCallbackProps = {
  stage: TransactionCallbackStage.PERMIT;
};
export type onGasLimitCallbackProps = {
  stage: TransactionCallbackStage.GAS_LIMIT;
};
export type onConfirmationCallbackProps = {
  stage: TransactionCallbackStage.CONFIRMATION;
  callStatus?: GetCallsStatusReturnType;
  payload?: TransactionReceipt;
};

export type sendCallsCallbackProps =
  | onSignCallbackProps
  | onReceiptCallbackProps
  | onConfirmationCallbackProps
  | onSuccessCallbackProps
  | onFailureCallbackProps;

export type TxCallbackProps =
  | sendTransactionCallbackProps
  | sendCallsCallbackProps;

export type StageCallback<TArgs, TReturn = void> = (
  args: TArgs & CommonCallbackProps,
) => Promise<TReturn> | TReturn;

/**
 * Callbacks for different stages of the transaction flow.
 *
 * @property onSign - Callback for SIGN stage (user signing).
 * @property onPermit - Callback for PERMIT stage.
 * @property onGasLimit - Callback for GAS_LIMIT stage.
 * @property onReceipt - Callback for RECEIPT stage (included in block).
 * @property onConfirmation - Callback for CONFIRMATION stage (network confirmed).
 * @property onSuccess - Callback for DONE stage (transaction successful).
 * @property onMultisigDone - Callback for MULTISIG_DONE stage (multisig successful).
 * @property onFailure - Callback for ERROR stage (transaction failed).
 */
export type StageCallbacks = {
  onSign?: StageCallback<onSignCallbackProps, bigint | void>;
  onPermit?: StageCallback<onPermitCallbackProps>;
  onGasLimit?: StageCallback<onGasLimitCallbackProps>;
  onReceipt?: StageCallback<onReceiptCallbackProps>;
  onConfirmation?: StageCallback<onConfirmationCallbackProps>;
  onSuccess?: StageCallback<onSuccessCallbackProps>;
  onMultisigDone?: StageCallback<onMultisigDoneCallbackProps>;
  onFailure?: StageCallback<onFailureCallbackProps>;
};

/**
 * Arguments for the transaction flow function returned by {@link useTxFlow}.
 * See callbacks for different stages of the transaction flow in {@link StageCallbacks}.
 *
 * @property callsFn - A function returning a list of calls for EIP-5792 sendCalls. Gets called only in case of EIP-5792.
 * @property sendTransaction - Fallback function to send a transaction if EIP-5792 is not supported.
 */
export type TxFlowArgs = {
  callsFn?: () => Promise<(AACall | null | undefined | false)[]>;
  sendTransaction: (txStagesCallback: TransactionCallback) => Promise<void>;
} & StageCallbacks;
