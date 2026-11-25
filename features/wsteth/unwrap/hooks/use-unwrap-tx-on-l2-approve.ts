import { useMemo } from 'react';

import { LIDO_L2_CONTRACT_ADDRESSES } from '@lidofinance/lido-ethereum-sdk/common';

import { useLidoSDKL2, useDappStatus, useAllowance, useAA } from 'modules/web3';

type UseUnwrapTxApproveArgs = {
  amount: bigint;
};

export const useUnwrapTxOnL2Approve = ({ amount }: UseUnwrapTxApproveArgs) => {
  const { isDappActiveOnL2, isChainIdOnL2, address } = useDappStatus();
  const { core } = useLidoSDKL2();
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

  return useMemo(
    () => ({
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
