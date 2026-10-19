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

// A call of a stepwise flow: the AA batch entry plus the id the stage
// callbacks and the legacy sender recognise it by
export type TxStep = AACall & { stepId: string };
export type TxCall = AACall & { stepId?: string };

// How far a step got; an AA batch moves every step together
export type TxStepStatus =
  | 'pending'
  | 'sent' // reached the chain: got a tx hash or a call id
  | 'settled' // receipt in, status success
  | 'done' // the SDK reported DONE
  | 'proposed'; // handed to a multisig, no receipt will follow

/**
 * The state of the flow, passed to every callback and returned at the end.
 * It is the source of truth for "which transaction is this": no flow needs
 * its own flags to tell an unwrap from the stake that follows it.
 */
export type TxFlowContext<TData = undefined> = {
  // the step reporting; an AA batch reports as its last step
  stepId?: string;
  // every call of the flow, in order; empty for legacy single-send flows
  calls: TxCall[];
  status: Record<string, TxStepStatus>;
  isAA: boolean;
  // what `prepare` computed, available to every later stage
  data: TData;
};

/**
 * What a flow resolves with: the context, and the flags the caller acts on.
 * A stepwise flow is a success when its last step landed; a legacy flow
 * whenever it resolves (its pre-settlement failures reject instead).
 */
export type TxFlowResult<TData = undefined> = {
  ctx: TxFlowContext<TData>;
  // the flow's last step settled or was proposed to a multisig: the action
  // happened, even if a follow-up read failed afterwards
  isSuccess: boolean;
  // an earlier step landed but the last one was never sent: the funds moved
  // without the action happening, a retry continues from there
  isInterrupted: boolean;
  // nothing happened: the address failed validation or the flow went stale
  isAborted: boolean;
  // the failure reported to onFailure, if any
  error?: unknown;
};

type CommonCallbackProps<TData> = {
  isAA: boolean;
  ctx: TxFlowContext<TData>;
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
  sendTransactionCallbackProps | sendCallsCallbackProps;

export type StageCallback<TArgs, TReturn = void, TData = undefined> = (
  args: TArgs & CommonCallbackProps<TData>,
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
export type StageCallbacks<TData = undefined> = {
  onSign?: StageCallback<onSignCallbackProps, bigint | void, TData>;
  onPermit?: StageCallback<onPermitCallbackProps, void, TData>;
  onGasLimit?: StageCallback<onGasLimitCallbackProps, void, TData>;
  onReceipt?: StageCallback<onReceiptCallbackProps, void, TData>;
  onConfirmation?: StageCallback<onConfirmationCallbackProps, void, TData>;
  onSuccess?: StageCallback<onSuccessCallbackProps, void, TData>;
  onMultisigDone?: StageCallback<onMultisigDoneCallbackProps, void, TData>;
  // `prepare` may be what failed, so the data may be missing here
  onFailure?: StageCallback<onFailureCallbackProps, void, TData | undefined>;
};

type CallsFn<TCall, TData> = (
  ctx: TxFlowContext<TData>,
) => Promise<(TCall | null | undefined | false)[]>;

/**
 * Legacy flow: one `sendTransaction` that drives every transaction itself.
 * `callsFn` is only used for an EIP-5792 batch.
 *
 * @property callsFn - A function returning a list of calls for EIP-5792 sendCalls. Gets called only in case of EIP-5792.
 * @property sendTransaction - Fallback function to send a transaction if EIP-5792 is not supported.
 */
export type LegacyTxFlowArgs = StageCallbacks & {
  callsFn?: CallsFn<AACall, undefined>;
  sendTransaction: (txStagesCallback: TransactionCallback) => Promise<void>;
  prepare?: never;
  sendStep?: never;
};

/**
 * Stepwise flow: `callsFn` is the source of truth. Every call carries a
 * `stepId`; an EIP-5792 wallet signs them as one batch, a legacy wallet gets
 * them one by one through `sendStep`, which sends the given step with the
 * SDK. `prepare` runs first and its result is `ctx.data` for every later
 * stage, so reads and checks the flow needs happen inside it. Every failure,
 * in `prepare` or before or after settlement, is reported to `onFailure` with
 * the context, and the flow resolves with the final context; a stale flow
 * resolves to undefined without reporting, its UI is gone.
 *
 * @property prepare - Computes the data every stage needs; its failures are reported like any other.
 * @property callsFn - Builds the ordered steps; `ctx.isAA` tells whether they will be signed as a batch.
 * @property sendStep - Sends one step with the SDK when there is no EIP-5792 support.
 */
export type StepTxFlowArgs<TData = undefined> = StageCallbacks<TData> & {
  prepare?: (ctx: TxFlowContext<undefined>) => Promise<TData>;
  callsFn: CallsFn<TxStep, TData>;
  sendStep: (
    step: TxStep,
    txStagesCallback: TransactionCallback,
    ctx: TxFlowContext<TData>,
  ) => Promise<void>;
  sendTransaction?: never;
};

/**
 * Arguments for the transaction flow function returned by {@link useTxFlow}.
 * See callbacks for different stages of the transaction flow in {@link StageCallbacks}.
 */
export type TxFlowArgs<TData = undefined> =
  LegacyTxFlowArgs | StepTxFlowArgs<TData>;

export type TxFlowDeps = {
  isAA: boolean;
  address?: Address;
  validateAddress: (address?: Address) => Promise<boolean>;
  sendAACalls: (
    calls: (AACall | null | undefined | false)[],
    callback: (props: TxCallbackProps) => Promise<void>,
  ) => Promise<unknown>;
  // False once the owning UI unmounted or a newer flow started; a stale flow
  // must neither reach the wallet nor report stages
  isCurrent: () => boolean;
  // Memoized txHash shared across stages (and across flows by the hook)
  txHash: { current: Hash | undefined };
};
