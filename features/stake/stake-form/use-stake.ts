import type { Address } from 'viem';
import { useCallback } from 'react';
import invariant from 'tiny-invariant';

import {
  TransactionCallbackStage,
  type TransactionCallback,
} from '@lidofinance/lido-ethereum-sdk';

import { config } from 'config';
import { useDappStatus, useLidoSDK } from 'modules/web3';

import { MockLimitReachedError, getAddress } from './utils';
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
  const { stake, stETH } = useLidoSDK();
  const { txModalStages } = useTxModalStagesStake();

  const showSuccessTxModal = useCallback(
    async (txHash: Address) => {
      const stethBalance = await stETH.balance(address);
      txModalStages.success(stethBalance, txHash);
    },
    [address, stETH, txModalStages],
  );

  return useCallback(
    async ({ amount, referral }: StakeArguments): Promise<boolean> => {
      try {
        invariant(amount, 'amount is null');
        invariant(address, 'account is not defined');

        if (
          config.enableQaHelpers &&
          window.localStorage.getItem('mockLimitReached') === 'true'
        ) {
          throw new MockLimitReachedError('Stake limit reached');
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const referralAddress = referral
          ? await getAddress(referral, stake.core.rpcProvider)
          : config.STAKE_FALLBACK_REFERRAL_ADDRESS;

        const txCallback: TransactionCallback = ({ stage, payload }) => {
          switch (stage) {
            case TransactionCallbackStage.SIGN:
              txModalStages.sign(amount);
              break;
            case TransactionCallbackStage.RECEIPT:
              txModalStages.pending(amount, payload);
              break;
            case TransactionCallbackStage.CONFIRMATION:
              // TODO: move this to `TransactionCallbackStage.DONE` ?
              //  add the 'transactionHash' to 'payload' of `TransactionCallbackStage.DONE` ?
              void onConfirm?.();
              void showSuccessTxModal(payload?.transactionHash);
              break;
            case TransactionCallbackStage.MULTISIG_DONE:
              txModalStages.successMultisig();
              break;
            case TransactionCallbackStage.ERROR:
              txModalStages.failed(payload, onRetry);
              break;
            default:
          }
        };

        await stake.stakeEth({
          value: amount,
          callback: txCallback,
          // todo: viemGetAddress
          // referralAddress: referralAddress.toLowerCase() as Address,
        });

        return true;
      } catch (error) {
        console.warn(error);
        txModalStages.failed(error, onRetry);
        return false;
      }
    },
    [address, txModalStages, stake, onConfirm, showSuccessTxModal, onRetry],
  );
};
