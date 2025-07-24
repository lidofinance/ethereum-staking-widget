import { useMemo, useCallback } from 'react';

import { TransactionCallbackStage } from '@lidofinance/lido-ethereum-sdk/core';

import { TOKENS_TO_WRAP } from 'features/wsteth/shared/types';
import {
  useAA,
  useAllowance,
  useDappStatus,
  useLidoSDK,
  useStETHContractAddress,
  useWstETHContractAddress,
} from 'modules/web3';

import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_TX_EVENTS_TYPES } from 'consts/matomo';

import { useTxModalWrap } from './use-tx-modal-stages-wrap';

type UseWrapTxApproveArgs = {
  amount: bigint;
  token: TOKENS_TO_WRAP;
};

export const useWrapTxOnL1Approve = ({
  amount,
  token,
}: UseWrapTxApproveArgs) => {
  const { address, isWalletConnected, isDappActiveOnL1, isChainIdOnL2 } =
    useDappStatus();
  const { wrap } = useLidoSDK();
  const { txModalStages } = useTxModalWrap();
  const { isAA } = useAA();

  const { data: staticTokenAddress } = useStETHContractAddress();
  const { data: staticSpenderAddress } = useWstETHContractAddress();

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

  // Wrap requires approval if the following conditions are met:
  // 1. the current network is L1
  // 2. the allowance is not enough for the amount to wrap
  // 3. the token is stETH

  const hasEnoughAllowance = allowance != null && allowance >= amount;

  const needsApprove =
    isDappActiveOnL1 && !hasEnoughAllowance && token === TOKENS_TO_WRAP.stETH;

  // If the connected wallet supports batch txs for the connected address, then we don't need to show the unlock requirement,
  // because the approval tx will be included in the batch.
  const shouldShowUnlockRequirement = needsApprove && !isAA;

  const processApproveTx = useCallback(
    async ({ onRetry }: { onRetry?: () => void }) => {
      trackMatomoEvent(MATOMO_TX_EVENTS_TYPES.wrapApprovalStart);

      const approveTx = await wrap.approveStethForWrap({
        value: amount,
        callback: async ({ stage, payload }) => {
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

      trackMatomoEvent(MATOMO_TX_EVENTS_TYPES.wrapApprovalFinish);

      return approveTx.hash;
    },
    [amount, refetchAllowance, token, txModalStages, wrap],
  );

  return useMemo(
    () => ({
      processApproveTx,
      allowance,
      // fix first loading when the wallet is autoconnecting
      isAllowanceLoading:
        isDappActiveOnL1 && (allowance == null || isAllowanceLoading),
      needsApprove,
      shouldShowUnlockRequirement,
      refetchAllowance,
      // There are 3 cases when we show the allowance on the wrap page:
      // 1. is wallet not connected (!isWalletConnected)
      // 2. or wallet chain is any ETH supported chain and chain switcher is ETH (isDappActiveOnL1)
      // 3. or wallet chain is L2 chain, but chain switcher is ETH (!isChainIdOnL2)
      isShowAllowance: !isWalletConnected || isDappActiveOnL1 || !isChainIdOnL2,
    }),
    [
      processApproveTx,
      allowance,
      isAllowanceLoading,
      needsApprove,
      shouldShowUnlockRequirement,
      refetchAllowance,
      isWalletConnected,
      isDappActiveOnL1,
      isChainIdOnL2,
    ],
  );
};
