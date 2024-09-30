import { useMemo } from 'react';
import type { BigNumber } from 'ethers';

import { useLidoSDK } from 'providers/lido-sdk';

type UseUnwrapTxApproveArgs = {
  amount: BigNumber;
};

export const useUnwrapTxOnL2Approve = ({ amount }: UseUnwrapTxApproveArgs) => {
  // TODO
  // eslint-disable-next-line no-console
  console.log(amount);

  const { sdk } = useLidoSDK();

  const isApprovalNeededBeforeUnwrap = false;

  return useMemo(
    () => ({
      // TODO
      // eslint-disable-next-line @typescript-eslint/unbound-method
      processApproveTx: sdk.l2.approveWstethForWrap,
      // TODO
      // eslint-disable-next-line @typescript-eslint/unbound-method
      refetchAllowance: sdk.l2.getWstethForWrapAllowance,
      isApprovalNeededBeforeUnwrap,
    }),
    [sdk.l2, isApprovalNeededBeforeUnwrap],
  );
};
