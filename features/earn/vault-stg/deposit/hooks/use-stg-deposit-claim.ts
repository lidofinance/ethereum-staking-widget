import { useCallback } from 'react';
import { encodeFunctionData, WalletClient } from 'viem';
import { useQueryClient } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import { useDappStatus, useLidoSDK, useTxFlow } from 'modules/web3';
import { getSTGVaultWritableContract } from '../../contracts';
import { useTxModalStagesSTGDepositClaim } from './use-stg-deposit-claim-tx-modal';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';

export const useSTGDepositClaim = (onRetry?: () => void) => {
  const { address } = useDappStatus();
  const { core } = useLidoSDK();
  const queryClient = useQueryClient();
  const { txModalStages } = useTxModalStagesSTGDepositClaim();

  const txFlow = useTxFlow();

  const claim = useCallback(
    async (amount: bigint) => {
      invariant(address, 'Address is not available');

      const vault = getSTGVaultWritableContract(
        core.rpcProvider,
        core.web3Provider as WalletClient,
      );

      const claimArgs = [address] as const;

      try {
        await txFlow({
          callsFn: async () => [
            {
              to: vault.address,
              data: encodeFunctionData({
                abi: vault.abi,
                functionName: 'claimShares',
                args: claimArgs,
              }),
            },
          ],
          sendTransaction: async (txStagesCallback) => {
            await core.performTransaction({
              getGasLimit: async (opts) =>
                await vault.estimateGas.claimShares(claimArgs, {
                  ...opts,
                }),
              sendTransaction: (opts) => {
                return vault.write.claimShares(claimArgs, {
                  ...opts,
                });
              },
              callback: txStagesCallback,
            });
          },
          onSign: () => {
            txModalStages.sign(amount);
          },
          onReceipt: async ({ txHashOrCallId, isAA }) => {
            txModalStages.pending(amount, txHashOrCallId, isAA);
          },
          onSuccess: ({ txHash }) => {
            txModalStages.success(amount, txHash);
            void queryClient.refetchQueries(
              { queryKey: ['stg'] },
              { cancelRefetch: true, throwOnError: false },
            );
            trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.strategyDepositClaim);
          },
        });

        return true;
      } catch (error) {
        console.error(error);
        txModalStages.failed(error, onRetry);
        return false;
      }
    },
    [address, core, onRetry, queryClient, txFlow, txModalStages],
  );

  return { claim };
};
