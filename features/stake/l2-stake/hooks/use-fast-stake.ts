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

import { getReferralAddress } from 'utils/get-referral-address';
import { useTxModalStagesL2FastStake } from './use-tx-modal-stages-fast-stake';
import { useTrackStakeEvent } from './use-track-event';

type StakeArguments = {
  amount: bigint | null;
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
  const trackStart = useTrackStakeEvent('fast_stake_start');
  const trackEnd = useTrackStakeEvent('fast_stake_end');

  return useCallback(
    async ({ amount, referral }: StakeArguments): Promise<boolean> => {
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
        const token = 'ETH';

        const stakeCall = await l2Stake.fastStakeEthPopulateTx({
          amount,
          token,
          referral: referralAddress,
          minReceiveAmount,
        });
        await txFlow({
          callsFn: async () => [stakeCall],
          sendTransaction: async (txStagesCallback) => {
            await l2Stake.fastStakeEth({
              amount,
              callback: txStagesCallback,
              referral: referralAddress,
              minReceiveAmount,
              token,
            });
          },
          onSign: async ({ payload }) => {
            txModalStages.sign(amount, minReceiveAmount);
            return applyRoundUpTxParameter(
              (payload as bigint) ?? config.STAKE_GASLIMIT_FALLBACK,
            );
          },
          onReceipt: ({ txHashOrCallId }) => {
            return txModalStages.pending(amount, txHashOrCallId, isAA);
          },
          onSuccess: async ({ txHash }) => {
            const balance = await onStakeTxConfirmed();
            if (featureFlags.holidayDecorEnabled) {
              bells();
            }
            txModalStages.success(balance, preStakeBalanceWsteth, txHash);
            trackEnd();
          },
          onMultisigDone: () => {
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
