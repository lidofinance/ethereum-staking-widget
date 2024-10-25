import { useMemo, useCallback } from 'react';
import type { BigNumber } from 'ethers';

import { runWithTransactionLogger } from 'utils';
import {
  useLidoSDK,
  useDappStatus,
  useAllowance,
  DAPP_CHAIN_TYPE,
} from 'modules/web3';

import { LIDO_L2_CONTRACT_ADDRESSES } from '@lidofinance/lido-ethereum-sdk/common';
import { TransactionCallbackStage } from '@lidofinance/lido-ethereum-sdk/core';

type UseUnwrapTxApproveArgs = {
  amount: BigNumber;
};

export const useUnwrapTxOnL2Approve = ({ amount }: UseUnwrapTxApproveArgs) => {
  const { isDappActiveOnL2, chainType, address } = useDappStatus();
  const { core, l2 } = useLidoSDK();

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
    async ({ onTxSent }: { onTxSent: (txHash: string) => void }) => {
      const approveTxHash = (
        await runWithTransactionLogger('Approve signing on L2', () =>
          l2.approveWstethForWrap({
            value: amount.toBigInt(),
            callback: ({ stage, payload }) => {
              if (stage === TransactionCallbackStage.RECEIPT)
                onTxSent?.(payload);
            },
          }),
        )
      ).hash;

      // wait for refetch to settle
      await refetchAllowance().catch();

      return approveTxHash;
    },
    [l2, amount, refetchAllowance],
  );

  return useMemo(
    () => ({
      processApproveTx,
      refetchAllowance,
      allowance,
      isApprovalNeededBeforeUnwrap,
      isAllowanceLoading,
      // todo
      isShowAllowance:
        isDappActiveOnL2 || chainType === DAPP_CHAIN_TYPE.Optimism,
    }),
    [
      processApproveTx,
      refetchAllowance,
      allowance,
      isApprovalNeededBeforeUnwrap,
      isAllowanceLoading,
      isDappActiveOnL2,
      chainType,
    ],
  );
};
