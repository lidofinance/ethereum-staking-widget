import invariant from 'tiny-invariant';
import { useCallback } from 'react';

import type { ContractReceipt } from '@ethersproject/contracts';
import { BigNumber } from '@ethersproject/bignumber';
import { getERC20Contract } from '@lido-sdk/contracts';
import { useSDK } from '@lido-sdk/react';

import { isContract } from 'utils/isContract';
import { runWithTransactionLogger } from 'utils';

import { useCurrentStaticRpcProvider } from './use-current-static-rpc-provider';
import { sendTx } from 'utils/send-tx';
import { useAllowance } from './use-allowance';
import { Address } from 'viem';

type ApproveOptions =
  | {
      onTxStart?: () => void | Promise<void>;
      onTxSent?: (tx: string) => void | Promise<void>;
      onTxAwaited?: (tx: ContractReceipt) => void | Promise<void>;
    }
  | undefined;

export type UseApproveResponse = {
  approve: (options?: ApproveOptions) => Promise<string>;
  allowance: ReturnType<typeof useAllowance>['data'];
  needsApprove: boolean;
} & ReturnType<typeof useAllowance>;

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

  const allowanceQuery = useAllowance({
    token: token as Address,
    account: mergedOwner as Address,
    spender: spender as Address,
  });

  const needsApprove = Boolean(
    allowanceQuery.data && !amount.isZero() && amount.gt(allowanceQuery.data),
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

      await allowanceQuery.refetch();

      return approveTxHash;
    },
    [
      providerWeb3,
      chainId,
      account,
      token,
      staticRpcProvider,
      allowanceQuery,
      spender,
      amount,
    ],
  );

  return {
    approve,
    needsApprove,
    allowance: allowanceQuery.data,
    ...allowanceQuery,
  };
};
