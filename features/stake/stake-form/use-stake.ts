import { getAddress as getAddressViem } from 'viem';
import { useCallback } from 'react';
import invariant from 'tiny-invariant';

import { config } from 'config';
import {
  applyRoundUpGasLimit,
  useDappStatus,
  useLidoSDK,
  useAA,
  useTxFlow,
} from 'modules/web3';

import { MATOMO_TX_EVENTS_TYPES } from 'consts/matomo';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { getReferralAddress } from 'utils/get-referral-address';

import { MockLimitReachedError } from './utils';
import { useTxModalStagesStake } from './hooks/use-tx-modal-stages-stake';

type StakeArguments = {
  amount: bigint | null;
  referral: string | null;
};

type StakeOptions = {
  onConfirm?: () => Promise<void> | void;
  onRetry?: () => void;
};

export const useStake = ({ onConfirm, onRetry }: StakeOptions) => {
  const { address } = useDappStatus();
  const { isAA } = useAA();
  const { stake, stETH } = useLidoSDK();
  const { txModalStages } = useTxModalStagesStake();
  const txFlow = useTxFlow();

  return useCallback(
    async ({ amount, referral }: StakeArguments): Promise<boolean> => {
      trackMatomoEvent(MATOMO_TX_EVENTS_TYPES.stakingStart);
      try {
        invariant(amount, 'amount is null');
        invariant(address, 'account is not defined');

        if (
          config.enableQaHelpers &&
          window.localStorage.getItem('mockLimitReached') === 'true'
        ) {
          throw new MockLimitReachedError('Stake limit reached');
        }

        const referralAddress = await getReferralAddress(
          referral,
          stake.core.rpcProvider,
          config.STAKE_FALLBACK_REFERRAL_ADDRESS,
        );

        const onStakeTxConfirmed = async () => {
          const [, balance] = await Promise.all([
            onConfirm?.(),
            stETH.balance(address),
          ]);
          return balance;
        };

        const stakeCall = await stake.stakeEthPopulateTx({
          value: amount,
          referralAddress: getAddressViem(referralAddress),
        });
        await txFlow({
          callsFn: async () => [stakeCall],
          sendTransaction: async (txStagesCallback) => {
            await stake.stakeEth({
              value: amount,
              callback: txStagesCallback,
              referralAddress: getAddressViem(referralAddress),
            });
          },
          onSign: async ({ payload }) => {
            txModalStages.sign(amount);
            return applyRoundUpGasLimit(
              (payload as bigint) ?? config.STAKE_GASLIMIT_FALLBACK,
            );
          },
          onReceipt: ({ txHashOrCallId }) => {
            return txModalStages.pending(amount, txHashOrCallId, isAA);
          },
          onSuccess: async ({ txHash }) => {
            const balance = await onStakeTxConfirmed();
            txModalStages.success(balance, txHash);
            trackMatomoEvent(MATOMO_TX_EVENTS_TYPES.stakingFinish);
          },
          onFailure: ({ error }) => txModalStages.failed(error, onRetry),
          onMultisigDone: () => txModalStages.successMultisig(),
        });

        return true;
      } catch (error) {
        console.warn(error);
        txModalStages.failed(error, onRetry);
        return false;
      }
    },
    [address, stake, txFlow, isAA, onConfirm, stETH, txModalStages, onRetry],
  );
};
