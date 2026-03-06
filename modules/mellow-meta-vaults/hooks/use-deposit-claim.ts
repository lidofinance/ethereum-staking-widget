import { useCallback, useState } from 'react';
import { encodeFunctionData } from 'viem';
import { useQueryClient } from '@tanstack/react-query';
import invariant from 'tiny-invariant';

import { useDappStatus, useLidoSDK, useTxFlow } from 'modules/web3';
import { MATOMO_EVENT_TYPE } from 'consts/matomo';
import { trackMatomoEvent } from 'utils/track-matomo-event';

import { VaultWritableContract } from '../types/contracts';
import { TxModalStages } from '../types/tx-modal-stages';
import { MELLOW_VAULTS_QUERY_SCOPE } from '../consts';

export const useDepositClaim = ({
  vault,
  txModalStages,
  onRetry,
  matomoEventStart,
  matomoEventSuccess,
}: {
  vault: VaultWritableContract;
  txModalStages: TxModalStages;
  onRetry?: () => void;
  matomoEventStart?: MATOMO_EVENT_TYPE;
  matomoEventSuccess?: MATOMO_EVENT_TYPE;
}) => {
  const { address } = useDappStatus();
  const { core } = useLidoSDK();
  const queryClient = useQueryClient();
  const txFlow = useTxFlow();

  const [isClaiming, setIsClaiming] = useState(false);

  const claim = useCallback(
    async (amount: bigint) => {
      if (matomoEventStart) trackMatomoEvent(matomoEventStart);
      invariant(address, 'Address is not available');

      const claimArgs = [address] as const;

      try {
        setIsClaiming(true);
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
          onSuccess: async ({ txHash }) => {
            txModalStages.success(amount, txHash);
            if (matomoEventSuccess) trackMatomoEvent(matomoEventSuccess);
            await queryClient.refetchQueries(
              { queryKey: [MELLOW_VAULTS_QUERY_SCOPE] },
              { cancelRefetch: true, throwOnError: false },
            );
          },
        });

        return true;
      } catch (error) {
        console.error(error);
        txModalStages.failed(error, onRetry);
        return false;
      } finally {
        setIsClaiming(false);
      }
    },
    [
      address,
      core,
      matomoEventStart,
      matomoEventSuccess,
      onRetry,
      queryClient,
      txFlow,
      txModalStages,
      vault.abi,
      vault.address,
      vault.estimateGas,
      vault.write,
    ],
  );

  return { claim, isClaiming };
};
