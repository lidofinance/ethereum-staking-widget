import { useCallback, useMemo, useState } from 'react';
import invariant from 'tiny-invariant';
import {
  TransactionCallbackStage,
  type TransactionCallback,
} from '@lidofinance/lido-ethereum-sdk/core';
import { WalletClient } from 'viem';

import {
  applyRoundUpTxParameter,
  useAA,
  useDappStatus,
  useLidoSDK,
  useMainnetOnlyWagmi,
  useTxFlow,
} from 'modules/web3';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';
import { TOKENS, TOKEN_SYMBOLS } from 'consts/tokens';
import { getErrorMessage, ErrorMessage } from 'utils';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import type { AsyncRedeemQueueWritableContract } from 'modules/mellow-meta-vaults/types/contracts';
import { getRedeemQueueWritableContract } from '../../contracts';
import {
  getUsdVaultWithdrawClaimCalls,
  type ClaimResult,
  type UsdVaultWithdrawClaimAmount,
} from '../claim-all-utils';
import { groupUsdWithdrawRequestsByToken } from '../utils';
import { useUsdVaultWithdrawClaimAllTxModal } from './use-withdraw-claim-all-tx-modal';
import { useUsdVaultWithdrawFormData } from './use-withdraw-form-data';
import { useUsdVaultWithdrawRequests } from './use-withdraw-requests';

// One payout token's claim: what to show, which queue to call, which requests
// to settle. Needs the whole contract, not ClaimCallOperation's `Pick`, since
// sending a claim uses `estimateGas` and `write` too.
type ClaimOperation = UsdVaultWithdrawClaimAmount & {
  redeemQueue: AsyncRedeemQueueWritableContract;
  timestamps: number[];
};

export const useUsdVaultWithdrawClaimAll = () => {
  const { core } = useLidoSDK();
  const { address } = useDappStatus();
  // A wallet that supports EIP-5792 claims every token with one signature,
  // anything else sends one transaction per token. txFlow picks the same way,
  // see `isAA && callsFn` in use-tx-flow.ts.
  const { isAA: isBatch } = useAA();
  const { publicClientMainnet } = useMainnetOnlyWagmi();
  invariant(publicClientMainnet, 'Public client is not available');

  const txFlow = useTxFlow();
  const { refetchData } = useUsdVaultWithdrawFormData();
  const { data } = useUsdVaultWithdrawRequests();
  const [isClaiming, setIsClaiming] = useState(false);

  const { txModalStages } = useUsdVaultWithdrawClaimAllTxModal();

  const requestsGroups = useMemo(
    () => groupUsdWithdrawRequestsByToken(data.claimableRequests),
    [data.claimableRequests],
  );

  const redeemQueues = useMemo(
    () => ({
      [TOKENS.usdc]: getRedeemQueueWritableContract({
        publicClient: publicClientMainnet,
        walletClient: core.walletClient as WalletClient,
        token: TOKENS.usdc,
      }),
      [TOKENS.usdt]: getRedeemQueueWritableContract({
        publicClient: publicClientMainnet,
        walletClient: core.walletClient as WalletClient,
        token: TOKENS.usdt,
      }),
    }),
    [core.walletClient, publicClientMainnet],
  );

  // One claim per token: each has its own queue contract, so a wallet that
  // cannot batch sends one transaction per token.
  const claimOperations: ClaimOperation[] = useMemo(
    () =>
      [TOKENS.usdc, TOKENS.usdt]
        .map((token) => ({
          token: TOKEN_SYMBOLS[token],
          amount: requestsGroups[token].reduce(
            (sum, request) => sum + request.assets,
            0n,
          ),
          redeemQueue: redeemQueues[token],
          timestamps: requestsGroups[token].map(({ timestamp }) =>
            Number(timestamp),
          ),
        }))
        .filter(({ timestamps }) => timestamps.length > 0),
    [requestsGroups, redeemQueues],
  );

  const withdrawClaimAll = useCallback(async () => {
    invariant(address, 'No address provided');
    invariant(claimOperations.length > 0, 'No requests to claim');

    setIsClaiming(true);

    const results: ClaimResult[] = claimOperations.map(({ token, amount }) => ({
      token,
      amount,
      status: 'not-started',
    }));

    // Which token the loop is on. A batch has no loop and leaves it at zero.
    let currentIndex = 0;

    // What the wallet is working on right now: every token in a batch, one of
    // them otherwise.
    const activeResults = () => (isBatch ? results : [results[currentIndex]]);

    let callId: string | undefined;
    let errorText: string | undefined;

    // The step that ends the run, and so the one that reports it: a batch is
    // always it, a loop only on its last transaction.
    const isFinalStep = () => isBatch || currentIndex === results.length - 1;

    // Only sequential claims have a "transaction N of M" to report.
    const stepLabel = () =>
      !isBatch && results.length > 1
        ? `Transaction ${currentIndex + 1} of ${results.length}`
        : undefined;

    // The final word on the run: everything learned along the way, shown at
    // once.
    const reportResult = () => {
      const isAllClaimed = results.every(({ status }) => status === 'claimed');
      txModalStages.result(results, {
        callId,
        error: isAllClaimed ? undefined : errorText,
      });
      if (isAllClaimed) {
        trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.earnUsdWithdrawalClaimAll);
      }
    };

    // Sends one queue's claim. Throws on a rejected signature or a revert —
    // that is how the caller learns this token did not settle.
    const claimOneToken = async (
      operation: ClaimOperation,
      txStagesCallback: TransactionCallback,
    ) => {
      const { redeemQueue, timestamps } = operation;
      const claimArgs = [address, timestamps] as const;

      await core.performTransaction({
        getGasLimit: async (opts) =>
          applyRoundUpTxParameter(
            await redeemQueue.estimateGas.claim(claimArgs, opts),
          ),
        sendTransaction: (opts) => redeemQueue.write.claim(claimArgs, opts),
        callback: async (tx) => {
          // Use the mined hash: "speed up" or "cancel" in the wallet replaces
          // the transaction, so the one from RECEIPT can be stale. Record it
          // before the callback — a revert makes that throw, and the failed
          // transaction still needs its link.
          if (tx.stage === TransactionCallbackStage.CONFIRMATION && tx.payload)
            results[currentIndex].txHash = tx.payload.transactionHash;
          await txStagesCallback(tx);
        },
      });
    };

    try {
      await txFlow({
        // Only when the wallet supports EIP-5792: one signature, every token.
        callsFn: async () =>
          getUsdVaultWithdrawClaimCalls(address, claimOperations),
        sendTransaction: async (txStagesCallback) => {
          for (const [index, operation] of claimOperations.entries()) {
            currentIndex = index;
            await claimOneToken(operation, txStagesCallback);
          }
        },
        onSign: () => {
          txModalStages.sign(results, stepLabel());
        },
        onReceipt: ({ txHashOrCallId, isAA }) => {
          if (isAA) callId = txHashOrCallId;
          else results[currentIndex].txHash = txHashOrCallId;
          txModalStages.pending(results, txHashOrCallId, isAA, stepLabel());
        },
        onMultisigDone: () => {
          for (const result of activeResults()) result.status = 'submitted';
          txModalStages.successMultisig();
        },
        onSuccess: async ({ txHash }) => {
          for (const result of activeResults()) {
            result.status = 'claimed';
            // Sequential claims already have their mined hash from above;
            // a batch learns its only hash here.
            result.txHash = result.txHash ?? txHash;
          }
          if (isFinalStep()) reportResult();
          // A settled claim makes the page behind the modal stale, so refresh
          // it here, where the settling happens.
          await refetchData();
        },
      });
    } catch (error) {
      console.error(error);
      errorText = getErrorMessage(error);
      // A rejected signature is the user's choice, not a fault. Anything else
      // that got here failed — the flow throws on a revert.
      const status =
        errorText === ErrorMessage.DENIED_SIG ? 'rejected' : 'failed';
      for (const result of activeResults()) result.status = status;
      reportResult();
    } finally {
      setIsClaiming(false);
    }
  }, [
    address,
    claimOperations,
    core,
    isBatch,
    refetchData,
    txFlow,
    txModalStages,
  ]);

  return { withdrawClaimAll, isClaiming };
};
