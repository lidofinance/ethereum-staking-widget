import { useCallback } from 'react';
import invariant from 'tiny-invariant';
import { useAccount } from 'wagmi';

import {
  useSDK,
  useSTETHContractRPC,
  useWSTETHContractRPC,
  useWSTETHContractWeb3,
} from '@lido-sdk/react';

import { useCurrentStaticRpcProvider } from 'shared/hooks/use-current-static-rpc-provider';
import { isContract } from 'utils/isContract';
import { runWithTransactionLogger } from 'utils';

import type { UnwrapFormInputType } from '../unwrap-form-context';
import { useTxModalStagesUnwrap } from './use-tx-modal-stages-unwrap';
import { sendTx } from 'utils/send-tx';
import { useTxConfirmation } from 'shared/hooks/use-tx-conformation';

type UseUnwrapFormProcessorArgs = {
  onConfirm: () => Promise<void>;
  onRetry?: () => void;
};

export const useUnwrapFormProcessor = ({
  onConfirm,
  onRetry,
}: UseUnwrapFormProcessorArgs) => {
  const { address } = useAccount();
  const { providerWeb3 } = useSDK();
  const { staticRpcProvider } = useCurrentStaticRpcProvider();
  const { txModalStages } = useTxModalStagesUnwrap();
  const stETHContractRPC = useSTETHContractRPC();
  const wstETHContractRPC = useWSTETHContractRPC();
  const wstethContractWeb3 = useWSTETHContractWeb3();
  const waitForTx = useTxConfirmation();

  return useCallback(
    async ({ amount }: UnwrapFormInputType) => {
      try {
        invariant(amount, 'amount should be presented');
        invariant(address, 'address should be presented');
        invariant(providerWeb3, 'providerWeb3 must be presented');
        invariant(wstethContractWeb3, 'must have wstethContractWeb3');

        const [isMultisig, willReceive] = await Promise.all([
          isContract(address, staticRpcProvider),
          wstETHContractRPC.getStETHByWstETH(amount),
        ]);

        txModalStages.sign(amount, willReceive);

        const txHash = await runWithTransactionLogger(
          'Unwrap signing',
          async () => {
            const tx =
              await wstethContractWeb3.populateTransaction.unwrap(amount);

            return sendTx({
              tx,
              isMultisig,
              staticProvider: staticRpcProvider,
              walletProvider: providerWeb3,
            });
          },
        );

        if (isMultisig) {
          txModalStages.successMultisig();
          return true;
        }

        txModalStages.pending(amount, willReceive, txHash);

        await runWithTransactionLogger('Unwrap block confirmation', () =>
          waitForTx(txHash),
        );

        const [stethBalance] = await Promise.all([
          stETHContractRPC.balanceOf(address),
          onConfirm(),
        ]);

        txModalStages.success(stethBalance, txHash);
        return true;
      } catch (error: any) {
        console.warn(error);
        txModalStages.failed(error, onRetry);
        return false;
      }
    },
    [
      address,
      providerWeb3,
      wstethContractWeb3,
      staticRpcProvider,
      wstETHContractRPC,
      txModalStages,
      stETHContractRPC,
      onConfirm,
      waitForTx,
      onRetry,
    ],
  );
};
