import { useMemo, useCallback } from 'react';

import { LIDO_L2_CONTRACT_ADDRESSES } from '@lidofinance/lido-ethereum-sdk/common';
import { TransactionCallbackStage } from '@lidofinance/lido-ethereum-sdk/core';

import { useLidoSDKL2, useDappStatus, useAllowance, useAA } from 'modules/web3';

import { useTxModalWrap } from '../../wrap/hooks/use-tx-modal-stages-wrap';
import { TOKENS_TO_WRAP } from '../../shared/types';

type UseUnwrapTxApproveArgs = {
  amount: bigint;
};

export const useUnwrapTxOnL2Approve = ({ amount }: UseUnwrapTxApproveArgs) => {
  const { isDappActiveOnL2, isChainIdOnL2, address } = useDappStatus();
  const { l2, core } = useLidoSDKL2();
  const { txModalStages } = useTxModalWrap();
  const { isAA } = useAA();

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

  // Unwrap requires approval if the following conditions are met:
  // 1. the current network is L2
  // 2. the allowance is not enough for the amount to unwrap
  const hasEnoughAllowance = allowance != null && allowance >= amount;

  const needsApprove = isDappActiveOnL2 && !hasEnoughAllowance;

  // If the connected wallet supports batch txs for the connected address, then we don't need to show the unlock requirement,
  // because the approval tx will be included in the batch.
  const shouldShowUnlockRequirement = needsApprove && !isAA;

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
      needsApprove,
      shouldShowUnlockRequirement,
      isAllowanceLoading,
      // There are 2 cases when we show the allowance on the unwrap page:
      // 1. wallet chain is L2 chain and chain switcher is on L2 chain (isDappActiveOnL2)
      // 2. or wallet chain is any ETH supported chain, but chain switcher is on L2 chain (isChainIdOnL2)
      isShowAllowance: isDappActiveOnL2 || isChainIdOnL2,
    }),
    [
      processApproveTx,
      refetchAllowance,
      allowance,
      needsApprove,
      shouldShowUnlockRequirement,
      isAllowanceLoading,
      isDappActiveOnL2,
      isChainIdOnL2,
    ],
  );
};
