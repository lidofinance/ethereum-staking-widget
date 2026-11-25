import { useMemo } from 'react';

import { TOKENS_TO_STAKE } from 'features/stake/shared/types';
import { useAA, useAllowance, useDappStatus } from 'modules/web3';

import { useL2WethAddresses } from './use-l2-weth-addresses';

type UseL2WethApproveArgs = {
  amount: bigint;
  token: TOKENS_TO_STAKE;
};

// Staking WETH on L2 is approve + fastStake with the token address, so the
// receiver needs an allowance for the amount. Mirrors the wrap page approval
export const useL2WethApprove = ({ amount, token }: UseL2WethApproveArgs) => {
  const { address, isDappActive } = useDappStatus();
  const { isAA } = useAA();
  const { wethAddress, receiverAddress, isWethSupported } =
    useL2WethAddresses();

  const {
    data: allowance,
    isLoading: isAllowanceLoading,
    refetch: refetchAllowance,
  } = useAllowance({
    account: isDappActive && isWethSupported ? address : undefined,
    spender: receiverAddress,
    token: wethAddress,
  });

  const hasEnoughAllowance = allowance != null && allowance >= amount;

  const needsApprove =
    isDappActive && token === TOKENS_TO_STAKE.WETH && !hasEnoughAllowance;

  // AA wallets get the approval batched with the stake, so no separate unlock step
  const shouldShowUnlockRequirement = needsApprove && !isAA;

  return useMemo(
    () => ({
      allowance,
      isAllowanceLoading,
      refetchAllowance,
      needsApprove,
      shouldShowUnlockRequirement,
      isWethSupported,
    }),
    [
      allowance,
      isAllowanceLoading,
      refetchAllowance,
      needsApprove,
      shouldShowUnlockRequirement,
      isWethSupported,
    ],
  );
};
