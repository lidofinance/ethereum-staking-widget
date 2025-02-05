import { useMemo, useCallback } from 'react';

import { LIDO_L2_CONTRACT_ADDRESSES } from '@lidofinance/lido-ethereum-sdk/common';
import { TransactionCallbackStage } from '@lidofinance/lido-ethereum-sdk/core';

import { useLidoSDKL2, useDappStatus, useAllowance } from 'modules/web3';

import { useTxModalWrap } from '../../wrap/hooks/use-tx-modal-stages-wrap';
import { TOKENS_TO_WRAP } from '../../shared/types';

type UseUnwrapTxApproveArgs = {
  amount: bigint;
};

export const useUnwrapTxOnL2Approve = ({ amount }: UseUnwrapTxApproveArgs) => {
  const { isDappActiveOnL2, isChainIdOnL2, address } = useDappStatus();
  const { l2, core } = useLidoSDKL2();
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

  const isApprovalNeededBeforeUnwrap = allowance != null && amount > allowance;

  const processApproveTx = useCallback(
    async ({ onRetry }: { onRetry?: () => void }) => {
      const approveTxHash = await l2.approveWstethForWrap({
        value: amount,
        callback: async ({ stage, payload }) => {
          switch (stage) {
            case TransactionCallbackStage.SIGN:
              txModalStages.signApproval(amount, TOKENS_TO_WRAP.ETH);
              break;
            case TransactionCallbackStage.RECEIPT:
              txModalStages.pendingApproval(
                amount,
                TOKENS_TO_WRAP.wstETH,
                payload,
              );
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
      // 1. wallet chain is L2 chain and chain switcher is on L2 chain (isDappActiveOnL2)
      // 2. or wallet chain is any ETH supported chain, but chain switcher is on L2 chain (isChainTypeOnL2)
      isShowAllowance: isDappActiveOnL2 || isChainIdOnL2,
    }),
    [
      processApproveTx,
      refetchAllowance,
      allowance,
      isApprovalNeededBeforeUnwrap,
      isAllowanceLoading,
      isDappActiveOnL2,
      isChainIdOnL2,
    ],
  );
};
