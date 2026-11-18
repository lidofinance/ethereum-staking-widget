import { useCallback } from 'react';
import {
  encodeFunctionData,
  getContract,
  isAddressEqual,
  parseEventLogs,
  type Address,
  type WalletClient,
} from 'viem';
import invariant from 'tiny-invariant';
import type { PopulatedTransaction } from '@lidofinance/lido-ethereum-sdk/core';

import {
  applyRoundUpTxParameter,
  Erc20AllowanceAbi,
  isStepSent,
  isStepSettled,
  QuoteMismatchError,
  TxFlowInterruptedError,
  TxSentDataUnavailableError,
  TxSettledError,
  useDappStatus,
  useLidoSDK,
  useTxFlow,
} from 'modules/web3';
import {
  getVaultRefetchScope,
  isQuoteWorse,
  readDepositQuote,
  selectDepositQueue,
  type CollectorContract,
  type DepositQueueWritableContract,
  type DepositTxModalStages,
  type SyncDepositQueueWritableContract,
  type VaultQuote,
} from 'modules/mellow-meta-vaults';
import { SYNC_DEPOSIT_QUEUE_ABI } from 'modules/mellow-meta-vaults/abi';
import { getTokenAddress } from 'config/networks/token-address';
import { getReferralAddress } from 'utils/get-referral-address';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { ErrorMessage } from 'utils/getErrorMessage';
import { TOKENS } from 'consts/tokens';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo/matomo-earn-events';

import {
  getLegacyAsyncDepositQueueWritableContract,
  getSyncDepositQueueWritableContract,
} from '../../contracts';
import { ETH_VAULT_QUERY_SCOPE } from '../../consts';
import type { TxRetryHandler } from 'shared/transaction-modal';

// The steps of a stETH deposit: the queue takes wstETH, so the stETH is
// wrapped first. The approvals only for an allowance short of the amount
const STEP = {
  stethApprove: 'steth-approve',
  wrap: 'wrap',
  wstethApprove: 'wsteth-approve',
  deposit: 'deposit',
} as const;

type DepositStethArgs = {
  amount: bigint;
  referral: string | null;
};

// what every stage needs, read once before the first step
type DepositStethData = {
  address: Address;
  wstethAddress: Address;
  depositQueue: DepositQueueWritableContract;
  isSyncQueue: boolean;
  referralAddress: Address;
  // the wstETH the wrap gives for the stETH amount: what the queue receives
  wstethAmount: bigint;
  // Read here rather than taken from the form, so a retry after a confirmed
  // approval never approves again
  needsStethApprove: boolean;
  needsWstethApprove: boolean;
};

type UseEthVaultDepositStethArgs = {
  // quotes the deposit right before it is sent
  collector: CollectorContract;
  // The quote the form displays (for the wstETH the stETH wraps to) and its
  // refetch: the deposit is held to it. Undefined where no quote is displayed
  shownQuote: VaultQuote | undefined;
  refetchQuote: (() => unknown) | undefined;
  txModalStages: DepositTxModalStages;
  onRetry?: TxRetryHandler;
};

export const useEthVaultDepositSteth = ({
  collector,
  shownQuote,
  refetchQuote,
  txModalStages,
  onRetry,
}: UseEthVaultDepositStethArgs) => {
  const { address } = useDappStatus();
  const { core, wrap } = useLidoSDK();
  const txFlow = useTxFlow();

  const deposit = useCallback(
    async ({ amount, referral }: DepositStethArgs): Promise<boolean> => {
      trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.earnEthDepositingStart);
      const getWstethContract = (wstethAddress: Address) =>
        getContract({
          address: wstethAddress,
          abi: Erc20AllowanceAbi,
          client: {
            public: core.publicClient,
            wallet: core.walletClient as WalletClient,
          },
        });

      // Run right before the deposit is sent, as the last step before the
      // wallet is reached in both signing paths, after the wrap and any
      // approval: the quote re-read on the queue the deposit goes to must not
      // be worse than the displayed one. A better quote passes. A stepwise
      // send also runs it once before the first step, so a quote that is
      // already worse stops the flow before the approval and the wrap
      const checkBeforeDeposit = async (data: DepositStethData) => {
        if (!shownQuote) return;
        const quote = await readDepositQuote({
          collector,
          depositQueue: data.depositQueue,
          amount: data.wstethAmount,
          account: data.address,
        });
        if (isQuoteWorse(quote, shownQuote)) {
          void refetchQuote?.();
          throw new QuoteMismatchError();
        }
      };

      const { isSuccess } = await txFlow<DepositStethData>({
        refetchScope: getVaultRefetchScope(ETH_VAULT_QUERY_SCOPE),
        prepare: async ({ isAA }) => {
          invariant(address, 'needs address');
          const wstethAddress = getTokenAddress(core.chainId, TOKENS.wsteth);
          invariant(wstethAddress, 'wstETH address not defined');

          const queueArgs = {
            publicClient: core.publicClient,
            walletClient: core.walletClient as WalletClient,
            token: TOKENS.wsteth,
          };
          const [
            { depositQueue, isSyncQueue },
            referralAddress,
            wstethAmount,
            stethAllowance,
          ] = await Promise.all([
            selectDepositQueue({
              syncQueue: getSyncDepositQueueWritableContract(queueArgs),
              asyncQueue: getLegacyAsyncDepositQueueWritableContract(queueArgs),
            }),
            getReferralAddress(referral, core.publicClient),
            wrap.convertStethToWsteth(amount),
            wrap.getStethForWrapAllowance(address),
          ]);
          const wstethAllowance = await getWstethContract(
            wstethAddress,
          ).read.allowance([address, depositQueue.address]);

          const data = {
            address,
            wstethAddress,
            depositQueue,
            isSyncQueue,
            referralAddress,
            wstethAmount,
            needsStethApprove: stethAllowance < amount,
            needsWstethApprove: wstethAllowance < wstethAmount,
          };
          // a batch is checked once built, see callsFn
          if (!isAA) await checkBeforeDeposit(data);
          return data;
        },
        // every step joins the batch for AA wallets and goes as a separate
        // transaction otherwise. A batch is signed as built, so it is checked
        // once built; a stepwise send checks right before the deposit
        callsFn: async ({ isAA, data }) => {
          const props = { value: amount };
          const calls = [
            data.needsStethApprove && {
              stepId: STEP.stethApprove,
              // the SDK types the approval wider than the call it returns
              ...((await wrap.approveStethForWrapPopulateTx(
                props,
              )) as PopulatedTransaction),
            },
            { stepId: STEP.wrap, ...(await wrap.wrapStethPopulateTx(props)) },
            data.needsWstethApprove && {
              stepId: STEP.wstethApprove,
              to: data.wstethAddress,
              data: encodeFunctionData({
                abi: Erc20AllowanceAbi,
                functionName: 'approve',
                args: [data.depositQueue.address, data.wstethAmount],
              }),
            },
            {
              stepId: STEP.deposit,
              to: data.depositQueue.address,
              data: encodeFunctionData({
                abi: data.depositQueue.abi,
                functionName: 'deposit',
                args: [data.wstethAmount, data.referralAddress, []],
              }),
            },
          ];
          if (isAA) await checkBeforeDeposit(data);
          return calls;
        },
        sendStep: async (step, txStagesCallback, { data }) => {
          const props = { value: amount, callback: txStagesCallback };
          if (step.stepId === STEP.stethApprove) {
            await wrap.approveStethForWrap(props);
            return;
          }
          if (step.stepId === STEP.wrap) {
            await wrap.wrapSteth(props);
            return;
          }
          if (step.stepId === STEP.wstethApprove) {
            const wstethContract = getWstethContract(data.wstethAddress);
            const approveArgs = [
              data.depositQueue.address,
              data.wstethAmount,
            ] as const;
            await core.performTransaction({
              getGasLimit: (opts) =>
                wstethContract.estimateGas.approve(approveArgs, opts),
              sendTransaction: (opts) =>
                wstethContract.write.approve(approveArgs, opts),
              callback: txStagesCallback,
            });
            return;
          }
          await checkBeforeDeposit(data);
          // Both async and sync deposit queue ABIs expose an identical
          // `deposit(assets, referral, merkleProof)`, see useDeposit
          const depositFn: SyncDepositQueueWritableContract['write']['deposit'] =
            data.depositQueue.write.deposit;
          const estimateDepositGasFn = data.depositQueue.estimateGas.deposit;
          const depositArgs = [
            data.wstethAmount,
            data.referralAddress,
            [],
          ] as const;
          await core.performTransaction({
            getGasLimit: async (opts) =>
              applyRoundUpTxParameter(
                await estimateDepositGasFn(depositArgs, opts),
              ),
            sendTransaction: (opts) => depositFn(depositArgs, opts),
            callback: txStagesCallback,
          });
        },
        // an AA batch reports as its last step, the deposit
        onSign: ({ ctx: { stepId, data } }) => {
          switch (stepId) {
            case STEP.stethApprove:
              return txModalStages.signApproval(amount, TOKENS.steth);
            case STEP.wrap:
              return txModalStages.signWrap(amount, TOKENS.steth);
            case STEP.wstethApprove:
              return txModalStages.signApproval(
                data.wstethAmount,
                TOKENS.wsteth,
              );
            default:
              return txModalStages.sign(data.wstethAmount, TOKENS.wsteth);
          }
        },
        onReceipt: ({ txHashOrCallId, isAA, ctx: { stepId, data } }) => {
          switch (stepId) {
            case STEP.stethApprove:
              return txModalStages.pendingApproval(
                amount,
                TOKENS.steth,
                txHashOrCallId,
              );
            case STEP.wrap:
              return txModalStages.pendingWrap(
                amount,
                TOKENS.steth,
                txHashOrCallId,
              );
            case STEP.wstethApprove:
              return txModalStages.pendingApproval(
                data.wstethAmount,
                TOKENS.wsteth,
                txHashOrCallId,
              );
            default:
              return txModalStages.pending(
                data.wstethAmount,
                TOKENS.wsteth,
                txHashOrCallId,
                isAA,
              );
          }
        },
        onSuccess: async ({ txHash, ctx: { stepId, data } }) => {
          if (stepId !== STEP.deposit) return;
          let receivedShares: bigint | undefined;
          if (txHash && data.isSyncQueue) {
            try {
              const receipt = await core.publicClient.getTransactionReceipt({
                hash: txHash,
              });
              // only the sync queue mints at once and emits `Deposited`
              const claimedLog = parseEventLogs({
                abi: SYNC_DEPOSIT_QUEUE_ABI,
                logs: receipt.logs,
                eventName: 'Deposited',
              }).find((log) => isAddressEqual(log.args.account, data.address));
              receivedShares = claimedLog?.args.shares;
            } catch {
              // ignore, show fallback title
            }
          }
          txModalStages.success(
            data.wstethAmount,
            TOKENS.wsteth,
            txHash,
            receivedShares,
            !data.isSyncQueue,
          );
          trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.earnEthDepositingFinish);
        },
        onMultisigDone: ({ ctx }) => {
          if (ctx.stepId === STEP.deposit) txModalStages.successMultisig();
        },
        onFailure: async ({ error, ctx }) => {
          console.error(error);
          const cause = error instanceof TxSettledError ? error.cause : error;
          // The wrap landed but the deposit did not: it was never sent (an
          // approval or the deposit failed before reaching the chain, or the
          // quote changed) or it reverted. The funds are wstETH now and a
          // retry of a stETH deposit would wrap again: whatever stopped the
          // deposit, the user must learn where the funds are. A deposit that
          // settled, or was sent and never read back and so may have landed,
          // keeps its own error, which offers no retry.
          // A deposit that was sent and reverted gets the same copy ("…the
          // deposit was not sent") and Matomo event. Accepted: what the user
          // needs here is that the funds are wstETH and the deposit did not
          // happen, and a separate revert copy would not change what they do
          const isDepositOutcomeUnknown =
            isStepSent(ctx, STEP.deposit) &&
            error instanceof TxSentDataUnavailableError;
          if (
            isStepSettled(ctx, STEP.wrap) &&
            !isStepSettled(ctx, STEP.deposit) &&
            !isDepositOutcomeUnknown
          ) {
            txModalStages.failed(
              new TxFlowInterruptedError(
                ErrorMessage.DEPOSIT_WRAPPED_INTERRUPTED,
                cause,
              ),
            );
            return;
          }
          // The stETH approval landed but the wrap was never sent: a retry
          // reads the allowance and goes on with the wrap
          const isInterruptedAfterApprove =
            isStepSettled(ctx, STEP.stethApprove) &&
            !isStepSent(ctx, STEP.wrap) &&
            !(error instanceof QuoteMismatchError);
          txModalStages.failed(
            isInterruptedAfterApprove
              ? new TxFlowInterruptedError(
                  ErrorMessage.DEPOSIT_INTERRUPTED,
                  cause,
                )
              : error,
            onRetry,
          );
        },
      });

      // deposited (or proposed to a multisig): the form resets
      return isSuccess;
    },
    [
      address,
      core,
      wrap,
      collector,
      shownQuote,
      refetchQuote,
      txFlow,
      txModalStages,
      onRetry,
    ],
  );

  return { deposit };
};
