import { useCallback } from 'react';
import invariant from 'tiny-invariant';
import { encodeFunctionData, type Address } from 'viem';
import { StethAbi } from '@lidofinance/lido-ethereum-sdk/stake';

import { config, useConfig } from 'config';
import {
  applyRoundUpTxParameter,
  useDappStatus,
  useLidoSDK,
  useAA,
  useTxFlow,
  isStepSent,
  isStepSettled,
  TxSettledError,
  TxFlowInterruptedError,
} from 'modules/web3';

import { MATOMO_TX_EVENTS_TYPES } from 'consts/matomo';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { ErrorMessage } from 'utils/getErrorMessage';
import { getReferralAddress } from 'utils/get-referral-address';
import { TOKENS_TO_STAKE } from 'features/stake/shared/types';

import { MockLimitReachedError } from './utils';
import { useTxModalStagesStake } from './hooks/use-tx-modal-stages-stake';
import { useBells } from './hooks/use-bells';
import { useWethUnwrap } from './hooks/use-weth-unwrap';

type StakeArguments = {
  amount: bigint | null;
  token: TOKENS_TO_STAKE;
  referral: string | null;
};

type StakeOptions = {
  onConfirm?: () => Promise<void> | void;
  onRetry?: () => void;
  // the WETH was unwrapped but the stake did not go through
  onUnwrapped?: () => void;
};

// the steps of a stake, the first one only for WETH
const STEP = { unwrap: 'unwrap', stake: 'stake' } as const;

// what every stage of a stake needs, read once before the first step
type StakeData = {
  amount: bigint;
  address: Address;
  referralAddress: Address;
  preStakeBalance: bigint;
};

export const useStake = ({ onConfirm, onRetry, onUnwrapped }: StakeOptions) => {
  const { bells } = useBells();
  const { address } = useDappStatus();
  const { isAA } = useAA();
  const { stake, stETH } = useLidoSDK();
  const { unwrap, unwrapPopulateTx } = useWethUnwrap();
  const { txModalStages } = useTxModalStagesStake();
  const txFlow = useTxFlow();
  const { featureFlags } = useConfig().externalConfig;

  return useCallback(
    async ({ amount, token, referral }: StakeArguments): Promise<boolean> => {
      const isWeth = token === TOKENS_TO_STAKE.WETH;
      trackMatomoEvent(MATOMO_TX_EVENTS_TYPES.stakingStart, { token });

      const { isSuccess } = await txFlow<StakeData>({
        prepare: async () => {
          invariant(amount, 'amount is null');
          invariant(address, 'account is not defined');
          if (
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
              stake.core.publicClient,
            ),
            preStakeBalance: await stETH.balance(address),
          };
        },
        // Lido takes ETH only, so WETH is unwrapped first: in the same batch
        // for AA wallets, as a separate transaction otherwise. The stake call
        // is built without a gas estimate: for a WETH stake the ETH only
        // exists after the unwrap, so estimating `submit` with the full value
        // up front fails for anyone whose ETH balance is below the amount.
        // The wallet estimates the AA batch as a whole, and the SDK estimates
        // the legacy transaction once the unwrap has landed
        callsFn: async ({ data }) => [
          isWeth && { stepId: STEP.unwrap, ...unwrapPopulateTx(data.amount) },
          {
            stepId: STEP.stake,
            to: await stETH.contractAddress(),
            data: encodeFunctionData({
              abi: StethAbi,
              functionName: 'submit',
              args: [data.referralAddress],
            }),
            value: data.amount,
          },
        ],
        sendStep: async (step, txStagesCallback, { data }) => {
          if (step.stepId === STEP.unwrap) {
            await unwrap({ amount: data.amount, callback: txStagesCallback });
            return;
          }
          await stake.stakeEth({
            value: data.amount,
            callback: txStagesCallback,
            referralAddress: data.referralAddress,
          });
        },
        onSign: async ({ payload, ctx: { stepId, data } }) => {
          if (stepId === STEP.unwrap) {
            txModalStages.signUnwrap(data.amount);
            return;
          }
          // the stake itself is in ETH, even for a WETH stake
          txModalStages.sign(data.amount, 'ETH');
          return applyRoundUpTxParameter(
            (payload as bigint) ?? config.STAKE_GASLIMIT_FALLBACK,
          );
        },
        onReceipt: ({ txHashOrCallId, ctx: { stepId, data } }) =>
          stepId === STEP.unwrap
            ? txModalStages.pendingUnwrap(data.amount, txHashOrCallId)
            : txModalStages.pending(data.amount, 'ETH', txHashOrCallId, isAA),
        onSuccess: async ({ txHash, ctx: { stepId, data } }) => {
          if (stepId !== STEP.stake) return;
          const [, balance] = await Promise.all([
            onConfirm?.(),
            stETH.balance(data.address),
          ]);
          if (featureFlags.holidayDecorEnabled) {
            bells();
          }
          txModalStages.success(balance, data.preStakeBalance, txHash);
          trackMatomoEvent(MATOMO_TX_EVENTS_TYPES.stakingFinish, { token });
        },
        onMultisigDone: ({ ctx }) => {
          if (ctx.stepId === STEP.stake) txModalStages.successMultisig();
        },
        onFailure: async ({ error, ctx }) => {
          console.warn(error);
          // Once a separate unwrap has landed the funds are ETH: the form
          // switches token and refreshes balances, and a retry stakes ETH
          if (isStepSettled(ctx, STEP.unwrap)) {
            onUnwrapped?.();
            await onConfirm?.();
          }
          // The unwrap landed but the stake was never sent (its estimate or
          // signature failed, or the unwrap's follow-up read did). Whatever
          // the reason, the user must learn that the funds are safe and are
          // ETH now, which the bare error would not say (unlike the L2
          // approve-then-stake chain, where a retry just finds the
          // allowance in place)
          const isInterruptedAfterUnwrap =
            isStepSettled(ctx, STEP.unwrap) && !isStepSent(ctx, STEP.stake);
          txModalStages.failed(
            isInterruptedAfterUnwrap
              ? new TxFlowInterruptedError(
                  ErrorMessage.STAKE_WETH_INTERRUPTED,
                  error instanceof TxSettledError ? error.cause : error,
                )
              : error,
            onRetry,
          );
        },
      });

      // staked (or proposed to a multisig): the form resets
      return isSuccess;
    },
    [
      address,
      stake,
      txFlow,
      onConfirm,
      onUnwrapped,
      stETH,
      unwrap,
      unwrapPopulateTx,
      txModalStages,
      isAA,
      featureFlags.holidayDecorEnabled,
      bells,
      onRetry,
    ],
  );
};
