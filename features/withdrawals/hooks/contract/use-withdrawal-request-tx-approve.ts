import { useMemo } from 'react';

import { useAA, useDappStatus, useIsSmartAccount } from 'modules/web3';

import { TOKENS_TO_WITHDRAWLS } from 'features/withdrawals/types/tokens-withdrawable';

import { useWithdrawalApprove } from './use-withdrawal-approve';

import { useIsForceAllowance } from '../use-is-force-allowance';

type UseWithdrawalRequestTxApproveArgs = {
  amount: bigint | null;
  token: TOKENS_TO_WITHDRAWLS;
};

export const useWithdrawalRequestTxApprove = ({
  amount,
  token,
}: UseWithdrawalRequestTxApproveArgs) => {
  const { address } = useDappStatus();
  const { isAA } = useAA();
  const {
    isSmartAccount,
    hasBytecode,
    isLoading: isSmartAccountLoading,
  } = useIsSmartAccount();
  const [isForceAllowance, setIsForceAllowance] = useIsForceAllowance();

  const {
    allowance,
    needsApprove,
    isLoading: isUseApproveLoading,
    refetch: refetchAllowance,
  } = useWithdrawalApprove(amount ? amount : 0n, token, address);
  const hasEnoughAllowance = !!(allowance && !needsApprove);

  // “use the classic approve-then-withdraw flow” rather than “use an ERC-2612 permit”
  const isApprovalFlow =
    isSmartAccount || hasEnoughAllowance || isForceAllowance;
  const isApprovalFlowLoading = isSmartAccountLoading || isUseApproveLoading;
  const isTokenLocked = !!(
    !isAA &&
    needsApprove &&
    (hasBytecode || isForceAllowance)
  );

  return useMemo(
    () => ({
      allowance,
      needsApprove,
      refetchAllowance,
      isApprovalFlow,
      isApprovalFlowLoading,
      isTokenLocked,
      hasEnoughAllowance,
      isForceAllowance,
      setIsForceAllowance,
    }),
    [
      allowance,
      needsApprove,
      refetchAllowance,
      isApprovalFlow,
      isApprovalFlowLoading,
      isTokenLocked,
      hasEnoughAllowance,
      isForceAllowance,
      setIsForceAllowance,
    ],
  );
};
