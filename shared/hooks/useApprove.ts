import invariant from 'tiny-invariant';
import { useCallback } from 'react';
import { ContractTransaction } from '@ethersproject/contracts';
import { BigNumber } from '@ethersproject/bignumber';
import { getERC20Contract } from '@lido-sdk/contracts';
import { Zero } from '@ethersproject/constants';
import { useAllowance, useMountedState, useSDK } from '@lido-sdk/react';
import { isContract } from 'utils/isContract';
import { getFeeData } from 'utils/getFeeData';
import { runWithTransactionLogger } from 'utils';

export type TransactionCallback = () => Promise<ContractTransaction | string>;

export type UseApproveResponse = {
  approve: () => Promise<void>;
  approving: boolean;
  needsApprove: boolean;
  initialLoading: boolean;
  allowance: BigNumber;
  loading: boolean;
  error: unknown;
};

export const useApprove = (
  amount: BigNumber,
  token: string,
  spender: string,
  owner?: string,
): UseApproveResponse => {
  const { providerWeb3, account, chainId } = useSDK();
  const mergedOwner = owner ?? account;

  invariant(token != null, 'Token is required');
  invariant(spender != null, 'Spender is required');

  const [approving, setApproving] = useMountedState(false);
  const result = useAllowance(token, spender, mergedOwner);
  const {
    data: allowance = Zero,
    initialLoading,
    update: updateAllowance,
  } = result;

  const needsApprove =
    !initialLoading && !amount.isZero() && amount.gt(allowance);

  const approve = useCallback(async () => {
    try {
      setApproving(true);
      invariant(providerWeb3 != null, 'Web3 provider is required');
      invariant(chainId, 'chain id is required');
      invariant(account, 'account is required');
      const contractWeb3 = getERC20Contract(token, providerWeb3.getSigner());
      const isMultisig = await isContract(account, providerWeb3);

      const processApproveTx = async () => {
        if (isMultisig) {
          const tx = await contractWeb3.populateTransaction.approve(
            spender,
            amount,
          );
          const hash = await providerWeb3
            .getSigner()
            .sendUncheckedTransaction(tx);
          return hash;
        } else {
          const feeData = await getFeeData(chainId).catch((error) =>
            console.warn(error),
          );
          const maxPriorityFeePerGas =
            feeData?.maxPriorityFeePerGas ?? undefined;
          const maxFeePerGas = feeData?.maxFeePerGas ?? undefined;
          const tx = await contractWeb3.approve(spender, amount, {
            maxFeePerGas,
            maxPriorityFeePerGas,
          });
          return tx;
        }
      };

      const approveTx = await runWithTransactionLogger(
        'Approve signing',
        processApproveTx,
      );

      if (typeof approveTx === 'object') {
        await runWithTransactionLogger('Approve block confirmation', () =>
          approveTx.wait(),
        );
      }
    } finally {
      setApproving(false);
      await updateAllowance();
    }
  }, [
    setApproving,
    providerWeb3,
    chainId,
    account,
    token,
    updateAllowance,
    spender,
    amount,
  ]);

  return {
    approve,
    approving,
    needsApprove,

    allowance,
    initialLoading,

    /*
     * support dependency collection
     * https://swr.vercel.app/advanced/performance#dependency-collection
     */

    get loading() {
      return result.loading;
    },
    get error() {
      return result.error;
    },
  };
};
