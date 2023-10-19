import { useSDK, useSTETHContractWeb3 } from '@lido-sdk/react';
import { BigNumber } from 'ethers';
import { useCallback } from 'react';
import { useWeb3 } from 'reef-knot/web3-react';
import invariant from 'tiny-invariant';

import { enableQaHelpers, runWithTransactionLogger } from 'utils';
import { getErrorMessage } from 'utils/getErrorMessage';
import { isContract } from 'utils/isContract';
import { TX_OPERATION, useTransactionModal } from 'shared/transaction-modal';
import { MockLimitReachedError, getAddress } from './utils';
import { AddressZero } from '@ethersproject/constants';
import { getFeeData } from 'utils/getFeeData';
import { applyGasLimitRatio } from './hooks';

type StakeArguments = {
  amount: BigNumber;
  referral: string | null;
};

type StakeOptions = {
  onConfirm?: () => Promise<void> | void;
};

export const useStake = ({ onConfirm }: StakeOptions) => {
  const stethContractWeb3 = useSTETHContractWeb3();
  const { account, chainId } = useWeb3();
  const { providerWeb3, providerRpc } = useSDK();
  const { dispatchModalState } = useTransactionModal();
  return useCallback(
    async ({ amount, referral }: StakeArguments): Promise<boolean> => {
      try {
        invariant(chainId, 'chainId is not defined');
        invariant(account, 'account is not defined');
        invariant(providerWeb3, 'providerWeb3 not defined');
        invariant(stethContractWeb3, 'steth is not defined');

        dispatchModalState({
          type: 'start',
          operation: TX_OPERATION.CONTRACT,
          token: 'ETH',
          amount,
        });

        if (
          enableQaHelpers &&
          window.localStorage.getItem('mockLimitReached') === 'true'
        ) {
          throw new MockLimitReachedError('Stake limit reached');
        }

        const [isMultisig, referralAddress = AddressZero] = await Promise.all([
          isContract(account, providerRpc),
          getAddress(referral, providerRpc),
        ]);

        dispatchModalState({
          type: 'signing',
          operation: TX_OPERATION.CONTRACT,
        });

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
            const { maxFeePerGas, maxPriorityFeePerGas } = await getFeeData(
              chainId,
            );
            const overrides = {
              value: amount,
              maxPriorityFeePerGas,
              maxFeePerGas,
            };

            const originalGasLimit = await stethContractWeb3.estimateGas.submit(
              referralAddress,
              overrides,
            );

            const gasLimit = applyGasLimitRatio(originalGasLimit);

            return stethContractWeb3.submit(referralAddress || AddressZero, {
              ...overrides,
              gasLimit,
            });
          }
        };

        const transaction = await runWithTransactionLogger(
          'Stake signing',
          callback,
        );

        if (isMultisig) {
          dispatchModalState({ type: 'success_multisig' });
          return true;
        }

        if (typeof transaction === 'object') {
          dispatchModalState({ type: 'block', txHash: transaction.hash });
          await runWithTransactionLogger('Wrap block confirmation', () =>
            transaction.wait(),
          );
        }

        await onConfirm?.();

        dispatchModalState({ type: 'success' });

        return true;
      } catch (error) {
        console.warn(error);
        dispatchModalState({
          type: 'error',
          errorText: getErrorMessage(error),
        });
        return false;
      }
    },
    [
      account,
      chainId,
      dispatchModalState,
      onConfirm,
      providerRpc,
      providerWeb3,
      stethContractWeb3,
    ],
  );
};
