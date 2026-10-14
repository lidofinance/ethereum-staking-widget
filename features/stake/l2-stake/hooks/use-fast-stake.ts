import { useCallback } from 'react';
import invariant from 'tiny-invariant';
import type { Address } from 'viem';

import { useConfig } from 'config';
import {
  applyRoundUpTxParameter,
  useDappStatus,
  useLidoSDK,
  useAA,
  useTxFlow,
  useLidoSDKL2,
  TxSettledError,
  TxFlowInterruptedError,
} from 'modules/web3';
import { QuoteMismatchError } from 'modules/web3/utils/quote-mismatch-error';
import {
  calcFastStakeWstethByEth,
  LIDO_L2_FAST_STAKE_ETH_GAS_LIMIT_FALLBACK,
  LIDO_L2_FAST_STAKE_WETH_GAS_LIMIT_FALLBACK,
} from 'modules/l2-staking';

import { useBells } from 'features/stake/stake-form/hooks/use-bells';
import { TOKENS_TO_STAKE } from 'features/stake/shared/types';

import { getReferralAddress } from 'utils/get-referral-address';
import { ErrorMessage } from 'utils/getErrorMessage';
import { useFastStakeConversion } from './use-conversion';
import { useFastStakeLiquidity } from './use-fast-liquidity';
import { useTxModalStagesL2FastStake } from './use-tx-modal-stages-fast-stake';
import { useTrackStakeEvent } from './use-track-event';

type StakeArguments = {
  amount: bigint | null;
  token: TOKENS_TO_STAKE;
  referral: string | null;
};

type StakeOptions = {
  onConfirm?: () => Promise<void> | void;
  onRetry?: () => void;
};

// the steps of a stake, the first one only for WETH short of allowance
const STEP = { approve: 'approve', stake: 'stake' } as const;

// what every stage of a stake needs, read once before the first step
type FastStakeData = {
  amount: bigint;
  address: Address;
  referralAddress: Address;
  preStakeBalanceWsteth: bigint;
  // The receiver pulls WETH, so it needs an allowance first. Read here rather
  // than taken from the form state, so a retry after a confirmed approval
  // never approves again
  needsApprove: boolean;
};

export const useL2FastStake = ({ onConfirm, onRetry }: StakeOptions) => {
  const { bells } = useBells();
  const { address } = useDappStatus();
  const { isAA } = useAA();
  const { core: l1Core } = useLidoSDK();
  const { l2Stake, l2 } = useLidoSDKL2();
  // the rate the form is showing; the stake is checked against it
  const { data: shownRate, refetch: refetchRate } = useFastStakeConversion();
  const { refetch: refetchLiquidity } = useFastStakeLiquidity();
  const { txModalStages } = useTxModalStagesL2FastStake();
  const txFlow = useTxFlow();
  const { featureFlags } = useConfig().externalConfig;
  const trackStart = useTrackStakeEvent('fast_stake_start');
  const trackEnd = useTrackStakeEvent('fast_stake_end');

  return useCallback(
    async ({ amount, token, referral }: StakeArguments): Promise<boolean> => {
      const isWeth = token === TOKENS_TO_STAKE.WETH;
      trackStart({ token });

      // The rate is re-read right before sending, as the last step before
      // the wallet is reached in both signing paths. `price` is ETH per
      // wstETH, so a higher price or a higher fee means fewer wstETH for the
      // same ETH: only that direction stops the stake. A better rate passes
      // and the floor the user signs for is computed from the fresh read
      const verifyQuote = async (amount: bigint): Promise<bigint> => {
        const rate = await l2Stake.fetchFastStakeRate();
        if (
          shownRate &&
          (rate.price > shownRate.price || rate.feeRate > shownRate.feeRate)
        ) {
          void refetchRate();
          throw new QuoteMismatchError();
        }
        return calcFastStakeWstethByEth(amount, rate.feeRate, rate.price);
      };
      // the verified floor, kept for the sign stage of the modal
      let minReceiveAmount = 0n;

      const { isSuccess } = await txFlow<FastStakeData>({
        prepare: async () => {
          invariant(amount, 'amount is null');
          invariant(address, 'account is not defined');
          return {
            amount,
            address,
            referralAddress: await getReferralAddress(
              referral,
              l1Core.publicClient,
            ),
            preStakeBalanceWsteth: await l2.wsteth.balance(address),
            needsApprove:
              isWeth &&
              (await l2Stake.getWethAllowanceForFastStake(address)) < amount,
          };
        },
        // the approval joins the batch for AA wallets and goes as a separate
        // transaction otherwise. A batch is signed as built, so it carries
        // the verified floor; a stepwise send re-quotes right before the stake
        callsFn: async ({ isAA, data }) => {
          if (isAA) minReceiveAmount = await verifyQuote(data.amount);
          return [
            data.needsApprove && {
              stepId: STEP.approve,
              ...(await l2Stake.approveWethForFastStakePopulateTx({
                amount: data.amount,
              })),
            },
            {
              stepId: STEP.stake,
              ...(await l2Stake.fastStakeEthPopulateTx({
                amount: data.amount,
                token,
                referral: data.referralAddress,
                minReceiveAmount,
              })),
            },
          ];
        },
        sendStep: async (step, txStagesCallback, { data }) => {
          if (step.stepId === STEP.approve) {
            await l2Stake.approveWethForFastStake({
              amount: data.amount,
              callback: txStagesCallback,
            });
            return;
          }
          minReceiveAmount = await verifyQuote(data.amount);
          await l2Stake.fastStakeEth({
            amount: data.amount,
            callback: txStagesCallback,
            referral: data.referralAddress,
            minReceiveAmount,
            token,
          });
        },
        onSign: async ({ payload, ctx: { stepId, data } }) => {
          if (stepId === STEP.approve) {
            txModalStages.signApproval(data.amount);
            return;
          }
          txModalStages.sign(data.amount, token, minReceiveAmount);
          return applyRoundUpTxParameter(
            (payload as bigint) ??
              (isWeth
                ? LIDO_L2_FAST_STAKE_WETH_GAS_LIMIT_FALLBACK
                : LIDO_L2_FAST_STAKE_ETH_GAS_LIMIT_FALLBACK),
          );
        },
        onReceipt: ({ txHashOrCallId, ctx: { stepId, data } }) =>
          stepId === STEP.approve
            ? txModalStages.pendingApproval(data.amount, txHashOrCallId)
            : txModalStages.pending(data.amount, token, txHashOrCallId, isAA),
        onSuccess: async ({ txHash, ctx: { stepId, data } }) => {
          if (stepId !== STEP.stake) return;
          const [, balance] = await Promise.all([
            onConfirm?.(),
            l2.wsteth.balance(data.address),
          ]);
          if (featureFlags.holidayDecorEnabled) {
            bells();
          }
          txModalStages.success(balance, data.preStakeBalanceWsteth, txHash);
          trackEnd({ token });
        },
        onMultisigDone: ({ ctx }) => {
          if (ctx.stepId === STEP.stake) txModalStages.successMultisig();
        },
        onFailure: async ({ error, ctx }) => {
          console.warn(error);
          // A failed stake may mean the pool moved under the form (drained
          // or paused since the last read): refresh the cap the amount is
          // validated against, so the field shows why before any retry
          void refetchLiquidity({ throwOnError: false });
          // The approval settled but its confirmation read failed, so the
          // SDK never got to the stake. Not a completed stake: keep the
          // amount, refresh the allowance and offer to continue. Any other
          // failure after the approval shows as is: a retry reads the
          // allowance and goes straight to the stake
          if (ctx.stepId === STEP.approve && error instanceof TxSettledError) {
            await onConfirm?.();
            txModalStages.failed(
              new TxFlowInterruptedError(
                ErrorMessage.STAKE_WETH_L2_INTERRUPTED,
                error.cause,
              ),
              onRetry,
            );
            return;
          }
          txModalStages.failed(error, onRetry);
        },
      });

      // staked (or proposed to a multisig): the form resets
      return isSuccess;
    },
    [
      trackStart,
      address,
      l1Core.publicClient,
      l2.wsteth,
      l2Stake,
      shownRate,
      refetchRate,
      refetchLiquidity,
      txFlow,
      onConfirm,
      txModalStages,
      isAA,
      featureFlags.holidayDecorEnabled,
      trackEnd,
      bells,
      onRetry,
    ],
  );
};
