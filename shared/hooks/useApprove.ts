import invariant from 'tiny-invariant';
import { useCallback } from 'react';
import { ContractTransaction, ContractReceipt } from '@ethersproject/contracts';
import { BigNumber } from '@ethersproject/bignumber';
import { getERC20Contract } from '@lido-sdk/contracts';
import { Zero } from '@ethersproject/constants';
import { useAllowance, useMountedState, useSDK } from '@lido-sdk/react';

type TransactionCallback = () => Promise<ContractTransaction>;

const defaultWrapper = async (callback: TransactionCallback) => {
  const transaction = await callback();
  return await transaction.wait();
};

export type UseApproveResponse = {
  approve: () => Promise<void>;
  approving: boolean;
  needsApprove: boolean;
  initialLoading: boolean;
  allowance: BigNumber;
  loading: boolean;
  error: unknown;
};

export type UseApproveWrapper = (
  callback: TransactionCallback,
) => Promise<ContractReceipt | undefined>;

export const useApprove = (
  amount: BigNumber,
  token: string,
  spender: string,
  owner?: string,
  wrapper: UseApproveWrapper = defaultWrapper,
): UseApproveResponse => {
  const { providerWeb3, account, onError } = useSDK();
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
    invariant(providerWeb3 != null, 'Web3 provider is required');
    const contractWeb3 = getERC20Contract(token, providerWeb3.getSigner());

    setApproving(true);

    try {
      const feeData = await providerWeb3
        .getFeeData()
        .catch((error) => console.warn(error));

      const maxPriorityFeePerGas = feeData?.maxPriorityFeePerGas ?? undefined;
      const maxFeePerGas = feeData?.maxFeePerGas ?? undefined;

      await wrapper(() =>
        contractWeb3.approve(spender, amount, {
          maxFeePerGas,
          maxPriorityFeePerGas,
        }),
      );

      await updateAllowance();
    } catch (error) {
      onError(error);
    } finally {
      setApproving(false);
    }
  }, [
    providerWeb3,
    token,
    setApproving,
    wrapper,
    updateAllowance,
    spender,
    amount,
    onError,
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
