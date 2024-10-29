import { useMemo } from 'react';
import type { BigNumber } from 'ethers';

import { getTokenAddress, TOKENS } from '@lido-sdk/constants';
import { useSDK } from '@lido-sdk/react';

import { TokensWrappable, TOKENS_TO_WRAP } from 'features/wsteth/shared/types';
import { useApproveOnL1 } from 'shared/hooks/useApproveOnL1';
import { useDappStatus } from 'modules/web3';

type UseWrapTxApproveArgs = {
  amount: BigNumber;
  token: TokensWrappable;
};

export const useWrapTxOnL1Approve = ({
  amount,
  token,
}: UseWrapTxApproveArgs) => {
  const { isWalletConnected, isDappActiveOnL1, isChainTypeOnL2 } =
    useDappStatus();
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
    isDappActiveOnL1 ? stethTokenAddress : undefined,
    isDappActiveOnL1 ? wstethTokenAddress : undefined,
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
      isShowAllowance:
        !isWalletConnected || isDappActiveOnL1 || !isChainTypeOnL2,
    }),
    [
      processApproveTx,
      needsApprove,
      allowance,
      isApprovalLoading,
      isApprovalNeededBeforeWrap,
      refetchAllowance,
      isWalletConnected,
      isDappActiveOnL1,
      isChainTypeOnL2,
    ],
  );
};
