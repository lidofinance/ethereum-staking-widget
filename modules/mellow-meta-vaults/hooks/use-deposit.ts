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

import {
  applyRoundUpTxParameter,
  Erc20AllowanceAbi,
  QuoteMismatchError,
  type TxFlowOptions,
  useDappStatus,
  useLidoSDK,
  useTxFlow,
  detectTxFlowInterruption,
} from 'modules/web3';
import { getTokenAddress } from 'config/networks/token-address';
import { getReferralAddress } from 'utils/get-referral-address';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { ErrorMessage } from 'utils/getErrorMessage';
import { type Token, TOKENS } from 'consts/tokens';
import { MATOMO_EVENT_TYPE } from 'consts/matomo';
import { SYNC_DEPOSIT_QUEUE_ABI } from '../abi';
import { TxModalStages } from '../types/tx-modal-stages';
import {
  AsyncDepositQueueGetter,
  SyncDepositQueueGetter,
} from '../types/deposit-queue-getter';
import {
  CollectorContract,
  DepositQueueWritableContract,
  SyncDepositQueueWritableContract,
} from '../types/contracts';
import { getDepositRoute } from '../utils/deposit-route';
import {
  isQuoteWorse,
  readDepositQuote,
  readSyncDepositPenalty,
  type VaultQuote,
} from '../utils/quote';
import type { TxRetryHandler } from 'shared/transaction-modal';

type DepositArgs = {
  amount: bigint;
  token: Token;
  referral: string | null;
};

// The steps of a deposit: the approvals only for a token short of allowance,
// the reset only for USDT, which rejects a non-zero to non-zero approval
const STEP = {
  resetApprove: 'reset-approve',
  approve: 'approve',
  deposit: 'deposit',
} as const;

// what every stage needs, read once before the first step
type DepositData = {
  address: Address;
  tokenAddress: Address;
  depositQueue: DepositQueueWritableContract;
  isSyncQueue: boolean;
  referralAddress: Address;
  // Read here rather than taken from the form, so a retry after a confirmed
  // approval never approves again
  needsApprove: boolean;
  needsApprovalReset: boolean;
};

type UseDepositArgs<DepositQueueToken extends string> = {
  // the token's sync queue, which every token that has one deposits through,
  // and the async queue of a token without one, see getDepositRoute
  syncDepositQueueGetter: SyncDepositQueueGetter<DepositQueueToken>;
  asyncDepositQueueGetter?: AsyncDepositQueueGetter<DepositQueueToken>;
  // quotes the deposit right before it is sent
  collector: CollectorContract;
  // The quote the form displays and its refetch: the deposit is held to it.
  // Required, so a caller states it: undefined only where no quote is
  // displayed
  shownQuote: VaultQuote | undefined;
  refetchQuote: (() => unknown) | undefined;
  txModalStages: TxModalStages;
  onRetry?: TxRetryHandler;
  matomoEventStart?: MATOMO_EVENT_TYPE;
  matomoEventSuccess?: MATOMO_EVENT_TYPE;
  // the vault's query scopes, refetched after a deposit whose outcome could
  // not be read; the whole cache without it
  refetchScope?: TxFlowOptions['refetchScope'];
};

export const useDeposit = <DepositQueueToken extends string>({
  syncDepositQueueGetter,
  asyncDepositQueueGetter,
  collector,
  shownQuote,
  refetchQuote,
  txModalStages,
  onRetry,
  matomoEventStart,
  matomoEventSuccess,
  refetchScope,
}: UseDepositArgs<DepositQueueToken>) => {
  const { address } = useDappStatus();
  const { core } = useLidoSDK();
  const txFlow = useTxFlow();

  const deposit = useCallback(
    async ({ amount, token, referral }: DepositArgs) => {
      if (matomoEventStart) trackMatomoEvent(matomoEventStart);

      const msgValue = token === TOKENS.eth ? amount : 0n;
      const getTokenContract = (tokenAddress: Address) =>
        getContract({
          address: tokenAddress,
          abi: Erc20AllowanceAbi,
          client: {
            public: core.publicClient,
            wallet: core.walletClient as WalletClient,
          },
        });

      // Run right before the deposit is sent, as the last step before the
      // wallet is reached in both signing paths, after any approval: the quote
      // re-read on the queue the deposit goes to must not be worse than the
      // displayed one. A better quote passes. The quote includes the sync
      // queue's current penalty, so a penalty set or raised since the form
      // quoted stops the deposit here. With no quote displayed there is
      // nothing to hold the deposit to: any penalty stops it, so a deposit
      // nobody saw priced is never charged one. Only an upgrade deposits with
      // no quote displayed, so the stop says the upgrade is unavailable
      const checkBeforeDeposit = async (data: DepositData) => {
        if (!shownQuote) {
          if ((await readSyncDepositPenalty(data.depositQueue)) > 0n) {
            throw new QuoteMismatchError(ErrorMessage.UPGRADE_UNAVAILABLE);
          }
          return;
        }
        const quote = await readDepositQuote({
          collector,
          depositQueue: data.depositQueue,
          amount,
          account: data.address,
        });
        if (isQuoteWorse(quote, shownQuote)) {
          void refetchQuote?.();
          throw new QuoteMismatchError();
        }
      };

      const { isSuccess } = await txFlow<DepositData>({
        refetchScope,
        prepare: async () => {
          invariant(address, 'needs address');
          const tokenAddress = getTokenAddress(core.chainId, token);
          invariant(tokenAddress, 'Token address is not defined');

          const queueArgs = {
            publicClient: core.publicClient,
            walletClient: core.walletClient as WalletClient,
            token: token as DepositQueueToken,
          };
          const { depositQueue, isSyncQueue } = getDepositRoute({
            syncQueue: syncDepositQueueGetter(queueArgs),
            asyncQueue: asyncDepositQueueGetter?.(queueArgs),
          });
          const referralAddress = await getReferralAddress(
            referral,
            core.publicClient,
          );

          let needsApprove = false;
          let needsApprovalReset = false;
          if (token !== TOKENS.eth) {
            const allowance = await getTokenContract(
              tokenAddress,
            ).read.allowance([address, depositQueue.address]);
            needsApprove = allowance < amount;
            needsApprovalReset =
              token === TOKENS.usdt && needsApprove && allowance > 0n;
          }

          return {
            address,
            tokenAddress,
            depositQueue,
            isSyncQueue,
            referralAddress,
            needsApprove,
            needsApprovalReset,
          };
        },
        // the approvals join the batch for AA wallets and go as separate
        // transactions otherwise. A batch is signed as built, so it is
        // checked once built; a stepwise send checks right before the deposit
        callsFn: async ({ isAA, data }) => {
          const approve = (value: bigint) =>
            encodeFunctionData({
              abi: Erc20AllowanceAbi,
              functionName: 'approve',
              args: [data.depositQueue.address, value],
            });
          const calls = [
            data.needsApprove &&
              data.needsApprovalReset && {
                stepId: STEP.resetApprove,
                to: data.tokenAddress,
                data: approve(0n),
              },
            data.needsApprove && {
              stepId: STEP.approve,
              to: data.tokenAddress,
              data: approve(amount),
            },
            {
              stepId: STEP.deposit,
              to: data.depositQueue.address,
              data: encodeFunctionData({
                abi: data.depositQueue.abi,
                functionName: 'deposit',
                args: [amount, data.referralAddress, []],
              }),
              value: msgValue,
            },
          ];
          if (isAA) await checkBeforeDeposit(data);
          return calls;
        },
        sendStep: async (step, txStagesCallback, { data }) => {
          if (step.stepId !== STEP.deposit) {
            const tokenContract = getTokenContract(data.tokenAddress);
            const approveArgs = [
              data.depositQueue.address,
              step.stepId === STEP.resetApprove ? 0n : amount,
            ] as const;
            await core.performTransaction({
              getGasLimit: (opts) =>
                tokenContract.estimateGas.approve(approveArgs, opts),
              sendTransaction: (opts) =>
                tokenContract.write.approve(approveArgs, opts),
              callback: txStagesCallback,
            });
            return;
          }
          await checkBeforeDeposit(data);
          // Both async and sync deposit queue ABIs expose an identical
          // `deposit(assets, referral, merkleProof)`. Casting to the sync
          // variant gives accurate call-site types while avoiding the
          // uncallable union that TypeScript produces for `Async | Sync`
          const depositFn: SyncDepositQueueWritableContract['write']['deposit'] =
            data.depositQueue.write.deposit;
          const estimateDepositGasFn = data.depositQueue.estimateGas.deposit;
          const depositArgs = [amount, data.referralAddress, []] as const;
          await core.performTransaction({
            getGasLimit: async (opts) =>
              applyRoundUpTxParameter(
                await estimateDepositGasFn(depositArgs, {
                  ...opts,
                  value: msgValue,
                }),
              ),
            sendTransaction: (opts) =>
              depositFn(depositArgs, { ...opts, value: msgValue }),
            callback: txStagesCallback,
          });
        },
        onSign: ({ ctx: { stepId } }) => {
          if (stepId === STEP.deposit) {
            txModalStages.sign(amount, token);
            return;
          }
          txModalStages.signApproval(amount, token);
        },
        onReceipt: ({ txHashOrCallId, isAA, ctx: { stepId } }) => {
          if (stepId === STEP.deposit) {
            txModalStages.pending(amount, token, txHashOrCallId, isAA);
            return;
          }
          txModalStages.pendingApproval(amount, token, txHashOrCallId);
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
            amount,
            token,
            txHash,
            receivedShares,
            !data.isSyncQueue,
          );
          if (matomoEventSuccess) trackMatomoEvent(matomoEventSuccess);
        },
        onMultisigDone: ({ ctx }) => {
          if (ctx.stepId === STEP.deposit) txModalStages.successMultisig();
        },
        onFailure: async ({ error, ctx }) => {
          console.error(error);
          txModalStages.failed(
            detectTxFlowInterruption(error, ctx, STEP.deposit, [
              {
                stepId: STEP.approve,
                message: ErrorMessage.DEPOSIT_INTERRUPTED,
              },
              {
                stepId: STEP.resetApprove,
                message: ErrorMessage.DEPOSIT_RESET_INTERRUPTED,
              },
            ]),
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
      syncDepositQueueGetter,
      asyncDepositQueueGetter,
      collector,
      shownQuote,
      refetchQuote,
      refetchScope,
      matomoEventStart,
      matomoEventSuccess,
      onRetry,
      txFlow,
      txModalStages,
    ],
  );

  return { deposit };
};
