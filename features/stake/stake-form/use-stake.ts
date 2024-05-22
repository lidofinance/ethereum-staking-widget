import { BigNumber } from 'ethers';
import { useCallback } from 'react';
import { useWeb3 } from 'reef-knot/web3-react';
import invariant from 'tiny-invariant';

import { useSDK, useSTETHContractWeb3 } from '@lido-sdk/react';

import { config } from 'config';
import { useCurrentStaticRpcProvider } from 'shared/hooks/use-current-static-rpc-provider';
import { isContract } from 'utils/isContract';
import { getFeeData } from 'utils/getFeeData';
import { runWithTransactionLogger } from 'utils';

import {
  MockLimitReachedError,
  getAddress,
  applyGasLimitRatio,
  applyCalldataSuffix,
} from './utils';
import { useTxModalStagesStake } from './hooks/use-tx-modal-stages-stake';

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
  const { account, chainId } = useWeb3();
  const { staticRpcProvider } = useCurrentStaticRpcProvider();
  const { providerWeb3, providerRpc } = useSDK();
  const { txModalStages } = useTxModalStagesStake();

  return useCallback(
    async ({ amount, referral }: StakeArguments): Promise<boolean> => {
      try {
        invariant(amount, 'amount is null');
        invariant(chainId, 'chainId is not defined');
        invariant(account, 'account is not defined');
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
          isContract(account, providerRpc),
          referral
            ? getAddress(referral, providerRpc)
            : config.STAKE_FALLBACK_REFERRAL_ADDRESS,
        ]);

        const callback = async () => {
          if (isMultisig) {
            const tx = await stethContractWeb3.populateTransaction.submit(
              referralAddress,
              {
                value: amount,
              },
            );
            return providerWeb3.getSigner().sendUncheckedTransaction(tx);
          } else {
            const { maxFeePerGas, maxPriorityFeePerGas } =
              await getFeeData(staticRpcProvider);
            const overrides = {
              value: amount,
              maxPriorityFeePerGas,
              maxFeePerGas,
            };

            const tx = await stethContractWeb3.populateTransaction.submit(
              referralAddress,
              overrides,
            );

            applyCalldataSuffix(tx);

            const originalGasLimit = await providerWeb3.estimateGas(tx);
            const gasLimit = applyGasLimitRatio(originalGasLimit);

            tx.gasLimit = gasLimit;

            const signer = providerWeb3.getSigner();
            return signer.sendTransaction(tx);
          }
        };

        const tx = await runWithTransactionLogger('Stake signing', callback);
        const txHash = typeof tx === 'string' ? tx : tx.hash;

        if (isMultisig) {
          txModalStages.successMultisig();
          return true;
        }

        txModalStages.pending(amount, txHash);

        if (typeof tx === 'object') {
          await runWithTransactionLogger('Wrap block confirmation', () =>
            tx.wait(),
          );
        }

        const stethBalance = await stethContractWeb3.balanceOf(account);

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
      chainId,
      account,
      providerWeb3,
      stethContractWeb3,
      providerRpc,
      txModalStages,
      onConfirm,
      staticRpcProvider,
      onRetry,
    ],
  );
};
