import { useCallback } from 'react';
import invariant from 'tiny-invariant';
import type { Address, Hash } from 'viem';

import {
  applyRoundUpTxParameter,
  getPrettyChainName,
  useDappStatus,
  useAA,
  useTxFlow,
  useLidoSDKL2,
  StakeLimitError,
  TxSettledError,
  TxFlowInterruptedError,
} from 'modules/web3';
import { QuoteMismatchError } from 'modules/web3/utils/quote-mismatch-error';
import {
  L2StakeModule,
  LIDO_L2_SLOW_STAKE_ETH_GAS_LIMIT_FALLBACK,
  LIDO_L2_SLOW_STAKE_WETH_GAS_LIMIT_FALLBACK,
  type L2SlowStakeFee,
} from 'modules/l2-staking';

import { TOKENS_TO_STAKE } from 'features/stake/shared/types';
import { ErrorMessage } from 'utils/getErrorMessage';
import { formatBalance } from 'utils/formatBalance';

import { useTrackStakeEvent } from '../hooks/use-track-event';
import { useSlowStakeLimits } from './use-slow-stake-limits';
import { useTxModalStagesL2SlowStake } from './use-tx-modal-stages-slow-stake';
import { addPendingSlowStake } from './slow-stake-pending-store';

type StakeArguments = {
  amount: bigint | null;
  token: TOKENS_TO_STAKE;
};

type UseL2SlowStakeArgs = {
  onConfirm?: () => Promise<void> | void;
  onRetry?: () => void;
  // the quote the form is showing for the amount; the send is checked
  // against it
  shownFee: L2SlowStakeFee | undefined;
  refetchFee: () => unknown;
};

// the steps of a stake, the first one only for WETH short of allowance
const STEP = { approve: 'approve', stake: 'stake' } as const;

// what every stage of a stake needs, read once before the first step
type SlowStakeData = {
  amount: bigint;
  address: Address;
  // the lane's WETH, which the stake is recorded under whatever was staked
  wethAddress: Address;
  // The sender pulls WETH, so it needs an allowance first. Read here rather
  // than taken from the form state, so a retry after a confirmed approval
  // never approves again
  needsApprove: boolean;
};

// The slow lane: one L2 transaction that sends the stake to Ethereum over
// CCIP. This hook is only ever reached for an amount the form resolved to
// the slow lane; nothing here routes a fast stake to Ethereum
export const useL2SlowStake = ({
  onConfirm,
  onRetry,
  shownFee,
  refetchFee,
}: UseL2SlowStakeArgs) => {
  const { address, chainId } = useDappStatus();
  const { isAA } = useAA();
  const { l2Stake } = useLidoSDKL2();
  const { refetch: refetchLimits } = useSlowStakeLimits();
  const { txModalStages } = useTxModalStagesL2SlowStake();
  const txFlow = useTxFlow();
  const trackStart = useTrackStakeEvent('slow_stake_start');
  const trackEnd = useTrackStakeEvent('slow_stake_end');

  return useCallback(
    async ({ amount, token }: StakeArguments): Promise<boolean> => {
      const isWeth = token === TOKENS_TO_STAKE.WETH;
      trackStart({ token });

      // The bucket is re-read right before the wallet: the quote does not
      // consult it, and every send on the lane consumes it, so a stake that
      // fit when typed can have stopped fitting. The read is refreshed so the
      // field shows the new cap on retry
      const verifyLimits = async (amount: bigint) => {
        const limits = await l2Stake.fetchSlowStakeLimits();
        const wait = L2StakeModule.calcSlowStakeWaitSeconds(limits, amount);
        if (wait === 0) return;
        void refetchLimits();
        const chainName = getPrettyChainName(chainId);
        throw new StakeLimitError(
          wait === undefined
            ? `The amount exceeds the per-transaction limit on ${chainName} of ${formatBalance(limits.maxAmount ?? 0n).trimmed} ETH`
            : `Staking capacity on ${chainName} is temporarily used up for this amount. Up to ${formatBalance(limits.availableAmount ?? 0n).trimmed} ETH fits right now`,
        );
      };

      // The fee is re-quoted right before the wallet: it moves with L1 gas.
      // The user saw a cost with headroom on top; a live quote within that
      // headroom is signed with its own fresh cap (what the cap does not
      // spend comes back in the same transaction), a quote above it is a
      // changed price and the form shows it again first
      const verifyQuote = async (amount: bigint): Promise<L2SlowStakeFee> => {
        const fee = await l2Stake.fetchSlowStakeFee({
          amount,
          account: address,
        });
        if (shownFee && fee.ccipFee > shownFee.maxFee) {
          void refetchFee();
          throw new QuoteMismatchError();
        }
        return fee;
      };
      // the verified quote, kept for the sign stage and the send
      let fee: L2SlowStakeFee | undefined;
      // the handle of the sent stake, from the receipt
      let messageId: Hash | undefined;
      let sendBlockNumber: bigint | undefined;

      const { isSuccess } = await txFlow<SlowStakeData>({
        prepare: async () => {
          invariant(amount, 'amount is null');
          invariant(address, 'account is not defined');
          return {
            amount,
            address,
            wethAddress: await l2Stake.getWethContractAddress(),
            needsApprove:
              isWeth && (await l2Stake.getWethAllowance(address)) < amount,
          };
        },
        // the approval joins the batch for AA wallets and goes as a separate
        // transaction otherwise. A batch is signed as built, so it carries
        // the verified cap; a stepwise send re-quotes right before the stake
        callsFn: async ({ isAA, data }) => {
          if (isAA) {
            await verifyLimits(data.amount);
            fee = await verifyQuote(data.amount);
          }
          return [
            data.needsApprove && {
              stepId: STEP.approve,
              ...(await l2Stake.approveWethPopulateTx({
                amount: data.amount,
              })),
            },
            {
              stepId: STEP.stake,
              ...(await l2Stake.slowStakePopulateTx({
                amount: data.amount,
                token,
                maxFee: fee?.maxFee ?? 0n,
              })),
            },
          ];
        },
        sendStep: async (step, txStagesCallback, { data }) => {
          if (step.stepId === STEP.approve) {
            await l2Stake.approveWeth({
              amount: data.amount,
              callback: txStagesCallback,
            });
            return;
          }
          await verifyLimits(data.amount);
          fee = await verifyQuote(data.amount);
          await l2Stake.slowStake({
            amount: data.amount,
            token,
            maxFee: fee.maxFee,
            callback: txStagesCallback,
          });
        },
        onSign: async ({ payload, ctx: { stepId, data } }) => {
          if (stepId === STEP.approve) {
            txModalStages.signApproval(data.amount);
            return;
          }
          txModalStages.sign(data.amount, token);
          return applyRoundUpTxParameter(
            (payload as bigint) ??
              (isWeth
                ? LIDO_L2_SLOW_STAKE_WETH_GAS_LIMIT_FALLBACK
                : LIDO_L2_SLOW_STAKE_ETH_GAS_LIMIT_FALLBACK),
          );
        },
        // The id is read from the receipt here, before the success stage,
        // which the SDK reports from inside the same call. An AA batch has
        // no receipt of its own to read: its stake waits for the API
        onConfirmation: async ({ payload, ctx: { stepId } }) => {
          if (stepId !== STEP.stake || !payload) return;
          try {
            messageId = (await l2Stake.decodeSlowStakeEvents(payload))
              .messageId;
            sendBlockNumber = payload.blockNumber;
          } catch (error) {
            console.warn(
              '[slow-stake] message id not found in the receipt',
              error,
            );
          }
        },
        onReceipt: ({ txHashOrCallId, ctx: { stepId, data } }) =>
          stepId === STEP.approve
            ? txModalStages.pendingApproval(data.amount, txHashOrCallId)
            : txModalStages.pending(data.amount, token, txHashOrCallId, isAA),
        onSuccess: async ({ txHash, ctx: { stepId, data } }) => {
          if (stepId !== STEP.stake) return;
          // the stake is known here before the CCIP API lists it: kept for
          // the list of recent stakes to show at once. An AA batch yields
          // no receipt to read the id from, so it waits for the API
          if (messageId) {
            addPendingSlowStake({
              messageId,
              chainId,
              address: data.address,
              token: data.wethAddress,
              amount: data.amount,
              sendTxHash: txHash,
              sendBlockNumber,
            });
          }
          await onConfirm?.();
          txModalStages.success(
            data.amount,
            token,
            getPrettyChainName(chainId),
            txHash,
            messageId,
          );
          trackEnd({ token });
        },
        onMultisigDone: ({ ctx }) => {
          if (ctx.stepId === STEP.stake) txModalStages.successMultisig();
        },
        onFailure: async ({ error, ctx }) => {
          console.warn(error);
          // A failed send may mean the lane moved under the form: refresh
          // what the amount is validated against before any retry
          void refetchLimits();
          void refetchFee();
          // The approval settled but its confirmation read failed, so the
          // SDK never got to the stake. Not a completed stake: keep the
          // amount, refresh the allowance and offer to continue
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

      // sent (or proposed to a multisig): the form resets
      return isSuccess;
    },
    [
      trackStart,
      address,
      chainId,
      l2Stake,
      shownFee,
      refetchFee,
      refetchLimits,
      txFlow,
      onConfirm,
      txModalStages,
      isAA,
      trackEnd,
      onRetry,
    ],
  );
};
