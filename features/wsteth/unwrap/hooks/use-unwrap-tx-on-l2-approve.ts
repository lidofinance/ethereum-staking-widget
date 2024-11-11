import { useMemo, useCallback } from 'react';

import { LIDO_L2_CONTRACT_ADDRESSES } from '@lidofinance/lido-ethereum-sdk/common';
import { TransactionCallbackStage } from '@lidofinance/lido-ethereum-sdk/core';

import { useLidoSDK, useDappStatus, useAllowance } from 'modules/web3';

import { useTxModalWrap } from '../../wrap/hooks/use-tx-modal-stages-wrap';
import { TOKENS_TO_WRAP } from '../../shared/types';

type UseUnwrapTxApproveArgs = {
  amount: bigint;
};

export const useUnwrapTxOnL2Approve = ({ amount }: UseUnwrapTxApproveArgs) => {
  const { isDappActiveOnL2, isChainTypeOnL2, address } = useDappStatus();
  const { core, l2 } = useLidoSDK();
  const { txModalStages } = useTxModalWrap();

  const staticTokenAddress = LIDO_L2_CONTRACT_ADDRESSES[core.chainId]?.wsteth;
  const staticSpenderAddress = LIDO_L2_CONTRACT_ADDRESSES[core.chainId]?.steth;

  // only runs on l2
  const {
    data: allowance,
    refetch: refetchAllowance,
    isLoading: isAllowanceLoading,
  } = useAllowance({
    account: isDappActiveOnL2 ? address : undefined,
    spender: staticSpenderAddress,
    token: staticTokenAddress,
  });

  const isApprovalNeededBeforeUnwrap = allowance && amount > allowance;

  const processApproveTx = useCallback(
    async ({ onRetry }: { onRetry?: () => void }) => {
      const approveTxHash = await l2.approveWstethForWrap({
        value: amount,
        callback: ({ stage, payload }) => {
          switch (stage) {
            case TransactionCallbackStage.SIGN:
              txModalStages.signApproval(amount, TOKENS_TO_WRAP.WSTETH);
              break;
            case TransactionCallbackStage.RECEIPT:
              txModalStages.pendingApproval(amount, TOKENS_TO_WRAP.WSTETH);
              break;
            case TransactionCallbackStage.MULTISIG_DONE:
              txModalStages.successMultisig();
              break;
            case TransactionCallbackStage.ERROR:
              txModalStages.failed(payload, onRetry);
              break;
            default:
          }
        },
      });

      // wait for refetch to settle
      await refetchAllowance().catch();

      return approveTxHash;
    },
    [refetchAllowance, l2, amount, txModalStages],
  );

  return useMemo(
    () => ({
      processApproveTx,
      refetchAllowance,
      allowance,
      isApprovalNeededBeforeUnwrap,
      isAllowanceLoading,
      // There are 2 cases when we show the allowance on the unwrap page:
      // 1. wallet chain is any Optimism supported chain and chain switcher is Optimism (isDappActiveOnL2)
      // 2. or wallet chain is any ETH supported chain, but chain switcher is Optimism (isChainTypeOnL2)
      isShowAllowance: isDappActiveOnL2 || isChainTypeOnL2,
    }),
    [
      processApproveTx,
      refetchAllowance,
      allowance,
      isApprovalNeededBeforeUnwrap,
      isAllowanceLoading,
      isDappActiveOnL2,
      isChainTypeOnL2,
    ],
  );
};
