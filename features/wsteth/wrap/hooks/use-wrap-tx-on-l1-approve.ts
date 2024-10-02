import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import type { BigNumber } from 'ethers';

import { getTokenAddress, TOKENS } from '@lido-sdk/constants';
import { useSDK } from '@lido-sdk/react';

import { TokensWrappable, TOKENS_TO_WRAP } from 'features/wsteth/shared/types';
import { useApproveOnL1 } from 'shared/hooks/useApproveOnL1';
import { useDappStatus } from 'shared/hooks/use-dapp-status';

type UseWrapTxApproveArgs = {
  amount: BigNumber;
  token: TokensWrappable;
};

export const useWrapTxOnL1Approve = ({
  amount,
  token,
}: UseWrapTxApproveArgs) => {
  const { isDappActiveOnL1 } = useDappStatus();
  const { address } = useAccount();
  const { chainId } = useSDK();

  const [stethTokenAddress, wstethTokenAddress] = useMemo(
    () => [
      getTokenAddress(chainId, TOKENS.STETH),
      getTokenAddress(chainId, TOKENS.WSTETH),
    ],
    [chainId],
  );

  const {
    approve: processApproveTx,
    needsApprove,
    allowance,
    isLoading: isApprovalLoading,
    refetch: refetchAllowance,
  } = useApproveOnL1(
    amount,
    stethTokenAddress,
    wstethTokenAddress,
    address ? address : undefined,
  );

  const isApprovalNeededBeforeWrap =
    isDappActiveOnL1 && needsApprove && token === TOKENS_TO_WRAP.STETH;

  return useMemo(
    () => ({
      processApproveTx,
      needsApprove,
      allowance,
      isApprovalLoading,
      isApprovalNeededBeforeWrap,
      refetchAllowance,
      isShowAllowance: isDappActiveOnL1,
    }),
    [
      allowance,
      isApprovalNeededBeforeWrap,
      needsApprove,
      isApprovalLoading,
      processApproveTx,
      refetchAllowance,
      isDappActiveOnL1,
    ],
  );
};
