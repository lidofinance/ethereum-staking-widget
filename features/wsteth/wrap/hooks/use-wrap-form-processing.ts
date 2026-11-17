import { useCallback } from 'react';
import invariant from 'tiny-invariant';
import type { Address } from 'viem';
import type { PopulatedTransaction } from '@lidofinance/lido-ethereum-sdk/core';

import { config } from 'config';
import { MATOMO_TX_EVENTS_TYPES } from 'consts/matomo';
import {
  applyRoundUpTxParameter,
  isStepSettled,
  useAA,
  useDappStatus,
  useLidoSDK,
  useLidoSDKL2,
  useTxFlow,
  TxSettledError,
  TxFlowInterruptedError,
} from 'modules/web3';

import { MockLimitReachedError } from 'features/stake/stake-form/utils';

import { getReferralAddress } from 'utils/get-referral-address';
import { ErrorMessage } from 'utils/getErrorMessage';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { warnError } from 'utils/warn-error';
import { withFallback } from 'utils/with-fallback';

import type { WrapFormInputType } from '../wrap-form-context';
import { TOKENS_TO_WRAP } from '../../shared/types';
import { useTxModalWrap } from './use-tx-modal-stages-wrap';

type UseWrapFormProcessorArgs = {
  // refreshes the form data and the allowance; never rejects
  onConfirm: () => Promise<void>;
  onRetry?: () => void;
};

// the steps of a wrap, the first one only for stETH on L1 short of allowance
const STEP = { approve: 'approve', wrap: 'wrap' } as const;

// what every stage of a wrap needs, read once before the first step
type WrapData = {
  amount: bigint;
  address: Address;
  referralAddress: Address;
  // the wstETH the modal shows, read at submit time
  willReceive: bigint;
  // The wstETH contract pulls the stETH, so it needs an allowance first.
  // Read here rather than taken from the form state, so a retry after a
  // confirmed approval never approves again
  needsApprove: boolean;
};

// The amount received is not re-checked before sending: the conversion has
// no minimum-out parameter to bind it to, and it is value-neutral (the same
// shares change form at the protocol's own rate), so a rate change after an
// oracle report changes the token count, not what the user holds
export const useWrapFormProcessor = ({
  onConfirm,
  onRetry,
}: UseWrapFormProcessorArgs) => {
  const { address } = useDappStatus();
  const { wrap, wstETH } = useLidoSDK();
  const { isAA } = useAA();
  const { l2, isL2Wrap } = useLidoSDKL2();
  const { txModalStages } = useTxModalWrap();
  const txFlow = useTxFlow();

  return useCallback(
    async ({
      amount,
      token,
      referral,
    }: WrapFormInputType): Promise<boolean> => {
      const isEth = token === TOKENS_TO_WRAP.ETH;

      const { isSuccess } = await txFlow<WrapData>({
        prepare: async () => {
          invariant(amount, 'amount is null');
          invariant(address, 'account is not defined');
          // L2 has one route, stETH → wstETH; the form hides the selector there
          invariant(
            !isL2Wrap || token === TOKENS_TO_WRAP.stETH,
            'L2 wrap takes stETH only',
          );
          if (
            isEth &&
            config.enableQaHelpers &&
            window.localStorage.getItem('mockLimitReached') === 'true'
          ) {
            throw new MockLimitReachedError('Stake limit reached');
          }
          return {
            amount,
            address,
            referralAddress: await getReferralAddress(
              referral,
              wrap.core.publicClient,
            ),
            willReceive: await (isL2Wrap
              ? l2.steth.convertToShares(amount)
              : wrap.convertStethToWsteth(amount)),
            // ETH is staked and wrapped in one call and the L2 wrap burns
            // the caller's own stETH: only an L1 stETH wrap needs one
            needsApprove:
              !isL2Wrap &&
              !isEth &&
              (await wrap.getStethForWrapAllowance(address)) < amount,
          };
        },
        // the approval joins the batch for AA wallets and goes as a separate
        // transaction otherwise
        callsFn: async ({ data }) => {
          const props = { value: data.amount };
          if (isL2Wrap) {
            // stETH → wstETH on L2 is the stETH token's unwrap
            return [
              { stepId: STEP.wrap, ...(await l2.unwrapStethPopulateTx(props)) },
            ];
          }
          if (isEth) {
            return [
              {
                stepId: STEP.wrap,
                ...(await wrap.wrapEthPopulateTx({
                  ...props,
                  referralAddress: data.referralAddress,
                })),
              },
            ];
          }
          return [
            data.needsApprove && {
              stepId: STEP.approve,
              // the SDK types the approval wider than the call it returns
              ...((await wrap.approveStethForWrapPopulateTx(
                props,
              )) as PopulatedTransaction),
            },
            { stepId: STEP.wrap, ...(await wrap.wrapStethPopulateTx(props)) },
          ];
        },
        sendStep: async (step, txStagesCallback, { data }) => {
          const props = { value: data.amount, callback: txStagesCallback };
          if (step.stepId === STEP.approve) {
            trackMatomoEvent(MATOMO_TX_EVENTS_TYPES.wrapApprovalStart);
            await wrap.approveStethForWrap(props);
            return;
          }
          if (isL2Wrap) {
            await l2.unwrapStethToWsteth(props);
            return;
          }
          if (isEth) {
            await wrap.wrapEth({
              ...props,
              referralAddress: data.referralAddress,
            });
            return;
          }
          await wrap.wrapSteth(props);
        },
        onSign: async ({ payload, ctx: { stepId, data } }) => {
          if (stepId === STEP.approve) {
            txModalStages.signApproval(data.amount, token);
            return;
          }
          txModalStages.sign(data.amount, token, data.willReceive);
          if (isEth) {
            return applyRoundUpTxParameter(
              (payload as bigint) ?? config.WRAP_ETH_GASLIMIT_FALLBACK,
            );
          }
        },
        onReceipt: ({ txHashOrCallId, ctx: { stepId, data } }) =>
          stepId === STEP.approve
            ? txModalStages.pendingApproval(data.amount, token, txHashOrCallId)
            : txModalStages.pending(
                data.amount,
                token,
                data.willReceive,
                txHashOrCallId,
                isAA,
              ),
        onSuccess: async ({ txHash, ctx: { stepId, data } }) => {
          if (stepId === STEP.approve) {
            trackMatomoEvent(MATOMO_TX_EVENTS_TYPES.wrapApprovalFinish);
            return;
          }
          const [, balance] = await Promise.all([
            // never rejects: the form refetches are settled inside
            onConfirm(),
            // a failed read must not fail a settled tx: the modal drops the balance
            withFallback(
              isL2Wrap
                ? l2.wsteth.balance(data.address)
                : wstETH.balance(data.address),
              undefined,
              {
                onError: warnError(
                  '[useWrapFormProcessor] post-wrap balance read failed',
                ),
              },
            ),
          ]);
          txModalStages.success(balance, txHash);
        },
        onMultisigDone: ({ ctx }) => {
          if (ctx.stepId === STEP.wrap) txModalStages.successMultisig();
        },
        onFailure: async ({ error, ctx }) => {
          console.warn(error);
          // the allowance changed under the form: refresh it before a retry
          if (isStepSettled(ctx, STEP.approve)) await onConfirm();
          // The approval settled but its confirmation read failed, so the
          // SDK never got to the wrap. Not a completed wrap: keep the amount
          // and offer to continue. Any other failure after the approval
          // shows as is: a retry reads the allowance and goes straight to
          // the wrap
          if (ctx.stepId === STEP.approve && error instanceof TxSettledError) {
            txModalStages.failed(
              new TxFlowInterruptedError(
                ErrorMessage.WRAP_INTERRUPTED,
                error.cause,
              ),
              onRetry,
            );
            return;
          }
          txModalStages.failed(error, onRetry);
        },
      });

      // wrapped (or proposed to a multisig): the form resets
      return isSuccess;
    },
    [
      address,
      isL2Wrap,
      l2,
      wrap,
      wstETH,
      txFlow,
      onConfirm,
      onRetry,
      txModalStages,
      isAA,
    ],
  );
};
