import { useMemo, useCallback } from 'react';

import { TransactionCallbackStage } from '@lidofinance/lido-ethereum-sdk/core';

import { TOKENS_TO_WRAP } from 'features/wsteth/shared/types';
import {
  useAllowance,
  useDappStatus,
  useLidoSDK,
  useStETHContractAddress,
  useWstETHContractAddress,
} from 'modules/web3';

import { useTxModalWrap } from './use-tx-modal-stages-wrap';

type UseWrapTxApproveArgs = {
  amount: bigint;
  token: TOKENS_TO_WRAP;
};

export const useWrapTxOnL1Approve = ({
  amount,
  token,
}: UseWrapTxApproveArgs) => {
  const { address, isWalletConnected, isDappActiveOnL1, isChainTypeOnL2 } =
    useDappStatus();
  const { wrap } = useLidoSDK();
  const { txModalStages } = useTxModalWrap();

  const { data: staticSpenderAddress } = useStETHContractAddress();
  const { data: staticTokenAddress } = useWstETHContractAddress();

  // only runs on l1
  const {
    data: allowance,
    isLoading: isAllowanceLoading,
    refetch: refetchAllowance,
  } = useAllowance({
    account: isDappActiveOnL1 ? address : undefined,
    spender: staticSpenderAddress,
    token: staticTokenAddress,
  });

  const needsApprove = allowance != null && amount > allowance;

  const isApprovalNeededBeforeWrap =
    isDappActiveOnL1 && needsApprove && token === TOKENS_TO_WRAP.stETH;

  const processApproveTx = useCallback(
    async ({ onRetry }: { onRetry?: () => void }) => {
      const approveTx = await wrap.approveStethForWrap({
        value: amount,
        callback: ({ stage, payload }) => {
          switch (stage) {
            case TransactionCallbackStage.SIGN:
              txModalStages.signApproval(amount, token);
              break;
            case TransactionCallbackStage.RECEIPT:
              txModalStages.pendingApproval(amount, token, payload);
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

      return approveTx.hash;
    },
    [amount, refetchAllowance, token, txModalStages, wrap],
  );

  return useMemo(
    () => ({
      processApproveTx,
      needsApprove,
      allowance,
      isAllowanceLoading,
      isApprovalNeededBeforeWrap,
      refetchAllowance,
      // There are 3 cases when we show the allowance on the wrap page:
      // 1. is wallet not connected (!isWalletConnected)
      // 2. or wallet chain is any ETH supported chain and chain switcher is ETH (isDappActiveOnL1)
      // 3. or wallet chain is any Optimism supported chain, but chain switcher is ETH (!isChainTypeOnL2)
      isShowAllowance:
        !isWalletConnected || isDappActiveOnL1 || !isChainTypeOnL2,
    }),
    [
      processApproveTx,
      needsApprove,
      allowance,
      isAllowanceLoading,
      isApprovalNeededBeforeWrap,
      refetchAllowance,
      isWalletConnected,
      isDappActiveOnL1,
      isChainTypeOnL2,
    ],
  );
};
