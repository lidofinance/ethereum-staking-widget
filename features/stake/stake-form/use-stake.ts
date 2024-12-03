import type { Hash } from 'viem';
import { getAddress as getAddressViem } from 'viem';
import { useCallback } from 'react';
import invariant from 'tiny-invariant';

import {
  TransactionCallbackStage,
  type TransactionCallback,
} from '@lidofinance/lido-ethereum-sdk';

import { config } from 'config';
import {
  applyRoundUpGasLimit,
  useAA,
  useDappStatus,
  useLidoSDK,
  useSendAACalls,
} from 'modules/web3';

import { MockLimitReachedError, getRefferalAddress } from './utils';
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
  const sendAACalls = useSendAACalls();
  const { stake, stETH } = useLidoSDK();
  const { txModalStages } = useTxModalStagesStake();

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
          ? await getRefferalAddress(referral, stake.core.rpcProvider)
          : config.STAKE_FALLBACK_REFERRAL_ADDRESS;

        //
        // ERC5792 flow
        //
        if (isAA) {
          const calls: unknown[] = [];
          const steth = await stake.getContractStETH();
          calls.push({
            to: steth.address,
            abi: steth.abi,
            functionName: 'submit',
            args: [referralAddress],
            value: amount,
          });

          txModalStages.sign(amount);
          const { txHash } = await sendAACalls(calls, (props) => {
            if (props.stage === 'sent')
              txModalStages.pending(amount, props.callId as Hash, isAA);
          });

          const [, balance] = await Promise.all([
            onConfirm?.(),
            stETH.balance(address),
          ]);

          txModalStages.success(balance, txHash);

          return true;
        }

        //
        // Legacy flow
        //

        let txHash: Hash | undefined = undefined;
        const txCallback: TransactionCallback = async ({ stage, payload }) => {
          switch (stage) {
            case TransactionCallbackStage.SIGN:
              txModalStages.sign(amount);
              return applyRoundUpGasLimit(
                // the payload here is bigint
                payload ?? config.STAKE_GASLIMIT_FALLBACK,
              );
            case TransactionCallbackStage.RECEIPT:
              txModalStages.pending(amount, payload);
              // the payload here is txHash
              txHash = payload;
              break;
            case TransactionCallbackStage.DONE: {
              const [, balance] = await Promise.all([
                onConfirm?.(),
                stETH.balance(address),
              ]);
              txModalStages.success(balance, txHash);
              break;
            }
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
          referralAddress: getAddressViem(referralAddress),
        });

        return true;
      } catch (error) {
        console.warn(error);
        txModalStages.failed(error, onRetry);
        return false;
      }
    },
    [
      address,
      stake,
      isAA,
      txModalStages,
      sendAACalls,
      onConfirm,
      stETH,
      onRetry,
    ],
  );
};
