import { useCallback } from 'react';
import invariant from 'tiny-invariant';
import { encodeFunctionData } from 'viem';
import { StethAbi } from '@lidofinance/lido-ethereum-sdk/stake';

import { config, useConfig } from 'config';
import {
  type AACall,
  applyRoundUpTxParameter,
  useDappStatus,
  useLidoSDK,
  useAA,
  useTxFlow,
  TxSettledError,
  TxFlowInterruptedError,
  TxStaleError,
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

      // Lido takes ETH only, so WETH is unwrapped first: in the same batch
      // for AA wallets, as a separate transaction otherwise. The flag tells
      // the stage callbacks which of the chained transactions is reporting
      let needsUnwrap = isWeth;
      // Set once the separate unwrap has landed: from then on the funds are
      // ETH, so a failed stake must be retried as an ETH stake
      let isUnwrapped = false;
      // Set once the stake reached the wallet and got a hash
      let isStakeSent = false;

      const recoverAfterUnwrap = async () => {
        if (!isUnwrapped) return;
        onUnwrapped?.();
        await onConfirm?.();
      };

      const reportFailure = (error: unknown): boolean => {
        // Determine if failure occurred after WETH was unwrapped but before the stake was sent
        const isInterruptedAfterUnwrap =
          isUnwrapped && !isStakeSent && !(error instanceof TxStaleError);
        // if so, report as failure but hint user that funds are safu in ETH
        if (isInterruptedAfterUnwrap) {
          txModalStages.failed(
            new TxFlowInterruptedError(
              ErrorMessage.STAKE_WETH_INTERRUPTED,
              error instanceof TxSettledError ? error.cause : error,
            ),
            onRetry,
          );
          return false;
        }
        // otherwise, report as a regular failure
        txModalStages.failed(error, onRetry);
        return error instanceof TxSettledError;
      };

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
          stake.core.publicClient,
        );
        const preStakeBalance = await stETH.balance(address);

        const onStakeTxConfirmed = async () => {
          const [, balance] = await Promise.all([
            onConfirm?.(),
            stETH.balance(address),
          ]);
          return balance;
        };

        // Built without a gas estimate: for a WETH stake the ETH only exists
        // after the unwrap, so estimating `submit` with the full value up
        // front fails for anyone whose ETH balance is below the amount. The
        // wallet estimates the AA batch as a whole, and the SDK estimates the
        // legacy transaction once the unwrap has landed
        const populateStakeCall = async (): Promise<AACall> => ({
          to: await stETH.contractAddress(),
          data: encodeFunctionData({
            abi: StethAbi,
            functionName: 'submit',
            args: [referralAddress],
          }),
          value: amount,
        });
        await txFlow({
          callsFn: async () => {
            const stakeCall = await populateStakeCall();
            const calls = needsUnwrap
              ? [unwrapPopulateTx(amount), stakeCall]
              : [stakeCall];
            needsUnwrap = false;
            return calls;
          },
          sendTransaction: async (txStagesCallback) => {
            if (needsUnwrap) {
              await unwrap({ amount, callback: txStagesCallback });
              needsUnwrap = false;
            }
            await stake.stakeEth({
              value: amount,
              callback: txStagesCallback,
              referralAddress,
            });
          },
          onSign: async ({ payload }) => {
            if (needsUnwrap) {
              txModalStages.signUnwrap(amount);
              return;
            }
            // we show staking ETH(even for wETH) so it correlates with
            txModalStages.sign(amount, 'ETH');
            return applyRoundUpTxParameter(
              (payload as bigint) ?? config.STAKE_GASLIMIT_FALLBACK,
            );
          },
          onReceipt: ({ txHashOrCallId }) => {
            if (needsUnwrap) {
              return txModalStages.pendingUnwrap(amount, txHashOrCallId);
            }
            isStakeSent = true;
            return txModalStages.pending(amount, 'ETH', txHashOrCallId, isAA);
          },
          onConfirmation: () => {
            if (needsUnwrap) isUnwrapped = true;
          },
          onSuccess: async ({ txHash }) => {
            if (needsUnwrap) {
              isUnwrapped = true;
              return;
            }
            const balance = await onStakeTxConfirmed();
            if (featureFlags.holidayDecorEnabled) {
              bells();
            }
            txModalStages.success(balance, preStakeBalance, txHash);
            trackMatomoEvent(MATOMO_TX_EVENTS_TYPES.stakingFinish, { token });
          },
          onMultisigDone: () => {
            if (needsUnwrap) return;
            txModalStages.successMultisig();
          },
        });

        return true;
      } catch (error) {
        // Without an onFailure the flow rethrows a settled failure too, so
        // every outcome is reported here
        console.warn(error);
        await recoverAfterUnwrap();
        // a completed stake resets the form like after a success
        return reportFailure(error);
      }
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
