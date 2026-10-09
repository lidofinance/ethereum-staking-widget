import { useCallback } from 'react';
import invariant from 'tiny-invariant';

import { useConfig } from 'config';
import {
  applyRoundUpTxParameter,
  useDappStatus,
  useLidoSDK,
  useAA,
  useTxFlow,
  useLidoSDKL2,
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
import { useFastStakeConversion } from './use-conversion';
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

export const useL2FastStake = ({ onConfirm, onRetry }: StakeOptions) => {
  const { bells } = useBells();
  const { address } = useDappStatus();
  const { isAA } = useAA();
  const { core: l1Core } = useLidoSDK();
  const { l2Stake, l2 } = useLidoSDKL2();
  // the rate the form is showing; the stake is checked against it
  const { data: shownRate, refetch: refetchRate } = useFastStakeConversion();
  const { txModalStages } = useTxModalStagesL2FastStake();
  const txFlow = useTxFlow();
  const { featureFlags } = useConfig().externalConfig;
  const trackStart = useTrackStakeEvent('fast_stake_start');
  const trackEnd = useTrackStakeEvent('fast_stake_end');

  return useCallback(
    async ({ amount, token, referral }: StakeArguments): Promise<boolean> => {
      const isWeth = token === TOKENS_TO_STAKE.WETH;
      trackStart({ token });
      try {
        invariant(amount, 'amount is null');
        invariant(address, 'account is not defined');

        const referralAddress = await getReferralAddress(
          referral,
          l1Core.publicClient,
        );
        const preStakeBalanceWsteth = await l2.wsteth.balance(address);

        const onStakeTxConfirmed = async () => {
          const [, balance] = await Promise.all([
            onConfirm?.(),
            l2.wsteth.balance(address),
          ]);
          return balance;
        };

        // The rate is re-read right before sending, as the last step before
        // the wallet is reached in both signing paths. `price` is ETH per
        // wstETH, so a higher price or a higher fee means fewer wstETH for the
        // same ETH: only that direction stops the stake. A better rate passes
        // and the floor the user signs for is computed from the fresh read
        const verifyQuote = async (): Promise<bigint> => {
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

        const populateStakeCall = (minReceiveAmount: bigint) =>
          l2Stake.fastStakeEthPopulateTx({
            amount,
            token,
            referral: referralAddress,
            minReceiveAmount,
          });

        // The receiver pulls WETH, so it needs an allowance first: in the same
        // batch for AA wallets, as a separate transaction otherwise. The
        // allowance is read here rather than taken from the form state, so a
        // retry after a confirmed approval never approves again. The flag tells
        // the stage callbacks which of the chained transactions is reporting
        let needsApprove =
          isWeth &&
          (await l2Stake.getWethAllowanceForFastStake(address)) < amount;

        await txFlow({
          callsFn: async () => {
            const approveCall = needsApprove
              ? await l2Stake.approveWethForFastStakePopulateTx({ amount })
              : null;
            minReceiveAmount = await verifyQuote();
            const stakeCall = await populateStakeCall(minReceiveAmount);
            needsApprove = false;
            return approveCall ? [approveCall, stakeCall] : [stakeCall];
          },
          sendTransaction: async (txStagesCallback) => {
            if (needsApprove) {
              await l2Stake.approveWethForFastStake({
                amount,
                callback: txStagesCallback,
              });
              needsApprove = false;
            }
            minReceiveAmount = await verifyQuote();
            await l2Stake.fastStakeEth({
              amount,
              callback: txStagesCallback,
              referral: referralAddress,
              minReceiveAmount,
              token,
            });
          },
          onSign: async ({ payload }) => {
            if (needsApprove) {
              txModalStages.signApproval(amount);
              return;
            }
            txModalStages.sign(amount, token, minReceiveAmount);
            return applyRoundUpTxParameter(
              (payload as bigint) ??
                (isWeth
                  ? LIDO_L2_FAST_STAKE_WETH_GAS_LIMIT_FALLBACK
                  : LIDO_L2_FAST_STAKE_ETH_GAS_LIMIT_FALLBACK),
            );
          },
          onReceipt: ({ txHashOrCallId }) => {
            if (needsApprove) {
              return txModalStages.pendingApproval(amount, txHashOrCallId);
            }
            return txModalStages.pending(amount, token, txHashOrCallId, isAA);
          },
          onSuccess: async ({ txHash }) => {
            if (needsApprove) return;
            const balance = await onStakeTxConfirmed();
            if (featureFlags.holidayDecorEnabled) {
              bells();
            }
            txModalStages.success(balance, preStakeBalanceWsteth, txHash);
            trackEnd({ token });
          },
          onFailure: ({ error }) => txModalStages.failed(error, onRetry),
          onMultisigDone: () => {
            if (needsApprove) return;
            txModalStages.successMultisig();
          },
        });

        return true;
      } catch (error) {
        console.warn(error);
        txModalStages.failed(error, onRetry);
        return false;
      }
    },
    [
      trackStart,
      address,
      l1Core.publicClient,
      l2.wsteth,
      l2Stake,
      shownRate,
      refetchRate,
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
