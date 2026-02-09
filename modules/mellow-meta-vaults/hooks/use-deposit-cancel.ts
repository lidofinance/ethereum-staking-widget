import { useCallback, useState } from 'react';
import { encodeFunctionData } from 'viem';
import invariant from 'tiny-invariant';

import { useDappStatus, useLidoSDK, useTxFlow } from 'modules/web3';

import { Contract } from '../types/contract';
import { TxModalStages } from '../types/txModalStages';

export const useDepositCancel = <DepositToken extends string>({
  depositQueue,
  txModalStages,
  onRetry,
  refetchTokenBalance,
}: {
  depositQueue: Contract;
  txModalStages: TxModalStages;
  onRetry?: () => void;
  refetchTokenBalance: (token: DepositToken) => Promise<void>;
}) => {
  const { address } = useDappStatus();
  const { core } = useLidoSDK();
  const txFlow = useTxFlow();

  const [isCanceling, setIsCanceling] = useState(false);

  const cancel = useCallback(
    async (amount: bigint, token: DepositToken) => {
      invariant(address, 'Address is not available');

      try {
        setIsCanceling(true);
        await txFlow({
          callsFn: async () => [
            {
              to: depositQueue.address,
              data: encodeFunctionData({
                abi: depositQueue.abi,
                functionName: 'cancelDepositRequest',
              }),
            },
          ],
          sendTransaction: async (txStagesCallback) => {
            await core.performTransaction({
              getGasLimit: async (opts) =>
                await depositQueue.estimateGas.cancelDepositRequest(opts),
              sendTransaction: (opts) =>
                depositQueue.write.cancelDepositRequest(opts as never), // TODO: fix opts type
              callback: txStagesCallback,
            });
          },
          onSign: () => {
            txModalStages.sign(amount, token);
          },
          onReceipt: ({ txHashOrCallId, isAA }) => {
            txModalStages.pending(amount, token, txHashOrCallId, isAA);
          },
          onSuccess: async ({ txHash }) => {
            txModalStages.success(amount, token, txHash);
            await refetchTokenBalance(token);
          },
        });

        return true;
      } catch (error) {
        console.error(error);
        txModalStages.failed(error, onRetry);
        return false;
      } finally {
        setIsCanceling(false);
      }
    },
    [
      address,
      core,
      depositQueue.abi,
      depositQueue.address,
      depositQueue.estimateGas,
      depositQueue.write,
      onRetry,
      refetchTokenBalance,
      txFlow,
      txModalStages,
    ],
  );

  return { cancel, isCanceling };
};
