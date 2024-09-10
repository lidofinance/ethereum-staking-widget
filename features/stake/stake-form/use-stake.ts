import { BigNumber } from 'ethers';
import { useCallback } from 'react';
import invariant from 'tiny-invariant';
import { useAccount } from 'wagmi';

import {
  useSDK,
  useSTETHContractRPC,
  useSTETHContractWeb3,
} from '@lido-sdk/react';

import { config } from 'config';
import { useCurrentStaticRpcProvider } from 'shared/hooks/use-current-static-rpc-provider';
import { isContract } from 'utils/isContract';
import { runWithTransactionLogger } from 'utils';

import { MockLimitReachedError, getAddress } from './utils';
import { useTxModalStagesStake } from './hooks/use-tx-modal-stages-stake';

import { sendTx } from 'utils/send-tx';
import { useTxConfirmation } from 'shared/hooks/use-tx-conformation';

type StakeArguments = {
  amount: BigNumber | null;
  referral: string | null;
};

type StakeOptions = {
  onConfirm?: () => Promise<void> | void;
  onRetry?: () => void;
};

export const useStake = ({ onConfirm, onRetry }: StakeOptions) => {
  const stethContractWeb3 = useSTETHContractWeb3();
  const { address } = useAccount();
  const stethContract = useSTETHContractRPC();
  const { staticRpcProvider } = useCurrentStaticRpcProvider();
  const { providerWeb3 } = useSDK();
  const { txModalStages } = useTxModalStagesStake();
  const waitForTx = useTxConfirmation();

  return useCallback(
    async ({ amount, referral }: StakeArguments): Promise<boolean> => {
      try {
        invariant(amount, 'amount is null');
        invariant(address, 'account is not defined');
        invariant(providerWeb3, 'providerWeb3 not defined');
        invariant(stethContractWeb3, 'steth is not defined');

        if (
          config.enableQaHelpers &&
          window.localStorage.getItem('mockLimitReached') === 'true'
        ) {
          throw new MockLimitReachedError('Stake limit reached');
        }

        txModalStages.sign(amount);

        const [isMultisig, referralAddress] = await Promise.all([
          isContract(address, staticRpcProvider),
          referral
            ? getAddress(referral, staticRpcProvider)
            : config.STAKE_FALLBACK_REFERRAL_ADDRESS,
        ]);

        const callback = async () => {
          const tx = await stethContractWeb3.populateTransaction.submit(
            referralAddress,
            {
              value: amount,
            },
          );

          return sendTx({
            tx,
            isMultisig,
            staticProvider: staticRpcProvider,
            walletProvider: providerWeb3,
            shouldApplyGasLimitRatio: true,
            shouldRoundUpGasLimit: true,
          });
        };

        const txHash = await runWithTransactionLogger(
          'Stake signing',
          callback,
        );

        if (isMultisig) {
          txModalStages.successMultisig();
          return true;
        }

        txModalStages.pending(amount, txHash);

        await runWithTransactionLogger('Stake block confirmation', () =>
          waitForTx(txHash),
        );

        const stethBalance = await stethContract.balanceOf(address);

        await onConfirm?.();

        txModalStages.success(stethBalance, txHash);

        return true;
      } catch (error) {
        console.warn(error);
        txModalStages.failed(error, onRetry);
        return false;
      }
    },
    [
      address,
      providerWeb3,
      stethContractWeb3,
      txModalStages,
      staticRpcProvider,
      stethContract,
      onConfirm,
      waitForTx,
      onRetry,
    ],
  );
};
