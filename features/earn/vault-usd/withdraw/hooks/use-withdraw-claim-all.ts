import { useCallback, useMemo, useState } from 'react';
import invariant from 'tiny-invariant';
import {
  TransactionCallbackStage,
  type TransactionCallback,
} from '@lidofinance/lido-ethereum-sdk/core';
import { WalletClient, type GetCallsStatusReturnType, type Hash } from 'viem';

import {
  applyRoundUpTxParameter,
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
  isClaimedIn,
  isRevertedClaimOf,
  type ClaimResult,
  type ClaimStatus,
  type UsdVaultWithdrawClaimAmount,
} from '../claim-all-utils';
import { groupUsdWithdrawRequestsByToken } from '../utils';
import { useUsdVaultWithdrawClaimAllTxModal } from './use-withdraw-claim-all-tx-modal';
import { useUsdVaultWithdrawFormData } from './use-withdraw-form-data';
import { useUsdVaultWithdrawRequests } from './use-withdraw-requests';

// Everything one payout token's claim needs: what to show for it, which queue
// to call, and which requests to settle. `redeemQueue` is the full writable
// contract, not the `Pick` that ClaimCallOperation encodes, because sending the
// claim needs its `estimateGas` and `write` members too.
type ClaimOperation = UsdVaultWithdrawClaimAmount & {
  redeemQueue: AsyncRedeemQueueWritableContract;
  timestamps: number[];
};

// An outcome already confirmed by a receipt is final. Everything else is
// downgraded by what the error tells us: a rejected signature never reached
// the chain, a submitted transaction may still be mined, anything earlier
// never left the wallet.
const getStatusAfterError = (
  status: ClaimStatus,
  isRejected: boolean,
): ClaimStatus => {
  if (status === 'claimed' || status === 'failed') return status;
  if (isRejected) return 'rejected';
  return status === 'pending' ? 'unknown' : 'failed';
};

// Per-token outcomes, shared by every transaction-flow callback.
// The wallet takes one of two shapes, and the bookkeeping differs:
//   - a batch (`isBatch`), where one set of calls covers every token;
//   - one transaction per token, where `index` points at the current one.
class ClaimProgress {
  readonly results: ClaimResult[];
  index = 0;
  isBatch = false;

  constructor(amounts: UsdVaultWithdrawClaimAmount[]) {
    this.results = amounts.map(({ token, amount }) => ({
      token,
      amount,
      status: 'not-started',
    }));
  }

  // Tokens the wallet is working on right now. Always a fresh array, so a
  // caller reordering or trimming it cannot desync `results` from the
  // operations they are indexed against. The entries themselves are shared on
  // purpose — that is how progress is recorded.
  get active() {
    return this.isBatch ? [...this.results] : [this.results[this.index]];
  }

  get current() {
    return this.results[this.index];
  }

  get isAllClaimed() {
    return this.results.every(({ status }) => status === 'claimed');
  }

  get isStarted() {
    return this.results.some(({ status }) => status !== 'not-started');
  }

  // Only sequential claims have a "transaction N of M" to report.
  get stepLabel() {
    return !this.isBatch && this.results.length > 1
      ? `Transaction ${this.index + 1} of ${this.results.length}`
      : undefined;
  }

  setActiveStatus(status: ClaimStatus) {
    for (const result of this.active) result.status = status;
  }
}

export const useUsdVaultWithdrawClaimAll = () => {
  const { core } = useLidoSDK();
  const { address } = useDappStatus();
  const { publicClientMainnet } = useMainnetOnlyWagmi();
  invariant(publicClientMainnet, 'Public client is not available');

  const txFlow = useTxFlow();
  const { refetchData } = useUsdVaultWithdrawFormData(true);
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

  // One claim per payout token: each token has its own queue contract, so a
  // wallet without batching has to send one transaction per token.
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

    const progress = new ClaimProgress(claimOperations);
    let callId: string | undefined;
    let batchStatus: GetCallsStatusReturnType | undefined;
    let errorText: string | undefined;
    let isRefreshFailed = false;

    const refreshVaultData = async () => {
      try {
        await refetchData();
        isRefreshFailed = false;
      } catch (error) {
        console.error(error);
        isRefreshFailed = true;
      }
    };

    // Sends one queue's claim and records what its receipt proves.
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
          // CONFIRMATION carries the mined receipt. Record it before handing
          // the stage over: a reverted receipt makes txStagesCallback throw,
          // and the result modal should still link the failed transaction.
          if (
            tx.stage === TransactionCallbackStage.CONFIRMATION &&
            tx.payload
          ) {
            // Use the mined hash — speeding up or cancelling in the wallet
            // replaces the transaction we originally submitted.
            progress.current.txHash = tx.payload.transactionHash;
            progress.current.status = isClaimedIn(
              tx.payload,
              operation,
              address,
            )
              ? 'claimed'
              : 'failed';
          }
          await txStagesCallback(tx);
        },
      });
    };

    // Fallback for a batch the flow never resolved, so it reported no status.
    const fetchBatchStatus = async (id: string) => {
      try {
        invariant(core.walletClient, 'Wallet client is unavailable');
        return await core.walletClient.getCallsStatus({ id });
      } catch (error) {
        console.error(error);
        return undefined;
      }
    };

    const tryGetTransaction = async (hash: Hash) => {
      try {
        return await publicClientMainnet.getTransaction({ hash });
      } catch (error) {
        console.error(error);
        return undefined;
      }
    };

    // useTxFlow exposes only the last transaction hash, which cannot say which
    // token was claimed: an atomic batch claims both in one transaction, while
    // a fallback can use separate transactions and succeed for only one. The
    // wallet knows, so read the batch receipts and record what each proves.
    // This neither sends transactions nor retries claims.
    const reconcileBatch = async (id: string) => {
      // Whatever the wallet merely accepted is unconfirmed until a receipt
      // says otherwise.
      progress.results.forEach((result) => {
        if (result.status === 'pending') result.status = 'unknown';
      });

      try {
        // The flow hands over the batch it already resolved. Only a batch that
        // never resolved at all — a timeout, say — needs asking again.
        const status = batchStatus ?? (await fetchBatchStatus(id));
        if (!status) return;
        const { receipts = [], atomic } = status;

        for (const receipt of receipts) {
          // A reverted transaction leaves no claim events, so a failed call in
          // a non-atomic batch is matched by destination and calldata instead.
          const revertedCall =
            receipt.status === 'reverted' && !atomic
              ? await tryGetTransaction(receipt.transactionHash)
              : undefined;

          // Receipt order does not identify the token, and a single atomic
          // receipt can account for every token, so check each operation
          // against each receipt.
          claimOperations.forEach((operation, index) => {
            const result = progress.results[index];
            if (isClaimedIn(receipt, operation, address)) {
              result.status = 'claimed';
              result.txHash = receipt.transactionHash;
            } else if (
              receipt.status === 'reverted' &&
              // An atomic revert failed every operation at once.
              (atomic || isRevertedClaimOf(revertedCall, operation, address))
            ) {
              result.status = 'failed';
              result.txHash = receipt.transactionHash;
            }
          });
        }
      } catch (error) {
        console.error(error);
      }
    };

    // A transaction we submitted can still get mined after the flow gives up
    // (timeout, lost connection). A receipt is definitive; without one the
    // outcome stays unknown.
    const resolveCurrentFromChain = async () => {
      const { txHash } = progress.current;
      if (!txHash) return;
      try {
        const receipt = await publicClientMainnet.getTransactionReceipt({
          hash: txHash,
        });
        progress.current.status = isClaimedIn(
          receipt,
          claimOperations[progress.index],
          address,
        )
          ? 'claimed'
          : 'failed';
        progress.current.txHash = receipt.transactionHash;
      } catch {
        /* Keep the outcome unknown until a receipt is available. */
      }
    };

    try {
      await txFlow({
        // Reached only when the wallet reports EIP-5792 atomic batch support.
        // viem can still fall back to separate transactions from here.
        callsFn: async () => {
          progress.isBatch = true;
          return getUsdVaultWithdrawClaimCalls(address, claimOperations);
        },
        sendTransaction: async (txStagesCallback) => {
          for (const [index, operation] of claimOperations.entries()) {
            progress.index = index;
            await claimOneToken(operation, txStagesCallback);
            // Anything short of a confirmed claim stops the run: a multisig
            // submission is not execution, and a failure should not trigger
            // the next signature request.
            if (progress.current.status !== 'claimed') break;
            // Keep the page behind the modal in step between claims. After the
            // last one the refresh in `finally` covers it, and repeating the
            // same queries back to back only delays the result modal.
            if (index < claimOperations.length - 1) await refreshVaultData();
          }
        },
        onSign: () => {
          progress.setActiveStatus('signing');
          txModalStages.sign(progress.active, progress.stepLabel);
        },
        onReceipt: ({ txHashOrCallId, isAA }) => {
          if (isAA) callId = txHashOrCallId;
          else progress.current.txHash = txHashOrCallId;
          progress.setActiveStatus('pending');
          txModalStages.pending(
            progress.active,
            txHashOrCallId,
            isAA,
            progress.stepLabel,
          );
        },
        // A multisig only submits the transaction; execution happens later.
        onMultisigDone: () => {
          progress.current.status = 'unknown';
        },
        onSuccess: ({ txHash, callStatus }) => {
          batchStatus = callStatus;
          if (!progress.isBatch) progress.current.txHash ??= txHash;
        },
        // Not used to report the failure — the throw does that — only to keep
        // the receipts of a batch that failed part way through.
        onFailure: ({ callStatus }) => {
          batchStatus = callStatus;
        },
      });
    } catch (error) {
      console.error(error);
      errorText = getErrorMessage(error);
      const isRejected = errorText === ErrorMessage.DENIED_SIG;
      progress.active.forEach((result) => {
        result.status = getStatusAfterError(result.status, isRejected);
      });
      // `unknown` is exactly "submitted, outcome not known": a reverted or
      // confirmed receipt already settled the status on CONFIRMATION, and a
      // rejected signature never produced a transaction to look up.
      if (!progress.isBatch && progress.current.status === 'unknown')
        await resolveCurrentFromChain();
    } finally {
      // callId identifies the wallet's batch, not an on-chain transaction.
      // Without it there are no receipts to read.
      if (progress.isBatch && callId) await reconcileBatch(callId);
      await refreshVaultData();

      // Address validation can return without ever starting a transaction.
      if (progress.isStarted) {
        txModalStages.result(progress.results, {
          callId,
          error: progress.isAllClaimed ? undefined : errorText,
          refreshFailed: isRefreshFailed,
        });
      }
      if (progress.isAllClaimed) {
        trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.earnUsdWithdrawalClaimAll);
      }
      setIsClaiming(false);
    }

    return progress.isAllClaimed;
  }, [
    address,
    claimOperations,
    core,
    publicClientMainnet,
    refetchData,
    txFlow,
    txModalStages,
  ]);

  return { withdrawClaimAll, isClaiming };
};
