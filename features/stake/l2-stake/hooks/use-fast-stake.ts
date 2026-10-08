import { useCallback } from 'react';
import invariant from 'tiny-invariant';

import { config, useConfig } from 'config';
import {
  applyRoundUpTxParameter,
  useDappStatus,
  useLidoSDK,
  useAA,
  useTxFlow,
  useLidoSDKL2,
} from 'modules/web3';

import { useBells } from 'features/stake/stake-form/hooks/use-bells';
import { TOKENS_TO_STAKE } from 'features/stake/shared/types';

import { getReferralAddress } from 'utils/get-referral-address';
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
  const { txModalStages } = useTxModalStagesL2FastStake();
  const txFlow = useTxFlow();
  const { featureFlags } = useConfig().externalConfig;
  const trackStartEth = useTrackStakeEvent('fast_stake_start');
  const trackEndEth = useTrackStakeEvent('fast_stake_end');
  const trackStartWeth = useTrackStakeEvent('fast_stake_weth_start');
  const trackEndWeth = useTrackStakeEvent('fast_stake_weth_end');

  return useCallback(
    async ({ amount, token, referral }: StakeArguments): Promise<boolean> => {
      const isWeth = token === TOKENS_TO_STAKE.WETH;
      const trackStart = isWeth ? trackStartWeth : trackStartEth;
      const trackEnd = isWeth ? trackEndWeth : trackEndEth;
      trackStart();
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

        const minReceiveAmount = await l2Stake.getFastStakeWstethByEth(amount);

        // The receiver pulls WETH, so it needs an allowance first: in the same
        // batch for AA wallets, as a separate transaction otherwise. The
        // allowance is read here rather than taken from the form state, so a
        // retry after a confirmed approval never approves again. The flag tells
        // the stage callbacks which of the chained transactions is reporting
        let needsApprove =
          isWeth &&
          (await l2Stake.getWethAllowanceForFastStake(address)) < amount;

        const stakeCall = await l2Stake.fastStakeEthPopulateTx({
          amount,
          token,
          referral: referralAddress,
          minReceiveAmount,
        });
        await txFlow({
          callsFn: async () => {
            const calls = needsApprove
              ? [
                  await l2Stake.approveWethForFastStakePopulateTx({ amount }),
                  stakeCall,
                ]
              : [stakeCall];
            needsApprove = false;
            return calls;
          },
          sendTransaction: async (txStagesCallback) => {
            if (needsApprove) {
              await l2Stake.approveWethForFastStake({
                amount,
                callback: txStagesCallback,
              });
              needsApprove = false;
            }
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
              (payload as bigint) ?? config.STAKE_GASLIMIT_FALLBACK,
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
            trackEnd();
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
      trackStartEth,
      trackStartWeth,
      address,
      l1Core.publicClient,
      l2.wsteth,
      l2Stake,
      txFlow,
      onConfirm,
      txModalStages,
      isAA,
      featureFlags.holidayDecorEnabled,
      trackEndEth,
      trackEndWeth,
      bells,
      onRetry,
    ],
  );
};
