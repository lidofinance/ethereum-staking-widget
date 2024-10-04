import { useMemo, useState, useEffect, useCallback } from 'react';
import type { BigNumber } from 'ethers';

import { runWithTransactionLogger } from 'utils';
import { useLidoSDK } from 'providers/lido-sdk';
import { useDappStatus } from 'shared/hooks/use-dapp-status';

type UseUnwrapTxApproveArgs = {
  amount: BigNumber;
};

export const useUnwrapTxOnL2Approve = ({ amount }: UseUnwrapTxApproveArgs) => {
  const { isAccountActiveOnL2 } = useDappStatus();
  const { core: lidoSDKCore, l2: lidoSDKL2 } = useLidoSDK();
  const [allowance, setAllowance] = useState<bigint | null>(null);
  const [isApprovalNeededBeforeUnwrap, setIsApprovalNeededBeforeUnwrap] =
    useState<boolean>(false);

  const refetchAllowance = useCallback(() => {
    const checkAllowance = async () => {
      try {
        const allowance = await lidoSDKL2.getWstethForWrapAllowance();
        setAllowance(allowance);
        setIsApprovalNeededBeforeUnwrap(
          isAccountActiveOnL2 && amount.gt(allowance),
        );
      } catch (error) {
        console.error('Error fetching allowance on L2:', error);
      }
    };

    void checkAllowance();
  }, [lidoSDKL2, isAccountActiveOnL2, amount]);

  const processApproveTx = useCallback(
    async ({ onTxSent }: { onTxSent: (txHash: string) => void }) => {
      try {
        const approveTxHash = (
          await runWithTransactionLogger('Approve signing on L2', () =>
            lidoSDKL2.approveWstethForWrap({
              value: amount.toBigInt(),
            }),
          )
        ).hash;

        void onTxSent?.(approveTxHash);

        refetchAllowance();

        return approveTxHash;
      } catch (error) {
        console.error('Error approve on L2:', error);
      }
    },
    [lidoSDKL2, amount, refetchAllowance],
  );

  useEffect(() => {
    if (lidoSDKCore.web3Provider && isAccountActiveOnL2) {
      void refetchAllowance();
    }
  }, [isAccountActiveOnL2, refetchAllowance, lidoSDKCore.web3Provider]);

  return useMemo(
    () => ({
      processApproveTx,
      refetchAllowance,
      allowance,
      isApprovalNeededBeforeUnwrap,
      isShowAllowance: isAccountActiveOnL2,
    }),
    [
      processApproveTx,
      refetchAllowance,
      allowance,
      isApprovalNeededBeforeUnwrap,
      isAccountActiveOnL2,
    ],
  );
};
