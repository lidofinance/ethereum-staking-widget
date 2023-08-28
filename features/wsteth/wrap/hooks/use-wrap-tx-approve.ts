import { useMemo } from 'react';
import { useWeb3 } from 'reef-knot/web3-react';
import { useSDK } from '@lido-sdk/react';
import { useApprove } from 'shared/hooks/useApprove';

import type { BigNumber } from 'ethers';
import { getTokenAddress, TOKENS } from '@lido-sdk/constants';
import { TokensWrappable, TOKENS_TO_WRAP } from 'features/wsteth/shared/types';

type UseWrapTxApproveArgs = {
  amount: BigNumber;
  token: TokensWrappable;
};

export const useWrapTxApprove = ({ amount, token }: UseWrapTxApproveArgs) => {
  const { active, account } = useWeb3();
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
    loading: isApprovalLoading,
  } = useApprove(
    amount,
    stethTokenAddress,
    wstethTokenAddress,
    account ? account : undefined,
  );

  const isApprovalNeededBeforeWrap =
    active && needsApprove && token === TOKENS_TO_WRAP.STETH;

  return useMemo(
    () => ({
      processApproveTx,
      needsApprove,
      allowance,
      isApprovalLoading,
      isApprovalNeededBeforeWrap,
    }),
    [
      allowance,
      isApprovalNeededBeforeWrap,
      needsApprove,
      isApprovalLoading,
      processApproveTx,
    ],
  );
};
