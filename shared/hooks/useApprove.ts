import invariant from 'tiny-invariant';
import { useCallback } from 'react';

import type { ContractReceipt } from '@ethersproject/contracts';
import { BigNumber } from '@ethersproject/bignumber';
import { getERC20Contract } from '@lido-sdk/contracts';
import { useAllowance, useSDK } from '@lido-sdk/react';

import { isContract } from 'utils/isContract';
import { runWithTransactionLogger } from 'utils';

import { useCurrentStaticRpcProvider } from './use-current-static-rpc-provider';
import { STRATEGY_LAZY } from 'consts/swr-strategies';
import { sendTx } from 'utils/send-tx';

type ApproveOptions =
  | {
      onTxStart?: () => void | Promise<void>;
      onTxSent?: (tx: string) => void | Promise<void>;
      onTxAwaited?: (tx: ContractReceipt) => void | Promise<void>;
    }
  | undefined;

export type UseApproveResponse = {
  approve: (options?: ApproveOptions) => Promise<string>;
  needsApprove: boolean;
  initialLoading: boolean;
  allowance: BigNumber | undefined;
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
  const { staticRpcProvider } = useCurrentStaticRpcProvider();
  const mergedOwner = owner ?? account;

  invariant(token != null, 'Token is required');
  invariant(spender != null, 'Spender is required');

  const result = useAllowance(token, spender, mergedOwner, STRATEGY_LAZY);
  const { data: allowance, initialLoading, update: updateAllowance } = result;

  const needsApprove = Boolean(
    !initialLoading && allowance && !amount.isZero() && amount.gt(allowance),
  );

  const approve = useCallback<UseApproveResponse['approve']>(
    async ({ onTxStart, onTxSent, onTxAwaited } = {}) => {
      invariant(providerWeb3 != null, 'Web3 provider is required');
      invariant(chainId, 'chain id is required');
      invariant(account, 'account is required');
      await onTxStart?.();
      const contractWeb3 = getERC20Contract(token, providerWeb3.getSigner());
      const isMultisig = await isContract(account, staticRpcProvider);

      const processApproveTx = async () => {
        const tx = await contractWeb3.populateTransaction.approve(
          spender,
          amount,
        );
        return sendTx({
          tx,
          isMultisig,
          staticProvider: staticRpcProvider,
          walletProvider: providerWeb3,
        });
      };

      const approveTxHash = await runWithTransactionLogger(
        'Approve signing',
        processApproveTx,
      );
      await onTxSent?.(approveTxHash);

      if (!isMultisig) {
        const receipt = await runWithTransactionLogger(
          'Approve block confirmation',
          () => staticRpcProvider.waitForTransaction(approveTxHash),
        );
        await onTxAwaited?.(receipt);
      }

      await updateAllowance();

      return approveTxHash;
    },
    [
      chainId,
      account,
      token,
      updateAllowance,
      spender,
      amount,
      staticRpcProvider,
      providerWeb3,
    ],
  );

  return {
    approve,
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
